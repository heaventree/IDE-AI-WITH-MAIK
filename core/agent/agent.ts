/**
 * Agent class for Bolt DIY
 * 
 * This module provides the core Agent class that orchestrates the processing
 * of user requests through the various components of the system.
 */

import { injectable, inject } from 'tsyringe';
import { 
  IStateManager, 
  IMemoryManager, 
  IPromptManager, 
  IToolExecutor 
} from '../interfaces';
import { ErrorHandler, MonitoredError } from '../error-handler';
import { InputValidationError, LLMAPIError } from '../errors';
import { PerformanceMonitor } from '../monitoring';

/**
 * Core Agent class that orchestrates the handling of user requests
 */
@injectable()
export class Agent {
  /**
   * Create a new Agent with all dependencies injected
   * @param stateManager - For managing application state
   * @param memoryManager - For managing conversation memory
   * @param promptManager - For constructing LLM prompts
   * @param toolExecutor - For executing tools
   * @param errorHandler - For consistent error handling
   */
  constructor(
    private stateManager: IStateManager,
    private memoryManager: IMemoryManager,
    private promptManager: IPromptManager,
    private toolExecutor: IToolExecutor,
    private errorHandler: ErrorHandler
  ) {}

  /**
   * Handle a user request
   * @param userInput - User input text
   * @param sessionId - Unique session identifier
   * @returns Response to the user
   */
  async handleRequest(userInput: string, sessionId: string): Promise<string> {
    // Start performance monitoring
    const metrics = PerformanceMonitor.startRequest(sessionId);
    let response: string | MonitoredError;
    
    try {
      // 1. Validate Input
      if (!userInput || typeof userInput !== 'string' || userInput.trim().length === 0) {
        throw new InputValidationError('Invalid user input received: Input is empty.');
      }

      // 2. Get State/Context
      const currentState = await this.stateManager.getState(sessionId);
      const context = await this.memoryManager.getContext(sessionId, userInput);

      // 3. Build Optimized Prompt
      const prompt = await this.promptManager.constructPrompt(userInput, context, currentState);

      // 4. Execute LLM Call
      const llmResponse = await this.callLLM(prompt);

      // 5. Process Response / Execute Tools
      const finalResponse = await this.toolExecutor.processResponse(llmResponse, sessionId);

      // 6. Update State/Memory
      await this.stateManager.updateState(sessionId, { lastResponse: finalResponse });
      await this.memoryManager.storeInteraction(sessionId, { input: userInput, response: finalResponse });

      response = finalResponse; // Assign successful response
      return finalResponse;
    } catch (error) {
      // Update metrics for error tracking
      metrics.errorOccurred = true;
      metrics.errorType = error.constructor.name;
      
      // Handle error with centralized handler
      const monitoredError = this.errorHandler.handle(error, { userInput, sessionId });
      response = monitoredError;
      
      // Return user-friendly error message
      return monitoredError.userFacingMessage;
    } finally {
      // Complete performance monitoring
      PerformanceMonitor.endRequest(metrics, response);
    }
  }

  /**
   * Call the LLM with a prompt
   * @param prompt - Constructed prompt for the LLM
   * @returns Response from the LLM
   * @private
   */
  private async callLLM(prompt: string): Promise<string> {
    console.log("Calling LLM with prompt snippet:", prompt.substring(0, 100) + "...");
    
    try {
      // In a real implementation, this would call the LLM API
      // For this example, we'll simulate a response
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Simulate API errors for testing
      if (prompt.includes("error_trigger")) {
        throw new Error("Simulated LLM API Error");
      }
      
      if (prompt.length > 8000) {
        throw new Error("Simulated Context Length Exceeded Error");
      }
      
      // Generate simple response
      return `I understood your request. Here's my response to: "${prompt.substring(0, 50)}..."`;
    } catch (error) {
      console.error("LLM Call failed:", error);
      
      // Convert to specific error type
      throw new LLMAPIError(
        `LLM API call failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}