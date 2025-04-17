/**
 * Document Published Event
 * 
 * Domain event that is raised when a document is published.
 */

const DomainEvent = require('../../shared/DomainEvent');

/**
 * Document Published Event
 * 
 * @extends DomainEvent
 */
class DocumentPublishedEvent extends DomainEvent {
  /**
   * Create a new document published event
   * 
   * @param {string} documentId - ID of the document that was published
   * @param {string} publisherId - ID of the user who published the document
   * @param {string} environment - Environment in which the document was published
   * @param {string} version - Version of the document that was published
   */
  constructor(documentId, publisherId, environment, version) {
    super(documentId);
    this._publisherId = publisherId;
    this._environment = environment;
    this._version = version;
    this._publishedAt = new Date();
  }
  
  /**
   * Get publisher ID
   * 
   * @returns {string} Publisher ID
   */
  get publisherId() {
    return this._publisherId;
  }
  
  /**
   * Get environment
   * 
   * @returns {string} Environment
   */
  get environment() {
    return this._environment;
  }
  
  /**
   * Get version
   * 
   * @returns {string} Version
   */
  get version() {
    return this._version;
  }
  
  /**
   * Get published at
   * 
   * @returns {Date} Published at
   */
  get publishedAt() {
    return this._publishedAt;
  }
  
  /**
   * Convert domain event to a plain object
   * 
   * @returns {Object} Plain object representation of this domain event
   */
  toObject() {
    return {
      ...super.toObject(),
      publisherId: this._publisherId,
      environment: this._environment,
      version: this._version,
      publishedAt: this._publishedAt.toISOString()
    };
  }
}

module.exports = DocumentPublishedEvent;