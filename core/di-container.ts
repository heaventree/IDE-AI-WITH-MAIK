/**
 * Dependency Injection Container for Bolt DIY
 * 
 * This module sets up the dependency injection container to provide
 * all services required by the application in a loosely coupled way.
 * 
 * The container is configured with appropriate scopes for each service:
 * - Singleton: Services that should be instantiated only once
 * - Transient: Services that should be instantiated each time they are requested
 * - Scoped: Services that should be instantiated once per scope (session)
 */

import 'reflect-metadata';
import { container, DependencyContainer, Lifecycle } from 'tsyringe';

// Core services
import { ErrorHandler } from './error-handler';
import { Agent } from './agent/agent';
import { InMemoryStateManager } from './agent/state-manager';
import { AdvancedMemoryManager } from './memory/memory-manager';
import { PromptManager } from './prompt/prompt-manager';
import { ToolExecutor, Tool } from './tools/tool-executor';
import { AIGovernance } from './ai/governance';

// Interfaces
import { 
  IStateManager, 
  IMemoryManager, 
  IPromptManager, 
  IToolExecutor,
  ApplicationState
} from './interfaces';

// Environment variables
const SYSTEM_PROMPT = process.env.SYSTEM_PROMPT || 
  'You are a helpful AI assistant that provides accurate, helpful information, and prioritizes user success.';
const MAX_TOKENS = parseInt(process.env.MAX_TOKENS || '4000', 10);
const MEMORY_MAX_SHORT_TERM_TURNS = parseInt(process.env.MEMORY_MAX_SHORT_TERM_TURNS || '10', 10);

/**
 * Default tools for the system
 * These will be registered with the ToolExecutor
 */
const defaultTools: Tool[] = [
  // Example tool - can be expanded as needed
  {
    name: 'getCurrentTime',
    description: 'Get the current server time',
    execute: async () => {
      return new Date().toISOString();
    }
  }
];

/**
 * Setup the dependency injection container with all required services
 * @returns Configured dependency container
 */
export function setupDependencyInjection() {
  // Clear any previous registrations for clean setup
  container.clearInstances();
  
  // ===== CORE INFRASTRUCTURE COMPONENTS =====
  
  // Register monitoring & error handling components as singletons
  // These should be available throughout the application lifecycle
  container.registerSingleton(ErrorHandler);
  
  // Register AI Governance singleton for consistent governance policies
  container.registerSingleton(AIGovernance);
  initializeAIGovernance(container);
  
  // ===== STATE MANAGEMENT =====
  
  // Register state manager as singleton to maintain consistent state
  container.register<IStateManager>('IStateManager', {
    useClass: InMemoryStateManager
  }, { lifecycle: Lifecycle.Singleton });
  
  // ===== MEMORY MANAGEMENT =====
  
  // Register memory manager with configuration
  container.register<IMemoryManager>('IMemoryManager', {
    useFactory: () => {
      return new AdvancedMemoryManager({
        maxShortTermTurns: MEMORY_MAX_SHORT_TERM_TURNS
      });
    }
  }, { lifecycle: Lifecycle.Singleton });
  
  // ===== PROMPT MANAGEMENT =====
  
  // Register prompt manager with system prompt configuration
  container.register<IPromptManager>('IPromptManager', {
    useFactory: () => {
      return new PromptManager({
        systemPrompt: SYSTEM_PROMPT,
        maxTokens: MAX_TOKENS,
        // Custom token estimator could be added here if needed
      });
    }
  }, { lifecycle: Lifecycle.Singleton });
  
  // ===== TOOL EXECUTION =====
  
  // Register tool executor with dependencies and default tools
  container.register<IToolExecutor>('IToolExecutor', {
    useFactory: (dependencyContainer) => {
      const stateManager = dependencyContainer.resolve<IStateManager>('IStateManager');
      return new ToolExecutor(stateManager, defaultTools);
    }
  }, { lifecycle: Lifecycle.Singleton });
  
  // ===== MAIN AGENT =====
  
  // Register the main agent with all dependencies injected automatically
  container.register(Agent, {
    useClass: Agent
  }, { lifecycle: Lifecycle.Singleton });
  
  return container;
}

/**
 * Initialize AI governance with default sensitive terms and model registrations
 * @param container - The dependency container
 */
function initializeAIGovernance(container: DependencyContainer) {
  const governance = container.resolve(AIGovernance);
  
  // Register default sensitive terms for bias detection
  governance.addSensitiveTerms([
    'bias', 'discrimination', 'stereotyping', 'prejudice',
    'racist', 'sexist', 'offensive', 'inappropriate'
  ]);
  
  // Register default AI model
  governance.registerModel('default-model', {
    name: 'Bolt DIY Default Model',
    version: '1.0.0',
    provider: 'Bolt DIY',
    type: 'text-generation',
    description: 'Default language model for Bolt DIY',
    limitations: {
      contextWindow: 'Limited conversation history retention',
      hallucinations: 'May occasionally generate incorrect information'
    },
    biases: {
      recency: 'Favors more recent information in training data'
    },
    useCases: [
      'general question answering',
      'creative writing',
      'programming assistance'
    ],
    ethicalGuidelines: [
      'Do not generate harmful content',
      'Respect user privacy',
      'Be transparent about limitations'
    ]
  });
}

/**
 * Get an initialized instance of the Agent class
 * This is a convenience function for code that doesn't want to 
 * interact with the DI container directly
 * @returns Initialized Agent instance
 */
export function getAgent(): Agent {
  return container.resolve(Agent);
}

// Export container setup function
export default setupDependencyInjection;