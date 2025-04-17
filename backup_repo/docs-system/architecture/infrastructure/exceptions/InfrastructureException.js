/**
 * Base class for infrastructure exceptions
 * 
 * All infrastructure-specific exceptions should extend this class.
 */

class InfrastructureException extends Error {
  /**
   * Create a new InfrastructureException
   * 
   * @param {string} code - Error code
   * @param {string} userMessage - User-friendly error message
   * @param {string} technicalDetails - Technical details for logging
   * @param {Error} [innerException=null] - Inner exception that caused this error
   */
  constructor(code, userMessage, technicalDetails, innerException = null) {
    super(technicalDetails || userMessage);
    
    this.code = code;
    this.userMessage = userMessage;
    this.technicalDetails = technicalDetails;
    this.innerException = innerException;
    this.name = this.constructor.name;
    
    // Capture stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Thrown when a database operation fails
 */
class DatabaseException extends InfrastructureException {
  /**
   * Create a new DatabaseException
   * 
   * @param {string} code - Error code
   * @param {string} userMessage - User-friendly error message
   * @param {string} technicalDetails - Technical details for logging
   * @param {Error} [innerException=null] - Inner exception that caused this error
   */
  constructor(code, userMessage, technicalDetails, innerException = null) {
    super(code, userMessage, technicalDetails, innerException);
  }
}

/**
 * Thrown when a message broker operation fails
 */
class MessageBrokerException extends InfrastructureException {
  /**
   * Create a new MessageBrokerException
   * 
   * @param {string} code - Error code
   * @param {string} userMessage - User-friendly error message
   * @param {string} technicalDetails - Technical details for logging
   * @param {Error} [innerException=null] - Inner exception that caused this error
   */
  constructor(code, userMessage, technicalDetails, innerException = null) {
    super(code, userMessage, technicalDetails, innerException);
  }
}

/**
 * Thrown when an external service operation fails
 */
class ExternalServiceException extends InfrastructureException {
  /**
   * Create a new ExternalServiceException
   * 
   * @param {string} code - Error code
   * @param {string} userMessage - User-friendly error message
   * @param {string} technicalDetails - Technical details for logging
   * @param {string} serviceName - Name of the external service
   * @param {Error} [innerException=null] - Inner exception that caused this error
   */
  constructor(code, userMessage, technicalDetails, serviceName, innerException = null) {
    super(code, userMessage, technicalDetails, innerException);
    this.serviceName = serviceName;
  }
}

/**
 * Thrown when a file storage operation fails
 */
class FileStorageException extends InfrastructureException {
  /**
   * Create a new FileStorageException
   * 
   * @param {string} code - Error code
   * @param {string} userMessage - User-friendly error message
   * @param {string} technicalDetails - Technical details for logging
   * @param {string} filePath - Path of the file
   * @param {Error} [innerException=null] - Inner exception that caused this error
   */
  constructor(code, userMessage, technicalDetails, filePath, innerException = null) {
    super(code, userMessage, technicalDetails, innerException);
    this.filePath = filePath;
  }
}

/**
 * Thrown when a cache operation fails
 */
class CacheException extends InfrastructureException {
  /**
   * Create a new CacheException
   * 
   * @param {string} code - Error code
   * @param {string} userMessage - User-friendly error message
   * @param {string} technicalDetails - Technical details for logging
   * @param {string} cacheKey - Cache key
   * @param {Error} [innerException=null] - Inner exception that caused this error
   */
  constructor(code, userMessage, technicalDetails, cacheKey, innerException = null) {
    super(code, userMessage, technicalDetails, innerException);
    this.cacheKey = cacheKey;
  }
}

module.exports = {
  InfrastructureException,
  DatabaseException,
  MessageBrokerException,
  ExternalServiceException,
  FileStorageException,
  CacheException
};