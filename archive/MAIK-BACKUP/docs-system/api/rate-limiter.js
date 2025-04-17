/**
 * API Rate Limiting Module for Documentation System
 * 
 * This module provides rate limiting functionality for API endpoints
 * to prevent abuse and ensure fair resource allocation.
 */

/**
 * Simple in-memory storage for rate limits
 * In production, this should be replaced with Redis or another shared store
 */
class MemoryStore {
  constructor() {
    this.records = {};
    this.timeouts = {};
  }
  
  /**
   * Increment the request count for a key
   * @param {string} key - The rate limiting key
   * @param {number} expiry - Time in ms until the record expires
   * @returns {Object} The updated record
   */
  increment(key, expiry) {
    if (!this.records[key]) {
      this.records[key] = {
        count: 0,
        firstRequest: Date.now(),
        lastRequest: Date.now()
      };
      
      // Set expiry timeout
      this.timeouts[key] = setTimeout(() => {
        delete this.records[key];
        delete this.timeouts[key];
      }, expiry);
    }
    
    this.records[key].count += 1;
    this.records[key].lastRequest = Date.now();
    
    return this.records[key];
  }
  
  /**
   * Get the current record for a key
   * @param {string} key - The rate limiting key
   * @returns {Object|null} The record or null if not found
   */
  get(key) {
    return this.records[key] || null;
  }
  
  /**
   * Reset the record for a key
   * @param {string} key - The rate limiting key
   */
  reset(key) {
    if (this.timeouts[key]) {
      clearTimeout(this.timeouts[key]);
      delete this.timeouts[key];
    }
    
    delete this.records[key];
  }
}

/**
 * Rate Limiter class for controlling API request rates
 */
class RateLimiter {
  /**
   * Create a new RateLimiter instance
   * @param {Object} options - Configuration options
   * @param {Object} [options.store] - Storage backend (defaults to in-memory store)
   * @param {number} [options.windowMs=60000] - Time window in milliseconds
   * @param {number} [options.maxRequests=100] - Maximum requests per window
   * @param {Function} [options.keyGenerator] - Function to generate rate limit keys
   * @param {Function} [options.logger] - Logging function
   * @param {boolean} [options.skipSuccessfulRequests=false] - Whether to skip counting successful requests
   * @param {Array} [options.exemptRoles=[]] - Roles exempt from rate limiting
   */
  constructor(options = {}) {
    this.store = options.store || new MemoryStore();
    this.windowMs = options.windowMs || 60000; // Default: 1 minute
    this.maxRequests = options.maxRequests || 100; // Default: 100 requests per minute
    this.keyGenerator = options.keyGenerator || this.defaultKeyGenerator;
    this.logger = options.logger || console;
    this.skipSuccessfulRequests = options.skipSuccessfulRequests || false;
    this.exemptRoles = options.exemptRoles || [];
  }
  
  /**
   * Default key generator function
   * @param {Object} req - Express request object
   * @returns {string} Rate limiting key
   */
  defaultKeyGenerator(req) {
    // Use IP address as the default key
    return req.ip || 
           req.connection.remoteAddress || 
           req.socket.remoteAddress ||
           'unknown';
  }
  
  /**
   * Create Express middleware for rate limiting
   * @returns {Function} Express middleware function
   */
  middleware() {
    return (req, res, next) => {
      // Skip rate limiting for exempt roles
      if (req.user && req.user.roles) {
        const userRoles = Array.isArray(req.user.roles) ? req.user.roles : [req.user.roles];
        if (userRoles.some(role => this.exemptRoles.includes(role))) {
          return next();
        }
      }
      
      // Generate the rate limiting key
      const key = this.keyGenerator(req);
      
      // Increment the request count
      const record = this.store.increment(key, this.windowMs);
      
      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', this.maxRequests);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, this.maxRequests - record.count));
      
      // Calculate reset time
      const resetTime = new Date(record.firstRequest + this.windowMs);
      res.setHeader('X-RateLimit-Reset', Math.ceil(resetTime.getTime() / 1000));
      
      // Check if rate limit exceeded
      if (record.count > this.maxRequests) {
        this.logger.warn(`Rate limit exceeded for ${key}`, {
          key,
          requests: record.count,
          limit: this.maxRequests,
          windowMs: this.windowMs
        });
        
        return res.status(429).json({
          error: 'Too Many Requests',
          message: 'Rate limit exceeded',
          retryAfter: Math.ceil((record.firstRequest + this.windowMs - Date.now()) / 1000)
        });
      }
      
      // Skip counting successful requests if enabled
      if (this.skipSuccessfulRequests) {
        const originalEnd = res.end;
        
        res.end = function(chunk, encoding) {
          res.end = originalEnd;
          
          // If response was successful, decrement the counter
          if (res.statusCode < 400) {
            record.count -= 1;
          }
          
          return res.end(chunk, encoding);
        };
      }
      
      next();
    };
  }
  
  /**
   * Create a rate limiter for specific API endpoints
   * @param {Object} options - Endpoint-specific options
   * @param {number} [options.windowMs] - Time window in milliseconds
   * @param {number} [options.maxRequests] - Maximum requests per window
   * @param {Function} [options.keyGenerator] - Function to generate rate limit keys
   * @returns {Function} Express middleware function
   */
  endpoint(options = {}) {
    const endpointLimiter = new RateLimiter({
      store: this.store,
      windowMs: options.windowMs || this.windowMs,
      maxRequests: options.maxRequests || this.maxRequests,
      keyGenerator: options.keyGenerator || this.keyGenerator,
      logger: this.logger,
      skipSuccessfulRequests: this.skipSuccessfulRequests,
      exemptRoles: this.exemptRoles
    });
    
    return endpointLimiter.middleware();
  }
  
  /**
   * Reset rate limit for a specific key
   * @param {string} key - The rate limiting key to reset
   */
  resetKey(key) {
    this.store.reset(key);
  }
  
  /**
   * Get current rate limit information for a key
   * @param {string} key - The rate limiting key
   * @returns {Object} Rate limit information
   */
  getRateLimitInfo(key) {
    const record = this.store.get(key);
    
    if (!record) {
      return {
        limit: this.maxRequests,
        current: 0,
        remaining: this.maxRequests,
        resetTime: new Date(Date.now() + this.windowMs)
      };
    }
    
    return {
      limit: this.maxRequests,
      current: record.count,
      remaining: Math.max(0, this.maxRequests - record.count),
      resetTime: new Date(record.firstRequest + this.windowMs)
    };
  }
}

module.exports = {
  RateLimiter,
  MemoryStore
};