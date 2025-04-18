/**
 * DocumentArchivedEvent
 * 
 * Domain event raised when a document is archived.
 */

const DomainEvent = require('./DomainEvent');

class DocumentArchivedEvent extends DomainEvent {
  /**
   * Create a new DocumentArchivedEvent
   * 
   * @param {Object} params - Event parameters
   * @param {string} params.documentId - ID of the archived document
   * @param {string} params.title - Title of the archived document
   * @param {string} params.ownerId - ID of the document owner
   * @param {Date} [params.occurredAt=new Date()] - When the event occurred
   */
  constructor({
    documentId,
    title,
    ownerId,
    occurredAt = new Date()
  }) {
    super('document.archived', occurredAt);
    
    this.documentId = documentId;
    this.title = title;
    this.ownerId = ownerId;
  }
}

module.exports = DocumentArchivedEvent;