/**
 * Internal Link Checker for Documentation System
 * 
 * This module validates internal links within the documentation system.
 */

class InternalLinkChecker {
  /**
   * Creates a new InternalLinkChecker instance
   * @param {Object} options - Configuration options
   * @param {Function} options.fileSystem - Function to check if a file exists
   * @param {Function} options.logger - Logging function for validation results
   */
  constructor(options = {}) {
    this.fileSystem = options.fileSystem;
    this.logger = options.logger || console;
  }

  /**
   * Checks an internal link for validity
   * @param {Object} link - The link object containing href and context
   * @param {Object} document - The source document containing the link
   * @param {Object} options - Additional options
   * @param {Object} options.documentRegistry - Registry of documents for validation
   * @returns {Object} Validation result
   */
  async checkLink(link, document, options = {}) {
    const { documentRegistry = {} } = options;
    const href = link.href.trim();
    
    try {
      // Check if link has special characters that would make it invalid
      if (href.includes(' ') || href.includes('\t') || href.includes('\n')) {
        return {
          link,
          valid: false,
          message: 'Internal link contains whitespace',
          type: 'invalid_characters'
        };
      }
      
      // Check if the link is empty
      if (!href) {
        return {
          link,
          valid: false,
          message: 'Internal link is empty',
          type: 'empty_link'
        };
      }
      
      // Check if link points to a document ID directly
      if (documentRegistry[href]) {
        return {
          link,
          valid: true,
          message: 'Link references valid document ID',
          type: 'document_id_reference'
        };
      }
      
      // Check if link points to a file in the system
      if (this.fileSystem) {
        const fileExists = await this.fileSystem.exists(href);
        
        if (fileExists) {
          return {
            link,
            valid: true,
            message: 'Link references existing file',
            type: 'file_reference'
          };
        }
        
        // Try relative to document path if available
        if (document.path) {
          const basePath = document.path.substring(0, document.path.lastIndexOf('/') + 1);
          const relativePath = `${basePath}${href}`;
          const relativeFileExists = await this.fileSystem.exists(relativePath);
          
          if (relativeFileExists) {
            return {
              link,
              valid: true,
              message: 'Link references existing file (relative path)',
              type: 'relative_file_reference',
              resolvedPath: relativePath
            };
          }
        }
        
        return {
          link,
          valid: false,
          message: `File not found: ${href}`,
          type: 'missing_file'
        };
      }
      
      // If no file system check available, fall back to existence check in document registry
      return {
        link,
        valid: false,
        message: `Cannot verify internal link: ${href}`,
        type: 'unverifiable_link'
      };
    } catch (error) {
      this.logger.error('Error checking internal link', {
        link: href,
        documentId: document.id || 'unknown',
        error: error.message
      });
      
      return {
        link,
        valid: false,
        error: error.message,
        message: `Error checking internal link: ${error.message}`,
        type: 'checker_error'
      };
    }
  }
}

module.exports = InternalLinkChecker;