/**
 * Error Handler for Bolt DIY
 * 
 * This module provides centralized error handling with comprehensive monitoring integration.
 * It processes various error types and provides user-friendly error messages 
 * while logging detailed diagnostic information for debugging and monitoring.
 * 
 * Key features:
 * - Standardized error responses for consistent UX
 * - Error categorization for easier troubleshooting
 * - Integration with Sentry for error tracking and monitoring
 * - Customizable user-facing messages by error type
 * - Diagnostic context collection for debugging
 * - Structured logging for better observability
 */

import { injectable, inject } from 'tsyringe';
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
 * Error severity levels for monitoring and alerting
 */
export enum ErrorSeverity {
  /** Critical errors that require immediate attention */
  CRITICAL = 'critical',
  
  /** Serious errors that significantly impact functionality */
  ERROR = 'error',
  
  /** Warning conditions that don't prevent core functionality */
  WARNING = 'warning',
  
  /** Informational errors that don't impact functionality */
  INFO = 'info'
}

/**
 * Error categories for classification and analytics
 */
export enum ErrorCategory {
  /** Errors related to system infrastructure */
  SYSTEM = 'system',
  
  /** Errors related to memory management */
  MEMORY = 'memory',
  
  /** Errors related to invalid user input */
  INPUT = 'input',
  
  /** Errors related to tool execution */
  TOOL = 'tool',
  
  /** Errors related to LLM/AI API calls */
  LLM = 'llm',
  
  /** Errors related to token limits and context windows */
  CONTEXT = 'context',
  
  /** Errors related to AI governance and content policies */
  GOVERNANCE = 'governance',
  
  /** Networking and connectivity errors */
  NETWORK = 'network',
  
  /** Unknown or uncategorized errors */
  UNKNOWN = 'unknown'
}

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
  
  /** Error category for classification */
  category: ErrorCategory;
  
  /** Error severity level */
  severity: ErrorSeverity;
  
  /** Whether the error is recoverable by retrying */
  isRetryable: boolean;
  
  /** Timestamp when the error occurred */
  timestamp: string;
  
  /** Suggested action for recovery if applicable */
  recoveryAction?: string;
}

/**
 * Error handler configuration options
 */
interface ErrorHandlerConfig {
  /** Whether to include stack traces in error responses (dev only) */
  includeStackTraces?: boolean;
  
  /** Additional tags for all error reports */
  globalTags?: Record<string, string>;
  
  /** Custom user-facing messages for specific error types */
  customMessages?: Record<string, string>;
}

/**
 * Centralized error handler for consistent error processing,
 * monitoring integration, and user-friendly messaging
 */
@injectable()
export class ErrorHandler {
  /** Configuration options */
  private config: ErrorHandlerConfig;
  
  /** Error count for rate limiting/detection */
  private errorCount: Record<ErrorCategory, number> = {
    [ErrorCategory.SYSTEM]: 0,
    [ErrorCategory.MEMORY]: 0,
    [ErrorCategory.INPUT]: 0,
    [ErrorCategory.TOOL]: 0,
    [ErrorCategory.LLM]: 0,
    [ErrorCategory.CONTEXT]: 0,
    [ErrorCategory.GOVERNANCE]: 0,
    [ErrorCategory.NETWORK]: 0,
    [ErrorCategory.UNKNOWN]: 0
  };
  
  /** Timestamp of last error reset */
  private lastErrorReset: number = Date.now();
  
  /**
   * Create a new error handler
   * @param config - Optional configuration options
   */
  constructor(config: ErrorHandlerConfig = {}) {
    // Default configuration
    this.config = {
      includeStackTraces: process.env.NODE_ENV !== 'production',
      globalTags: {
        service: 'bolt-diy',
        environment: process.env.NODE_ENV || 'development'
      },
      customMessages: {},
      ...config
    };
    
    // Set up error count reset interval (every hour)
    setInterval(() => this.resetErrorCounts(), 60 * 60 * 1000);
  }
  
  /**
   * Reset error counts for rate limiting
   * Used to detect error storms and recurring issues
   */
  private resetErrorCounts(): void {
    for (const category in this.errorCount) {
      this.errorCount[category as ErrorCategory] = 0;
    }
    this.lastErrorReset = Date.now();
  }
  
  /**
   * Process and monitor any error
   * @param error - The error to handle
   * @param context - Additional context about the error
   * @returns Structured error object with user-facing message
   */
  handle(error: unknown, context: Record<string, any> = {}): MonitoredError {
    // Extract error details
    const { 
      errorMessage, 
      errorStack, 
      errorType,
      category,
      severity
    } = this.extractErrorInfo(error);
    
    // Increment error count for this category
    this.errorCount[category]++;
    
    // Log error rate data if it exceeds thresholds
    if (this.errorCount[category] > 10) {
      const timeSinceReset = Date.now() - this.lastErrorReset;
      const ratePerHour = (this.errorCount[category] / timeSinceReset) * 3600000;
      console.warn(`[ErrorHandler] High error rate detected for category ${category}: ${ratePerHour.toFixed(2)}/hour`);
    }

    // Create standardized response
    const monitoredError: MonitoredError = {
      userFacingMessage: this.getUserFacingMessage(error, errorType),
      internalDetails: this.getInternalDetails(error, errorMessage, errorStack),
      category,
      severity,
      isRetryable: this.isErrorRetryable(error),
      timestamp: new Date().toISOString(),
      recoveryAction: this.getRecoveryAction(error)
    };
    
    // Add error diagnostics to context
    const enhancedContext: Record<string, any> = {
      ...context,
      errorMessage,
      errorType,
      category,
      severity,
      errorCount: this.errorCount[category]
    };
    
    // Include stack trace in development
    if (this.config.includeStackTraces) {
      enhancedContext.stackTrace = errorStack;
    }
    
    // Report error to monitoring system
    monitoredError.errorId = SentrySDK.captureException(error, enhancedContext);
    
    // Log in structured format for easier searching/filtering
    console.error(`[ErrorHandler] ${severity.toUpperCase()} ${category} error:`, {
      errorType,
      errorMessage,
      context: Object.keys(context),
      errorId: monitoredError.errorId,
      isRetryable: monitoredError.isRetryable
    });
    
    return monitoredError;
  }
  
  /**
   * Extract error information including type, message, stack trace,
   * category, and severity
   * @param error - The error to extract information from
   * @returns Extracted error information
   */
  private extractErrorInfo(error: unknown): {
    errorMessage: string;
    errorStack: string;
    errorType: string;
    category: ErrorCategory;
    severity: ErrorSeverity;
  } {
    let errorMessage = 'Unknown error';
    let errorStack = '';
    let errorType = 'Unknown';
    let category = ErrorCategory.UNKNOWN;
    let severity = ErrorSeverity.ERROR;
    
    if (error instanceof Error) {
      errorMessage = error.message;
      errorStack = error.stack || '';
      errorType = error.constructor.name;
      
      // Categorize and set severity based on error type
      if (error instanceof MemoryStorageError) {
        category = ErrorCategory.MEMORY;
        severity = ErrorSeverity.ERROR;
      } else if (error instanceof InputValidationError) {
        category = ErrorCategory.INPUT;
        severity = ErrorSeverity.WARNING;
      } else if (error instanceof ToolExecutionError) {
        category = ErrorCategory.TOOL;
        severity = ErrorSeverity.ERROR;
      } else if (error instanceof LLMAPIError) {
        category = ErrorCategory.LLM;
        severity = ErrorSeverity.ERROR;
      } else if (error instanceof ContextWindowExceededError) {
        category = ErrorCategory.CONTEXT;
        severity = ErrorSeverity.WARNING;
      } else if (error instanceof AIGovernanceError) {
        category = ErrorCategory.GOVERNANCE;
        severity = ErrorSeverity.WARNING;
      } else if (error instanceof BoltDIYError) {
        category = ErrorCategory.SYSTEM;
        severity = ErrorSeverity.ERROR;
      } else if (error.message.includes('network') || error.message.includes('connection') || error.message.includes('timeout')) {
        category = ErrorCategory.NETWORK;
        severity = ErrorSeverity.ERROR;
      }
    } else if (typeof error === 'string') {
      errorMessage = error;
      errorType = 'String';
      
      // Try to categorize string errors based on content
      if (error.toLowerCase().includes('network') || error.toLowerCase().includes('connection')) {
        category = ErrorCategory.NETWORK;
      } else if (error.toLowerCase().includes('input') || error.toLowerCase().includes('validation')) {
        category = ErrorCategory.INPUT;
      }
    } else {
      try {
        errorMessage = `Unknown error type: ${JSON.stringify(error)}`;
      } catch (e) {
        errorMessage = 'Unknown error (cannot stringify)';
      }
      errorType = typeof error;
    }
    
    return {
      errorMessage,
      errorStack,
      errorType,
      category,
      severity
    };
  }
  
  /**
   * Get user-facing message for an error
   * @param error - The error to get message for
   * @param errorType - The error type name
   * @returns User-friendly error message
   */
  private getUserFacingMessage(error: unknown, errorType: string): string {
    // Check for custom message based on error type
    if (this.config.customMessages && this.config.customMessages[errorType]) {
      return this.config.customMessages[errorType];
    }
    
    // Default user-facing messages by error type
    if (error instanceof MemoryStorageError) {
      return 'Unable to access conversation history. Please try again.';
    } else if (error instanceof InputValidationError) {
      return 'Invalid input. Please try a different request.';
    } else if (error instanceof ToolExecutionError) {
      return `Unable to complete the requested action using ${error.toolName}. Please try again or use a different approach.`;
    } else if (error instanceof LLMAPIError) {
      return 'Unable to generate a response right now. Please try again in a moment.';
    } else if (error instanceof ContextWindowExceededError) {
      return 'Your conversation is too long for me to process. Please start a new conversation or simplify your request.';
    } else if (error instanceof AIGovernanceError) {
      return 'This request could not be processed due to content guidelines.';
    } else if (error instanceof BoltDIYError) {
      return 'An error occurred with the BoltDIY system. Please try again.';
    } else if (typeof error === 'string' && error.toLowerCase().includes('network')) {
      return 'A network error occurred. Please check your connection and try again.';
    }
    
    // Generic fallback message
    return 'Something went wrong. Please try again later.';
  }
  
  /**
   * Get detailed internal information about an error
   * @param error - The error to get details for
   * @param errorMessage - The extracted error message
   * @param errorStack - The error stack trace
   * @returns Detailed error information for logging/debugging
   */
  private getInternalDetails(error: unknown, errorMessage: string, errorStack: string): string {
    // Add type-specific details if available
    if (error instanceof LLMAPIError && error.statusCode) {
      return `${errorMessage} (Status: ${error.statusCode})`;
    } else if (error instanceof ContextWindowExceededError) {
      return `${errorMessage} (Tokens: ${error.tokenCount}/${error.maxTokens})`;
    } else if (error instanceof AIGovernanceError) {
      return `${errorMessage} (Category: ${error.category})`;
    } else if (error instanceof ToolExecutionError) {
      return `${errorMessage} (Tool: ${error.toolName})`;
    }
    
    // Return basic error message with optional stack trace
    return this.config.includeStackTraces && errorStack
      ? `${errorMessage}\n\n${errorStack}`
      : errorMessage;
  }
  
  /**
   * Determine if an error can be retried
   * @param error - The error to check
   * @returns Whether the error is retryable
   */
  private isErrorRetryable(error: unknown): boolean {
    // Network errors are generally retryable
    if (
      error instanceof LLMAPIError ||
      (typeof error === 'string' && error.toLowerCase().includes('network')) ||
      (error instanceof Error && error.message.includes('network'))
    ) {
      return true;
    }
    
    // Context window errors can be "retried" by starting a new conversation
    if (error instanceof ContextWindowExceededError) {
      return true;
    }
    
    // System errors might be temporary
    if (error instanceof BoltDIYError) {
      return true;
    }
    
    // Input validation and governance errors are not retryable without changes
    if (
      error instanceof InputValidationError ||
      error instanceof AIGovernanceError
    ) {
      return false;
    }
    
    // Default to true for unknown errors
    return true;
  }
  
  /**
   * Get a suggested recovery action for an error
   * @param error - The error to get recovery action for
   * @returns Suggested recovery action or undefined
   */
  private getRecoveryAction(error: unknown): string | undefined {
    if (error instanceof ContextWindowExceededError) {
      return 'Start a new conversation or reduce the complexity of your request.';
    } else if (error instanceof LLMAPIError) {
      return 'Wait a moment and try again, or try a different request.';
    } else if (error instanceof InputValidationError) {
      return 'Check your input and try again with a valid request.';
    } else if (error instanceof MemoryStorageError) {
      return 'Refresh the page and try again.';
    } else if (error instanceof ToolExecutionError) {
      return `Try the request again without using ${(error as ToolExecutionError).toolName}.`;
    }
    
    return undefined;
  }
  
  /**
   * Log a message with a specific severity level
   * This can be used for important events that aren't errors
   * @param message - Message to log
   * @param severity - Severity level
   * @param context - Additional context
   * @returns Event ID from monitoring system
   */
  logMessage(message: string, severity: ErrorSeverity, context: Record<string, any> = {}): string | undefined {
    // Capture non-error message in monitoring system
    return SentrySDK.captureMessage(message, {
      ...context,
      level: severity,
      ...this.config.globalTags
    });
  }
}