/**
 * Types for the Prompt Management System
 */

/**
 * Defines the structure of a prompt template for different use cases
 */
export interface PromptTemplate {
  /** Unique identifier for the template */
  id: string;
  
  /** Human-readable name for the template */
  name: string;
  
  /** Description of when to use this template */
  description: string;
  
  /** Function to construct a prompt from the input and context */
  construct: (input: PromptInput, context: PromptContext) => string;
  
  /** Optional token limit for this template */
  tokenLimit?: number;
  
  /** Tags for categorizing templates */
  tags: string[];
}

/**
 * Input for constructing a prompt
 */
export interface PromptInput {
  /** The primary user query */
  query: string;
  
  /** Optional system message override */
  systemMessage?: string;
  
  /** Optional agent role for specialized prompts */
  agent?: string;
  
  /** Programming language if relevant */
  language?: string;
  
  /** Desired output format (markdown, json, etc.) */
  outputFormat?: string;
}

/**
 * The context to include in the prompt
 */
export interface PromptContext {
  /** Recent conversation history */
  history: {
    role: 'user' | 'assistant';
    content: string;
  }[];
  
  /** Relevant code snippets */
  codeSnippets?: Array<{
    language: string;
    code: string;
    path?: string;
  }>;
  
  /** Project-specific context */
  project?: {
    files: string[];
    activeFile?: string;
    fileContents?: Record<string, string>;
  };
  
  /** User preferences */
  preferences?: Record<string, any>;
  
  /** Additional context information */
  [key: string]: any;
}

/**
 * Configuration options for the prompt manager
 */
export interface PromptManagerConfig {
  /** Default system message for all prompts */
  defaultSystemMessage: string;
  
  /** Default token limit */
  defaultTokenLimit: number;
  
  /** Function to estimate token count for a string */
  tokenCountEstimator: (text: string) => number;
  
  /** Default templates to use */
  defaultTemplateId: string;
  
  /** List of available templates */
  templates: PromptTemplate[];
}

/**
 * Result from creating a prompt
 */
export interface PromptResult {
  /** The generated prompt string */
  prompt: string;
  
  /** Estimated token count */
  estimatedTokens: number;
  
  /** Whether the prompt was truncated */
  truncated: boolean;
  
  /** The template used */
  templateUsed: string;
  
  /** Metadata about the prompt */
  metadata: {
    contextIncluded: boolean;
    historyIncluded: boolean;
    historyTruncated: boolean;
    contextSize: number;
  };
}

/**
 * Error thrown when a prompt is too large
 */
export class TokenLimitExceededError extends Error {
  public estimatedTokens: number;
  public tokenLimit: number;
  
  constructor(message: string, estimatedTokens: number, tokenLimit: number) {
    super(message);
    this.name = 'TokenLimitExceededError';
    this.estimatedTokens = estimatedTokens;
    this.tokenLimit = tokenLimit;
  }
}