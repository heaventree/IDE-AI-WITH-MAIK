/**
 * Bolt DIY Integration for MAIK IDE
 * 
 * This module provides integration between the Express API and the Bolt DIY core.
 * It utilizes a simple agent implementation without dependency injection
 * for easier integration.
 */

import { SimpleAgent, agent } from '../core/agent/simple-agent';
import { ErrorHandler } from '../core/error-handler';
import { IAIQueryRequest } from '@shared/api-types';

// Create an error handler instance
const errorHandler = new ErrorHandler();

// Session ID mapping for users/contexts
const sessionMap: Map<string, string> = new Map();

/**
 * Handle an AI query using the Bolt DIY agent
 * @param request - The AI query request
 * @returns Response from the agent
 */
export async function handleBoltQuery(request: IAIQueryRequest): Promise<string> {
  try {
    // Generate or retrieve a session ID for this context
    const sessionId = getOrCreateSessionId(request);
    
    // Process the query through the agent
    const response = await agent.handleRequest(request.query, sessionId);
    
    return response;
  } catch (error) {
    // Handle any errors that occur during processing
    const monitoredError = errorHandler.handle(error, { 
      request,
      timestamp: new Date().toISOString()
    });
    
    // Return a user-friendly error message
    return monitoredError.userFacingMessage;
  }
}

/**
 * Get or create a session ID for a request context
 * @param request - The AI query request
 * @returns Session ID for this context
 */
function getOrCreateSessionId(request: IAIQueryRequest): string {
  // Use project ID as the key if available, otherwise use a generic key
  const contextKey = request.context.projectId || 'default-context';
  
  // Check if we already have a session for this context
  if (!sessionMap.has(contextKey)) {
    // Create a new session ID
    sessionMap.set(contextKey, generateSessionId());
  }
  
  return sessionMap.get(contextKey)!;
}

/**
 * Generate a unique session ID
 * @returns Unique session ID
 */
function generateSessionId(): string {
  return 'session_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/**
 * Initialize the Bolt DIY agent
 * This should be called at application startup
 */
export function initializeBoltAgent(): void {
  // No special initialization needed for SimpleAgent
  console.log('Bolt DIY SimpleAgent initialized');
}