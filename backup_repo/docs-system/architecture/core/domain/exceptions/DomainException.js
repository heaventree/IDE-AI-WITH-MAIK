/**
 * Base class for domain exceptions
 * 
 * All domain-specific exceptions should extend this class.
 */

class DomainException extends Error {
  /**
   * Create a new DomainException
   * 
   * @param {string} code - Error code
   * @param {string} userMessage - User-friendly error message
   * @param {string} technicalDetails - Technical details for logging
   */
  constructor(code, userMessage, technicalDetails) {
    super(technicalDetails || userMessage);
    
    this.code = code;
    this.userMessage = userMessage;
    this.technicalDetails = technicalDetails;
    this.name = this.constructor.name;
    
    // Capture stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

module.exports = DomainException;