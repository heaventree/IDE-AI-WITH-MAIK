/**
 * Get Document Use Case
 * 
 * Application service that handles retrieving a document.
 */

const { ApplicationException, UnauthorizedOperationException } = require('../../exceptions/ApplicationExceptions');
const { GetDocumentValidator } = require('../../validators/DocumentValidators');
const { DocumentNotFoundException } = require('../../../core/domain/exceptions/DocumentExceptions');
const DocumentDTO = require('../../dtos/DocumentDTO');

class GetDocumentUseCase {
  /**
   * Create a new GetDocumentUseCase
   * 
   * @param {DocumentRepository} documentRepository - Repository for document access
   * @param {Logger} logger - Logger instance
   */
  constructor(documentRepository, logger) {
    this.documentRepository = documentRepository;
    this.logger = logger;
  }
  
  /**
   * Execute the use case
   * 
   * @param {GetDocumentQuery} query - Query containing document retrieval parameters
   * @returns {Promise<DocumentDTO>} Data transfer object representing the document
   */
  async execute(query) {
    this.logger.info('Getting document', { documentId: query.documentId });
    
    try {
      // Validate the query
      GetDocumentValidator.validate(query);
      
      // Get the document
      const document = await this.documentRepository.findById(query.documentId);
      
      if (!document) {
        throw new DocumentNotFoundException(query.documentId);
      }
      
      // Check access if a user ID was provided
      if (query.userId && !this._canAccess(document, query.userId)) {
        throw new UnauthorizedOperationException('view', 'document', query.documentId);
      }
      
      this.logger.info('Document retrieved successfully', { 
        documentId: document.id, 
        title: document.title 
      });
      
      // Return DTO with full information
      return DocumentDTO.createFull(document);
    } catch (error) {
      // Validation exceptions are already in the correct format, so just re-throw
      if (error.name === 'ValidationException') {
        throw error;
      }
      
      this.logger.error('Failed to get document', { 
        error: error.message,
        stack: error.stack,
        documentId: query.documentId
      });
      
      // Handle specific domain exceptions
      if (error instanceof DocumentNotFoundException) {
        throw error;
      }
      
      // Wrap other exceptions
      throw new ApplicationException(
        'APP-2003',
        'Failed to retrieve document',
        error.message,
        error
      );
    }
  }
  
  /**
   * Check if a user can access a document
   * 
   * @param {Document} document - Document to check
   * @param {string} userId - User ID
   * @returns {boolean} True if the user can access the document
   * @private
   */
  _canAccess(document, userId) {
    // For now, only the owner can access the document
    // This would be expanded to include other access rules
    return document.isOwnedBy(userId);
  }
}

module.exports = GetDocumentUseCase;