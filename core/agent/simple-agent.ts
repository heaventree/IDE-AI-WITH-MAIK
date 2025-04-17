/**
 * Simple Agent for Bolt DIY
 * 
 * This module provides a simplified implementation of the Agent interface
 * without relying on the dependency injection system. It maintains the same
 * core functionality with a more straightforward approach.
 */

import { nanoid } from 'nanoid';
import { ErrorHandler, ErrorCategory, ErrorSeverity } from '../error-handler';

// Tool interface for executing specific functions
export interface Tool {
  name: string;
  description: string;
  execute: (args: Record<string, any>, context?: Record<string, any>) => Promise<any>;
}

// Map to store conversation history by session
const sessionContextMap = new Map<string, string[]>();

// Available tools
const tools: Tool[] = [
  // Weather tool
  {
    name: 'weather',
    description: 'Get the weather for a location',
    execute: async (args: Record<string, any>, context?: Record<string, any>) => {
      try {
        if (!args.location) {
          throw new Error('Location is required');
        }

        // Simulated weather response
        return {
          location: args.location,
          temperature: Math.floor(Math.random() * 30) + 10,
          condition: ['Sunny', 'Cloudy', 'Rainy', 'Snowy'][Math.floor(Math.random() * 4)],
          humidity: Math.floor(Math.random() * 50) + 30
        };
      } catch (error) {
        throw new Error(`Weather tool error: ${(error as Error).message}`);
      }
    }
  },
  
  // Calculator tool
  {
    name: 'calculator',
    description: 'Perform mathematical calculations',
    execute: async (args: Record<string, any>, context?: Record<string, any>) => {
      try {
        if (!args.expression) {
          throw new Error('Expression is required');
        }

        // Simple safe evaluation
        const sanitizedExpression = args.expression.toString()
          .replace(/[^0-9+\-*/().]/g, '')
          .replace(/\*\*/g, ''); // Remove potential exponentiation operator
          
        // eslint-disable-next-line no-eval
        const result = eval(sanitizedExpression);
        return { 
          expression: args.expression,
          result
        };
      } catch (error) {
        throw new Error(`Calculator tool error: ${(error as Error).message}`);
      }
    }
  }
];

// Simple Agent implementation
export class SimpleAgent {
  private errorHandler: ErrorHandler;
  
  constructor() {
    this.errorHandler = new ErrorHandler();
  }
  
  /**
   * Handle a user request
   * @param query - The user query
   * @param sessionId - The session ID for context retention
   * @returns Response to the user
   */
  async handleRequest(query: string, sessionId: string): Promise<string> {
    try {
      // Store the user message in the session context
      this.addToSessionContext(sessionId, `User: ${query}`);
      
      // Process the user's query
      let response = '';
      
      // Check if it's a tool request
      const toolMatch = query.match(/^use\s+(\w+)\s*(.*)$/i);
      if (toolMatch) {
        const toolName = toolMatch[1].toLowerCase();
        const tool = tools.find(t => t.name === toolName);
        
        if (tool) {
          try {
            // Parse tool arguments from the query
            const argsText = toolMatch[2].trim();
            const args = this.parseToolArgs(argsText);
            
            // Execute the tool
            const result = await tool.execute(args);
            response = `Tool ${tool.name} executed successfully:\n${JSON.stringify(result, null, 2)}`;
          } catch (error) {
            response = `Error executing tool: ${(error as Error).message}`;
          }
        } else {
          response = `Tool "${toolName}" not found. Available tools: ${tools.map(t => t.name).join(', ')}`;
        }
      } else {
        // Handle general queries
        response = await this.generateResponse(query, sessionId);
      }
      
      // Store the response in the session context
      this.addToSessionContext(sessionId, `Assistant: ${response}`);
      
      return response;
    } catch (error) {
      // Handle any errors that occur during processing
      const monitoredError = this.errorHandler.handle(error, {
        query,
        sessionId,
        timestamp: new Date().toISOString()
      });
      
      return monitoredError.userFacingMessage;
    }
  }
  
  /**
   * Parse tool arguments from text
   * @param argsText - The arguments text
   * @returns Parsed arguments object
   */
  private parseToolArgs(argsText: string): Record<string, any> {
    // Simple parsing for key=value pairs
    const args: Record<string, any> = {};
    
    // Try to parse as JSON first
    if (argsText.trim().startsWith('{') && argsText.trim().endsWith('}')) {
      try {
        return JSON.parse(argsText);
      } catch {
        // Continue with manual parsing if JSON parse fails
      }
    }
    
    // Manual parsing for key=value pairs
    const matches = argsText.match(/(\w+)=("[^"]*"|\S+)/g) || [];
    for (const match of matches) {
      const [key, value] = match.split('=');
      if (key && value) {
        // Handle quoted values
        let parsedValue: any = value;
        if (value.startsWith('"') && value.endsWith('"')) {
          parsedValue = value.slice(1, -1);
        } else if (!isNaN(Number(value))) {
          parsedValue = Number(value);
        } else if (value === 'true') {
          parsedValue = true;
        } else if (value === 'false') {
          parsedValue = false;
        }
        args[key] = parsedValue;
      }
    }
    
    return args;
  }
  
  /**
   * Generate a response to a user query
   * @param query - The user query
   * @param sessionId - The session ID for context retention
   * @returns Generated response
   */
  private async generateResponse(query: string, sessionId: string): Promise<string> {
    // Simplified response generation without LLM
    if (query.toLowerCase().includes('hello') || query.toLowerCase().includes('hi')) {
      return 'Hello! How can I help you today with your coding project?';
    } else if (query.toLowerCase().includes('help')) {
      return `I can assist you with coding questions and perform various tasks. Here are the available tools:
      
${tools.map(tool => `- ${tool.name}: ${tool.description}`).join('\n')}

You can use them with the syntax: use [tool name] [arguments]
For example: use calculator expression=2+2`;
    } else if (query.toLowerCase().includes('weather')) {
      return 'You can check the weather using our weather tool. Try: use weather location="New York"';
    } else if (query.toLowerCase().includes('calculator') || query.toLowerCase().includes('calculate') || query.toLowerCase().includes('math')) {
      return 'You can perform calculations using our calculator tool. Try: use calculator expression="2+2"';
    } else {
      // Get context from memory if available
      const context = this.getSessionContext(sessionId);
      
      return `I'll process your request: "${query}". In a full implementation, I would use an LLM to generate a contextually relevant response based on your conversation history.

To see the available tools, try asking for "help".`;
    }
  }
  
  /**
   * Add a message to the session context
   * @param sessionId - The session ID
   * @param message - The message to add
   */
  private addToSessionContext(sessionId: string, message: string): void {
    if (!sessionContextMap.has(sessionId)) {
      sessionContextMap.set(sessionId, []);
    }
    
    const context = sessionContextMap.get(sessionId)!;
    context.push(message);
    
    // Limit context size
    if (context.length > 20) {
      context.shift();
    }
  }
  
  /**
   * Get the session context
   * @param sessionId - The session ID
   * @returns Session context
   */
  private getSessionContext(sessionId: string): string[] {
    return sessionContextMap.get(sessionId) || [];
  }
}

// Create a singleton instance of the SimpleAgent
export const agent = new SimpleAgent();