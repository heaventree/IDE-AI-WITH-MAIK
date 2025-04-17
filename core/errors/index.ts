/**
 * Custom Error Types for Bolt DIY
 * 
 * This module defines custom error types to facilitate better error handling
 * and provide more descriptive error messages.
 */

/**
 * Base error class for Bolt DIY errors
 */
export class BoltDIYError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    
    // This is needed to make instanceof work correctly in TypeScript
    Object.setPrototypeOf(this, BoltDIYError.prototype);
  }
}

/**
 * Error thrown when there's an issue with memory storage
 */
export class MemoryStorageError extends BoltDIYError {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, MemoryStorageError.prototype);
  }
}

/**
 * Error thrown when input validation fails
 */
export class InputValidationError extends BoltDIYError {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, InputValidationError.prototype);
  }
}

/**
 * Error thrown when there's an issue with tool execution
 */
export class ToolExecutionError extends BoltDIYError {
  readonly toolName: string;
  
  constructor(message: string, toolName: string) {
    super(message);
    this.toolName = toolName;
    Object.setPrototypeOf(this, ToolExecutionError.prototype);
  }
}

/**
 * Error thrown when there's an issue with the LLM API
 */
export class LLMAPIError extends BoltDIYError {
  readonly statusCode?: number;
  
  constructor(message: string, statusCode?: number) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, LLMAPIError.prototype);
  }
}

/**
 * Error thrown when the context window size is exceeded
 */
export class ContextWindowExceededError extends BoltDIYError {
  readonly tokenCount: number;
  readonly maxTokens: number;
  
  constructor(message: string, tokenCount: number, maxTokens: number) {
    super(message);
    this.tokenCount = tokenCount;
    this.maxTokens = maxTokens;
    Object.setPrototypeOf(this, ContextWindowExceededError.prototype);
  }
}

/**
 * Error thrown when there's an issue with AI governance
 */
export class AIGovernanceError extends BoltDIYError {
  readonly category: string;
  
  constructor(message: string, category: string) {
    super(message);
    this.category = category;
    Object.setPrototypeOf(this, AIGovernanceError.prototype);
  }
}