/**
 * Logger Factory
 * 
 * Factory for creating logger instances.
 */

/**
 * Create a logger instance
 * 
 * @param {Object} [config={}] - Logger configuration
 * @returns {Object} Logger instance
 */
function createLogger(config = {}) {
  const { level = 'info', pretty = false } = config;
  
  // In a real implementation, this would create a proper
  // logger using a library like winston or pino.
  // For now, we'll use a simple console-based logger.
  
  const logger = {
    level,
    
    /**
     * Log a message at the trace level
     * 
     * @param {string} message - Log message
     * @param {Object} [meta={}] - Additional metadata
     */
    trace(message, meta = {}) {
      if (this._shouldLog('trace')) {
        this._log('TRACE', message, meta);
      }
    },
    
    /**
     * Log a message at the debug level
     * 
     * @param {string} message - Log message
     * @param {Object} [meta={}] - Additional metadata
     */
    debug(message, meta = {}) {
      if (this._shouldLog('debug')) {
        this._log('DEBUG', message, meta);
      }
    },
    
    /**
     * Log a message at the info level
     * 
     * @param {string} message - Log message
     * @param {Object} [meta={}] - Additional metadata
     */
    info(message, meta = {}) {
      if (this._shouldLog('info')) {
        this._log('INFO', message, meta);
      }
    },
    
    /**
     * Log a message at the warn level
     * 
     * @param {string} message - Log message
     * @param {Object} [meta={}] - Additional metadata
     */
    warn(message, meta = {}) {
      if (this._shouldLog('warn')) {
        this._log('WARN', message, meta);
      }
    },
    
    /**
     * Log a message at the error level
     * 
     * @param {string} message - Log message
     * @param {Object} [meta={}] - Additional metadata
     */
    error(message, meta = {}) {
      if (this._shouldLog('error')) {
        this._log('ERROR', message, meta);
      }
    },
    
    /**
     * Log a message at the fatal level
     * 
     * @param {string} message - Log message
     * @param {Object} [meta={}] - Additional metadata
     */
    fatal(message, meta = {}) {
      if (this._shouldLog('fatal')) {
        this._log('FATAL', message, meta);
      }
    },
    
    /**
     * Create a child logger with additional context
     * 
     * @param {Object} context - Additional context
     * @returns {Object} Child logger
     */
    child(context) {
      const childLogger = { ...this };
      const childContext = { ...context };
      
      childLogger.trace = (message, meta = {}) => {
        this.trace(message, { ...childContext, ...meta });
      };
      
      childLogger.debug = (message, meta = {}) => {
        this.debug(message, { ...childContext, ...meta });
      };
      
      childLogger.info = (message, meta = {}) => {
        this.info(message, { ...childContext, ...meta });
      };
      
      childLogger.warn = (message, meta = {}) => {
        this.warn(message, { ...childContext, ...meta });
      };
      
      childLogger.error = (message, meta = {}) => {
        this.error(message, { ...childContext, ...meta });
      };
      
      childLogger.fatal = (message, meta = {}) => {
        this.fatal(message, { ...childContext, ...meta });
      };
      
      return childLogger;
    },
    
    /**
     * Check if a message at the given level should be logged
     * 
     * @param {string} messageLevel - Message level
     * @returns {boolean} True if the message should be logged
     * @private
     */
    _shouldLog(messageLevel) {
      const levels = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'];
      const loggerLevelIndex = levels.indexOf(this.level);
      const messageLevelIndex = levels.indexOf(messageLevel);
      
      return messageLevelIndex >= loggerLevelIndex;
    },
    
    /**
     * Log a message
     * 
     * @param {string} level - Log level
     * @param {string} message - Log message
     * @param {Object} meta - Additional metadata
     * @private
     */
    _log(level, message, meta) {
      const timestamp = new Date().toISOString();
      
      if (pretty) {
        console.log(`${timestamp} [${level}] ${message}`, Object.keys(meta).length ? meta : '');
      } else {
        const logObject = {
          timestamp,
          level,
          message,
          ...meta
        };
        
        console.log(JSON.stringify(logObject));
      }
    }
  };
  
  return logger;
}

module.exports = { createLogger };