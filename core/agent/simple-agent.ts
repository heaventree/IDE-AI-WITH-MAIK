/**
 * Simple Agent Implementation for Bolt DIY MVP
 * 
 * This is a simplified version of the agent that doesn't rely on dependency injection
 * to make it easier to integrate with the rest of the system for the MVP.
 */

import { ErrorHandler, MonitoredError, ErrorCategory, ErrorSeverity } from '../error-handler';

// Create a standalone error handler
const errorHandler = new ErrorHandler();

/**
 * Simple implementation of the Agent class without dependency injection
 */
export class SimpleAgent {
  private sessionContexts: Map<string, string[]> = new Map();
  
  /**
   * Handle a user request
   * @param userInput - User input text
   * @param sessionId - Unique session identifier
   * @returns Response to the user
   */
  async handleRequest(userInput: string, sessionId: string): Promise<string> {
    try {
      console.log(`Processing request for session ${sessionId}: ${userInput}`);
      
      // Get or create conversation history for this session
      const history = this.sessionContexts.get(sessionId) || [];
      
      // Add user input to history
      history.push(`User: ${userInput}`);
      
      // Generate a response (in a real app, this would call an LLM API)
      const response = await this.generateResponse(userInput, history);
      
      // Add response to history
      history.push(`Assistant: ${response}`);
      
      // Keep history limited to last 10 messages
      const trimmedHistory = history.slice(-10);
      
      // Update session context
      this.sessionContexts.set(sessionId, trimmedHistory);
      
      return response;
    } catch (error) {
      console.error("Error handling request:", error);
      
      // Process the error through the error handler
      const monitoredError = errorHandler.handle(error, {
        userInput,
        sessionId,
        timestamp: new Date().toISOString()
      });
      
      // Return user-friendly error message
      return monitoredError.userFacingMessage;
    }
  }
  
  /**
   * Generate a response based on user input and conversation history
   * This is a placeholder for actual LLM integration
   * @param userInput - Current user input
   * @param history - Conversation history
   * @returns Generated response
   * @private
   */
  private async generateResponse(userInput: string, history: string[]): Promise<string> {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simple pattern matching for demonstration purposes
    const input = userInput.toLowerCase();
    
    if (input.includes("hello") || input.includes("hi")) {
      return "Hello! I'm your AI assistant. How can I help you today?";
    }
    
    if (input.includes("how are you")) {
      return "I'm functioning well, thank you for asking! How can I assist you?";
    }
    
    if (input.includes("help")) {
      return "I'm here to help! You can ask me questions about coding, debugging, or WCAG accessibility compliance.";
    }
    
    if (input.includes("code") || input.includes("function") || input.includes("component")) {
      return "I can help with coding tasks. Could you provide more details about what you're trying to build?";
    }
    
    if (input.includes("error") || input.includes("bug") || input.includes("fix")) {
      return "I can help debug issues. Could you share the error message and the relevant code?";
    }
    
    if (input.includes("wcag") || input.includes("accessibility") || input.includes("a11y")) {
      return "Making your application accessible is important. WCAG guidelines recommend using semantic HTML, ensuring sufficient color contrast, and providing alternative text for images, among other things.";
    }
    
    if (input.includes("thank")) {
      return "You're welcome! Feel free to ask if you need any more assistance.";
    }
    
    // Default response
    return "I understand you're interested in " + userInput.substring(0, 20) + "... Could you provide more details about what you're looking for?";
  }
  
  /**
   * Clear conversation history for a session
   * @param sessionId - Session to clear
   */
  clearHistory(sessionId: string): void {
    this.sessionContexts.delete(sessionId);
  }
}

// Export a singleton instance
export const agent = new SimpleAgent();