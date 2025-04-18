/**
 * Document
 * 
 * Aggregate root for documents.
 */

const AggregateRoot = require('../shared/AggregateRoot');
const DocumentVersion = require('./DocumentVersion');
const DocumentCreatedEvent = require('./events/DocumentCreatedEvent');
const DocumentPublishedEvent = require('./events/DocumentPublishedEvent');
const { InvalidDocumentStateException } = require('../exceptions/DocumentExceptions');

/**
 * Document
 * 
 * @extends AggregateRoot
 */
class Document extends AggregateRoot {
  /**
   * Document status enum
   * 
   * @returns {Object} Document status enum
   */
  static get Status() {
    return {
      DRAFT: 'draft',
      PUBLISHED: 'published',
      ARCHIVED: 'archived'
    };
  }
  
  /**
   * Create a new document
   * 
   * @param {string} id - Document ID
   * @param {string} title - Document title
   * @param {string} ownerId - Owner ID
   * @param {string} content - Document content
   * @param {Array<string>} tags - Document tags
   * @param {Object} metadata - Document metadata
   * @returns {Document} Document
   */
  static create(id, title, ownerId, content = '', tags = [], metadata = {}) {
    const document = new Document(id);
    
    document._title = title;
    document._ownerId = ownerId;
    document._status = Document.Status.DRAFT;
    document._tags = [...tags];
    document._metadata = { ...metadata };
    document._createdAt = new Date();
    document._updatedAt = new Date();
    document._versions = [];
    
    // Add initial version
    document._addVersion(content, ownerId);
    
    // Add domain event
    document.addDomainEvent(new DocumentCreatedEvent(id, ownerId, title, tags));
    
    return document;
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
   * Get owner ID
   * 
   * @returns {string} Owner ID
   */
  get ownerId() {
    return this._ownerId;
  }
  
  /**
   * Get status
   * 
   * @returns {string} Status
   */
  get status() {
    return this._status;
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
   * Get metadata
   * 
   * @returns {Object} Metadata
   */
  get metadata() {
    return { ...this._metadata };
  }
  
  /**
   * Get created at
   * 
   * @returns {Date} Created at
   */
  get createdAt() {
    return new Date(this._createdAt);
  }
  
  /**
   * Get updated at
   * 
   * @returns {Date} Updated at
   */
  get updatedAt() {
    return new Date(this._updatedAt);
  }
  
  /**
   * Get current version number
   * 
   * @returns {number} Current version number
   */
  get currentVersionNumber() {
    return this._versions.length > 0 ? this._versions[this._versions.length - 1].versionNumber : 0;
  }
  
  /**
   * Get current version
   * 
   * @returns {DocumentVersion} Current version
   */
  get currentVersion() {
    return this._versions.length > 0 ? this._versions[this._versions.length - 1] : null;
  }
  
  /**
   * Get versions
   * 
   * @returns {Array<DocumentVersion>} Versions
   */
  get versions() {
    return [...this._versions];
  }
  
  /**
   * Get content
   * 
   * @returns {string} Content
   */
  get content() {
    return this.currentVersion ? this.currentVersion.content : '';
  }
  
  /**
   * Update document
   * 
   * @param {string} title - Document title
   * @param {string} content - Document content
   * @param {Array<string>} tags - Document tags
   * @param {Object} metadata - Document metadata
   * @param {string} userId - User ID
   * @returns {Document} Document
   */
  update(title, content, tags, metadata, userId) {
    // Validate state
    if (this._status === Document.Status.ARCHIVED) {
      throw new InvalidDocumentStateException(this.id, this._status, 'update');
    }
    
    // Update properties
    this._title = title;
    this._tags = [...tags];
    this._metadata = { ...metadata };
    this._updatedAt = new Date();
    
    // Add new version if content has changed
    if (content !== this.content) {
      this._addVersion(content, userId);
    }
    
    return this;
  }
  
  /**
   * Publish document
   * 
   * @param {string} userId - User ID
   * @param {string} environment - Environment
   * @returns {Document} Document
   */
  publish(userId, environment = 'production') {
    // Validate state
    if (this._status === Document.Status.ARCHIVED) {
      throw new InvalidDocumentStateException(this.id, this._status, 'publish');
    }
    
    // Update status
    this._status = Document.Status.PUBLISHED;
    this._updatedAt = new Date();
    
    // Add domain event
    this.addDomainEvent(new DocumentPublishedEvent(
      this.id,
      userId,
      environment,
      this.currentVersionNumber
    ));
    
    return this;
  }
  
  /**
   * Archive document
   * 
   * @param {string} userId - User ID
   * @returns {Document} Document
   */
  archive(userId) {
    // Update status
    this._status = Document.Status.ARCHIVED;
    this._updatedAt = new Date();
    
    return this;
  }
  
  /**
   * Get version by number
   * 
   * @param {number} versionNumber - Version number
   * @returns {DocumentVersion} Document version
   */
  getVersion(versionNumber) {
    return this._versions.find(version => version.versionNumber === versionNumber);
  }
  
  /**
   * Add version
   * 
   * @param {string} content - Content
   * @param {string} userId - User ID
   * @private
   */
  _addVersion(content, userId) {
    const versionNumber = this.currentVersionNumber + 1;
    const version = new DocumentVersion(versionNumber, content, new Date(), userId);
    this._versions.push(version);
  }
  
  /**
   * Convert document to a plain object
   * 
   * @param {boolean} includeContent - Whether to include content
   * @param {number} specificVersion - Specific version to include
   * @returns {Object} Plain object representation
   */
  toObject(includeContent = true, specificVersion = null) {
    const result = {
      id: this.id,
      title: this._title,
      ownerId: this._ownerId,
      status: this._status,
      tags: [...this._tags],
      metadata: { ...this._metadata },
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
      currentVersionNumber: this.currentVersionNumber
    };
    
    // Include version data if requested
    if (specificVersion !== null) {
      const version = this.getVersion(specificVersion);
      if (version) {
        result.version = version.toObject(includeContent);
      }
    } else if (includeContent) {
      result.content = this.content;
    }
    
    return result;
  }
}

module.exports = Document;