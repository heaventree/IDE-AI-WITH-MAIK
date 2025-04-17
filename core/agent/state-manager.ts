/**
 * State Manager for Bolt DIY
 * 
 * This module provides state management functionality to maintain
 * application state across user interactions within a session.
 */

import { IStateManager, ApplicationState } from '../interfaces';
import { MemoryStorageError } from '../errors';

/**
 * In-memory implementation of state manager
 */
export class InMemoryStateManager implements IStateManager {
  private states: Map<string, ApplicationState> = new Map();
  
  /**
   * Get current state for a session
   * @param sessionId - Unique session identifier
   * @returns Current application state
   */
  async getState(sessionId: string): Promise<ApplicationState> {
    try {
      // Get existing state or create a new empty state
      return this.states.get(sessionId) || {};
    } catch (error) {
      console.error(`Failed to get state for session ${sessionId}:`, error);
      throw new MemoryStorageError(`Failed to retrieve state: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Update state for a session
   * @param sessionId - Unique session identifier
   * @param updates - State changes to apply
   */
  async updateState(sessionId: string, updates: Partial<ApplicationState>): Promise<void> {
    try {
      // Get current state or initialize empty object
      const currentState = this.states.get(sessionId) || {};
      
      // Apply updates to create new state
      const newState = {
        ...currentState,
        ...updates
      };
      
      // Store updated state
      this.states.set(sessionId, newState);
    } catch (error) {
      console.error(`Failed to update state for session ${sessionId}:`, error);
      throw new MemoryStorageError(`Failed to update state: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}