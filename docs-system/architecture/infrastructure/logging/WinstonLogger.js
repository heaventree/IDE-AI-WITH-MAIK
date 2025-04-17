/**
 * Winston Logger Implementation
 * 
 * Logger implementation using Winston.
 */

/**
 * Winston logger implementation
 */
class WinstonLogger {
  /**
   * Create a new WinstonLogger
   * 
   * @param {Object} winston - Winston library instance
   * @param {Object} options - Logger options
   */
  constructor(winston, options = {}) {
    this.winston = winston;
    
    // Default options
    const defaultOptions = {
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json()
      ),
      defaultMeta: { service: 'documentation-system' },
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.printf(info => {
              const { timestamp, level, message, ...rest } = info;
              return `${timestamp} [${level}]: ${message} ${Object.keys(rest).length > 0 ? JSON.stringify(rest) : ''}`;
            })
          )
        })
      ]
    };
    
    // Merge options
    const mergedOptions = {
      ...defaultOptions,
      ...options,
      defaultMeta: {
        ...defaultOptions.defaultMeta,
        ...(options.defaultMeta || {})
      }
    };
    
    // Create logger
    this.logger = winston.createLogger(mergedOptions);
  }
  
  /**
   * Log a debug message
   * 
   * @param {string} message - Message to log
   * @param {Object} [meta={}] - Additional metadata
   */
  debug(message, meta = {}) {
    this.logger.debug(message, meta);
  }
  
  /**
   * Log an info message
   * 
   * @param {string} message - Message to log
   * @param {Object} [meta={}] - Additional metadata
   */
  info(message, meta = {}) {
    this.logger.info(message, meta);
  }
  
  /**
   * Log a warning message
   * 
   * @param {string} message - Message to log
   * @param {Object} [meta={}] - Additional metadata
   */
  warn(message, meta = {}) {
    this.logger.warn(message, meta);
  }
  
  /**
   * Log an error message
   * 
   * @param {string} message - Message to log
   * @param {Object} [meta={}] - Additional metadata
   */
  error(message, meta = {}) {
    this.logger.error(message, meta);
  }
  
  /**
   * Log a fatal message
   * 
   * @param {string} message - Message to log
   * @param {Object} [meta={}] - Additional metadata
   */
  fatal(message, meta = {}) {
    this.logger.error(message, { ...meta, fatal: true });
  }
  
  /**
   * Create a child logger with additional metadata
   * 
   * @param {Object} meta - Additional metadata
   * @returns {WinstonLogger} Child logger
   */
  child(meta) {
    const childLogger = this.winston.createLogger({
      ...this.logger.options,
      defaultMeta: {
        ...this.logger.defaultMeta,
        ...meta
      }
    });
    
    const winstonLogger = new WinstonLogger(this.winston);
    winstonLogger.logger = childLogger;
    
    return winstonLogger;
  }
}

module.exports = WinstonLogger;