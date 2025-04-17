/**
 * Error Handler for Bolt DIY
 * 
 * This module provides centralized error handling with monitoring integration.
 * It processes various error types and provides user-friendly error messages
 * while logging detailed diagnostic information.
 */

import { AnalyticsSDK, SentrySDK } from './monitoring';
import { 
  BoltError, 
  InputValidationError, 
  ToolExecutionError, 
  LLMAPIError, 
  MemoryStorageError,
  ContextWindowExceededError
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
export class ErrorHandler {
  /**
   * Process and monitor any error
   * @param error - The error to handle
   * @param context - Additional context about the error
   * @returns Structured error object with user-facing message
   */
  handle(error: unknown, context: Record<string, any> = {}): MonitoredError {
    let userFacingMessage = 'Sorry, I encountered an unexpected error while processing your request.';
    let internalDetails = 'Unknown error type';
    let errorId: string | undefined;

    // Process different error types
    if (error instanceof InputValidationError) {
      userFacingMessage = `Input validation error: ${error.message}`;
      internalDetails = `Validation error: ${error.message}\nContext: ${JSON.stringify(context)}`;
    } else if (error instanceof ToolExecutionError) {
      userFacingMessage = `Sorry, I encountered an issue while performing an operation (${error.toolName}).`;
      internalDetails = `Tool execution error: ${error.message}\nTool: ${error.toolName}\nContext: ${JSON.stringify(context)}`;
    } else if (error instanceof LLMAPIError) {
      userFacingMessage = 'Sorry, there was an issue connecting to the AI service. Please try again in a moment.';
      internalDetails = `LLM API error: ${error.message}\nStatus: ${error.statusCode}\nContext: ${JSON.stringify(context)}`;
    } else if (error instanceof ContextWindowExceededError) {
      userFacingMessage = 'Sorry, the conversation has grown too long for me to process. Try starting a new conversation or summarizing the current topic.';
      internalDetails = `Context window exceeded: ${error.message}\nTokens: ${error.tokenCount}/${error.maxTokens}\nContext: ${JSON.stringify(context)}`;
    } else if (error instanceof MemoryStorageError) {
      userFacingMessage = 'Sorry, I encountered an issue accessing conversation history.';
      internalDetails = `Memory storage error: ${error.message}\nContext: ${JSON.stringify(context)}`;
    } else if (error instanceof BoltError) {
      userFacingMessage = `Sorry, an error occurred: ${error.message}`;
      internalDetails = `Bolt error: ${error.message}\nContext: ${JSON.stringify(context)}`;
    } else if (error instanceof Error) {
      internalDetails = `Standard error: ${error.message}\nContext: ${JSON.stringify(context)}\nStack: ${error.stack}`;
    } else {
      internalDetails = `Unknown error occurred: ${JSON.stringify(error)}\nContext: ${JSON.stringify(context)}`;
    }

    // Log to console
    console.error(`Error occurred: ${internalDetails}`);
    
    // Track in analytics
    AnalyticsSDK.trackError(error instanceof Error ? error : String(error), context);
    
    // Log to Sentry/monitoring
    errorId = SentrySDK.captureException(error, context);

    // Return structured error response
    return {
      userFacingMessage: errorId 
        ? `${userFacingMessage} (Ref: ${errorId.substring(0, 8)})` 
        : userFacingMessage,
      internalDetails,
      errorId
    };
  }
}