/**
 * MongoDB Document Repository
 * 
 * Repository implementation for document aggregates using MongoDB.
 */

const Document = require('../../core/domain/document/Document');
const DocumentVersion = require('../../core/domain/document/DocumentVersion');
const DocumentRepository = require('../../core/domain/document/repositories/DocumentRepository');
const { DocumentNotFoundException } = require('../../core/domain/exceptions/DocumentExceptions');

/**
 * MongoDB document repository implementation
 */
class MongoDocumentRepository extends DocumentRepository {
  /**
   * Create a new MongoDocumentRepository
   * 
   * @param {MongoClient} mongoClient - MongoDB client
   * @param {Logger} logger - Logger instance
   */
  constructor(mongoClient, logger) {
    super();
    
    /**
     * MongoDB client
     * @type {MongoClient}
     */
    this.mongoClient = mongoClient;
    
    /**
     * MongoDB database
     * @type {Db}
     */
    this.db = mongoClient.db();
    
    /**
     * Documents collection
     * @type {Collection}
     */
    this.documentsCollection = this.db.collection('documents');
    
    /**
     * Logger
     * @type {Logger}
     */
    this.logger = logger;
    
    // Create indexes
    this._createIndexes().catch(error => {
      this.logger.error('Failed to create indexes', { error: error.message, stack: error.stack });
    });
  }
  
  /**
   * Find a document by ID
   * 
   * @param {string} id - Document ID
   * @returns {Promise<Document|null>} Document or null if not found
   */
  async findById(id) {
    try {
      const documentData = await this.documentsCollection.findOne({ _id: id });
      
      if (!documentData) {
        return null;
      }
      
      return this._mapToDocument(documentData);
    } catch (error) {
      this.logger.error('Failed to find document by ID', { id, error: error.message, stack: error.stack });
      throw error;
    }
  }
  
  /**
   * Find a document by version
   * 
   * @param {string} id - Document ID
   * @param {number} versionNumber - Version number
   * @returns {Promise<Document|null>} Document or null if not found
   */
  async findByVersion(id, versionNumber) {
    try {
      const documentData = await this.documentsCollection.findOne({
        _id: id,
        'versions.versionNumber': versionNumber
      });
      
      if (!documentData) {
        return null;
      }
      
      return this._mapToDocument(documentData);
    } catch (error) {
      this.logger.error('Failed to find document by version', { 
        id, 
        versionNumber, 
        error: error.message, 
        stack: error.stack 
      });
      throw error;
    }
  }
  
  /**
   * Find documents by owner ID
   * 
   * @param {string} ownerId - Owner ID
   * @param {Object} [options={}] - Query options
   * @returns {Promise<Array<Document>>} Documents
   */
  async findByOwnerId(ownerId, options = {}) {
    try {
      const { status, tag, limit = 20, offset = 0, sort = { updatedAt: -1 } } = options;
      
      const query = { ownerId };
      
      if (status) {
        query.status = status;
      }
      
      if (tag) {
        query.tags = tag;
      }
      
      const documentDataList = await this.documentsCollection
        .find(query)
        .sort(sort)
        .skip(offset)
        .limit(limit)
        .toArray();
      
      return documentDataList.map(documentData => this._mapToDocument(documentData));
    } catch (error) {
      this.logger.error('Failed to find documents by owner ID', { 
        ownerId, 
        options, 
        error: error.message, 
        stack: error.stack 
      });
      throw error;
    }
  }
  
  /**
   * Find documents by status
   * 
   * @param {string} status - Document status
   * @param {Object} [options={}] - Query options
   * @returns {Promise<Array<Document>>} Documents
   */
  async findByStatus(status, options = {}) {
    try {
      const { ownerId, tag, limit = 20, offset = 0, sort = { updatedAt: -1 } } = options;
      
      const query = { status };
      
      if (ownerId) {
        query.ownerId = ownerId;
      }
      
      if (tag) {
        query.tags = tag;
      }
      
      const documentDataList = await this.documentsCollection
        .find(query)
        .sort(sort)
        .skip(offset)
        .limit(limit)
        .toArray();
      
      return documentDataList.map(documentData => this._mapToDocument(documentData));
    } catch (error) {
      this.logger.error('Failed to find documents by status', { 
        status, 
        options, 
        error: error.message, 
        stack: error.stack 
      });
      throw error;
    }
  }
  
  /**
   * Find documents by tag
   * 
   * @param {string} tag - Document tag
   * @param {Object} [options={}] - Query options
   * @returns {Promise<Array<Document>>} Documents
   */
  async findByTag(tag, options = {}) {
    try {
      const { ownerId, status, limit = 20, offset = 0, sort = { updatedAt: -1 } } = options;
      
      const query = { tags: tag };
      
      if (ownerId) {
        query.ownerId = ownerId;
      }
      
      if (status) {
        query.status = status;
      }
      
      const documentDataList = await this.documentsCollection
        .find(query)
        .sort(sort)
        .skip(offset)
        .limit(limit)
        .toArray();
      
      return documentDataList.map(documentData => this._mapToDocument(documentData));
    } catch (error) {
      this.logger.error('Failed to find documents by tag', { 
        tag, 
        options, 
        error: error.message, 
        stack: error.stack 
      });
      throw error;
    }
  }
  
  /**
   * Search for documents
   * 
   * @param {Object} criteria - Search criteria
   * @param {Object} [options={}] - Search options
   * @returns {Promise<Array<Document>>} Documents
   */
  async search(criteria, options = {}) {
    try {
      const { searchQuery, ownerId, status, tag } = criteria;
      const { limit = 20, offset = 0, useTextSearch = false } = options;
      
      const query = {};
      
      if (ownerId) {
        query.ownerId = ownerId;
      }
      
      if (status) {
        query.status = status;
      }
      
      if (tag) {
        query.tags = tag;
      }
      
      if (searchQuery) {
        if (useTextSearch) {
          query.$text = { $search: searchQuery };
        } else {
          query.$or = [
            { title: { $regex: searchQuery, $options: 'i' } },
            { tags: { $regex: searchQuery, $options: 'i' } }
          ];
        }
      }
      
      const documentDataList = await this.documentsCollection
        .find(query)
        .sort(useTextSearch ? { score: { $meta: 'textScore' } } : { updatedAt: -1 })
        .skip(offset)
        .limit(limit)
        .toArray();
      
      return documentDataList.map(documentData => this._mapToDocument(documentData));
    } catch (error) {
      this.logger.error('Failed to search documents', { 
        criteria, 
        options, 
        error: error.message, 
        stack: error.stack 
      });
      throw error;
    }
  }
  
  /**
   * Save a document
   * 
   * @param {Document} document - Document to save
   * @returns {Promise<Document>} Saved document
   */
  async save(document) {
    try {
      const documentData = this._mapToData(document);
      
      // Insert or update the document
      await this.documentsCollection.updateOne(
        { _id: document.id },
        { $set: documentData },
        { upsert: true }
      );
      
      this.logger.debug('Document saved', { id: document.id });
      
      return document;
    } catch (error) {
      this.logger.error('Failed to save document', { 
        id: document.id, 
        error: error.message, 
        stack: error.stack 
      });
      throw error;
    }
  }
  
  /**
   * Delete a document
   * 
   * @param {string} id - Document ID
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  async delete(id) {
    try {
      const result = await this.documentsCollection.deleteOne({ _id: id });
      
      this.logger.debug('Document deleted', { id, deleted: result.deletedCount > 0 });
      
      return result.deletedCount > 0;
    } catch (error) {
      this.logger.error('Failed to delete document', { id, error: error.message, stack: error.stack });
      throw error;
    }
  }
  
  /**
   * Count documents by owner ID
   * 
   * @param {string} ownerId - Owner ID
   * @returns {Promise<number>} Number of documents
   */
  async countByOwnerId(ownerId) {
    try {
      return await this.documentsCollection.countDocuments({ ownerId });
    } catch (error) {
      this.logger.error('Failed to count documents by owner ID', { 
        ownerId, 
        error: error.message, 
        stack: error.stack 
      });
      throw error;
    }
  }
  
  /**
   * Generate a unique ID for a new document
   * 
   * @returns {Promise<string>} Unique ID
   */
  async nextId() {
    try {
      // Generate a random ID with a timestamp to ensure uniqueness
      const id = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      
      this.logger.debug('Generated document ID', { id });
      
      return id;
    } catch (error) {
      this.logger.error('Failed to generate document ID', { error: error.message, stack: error.stack });
      throw error;
    }
  }
  
  /**
   * Create indexes for the documents collection
   * 
   * @returns {Promise<void>}
   * @private
   */
  async _createIndexes() {
    try {
      // Create indexes
      await this.documentsCollection.createIndex({ ownerId: 1 });
      await this.documentsCollection.createIndex({ status: 1 });
      await this.documentsCollection.createIndex({ tags: 1 });
      await this.documentsCollection.createIndex({ updatedAt: -1 });
      await this.documentsCollection.createIndex({ title: 'text', tags: 'text' });
      
      // Compound indexes
      await this.documentsCollection.createIndex({ ownerId: 1, status: 1 });
      await this.documentsCollection.createIndex({ ownerId: 1, tags: 1 });
      await this.documentsCollection.createIndex({ status: 1, tags: 1 });
      
      this.logger.debug('Document repository indexes created');
    } catch (error) {
      this.logger.error('Failed to create document repository indexes', { 
        error: error.message, 
        stack: error.stack 
      });
      throw error;
    }
  }
  
  /**
   * Map a document to data for storage
   * 
   * @param {Document} document - Document to map
   * @returns {Object} Data for storage
   * @private
   */
  _mapToData(document) {
    return {
      _id: document.id,
      title: document.title,
      ownerId: document.ownerId,
      status: document.status,
      tags: document.tags,
      metadata: document.metadata,
      versions: document.versions.map(version => ({
        versionNumber: version.versionNumber,
        content: version.content,
        editorId: version.editorId,
        changes: version.changes,
        createdAt: version.createdAt
      })),
      publishHistory: document.publishHistory,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt
    };
  }
  
  /**
   * Map data from storage to a document
   * 
   * @param {Object} data - Data from storage
   * @returns {Document} Document
   * @private
   */
  _mapToDocument(data) {
    // Create the document
    const document = new Document(data._id, data.title, data.ownerId, data.metadata);
    
    // Set the document state
    document.status = data.status;
    document.tags = data.tags;
    document.publishHistory = data.publishHistory || [];
    document.createdAt = new Date(data.createdAt);
    document.updatedAt = new Date(data.updatedAt);
    
    // Add versions
    if (data.versions && Array.isArray(data.versions)) {
      for (const versionData of data.versions) {
        document.addVersionWithoutEvents(
          versionData.content,
          versionData.editorId,
          versionData.changes || {},
          versionData.versionNumber,
          new Date(versionData.createdAt)
        );
      }
    }
    
    return document;
  }
}

module.exports = { MongoDocumentRepository };