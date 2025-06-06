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
import { OpenAIService } from './ai/openai-service';
import { AnthropicService } from './ai/anthropic-service';
import { GeminiService } from './ai/gemini-service';
import { AIServiceConfig, BaseAIService } from './ai/base-ai-service';

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
  
  // Register AI services based on available API keys
  const openaiApiKey = process.env.OPENAI_API_KEY;
  const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
  const geminiApiKey = process.env.GEMINI_API_KEY;
  
  // Register all AI services and their configuration
  console.log('Registering AI services...');
  
  // Register OpenAI service
  container.registerSingleton(OpenAIService);
  
  // Register Anthropic service
  container.registerSingleton(AnthropicService);
  
  // Register Gemini service
  container.registerSingleton(GeminiService);
  
  // Default to OpenAI if the API key is available
  if (openaiApiKey) {
    console.log('OpenAI API key detected. Configuring OpenAI as primary service.');
    
    // Register OpenAI configuration
    const openaiConfig: AIServiceConfig = {
      apiKey: openaiApiKey,
      defaultModel: 'gpt-4o',
      defaultTemperature: 0.7
    };
    
    // Get the OpenAI service instance and configure it
    const openaiService = container.resolve(OpenAIService);
    openaiService.configure(openaiConfig);
    
    // Register as the default AI service
    container.register<BaseAIService>('BaseAIService', {
      useValue: openaiService
    });
  } 
  // Fall back to Anthropic if only that API key is available
  else if (anthropicApiKey) {
    console.log('Anthropic API key detected. Configuring Anthropic as primary service.');
    
    // Register Anthropic configuration
    const anthropicConfig: AIServiceConfig = {
      apiKey: anthropicApiKey,
      defaultModel: 'claude-3-7-sonnet-20250219',
      defaultTemperature: 0.7
    };
    
    // Get the Anthropic service instance and configure it
    const anthropicService = container.resolve(AnthropicService);
    anthropicService.configure(anthropicConfig);
    
    // Register as the default AI service
    container.register<BaseAIService>('BaseAIService', {
      useValue: anthropicService
    });
  }
  // If no API keys are available, use a warning
  else {
    console.warn('No AI service API keys found. Some features will be limited.');
    
    // Create a basic config anyway
    const fallbackConfig: AIServiceConfig = {
      defaultModel: 'gpt-4o',
      defaultTemperature: 0.7
    };
    
    // Configure OpenAI service as the default, even though it won't work
    const openaiService = container.resolve(OpenAIService);
    openaiService.configure(fallbackConfig);
    
    // Register as the default AI service
    container.register<BaseAIService>('BaseAIService', {
      useValue: openaiService
    });
  }
  
  // Configure additional services if their API keys are available
  if (openaiApiKey && anthropicApiKey) {
    console.log('Both OpenAI and Anthropic services are available');
    
    // Configure Anthropic service if not already configured
    if (container.resolve<BaseAIService>('BaseAIService') !== container.resolve(AnthropicService)) {
      const anthropicConfig: AIServiceConfig = {
        apiKey: anthropicApiKey,
        defaultModel: 'claude-3-7-sonnet-20250219',
        defaultTemperature: 0.7
      };
      
      // Get the Anthropic service instance and configure it
      const anthropicService = container.resolve(AnthropicService);
      anthropicService.configure(anthropicConfig);
    }
  }
  
  // Configure Gemini if its API key is available
  if (geminiApiKey) {
    console.log('Google Gemini service is available');
    
    // Configure Gemini service
    const geminiConfig: AIServiceConfig = {
      apiKey: geminiApiKey,
      defaultModel: 'gemini-1.5-pro',
      defaultTemperature: 0.7
    };
    
    // Get the Gemini service instance and configure it
    const geminiService = container.resolve(GeminiService);
    geminiService.configure(geminiConfig);
  }
  
  // ===== STATE MANAGEMENT =====
  
  // Register state manager as singleton to maintain consistent state
  container.register<IStateManager>('IStateManager', {
    useClass: InMemoryStateManager
  }, { lifecycle: Lifecycle.Singleton });
  
  // ===== MEMORY MANAGEMENT =====
  
  // Register memory manager with configuration
  container.register<IMemoryManager>('IMemoryManager', {
    useClass: AdvancedMemoryManager
  }, { lifecycle: Lifecycle.Singleton });
  
  // Configure the memory manager after registration
  container.resolve<IMemoryManager>('IMemoryManager');
  
  // ===== PROMPT MANAGEMENT =====
  
  // Register prompt manager
  container.register<IPromptManager>('IPromptManager', {
    useClass: PromptManager
  }, { lifecycle: Lifecycle.Singleton });
  
  // Configure the prompt manager after registration
  const promptManager = container.resolve<PromptManager>('IPromptManager');
  // Initialize with system prompt and token settings
  Object.assign(promptManager, {
    systemPrompt: SYSTEM_PROMPT,
    maxTokens: MAX_TOKENS
  });
  
  // ===== TOOL EXECUTION =====
  
  // Get the state manager instance
  const stateManager = container.resolve<IStateManager>('IStateManager');
  
  // Create a new tool executor instance manually
  const toolExecutor = new ToolExecutor(stateManager);
  
  // Register it as a singleton value
  container.registerInstance<IToolExecutor>('IToolExecutor', toolExecutor);
  
  // Initialize the tool executor with default tools
  defaultTools.forEach(tool => toolExecutor.registerTool(tool));
  
  // ===== MAIN AGENT =====
  
  // Create an Agent instance manually with all dependencies
  const agent = new Agent(
    stateManager,
    container.resolve<IMemoryManager>('IMemoryManager'),
    container.resolve<IPromptManager>('IPromptManager'),
    toolExecutor,
    container.resolve<ErrorHandler>(ErrorHandler)
  );
  
  // Register the Agent instance
  container.registerInstance('Agent', agent);
  
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

// Export container setup function
export default setupDependencyInjection;