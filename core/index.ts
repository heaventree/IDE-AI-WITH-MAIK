/**
 * Core Module for Bolt DIY
 * 
 * This module exports all core components and provides a simple API
 * for initializing and using the system.
 */

// Export all interfaces
export * from './interfaces';

// Export error types
export * from './errors';

// Export error handler
export * from './error-handler';

// Export monitoring tools
export * from './monitoring';

// Export agent
export { Agent } from './agent/agent';

// Export memory manager
export { AdvancedMemoryManager } from './memory/memory-manager';

// Export prompt manager
export { PromptManager } from './prompt/prompt-manager';

// Export tool executor
export { ToolExecutor, type Tool } from './tools/tool-executor';

// Export DI container setup
export { setupDependencyInjection } from './di-container';

// Export state manager
export { InMemoryStateManager } from './agent/state-manager';

/**
 * Initialize the Bolt DIY system
 * @returns Initialized Agent instance
 */
import { container } from 'tsyringe';
import { setupDependencyInjection } from './di-container';
import { SentrySDK } from './monitoring';
import { Agent } from './agent/agent';

export function initializeSystem() {
  // Initialize Sentry for error tracking
  SentrySDK.initialize();
  
  // Setup dependency injection
  setupDependencyInjection();
  
  // Resolve and return the agent
  return container.resolve(Agent);
}