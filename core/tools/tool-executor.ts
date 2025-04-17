/**
 * Tool Executor for Bolt DIY
 * 
 * This module provides functionality for executing tools based on
 * LLM responses. It parses the response to identify tool calls and
 * executes the appropriate tools.
 */

import { IToolExecutor } from '../interfaces';
import { ToolExecutionError, InputValidationError } from '../errors';
import { IStateManager } from '../interfaces';

/**
 * Tool interface defining the structure of a tool
 */
export interface Tool {
  /** Unique name of the tool */
  name: string;
  
  /** Description of what the tool does */
  description: string;
  
  /** Function that executes the tool's functionality */
  execute: (args: Record<string, any>, sessionId: string) => Promise<string>;
  
  /** Optional validation function to validate tool arguments */
  validateArgs?: (args: Record<string, any>) => boolean;
}

/**
 * Implementation of Tool Executor
 */
export class ToolExecutor implements IToolExecutor {
  private tools: Map<string, Tool> = new Map();
  private stateManager: IStateManager;
  
  /**
   * Create a new tool executor
   * @param stateManager - State manager for accessing application state
   * @param tools - Optional array of tools to register initially
   */
  constructor(stateManager: IStateManager, tools: Tool[] = []) {
    this.stateManager = stateManager;
    
    // Register initial tools
    tools.forEach(tool => this.registerTool(tool));
  }
  
  /**
   * Register a new tool
   * @param tool - Tool to register
   * @throws Error if a tool with the same name is already registered
   */
  registerTool(tool: Tool): void {
    if (this.tools.has(tool.name)) {
      throw new Error(`Tool with name '${tool.name}' is already registered`);
    }
    
    this.tools.set(tool.name, tool);
  }
  
  /**
   * Process LLM response and execute any tools
   * @param llmResponse - Raw response from LLM
   * @param sessionId - Session identifier for state context
   * @returns Final processed response after tool execution
   */
  async processResponse(llmResponse: string, sessionId: string): Promise<string> {
    // Check if the response contains a tool call
    const toolCall = this.parseToolCall(llmResponse);
    
    if (!toolCall) {
      // No tool call found, return the original response
      return llmResponse;
    }
    
    try {
      // Get the tool by name
      const tool = this.tools.get(toolCall.name);
      
      if (!tool) {
        throw new ToolExecutionError(`Tool '${toolCall.name}' not found`, toolCall.name);
      }
      
      // Validate arguments if a validator is provided
      if (tool.validateArgs && !tool.validateArgs(toolCall.args)) {
        throw new InputValidationError(`Invalid arguments for tool '${toolCall.name}'`);
      }
      
      // Execute the tool
      const toolResult = await tool.execute(toolCall.args, sessionId);
      
      // Replace the tool call in the response with the result
      return this.replaceTooCallWithResult(llmResponse, toolCall, toolResult);
    } catch (error) {
      if (error instanceof ToolExecutionError || error instanceof InputValidationError) {
        throw error;
      }
      
      throw new ToolExecutionError(
        `Error executing tool '${toolCall.name}': ${error instanceof Error ? error.message : String(error)}`,
        toolCall.name
      );
    }
  }
  
  /**
   * Parse a tool call from an LLM response
   * @param response - LLM response to parse
   * @returns Tool call object or null if no tool call found
   */
  private parseToolCall(response: string): { name: string; args: Record<string, any> } | null {
    // Basic regex pattern for tool calls in the format:
    // {{tool:toolName({"arg1": "value1", "arg2": "value2"})}}
    const toolCallPattern = /{{tool:([a-zA-Z0-9_]+)\((.*?)\)}}/;
    const match = response.match(toolCallPattern);
    
    if (!match) {
      return null;
    }
    
    const [_, toolName, argsStr] = match;
    
    // Parse arguments as JSON
    try {
      const args = JSON.parse(argsStr);
      return { name: toolName, args };
    } catch (error) {
      throw new InputValidationError(`Invalid tool arguments: ${argsStr}`);
    }
  }
  
  /**
   * Replace tool call in response with the tool execution result
   * @param response - Original LLM response
   * @param toolCall - Tool call that was executed
   * @param result - Result of tool execution
   * @returns Response with tool call replaced by result
   */
  private replaceTooCallWithResult(
    response: string,
    toolCall: { name: string; args: Record<string, any> },
    result: string
  ): string {
    // Create replacement pattern
    const pattern = new RegExp(`{{tool:${toolCall.name}\\(.*?\\)}}`, 'g');
    
    // Replace tool call with result
    return response.replace(pattern, result);
  }
}