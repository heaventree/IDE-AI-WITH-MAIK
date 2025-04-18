/**
 * Prompt Manager for constructing optimized LLM prompts
 * 
 * This class provides functionality for constructing prompts based on templates,
 * with automatic token optimization and context management.
 */

import { 
  PromptInput, 
  PromptContext, 
  PromptResult, 
  PromptManagerConfig,
  TokenLimitExceededError 
} from '../../types/prompt';
import { allTemplates } from './templates';

/**
 * Default configuration for the prompt manager
 */
const DEFAULT_CONFIG: PromptManagerConfig = {
  defaultSystemMessage: 'You are a helpful AI assistant.',
  defaultTokenLimit: 8000,
  tokenCountEstimator: (text: string) => Math.ceil(text.length / 4), // Simple approximation
  defaultTemplateId: 'standard',
  templates: allTemplates
};

/**
 * Implementation of Prompt Manager with token optimization
 */
export class PromptManager {
  private config: PromptManagerConfig;
  
  /**
   * Create a new prompt manager with the specified configuration
   * @param config - Configuration options (or use defaults)
   */
  constructor(config: Partial<PromptManagerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }
  
  /**
   * Get a template by ID
   * @param templateId - The ID of the template to retrieve
   * @returns The requested template or the default template if not found
   */
  private getTemplate(templateId: string) {
    const template = this.config.templates.find(t => t.id === templateId);
    if (!template) {
      console.warn(`Template '${templateId}' not found, using default template`);
      return this.config.templates.find(t => t.id === this.config.defaultTemplateId)!;
    }
    return template;
  }
  
  /**
   * Select the best template based on input and context
   * @param input - Prompt input
   * @param context - Prompt context
   * @returns The ID of the selected template
   */
  private selectTemplate(input: PromptInput, context: PromptContext): string {
    // If the input specifies a template ID, use that
    if (input.outputFormat === 'json') {
      return 'structured';
    }
    
    // If code generation is requested, use the code template
    if (input.language || (input.query.toLowerCase().includes('code') && input.query.toLowerCase().includes('generate'))) {
      return 'code-generation';
    }
    
    // If function calling context is provided, use that template
    if (context.functionDefinitions) {
      return 'function-calling';
    }
    
    // If token optimization is critical, use the compact template
    if (context.tokenOptimization || (context.history && context.history.length > 5)) {
      return 'compact';
    }
    
    // Default to the structured template for complex contexts
    if (context.codeSnippets || context.project) {
      return 'structured';
    }
    
    // Otherwise use the standard template
    return 'standard';
  }
  
  /**
   * Estimate the token count for a string
   * @param text - The text to estimate token count for
   * @returns Estimated token count
   */
  public estimateTokenCount(text: string): number {
    return this.config.tokenCountEstimator(text);
  }
  
  /**
   * Optimize context to fit within token limits
   * @param input - Prompt input
   * @param context - Full prompt context
   * @param tokenLimit - Maximum tokens allowed
   * @returns Optimized context and metadata
   */
  private optimizeContext(
    input: PromptInput, 
    context: PromptContext, 
    tokenLimit: number
  ): { 
    optimizedContext: PromptContext, 
    metadata: { 
      contextIncluded: boolean, 
      historyIncluded: boolean, 
      historyTruncated: boolean, 
      contextSize: number 
    } 
  } {
    // Create a shallow copy of the context to modify
    const optimizedContext: PromptContext = { ...context, history: [...context.history] };
    
    // Start with a baseline system message and query to ensure they always fit
    const systemMessage = input.systemMessage || this.config.defaultSystemMessage;
    const baselinePrompt = `${systemMessage}\n\nUser: ${input.query}\nAssistant:`;
    const baselineTokens = this.estimateTokenCount(baselinePrompt);
    
    // Initialize metadata
    const metadata = {
      contextIncluded: true,
      historyIncluded: true,
      historyTruncated: false,
      contextSize: context.history.length
    };
    
    // Calculate remaining tokens after baseline
    const remainingTokens = tokenLimit - baselineTokens;
    
    // If we don't have enough tokens even for the baseline, throw an error
    if (remainingTokens <= 0) {
      throw new TokenLimitExceededError(
        'Query is too large to fit within token limit',
        baselineTokens,
        tokenLimit
      );
    }
    
    // Estimate tokens for code snippets
    let codeSnippetsTokens = 0;
    if (optimizedContext.codeSnippets) {
      codeSnippetsTokens = this.estimateTokenCount(
        optimizedContext.codeSnippets.map(snippet => snippet.code).join('\n')
      );
    }
    
    // Estimate tokens for project context
    let projectContextTokens = 0;
    if (optimizedContext.project) {
      projectContextTokens = this.estimateTokenCount(
        JSON.stringify(optimizedContext.project)
      );
    }
    
    // If code snippets and project context are too large, remove them
    if (codeSnippetsTokens + projectContextTokens > remainingTokens) {
      // Keep code snippets if they fit
      if (codeSnippetsTokens < remainingTokens) {
        delete optimizedContext.project;
        metadata.contextIncluded = false;
      } 
      // Otherwise remove everything
      else {
        delete optimizedContext.codeSnippets;
        delete optimizedContext.project;
        metadata.contextIncluded = false;
      }
    }
    
    // Recalculate remaining tokens
    let currentRemainingTokens = remainingTokens;
    if (optimizedContext.codeSnippets) {
      currentRemainingTokens -= codeSnippetsTokens;
    }
    if (optimizedContext.project) {
      currentRemainingTokens -= projectContextTokens;
    }
    
    // Estimate tokens for history
    const historyTokenCounts = optimizedContext.history.map(msg => 
      this.estimateTokenCount(`${msg.role}: ${msg.content}`)
    );
    
    // If history is too large, truncate it from the middle, keeping recent messages
    if (historyTokenCounts.reduce((sum, count) => sum + count, 0) > currentRemainingTokens) {
      metadata.historyTruncated = true;
      
      // Keep the most recent messages
      const keptMessages = [];
      let keptTokens = 0;
      
      // Start from the most recent messages, keep as many as can fit
      for (let i = optimizedContext.history.length - 1; i >= 0; i--) {
        if (keptTokens + historyTokenCounts[i] <= currentRemainingTokens) {
          keptMessages.unshift(optimizedContext.history[i]);
          keptTokens += historyTokenCounts[i];
        } else {
          break;
        }
      }
      
      // If we couldn't keep any history, set flag
      if (keptMessages.length === 0) {
        metadata.historyIncluded = false;
      }
      
      // Update the history
      optimizedContext.history = keptMessages;
      metadata.contextSize = keptMessages.length;
    }
    
    return { optimizedContext, metadata };
  }
  
  /**
   * Create an optimized prompt for the LLM
   * @param input - User input and options
   * @param context - Conversation and project context
   * @returns Prompt result containing the prompt string and metadata
   */
  public createPrompt(input: PromptInput, context: PromptContext): PromptResult {
    // Select the most appropriate template
    const templateId = input.agent ? `${input.agent.toLowerCase()}-template` : this.selectTemplate(input, context);
    const template = this.getTemplate(templateId);
    
    // Get token limit (template-specific or default)
    const tokenLimit = template.tokenLimit || this.config.defaultTokenLimit;
    
    // Initialize context if missing fields
    const fullContext: PromptContext = {
      history: context.history || [],
      ...context
    };
    
    try {
      // Optimize context to fit within token limit
      const { optimizedContext, metadata } = this.optimizeContext(input, fullContext, tokenLimit);
      
      // Construct prompt using the selected template
      const prompt = template.construct(input, optimizedContext);
      
      // Estimate token count for the final prompt
      const estimatedTokens = this.estimateTokenCount(prompt);
      
      // Return the result
      return {
        prompt,
        estimatedTokens,
        truncated: metadata.historyTruncated || !metadata.contextIncluded,
        templateUsed: template.id,
        metadata
      };
    } catch (error) {
      // Re-throw token limit errors
      if (error instanceof TokenLimitExceededError) {
        throw error;
      }
      
      // Handle other errors by falling back to the compact template
      console.error('Error constructing prompt with template', templateId, error);
      const fallbackTemplate = this.getTemplate('compact');
      const fallbackPrompt = fallbackTemplate.construct(input, { history: [] });
      
      return {
        prompt: fallbackPrompt,
        estimatedTokens: this.estimateTokenCount(fallbackPrompt),
        truncated: true,
        templateUsed: 'compact',
        metadata: {
          contextIncluded: false,
          historyIncluded: false,
          historyTruncated: true,
          contextSize: 0
        }
      };
    }
  }
  
  /**
   * Get all available templates
   * @returns Array of available templates
   */
  public getAvailableTemplates() {
    return this.config.templates.map(template => ({
      id: template.id,
      name: template.name,
      description: template.description,
      tags: template.tags
    }));
  }
}