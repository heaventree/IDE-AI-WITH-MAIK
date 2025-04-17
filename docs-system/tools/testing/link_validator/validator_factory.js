/**
 * Link Validator Factory for Documentation System
 * 
 * This module provides a factory for creating link validators
 * with appropriate parsers and checkers for different document types.
 */

const LinkValidator = require('./link_validator');
const MarkdownLinkParser = require('./parsers/markdown_parser');
const InternalLinkChecker = require('./checkers/internal_link_checker');
const AnchorLinkChecker = require('./checkers/anchor_link_checker');
const ExternalLinkChecker = require('./checkers/external_link_checker');

/**
 * HTTP client implementation for external link checking
 */
class HttpClient {
  /**
   * Makes an HTTP request
   * @param {Object} options - Request options
   * @returns {Promise<Object>} Response object
   */
  async request(options) {
    // This is a placeholder implementation
    // In a real application, this would use fetch, axios, or similar
    
    // For now, just return a success response
    return {
      status: 200,
      headers: {
        'content-type': 'text/html'
      }
    };
  }
}

/**
 * File system implementation for internal link checking
 */
class FileSystem {
  /**
   * Creates a new FileSystem instance
   * @param {Object} options - Options
   * @param {Array} options.files - List of available files
   */
  constructor(options = {}) {
    this.files = options.files || [];
  }

  /**
   * Checks if a file exists
   * @param {string} path - File path
   * @returns {Promise<boolean>} Whether the file exists
   */
  async exists(path) {
    return this.files.includes(path);
  }
}

/**
 * Link Validator Factory
 */
class ValidatorFactory {
  /**
   * Creates a new ValidatorFactory instance
   * @param {Object} options - Configuration options
   * @param {Object} options.logger - Logging function for validation results
   * @param {Array} options.documentRegistry - Registry of documents for internal link validation
   * @param {Array} options.files - List of available files for internal link validation
   * @param {boolean} options.validateExternal - Whether to validate external links
   */
  constructor(options = {}) {
    this.logger = options.logger || console;
    this.documentRegistry = options.documentRegistry || {};
    this.files = options.files || [];
    this.validateExternal = options.validateExternal !== undefined ? options.validateExternal : true;
  }

  /**
   * Creates a link validator with appropriate parsers and checkers
   * @returns {LinkValidator} Configured link validator
   */
  createValidator() {
    // Create parsers
    const parsers = {
      markdown: new MarkdownLinkParser(),
      default: new MarkdownLinkParser() // Fallback to Markdown parser for unknown types
    };
    
    // Create file system for internal link checking
    const fileSystem = new FileSystem({ files: this.files });
    
    // Create HTTP client for external link checking
    const httpClient = new HttpClient();
    
    // Create checkers
    const checkers = {
      internal: new InternalLinkChecker({ fileSystem, logger: this.logger }),
      internal_with_anchor: new InternalLinkChecker({ fileSystem, logger: this.logger }),
      anchor: new AnchorLinkChecker({ logger: this.logger }),
      external: new ExternalLinkChecker({ httpClient, logger: this.logger }),
      invalid: {
        checkLink: async (link) => ({
          link,
          valid: false,
          message: 'Invalid link format',
          type: 'invalid_link'
        })
      },
      default: {
        checkLink: async (link) => ({
          link,
          valid: false,
          message: 'Unknown link type',
          type: 'unknown_link_type'
        })
      }
    };
    
    // Create and return the validator
    return new LinkValidator({
      parsers,
      checkers,
      documentRegistry: this.documentRegistry,
      logger: this.logger,
      validateExternal: this.validateExternal
    });
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

  /**
   * Adds a file to the file registry
   * @param {string} filePath - The file path to add
   */
  addFile(filePath) {
    if (!this.files.includes(filePath)) {
      this.files.push(filePath);
    }
  }

  /**
   * Adds multiple files to the file registry
   * @param {Array} filePaths - The file paths to add
   */
  addFiles(filePaths) {
    for (const filePath of filePaths) {
      this.addFile(filePath);
    }
  }
}

module.exports = ValidatorFactory;