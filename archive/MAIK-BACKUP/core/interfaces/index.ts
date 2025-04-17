/**
 * Core Interface Definitions for Bolt DIY
 * 
 * This module defines the interfaces used by the core components
 * of the Bolt DIY system.
 */

/**
 * Defines the structure of an interaction between a user and the system
 */
export interface Interaction {
  /** User input text */
  input: string;
  
  /** System response text */
  response: string;
  
  /** Timestamp of the interaction */
  timestamp?: string;
  
  /** Optional metadata about the interaction */
  metadata?: Record<string, any>;
}

/**
 * Memory context containing conversation history and semantic memories
 */
export interface MemoryContext {
  /** Recent conversation history as a list of interactions */
  history: Interaction[];
  
  /** Relevant semantic memories as strings */
  memories: string[];
  
  /** Optional summary of previous conversations */
  summary?: string;
}

/**
 * Tool parameter specification
 */
export interface ToolParameter {
  description?: string;
  type?: string;
  required?: boolean;
  default?: any;
}

/**
 * Tool definition for function calling
 */
export interface Tool {
  /** Name of the tool */
  name: string;
  
  /** Description of what the tool does */
  description: string;
  
  /** Tool parameters specification */
  parameters?: Record<string, ToolParameter>;
  
  /** Function to execute the tool */
  execute?: (params: Record<string, any>) => Promise<any>;
}

/**
 * Application state maintained across interactions
 */
export interface ApplicationState {
  /** User preferences */
  preferences?: Record<string, any>;
  
  /** Current conversation topic */
  currentTopic?: string;
  
  /** Most recent system response */
  lastResponse?: string;
  
  /** Programming language for code-related responses */
  programmingLanguage?: string;
  
  /** Project context for code generation */
  projectContext?: string;
  
  /** Available tools that can be called */
  availableTools?: Tool[];
  
  /** Last function/tool call made */
  lastFunctionCall?: string;
  
  /** Custom state variables */
  [key: string]: any;
}

/**
 * Interface for state management
 */
export interface IStateManager {
  /**
   * Get current state for a session
   * @param sessionId - Unique session identifier
   * @returns Current application state
   */
  getState(sessionId: string): Promise<ApplicationState>;
  
  /**
   * Update state for a session
   * @param sessionId - Unique session identifier
   * @param updates - State changes to apply
   */
  updateState(sessionId: string, updates: Partial<ApplicationState>): Promise<void>;
}

/**
 * Interface for memory management
 */
export interface IMemoryManager {
  /**
   * Get conversation context for the current session
   * @param sessionId - Unique session identifier
   * @param query - Current user query for relevance calculation
   * @returns Context information including history and relevant memories
   */
  getContext(sessionId: string, query: string): Promise<MemoryContext>;
  
  /**
   * Store a new interaction in the memory
   * @param sessionId - Unique session identifier
   * @param interaction - The interaction to store
   */
  storeInteraction(sessionId: string, interaction: Interaction): Promise<void>;
  
  /**
   * Clear all memory for a session
   * @param sessionId - Unique session identifier
   */
  clearMemory(sessionId: string): Promise<void>;
  
  /**
   * Export all memory data for a session (for persistence)
   * @param sessionId - Unique session identifier
   * @returns Exportable memory data
   */
  exportMemory(sessionId: string): any;
  
  /**
   * Import memory data for a session (for persistence restoration)
   * @param sessionId - Unique session identifier
   * @param data - Exported memory data
   */
  importMemory(sessionId: string, data: any): void;
  
  /**
   * Optimize context to fit within token limit
   * @param context - Memory context to optimize
   * @param maxTokens - Maximum number of tokens allowed
   * @returns Optimized context
   */
  optimizeContext(context: MemoryContext, maxTokens: number): MemoryContext;
  
  /**
   * Calculate token estimate for context
   * @param context - Memory context
   * @returns Estimated token count
   */
  estimateTokenCount(context: MemoryContext): number;
}

/**
 * Interface for prompt management
 */
export interface IPromptManager {
  /**
   * Construct an optimized prompt for the LLM
   * @param userInput - Current user input
   * @param context - Memory context from memory manager
   * @param state - Current application state
   * @returns Constructed prompt string
   */
  constructPrompt(userInput: string, context: MemoryContext, state: ApplicationState): Promise<string>;
  
  /**
   * Set the system prompt
   * @param systemPrompt - New system prompt
   */
  setSystemPrompt(systemPrompt: string): void;
  
  /**
   * Set the maximum tokens
   * @param maxTokens - New maximum tokens
   */
  setMaxTokens(maxTokens: number): void;
  
  /**
   * Estimate token count for a prompt
   * @param prompt - Prompt to estimate tokens for
   * @returns Estimated token count
   */
  estimateTokens(prompt: string): number;
  
  /**
   * Check if a prompt will fit within token limits
   * @param prompt - Prompt to check
   * @returns Whether the prompt fits within token limits
   */
  willFitInContext(prompt: string): boolean;
}

/**
 * Interface for tool execution
 */
export interface IToolExecutor {
  /**
   * Process LLM response and execute any tools
   * @param llmResponse - Raw response from LLM
   * @param sessionId - Session identifier for state context
   * @returns Final processed response after tool execution
   */
  processResponse(llmResponse: string, sessionId: string): Promise<string>;
}