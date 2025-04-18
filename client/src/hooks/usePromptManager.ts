/**
 * Hook for using the prompt manager in React components
 */

import { useState, useCallback, useMemo } from 'react';
import { PromptManager } from '../services/prompt/PromptManager';
import { PromptInput, PromptContext, PromptResult, TokenLimitExceededError } from '../types/prompt';
import { useToast } from './use-toast';

/**
 * Hook for constructing optimized prompts with the PromptManager
 * @param config - Optional configuration for the prompt manager
 * @returns An object with methods for creating prompts and accessing templates
 */
export const usePromptManager = (config = {}) => {
  // Create prompt manager instance
  const promptManager = useMemo(() => new PromptManager(config), []);
  
  // State for tracking the last created prompt
  const [lastPrompt, setLastPrompt] = useState<PromptResult | null>(null);
  
  // Error state
  const [error, setError] = useState<Error | null>(null);
  
  // Toast for notifications
  const { toast } = useToast();
  
  /**
   * Create a prompt with the specified input and context
   * @param input - User input and options
   * @param context - Conversation and project context
   * @returns The created prompt result
   */
  const createPrompt = useCallback((input: PromptInput, context: PromptContext): PromptResult | null => {
    try {
      // Reset error state
      setError(null);
      
      // Create the prompt
      const result = promptManager.createPrompt(input, context);
      
      // Store the result
      setLastPrompt(result);
      
      // Show warning if truncated
      if (result.truncated) {
        toast({
          title: 'Prompt optimization applied',
          description: 'Some context was removed to fit within token limits.',
          variant: 'default'
        });
      }
      
      return result;
    } catch (error) {
      // Handle token limit exceeded error
      if (error instanceof TokenLimitExceededError) {
        toast({
          title: 'Prompt too large',
          description: `The prompt exceeds the token limit (${error.tokenLimit} tokens).`,
          variant: 'destructive'
        });
      } 
      // Handle other errors
      else {
        toast({
          title: 'Error creating prompt',
          description: (error as Error).message || 'An unexpected error occurred',
          variant: 'destructive'
        });
      }
      
      // Set error state
      setError(error as Error);
      
      return null;
    }
  }, [promptManager, toast]);
  
  /**
   * Get all available templates
   * @returns Array of template information
   */
  const getAvailableTemplates = useCallback(() => {
    return promptManager.getAvailableTemplates();
  }, [promptManager]);
  
  /**
   * Estimate token count for a string
   * @param text - The text to estimate token count for
   * @returns Estimated token count
   */
  const estimateTokenCount = useCallback((text: string): number => {
    return promptManager.estimateTokenCount(text);
  }, [promptManager]);
  
  // Return the hook API
  return {
    createPrompt,
    getAvailableTemplates,
    estimateTokenCount,
    lastPrompt,
    error
  };
};