/**
 * Core Interfaces for Bolt DIY System
 * 
 * This file contains the interface definitions for the core components
 * of the Bolt DIY system. These interfaces define the contracts that
 * implementations must adhere to, enabling dependency injection and
 * modular design.
 */

/**
 * Represents the session context with history and memories
 */
export interface MemoryContext {
  /** List of previous interaction turns */
  history: Interaction[];
  
  /** Retrieved long-term memories relevant to current context */
  memories: string[];
  
  /** Optional summary of older conversation */
  summary?: string;
}

/**
 * Represents a single interaction between user and system
 */
export interface Interaction {
  /** User input text */
  input: string;
  
  /** System response text */
  response: string;
  
  /** Timestamp of the interaction */
  timestamp?: string;
}

/**
 * Memory Manager Interface
 * Responsible for storing and retrieving conversation history and context
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
 * Application state interface
 */
export interface ApplicationState {
  lastResponse?: string;
  [key: string]: any;
}

/**
 * State Manager Interface
 * Responsible for maintaining application state across interactions
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
 * Prompt Manager Interface
 * Responsible for constructing optimized prompts for LLM
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
 * Tool Execution Interface
 * Responsible for parsing LLM responses and executing tools
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