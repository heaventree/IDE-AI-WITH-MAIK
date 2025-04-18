/**
 * Encryption Module for Documentation System
 * 
 * This module provides encryption and decryption functionality for
 * protecting sensitive data both at rest and in transit.
 */

const crypto = require('crypto');

// Configuration (should be moved to environment variables in production)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'docs-system-dev-key-change-in-production';
const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // For AES, this is always 16 bytes
const AUTH_TAG_LENGTH = 16; // For GCM mode

/**
 * Encryption class for handling data encryption/decryption
 */
class Encryption {
  /**
   * Encrypt data using AES-256-GCM
   * @param {string|Object} data - Data to encrypt
   * @returns {string} Encrypted data as a base64 string
   */
  static encrypt(data) {
    try {
      // Convert object to string if necessary
      const dataString = typeof data === 'object' ? JSON.stringify(data) : String(data);
      
      // Generate a random initialization vector
      const iv = crypto.randomBytes(IV_LENGTH);
      
      // Create cipher with key, IV, and algorithm
      const cipher = crypto.createCipheriv(
        ENCRYPTION_ALGORITHM, 
        Buffer.from(ENCRYPTION_KEY, 'hex'), 
        iv
      );
      
      // Encrypt the data
      let encrypted = cipher.update(dataString, 'utf8', 'base64');
      encrypted += cipher.final('base64');
      
      // Get the authentication tag
      const authTag = cipher.getAuthTag();
      
      // Combine IV, encrypted data, and auth tag in format: base64(iv):base64(authTag):base64(encryptedData)
      return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted}`;
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt data');
    }
  }
  
  /**
   * Decrypt data encrypted with AES-256-GCM
   * @param {string} encryptedData - Encrypted data in the format iv:authTag:data
   * @param {boolean} asObject - Whether to parse the result as JSON
   * @returns {string|Object} Decrypted data
   */
  static decrypt(encryptedData, asObject = false) {
    try {
      // Split the encrypted data into its components
      const [ivBase64, authTagBase64, encryptedBase64] = encryptedData.split(':');
      
      if (!ivBase64 || !authTagBase64 || !encryptedBase64) {
        throw new Error('Invalid encrypted data format');
      }
      
      // Convert from base64 to buffers
      const iv = Buffer.from(ivBase64, 'base64');
      const authTag = Buffer.from(authTagBase64, 'base64');
      
      // Create decipher
      const decipher = crypto.createDecipheriv(
        ENCRYPTION_ALGORITHM, 
        Buffer.from(ENCRYPTION_KEY, 'hex'), 
        iv
      );
      
      // Set the authentication tag
      decipher.setAuthTag(authTag);
      
      // Decrypt the data
      let decrypted = decipher.update(encryptedBase64, 'base64', 'utf8');
      decrypted += decipher.final('utf8');
      
      // Parse as JSON if requested
      if (asObject) {
        return JSON.parse(decrypted);
      }
      
      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt data');
    }
  }
  
  /**
   * Generate a cryptographically secure random key
   * @param {number} [length=32] - Length of the key in bytes
   * @returns {string} Hex-encoded random key
   */
  static generateKey(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }
  
  /**
   * Create a secure hash of data
   * @param {string} data - Data to hash
   * @param {string} [algorithm='sha256'] - Hash algorithm to use
   * @returns {string} Hex-encoded hash
   */
  static hash(data, algorithm = 'sha256') {
    return crypto
      .createHash(algorithm)
      .update(data)
      .digest('hex');
  }
  
  /**
   * Create an HMAC signature for data
   * @param {string} data - Data to sign
   * @param {string} [key=ENCRYPTION_KEY] - Key to use for signing
   * @param {string} [algorithm='sha256'] - HMAC algorithm to use
   * @returns {string} Hex-encoded HMAC signature
   */
  static hmac(data, key = ENCRYPTION_KEY, algorithm = 'sha256') {
    return crypto
      .createHmac(algorithm, key)
      .update(data)
      .digest('hex');
  }
  
  /**
   * Encrypt sensitive fields in an object
   * @param {Object} obj - Object containing data
   * @param {Array<string>} sensitiveFields - Array of field names to encrypt
   * @returns {Object} Object with encrypted fields
   */
  static encryptFields(obj, sensitiveFields) {
    const result = { ...obj };
    
    for (const field of sensitiveFields) {
      if (obj[field] !== undefined) {
        result[field] = this.encrypt(obj[field]);
      }
    }
    
    return result;
  }
  
  /**
   * Decrypt sensitive fields in an object
   * @param {Object} obj - Object containing encrypted data
   * @param {Array<string>} encryptedFields - Array of field names to decrypt
   * @param {Array<string>} objectFields - Array of field names to parse as objects
   * @returns {Object} Object with decrypted fields
   */
  static decryptFields(obj, encryptedFields, objectFields = []) {
    const result = { ...obj };
    
    for (const field of encryptedFields) {
      if (obj[field] !== undefined) {
        const asObject = objectFields.includes(field);
        result[field] = this.decrypt(obj[field], asObject);
      }
    }
    
    return result;
  }
}

module.exports = Encryption;