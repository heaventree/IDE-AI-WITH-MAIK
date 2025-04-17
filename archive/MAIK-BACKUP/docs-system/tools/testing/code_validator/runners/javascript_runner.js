/**
 * JavaScript Code Runner for Documentation System
 * 
 * This module validates JavaScript code examples by checking syntax
 * and optionally executing them.
 */

class JavaScriptRunner {
  /**
   * Creates a new JavaScriptRunner instance
   * @param {Object} options - Configuration options
   * @param {boolean} options.executeCode - Whether to execute code for validation
   * @param {Object} options.executionEnvironment - Environment for code execution
   * @param {number} options.timeout - Timeout for code execution in milliseconds
   * @param {Function} options.logger - Logging function for validation results
   */
  constructor(options = {}) {
    this.executeCode = options.executeCode !== undefined ? options.executeCode : false;
    this.executionEnvironment = options.executionEnvironment || {};
    this.timeout = options.timeout || 5000;
    this.logger = options.logger || console;
  }

  /**
   * Validates JavaScript code
   * @param {Object} codeBlock - The code block to validate
   * @returns {Object} Validation result
   */
  async validate(codeBlock) {
    try {
      // First check syntax without executing
      const syntaxResult = this.checkSyntax(codeBlock.code);
      
      if (!syntaxResult.valid) {
        return syntaxResult;
      }
      
      // Execute code if enabled
      if (this.executeCode) {
        const executionResult = await this.executeJavaScript(codeBlock.code);
        return executionResult;
      }
      
      // Just return syntax check result if execution is disabled
      return syntaxResult;
    } catch (error) {
      this.logger.error('JavaScript validation error', {
        code: codeBlock.code.substring(0, 100) + (codeBlock.code.length > 100 ? '...' : ''),
        error: error.message
      });
      
      return {
        valid: false,
        error: error.message,
        type: 'validation_error'
      };
    }
  }

  /**
   * Checks JavaScript syntax without executing
   * @param {string} code - The code to check
   * @returns {Object} Syntax check result
   */
  checkSyntax(code) {
    try {
      // Use Function constructor to check syntax without executing
      // This will throw if syntax is invalid
      new Function(code);
      
      return {
        valid: true,
        message: 'JavaScript syntax is valid',
        type: 'syntax_valid'
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message,
        message: `JavaScript syntax error: ${error.message}`,
        type: 'syntax_error'
      };
    }
  }

  /**
   * Executes JavaScript code for validation
   * @param {string} code - The code to execute
   * @returns {Object} Execution result
   */
  async executeJavaScript(code) {
    return new Promise((resolve) => {
      // Set up timeout
      const timeoutId = setTimeout(() => {
        resolve({
          valid: false,
          error: 'Execution timed out',
          message: `JavaScript execution timed out after ${this.timeout}ms`,
          type: 'execution_timeout'
        });
      }, this.timeout);
      
      try {
        // Create sandbox environment
        const sandbox = { ...this.executionEnvironment };
        
        // Create a function that will execute in the sandbox
        // eslint-disable-next-line no-new-func
        const scriptFunction = new Function(...Object.keys(sandbox), code);
        
        // Execute the function with sandbox variables
        scriptFunction(...Object.values(sandbox));
        
        // Clear timeout and resolve successfully
        clearTimeout(timeoutId);
        resolve({
          valid: true,
          message: 'JavaScript code executed successfully',
          type: 'execution_success'
        });
      } catch (error) {
        // Clear timeout and resolve with error
        clearTimeout(timeoutId);
        resolve({
          valid: false,
          error: error.message,
          message: `JavaScript execution error: ${error.message}`,
          type: 'execution_error'
        });
      }
    });
  }
}

module.exports = JavaScriptRunner;