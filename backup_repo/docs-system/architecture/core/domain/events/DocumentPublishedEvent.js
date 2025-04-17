/**
 * DocumentPublishedEvent
 * 
 * Domain event raised when a document is published.
 */

const DomainEvent = require('./DomainEvent');

class DocumentPublishedEvent extends DomainEvent {
  /**
   * Create a new DocumentPublishedEvent
   * 
   * @param {Object} params - Event parameters
   * @param {string} params.documentId - ID of the published document
   * @param {string} params.title - Title of the published document
   * @param {string} params.ownerId - ID of the document owner
   * @param {Date} [params.occurredAt=new Date()] - When the event occurred
   */
  constructor({
    documentId,
    title,
    ownerId,
    occurredAt = new Date()
  }) {
    super('document.published', occurredAt);
    
    this.documentId = documentId;
    this.title = title;
    this.ownerId = ownerId;
  }
}

module.exports = DocumentPublishedEvent;