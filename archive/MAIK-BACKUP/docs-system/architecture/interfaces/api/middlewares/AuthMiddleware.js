/**
 * Authentication Middleware
 * 
 * Middleware for handling authentication in the API.
 */

const jwt = require('jsonwebtoken');
const ApiResponse = require('../ApiResponse');

/**
 * Set up authentication middleware
 * 
 * @param {Express} app - Express application
 * @param {Object} config - Authentication configuration
 * @param {Logger} logger - Logger instance
 */
function setupAuthMiddleware(app, config, logger) {
  const { enabled, jwtSecret } = config;
  
  if (!enabled) {
    logger.warn('Authentication is disabled');
    
    // Add a middleware that sets a mock user
    app.use((req, res, next) => {
      req.user = {
        id: 'mock-user-id',
        name: 'Mock User',
        role: 'admin'
      };
      
      next();
    });
    
    return;
  }
  
  // Add authentication middleware
  app.use((req, res, next) => {
    // Skip authentication for certain routes
    if (req.path === '/api/auth/login' || req.path === '/api/health') {
      return next();
    }
    
    // Get the token from the authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      logger.debug('No authorization header');
      return res.status(401).json(ApiResponse.unauthorized('No authorization header'));
    }
    
    // Check if the token is in the correct format
    const parts = authHeader.split(' ');
    
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      logger.debug('Invalid authorization header format');
      return res.status(401).json(ApiResponse.unauthorized('Invalid authorization header format'));
    }
    
    const token = parts[1];
    
    // Verify the token
    try {
      const decoded = jwt.verify(token, jwtSecret);
      
      // Set the user on the request
      req.user = decoded;
      
      next();
    } catch (error) {
      logger.debug('Invalid token', { error: error.message });
      
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json(ApiResponse.unauthorized('Token expired'));
      }
      
      return res.status(401).json(ApiResponse.unauthorized('Invalid token'));
    }
  });
  
  logger.info('Authentication middleware set up');
}

module.exports = { setupAuthMiddleware };