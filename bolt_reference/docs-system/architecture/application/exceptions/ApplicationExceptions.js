/**
 * Application Exceptions
 * 
 * Application-level exceptions.
 */

/**
 * Base application exception
 */
class ApplicationException extends Error {
  /**
   * Create a new application exception
   * 
   * @param {string} message - Error message
   * @param {string} code - Error code
   * @param {any} details - Error details
   */
  constructor(message, code = 'APPLICATION_ERROR', details = null) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation exception
 */
class ValidationException extends ApplicationException {
  /**
   * Create a new validation exception
   * 
   * @param {Object} validationErrors - Validation errors
   * @param {string} message - Error message
   */
  constructor(validationErrors, message = 'Validation error') {
    super(message, 'VALIDATION_ERROR', { validationErrors });
    this.validationErrors = validationErrors;
  }
}

/**
 * Unauthorized operation exception
 */
class UnauthorizedOperationException extends ApplicationException {
  /**
   * Create a new unauthorized operation exception
   * 
   * @param {string} message - Error message
   */
  constructor(message = 'Unauthorized operation') {
    super(message, 'UNAUTHORIZED');
  }
}

/**
 * Resource not found exception
 */
class ResourceNotFoundException extends ApplicationException {
  /**
   * Create a new resource not found exception
   * 
   * @param {string} resourceType - Type of resource
   * @param {string} resourceId - ID of resource
   * @param {string} message - Error message
   */
  constructor(resourceType, resourceId, message = null) {
    super(
      message || `${resourceType} with ID '${resourceId}' not found`,
      'NOT_FOUND'
    );
    
    this.resourceType = resourceType;
    this.resourceId = resourceId;
  }
}

module.exports = {
  ApplicationException,
  ValidationException,
  UnauthorizedOperationException,
  ResourceNotFoundException
};