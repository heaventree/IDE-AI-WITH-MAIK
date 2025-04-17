/**
 * Prompt Manager for Bolt DIY
 * 
 * This module provides functionality for constructing optimized prompts
 * for large language models (LLMs) based on the current context, state,
 * and user input.
 */

import { IPromptManager, MemoryContext, ApplicationState } from '../interfaces';
import { ContextWindowExceededError } from '../errors';

/**
 * Implementation of Prompt Manager with token optimization
 */
export class PromptManager implements IPromptManager {
  // Configuration
  private systemPrompt: string;
  private maxTokens: number;
  private tokenCountEstimator: (text: string) => number;
  
  /**
   * Create a new prompt manager
   * @param options - Configuration options
   */
  constructor(options: {
    systemPrompt?: string;
    maxTokens?: number;
    tokenCountEstimator?: (text: string) => number;
  } = {}) {
    this.systemPrompt = options.systemPrompt || 'You are a helpful assistant.';
    this.maxTokens = options.maxTokens || 8000; // Default max tokens
    
    // Simple estimator function (roughly 4 chars per token)
    this.tokenCountEstimator = options.tokenCountEstimator || 
      ((text: string) => Math.ceil(text.length / 4));
  }
  
  /**
   * Construct an optimized prompt for the LLM
   * @param userInput - Current user input
   * @param context - Memory context from memory manager
   * @param state - Current application state
   * @returns Constructed prompt string
   */
  async constructPrompt(userInput: string, context: MemoryContext, state: ApplicationState): Promise<string> {
    // Format system prompt
    const formattedSystemPrompt = `${this.systemPrompt}\n\n`;
    
    // Format conversation history
    const formattedHistory = context.history.map(turn => {
      return `User: ${turn.input}\nAssistant: ${turn.response}`;
    }).join('\n\n');
    
    // Format relevant memories if available
    const formattedMemories = context.memories.length > 0
      ? `Relevant information from previous conversations:\n${context.memories.join('\n')}\n\n`
      : '';
      
    // Format conversation summary if available
    const formattedSummary = context.summary
      ? `Previous conversation summary: ${context.summary}\n\n`
      : '';
    
    // Format current user input
    const formattedUserInput = `User: ${userInput}\nAssistant:`;
    
    // Construct full prompt
    let fullPrompt = `${formattedSystemPrompt}${formattedSummary}${formattedMemories}${formattedHistory}\n\n${formattedUserInput}`;
    
    // Check token count
    const estimatedTokens = this.tokenCountEstimator(fullPrompt);
    
    // If we exceed token limit, we need to trim the context
    if (estimatedTokens > this.maxTokens) {
      // Try with just system prompt, memories, and user input (no history)
      fullPrompt = `${formattedSystemPrompt}${formattedSummary}${formattedMemories}${formattedUserInput}`;
      const reducedTokens = this.tokenCountEstimator(fullPrompt);
      
      if (reducedTokens > this.maxTokens) {
        throw new ContextWindowExceededError(
          'Prompt is too large even with reduced context',
          reducedTokens,
          this.maxTokens
        );
      }
      
      console.warn('Prompt size reduced - removed conversation history');
    }
    
    return fullPrompt;
  }
}