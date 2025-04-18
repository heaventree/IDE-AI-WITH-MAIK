/**
 * Document Created Event
 * 
 * Domain event that is raised when a document is created.
 */

const DomainEvent = require('../../shared/DomainEvent');

/**
 * Document Created Event
 * 
 * @extends DomainEvent
 */
class DocumentCreatedEvent extends DomainEvent {
  /**
   * Create a new document created event
   * 
   * @param {string} documentId - ID of the document that was created
   * @param {string} ownerId - Owner ID of the document
   * @param {string} title - Title of the document
   * @param {Array<string>} tags - Tags of the document
   */
  constructor(documentId, ownerId, title, tags = []) {
    super(documentId);
    this._ownerId = ownerId;
    this._title = title;
    this._tags = tags;
  }
  
  /**
   * Get owner ID
   * 
   * @returns {string} Owner ID
   */
  get ownerId() {
    return this._ownerId;
  }
  
  /**
   * Get title
   * 
   * @returns {string} Title
   */
  get title() {
    return this._title;
  }
  
  /**
   * Get tags
   * 
   * @returns {Array<string>} Tags
   */
  get tags() {
    return [...this._tags];
  }
  
  /**
   * Convert domain event to a plain object
   * 
   * @returns {Object} Plain object representation of this domain event
   */
  toObject() {
    return {
      ...super.toObject(),
      ownerId: this._ownerId,
      title: this._title,
      tags: [...this._tags]
    };
  }
}

module.exports = DocumentCreatedEvent;