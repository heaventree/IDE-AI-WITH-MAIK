/**
 * Authentication Middleware
 * 
 * Middleware for authenticating and authorizing users.
 */

const ApiResponse = require('../api/ApiResponse');

/**
 * Authentication middleware
 * 
 * @param {Object} authService - Authentication service
 * @param {Logger} logger - Logger instance
 * @returns {Function} Express middleware
 */
function createAuthMiddleware(authService, logger) {
  return async function authenticate(req, res, next) {
    try {
      // Get the authorization header
      const authHeader = req.headers.authorization;
      
      if (!authHeader) {
        return res.status(401).json(
          ApiResponse.unauthorized('Authentication required')
        );
      }
      
      // Check if it's a Bearer token
      const parts = authHeader.split(' ');
      
      if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return res.status(401).json(
          ApiResponse.unauthorized('Invalid authentication format')
        );
      }
      
      const token = parts[1];
      
      // Verify the token
      const result = await authService.verifyToken(token);
      
      if (!result.valid) {
        return res.status(401).json(
          ApiResponse.unauthorized('Invalid or expired token')
        );
      }
      
      // Attach user info to the request
      req.user = {
        id: result.userId,
        roles: result.roles || []
      };
      
      // Continue to the next middleware or route handler
      next();
    } catch (error) {
      logger.error('Authentication error', {
        error: error.message,
        stack: error.stack
      });
      
      res.status(500).json(
        ApiResponse.serverError('Authentication service error')
      );
    }
  };
}

/**
 * Authorization middleware factory
 * 
 * @param {Array<string>} requiredRoles - Roles required to access the endpoint
 * @returns {Function} Express middleware
 */
function authorize(requiredRoles = []) {
  return function authorization(req, res, next) {
    // No roles required means everyone can access
    if (requiredRoles.length === 0) {
      return next();
    }
    
    // Check if req.user exists (set by authenticate middleware)
    if (!req.user) {
      return res.status(401).json(
        ApiResponse.unauthorized('Authentication required')
      );
    }
    
    // Check if the user has the required roles
    const hasRequiredRole = requiredRoles.some(role => 
      req.user.roles.includes(role)
    );
    
    if (!hasRequiredRole) {
      return res.status(403).json(
        ApiResponse.forbidden('Insufficient permissions')
      );
    }
    
    // Continue to the next middleware or route handler
    next();
  };
}

module.exports = {
  createAuthMiddleware,
  authorize
};