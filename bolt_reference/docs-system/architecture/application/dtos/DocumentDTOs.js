/**
 * Document Data Transfer Objects (DTOs)
 * 
 * This file contains DTOs used for document operations in the application layer.
 */

/**
 * DTO for document creation
 */
class CreateDocumentDTO {
  // [AGENT_FILL: implement CreateDocumentDTO properties and validation]
  constructor(data = {}) {
    this.title = data.title;
    this.content = data.content;
    this.ownerId = data.ownerId;
    this.tags = data.tags || [];
    this.metadata = data.metadata || {};
  }

  validate() {
    // [AGENT_FILL: implement validation logic]
    const errors = [];
    return errors;
  }
}

/**
 * DTO for document updates
 */
class UpdateDocumentDTO {
  // [AGENT_FILL: implement UpdateDocumentDTO properties and validation]
  constructor(data = {}) {
    this.title = data.title;
    this.content = data.content;
    this.tags = data.tags;
    this.metadata = data.metadata;
  }

  validate() {
    // [AGENT_FILL: implement validation logic]
    const errors = [];
    return errors;
  }
}

/**
 * DTO for representing document data
 */
class DocumentDTO {
  // [AGENT_FILL: implement DocumentDTO properties]
  constructor(data = {}) {
    this.id = data.id;
    this.title = data.title;
    this.content = data.content;
    this.ownerId = data.ownerId;
    this.status = data.status;
    this.tags = data.tags || [];
    this.metadata = data.metadata || {};
    this.currentVersionNumber = data.currentVersionNumber || 1;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  /**
   * Create a DocumentDTO from a Document entity
   * @param {Document} document - Document entity
   * @returns {DocumentDTO} Document DTO
   */
  static fromEntity(document) {
    // [AGENT_FILL: implement conversion from entity to DTO]
    return new DocumentDTO({
      // Map entity properties to DTO
    });
  }
}

/**
 * DTO for document search criteria
 */
class DocumentSearchCriteriaDTO {
  // [AGENT_FILL: implement DocumentSearchCriteriaDTO properties]
  constructor(data = {}) {
    this.ownerId = data.ownerId;
    this.status = data.status;
    this.tag = data.tag;
    this.query = data.query;
    this.limit = data.limit || 10;
    this.offset = data.offset || 0;
  }
}

/**
 * DTO for document search results
 */
class DocumentSearchResultDTO {
  // [AGENT_FILL: implement DocumentSearchResultDTO properties]
  constructor(data = {}) {
    this.items = data.items || [];
    this.totalCount = data.totalCount || 0;
    this.limit = data.limit || 10;
    this.offset = data.offset || 0;
  }
}

// [AGENT_FILL: export all DTOs]
module.exports = {
  CreateDocumentDTO,
  UpdateDocumentDTO,
  DocumentDTO,
  DocumentSearchCriteriaDTO,
  DocumentSearchResultDTO
};