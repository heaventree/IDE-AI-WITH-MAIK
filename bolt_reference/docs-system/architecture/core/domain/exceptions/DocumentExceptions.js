/**
 * Document Exceptions
 * 
 * Domain-level exceptions for documents.
 */

/**
 * Base document exception
 */
class DocumentException extends Error {
  /**
   * Create a new document exception
   * 
   * @param {string} message - Error message
   */
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Document not found exception
 */
class DocumentNotFoundException extends DocumentException {
  /**
   * Create a new document not found exception
   * 
   * @param {string} documentId - ID of document
   */
  constructor(documentId) {
    super(`Document with ID '${documentId}' not found`);
    this.documentId = documentId;
  }
}

/**
 * Invalid document state exception
 */
class InvalidDocumentStateException extends DocumentException {
  /**
   * Create a new invalid document state exception
   * 
   * @param {string} documentId - ID of document
   * @param {string} currentState - Current state
   * @param {string} attemptedOperation - Attempted operation
   */
  constructor(documentId, currentState, attemptedOperation) {
    super(`Cannot perform '${attemptedOperation}' on document with ID '${documentId}' in state '${currentState}'`);
    this.documentId = documentId;
    this.currentState = currentState;
    this.attemptedOperation = attemptedOperation;
  }
}

/**
 * Document validation exception
 */
class DocumentValidationException extends DocumentException {
  /**
   * Create a new document validation exception
   * 
   * @param {string} message - Error message
   * @param {Object} validationErrors - Validation errors
   */
  constructor(message, validationErrors) {
    super(message);
    this.validationErrors = validationErrors;
  }
}

module.exports = {
  DocumentException,
  DocumentNotFoundException,
  InvalidDocumentStateException,
  DocumentValidationException
};