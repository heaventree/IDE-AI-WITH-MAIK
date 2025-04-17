/**
 * Document Repository Interface
 * 
 * Repository interface for document aggregates.
 */

/**
 * Document repository interface
 * 
 * @interface
 */
class DocumentRepository {
  /**
   * Find a document by ID
   * 
   * @param {string} id - Document ID
   * @returns {Promise<Document|null>} Document or null if not found
   */
  async findById(id) {
    throw new Error('Method not implemented');
  }
  
  /**
   * Find a document by version
   * 
   * @param {string} id - Document ID
   * @param {number} versionNumber - Version number
   * @returns {Promise<Document|null>} Document or null if not found
   */
  async findByVersion(id, versionNumber) {
    throw new Error('Method not implemented');
  }
  
  /**
   * Find documents by owner ID
   * 
   * @param {string} ownerId - Owner ID
   * @param {Object} [options={}] - Query options
   * @returns {Promise<Array<Document>>} Documents
   */
  async findByOwnerId(ownerId, options = {}) {
    throw new Error('Method not implemented');
  }
  
  /**
   * Find documents by status
   * 
   * @param {string} status - Document status
   * @param {Object} [options={}] - Query options
   * @returns {Promise<Array<Document>>} Documents
   */
  async findByStatus(status, options = {}) {
    throw new Error('Method not implemented');
  }
  
  /**
   * Find documents by tag
   * 
   * @param {string} tag - Document tag
   * @param {Object} [options={}] - Query options
   * @returns {Promise<Array<Document>>} Documents
   */
  async findByTag(tag, options = {}) {
    throw new Error('Method not implemented');
  }
  
  /**
   * Search for documents
   * 
   * @param {Object} criteria - Search criteria
   * @param {Object} [options={}] - Search options
   * @returns {Promise<Array<Document>>} Documents
   */
  async search(criteria, options = {}) {
    throw new Error('Method not implemented');
  }
  
  /**
   * Save a document
   * 
   * @param {Document} document - Document to save
   * @returns {Promise<Document>} Saved document
   */
  async save(document) {
    throw new Error('Method not implemented');
  }
  
  /**
   * Delete a document
   * 
   * @param {string} id - Document ID
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  async delete(id) {
    throw new Error('Method not implemented');
  }
  
  /**
   * Count documents by owner ID
   * 
   * @param {string} ownerId - Owner ID
   * @returns {Promise<number>} Number of documents
   */
  async countByOwnerId(ownerId) {
    throw new Error('Method not implemented');
  }
  
  /**
   * Generate a unique ID for a new document
   * 
   * @returns {Promise<string>} Unique ID
   */
  async nextId() {
    throw new Error('Method not implemented');
  }
}

module.exports = DocumentRepository;