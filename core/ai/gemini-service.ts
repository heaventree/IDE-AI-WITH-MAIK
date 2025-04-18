/**
 * Google Gemini AI Service for MAIK IDE
 * 
 * This module provides a service for interacting with Google's Gemini API,
 * including text generation, code analysis, and tool usage.
 */

import { 
  GoogleGenerativeAI, 
  GenerativeModel, 
  HarmCategory, 
  HarmBlockThreshold,
  SchemaType,
  Tool as GeminiTool,
  FunctionDeclaration,
  FunctionDeclarationSchema
} from '@google/generative-ai';
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
 * Service for interacting with Google's Gemini API
 */
@injectable()
export class GeminiService extends AbstractAIService {
  private generativeAI: GoogleGenerativeAI;
  private defaultModel = "gemini-1.5-pro"; // Latest Gemini model as of April 2025
  private defaultTemperature = 0.7;
  
  /**
   * Create a new Gemini service
   * @param config - Configuration options
   */
  constructor(@inject('GeminiServiceConfig') private config: AIServiceConfig) {
    super();
    
    if (!config.apiKey && !process.env.GEMINI_API_KEY) {
      console.warn('No Gemini API key provided. Please set GEMINI_API_KEY environment variable.');
    }
    
    this.generativeAI = new GoogleGenerativeAI(
      config.apiKey || process.env.GEMINI_API_KEY || 'dummy-key'
    );
    
    // Override defaults with config values if provided
    if (config.defaultModel) {
      this.defaultModel = config.defaultModel;
    }
    
    if (config.defaultTemperature !== undefined) {
      this.defaultTemperature = config.defaultTemperature;
    }
  }
  
  /**
   * Configure safety settings for the Gemini model
   * @returns Safety settings configuration
   */
  private getSafetySettings() {
    return [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ];
  }
  
  /**
   * Generate a completion using the Gemini API
   * @param prompt - User prompt
   * @param options - Generation options
   * @returns Generated text
   */
  async generateCompletion(prompt: string, options: GenerationOptions = {}): Promise<string> {
    try {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error('Gemini API key not found. Please set GEMINI_API_KEY environment variable.');
      }
      
      const model = options.model || this.defaultModel;
      const temperature = options.temperature ?? this.defaultTemperature;
      
      console.log(`Calling Gemini with model: ${model}, temperature: ${temperature}`);
      
      // Initialize the model
      const genModel = this.generativeAI.getGenerativeModel({
        model,
        safetySettings: this.getSafetySettings(),
        generationConfig: {
          temperature,
          topP: 0.95,
          topK: 40,
        },
      });
      
      // Create a chat session
      const chat = genModel.startChat({
        history: options.systemPrompt ? [
          {
            role: "user",
            parts: [{ text: "You are an AI assistant with the following instructions. Please acknowledge." }],
          },
          {
            role: "model",
            parts: [{ text: "I understand and will follow these instructions." }],
          },
          {
            role: "user",
            parts: [{ text: options.systemPrompt }],
          },
          {
            role: "model",
            parts: [{ text: "I understand and will act accordingly." }],
          }
        ] : [],
      });
      
      // Send the user's message and get a response
      const result = await chat.sendMessage(prompt);
      
      // Get the response text
      return result.response.text();
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Gemini API call failed: ${errorMessage}`);
      throw new LLMAPIError(`Gemini API call failed: ${errorMessage}`);
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
      if (!process.env.GEMINI_API_KEY) {
        throw new Error('Gemini API key not found. Please set GEMINI_API_KEY environment variable.');
      }
      
      const model = options.model || this.defaultModel;
      const temperature = options.temperature ?? this.defaultTemperature;
      
      console.log(`Calling Gemini with tools, model: ${model}`);
      
      // Convert tools from our common format to Gemini's expected format
      const geminiTools = this.convertToolsToGeminiFormat(tools);
      
      // Initialize the model
      const genModel = this.generativeAI.getGenerativeModel({
        model,
        safetySettings: this.getSafetySettings(),
        generationConfig: {
          temperature,
          topP: 0.95,
          topK: 40,
        },
        tools: geminiTools
      });
      
      // Create the prompt parts
      const systemPrompt = options.systemPrompt || "You are an expert programmer helping with code. Use the provided tools when appropriate.";
      
      // Create the chat
      const chat = genModel.startChat({
        history: [
          {
            role: "user",
            parts: [{ text: "You are an AI assistant with the following instructions. Please acknowledge." }],
          },
          {
            role: "model",
            parts: [{ text: "I understand and will follow these instructions." }],
          },
          {
            role: "user",
            parts: [{ text: systemPrompt }],
          },
          {
            role: "model",
            parts: [{ text: "I understand and will act accordingly." }],
          }
        ],
      });
      
      // Send the message
      const result = await chat.sendMessage(prompt);
      
      // Check if there are any function calls
      const functionCalls = result.response.functionCalls();
      
      if (functionCalls && functionCalls.length > 0) {
        return {
          message: {
            content: result.response.text(),
            tool_calls: functionCalls.map(fc => ({
              id: `call-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
              type: 'function',
              function: {
                name: fc.name,
                arguments: JSON.stringify(fc.args)
              }
            }))
          }
        };
      }
      
      // Return plain text response if no function calls
      return {
        message: {
          content: result.response.text()
        }
      };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Gemini API call with tools failed: ${errorMessage}`);
      throw new LLMAPIError(`Gemini API call with tools failed: ${errorMessage}`);
    }
  }
  
  /**
   * Convert our common tool format to Gemini's expected format
   * 
   * @param tools - Tools in our common format
   * @returns Tools in Gemini's format
   */
  private convertToolsToGeminiFormat(tools: AITool[]): GeminiTool[] {
    // Gemini expects a single tool object with an array of function declarations
    return [{
      functionDeclarations: tools.map(tool => ({
        name: tool.function.name,
        description: tool.function.description,
        parameters: {
          type: SchemaType.OBJECT,
          properties: tool.function.parameters.properties || {},
          required: tool.function.parameters.required || []
        }
      }))
    }];
  }
  
  /**
   * Analyze code using the Gemini API
   * @param code - Code to analyze
   * @param language - Programming language
   * @returns Analysis results
   */
  async analyzeCode(code: string, language: string): Promise<any> {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('Gemini API key not found. Please set GEMINI_API_KEY environment variable.');
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
      const prompt = `Please analyze this ${language} code and provide your analysis in JSON format only:
      
\`\`\`${language}
${code}
\`\`\``;
      
      const result = await this.generateCompletion(prompt, {
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
   * Get available Gemini models
   * @returns List of available models
   */
  async getAvailableModels(): Promise<AIModel[]> {
    if (!process.env.GEMINI_API_KEY) {
      console.warn('Gemini API key not found. Returning default models.');
      return this.getDefaultModels();
    }
    
    try {
      // Gemini doesn't have a list models API endpoint yet
      // Return hardcoded list of known models
      return this.getDefaultModels();
    } catch (error) {
      console.error('Failed to get Gemini models:', error);
      return this.getDefaultModels();
    }
  }
  
  /**
   * Get a list of default Gemini models
   * @returns Default models
   */
  private getDefaultModels(): AIModel[] {
    return [
      {
        id: 'gemini-1.5-pro',
        provider: 'google',
        name: 'Gemini 1.5 Pro',
        contextWindow: 1000000,
        supportsFunctions: true,
        supportsImages: true,
      },
      {
        id: 'gemini-1.5-flash',
        provider: 'google',
        name: 'Gemini 1.5 Flash',
        contextWindow: 1000000,
        supportsFunctions: true,
        supportsImages: true,
      },
      {
        id: 'gemini-1.0-pro',
        provider: 'google',
        name: 'Gemini 1.0 Pro',
        contextWindow: 32768,
        supportsFunctions: true,
        supportsImages: true,
      },
      {
        id: 'gemini-1.0-pro-vision',
        provider: 'google',
        name: 'Gemini 1.0 Pro Vision',
        contextWindow: 16385,
        supportsFunctions: false,
        supportsImages: true,
      }
    ];
  }
  
  /**
   * Check if Gemini supports a specific capability
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