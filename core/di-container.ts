/**
 * Dependency Injection Container for Bolt DIY
 * 
 * This module sets up the dependency injection container to provide
 * all services required by the application in a loosely coupled way.
 */

import 'reflect-metadata';
import { container } from 'tsyringe';

// Core services
import { ErrorHandler } from './error-handler';
import { Agent } from './agent/agent';
import { InMemoryStateManager } from './agent/state-manager';
import { AdvancedMemoryManager } from './memory/memory-manager';
import { PromptManager } from './prompt/prompt-manager';
import { ToolExecutor } from './tools/tool-executor';
import { AIGovernance } from './ai/governance';

// Interfaces
import { 
  IStateManager, 
  IMemoryManager, 
  IPromptManager, 
  IToolExecutor 
} from './interfaces';

// Register services
export function setupDependencyInjection() {
  // Register error handler as singleton
  container.registerSingleton(ErrorHandler);
  
  // Register AI Governance singleton
  container.registerSingleton(AIGovernance);
  
  // Register managers
  container.register<IStateManager>('IStateManager', {
    useClass: InMemoryStateManager
  });
  
  container.register<IMemoryManager>('IMemoryManager', {
    useClass: AdvancedMemoryManager
  });
  
  container.register<IPromptManager>('IPromptManager', {
    useFactory: () => {
      return new PromptManager({
        systemPrompt: 'You are a helpful AI assistant that provides accurate and helpful information.',
        maxTokens: 4000
      });
    }
  });
  
  // Register tool executor with the state manager dependency
  container.register<IToolExecutor>('IToolExecutor', {
    useFactory: (dependencyContainer) => {
      const stateManager = dependencyContainer.resolve<IStateManager>('IStateManager');
      return new ToolExecutor(stateManager, []);
    }
  });
  
  // Register the main agent
  container.register(Agent, {
    useClass: Agent
  });
  
  return container;
}

// Export container setup function
export default setupDependencyInjection;