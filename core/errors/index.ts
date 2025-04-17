/**
 * Custom error types for Bolt DIY system
 * 
 * This file contains all custom error classes used throughout the application
 * to provide more specific error handling and better diagnostics.
 */

/**
 * Base error class for Bolt DIY system errors
 * Provides a common base for all application-specific errors
 */
export class BoltError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    // This fixes the prototype chain in TypeScript
    Object.setPrototypeOf(this, BoltError.prototype);
  }
}

/**
 * Error for invalid input validation
 */
export class InputValidationError extends BoltError {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, InputValidationError.prototype);
  }
}

/**
 * Error for tool execution failures
 */
export class ToolExecutionError extends BoltError {
  constructor(message: string, public toolName: string) {
    super(`Error executing tool ${toolName}: ${message}`);
    Object.setPrototypeOf(this, ToolExecutionError.prototype);
  }
}

/**
 * Error for LLM API failures
 */
export class LLMAPIError extends BoltError {
  constructor(message: string, public statusCode?: number) {
    super(`LLM API Error: ${message}`);
    Object.setPrototypeOf(this, LLMAPIError.prototype);
  }
}

/**
 * Error for memory storage/retrieval issues
 */
export class MemoryStorageError extends BoltError {
  constructor(message: string) {
    super(`Memory Storage Error: ${message}`);
    Object.setPrototypeOf(this, MemoryStorageError.prototype);
  }
}

/**
 * Error for context window size exceeded
 */
export class ContextWindowExceededError extends BoltError {
  constructor(message: string, public tokenCount: number, public maxTokens: number) {
    super(`Context window exceeded: ${message}. Token count: ${tokenCount}, Max allowed: ${maxTokens}`);
    Object.setPrototypeOf(this, ContextWindowExceededError.prototype);
  }
}

/**
 * Error for unauthorized operation
 */
export class UnauthorizedError extends BoltError {
  constructor(message: string) {
    super(`Unauthorized: ${message}`);
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}