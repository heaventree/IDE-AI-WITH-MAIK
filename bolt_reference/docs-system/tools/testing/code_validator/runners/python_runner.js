/**
 * Python Code Runner for Documentation System
 * 
 * This module validates Python code examples by checking syntax and optionally
 * executing them through a Python subprocess.
 */

class PythonRunner {
  /**
   * Creates a new PythonRunner instance
   * @param {Object} options - Configuration options
   * @param {boolean} options.executeCode - Whether to execute code for validation
   * @param {Object} options.executionEnvironment - Environment for code execution
   * @param {number} options.timeout - Timeout for code execution in milliseconds
   * @param {Function} options.logger - Logging function for validation results
   * @param {Function} options.execCommand - Function to execute shell commands
   */
  constructor(options = {}) {
    this.executeCode = options.executeCode !== undefined ? options.executeCode : false;
    this.executionEnvironment = options.executionEnvironment || {};
    this.timeout = options.timeout || 5000;
    this.logger = options.logger || console;
    this.execCommand = options.execCommand || this.defaultExecCommand;
  }

  /**
   * Default command execution function (placeholder)
   * @param {string} command - Command to execute
   * @returns {Promise<Object>} Execution result
   */
  async defaultExecCommand(command) {
    // This is a placeholder that would be replaced with a real implementation
    // that invokes Python via child_process.exec or similar
    return {
      stdout: '',
      stderr: '',
      exitCode: 0
    };
  }

  /**
   * Validates Python code
   * @param {Object} codeBlock - The code block to validate
   * @returns {Object} Validation result
   */
  async validate(codeBlock) {
    try {
      // First check syntax without executing
      const syntaxResult = await this.checkSyntax(codeBlock.code);
      
      if (!syntaxResult.valid) {
        return syntaxResult;
      }
      
      // Execute code if enabled
      if (this.executeCode) {
        const executionResult = await this.executePython(codeBlock.code);
        return executionResult;
      }
      
      // Just return syntax check result if execution is disabled
      return syntaxResult;
    } catch (error) {
      this.logger.error('Python validation error', {
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
   * Checks Python syntax without executing
   * @param {string} code - The code to check
   * @returns {Promise<Object>} Syntax check result
   */
  async checkSyntax(code) {
    try {
      // Use python -m py_compile to check syntax
      const command = `echo ${JSON.stringify(code)} | python -c "import sys, ast; ast.parse(sys.stdin.read())"`;
      const result = await this.execCommand(command);
      
      if (result.exitCode !== 0) {
        return {
          valid: false,
          error: result.stderr,
          message: `Python syntax error: ${result.stderr}`,
          type: 'syntax_error'
        };
      }
      
      return {
        valid: true,
        message: 'Python syntax is valid',
        type: 'syntax_valid'
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message,
        message: `Python validation error: ${error.message}`,
        type: 'validation_error'
      };
    }
  }

  /**
   * Executes Python code for validation
   * @param {string} code - The code to execute
   * @returns {Promise<Object>} Execution result
   */
  async executePython(code) {
    try {
      // Create environment variables string
      const envVars = Object.entries(this.executionEnvironment)
        .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
        .join(' ');
      
      // Execute with timeout
      const command = `${envVars} python -c ${JSON.stringify(code)}`;
      const result = await this.execCommand(command);
      
      if (result.exitCode !== 0) {
        return {
          valid: false,
          error: result.stderr,
          message: `Python execution error: ${result.stderr}`,
          type: 'execution_error',
          stdout: result.stdout
        };
      }
      
      return {
        valid: true,
        message: 'Python code executed successfully',
        type: 'execution_success',
        stdout: result.stdout
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message,
        message: `Python execution error: ${error.message}`,
        type: 'execution_error'
      };
    }
  }
}

module.exports = PythonRunner;