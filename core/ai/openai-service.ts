/**
 * OpenAI Service for MAIK IDE
 * 
 * This module provides a service for interacting with OpenAI's API,
 * including text generation, code analysis, and tool usage.
 */

import OpenAI from "openai";
import { injectable, inject } from 'tsyringe';
import { LLMAPIError } from '../errors';
import { 
  AbstractAIService, 
  AIServiceConfig, 
  GenerationOptions, 
  ToolCallingOptions,
  AITool,
  AIModel
} from './base-ai-service';

/**
 * Service for interacting with OpenAI's API
 */
export class OpenAIService extends AbstractAIService {
  private openai: OpenAI;
  private defaultModel = "gpt-4o"; // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
  private defaultTemperature = 0.7;
  
  /**
   * Create a new OpenAI service
   * @param config - Configuration options
   */
  constructor(private config: AIServiceConfig) {
    super();
    this.openai = new OpenAI({
      apiKey: config.apiKey || process.env.OPENAI_API_KEY,
      baseURL: config.baseUrl,
      organization: config.organization
    });
    
    // Override defaults with config values if provided
    if (config.defaultModel) {
      this.defaultModel = config.defaultModel;
    }
    
    if (config.defaultTemperature !== undefined) {
      this.defaultTemperature = config.defaultTemperature;
    }
  }
  
  /**
   * Generate a completion using the OpenAI API
   * @param prompt - User prompt
   * @param options - Generation options
   * @returns Generated text
   */
  async generateCompletion(prompt: string, options: GenerationOptions = {}): Promise<string> {
    try {
      const model = options.model || this.defaultModel;
      const temperature = options.temperature ?? this.defaultTemperature;
      const maxTokens = options.maxTokens ?? 2048;
      
      const messages = [
        options.systemPrompt 
          ? { role: "system", content: options.systemPrompt as string }
          : { role: "system", content: "You are an expert programmer helping with code." },
        { role: "user", content: prompt }
      ];
      
      const requestOptions: any = {
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
      };
      
      // Add response format option for JSON if specified
      if (options.responseFormat === 'json') {
        requestOptions.response_format = { type: "json_object" };
      }
      
      console.log(`Calling OpenAI with model: ${model}, temperature: ${temperature}`);
      const response = await this.openai.chat.completions.create(requestOptions);
      
      return response.choices[0].message.content || "";
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`OpenAI API call failed: ${errorMessage}`);
      throw new LLMAPIError(`OpenAI API call failed: ${errorMessage}`);
    }
  }
  
  /**
   * Generate a completion with tool calling
   * @param prompt - User prompt
   * @param tools - Available tools
   * @param options - Generation options
   * @returns Generated completion with potential tool calls
   */
  async generateWithTools(prompt: string, tools: AITool[], options: ToolCallingOptions = {}): Promise<any> {
    try {
      const model = options.model || this.defaultModel;
      const temperature = options.temperature ?? this.defaultTemperature;
      const maxTokens = options.maxTokens ?? 2048;
      
      const messages = [
        options.systemPrompt 
          ? { role: "system", content: options.systemPrompt as string }
          : { role: "system", content: "You are an expert programmer helping with code." },
        { role: "user", content: prompt }
      ];
      
      console.log(`Calling OpenAI with tools, model: ${model}`);
      const response = await this.openai.chat.completions.create({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
        tools,
        tool_choice: "auto",
      });
      
      return response.choices[0];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`OpenAI API call with tools failed: ${errorMessage}`);
      throw new LLMAPIError(`OpenAI API call with tools failed: ${errorMessage}`);
    }
  }
  
  /**
   * Analyze code using the OpenAI API
   * @param code - Code to analyze
   * @param language - Programming language
   * @returns Analysis results
   */
  async analyzeCode(code: string, language: string): Promise<any> {
    const systemPrompt = `You are an expert code analyzer specialized in ${language}. 
    Analyze the provided code and return a JSON object with the following structure:
    {
      "summary": "Brief description of what the code does",
      "complexity": "Low/Medium/High",
      "qualityIssues": [array of code quality issues found],
      "securityIssues": [array of potential security issues],
      "suggestions": [array of improvement suggestions],
      "dependencies": [array of libraries/packages used]
    }`;
    
    try {
      const result = await this.generateCompletion(code, {
        systemPrompt,
        responseFormat: 'json',
        temperature: 0.1
      });
      
      return JSON.parse(result);
    } catch (error) {
      if (error instanceof SyntaxError) {
        // Handle JSON parsing error
        throw new LLMAPIError(`Failed to parse code analysis results: ${error.message}`);
      }
      throw error;
    }
  }
  
  /**
   * Generate an image using DALL-E
   * @param prompt - Image description
   * @returns Image URL
   */
  async generateImage(prompt: string): Promise<string> {
    try {
      const response = await this.openai.images.generate({
        model: "dall-e-3",
        prompt,
        n: 1,
        size: "1024x1024",
      });
      
      return response.data[0].url || "";
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`OpenAI Image generation failed: ${errorMessage}`);
      throw new LLMAPIError(`OpenAI Image generation failed: ${errorMessage}`);
    }
  }
  
  /**
   * Get available OpenAI models
   * @returns List of available models
   */
  async getAvailableModels(): Promise<AIModel[]> {
    try {
      const response = await this.openai.models.list();
      
      return response.data
        .filter(model => 
          model.id.includes('gpt') || 
          model.id.includes('dalle') || 
          model.id.includes('whisper')
        )
        .map(model => ({
          id: model.id,
          provider: 'openai',
          name: model.id,
          contextWindow: model.id.includes('32k') ? 32768 : 
                          model.id.includes('16k') ? 16384 :
                          model.id.includes('gpt-4o') ? 128000 :
                          model.id.includes('gpt-4') ? 8192 : 4096,
          supportsFunctions: model.id.includes('gpt'),
          supportsImages: model.id.includes('gpt-4') || model.id.includes('gpt-4o'),
        }));
    } catch (error) {
      console.error('Failed to get OpenAI models:', error);
      return [
        {
          id: 'gpt-4o',
          provider: 'openai',
          name: 'GPT-4o',
          contextWindow: 128000,
          supportsFunctions: true,
          supportsImages: true,
        },
        {
          id: 'gpt-4-turbo',
          provider: 'openai',
          name: 'GPT-4 Turbo',
          contextWindow: 128000,
          supportsFunctions: true,
          supportsImages: true,
        },
        {
          id: 'gpt-3.5-turbo',
          provider: 'openai',
          name: 'GPT-3.5 Turbo',
          contextWindow: 16384,
          supportsFunctions: true,
          supportsImages: false,
        }
      ];
    }
  }
  
  /**
   * Check if OpenAI supports a specific capability
   * @param capability - Capability to check
   * @returns Whether the capability is supported
   */
  supportsCapability(capability: 'image_generation' | 'function_calling' | 'json_mode'): boolean {
    switch (capability) {
      case 'image_generation':
        return true;
      case 'function_calling':
        return true;
      case 'json_mode':
        return true;
      default:
        return false;
    }
  }
}