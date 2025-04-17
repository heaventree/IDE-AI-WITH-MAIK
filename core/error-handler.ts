/**
 * Error Handler for Bolt DIY
 * 
 * This module provides centralized error handling with monitoring integration.
 * It processes various error types and provides user-friendly error messages
 * while logging detailed diagnostic information.
 */

import { injectable } from 'tsyringe';
import { SentrySDK } from './monitoring/sentry-sdk';
import { 
  BoltDIYError, 
  MemoryStorageError,
  InputValidationError,
  ToolExecutionError,
  LLMAPIError,
  ContextWindowExceededError,
  AIGovernanceError
} from './errors';

/**
 * Standardized error response structure
 */
export interface MonitoredError {
  /** User-facing error message */
  userFacingMessage: string;
  
  /** Technical details for logging/debugging */
  internalDetails: string;
  
  /** Unique error identifier for tracking */
  errorId?: string;
}

/**
 * Centralized error handler for consistent error processing
 */
@injectable()
export class ErrorHandler {
  /**
   * Process and monitor any error
   * @param error - The error to handle
   * @param context - Additional context about the error
   * @returns Structured error object with user-facing message
   */
  handle(error: unknown, context: Record<string, any> = {}): MonitoredError {
    // Initialize standardized error response
    const monitoredError: MonitoredError = {
      userFacingMessage: 'Something went wrong. Please try again later.',
      internalDetails: 'Unknown error'
    };
    
    // Extract error message and stack trace
    let errorMessage = 'Unknown error';
    let errorStack = '';
    
    if (error instanceof Error) {
      errorMessage = error.message;
      errorStack = error.stack || '';
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else {
      errorMessage = `Unknown error type: ${JSON.stringify(error)}`;
    }
    
    monitoredError.internalDetails = errorMessage;
    
    // Process based on error type to provide user-friendly messages
    if (error instanceof MemoryStorageError) {
      monitoredError.userFacingMessage = 'Unable to access conversation history. Please try again.';
    } else if (error instanceof InputValidationError) {
      monitoredError.userFacingMessage = 'Invalid input. Please try a different request.';
    } else if (error instanceof ToolExecutionError) {
      monitoredError.userFacingMessage = `Unable to complete the requested action using ${error.toolName}. Please try again or use a different approach.`;
    } else if (error instanceof LLMAPIError) {
      monitoredError.userFacingMessage = 'Unable to generate a response right now. Please try again in a moment.';
      
      // Add HTTP status code if available
      if (error.statusCode) {
        monitoredError.internalDetails = `${errorMessage} (Status: ${error.statusCode})`;
      }
    } else if (error instanceof ContextWindowExceededError) {
      monitoredError.userFacingMessage = 'Your conversation is too long for me to process. Please start a new conversation or simplify your request.';
      monitoredError.internalDetails = `${errorMessage} (Tokens: ${error.tokenCount}/${error.maxTokens})`;
    } else if (error instanceof AIGovernanceError) {
      monitoredError.userFacingMessage = 'This request could not be processed due to content guidelines.';
      monitoredError.internalDetails = `${errorMessage} (Category: ${error.category})`;
    } else if (error instanceof BoltDIYError) {
      // Generic Bolt DIY error
      monitoredError.userFacingMessage = 'An error occurred with the BoltDIY system. Please try again.';
    }
    
    // Report error to monitoring system
    monitoredError.errorId = SentrySDK.captureException(error, {
      ...context,
      errorMessage,
      errorStack
    });
    
    // Log locally as well
    console.error('[ErrorHandler]', {
      errorType: error instanceof Error ? error.constructor.name : typeof error,
      errorMessage,
      context,
      errorId: monitoredError.errorId
    });
    
    return monitoredError;
  }
}