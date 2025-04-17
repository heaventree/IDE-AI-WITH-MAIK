/**
 * Prompt Manager for Bolt DIY
 * 
 * This module provides advanced functionality for constructing optimized prompts
 * for large language models (LLMs). It intelligently formats prompts
 * to maximize context usage while staying within token limits.
 * 
 * Key features:
 * - Smart token optimization strategies
 * - Template-based prompt formatting
 * - Dynamic context compression
 * - Role-specific system prompts
 * - Automatic conversation steering
 */

import { 
  IPromptManager, 
  IMemoryManager,
  MemoryContext, 
  ApplicationState,
  ToolParameter
} from '../interfaces';
import { ContextWindowExceededError } from '../errors';

/**
 * Prompt template type for different prompt formats
 */
export enum PromptTemplate {
  /** Simple chat format */
  CHAT = 'chat',
  
  /** Structured format with clear section markers */
  STRUCTURED = 'structured',
  
  /** Compact format with minimal decorators */
  COMPACT = 'compact',
  
  /** Function-calling optimized template */
  FUNCTION_CALLING = 'function-calling',
  
  /** Code-generation optimized template */
  CODE_GENERATION = 'code-generation'
}

/**
 * Prompt manager configuration options
 */
interface PromptManagerOptions {
  /** System prompt that defines assistant behavior */
  systemPrompt?: string;
  
  /** Maximum tokens in the prompt */
  maxTokens?: number;
  
  /** Custom token counting function */
  tokenCountEstimator?: (text: string) => number;
  
  /** Prompt template to use */
  template?: PromptTemplate;
  
  /** Whether to add tool descriptions to system prompt */
  includeToolDescriptions?: boolean;
  
  /** Whether to remember function calls across session */
  rememberFunctionCalls?: boolean;
  
  /** Whether to optimize tokens by removing redundant information */
  enableContextCompression?: boolean;
}

/**
 * Implementation of Prompt Manager with advanced token optimization
 */
export class PromptManager implements IPromptManager {
  // Configuration
  private systemPrompt: string;
  private maxTokens: number;
  private tokenCountEstimator: (text: string) => number;
  private template: PromptTemplate;
  private includeToolDescriptions: boolean;
  private rememberFunctionCalls: boolean;
  private enableContextCompression: boolean;
  private memoryManager?: IMemoryManager;
  
  // Default estimation function for tokens
  private static readonly DEFAULT_TOKEN_ESTIMATOR = (text: string) => Math.ceil(text.length / 4);
  
  /**
   * Create a new prompt manager
   * @param options - Configuration options
   * @param memoryManager - Optional memory manager for context optimization
   */
  constructor(
    options: PromptManagerOptions = {},
    memoryManager?: IMemoryManager
  ) {
    this.memoryManager = memoryManager;
    this.systemPrompt = options.systemPrompt || 
      'You are a helpful AI assistant that provides accurate, helpful information, and prioritizes user success.';
    this.maxTokens = options.maxTokens || 4000;
    this.tokenCountEstimator = options.tokenCountEstimator || PromptManager.DEFAULT_TOKEN_ESTIMATOR;
    this.template = options.template || PromptTemplate.STRUCTURED;
    this.includeToolDescriptions = options.includeToolDescriptions ?? true;
    this.rememberFunctionCalls = options.rememberFunctionCalls ?? true;
    this.enableContextCompression = options.enableContextCompression ?? true;
  }
  
  /**
   * Set the system prompt
   * @param systemPrompt - New system prompt
   */
  setSystemPrompt(systemPrompt: string): void {
    this.systemPrompt = systemPrompt;
  }
  
  /**
   * Set the maximum tokens
   * @param maxTokens - New maximum tokens
   */
  setMaxTokens(maxTokens: number): void {
    this.maxTokens = maxTokens;
  }
  
  /**
   * Set the prompt template
   * @param template - New template
   */
  setTemplate(template: PromptTemplate): void {
    this.template = template;
  }
  
  /**
   * Construct an optimized prompt for the LLM
   * @param userInput - Current user input
   * @param context - Memory context from memory manager
   * @param state - Current application state
   * @returns Constructed prompt string
   */
  async constructPrompt(userInput: string, context: MemoryContext, state: ApplicationState): Promise<string> {
    // Optimize context if memory manager is available
    const optimizedContext = this.memoryManager ? 
      this.memoryManager.optimizeContext(context, this.maxTokens) : 
      context;
    
    // Select appropriate template formatter
    let formattedPrompt: string;
    switch (this.template) {
      case PromptTemplate.CHAT:
        formattedPrompt = this.formatChatPrompt(userInput, optimizedContext, state);
        break;
      case PromptTemplate.COMPACT:
        formattedPrompt = this.formatCompactPrompt(userInput, optimizedContext, state);
        break;
      case PromptTemplate.FUNCTION_CALLING:
        formattedPrompt = this.formatFunctionCallingPrompt(userInput, optimizedContext, state);
        break;
      case PromptTemplate.CODE_GENERATION:
        formattedPrompt = this.formatCodeGenerationPrompt(userInput, optimizedContext, state);
        break;
      case PromptTemplate.STRUCTURED:
      default:
        formattedPrompt = this.formatStructuredPrompt(userInput, optimizedContext, state);
    }
    
    // Check token count
    const estimatedTokens = this.tokenCountEstimator(formattedPrompt);
    
    // If it still exceeds the token limit, throw an error
    if (estimatedTokens > this.maxTokens) {
      throw new ContextWindowExceededError(
        'Prompt exceeds maximum token limit even after optimization',
        estimatedTokens,
        this.maxTokens
      );
    }
    
    return formattedPrompt;
  }
  
  /**
   * Format prompt using chat template
   * @param userInput - Current user input
   * @param context - Memory context
   * @param state - Application state
   * @returns Formatted prompt
   * @private
   */
  private formatChatPrompt(userInput: string, context: MemoryContext, state: ApplicationState): string {
    // Simple chat format with system message followed by turns
    let prompt = `${this.systemPrompt}\n\n`;
    
    // Add summary if available
    if (context.summary) {
      prompt += `Prior conversation summary: ${context.summary}\n\n`;
    }
    
    // Add relevant memories
    if (context.memories && context.memories.length > 0) {
      prompt += `Relevant memories:\n${context.memories.join('\n')}\n\n`;
    }
    
    // Add conversation history
    for (const turn of context.history) {
      prompt += `User: ${turn.input}\nAssistant: ${turn.response}\n\n`;
    }
    
    // Add current user input and prompt for assistant response
    prompt += `User: ${userInput}\nAssistant:`;
    
    return prompt;
  }
  
  /**
   * Format prompt using structured template with clear sections
   * @param userInput - Current user input
   * @param context - Memory context
   * @param state - Application state
   * @returns Formatted prompt
   * @private
   */
  private formatStructuredPrompt(userInput: string, context: MemoryContext, state: ApplicationState): string {
    let prompt = `### System Instructions\n${this.systemPrompt}\n\n`;
    
    // Add tool/function descriptions if enabled
    if (this.includeToolDescriptions && state.availableTools) {
      prompt += "### Available Tools\n";
      prompt += state.availableTools.map(tool => 
        `- ${tool.name}: ${tool.description}`
      ).join('\n');
      prompt += "\n\n";
    }
    
    // Add conversation summary if available
    if (context.summary) {
      prompt += `### Conversation Summary\n${context.summary}\n\n`;
    }
    
    // Add relevant memories
    if (context.memories && context.memories.length > 0) {
      prompt += "### Relevant Information\n";
      context.memories.forEach((memory, i) => {
        prompt += `[${i+1}] ${memory}\n`;
      });
      prompt += "\n";
    }
    
    // Add conversation history with turn numbers
    if (context.history.length > 0) {
      prompt += "### Conversation History\n";
      context.history.forEach((turn, i) => {
        prompt += `Turn ${i+1}:\nUser: ${turn.input}\nAssistant: ${turn.response}\n\n`;
      });
    }
    
    // If there was a prior function call that needs to be remembered
    if (this.rememberFunctionCalls && state.lastFunctionCall) {
      prompt += `### Last Function Call\n${state.lastFunctionCall}\n\n`;
    }
    
    // Add current user input
    prompt += `### Current User Input\n${userInput}\n\n`;
    
    // Prompt for assistant response
    prompt += "### Assistant Response\n";
    
    return prompt;
  }
  
  /**
   * Format prompt using compact template with minimal decorators
   * @param userInput - Current user input
   * @param context - Memory context
   * @param state - Application state
   * @returns Formatted prompt
   * @private
   */
  private formatCompactPrompt(userInput: string, context: MemoryContext, state: ApplicationState): string {
    let prompt = `${this.systemPrompt}\n\n`;
    
    // Add only the most essential context elements to save tokens
    
    // Add summary if available (instead of full history)
    if (context.summary) {
      prompt += `Summary: ${context.summary}\n\n`;
    } else if (context.history.length > 0) {
      // If no summary, add just the last turn for context
      const lastTurn = context.history[context.history.length - 1];
      prompt += `Last turn: Q: ${lastTurn.input} A: ${lastTurn.response}\n\n`;
    }
    
    // Add only the most relevant memory if available
    if (context.memories && context.memories.length > 0) {
      prompt += `Ref: ${context.memories[0]}\n\n`;
    }
    
    // Add current user input
    prompt += `Q: ${userInput}\nA:`;
    
    return prompt;
  }
  
  /**
   * Format prompt optimized for function calling
   * @param userInput - Current user input
   * @param context - Memory context
   * @param state - Application state
   * @returns Formatted prompt
   * @private
   */
  private formatFunctionCallingPrompt(userInput: string, context: MemoryContext, state: ApplicationState): string {
    let prompt = `${this.systemPrompt}\n\n`;
    
    // Add tool descriptions with detailed format for function calling
    if (state.availableTools) {
      prompt += "Available tools:\n\n";
      
      for (const tool of state.availableTools) {
        prompt += `Tool Name: ${tool.name}\n`;
        prompt += `Description: ${tool.description}\n`;
        
        if (tool.parameters) {
          prompt += "Parameters:\n";
          for (const [paramName, paramDetails] of Object.entries(tool.parameters)) {
            const details = paramDetails as ToolParameter;
            prompt += `  - ${paramName}: ${details.description || ''} (${details.type || 'any'})\n`;
          }
        }
        
        prompt += "\n";
      }
      
      // Add usage instructions
      prompt += "To use a tool, respond with:\n";
      prompt += "{{tool:toolName({\"param1\": \"value1\", \"param2\": \"value2\"})}}\n\n";
    }
    
    // Add minimal conversation context
    if (context.summary) {
      prompt += `Context: ${context.summary}\n\n`;
    }
    
    // Include history focused on tool usage patterns
    if (context.history.length > 0) {
      prompt += "Recent interactions:\n\n";
      for (const turn of context.history.slice(-3)) { // Just last 3 turns
        prompt += `User: ${turn.input}\nAssistant: ${turn.response}\n\n`;
      }
    }
    
    // Add current user input
    prompt += `User: ${userInput}\nAssistant:`;
    
    return prompt;
  }
  
  /**
   * Format prompt optimized for code generation
   * @param userInput - Current user input
   * @param context - Memory context
   * @param state - Application state
   * @returns Formatted prompt
   * @private
   */
  private formatCodeGenerationPrompt(userInput: string, context: MemoryContext, state: ApplicationState): string {
    // Enhance system prompt for code generation
    let codeSystemPrompt = this.systemPrompt;
    if (!codeSystemPrompt.includes("code")) {
      codeSystemPrompt += "\nWhen generating code:\n";
      codeSystemPrompt += "1. Focus on clean, maintainable, and efficient code\n";
      codeSystemPrompt += "2. Use proper syntax highlighting with markdown code blocks\n";
      codeSystemPrompt += "3. Add comments for complex logic\n";
      codeSystemPrompt += "4. Consider edge cases and error handling\n";
    }
    
    let prompt = `${codeSystemPrompt}\n\n`;
    
    // Add programming context if available
    if (state.programmingLanguage) {
      prompt += `Programming Language: ${state.programmingLanguage}\n`;
    }
    
    if (state.projectContext) {
      prompt += `Project Context: ${state.projectContext}\n\n`;
    }
    
    // Add relevant code snippets from memory
    if (context.memories && context.memories.length > 0) {
      prompt += "Relevant code snippets:\n\n";
      for (const memory of context.memories) {
        if (memory.includes("```")) {
          prompt += `${memory}\n\n`;
        }
      }
    }
    
    // Add prior code-related conversation
    if (context.history.length > 0) {
      const codeRelatedTurns = context.history.filter(turn => 
        turn.input.includes("code") || 
        turn.input.includes("function") || 
        turn.input.includes("class") || 
        turn.response.includes("```")
      );
      
      if (codeRelatedTurns.length > 0) {
        prompt += "Previous code discussion:\n\n";
        for (const turn of codeRelatedTurns.slice(-2)) { // Last 2 code-related turns
          prompt += `User: ${turn.input}\nAssistant: ${turn.response}\n\n`;
        }
      }
    }
    
    // Add current user input
    prompt += `User: ${userInput}\nAssistant:`;
    
    return prompt;
  }
  
  /**
   * Estimate token count for a prompt
   * @param prompt - Prompt to estimate tokens for
   * @returns Estimated token count
   */
  estimateTokens(prompt: string): number {
    return this.tokenCountEstimator(prompt);
  }
  
  /**
   * Check if a prompt will fit within token limits
   * @param prompt - Prompt to check
   * @returns Whether the prompt fits within token limits
   */
  willFitInContext(prompt: string): boolean {
    const tokenCount = this.estimateTokens(prompt);
    return tokenCount <= this.maxTokens;
  }
}