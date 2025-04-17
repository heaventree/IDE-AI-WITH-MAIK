/**
 * API Response
 * 
 * Standardized API response formatter.
 */

/**
 * Standardized API response
 */
class ApiResponse {
  /**
   * Create a success response
   * 
   * @param {any} data - Response data
   * @param {string} message - Success message
   * @returns {Object} Response object
   */
  static success(data, message = 'Operation successful') {
    return {
      success: true,
      message,
      data
    };
  }
  
  /**
   * Create a paginated response
   * 
   * @param {Array} items - Paginated items
   * @param {number} totalCount - Total count of items
   * @param {number} limit - Page size
   * @param {number} offset - Page offset
   * @param {string} message - Success message
   * @returns {Object} Response object
   */
  static paginated(items, totalCount, limit, offset, message = 'Data retrieved successfully') {
    return {
      success: true,
      message,
      data: {
        items,
        pagination: {
          totalCount,
          limit,
          offset,
          hasMore: offset + items.length < totalCount
        }
      }
    };
  }
  
  /**
   * Create a created response
   * 
   * @param {any} data - Created resource
   * @param {string} message - Success message
   * @returns {Object} Response object
   */
  static created(data, message = 'Resource created successfully') {
    return {
      success: true,
      message,
      data
    };
  }
  
  /**
   * Create an error response
   * 
   * @param {string} message - Error message
   * @param {string} code - Error code
   * @param {Object} details - Error details
   * @returns {Object} Response object
   */
  static error(message, code = 'ERROR', details = null) {
    const response = {
      success: false,
      message,
      error: {
        code
      }
    };
    
    if (details) {
      response.error.details = details;
    }
    
    return response;
  }
  
  /**
   * Create a not found response
   * 
   * @param {string} resourceType - Type of resource
   * @param {string} resourceId - ID of resource
   * @returns {Object} Response object
   */
  static notFound(resourceType, resourceId) {
    return ApiResponse.error(
      `${resourceType} with ID '${resourceId}' not found`,
      'NOT_FOUND'
    );
  }
  
  /**
   * Create a validation error response
   * 
   * @param {Object} validationErrors - Validation errors
   * @returns {Object} Response object
   */
  static validationError(validationErrors) {
    return ApiResponse.error(
      'Validation error',
      'VALIDATION_ERROR',
      { validationErrors }
    );
  }
  
  /**
   * Create an unauthorized response
   * 
   * @param {string} message - Error message
   * @returns {Object} Response object
   */
  static unauthorized(message = 'Unauthorized') {
    return ApiResponse.error(message, 'UNAUTHORIZED');
  }
  
  /**
   * Create a forbidden response
   * 
   * @param {string} message - Error message
   * @returns {Object} Response object
   */
  static forbidden(message = 'Forbidden') {
    return ApiResponse.error(message, 'FORBIDDEN');
  }
}

module.exports = ApiResponse;