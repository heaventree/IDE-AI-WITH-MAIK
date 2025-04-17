/**
 * DocumentVersionCreatedEvent
 * 
 * Domain event raised when a new document version is created.
 */

const DomainEvent = require('./DomainEvent');

class DocumentVersionCreatedEvent extends DomainEvent {
  /**
   * Create a new DocumentVersionCreatedEvent
   * 
   * @param {Object} params - Event parameters
   * @param {string} params.documentId - ID of the document
   * @param {number} params.versionNumber - Version number that was created
   * @param {string} params.editorId - ID of the user who created the version
   * @param {Date} [params.occurredAt=new Date()] - When the event occurred
   */
  constructor({
    documentId,
    versionNumber,
    editorId,
    occurredAt = new Date()
  }) {
    super('document.version.created', occurredAt);
    
    this.documentId = documentId;
    this.versionNumber = versionNumber;
    this.editorId = editorId;
  }
}

module.exports = DocumentVersionCreatedEvent;