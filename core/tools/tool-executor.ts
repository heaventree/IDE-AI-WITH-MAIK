/**
 * Tool Executor for Bolt DIY
 * 
 * This service is responsible for executing tools based on AI requests.
 * It provides a standardized interface for tool registration and execution.
 */

import { singleton, injectable } from 'tsyringe';
import { ErrorHandler, ErrorCategory, ErrorSeverity } from '../error-handler';
import { IToolExecutor } from '../interfaces';

/**
 * Tool interface for implementing custom tools
 */
export interface Tool {
  /** Unique identifier for the tool */
  name: string;
  
  /** Human-readable description of what the tool does */
  description: string;
  
  /** Function to execute the tool with provided parameters */
  execute: (params: Record<string, any>) => Promise<any>;
  
  /** Optional tool category for grouping */
  category?: string;
  
  /** Optional schema for parameter validation */
  parameterSchema?: Record<string, any>;
}

/**
 * Result of a tool execution attempt
 */
export interface ToolExecutionResult {
  /** Success status of the execution */
  success: boolean;
  
  /** Result data if successful */
  data?: any;
  
  /** Error information if unsuccessful */
  error?: {
    message: string;
    details?: any;
  };
}

/**
 * Service for registering and executing tools
 */
@injectable()
@singleton()
export class ToolExecutor implements IToolExecutor {
  /** Map of registered tools by name */
  private tools: Map<string, Tool> = new Map();
  
  /**
   * Constructor
   * @param errorHandler - Error handler for standardized error processing
   */
  constructor(private errorHandler: ErrorHandler) {}
  
  /**
   * Register a tool with the executor
   * @param tool - Tool to register
   */
  registerTool(tool: Tool): void {
    if (this.tools.has(tool.name)) {
      throw new Error(`Tool with name "${tool.name}" is already registered`);
    }
    
    this.tools.set(tool.name, tool);
  }
  
  /**
   * Register multiple tools at once
   * @param tools - Array of tools to register
   */
  registerTools(tools: Tool[]): void {
    for (const tool of tools) {
      this.registerTool(tool);
    }
  }
  
  /**
   * Check if a tool is registered
   * @param toolName - Name of the tool to check
   * @returns Whether the tool is registered
   */
  hasTool(toolName: string): boolean {
    return this.tools.has(toolName);
  }
  
  /**
   * Get a registered tool by name
   * @param toolName - Name of the tool to get
   * @returns The requested tool or undefined if not found
   */
  getTool(toolName: string): Tool | undefined {
    return this.tools.get(toolName);
  }
  
  /**
   * Get all registered tools
   * @returns Array of all registered tools
   */
  getAllTools(): Tool[] {
    return Array.from(this.tools.values());
  }
  
  /**
   * Execute a tool by name with provided parameters
   * @param toolName - Name of the tool to execute
   * @param params - Parameters to pass to the tool
   * @returns Result of the tool execution
   */
  async executeTool(toolName: string, params: Record<string, any> = {}): Promise<ToolExecutionResult> {
    try {
      const tool = this.tools.get(toolName);
      
      if (!tool) {
        return {
          success: false,
          error: {
            message: `Tool "${toolName}" not found`
          }
        };
      }
      
      // Execute the tool and return the result
      const result = await tool.execute(params);
      
      return {
        success: true,
        data: result
      };
    } catch (error) {
      // Process the error through the error handler
      const monitoredError = this.errorHandler.handle(error, {
        toolName,
        params,
        timestamp: new Date().toISOString()
      });
      
      return {
        success: false,
        error: {
          message: monitoredError.userFacingMessage,
          details: monitoredError.internalDetails
        }
      };
    }
  }
  
  /**
   * Process LLM response and execute any tools
   * @param llmResponse - Raw response from LLM
   * @param sessionId - Session identifier for state context
   * @returns Final processed response after tool execution
   */
  async processResponse(llmResponse: string, sessionId: string): Promise<string> {
    // Simple implementation that just returns the LLM response
    // In a real implementation, this would parse the response, extract tool calls,
    // execute them, and then return the final processed response
    
    const toolCallPattern = /\[\[(\w+)\(([^)]*)\)\]\]/g;
    let finalResponse = llmResponse;
    let match;
    
    while ((match = toolCallPattern.exec(llmResponse)) !== null) {
      const toolName = match[1];
      const paramsString = match[2];
      
      // Parse parameters - this is a simple implementation
      const params: Record<string, any> = {};
      paramsString.split(',').forEach(param => {
        const [key, value] = param.split('=').map(p => p.trim());
        if (key && value) {
          // Simple type conversion
          if (value === 'true') params[key] = true;
          else if (value === 'false') params[key] = false;
          else if (!isNaN(Number(value))) params[key] = Number(value);
          else params[key] = value.replace(/^["'](.*)["']$/, '$1'); // Remove quotes
        }
      });
      
      try {
        // Execute the tool
        const result = await this.executeTool(toolName, params);
        
        // Replace the tool call with the result
        if (result.success) {
          const resultString = typeof result.data === 'object' 
            ? JSON.stringify(result.data) 
            : String(result.data);
          
          finalResponse = finalResponse.replace(
            match[0],
            resultString
          );
        } else {
          finalResponse = finalResponse.replace(
            match[0],
            `Error: ${result.error?.message || 'Unknown error'}`
          );
        }
      } catch (error) {
        finalResponse = finalResponse.replace(
          match[0],
          `Error executing tool ${toolName}: ${(error as Error).message}`
        );
      }
    }
    
    return finalResponse;
  }
}

/**
 * Basic weather tool example
 */
export const weatherTool: Tool = {
  name: 'weather',
  description: 'Get current weather information for a location',
  category: 'information',
  
  async execute(params: Record<string, any>): Promise<any> {
    // This is a mock implementation
    // In a real tool, you would call a weather API
    
    const location = params.location || 'Unknown';
    
    // Simulate API call with a delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      location,
      temperature: 72,
      conditions: 'Sunny',
      humidity: 45,
      windSpeed: 5
    };
  }
};

/**
 * Basic calculator tool example
 */
export const calculatorTool: Tool = {
  name: 'calculator',
  description: 'Perform mathematical calculations',
  category: 'utility',
  
  async execute(params: Record<string, any>): Promise<any> {
    const operation = params.operation as string;
    const a = Number(params.a);
    const b = Number(params.b);
    
    if (!operation) {
      throw new Error('Operation is required');
    }
    
    if (isNaN(a) || isNaN(b)) {
      throw new Error('Invalid operands: a and b must be numbers');
    }
    
    switch (operation) {
      case 'add':
        return { result: a + b };
      case 'subtract':
        return { result: a - b };
      case 'multiply':
        return { result: a * b };
      case 'divide':
        if (b === 0) {
          throw new Error('Division by zero is not allowed');
        }
        return { result: a / b };
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  }
};