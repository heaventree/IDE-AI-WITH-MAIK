/**
 * Memory Manager for Bolt DIY
 * 
 * This module provides conversation memory management with support for
 * both short-term recent history and longer-term semantic memory.
 */

import { IMemoryManager, MemoryContext, Interaction } from '../interfaces';
import { MemoryStorageError } from '../errors';

/**
 * Implementation of Memory Manager with in-memory storage
 */
export class AdvancedMemoryManager implements IMemoryManager {
  // Short-term memory storage (recent turns)
  private shortTermMemory: Map<string, Interaction[]> = new Map();
  
  // Long-term memory storage (semantic memories)
  private longTermMemory: Map<string, string[]> = new Map();
  
  // Configuration
  private maxShortTermTurns: number;
  
  /**
   * Create a new memory manager
   * @param options - Configuration options
   */
  constructor(options: {
    maxShortTermTurns?: number;
  } = {}) {
    this.maxShortTermTurns = options.maxShortTermTurns || 10;
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
      
      // In a real implementation, we would perform vector similarity search
      // based on the query to retrieve relevant long-term memories
      const memories = this.retrieveRelevantMemories(sessionId, query);
      
      return {
        history,
        memories
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
      const trimmedHistory = updatedHistory.slice(-this.maxShortTermTurns);
      
      // Update short-term memory
      this.shortTermMemory.set(sessionId, trimmedHistory);
      
      // In a real implementation, we would also store the interaction
      // in long-term memory with vector embeddings for retrieval
    } catch (error) {
      console.error(`Failed to store interaction for session ${sessionId}:`, error);
      throw new MemoryStorageError(`Failed to store interaction: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Retrieve memories relevant to the current query
   * @param sessionId - Unique session identifier
   * @param query - Current user query
   * @returns Array of relevant memories as strings
   */
  private retrieveRelevantMemories(sessionId: string, query: string): string[] {
    // Get existing memories or initialize empty array
    const memories = this.longTermMemory.get(sessionId) || [];
    
    // In a real implementation, we would:
    // 1. Generate vector embedding for the query
    // 2. Perform similarity search against stored memory embeddings
    // 3. Return top N most relevant memories
    
    // For this simplified implementation, we just return all memories
    return memories;
  }
}