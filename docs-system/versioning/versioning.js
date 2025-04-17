/**
 * Document Versioning Module for Documentation System
 * 
 * This module provides version control for documents including 
 * versioning, comparison, audit trail, and rollback functionality.
 */

/**
 * Document Versioning class for managing document versions
 */
class DocumentVersioning {
  /**
   * Create a new DocumentVersioning instance
   * @param {Object} [options] - Configuration options
   * @param {Function} [options.storage] - Storage provider for versions
   * @param {Function} [options.differ] - Difference calculation function
   * @param {Function} [options.logger] - Logging function
   * @param {number} [options.maxVersions] - Maximum versions to keep per document
   */
  constructor(options = {}) {
    this.storage = options.storage || new MemoryStorage();
    this.differ = options.differ || new TextDiffer();
    this.logger = options.logger || console;
    this.maxVersions = options.maxVersions || 100;
  }
  
  /**
   * Create a new document version
   * @param {string} documentId - Document identifier
   * @param {Object} document - Document content and metadata
   * @param {Object} user - User creating the version
   * @param {string} [comment] - Version comment
   * @returns {Object} Created version
   */
  async createVersion(documentId, document, user, comment = '') {
    if (!documentId || !document || !user) {
      throw new Error('Document ID, content, and user are required');
    }
    
    // Get previous versions
    const versions = await this.getVersions(documentId);
    
    // Get the latest version
    const latestVersion = versions.length > 0 ? versions[0] : null;
    
    // Create new version object
    const version = {
      id: this._generateVersionId(documentId),
      documentId,
      versionNumber: latestVersion ? latestVersion.versionNumber + 1 : 1,
      timestamp: new Date().toISOString(),
      author: {
        id: user.id,
        name: user.name || user.username || 'Unknown'
      },
      comment,
      content: document.content,
      metadata: document.metadata || {}
    };
    
    // If there's a previous version, calculate differences
    if (latestVersion) {
      version.diff = this.differ.calculateDiff(latestVersion.content, document.content);
      version.diffSummary = this.differ.summarizeDiff(version.diff);
    }
    
    // Store the version
    await this.storage.saveVersion(version);
    
    // Prune old versions if needed
    if (versions.length >= this.maxVersions) {
      await this._pruneOldVersions(documentId);
    }
    
    this.logger.info(`Created version ${version.versionNumber} for document ${documentId}`, {
      documentId, 
      versionNumber: version.versionNumber,
      userId: user.id
    });
    
    return version;
  }
  
  /**
   * Get all versions for a document
   * @param {string} documentId - Document identifier
   * @param {Object} [options] - Options for fetching versions
   * @param {number} [options.limit] - Maximum versions to return
   * @param {number} [options.offset] - Offset for pagination
   * @returns {Array} Document versions, sorted by version number (descending)
   */
  async getVersions(documentId, options = {}) {
    if (!documentId) {
      throw new Error('Document ID is required');
    }
    
    const limit = options.limit || this.maxVersions;
    const offset = options.offset || 0;
    
    const versions = await this.storage.getVersions(documentId);
    
    // Sort by version number (descending)
    versions.sort((a, b) => b.versionNumber - a.versionNumber);
    
    // Apply limit and offset
    return versions.slice(offset, offset + limit);
  }
  
  /**
   * Get a specific document version
   * @param {string} documentId - Document identifier
   * @param {number|string} versionIdentifier - Version number or version ID
   * @returns {Object} Document version or null if not found
   */
  async getVersion(documentId, versionIdentifier) {
    if (!documentId || !versionIdentifier) {
      throw new Error('Document ID and version identifier are required');
    }
    
    const versions = await this.storage.getVersions(documentId);
    
    if (typeof versionIdentifier === 'number') {
      // Find by version number
      return versions.find(v => v.versionNumber === versionIdentifier) || null;
    } else {
      // Find by version ID
      return versions.find(v => v.id === versionIdentifier) || null;
    }
  }
  
  /**
   * Compare two document versions
   * @param {string} documentId - Document identifier
   * @param {number|string} versionA - First version number or ID
   * @param {number|string} versionB - Second version number or ID
   * @returns {Object} Difference between versions
   */
  async compareVersions(documentId, versionA, versionB) {
    const versionAObj = await this.getVersion(documentId, versionA);
    const versionBObj = await this.getVersion(documentId, versionB);
    
    if (!versionAObj || !versionBObj) {
      throw new Error('One or both versions not found');
    }
    
    // Calculate difference
    const diff = this.differ.calculateDiff(versionAObj.content, versionBObj.content);
    
    return {
      documentId,
      versions: {
        a: {
          id: versionAObj.id,
          number: versionAObj.versionNumber,
          timestamp: versionAObj.timestamp,
          author: versionAObj.author
        },
        b: {
          id: versionBObj.id,
          number: versionBObj.versionNumber,
          timestamp: versionBObj.timestamp,
          author: versionBObj.author
        }
      },
      diff,
      summary: this.differ.summarizeDiff(diff)
    };
  }
  
  /**
   * Restore a document to a previous version
   * @param {string} documentId - Document identifier
   * @param {number|string} versionIdentifier - Version to restore
   * @param {Object} user - User performing the restoration
   * @param {string} [comment] - Restoration comment
   * @returns {Object} New version created from the restored content
   */
  async restoreVersion(documentId, versionIdentifier, user, comment = 'Restored from previous version') {
    const versionToRestore = await this.getVersion(documentId, versionIdentifier);
    
    if (!versionToRestore) {
      throw new Error('Version not found');
    }
    
    // Create a new document object with the content from the version to restore
    const restoredDocument = {
      content: versionToRestore.content,
      metadata: {
        ...versionToRestore.metadata,
        restoredFrom: {
          versionId: versionToRestore.id,
          versionNumber: versionToRestore.versionNumber
        }
      }
    };
    
    // Create a new version with the restored content
    const newVersion = await this.createVersion(
      documentId, 
      restoredDocument, 
      user, 
      `${comment} (version ${versionToRestore.versionNumber})`
    );
    
    this.logger.info(`Restored document ${documentId} to version ${versionToRestore.versionNumber}`, {
      documentId,
      restoredFrom: versionToRestore.versionNumber,
      newVersion: newVersion.versionNumber,
      userId: user.id
    });
    
    return newVersion;
  }
  
  /**
   * Get the version history for a document
   * @param {string} documentId - Document identifier
   * @param {Object} [options] - Options for fetching history
   * @param {number} [options.limit] - Maximum history entries to return
   * @param {number} [options.offset] - Offset for pagination
   * @returns {Array} Version history with author, timestamp, and changes
   */
  async getVersionHistory(documentId, options = {}) {
    const versions = await this.getVersions(documentId, options);
    
    // Transform to history entries
    return versions.map(version => ({
      versionId: version.id,
      versionNumber: version.versionNumber,
      timestamp: version.timestamp,
      author: version.author,
      comment: version.comment,
      changes: version.diffSummary || { added: 0, removed: 0, modified: 0 }
    }));
  }
  
  /**
   * Get the audit trail for a document
   * @param {string} documentId - Document identifier
   * @returns {Array} Audit entries for the document
   */
  async getAuditTrail(documentId) {
    const versions = await this.getVersions(documentId);
    
    // Transform to audit entries
    return versions.map(version => ({
      action: version.versionNumber === 1 ? 'created' : 'modified',
      timestamp: version.timestamp,
      user: version.author,
      versionNumber: version.versionNumber,
      versionId: version.id,
      comment: version.comment,
      changes: version.diffSummary || { added: 0, removed: 0, modified: 0 }
    }));
  }
  
  /**
   * Export a document's full version history
   * @param {string} documentId - Document identifier
   * @returns {Object} Full version history and metadata
   */
  async exportVersionHistory(documentId) {
    const versions = await this.getVersions(documentId);
    
    return {
      documentId,
      exportTimestamp: new Date().toISOString(),
      versionCount: versions.length,
      firstVersion: versions.length > 0 ? {
        number: versions[versions.length - 1].versionNumber,
        timestamp: versions[versions.length - 1].timestamp
      } : null,
      latestVersion: versions.length > 0 ? {
        number: versions[0].versionNumber,
        timestamp: versions[0].timestamp
      } : null,
      versions
    };
  }
  
  /**
   * Generate a version ID
   * @param {string} documentId - Document identifier
   * @returns {string} Generated version ID
   * @private
   */
  _generateVersionId(documentId) {
    return `${documentId}-v${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Prune old versions to stay within maxVersions limit
   * @param {string} documentId - Document identifier
   * @private
   */
  async _pruneOldVersions(documentId) {
    const versions = await this.storage.getVersions(documentId);
    
    // Sort by version number (descending)
    versions.sort((a, b) => b.versionNumber - a.versionNumber);
    
    // Keep only the newest maxVersions versions
    const versionsToKeep = versions.slice(0, this.maxVersions);
    const versionsToDelete = versions.slice(this.maxVersions);
    
    // Delete old versions
    for (const version of versionsToDelete) {
      await this.storage.deleteVersion(documentId, version.id);
    }
    
    if (versionsToDelete.length > 0) {
      this.logger.info(`Pruned ${versionsToDelete.length} old versions for document ${documentId}`, {
        documentId,
        deletedVersions: versionsToDelete.map(v => v.versionNumber)
      });
    }
  }
}

/**
 * Memory-based storage for document versions
 */
class MemoryStorage {
  constructor() {
    this.versions = {};
  }
  
  /**
   * Save a document version
   * @param {Object} version - Version to save
   * @returns {Promise<Object>} Saved version
   */
  async saveVersion(version) {
    if (!this.versions[version.documentId]) {
      this.versions[version.documentId] = [];
    }
    
    this.versions[version.documentId].push(version);
    return version;
  }
  
  /**
   * Get all versions for a document
   * @param {string} documentId - Document identifier
   * @returns {Promise<Array>} Document versions
   */
  async getVersions(documentId) {
    return this.versions[documentId] || [];
  }
  
  /**
   * Delete a specific version
   * @param {string} documentId - Document identifier
   * @param {string} versionId - Version identifier
   * @returns {Promise<boolean>} Whether the version was deleted
   */
  async deleteVersion(documentId, versionId) {
    if (!this.versions[documentId]) {
      return false;
    }
    
    const initialLength = this.versions[documentId].length;
    this.versions[documentId] = this.versions[documentId].filter(v => v.id !== versionId);
    
    return initialLength > this.versions[documentId].length;
  }
}

/**
 * Text differencing utility for document content
 */
class TextDiffer {
  /**
   * Calculate differences between two text contents
   * @param {string} textA - Original text
   * @param {string} textB - New text
   * @returns {Object} Differences
   */
  calculateDiff(textA, textB) {
    if (typeof textA !== 'string' || typeof textB !== 'string') {
      throw new Error('Both inputs must be strings');
    }
    
    // Simple implementation - in a real system, use a proper diff library
    const linesA = textA.split('\n');
    const linesB = textB.split('\n');
    
    const changes = [];
    let i = 0, j = 0;
    
    while (i < linesA.length || j < linesB.length) {
      if (i >= linesA.length) {
        // All remaining lines in B are additions
        changes.push({
          type: 'added',
          lineNumber: j + 1,
          content: linesB[j]
        });
        j++;
      } else if (j >= linesB.length) {
        // All remaining lines in A are removals
        changes.push({
          type: 'removed',
          lineNumber: i + 1,
          content: linesA[i]
        });
        i++;
      } else if (linesA[i] === linesB[j]) {
        // Lines match
        i++;
        j++;
      } else {
        // Lines differ
        const aInB = linesB.indexOf(linesA[i], j);
        const bInA = linesA.indexOf(linesB[j], i);
        
        if (aInB !== -1 && (bInA === -1 || aInB - j < bInA - i)) {
          // Line from A appears later in B, so B has additions
          changes.push({
            type: 'added',
            lineNumber: j + 1,
            content: linesB[j]
          });
          j++;
        } else if (bInA !== -1) {
          // Line from B appears later in A, so A has removals
          changes.push({
            type: 'removed',
            lineNumber: i + 1,
            content: linesA[i]
          });
          i++;
        } else {
          // Lines are different and don't appear later - modified line
          changes.push({
            type: 'modified',
            lineNumberA: i + 1,
            lineNumberB: j + 1,
            contentA: linesA[i],
            contentB: linesB[j]
          });
          i++;
          j++;
        }
      }
    }
    
    return {
      changes,
      timestamp: new Date().toISOString()
    };
  }
  
  /**
   * Summarize differences
   * @param {Object} diff - Difference object
   * @returns {Object} Summary of changes
   */
  summarizeDiff(diff) {
    if (!diff || !diff.changes) {
      return { added: 0, removed: 0, modified: 0 };
    }
    
    return {
      added: diff.changes.filter(c => c.type === 'added').length,
      removed: diff.changes.filter(c => c.type === 'removed').length,
      modified: diff.changes.filter(c => c.type === 'modified').length,
      total: diff.changes.length
    };
  }
}

module.exports = {
  DocumentVersioning,
  MemoryStorage,
  TextDiffer
};