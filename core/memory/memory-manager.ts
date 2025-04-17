/**
 * Memory Manager for Bolt DIY
 * 
 * This module provides advanced conversation memory management with support for
 * both short-term recent history and longer-term semantic memory. It addresses
 * critical issues with context window limitations and memory retention.
 * 
 * Key features:
 * - Hybrid memory approach (short-term + long-term semantic memory)
 * - Context window optimization
 * - Conversation summarization
 * - Relevance-based memory retrieval
 * - Session persistence
 */

import { 
  IMemoryManager, 
  MemoryContext, 
  Interaction, 
  ApplicationState 
} from '../interfaces';
import { MemoryStorageError, ContextWindowExceededError } from '../errors';

/**
 * Represents a weighted memory entry that includes relevance scoring
 */
interface MemoryEntry {
  /** Content of the memory */
  content: string;
  
  /** Timestamp when the memory was created */
  timestamp: string;
  
  /** Tags or categories for the memory */
  tags: string[];
  
  /** Source of the memory (e.g., "conversation", "document") */
  source: string;
  
  /** Importance score (higher = more important) */
  importance: number;
  
  /** Last accessed timestamp for LRU calculation */
  lastAccessed?: string;
  
  /** How many times this memory has been accessed */
  accessCount: number;
}

/**
 * Configuration options for the memory manager
 */
interface MemoryManagerOptions {
  /** Maximum number of recent interactions to keep in short-term memory */
  maxShortTermTurns?: number;
  
  /** Maximum number of long-term memories to keep per session */
  maxLongTermMemories?: number;
  
  /** Maximum number of relevant memories to return in context */
  maxRelevantMemories?: number;
  
  /** Whether to generate summaries for longer conversations */
  enableSummarization?: boolean;
  
  /** Number of turns after which to generate a summary */
  summarizeAfterTurns?: number;
}

/**
 * Advanced implementation of Memory Manager with hybrid storage approach
 * Combines short-term and long-term memory with optimization strategies
 */
export class AdvancedMemoryManager implements IMemoryManager {
  // Short-term memory storage (recent turns) - quick access
  private shortTermMemory: Map<string, Interaction[]> = new Map();
  
  // Long-term memory storage (semantic memories) - for retrieval by similarity
  private longTermMemory: Map<string, MemoryEntry[]> = new Map();
  
  // Conversation summaries to reduce context size
  private summaries: Map<string, string> = new Map();
  
  // Configuration
  private options: Required<MemoryManagerOptions>;
  
  // Default options
  private static readonly DEFAULT_OPTIONS: Required<MemoryManagerOptions> = {
    maxShortTermTurns: 10,
    maxLongTermMemories: 100,
    maxRelevantMemories: 5,
    enableSummarization: true,
    summarizeAfterTurns: 15
  };
  
  /**
   * Create a new advanced memory manager
   * @param options - Configuration options
   */
  constructor(options: MemoryManagerOptions = {}) {
    this.options = {
      ...AdvancedMemoryManager.DEFAULT_OPTIONS,
      ...options
    };
  }
  
  /**
   * Get conversation context for the current session
   * @param sessionId - Unique session identifier
   * @param query - Current user query for relevance calculation
   * @returns Context information including history and relevant memories
   */
  async getContext(sessionId: string, query: string): Promise<MemoryContext> {
    try {
      // Get short-term history or initialize empty array
      const history = this.shortTermMemory.get(sessionId) || [];
      
      // Retrieve relevant memories from long-term storage
      const relevantMemories = this.retrieveRelevantMemories(sessionId, query);
      const memories = relevantMemories.map(memory => memory.content);
      
      // Get or generate summary if available
      const summary = this.getSummary(sessionId);
      
      // Update access counters for retrieved memories
      this.updateMemoryAccessStats(sessionId, relevantMemories);
      
      return {
        history,
        memories,
        summary
      };
    } catch (error) {
      console.error(`Failed to get context for session ${sessionId}:`, error);
      throw new MemoryStorageError(`Failed to retrieve memory context: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Store a new interaction in the memory
   * @param sessionId - Unique session identifier
   * @param interaction - The interaction to store
   */
  async storeInteraction(sessionId: string, interaction: Interaction): Promise<void> {
    try {
      // Ensure timestamp is set
      const timestampedInteraction = {
        ...interaction,
        timestamp: interaction.timestamp || new Date().toISOString()
      };
      
      // Get existing history or initialize empty array
      const history = this.shortTermMemory.get(sessionId) || [];
      
      // Add new interaction to history
      const updatedHistory = [...history, timestampedInteraction];
      
      // Limit history size to max turns
      const trimmedHistory = updatedHistory.slice(-this.options.maxShortTermTurns);
      
      // Update short-term memory
      this.shortTermMemory.set(sessionId, trimmedHistory);
      
      // Store in long-term memory
      this.storeInLongTermMemory(sessionId, timestampedInteraction);
      
      // Check if we need to generate a new summary
      if (this.options.enableSummarization && 
          updatedHistory.length >= this.options.summarizeAfterTurns && 
          updatedHistory.length % this.options.summarizeAfterTurns === 0) {
        await this.generateSummary(sessionId, updatedHistory);
      }
    } catch (error) {
      console.error(`Failed to store interaction for session ${sessionId}:`, error);
      throw new MemoryStorageError(`Failed to store interaction: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Clear all memory for a session
   * @param sessionId - Unique session identifier
   */
  async clearMemory(sessionId: string): Promise<void> {
    try {
      this.shortTermMemory.delete(sessionId);
      this.longTermMemory.delete(sessionId);
      this.summaries.delete(sessionId);
      console.info(`Cleared memory for session ${sessionId}`);
    } catch (error) {
      console.error(`Failed to clear memory for session ${sessionId}:`, error);
      throw new MemoryStorageError(`Failed to clear memory: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Export all memory data for a session (for persistence)
   * @param sessionId - Unique session identifier
   * @returns Exportable memory data
   */
  exportMemory(sessionId: string): {
    shortTerm: Interaction[],
    longTerm: MemoryEntry[],
    summary?: string
  } {
    return {
      shortTerm: this.shortTermMemory.get(sessionId) || [],
      longTerm: this.longTermMemory.get(sessionId) || [],
      summary: this.summaries.get(sessionId)
    };
  }
  
  /**
   * Import memory data for a session (for persistence restoration)
   * @param sessionId - Unique session identifier
   * @param data - Exported memory data
   */
  importMemory(sessionId: string, data: {
    shortTerm: Interaction[],
    longTerm: MemoryEntry[],
    summary?: string
  }): void {
    if (data.shortTerm && Array.isArray(data.shortTerm)) {
      this.shortTermMemory.set(sessionId, data.shortTerm);
    }
    
    if (data.longTerm && Array.isArray(data.longTerm)) {
      this.longTermMemory.set(sessionId, data.longTerm);
    }
    
    if (data.summary) {
      this.summaries.set(sessionId, data.summary);
    }
    
    console.info(`Imported memory for session ${sessionId}`);
  }

  /**
   * Store interaction in long-term memory with metadata
   * @param sessionId - Unique session identifier
   * @param interaction - Interaction to store
   * @private
   */
  private storeInLongTermMemory(sessionId: string, interaction: Interaction): void {
    // Get existing memories or initialize empty array
    const memories = this.longTermMemory.get(sessionId) || [];
    
    // Extract key information from the interaction
    const userInput = interaction.input;
    const response = interaction.response;
    
    // Create memory entries for both input and response
    const userMemory: MemoryEntry = {
      content: `User: ${userInput}`,
      timestamp: interaction.timestamp || new Date().toISOString(),
      tags: ['user_input'],
      source: 'conversation',
      importance: 1.0,  // Default importance
      accessCount: 0
    };
    
    const responseMemory: MemoryEntry = {
      content: `Assistant: ${response}`,
      timestamp: interaction.timestamp || new Date().toISOString(),
      tags: ['assistant_response'],
      source: 'conversation',
      importance: 1.0,  // Default importance
      accessCount: 0
    };
    
    // Analyze content to adjust importance (simple heuristic)
    if (userInput.length > 100) {
      userMemory.importance += 0.2;  // Longer inputs might be more important
    }
    
    if (userInput.includes('?')) {
      userMemory.importance += 0.3;  // Questions are important
      responseMemory.importance += 0.3;  // And their answers
    }
    
    if (response.length > 200) {
      responseMemory.importance += 0.2;  // Detailed responses might contain more info
    }
    
    // Add new memories
    const updatedMemories = [...memories, userMemory, responseMemory];
    
    // Only keep the most important memories if we exceed the limit
    if (updatedMemories.length > this.options.maxLongTermMemories) {
      updatedMemories.sort((a, b) => b.importance - a.importance);
      updatedMemories.splice(this.options.maxLongTermMemories);
    }
    
    // Update long-term memory
    this.longTermMemory.set(sessionId, updatedMemories);
  }
  
  /**
   * Retrieve memories relevant to the current query
   * @param sessionId - Unique session identifier
   * @param query - Current user query
   * @returns Array of relevant memory entries
   * @private
   */
  private retrieveRelevantMemories(sessionId: string, query: string): MemoryEntry[] {
    // Get existing memories or initialize empty array
    const memories = this.longTermMemory.get(sessionId) || [];
    
    if (memories.length === 0) {
      return [];
    }
    
    // In a real implementation, we would:
    // 1. Generate vector embedding for the query
    // 2. Perform similarity search against stored memory embeddings
    
    // For this implementation, we use a simple keyword-based relevance scoring
    const queryWords = query.toLowerCase().split(/\s+/);
    const scoredMemories = memories.map(memory => {
      // Create a copy of the memory with a relevance score
      const scoredMemory = { ...memory, relevanceScore: 0 };
      
      // Calculate relevance score based on keyword matches
      const content = memory.content.toLowerCase();
      for (const word of queryWords) {
        if (word.length > 3 && content.includes(word)) {  // Only consider words longer than 3 chars
          scoredMemory.relevanceScore += 1;
        }
      }
      
      // Factor in memory importance and recency
      scoredMemory.relevanceScore *= memory.importance;
      
      // Factor in access count (more accessed memories might be more relevant)
      scoredMemory.relevanceScore += Math.min(memory.accessCount * 0.1, 0.5);
      
      return scoredMemory;
    });
    
    // Sort by relevance score (descending)
    scoredMemories.sort((a, b) => 
      (b.relevanceScore as number) - (a.relevanceScore as number)
    );
    
    // Return only the most relevant memories
    return scoredMemories
      .slice(0, this.options.maxRelevantMemories)
      .map(({ relevanceScore, ...memory }) => memory);  // Remove the added score
  }
  
  /**
   * Update access statistics for retrieved memories
   * @param sessionId - Unique session identifier
   * @param retrievedMemories - Memories that were retrieved
   * @private
   */
  private updateMemoryAccessStats(sessionId: string, retrievedMemories: MemoryEntry[]): void {
    if (retrievedMemories.length === 0) {
      return;
    }
    
    // Get all memories
    const allMemories = this.longTermMemory.get(sessionId) || [];
    if (allMemories.length === 0) {
      return;
    }
    
    // Update access timestamp and count for retrieved memories
    const now = new Date().toISOString();
    const retrievedContents = new Set(retrievedMemories.map(m => m.content));
    
    const updatedMemories = allMemories.map(memory => {
      if (retrievedContents.has(memory.content)) {
        return {
          ...memory,
          lastAccessed: now,
          accessCount: (memory.accessCount || 0) + 1
        };
      }
      return memory;
    });
    
    // Update memory store
    this.longTermMemory.set(sessionId, updatedMemories);
  }
  
  /**
   * Get summary for the conversation
   * @param sessionId - Unique session identifier
   * @returns Summary string or undefined
   * @private
   */
  private getSummary(sessionId: string): string | undefined {
    return this.summaries.get(sessionId);
  }
  
  /**
   * Generate a summary for the conversation
   * @param sessionId - Unique session identifier
   * @param interactions - Interactions to summarize
   * @private
   */
  private async generateSummary(sessionId: string, interactions: Interaction[]): Promise<void> {
    // Get a window of interactions to summarize (avoid summarizing everything)
    const interactionsToSummarize = interactions.slice(-this.options.summarizeAfterTurns);
    
    try {
      // In a real implementation, we would use LLM to generate a summary
      // For this demo, we'll create a simple mock summary
      const lastInteraction = interactionsToSummarize[interactionsToSummarize.length - 1];
      const mockSummary = `Conversation included ${interactionsToSummarize.length} turns. Most recent topic: ${lastInteraction.input.substring(0, 30)}...`;
      
      // Store the summary
      this.summaries.set(sessionId, mockSummary);
      
      console.info(`Generated summary for session ${sessionId}`);
    } catch (error) {
      console.warn(`Failed to generate summary for session ${sessionId}:`, error);
      // Don't throw error for summary generation failures - non-critical
    }
  }
  
  /**
   * Calculate token estimate for context
   * @param context - Memory context
   * @returns Estimated token count
   */
  estimateTokenCount(context: MemoryContext): number {
    // Simple estimation (approximately 4 chars per token)
    let totalChars = 0;
    
    // Count history chars
    totalChars += context.history.reduce((sum, interaction) => {
      return sum + interaction.input.length + interaction.response.length;
    }, 0);
    
    // Count memory chars
    totalChars += context.memories.reduce((sum, memory) => {
      return sum + memory.length;
    }, 0);
    
    // Count summary chars
    if (context.summary) {
      totalChars += context.summary.length;
    }
    
    // Estimate tokens (4 chars ~= 1 token as a rough estimate)
    return Math.ceil(totalChars / 4);
  }
  
  /**
   * Optimize context to fit within token limit
   * @param context - Memory context to optimize
   * @param maxTokens - Maximum number of tokens allowed
   * @returns Optimized context
   */
  optimizeContext(context: MemoryContext, maxTokens: number): MemoryContext {
    // First check if we're already under the limit
    const estimatedTokens = this.estimateTokenCount(context);
    if (estimatedTokens <= maxTokens) {
      return context;
    }
    
    // We need to reduce the context size
    const optimizedContext: MemoryContext = {
      history: [...context.history],
      memories: [...context.memories],
      summary: context.summary
    };
    
    // First try removing older messages from history (keep most recent)
    while (optimizedContext.history.length > 2 && 
           this.estimateTokenCount(optimizedContext) > maxTokens) {
      optimizedContext.history.shift();  // Remove oldest message
    }
    
    // Next reduce memories if still too large
    while (optimizedContext.memories.length > 0 && 
           this.estimateTokenCount(optimizedContext) > maxTokens) {
      optimizedContext.memories.pop();  // Remove least relevant memory
    }
    
    // If still too large, remove summary
    if (this.estimateTokenCount(optimizedContext) > maxTokens) {
      optimizedContext.summary = undefined;
    }
    
    // If still too large, keep only essential history (last interaction)
    if (this.estimateTokenCount(optimizedContext) > maxTokens && 
        optimizedContext.history.length > 0) {
      optimizedContext.history = [optimizedContext.history[optimizedContext.history.length - 1]];
    }
    
    // If we still exceed the token limit, throw an error
    const finalTokenCount = this.estimateTokenCount(optimizedContext);
    if (finalTokenCount > maxTokens) {
      throw new ContextWindowExceededError(
        'Context is too large even after optimization',
        finalTokenCount,
        maxTokens
      );
    }
    
    return optimizedContext;
  }
}