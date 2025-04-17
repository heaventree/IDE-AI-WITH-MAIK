/**
 * Error Handling Middleware
 * 
 * Global error handling middleware for Express applications.
 */

const ApiResponse = require('../api/ApiResponse');
const { ValidationException, ApplicationException } = require('../../application/exceptions/ApplicationExceptions');
const { DocumentNotFoundException } = require('../../core/domain/exceptions/DocumentExceptions');

/**
 * Error handling middleware
 * 
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 * @param {Logger} logger - Logger instance
 */
function errorMiddleware(err, req, res, next, logger) {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    query: req.query,
    params: req.params
  });
  
  // Handle ValidationException
  if (err instanceof ValidationException) {
    return res.status(400).json(
      ApiResponse.validationError(err.userMessage, err.validationErrors)
    );
  }
  
  // Handle DocumentNotFoundException
  if (err instanceof DocumentNotFoundException) {
    return res.status(404).json(
      ApiResponse.notFound('Document not found', 'document', err.documentId)
    );
  }
  
  // Handle UnauthorizedOperationException
  if (err.name === 'UnauthorizedOperationException') {
    return res.status(403).json(
      ApiResponse.forbidden(
        'You do not have permission to perform this operation',
        err.operation,
        err.resourceType
      )
    );
  }
  
  // Handle ApplicationException
  if (err instanceof ApplicationException) {
    return res.status(500).json(
      ApiResponse.serverError(err.userMessage, err.code)
    );
  }
  
  // Handle JSON parsing errors
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json(
      ApiResponse.validationError('Invalid JSON', { json: 'Invalid JSON format' })
    );
  }
  
  // Default server error
  res.status(500).json(
    ApiResponse.serverError('An unexpected error occurred')
  );
}

/**
 * Create error middleware with logger
 * 
 * @param {Logger} logger - Logger instance
 * @returns {Function} Configured error middleware
 */
function createErrorMiddleware(logger) {
  return (err, req, res, next) => errorMiddleware(err, req, res, next, logger);
}

module.exports = createErrorMiddleware;