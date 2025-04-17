/**
 * Document Validators
 * 
 * Validation logic for document-related commands and queries.
 */

const { ValidationException } = require('../exceptions/ApplicationExceptions');
const { DocumentStatus } = require('../../core/domain/document/Document');

// Helper function to create validation errors
const createError = (field, message) => ({ field, message });

/**
 * Validator for CreateDocumentCommand
 */
class CreateDocumentValidator {
  /**
   * Validate a CreateDocumentCommand
   * 
   * @param {CreateDocumentCommand} command - Command to validate
   * @throws {ValidationException} If validation fails
   * @static
   */
  static validate(command) {
    const errors = [];
    
    // Title is required and should be a string
    if (!command.title) {
      errors.push(createError('title', 'Title is required'));
    } else if (typeof command.title !== 'string') {
      errors.push(createError('title', 'Title must be a string'));
    } else if (command.title.trim() === '') {
      errors.push(createError('title', 'Title cannot be empty'));
    } else if (command.title.length > 200) {
      errors.push(createError('title', 'Title cannot be longer than 200 characters'));
    }
    
    // Owner ID is required and should be a string
    if (!command.ownerId) {
      errors.push(createError('ownerId', 'Owner ID is required'));
    } else if (typeof command.ownerId !== 'string') {
      errors.push(createError('ownerId', 'Owner ID must be a string'));
    } else if (command.ownerId.trim() === '') {
      errors.push(createError('ownerId', 'Owner ID cannot be empty'));
    }
    
    // Content is optional but should be a string if provided
    if (command.content !== undefined && command.content !== null) {
      if (typeof command.content !== 'string') {
        errors.push(createError('content', 'Content must be a string'));
      } else if (command.content.length > 10000000) { // 10MB limit
        errors.push(createError('content', 'Content cannot be larger than 10MB'));
      }
    }
    
    // Tags are optional but should be an array of strings if provided
    if (command.tags !== undefined && command.tags !== null) {
      if (!Array.isArray(command.tags)) {
        errors.push(createError('tags', 'Tags must be an array'));
      } else {
        for (let i = 0; i < command.tags.length; i++) {
          const tag = command.tags[i];
          
          if (typeof tag !== 'string') {
            errors.push(createError(`tags[${i}]`, 'Tag must be a string'));
          } else if (tag.trim() === '') {
            errors.push(createError(`tags[${i}]`, 'Tag cannot be empty'));
          } else if (tag.length > 50) {
            errors.push(createError(`tags[${i}]`, 'Tag cannot be longer than 50 characters'));
          }
        }
        
        // Check for duplicate tags
        const uniqueTags = new Set(command.tags);
        if (uniqueTags.size !== command.tags.length) {
          errors.push(createError('tags', 'Tags must be unique'));
        }
      }
    }
    
    // Metadata is optional but should be an object if provided
    if (command.metadata !== undefined && command.metadata !== null) {
      if (typeof command.metadata !== 'object' || Array.isArray(command.metadata)) {
        errors.push(createError('metadata', 'Metadata must be an object'));
      }
    }
    
    // Throw a validation exception if there are errors
    if (errors.length > 0) {
      throw new ValidationException(errors);
    }
  }
}

/**
 * Validator for UpdateDocumentCommand
 */
class UpdateDocumentValidator {
  /**
   * Validate an UpdateDocumentCommand
   * 
   * @param {UpdateDocumentCommand} command - Command to validate
   * @throws {ValidationException} If validation fails
   * @static
   */
  static validate(command) {
    const errors = [];
    
    // Document ID is required and should be a string
    if (!command.documentId) {
      errors.push(createError('documentId', 'Document ID is required'));
    } else if (typeof command.documentId !== 'string') {
      errors.push(createError('documentId', 'Document ID must be a string'));
    } else if (command.documentId.trim() === '') {
      errors.push(createError('documentId', 'Document ID cannot be empty'));
    }
    
    // User ID is required and should be a string
    if (!command.userId) {
      errors.push(createError('userId', 'User ID is required'));
    } else if (typeof command.userId !== 'string') {
      errors.push(createError('userId', 'User ID must be a string'));
    } else if (command.userId.trim() === '') {
      errors.push(createError('userId', 'User ID cannot be empty'));
    }
    
    // Content is required and should be a string
    if (!command.content) {
      errors.push(createError('content', 'Content is required'));
    } else if (typeof command.content !== 'string') {
      errors.push(createError('content', 'Content must be a string'));
    } else if (command.content.length > 10000000) { // 10MB limit
      errors.push(createError('content', 'Content cannot be larger than 10MB'));
    }
    
    // Title is optional but should be a string if provided
    if (command.title !== undefined && command.title !== null) {
      if (typeof command.title !== 'string') {
        errors.push(createError('title', 'Title must be a string'));
      } else if (command.title.trim() === '') {
        errors.push(createError('title', 'Title cannot be empty'));
      } else if (command.title.length > 200) {
        errors.push(createError('title', 'Title cannot be longer than 200 characters'));
      }
    }
    
    // Changes is optional but should be an object if provided
    if (command.changes !== undefined && command.changes !== null) {
      if (typeof command.changes !== 'object' || Array.isArray(command.changes)) {
        errors.push(createError('changes', 'Changes must be an object'));
      }
    }
    
    // Throw a validation exception if there are errors
    if (errors.length > 0) {
      throw new ValidationException(errors);
    }
  }
}

/**
 * Validator for PublishDocumentCommand
 */
class PublishDocumentValidator {
  /**
   * Validate a PublishDocumentCommand
   * 
   * @param {PublishDocumentCommand} command - Command to validate
   * @throws {ValidationException} If validation fails
   * @static
   */
  static validate(command) {
    const errors = [];
    
    // Document ID is required and should be a string
    if (!command.documentId) {
      errors.push(createError('documentId', 'Document ID is required'));
    } else if (typeof command.documentId !== 'string') {
      errors.push(createError('documentId', 'Document ID must be a string'));
    } else if (command.documentId.trim() === '') {
      errors.push(createError('documentId', 'Document ID cannot be empty'));
    }
    
    // User ID is required and should be a string
    if (!command.userId) {
      errors.push(createError('userId', 'User ID is required'));
    } else if (typeof command.userId !== 'string') {
      errors.push(createError('userId', 'User ID must be a string'));
    } else if (command.userId.trim() === '') {
      errors.push(createError('userId', 'User ID cannot be empty'));
    }
    
    // Environment is optional but should be a string if provided
    if (command.environment !== undefined && command.environment !== null) {
      if (typeof command.environment !== 'string') {
        errors.push(createError('environment', 'Environment must be a string'));
      } else if (command.environment.trim() === '') {
        errors.push(createError('environment', 'Environment cannot be empty'));
      }
    }
    
    // Throw a validation exception if there are errors
    if (errors.length > 0) {
      throw new ValidationException(errors);
    }
  }
}

/**
 * Validator for GetDocumentQuery
 */
class GetDocumentValidator {
  /**
   * Validate a GetDocumentQuery
   * 
   * @param {GetDocumentQuery} query - Query to validate
   * @throws {ValidationException} If validation fails
   * @static
   */
  static validate(query) {
    const errors = [];
    
    // Document ID is required and should be a string
    if (!query.documentId) {
      errors.push(createError('documentId', 'Document ID is required'));
    } else if (typeof query.documentId !== 'string') {
      errors.push(createError('documentId', 'Document ID must be a string'));
    } else if (query.documentId.trim() === '') {
      errors.push(createError('documentId', 'Document ID cannot be empty'));
    }
    
    // Version is optional but should be a number if provided
    if (query.version !== undefined && query.version !== null) {
      if (typeof query.version !== 'number') {
        errors.push(createError('version', 'Version must be a number'));
      } else if (query.version < 1) {
        errors.push(createError('version', 'Version must be a positive integer'));
      } else if (!Number.isInteger(query.version)) {
        errors.push(createError('version', 'Version must be an integer'));
      }
    }
    
    // Include content is optional but should be a boolean if provided
    if (query.includeContent !== undefined && query.includeContent !== null) {
      if (typeof query.includeContent !== 'boolean') {
        errors.push(createError('includeContent', 'Include content flag must be a boolean'));
      }
    }
    
    // Throw a validation exception if there are errors
    if (errors.length > 0) {
      throw new ValidationException(errors);
    }
  }
}

/**
 * Validator for SearchDocumentsQuery
 */
class SearchDocumentsValidator {
  /**
   * Validate a SearchDocumentsQuery
   * 
   * @param {SearchDocumentsQuery} query - Query to validate
   * @throws {ValidationException} If validation fails
   * @static
   */
  static validate(query) {
    const errors = [];
    
    // Owner ID is optional but should be a string if provided
    if (query.ownerId !== undefined && query.ownerId !== null) {
      if (typeof query.ownerId !== 'string') {
        errors.push(createError('ownerId', 'Owner ID must be a string'));
      } else if (query.ownerId.trim() === '') {
        errors.push(createError('ownerId', 'Owner ID cannot be empty'));
      }
    }
    
    // Status is optional but should be a valid status if provided
    if (query.status !== undefined && query.status !== null) {
      if (typeof query.status !== 'string') {
        errors.push(createError('status', 'Status must be a string'));
      } else if (!Object.values(DocumentStatus).includes(query.status)) {
        errors.push(createError('status', `Status must be one of: ${Object.values(DocumentStatus).join(', ')}`));
      }
    }
    
    // Tag is optional but should be a string if provided
    if (query.tag !== undefined && query.tag !== null) {
      if (typeof query.tag !== 'string') {
        errors.push(createError('tag', 'Tag must be a string'));
      } else if (query.tag.trim() === '') {
        errors.push(createError('tag', 'Tag cannot be empty'));
      }
    }
    
    // Search query is optional but should be a string if provided
    if (query.searchQuery !== undefined && query.searchQuery !== null) {
      if (typeof query.searchQuery !== 'string') {
        errors.push(createError('searchQuery', 'Search query must be a string'));
      }
    }
    
    // Limit is optional but should be a number if provided
    if (query.limit !== undefined && query.limit !== null) {
      if (typeof query.limit !== 'number') {
        errors.push(createError('limit', 'Limit must be a number'));
      } else if (query.limit < 1) {
        errors.push(createError('limit', 'Limit must be a positive integer'));
      } else if (!Number.isInteger(query.limit)) {
        errors.push(createError('limit', 'Limit must be an integer'));
      } else if (query.limit > 100) {
        errors.push(createError('limit', 'Limit cannot be greater than 100'));
      }
    }
    
    // Offset is optional but should be a number if provided
    if (query.offset !== undefined && query.offset !== null) {
      if (typeof query.offset !== 'number') {
        errors.push(createError('offset', 'Offset must be a number'));
      } else if (query.offset < 0) {
        errors.push(createError('offset', 'Offset must be a non-negative integer'));
      } else if (!Number.isInteger(query.offset)) {
        errors.push(createError('offset', 'Offset must be an integer'));
      }
    }
    
    // Throw a validation exception if there are errors
    if (errors.length > 0) {
      throw new ValidationException(errors);
    }
  }
}

// Export all validators
module.exports = {
  CreateDocumentValidator,
  UpdateDocumentValidator,
  PublishDocumentValidator,
  GetDocumentValidator,
  SearchDocumentsValidator
};