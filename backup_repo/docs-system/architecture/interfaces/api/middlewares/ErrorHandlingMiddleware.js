/**
 * Error Handling Middleware
 * 
 * Middleware for handling errors in the API.
 */

const { ApplicationException, ValidationException } = require('../../../application/exceptions/ApplicationExceptions');
const { DocumentNotFoundException } = require('../../../core/domain/exceptions/DocumentExceptions');
const ApiResponse = require('../ApiResponse');

/**
 * Set up error handling middleware
 * 
 * @param {Express} app - Express application
 * @param {Logger} logger - Logger instance
 */
function setupErrorHandling(app, logger) {
  // Handle 404 errors
  app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
  });
  
  // Handle all other errors
  app.use((err, req, res, next) => {
    const status = err.status || 500;
    
    // Log the error
    if (status >= 500) {
      logger.error('Request error', {
        url: req.url,
        method: req.method,
        status,
        error: err.message,
        stack: err.stack
      });
    } else {
      logger.debug('Request error', {
        url: req.url,
        method: req.method,
        status,
        error: err.message
      });
    }
    
    // Handle specific error types
    if (err instanceof ValidationException) {
      return res.status(400).json(ApiResponse.validationError(err.validationErrors));
    }
    
    if (err instanceof DocumentNotFoundException) {
      return res.status(404).json(ApiResponse.notFound('document', err.documentId));
    }
    
    if (err.name === 'UnauthorizedOperationException') {
      return res.status(403).json(ApiResponse.forbidden(err.message));
    }
    
    if (err.code === 'UNAUTHORIZED') {
      return res.status(401).json(ApiResponse.unauthorized(err.message));
    }
    
    if (err.name === 'ResourceNotFoundException') {
      return res.status(404).json(ApiResponse.notFound(err.resourceType, err.resourceId));
    }
    
    if (err instanceof ApplicationException) {
      return res.status(400).json(ApiResponse.error(err.message, err.code, err.details));
    }
    
    // Handle other errors
    if (status === 404) {
      return res.status(404).json(ApiResponse.error('Not Found', 'NOT_FOUND'));
    }
    
    // Handle unexpected errors
    let errorMessage = 'Internal Server Error';
    let errorCode = 'INTERNAL_ERROR';
    
    // In development, provide more information
    if (process.env.NODE_ENV !== 'production') {
      errorMessage = err.message;
      errorCode = err.code || errorCode;
    }
    
    return res.status(status).json(ApiResponse.error(errorMessage, errorCode));
  });
}

module.exports = { setupErrorHandling };