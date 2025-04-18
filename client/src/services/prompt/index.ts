/**
 * Prompt Management System
 * 
 * This module exports the prompt management functionality, including
 * the PromptManager class, templates, and utility functions.
 */

// Export the PromptManager class
export { PromptManager } from './PromptManager';

// Export templates
export { 
  standardChatTemplate,
  structuredTemplate,
  compactTemplate,
  functionCallingTemplate,
  codeGenerationTemplate,
  allTemplates
} from './templates';

// Re-export types from types/prompt.ts
export type {
  PromptTemplate,
  PromptInput,
  PromptContext,
  PromptResult,
  PromptManagerConfig
} from '../../types/prompt';

export { TokenLimitExceededError } from '../../types/prompt';

/**
 * Simple function to create a prompt from input and context
 * using the default configuration
 * 
 * @param input - The prompt input
 * @param context - The prompt context
 * @returns The generated prompt string
 */
export function createPrompt(input: import('../../types/prompt').PromptInput, context: import('../../types/prompt').PromptContext): string {
  const manager = new (require('./PromptManager').PromptManager)();
  const result = manager.createPrompt(input, context);
  return result.prompt;
}