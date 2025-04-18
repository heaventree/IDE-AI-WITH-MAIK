/**
 * Base AI Service Interface for MAIK IDE
 * 
 * This module provides a common interface for AI services,
 * allowing for easy integration of multiple providers (OpenAI,
 * OpenRouter, Gemini, DeepSeek, Claude, etc.)
 */

import { injectable } from 'tsyringe';

/**
 * Model information with common fields across providers
 */
export interface AIModel {
  id: string;
  provider: 'openai' | 'anthropic' | 'google' | 'deepseek' | 'openrouter';
  name: string;
  contextWindow: number;
  maxOutputTokens?: number;
  supportsFunctions?: boolean;
  supportsImages?: boolean;
  supportedLanguages?: string[];
}

/**
 * Common configuration options for AI service implementations
 */
export interface AIServiceConfig {
  apiKey?: string;
  defaultModel?: string;
  defaultTemperature?: number;
  baseUrl?: string;
  organization?: string;
}

/**
 * Common options for text generation
 */
export interface GenerationOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  responseFormat?: 'text' | 'json';
}

/**
 * Common options for function/tool calling
 */
export interface ToolCallingOptions {
  model?: string;
  temperature?: number;
  systemPrompt?: string;
  maxTokens?: number;
}

/**
 * Tool/function definition for AI models
 */
export interface AITool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, any>;
  };
}

/**
 * Function call result from AI
 */
export interface FunctionCall {
  name: string;
  arguments: string; // JSON string
}

/**
 * Base interface for all AI services
 */
export interface BaseAIService {
  /**
   * Generate text completion
   */
  generateCompletion(prompt: string, options?: GenerationOptions): Promise<string>;
  
  /**
   * Generate completion with potential tool/function calls
   */
  generateWithTools(prompt: string, tools: AITool[], options?: ToolCallingOptions): Promise<any>;
  
  /**
   * Analyze code with the AI
   */
  analyzeCode(code: string, language: string): Promise<any>;
  
  /**
   * Generate an image from a prompt (if supported)
   */
  generateImage?(prompt: string): Promise<string>;
  
  /**
   * Get a list of available models for this provider
   */
  getAvailableModels?(): Promise<AIModel[]>;
  
  /**
   * Check if a specific capability is supported
   */
  supportsCapability?(capability: 'image_generation' | 'function_calling' | 'json_mode'): boolean;
}

/**
 * Abstract base class for AI services
 */
export abstract class AbstractAIService implements BaseAIService {
  abstract generateCompletion(prompt: string, options?: GenerationOptions): Promise<string>;
  abstract generateWithTools(prompt: string, tools: AITool[], options?: ToolCallingOptions): Promise<any>;
  abstract analyzeCode(code: string, language: string): Promise<any>;
  
  // Optional methods with default implementations
  generateImage?(prompt: string): Promise<string> {
    throw new Error('Image generation not supported by this AI provider');
  }
  
  getAvailableModels?(): Promise<AIModel[]> {
    return Promise.resolve([]);
  }
  
  supportsCapability?(capability: 'image_generation' | 'function_calling' | 'json_mode'): boolean {
    return false;
  }
}