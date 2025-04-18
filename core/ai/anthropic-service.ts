/**
 * Anthropic AI Service for MAIK IDE
 * 
 * This module provides a service for interacting with Anthropic's Claude API,
 * including text generation, code analysis, and tool usage.
 */

import Anthropic from '@anthropic-ai/sdk';
import { injectable } from 'tsyringe';
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
 * Service for interacting with Anthropic's Claude API
 */
@injectable()
export class AnthropicService extends AbstractAIService {
  private anthropic: Anthropic;
  private defaultModel = "claude-3-7-sonnet-20250219"; // the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
  private defaultTemperature = 0.7;
  
  /**
   * Create a new Anthropic service
   * @param config - Configuration options
   */
  constructor(@inject("AnthropicServiceConfig") config: AIServiceConfig) {
    super();
    
    if (!config.apiKey && !process.env.ANTHROPIC_API_KEY) {
      console.warn('No Anthropic API key provided. Please set ANTHROPIC_API_KEY environment variable.');
    }
    
    this.anthropic = new Anthropic({
      apiKey: config.apiKey || process.env.ANTHROPIC_API_KEY || 'dummy-key',
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
   * Generate a completion using the Anthropic API
   * @param prompt - User prompt
   * @param options - Generation options
   * @returns Generated text
   */
  async generateCompletion(prompt: string, options: GenerationOptions = {}): Promise<string> {
    try {
      if (!process.env.ANTHROPIC_API_KEY) {
        throw new Error('Anthropic API key not found. Please set ANTHROPIC_API_KEY environment variable.');
      }
      
      const model = options.model || this.defaultModel;
      const temperature = options.temperature ?? this.defaultTemperature;
      const maxTokens = options.maxTokens ?? 2048;
      
      console.log(`Calling Anthropic with model: ${model}, temperature: ${temperature}`);
      
      const message = await this.anthropic.messages.create({
        model,
        max_tokens: maxTokens,
        temperature,
        system: options.systemPrompt || "You are an expert programmer helping with code.",
        messages: [
          { role: 'user', content: prompt }
        ],
      });
      
      // Check if we have a text content block
      if (message.content && message.content.length > 0) {
        const content = message.content[0];
        if ('text' in content) {
          return content.text;
        }
      }
      
      // Fallback
      return "No text response received";
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Anthropic API call failed: ${errorMessage}`);
      throw new LLMAPIError(`Anthropic API call failed: ${errorMessage}`);
    }
  }
  
  /**
   * Generate a completion with tool calling
   * Note: Tool calling support depends on the Claude model version
   * @param prompt - User prompt
   * @param tools - Available tools
   * @param options - Generation options
   * @returns Generated completion with potential tool calls
   */
  async generateWithTools(prompt: string, tools: AITool[], options: ToolCallingOptions = {}): Promise<any> {
    try {
      if (!process.env.ANTHROPIC_API_KEY) {
        throw new Error('Anthropic API key not found. Please set ANTHROPIC_API_KEY environment variable.');
      }
      
      const model = options.model || this.defaultModel;
      const temperature = options.temperature ?? this.defaultTemperature;
      const maxTokens = options.maxTokens ?? 2048;
      
      console.log(`Calling Anthropic with tools, model: ${model}`);
      
      const message = await this.anthropic.messages.create({
        model,
        max_tokens: maxTokens,
        temperature,
        system: options.systemPrompt || "You are an expert programmer helping with code.",
        messages: [
          { role: 'user', content: prompt }
        ],
        tools: tools as any,
      });
      
      return message;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Anthropic API call with tools failed: ${errorMessage}`);
      throw new LLMAPIError(`Anthropic API call with tools failed: ${errorMessage}`);
    }
  }
  
  /**
   * Analyze code using the Anthropic API
   * @param code - Code to analyze
   * @param language - Programming language
   * @returns Analysis results
   */
  async analyzeCode(code: string, language: string): Promise<any> {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('Anthropic API key not found. Please set ANTHROPIC_API_KEY environment variable.');
    }
    
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
        temperature: 0.1
      });
      
      try {
        return JSON.parse(result);
      } catch (e) {
        // If it's not valid JSON, extract JSON from response text
        const jsonMatch = result.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
        throw new Error("Could not parse JSON from response");
      }
    } catch (error) {
      if (error instanceof SyntaxError) {
        // Handle JSON parsing error
        throw new LLMAPIError(`Failed to parse code analysis results: ${error.message}`);
      }
      throw error;
    }
  }
  
  /**
   * Get available Anthropic models
   * @returns List of available models
   */
  async getAvailableModels(): Promise<AIModel[]> {
    if (!process.env.ANTHROPIC_API_KEY) {
      console.warn('Anthropic API key not found. Returning default models.');
      return this.getDefaultModels();
    }
    
    try {
      // Anthropic doesn't have a list models API endpoint yet
      // Return hardcoded list of known models
      return this.getDefaultModels();
    } catch (error) {
      console.error('Failed to get Anthropic models:', error);
      return this.getDefaultModels();
    }
  }
  
  /**
   * Get a list of default Anthropic models
   * @returns Default models
   */
  private getDefaultModels(): AIModel[] {
    return [
      {
        id: 'claude-3-7-sonnet-20250219',
        provider: 'anthropic',
        name: 'Claude 3.7 Sonnet',
        contextWindow: 200000,
        supportsFunctions: true,
        supportsImages: true,
      },
      {
        id: 'claude-3-5-sonnet-20240620',
        provider: 'anthropic',
        name: 'Claude 3.5 Sonnet',
        contextWindow: 200000,
        supportsFunctions: true,
        supportsImages: true,
      },
      {
        id: 'claude-3-opus-20240229',
        provider: 'anthropic',
        name: 'Claude 3 Opus',
        contextWindow: 200000,
        supportsFunctions: true,
        supportsImages: true,
      },
      {
        id: 'claude-3-sonnet-20240229',
        provider: 'anthropic',
        name: 'Claude 3 Sonnet',
        contextWindow: 200000,
        supportsFunctions: true,
        supportsImages: true,
      },
      {
        id: 'claude-3-haiku-20240307',
        provider: 'anthropic',
        name: 'Claude 3 Haiku',
        contextWindow: 200000,
        supportsFunctions: true,
        supportsImages: true,
      }
    ];
  }
  
  /**
   * Check if Anthropic supports a specific capability
   * @param capability - Capability to check
   * @returns Whether the capability is supported
   */
  supportsCapability(capability: 'image_generation' | 'function_calling' | 'json_mode'): boolean {
    switch (capability) {
      case 'image_generation':
        return false;
      case 'function_calling':
        return true;
      case 'json_mode':
        return true;
      default:
        return false;
    }
  }
}