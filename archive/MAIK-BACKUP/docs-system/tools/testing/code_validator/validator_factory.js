/**
 * Code Validator Factory for Documentation System
 * 
 * This module provides a factory for creating code validators
 * with appropriate parsers and runners for different document types and languages.
 */

const CodeValidator = require('./code_validator');
const MarkdownCodeParser = require('./parsers/markdown_parser');
const JavaScriptRunner = require('./runners/javascript_runner');
const PythonRunner = require('./runners/python_runner');

/**
 * Command executer implementation for runners that need to execute code
 */
class CommandExecuter {
  /**
   * Executes a command in a child process
   * @param {string} command - Command to execute
   * @returns {Promise<Object>} Execution result
   */
  async execute(command) {
    // This is a placeholder that would be replaced with a real implementation
    // that invokes commands via child_process.exec or similar
    
    // For now, just return a success response
    return {
      stdout: '',
      stderr: '',
      exitCode: 0
    };
  }
}

/**
 * Code Validator Factory
 */
class ValidatorFactory {
  /**
   * Creates a new ValidatorFactory instance
   * @param {Object} options - Configuration options
   * @param {Function} options.logger - Logging function for validation results
   * @param {boolean} options.executeCode - Whether to execute code for validation
   * @param {Object} options.executionEnvironment - Environment for code execution
   * @param {number} options.timeout - Timeout for code execution in milliseconds
   * @param {Function} options.commandExecuter - Function to execute shell commands
   */
  constructor(options = {}) {
    this.logger = options.logger || console;
    this.executeCode = options.executeCode !== undefined ? options.executeCode : false;
    this.executionEnvironment = options.executionEnvironment || {};
    this.timeout = options.timeout || 5000;
    this.commandExecuter = options.commandExecuter || new CommandExecuter();
  }

  /**
   * Creates a code validator with appropriate parsers and runners
   * @returns {CodeValidator} Configured code validator
   */
  createValidator() {
    // Create parsers for different content types
    const parsers = {
      markdown: new MarkdownCodeParser(),
      default: new MarkdownCodeParser() // Fallback to Markdown parser for unknown types
    };
    
    // Create runners for different languages
    const runners = {
      javascript: new JavaScriptRunner({
        executeCode: this.executeCode,
        executionEnvironment: this.executionEnvironment,
        timeout: this.timeout,
        logger: this.logger
      }),
      
      python: new PythonRunner({
        executeCode: this.executeCode,
        executionEnvironment: this.executionEnvironment,
        timeout: this.timeout,
        logger: this.logger,
        execCommand: this.commandExecuter.execute.bind(this.commandExecuter)
      }),
      
      // Add more runners here for other languages
      
      default: {
        // Simple runner that just validates that the code isn't empty
        validate: async (codeBlock) => {
          const code = codeBlock.code.trim();
          
          if (!code) {
            return {
              valid: false,
              message: 'Code block is empty',
              type: 'empty_code'
            };
          }
          
          return {
            valid: true,
            message: `No specific validator available for language: ${codeBlock.language}`,
            type: 'default_validator'
          };
        }
      }
    };
    
    // Add aliases for language runners
    runners.js = runners.javascript;
    runners.py = runners.python;
    
    // Create and return the validator
    return new CodeValidator({
      parsers,
      runners,
      logger: this.logger
    });
  }

  /**
   * Registers a new parser
   * @param {string} documentType - The document type
   * @param {Object} parser - The parser to register
   */
  registerParser(documentType, parser) {
    this.parsers[documentType] = parser;
  }

  /**
   * Registers a new runner
   * @param {string} language - The language
   * @param {Object} runner - The runner to register
   */
  registerRunner(language, runner) {
    this.runners[language] = runner;
  }

  /**
   * Sets whether to execute code for validation
   * @param {boolean} executeCode - Whether to execute code
   */
  setExecuteCode(executeCode) {
    this.executeCode = executeCode;
  }

  /**
   * Sets the execution environment for runners
   * @param {Object} environment - The execution environment
   */
  setExecutionEnvironment(environment) {
    this.executionEnvironment = environment;
  }

  /**
   * Sets the timeout for code execution
   * @param {number} timeout - Timeout in milliseconds
   */
  setTimeout(timeout) {
    this.timeout = timeout;
  }
}

module.exports = ValidatorFactory;