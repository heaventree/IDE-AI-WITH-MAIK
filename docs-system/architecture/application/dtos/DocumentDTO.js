/**
 * Document Data Transfer Object
 * 
 * DTO for transforming document domain objects into a format suitable for the application layer.
 */

/**
 * VersionSummaryDTO for document versions
 */
class VersionSummaryDTO {
  /**
   * Create a new VersionSummaryDTO
   * 
   * @param {DocumentVersion} version - Document version
   */
  constructor(version) {
    this.versionNumber = version.versionNumber;
    this.editorId = version.editorId;
    this.createdAt = version.createdAt;
    this.hasChanges = Object.keys(version.changes || {}).length > 0;
  }
  
  /**
   * Create a collection of VersionSummaryDTOs
   * 
   * @param {Array<DocumentVersion>} versions - Document versions
   * @returns {Array<VersionSummaryDTO>} Version summary DTOs
   * @static
   */
  static createCollection(versions) {
    if (!versions || !Array.isArray(versions)) {
      return [];
    }
    
    return versions.map(version => new VersionSummaryDTO(version));
  }
}

/**
 * DocumentDTO for transferring document data
 */
class DocumentDTO {
  /**
   * Create a new DocumentDTO
   * 
   * @param {Document} document - Document domain object
   * @param {boolean} [includeContent=false] - Whether to include content
   * @param {boolean} [includeVersions=false] - Whether to include all versions
   * @param {boolean} [includePublishHistory=false] - Whether to include publish history
   */
  constructor(document, includeContent = false, includeVersions = false, includePublishHistory = false) {
    this.id = document.id;
    this.title = document.title;
    this.ownerId = document.ownerId;
    this.status = document.status;
    this.tags = [...document.tags];
    this.metadata = { ...document.metadata };
    this.createdAt = document.createdAt;
    this.updatedAt = document.updatedAt;
    
    // Get the latest version
    const latestVersion = document.getLatestVersion();
    
    if (latestVersion) {
      this.version = latestVersion.versionNumber;
      this.lastEditor = latestVersion.editorId;
      
      if (includeContent) {
        this.content = latestVersion.content;
      }
    } else {
      this.version = null;
      this.lastEditor = document.ownerId;
    }
    
    // Include versions if requested
    if (includeVersions) {
      this.versions = VersionSummaryDTO.createCollection(document.getVersions());
    }
    
    // Include publish history if requested
    if (includePublishHistory && document.publishHistory && document.publishHistory.length > 0) {
      this.publishHistory = [...document.publishHistory].map(record => ({
        ...record,
        publishDate: record.publishDate
      }));
    }
  }
  
  /**
   * Create a collection of DocumentDTOs
   * 
   * @param {Array<Document>} documents - Document domain objects
   * @param {boolean} [includeContent=false] - Whether to include content
   * @param {boolean} [includeVersions=false] - Whether to include all versions
   * @param {boolean} [includePublishHistory=false] - Whether to include publish history
   * @returns {Array<DocumentDTO>} Document DTOs
   * @static
   */
  static createCollection(documents, includeContent = false, includeVersions = false, includePublishHistory = false) {
    if (!documents || !Array.isArray(documents)) {
      return [];
    }
    
    return documents.map(document => new DocumentDTO(
      document,
      includeContent,
      includeVersions,
      includePublishHistory
    ));
  }
  
  /**
   * Create a collection of minimal DocumentDTOs (without content or versions)
   * 
   * @param {Array<Document>} documents - Document domain objects
   * @returns {Array<DocumentDTO>} Document DTOs
   * @static
   */
  static createMinimalCollection(documents) {
    return DocumentDTO.createCollection(documents, false, false, false);
  }
}

module.exports = DocumentDTO;