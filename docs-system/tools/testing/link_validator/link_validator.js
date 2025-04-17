/**
 * Link Validator for Documentation System
 * 
 * This module validates links within documentation to ensure they are accessible
 * and correctly reference internal or external resources.
 */

class LinkValidator {
  /**
   * Creates a new LinkValidator instance
   * @param {Object} options - Configuration options
   * @param {Object} options.parsers - Link parsers for different content types
   * @param {Object} options.checkers - Link checkers for different link types
   * @param {Object} options.documentRegistry - Registry of documents for validation
   * @param {Function} options.logger - Logging function for validation results
   * @param {boolean} options.validateExternal - Whether to validate external links
   */
  constructor(options = {}) {
    this.parsers = options.parsers || {};
    this.checkers = options.checkers || {};
    this.documentRegistry = options.documentRegistry || {};
    this.logger = options.logger || console;
    this.validateExternal = options.validateExternal !== undefined ? options.validateExternal : true;
  }

  /**
   * Validates all links in a document
   * @param {Object} document - The document containing links
   * @param {string} documentType - The type of document (determines parser to use)
   * @returns {Object} Validation results with success flag and details
   */
  async validateDocumentLinks(document, documentType) {
    try {
      // Get appropriate parser for document type
      const parser = this.getParser(documentType);
      
      if (!parser) {
        throw new Error(`No link parser available for document type: ${documentType}`);
      }
      
      // Extract links from document
      const links = parser.extractLinks(document);
      
      if (links.length === 0) {
        return {
          valid: true,
          links: [],
          message: 'No links found in document'
        };
      }
      
      // Validate each link
      const results = await Promise.all(
        links.map(link => this.validateLink(link, document))
      );
      
      // Count valid and invalid links
      const invalidLinks = results.filter(result => !result.valid);
      
      // Log validation results
      this.logValidationResults(document, results);
      
      return {
        valid: invalidLinks.length === 0,
        links: results,
        validCount: results.length - invalidLinks.length,
        invalidCount: invalidLinks.length,
        message: this.generateResultMessage(results)
      };
    } catch (error) {
      this.logger.error('Link validation error', {
        documentId: document.id || 'unknown',
        error: error.message
      });
      
      return {
        valid: false,
        error: error.message,
        links: []
      };
    }
  }

  /**
   * Gets the appropriate parser for a document type
   * @param {string} documentType - The document type
   * @returns {Object} Parser for the document type
   */
  getParser(documentType) {
    return (
      this.parsers[documentType] || 
      this.parsers.default
    );
  }

  /**
   * Validates a single link
   * @param {Object} link - The link to validate
   * @param {Object} document - The source document containing the link
   * @returns {Object} Validation result
   */
  async validateLink(link, document) {
    try {
      // Get appropriate checker for link type
      const checker = this.getChecker(link.type);
      
      if (!checker) {
        return {
          link,
          valid: false,
          message: `No checker available for link type: ${link.type}`,
          type: 'unknown_link_type'
        };
      }
      
      // Run the validation
      const validationResult = await checker.checkLink(link, document, {
        documentRegistry: this.documentRegistry,
        validateExternal: this.validateExternal
      });
      
      return validationResult;
    } catch (error) {
      return {
        link,
        valid: false,
        error: error.message,
        message: `Error checking link: ${error.message}`,
        type: 'validation_error'
      };
    }
  }

  /**
   * Gets the appropriate checker for a link type
   * @param {string} linkType - The link type
   * @returns {Object} Checker for the link type
   */
  getChecker(linkType) {
    return (
      this.checkers[linkType] || 
      this.checkers.default
    );
  }

  /**
   * Logs validation results
   * @param {Object} document - The validated document
   * @param {Array} results - The validation results
   */
  logValidationResults(document, results) {
    const invalidLinks = results.filter(result => !result.valid);
    
    if (invalidLinks.length > 0) {
      this.logger.warn('Document contains invalid links', {
        documentId: document.id || 'unknown',
        invalidCount: invalidLinks.length,
        totalCount: results.length,
        invalidLinks: invalidLinks.map(result => ({
          href: result.link.href,
          type: result.type,
          error: result.error || result.message
        }))
      });
    } else {
      this.logger.info('All links in document are valid', {
        documentId: document.id || 'unknown',
        linkCount: results.length
      });
    }
  }

  /**
   * Generates a human-readable result message
   * @param {Array} results - The validation results
   * @returns {string} Human-readable result message
   */
  generateResultMessage(results) {
    const totalLinks = results.length;
    const invalidLinks = results.filter(result => !result.valid);
    const invalidCount = invalidLinks.length;
    
    if (totalLinks === 0) {
      return 'No links found in document';
    }
    
    if (invalidCount === 0) {
      return `All ${totalLinks} links are valid`;
    }
    
    return `${invalidCount} of ${totalLinks} links are invalid`;
  }

  /**
   * Validates multiple documents
   * @param {Array} documents - Array of documents to validate
   * @param {string} documentType - The type of documents (determines parser to use)
   * @returns {Object} Validation results for all documents
   */
  async validateMultipleDocuments(documents, documentType) {
    const results = await Promise.all(
      documents.map(document => this.validateDocumentLinks(document, documentType))
    );
    
    const invalidDocuments = results.filter(result => !result.valid);
    
    return {
      valid: invalidDocuments.length === 0,
      documents: results,
      validCount: results.length - invalidDocuments.length,
      invalidCount: invalidDocuments.length,
      message: `${invalidDocuments.length} of ${results.length} documents contain invalid links`
    };
  }

  /**
   * Registers a document in the document registry
   * @param {Object} document - The document to register
   */
  registerDocument(document) {
    if (!document.id) {
      throw new Error('Document must have an ID to be registered');
    }
    
    this.documentRegistry[document.id] = document;
  }

  /**
   * Registers multiple documents in the document registry
   * @param {Array} documents - The documents to register
   */
  registerDocuments(documents) {
    for (const document of documents) {
      this.registerDocument(document);
    }
  }
}

module.exports = LinkValidator;