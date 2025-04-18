/**
 * Authentication Module for Documentation System
 * 
 * This module provides secure authentication functionality including
 * JWT token generation, validation, and middleware for Express.js.
 */

const crypto = require('crypto');
const jwt = require('jsonwebtoken'); // Note: This dependency would need to be installed

// Configuration (should be moved to environment variables in production)
const JWT_SECRET = process.env.JWT_SECRET || 'docs-system-dev-secret-change-in-production';
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '4h';
const REFRESH_TOKEN_EXPIRATION = process.env.REFRESH_TOKEN_EXPIRATION || '7d';
const PASSWORD_SALT_ROUNDS = 10;
const TOKEN_ISSUER = 'documentation-system';

/**
 * Authentication class for managing user authentication
 */
class Authentication {
  /**
   * Generate a secure password hash
   * @param {string} password - Plain text password
   * @returns {Promise<string>} Hashed password
   */
  static async hashPassword(password) {
    return new Promise((resolve, reject) => {
      // Generate random salt
      crypto.randomBytes(16, (err, salt) => {
        if (err) return reject(err);
        
        // Use PBKDF2 for password hashing
        crypto.pbkdf2(password, salt, 10000, 64, 'sha512', (err, derivedKey) => {
          if (err) return reject(err);
          
          // Format: salt.hash
          resolve(`${salt.toString('hex')}.${derivedKey.toString('hex')}`);
        });
      });
    });
  }
  
  /**
   * Verify a password against a hash
   * @param {string} password - Plain text password to verify
   * @param {string} storedHash - Previously hashed password
   * @returns {Promise<boolean>} Whether the password matches
   */
  static async verifyPassword(password, storedHash) {
    return new Promise((resolve, reject) => {
      try {
        // Split hash into salt and hash components
        const [salt, hash] = storedHash.split('.');
        const saltBuffer = Buffer.from(salt, 'hex');
        
        // Hash the provided password with the same salt
        crypto.pbkdf2(password, saltBuffer, 10000, 64, 'sha512', (err, derivedKey) => {
          if (err) return reject(err);
          
          // Compare the generated hash with the stored hash
          resolve(derivedKey.toString('hex') === hash);
        });
      } catch (error) {
        reject(error);
      }
    });
  }
  
  /**
   * Generate a JWT token for a user
   * @param {Object} user - User object
   * @returns {string} JWT token
   */
  static generateToken(user) {
    const payload = {
      sub: user.id,
      name: user.username || user.name,
      email: user.email,
      roles: user.roles || [],
      permissions: user.permissions || [],
      iat: Math.floor(Date.now() / 1000)
    };
    
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRATION,
      issuer: TOKEN_ISSUER
    });
  }
  
  /**
   * Generate a refresh token
   * @param {Object} user - User object
   * @returns {string} Refresh token
   */
  static generateRefreshToken(user) {
    const payload = {
      sub: user.id,
      type: 'refresh',
      iat: Math.floor(Date.now() / 1000)
    };
    
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRATION,
      issuer: TOKEN_ISSUER
    });
  }
  
  /**
   * Verify and decode a JWT token
   * @param {string} token - JWT token to verify
   * @returns {Object|null} Decoded token payload or null if invalid
   */
  static verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET, {
        issuer: TOKEN_ISSUER
      });
    } catch (error) {
      console.error('Token verification failed:', error.message);
      return null;
    }
  }
  
  /**
   * Authentication middleware for Express.js
   * @returns {Function} Express middleware function
   */
  static authenticate() {
    return (req, res, next) => {
      // Get the Authorization header
      const authHeader = req.headers.authorization;
      
      if (!authHeader) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required'
        });
      }
      
      // Extract the token
      const [type, token] = authHeader.split(' ');
      
      if (type !== 'Bearer' || !token) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid authorization format. Use Bearer [token]'
        });
      }
      
      // Verify the token
      const decoded = Authentication.verifyToken(token);
      
      if (!decoded) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid or expired token'
        });
      }
      
      // Attach user information to the request
      req.user = decoded;
      
      next();
    };
  }
  
  /**
   * Refresh token middleware for Express.js
   * @returns {Function} Express middleware function
   */
  static refreshToken() {
    return (req, res, next) => {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Refresh token is required'
        });
      }
      
      // Verify the refresh token
      const decoded = Authentication.verifyToken(refreshToken);
      
      if (!decoded || decoded.type !== 'refresh') {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid or expired refresh token'
        });
      }
      
      // In a real implementation, you would load the user from a database
      // and verify that the refresh token is still valid (not revoked)
      
      // For demo purposes, create a mock user
      const user = {
        id: decoded.sub,
        // Other user properties would be loaded from the database
      };
      
      // Generate a new access token
      const newToken = Authentication.generateToken(user);
      
      res.json({
        token: newToken,
        expiresIn: JWT_EXPIRATION
      });
    };
  }
  
  /**
   * Validate and sanitize an email address
   * @param {string} email - Email address to validate
   * @returns {boolean} Whether the email is valid
   */
  static isValidEmail(email) {
    if (!email || typeof email !== 'string') {
      return false;
    }
    
    // Basic email validation regex
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }
  
  /**
   * Check if a password meets the security requirements
   * @param {string} password - Password to validate
   * @returns {Object} Result with valid flag and reason if invalid
   */
  static validatePassword(password) {
    if (!password || typeof password !== 'string') {
      return { valid: false, reason: 'Password is required' };
    }
    
    if (password.length < 8) {
      return { valid: false, reason: 'Password must be at least 8 characters long' };
    }
    
    if (!/[A-Z]/.test(password)) {
      return { valid: false, reason: 'Password must contain at least one uppercase letter' };
    }
    
    if (!/[a-z]/.test(password)) {
      return { valid: false, reason: 'Password must contain at least one lowercase letter' };
    }
    
    if (!/[0-9]/.test(password)) {
      return { valid: false, reason: 'Password must contain at least one number' };
    }
    
    if (!/[^A-Za-z0-9]/.test(password)) {
      return { valid: false, reason: 'Password must contain at least one special character' };
    }
    
    return { valid: true };
  }
}

module.exports = Authentication;