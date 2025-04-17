/**
 * Logger Interface
 * 
 * Interface for logging functionality used throughout the application.
 * This decouples the application from specific logging implementations.
 */

/**
 * @interface
 */
class Logger {
  /**
   * Log an error message
   * 
   * @param {string} message - Error message
   * @param {Object} [metadata] - Additional metadata
   * @returns {void}
   */
  error(message, metadata) {
    throw new Error('Method not implemented');
  }
  
  /**
   * Log a warning message
   * 
   * @param {string} message - Warning message
   * @param {Object} [metadata] - Additional metadata
   * @returns {void}
   */
  warn(message, metadata) {
    throw new Error('Method not implemented');
  }
  
  /**
   * Log an informational message
   * 
   * @param {string} message - Info message
   * @param {Object} [metadata] - Additional metadata
   * @returns {void}
   */
  info(message, metadata) {
    throw new Error('Method not implemented');
  }
  
  /**
   * Log a debug message
   * 
   * @param {string} message - Debug message
   * @param {Object} [metadata] - Additional metadata
   * @returns {void}
   */
  debug(message, metadata) {
    throw new Error('Method not implemented');
  }
  
  /**
   * Start timing an operation
   * 
   * @param {string} operation - Name of the operation
   * @returns {Object} Timer object
   */
  startTimer(operation) {
    throw new Error('Method not implemented');
  }
  
  /**
   * End timing an operation
   * 
   * @param {Object} timer - Timer object from startTimer
   * @param {Object} [metadata] - Additional metadata
   * @returns {void}
   */
  endTimer(timer, metadata) {
    throw new Error('Method not implemented');
  }
  
  /**
   * Create a child logger with additional context
   * 
   * @param {Object} context - Additional context for the child logger
   * @returns {Logger} Child logger instance
   */
  child(context) {
    throw new Error('Method not implemented');
  }
}

module.exports = Logger;