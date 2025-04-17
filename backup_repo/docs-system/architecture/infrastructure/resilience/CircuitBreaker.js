/**
 * Circuit Breaker
 * 
 * Implementation of the Circuit Breaker pattern for handling service failures gracefully.
 */

/**
 * Circuit breaker states
 * @enum {string}
 */
const CircuitState = {
  CLOSED: 'CLOSED',    // Normal operation, requests pass through
  OPEN: 'OPEN',        // Circuit is open, requests fail fast
  HALF_OPEN: 'HALF_OPEN' // Testing if the service is back online
};

/**
 * Circuit breaker implementation
 */
class CircuitBreaker {
  /**
   * Create a new CircuitBreaker
   * 
   * @param {Object} options - Circuit breaker options
   * @param {string} options.operationName - Name of the operation being protected
   * @param {number} [options.failureThreshold=5] - Number of failures before opening the circuit
   * @param {number} [options.resetTimeout=30000] - Time in ms to wait before trying to reset the circuit
   * @param {number} [options.monitorInterval=5000] - Time in ms between health checks
   * @param {Logger} logger - Logger instance
   */
  constructor(options, logger) {
    /**
     * Circuit breaker options
     * @type {Object}
     */
    this.options = {
      operationName: options.operationName || 'unnamed-operation',
      failureThreshold: options.failureThreshold || 5,
      resetTimeout: options.resetTimeout || 30000,
      monitorInterval: options.monitorInterval || 5000
    };
    
    /**
     * Current state of the circuit
     * @type {CircuitState}
     */
    this.state = CircuitState.CLOSED;
    
    /**
     * Count of failures since last reset
     * @type {number}
     */
    this.failureCount = 0;
    
    /**
     * Timestamp of the last state change
     * @type {number}
     */
    this.lastStateChangeTimestamp = Date.now();
    
    /**
     * Logger instance
     * @type {Logger}
     */
    this.logger = logger;
    
    /**
     * Error encountered during the last failure
     * @type {Error|null}
     */
    this.lastError = null;
    
    /**
     * Health check interval ID
     * @type {number|null}
     */
    this.monitorIntervalId = null;
    
    // Start health check monitor if specified
    if (this.options.monitorInterval > 0) {
      this._startMonitor();
    }
  }
  
  /**
   * Execute a function with circuit breaker protection
   * 
   * @param {Function} fn - Function to execute
   * @returns {Promise<*>} Result of the function
   */
  async execute(fn) {
    // If the circuit is open, fail fast
    if (this.state === CircuitState.OPEN) {
      if (this._shouldRetry()) {
        this._transitionToHalfOpen();
      } else {
        this._trackFailure();
        throw new Error(`Circuit is open for ${this.options.operationName}`);
      }
    }
    
    try {
      // Execute the function
      const result = await fn();
      
      // If we're in half-open state and the call succeeded, close the circuit
      if (this.state === CircuitState.HALF_OPEN) {
        this._transitionToClosed();
      }
      
      // Reset the failure count on success
      this._trackSuccess();
      
      return result;
    } catch (error) {
      // Track the failure
      this._trackFailure(error);
      
      // If we've hit the failure threshold, open the circuit
      if (this.state === CircuitState.CLOSED && this.failureCount >= this.options.failureThreshold) {
        this._transitionToOpen();
      }
      
      // If we're in half-open state and the call failed, reopen the circuit
      if (this.state === CircuitState.HALF_OPEN) {
        this._transitionToOpen();
      }
      
      throw error;
    }
  }
  
  /**
   * Check if the circuit should retry (transition to half-open)
   * 
   * @returns {boolean} True if the circuit should retry
   * @private
   */
  _shouldRetry() {
    const now = Date.now();
    return now - this.lastStateChangeTimestamp >= this.options.resetTimeout;
  }
  
  /**
   * Track a successful operation
   * 
   * @private
   */
  _trackSuccess() {
    this.failureCount = 0;
    this.lastError = null;
  }
  
  /**
   * Track a failed operation
   * 
   * @param {Error} [error=null] - Error that occurred
   * @private
   */
  _trackFailure(error = null) {
    this.failureCount++;
    this.lastError = error;
    
    this.logger.warn(`Operation ${this.options.operationName} failed`, { 
      failureCount: this.failureCount,
      errorMessage: error ? error.message : 'unknown',
      circuitState: this.state
    });
  }
  
  /**
   * Transition the circuit to open state
   * 
   * @private
   */
  _transitionToOpen() {
    this.state = CircuitState.OPEN;
    this.lastStateChangeTimestamp = Date.now();
    
    this.logger.warn(`Circuit opened for ${this.options.operationName}`, {
      failureCount: this.failureCount,
      resetTimeout: this.options.resetTimeout
    });
  }
  
  /**
   * Transition the circuit to half-open state
   * 
   * @private
   */
  _transitionToHalfOpen() {
    this.state = CircuitState.HALF_OPEN;
    this.lastStateChangeTimestamp = Date.now();
    
    this.logger.info(`Circuit half-open for ${this.options.operationName}`, {
      timeSinceLastOpenMs: Date.now() - this.lastStateChangeTimestamp
    });
  }
  
  /**
   * Transition the circuit to closed state
   * 
   * @private
   */
  _transitionToClosed() {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.lastStateChangeTimestamp = Date.now();
    
    this.logger.info(`Circuit closed for ${this.options.operationName}`);
  }
  
  /**
   * Start the health check monitor
   * 
   * @private
   */
  _startMonitor() {
    if (this.monitorIntervalId) {
      clearInterval(this.monitorIntervalId);
    }
    
    this.monitorIntervalId = setInterval(() => {
      if (this.state === CircuitState.OPEN && this._shouldRetry()) {
        this._transitionToHalfOpen();
      }
    }, this.options.monitorInterval);
  }
  
  /**
   * Stop the health check monitor
   */
  stopMonitor() {
    if (this.monitorIntervalId) {
      clearInterval(this.monitorIntervalId);
      this.monitorIntervalId = null;
    }
  }
  
  /**
   * Reset the circuit breaker to closed state
   */
  reset() {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.lastStateChangeTimestamp = Date.now();
    this.lastError = null;
    
    this.logger.info(`Circuit reset for ${this.options.operationName}`);
  }
  
  /**
   * Get the current state of the circuit
   * 
   * @returns {Object} Circuit state information
   */
  getState() {
    return {
      operationName: this.options.operationName,
      state: this.state,
      failureCount: this.failureCount,
      lastStateChangeTimestamp: this.lastStateChangeTimestamp,
      lastErrorMessage: this.lastError ? this.lastError.message : null
    };
  }
}

// Export the CircuitBreaker and CircuitState
module.exports = {
  CircuitBreaker,
  CircuitState
};