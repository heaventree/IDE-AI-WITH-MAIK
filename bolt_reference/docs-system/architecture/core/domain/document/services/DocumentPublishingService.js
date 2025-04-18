/**
 * Document Publishing Service
 * 
 * Domain service for document publishing.
 */

const { InvalidDocumentStateException } = require('../../exceptions/DocumentExceptions');

/**
 * Document Publishing Service
 */
class DocumentPublishingService {
  /**
   * Create a new document publishing service
   * 
   * @param {Object} dependencies - Dependencies
   * @param {Object} dependencies.logger - Logger
   * @param {Object} dependencies.documentRepository - Document repository
   * @param {Object} dependencies.eventPublisher - Event publisher
   */
  constructor({ logger, documentRepository, eventPublisher }) {
    this._logger = logger;
    this._documentRepository = documentRepository;
    this._eventPublisher = eventPublisher;
  }
  
  /**
   * Publish document
   * 
   * @param {Document} document - Document to publish
   * @param {string} userId - User ID
   * @param {string} environment - Environment
   * @returns {Document} Published document
   */
  async publishDocument(document, userId, environment = 'production') {
    this._logger.debug('Publishing document', { documentId: document.id, userId, environment });
    
    // Check if user can publish the document
    await this._checkPublishPermission(document, userId);
    
    // Validate document state
    this._validateDocumentForPublishing(document);
    
    // Publish document
    document.publish(userId, environment);
    
    // Save document
    await this._documentRepository.save(document);
    
    // Publish domain events
    const events = document.getDomainEvents();
    document.clearEvents();
    
    for (const event of events) {
      await this._eventPublisher.publish(event);
    }
    
    return document;
  }
  
  /**
   * Check if user can publish the document
   * 
   * @param {Document} document - Document
   * @param {string} userId - User ID
   * @private
   */
  async _checkPublishPermission(document, userId) {
    // In a real implementation, we would check if the user has permission to publish the document
    // For now, we'll just check if the user is the owner of the document
    if (document.ownerId !== userId) {
      throw new Error('Unauthorized: Only the document owner can publish it');
    }
  }
  
  /**
   * Validate document for publishing
   * 
   * @param {Document} document - Document
   * @private
   */
  _validateDocumentForPublishing(document) {
    // Check if document has content
    if (!document.content || document.content.trim() === '') {
      throw new InvalidDocumentStateException(document.id, document.status, 'publish');
    }
    
    // Check if document has a title
    if (!document.title || document.title.trim() === '') {
      throw new InvalidDocumentStateException(document.id, document.status, 'publish');
    }
  }
}

module.exports = DocumentPublishingService;