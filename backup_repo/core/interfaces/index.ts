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
 * Application state maintained across interactions
 */
export interface ApplicationState {
  /** User preferences */
  preferences?: Record<string, any>;
  
  /** Current conversation topic */
  currentTopic?: string;
  
  /** Most recent system response */
  lastResponse?: string;
  
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