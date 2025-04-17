/**
 * Sentry SDK Integration for Bolt DIY
 * 
 * This module provides a wrapper around the Sentry SDK for error tracking
 * and monitoring. It initializes Sentry with the appropriate configuration
 * and provides methods for capturing exceptions and messages.
 */

import * as Sentry from '@sentry/node';
import { RewriteFrames } from '@sentry/integrations';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { MemoryStorageError, InputValidationError, ToolExecutionError, LLMAPIError, ContextWindowExceededError } from '../errors';

// Environment variables for configuration
const SENTRY_DSN = process.env.SENTRY_DSN;
const NODE_ENV = process.env.NODE_ENV || 'development';
const APP_VERSION = process.env.npm_package_version || '0.0.0';

/**
 * Initialize Sentry with appropriate configuration
 */
export function initializeSentry() {
  // Only initialize if DSN is provided
  if (!SENTRY_DSN) {
    console.warn('[Sentry] No DSN provided, Sentry error tracking is disabled');
    return;
  }

  try {
    Sentry.init({
      dsn: SENTRY_DSN,
      environment: NODE_ENV,
      release: `bolt-diy@${APP_VERSION}`,
      integrations: [
        // Rewrite stack frames to get proper file paths
        new RewriteFrames({ root: process.cwd() }),
        // Add profiling integration for performance monitoring
        nodeProfilingIntegration(),
      ],
      // Set tracesSampleRate to 1.0 to capture 100% of transactions for monitoring
      // Adjust this in production for performance
      tracesSampleRate: NODE_ENV === 'production' ? 0.2 : 1.0,
      // Configure fingerprinting to group similar errors
      beforeSend(event) {
        // Group similar LLM API errors
        if (event.exception?.values?.some(ex => ex.type === 'LLMAPIError')) {
          event.fingerprint = ['llm-api-error'];
        }
        // Group context window errors
        if (event.exception?.values?.some(ex => ex.type === 'ContextWindowExceededError')) {
          event.fingerprint = ['context-window-exceeded'];
        }
        return event;
      }
    });

    console.info('[Sentry] Initialized successfully');
  } catch (error) {
    console.error('[Sentry] Initialization failed:', error);
  }
}

/**
 * Capture an exception with additional context
 * @param error - The error to capture
 * @param extra - Additional context for the error
 * @returns A unique error ID
 */
export function captureException(error: unknown, extra: Record<string, any> = {}): string | undefined {
  if (!SENTRY_DSN) {
    console.warn('[Sentry] Error tracking disabled, error not captured:', error);
    return undefined;
  }

  // Set error category tag based on error type
  const withTags: Record<string, string> = { };
  
  if (error instanceof MemoryStorageError) {
    withTags.error_category = 'memory_storage';
  } else if (error instanceof InputValidationError) {
    withTags.error_category = 'input_validation';
  } else if (error instanceof ToolExecutionError) {
    withTags.error_category = 'tool_execution';
    withTags.tool_name = error.toolName;
  } else if (error instanceof LLMAPIError) {
    withTags.error_category = 'llm_api';
    if (error.statusCode) {
      withTags.status_code = error.statusCode.toString();
    }
  } else if (error instanceof ContextWindowExceededError) {
    withTags.error_category = 'context_window';
    withTags.token_count = error.tokenCount.toString();
    withTags.max_tokens = error.maxTokens.toString();
  } else {
    withTags.error_category = 'unknown';
  }

  // Set scope with tags and extra context
  return Sentry.withScope(scope => {
    // Add tags for better filtering
    Object.entries(withTags).forEach(([key, value]) => {
      scope.setTag(key, value);
    });
    
    // Add extra context
    scope.setExtras(extra);
    
    // Capture the exception
    return Sentry.captureException(error);
  });
}

/**
 * Capture a message with additional context
 * @param message - The message to capture
 * @param extra - Additional context for the message
 * @returns A unique error ID
 */
export function captureMessage(message: string, extra: Record<string, any> = {}): string | undefined {
  if (!SENTRY_DSN) {
    console.warn('[Sentry] Error tracking disabled, message not captured:', message);
    return undefined;
  }

  return Sentry.withScope(scope => {
    // Add extra context
    scope.setExtras(extra);
    
    // Set level to warning by default for messages
    scope.setLevel('warning');
    
    // Capture the message
    return Sentry.captureMessage(message);
  });
}

// Export a simplified interface
export const SentrySDK = {
  initialize: initializeSentry,
  captureException,
  captureMessage
};