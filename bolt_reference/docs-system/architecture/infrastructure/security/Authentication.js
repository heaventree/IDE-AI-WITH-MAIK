/**
 * Authentication Service
 * 
 * Handles user authentication and token verification.
 */

const jwt = require('jsonwebtoken');

/**
 * Authentication service implementation
 */
class AuthenticationService {
  /**
   * Create a new AuthenticationService
   * 
   * @param {Object} config - Authentication configuration
   * @param {Logger} logger - Logger instance
   * @param {CircuitBreaker} circuitBreaker - Circuit breaker for external authentication service
   */
  constructor(config, logger, circuitBreaker) {
    /**
     * Authentication configuration
     * @type {Object}
     */
    this.config = config;
    
    /**
     * Logger instance
     * @type {Logger}
     */
    this.logger = logger;
    
    /**
     * Circuit breaker for external authentication service
     * @type {CircuitBreaker}
     */
    this.circuitBreaker = circuitBreaker;
  }
  
  /**
   * Verify an authentication token
   * 
   * @param {string} token - JWT token to verify
   * @returns {Promise<Object>} Verification result
   */
  async verifyToken(token) {
    try {
      return await this.circuitBreaker.execute(async () => {
        this.logger.debug('Verifying token');
        
        // Verify the token
        const decoded = jwt.verify(token, this.config.jwtSecret);
        
        // Check if token has expired
        const now = Math.floor(Date.now() / 1000);
        
        if (decoded.exp && decoded.exp < now) {
          this.logger.debug('Token has expired', { expiry: decoded.exp, now });
          
          return {
            valid: false,
            reason: 'TOKEN_EXPIRED'
          };
        }
        
        this.logger.debug('Token verified successfully', { userId: decoded.sub });
        
        return {
          valid: true,
          userId: decoded.sub,
          roles: decoded.roles || [],
          permissions: decoded.permissions || [],
          tokenData: decoded
        };
      });
    } catch (error) {
      this.logger.warn('Token verification failed', { error: error.message });
      
      if (error.name === 'JsonWebTokenError') {
        return {
          valid: false,
          reason: 'INVALID_TOKEN',
          message: error.message
        };
      }
      
      if (error.name === 'TokenExpiredError') {
        return {
          valid: false,
          reason: 'TOKEN_EXPIRED',
          message: 'Token has expired'
        };
      }
      
      return {
        valid: false,
        reason: 'VERIFICATION_ERROR',
        message: error.message
      };
    }
  }
  
  /**
   * Generate a JWT token for a user
   * 
   * @param {string} userId - User ID
   * @param {Array<string>} roles - User roles
   * @param {Array<string>} permissions - User permissions
   * @param {Object} [additionalClaims={}] - Additional claims to include in the token
   * @returns {Promise<Object>} Generated tokens
   */
  async generateToken(userId, roles = [], permissions = [], additionalClaims = {}) {
    try {
      this.logger.debug('Generating token', { userId, roles });
      
      const now = Math.floor(Date.now() / 1000);
      
      const payload = {
        sub: userId,
        roles,
        permissions,
        iat: now,
        ...additionalClaims
      };
      
      // Add expiration if configured
      if (this.config.tokenExpiresIn) {
        // If expiresIn is a string like '1h', convert it to seconds
        const expiresInSeconds = typeof this.config.tokenExpiresIn === 'string'
          ? this._parseExpirationString(this.config.tokenExpiresIn)
          : this.config.tokenExpiresIn;
        
        payload.exp = now + expiresInSeconds;
      }
      
      // Generate access token
      const accessToken = jwt.sign(payload, this.config.jwtSecret);
      
      // Generate refresh token if configured
      let refreshToken = null;
      
      if (this.config.refreshTokenExpiresIn) {
        const refreshPayload = {
          sub: userId,
          type: 'refresh',
          iat: now
        };
        
        // If refreshExpiresIn is a string like '7d', convert it to seconds
        const refreshExpiresInSeconds = typeof this.config.refreshTokenExpiresIn === 'string'
          ? this._parseExpirationString(this.config.refreshTokenExpiresIn)
          : this.config.refreshTokenExpiresIn;
        
        refreshPayload.exp = now + refreshExpiresInSeconds;
        
        refreshToken = jwt.sign(refreshPayload, this.config.jwtSecret);
      }
      
      return {
        accessToken,
        refreshToken,
        expiresIn: payload.exp ? payload.exp - now : null
      };
    } catch (error) {
      this.logger.error('Failed to generate token', { error: error.message, stack: error.stack });
      throw error;
    }
  }
  
  /**
   * Parse an expiration string (e.g., '1h', '7d') to seconds
   * 
   * @param {string} expirationString - Expiration string
   * @returns {number} Expiration in seconds
   * @private
   */
  _parseExpirationString(expirationString) {
    const match = expirationString.match(/^(\d+)([smhdw])$/);
    
    if (!match) {
      throw new Error(`Invalid expiration format: ${expirationString}`);
    }
    
    const value = parseInt(match[1], 10);
    const unit = match[2];
    
    const multipliers = {
      s: 1,           // seconds
      m: 60,          // minutes
      h: 60 * 60,     // hours
      d: 60 * 60 * 24, // days
      w: 60 * 60 * 24 * 7 // weeks
    };
    
    return value * multipliers[unit];
  }
}

module.exports = AuthenticationService;