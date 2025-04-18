/**
 * Document Version
 * 
 * Value object representing a document version.
 */

const ValueObject = require('../shared/ValueObject');

/**
 * Document Version
 * 
 * @extends ValueObject
 */
class DocumentVersion extends ValueObject {
  /**
   * Create a new document version
   * 
   * @param {number} versionNumber - Version number
   * @param {string} content - Document content for this version
   * @param {Date} createdAt - Date when this version was created
   * @param {string} createdBy - ID of user who created this version
   */
  constructor(versionNumber, content, createdAt = new Date(), createdBy = '') {
    super();
    
    // Validate version number
    if (typeof versionNumber !== 'number' || versionNumber < 1) {
      throw new Error('Version number must be a positive number');
    }
    
    this._versionNumber = versionNumber;
    this._content = content || '';
    this._createdAt = createdAt instanceof Date ? createdAt : new Date(createdAt);
    this._createdBy = createdBy;
  }
  
  /**
   * Get version number
   * 
   * @returns {number} Version number
   */
  get versionNumber() {
    return this._versionNumber;
  }
  
  /**
   * Get content
   * 
   * @returns {string} Content
   */
  get content() {
    return this._content;
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
   * Get created by
   * 
   * @returns {string} Created by
   */
  get createdBy() {
    return this._createdBy;
  }
  
  /**
   * Convert document version to a plain object
   * 
   * @param {boolean} includeContent - Whether to include content
   * @returns {Object} Plain object representation
   */
  toObject(includeContent = true) {
    const result = {
      versionNumber: this._versionNumber,
      createdAt: this._createdAt.toISOString(),
      createdBy: this._createdBy
    };
    
    if (includeContent) {
      result.content = this._content;
    }
    
    return result;
  }
}

module.exports = DocumentVersion;