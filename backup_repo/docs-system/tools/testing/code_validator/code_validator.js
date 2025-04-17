/**
 * Code Validator for Documentation System
 * 
 * This module validates code examples within documentation to ensure they are
 * syntactically correct and executable.
 */

class CodeValidator {
  /**
   * Creates a new CodeValidator instance
   * @param {Object} options - Configuration options
   * @param {Object} options.parsers - Code block parsers for different content types
   * @param {Object} options.runners - Code runners for different languages
   * @param {Function} options.logger - Logging function for validation results
   */
  constructor(options = {}) {
    this.parsers = options.parsers || {};
    this.runners = options.runners || {};
    this.logger = options.logger || console;
  }

  /**
   * Validates all code examples in a document
   * @param {Object} document - The document containing code examples
   * @param {string} documentType - The type of document (determines parser to use)
   * @returns {Object} Validation results with success flag and details
   */
  async validateDocumentCode(document, documentType) {
    try {
      // Get appropriate parser for document type
      const parser = this.getParser(documentType);
      
      if (!parser) {
        throw new Error(`No code parser available for document type: ${documentType}`);
      }
      
      // Extract code blocks from document
      const codeBlocks = parser.extractCodeBlocks(document);
      
      if (codeBlocks.length === 0) {
        return {
          valid: true,
          codeBlocks: [],
          message: 'No code blocks found in document'
        };
      }
      
      // Validate each code block
      const results = await Promise.all(
        codeBlocks.map(codeBlock => this.validateCodeBlock(codeBlock))
      );
      
      // Count valid and invalid code blocks
      const invalidBlocks = results.filter(result => !result.valid);
      
      // Log validation results
      this.logValidationResults(document, results);
      
      return {
        valid: invalidBlocks.length === 0,
        codeBlocks: results,
        validCount: results.length - invalidBlocks.length,
        invalidCount: invalidBlocks.length,
        message: this.generateResultMessage(results)
      };
    } catch (error) {
      this.logger.error('Code validation error', {
        documentId: document.id || 'unknown',
        error: error.message
      });
      
      return {
        valid: false,
        error: error.message,
        codeBlocks: []
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
      this.parsers.markdown || 
      this.parsers.default
    );
  }

  /**
   * Validates a single code block
   * @param {Object} codeBlock - The code block to validate
   * @returns {Object} Validation result for the code block
   */
  async validateCodeBlock(codeBlock) {
    try {
      // No validation for blocks with no language specified or excluded languages
      if (!codeBlock.language || codeBlock.language === 'text' || codeBlock.language === 'plaintext') {
        return {
          codeBlock,
          valid: true,
          message: 'No validation required for plaintext blocks',
          type: 'skipped'
        };
      }
      
      // Get appropriate runner for language
      const runner = this.getRunner(codeBlock.language);
      
      if (!runner) {
        return {
          codeBlock,
          valid: true,
          message: `No validator available for language: ${codeBlock.language}`,
          type: 'unsupported_language'
        };
      }
      
      // Run the validation
      const validationResult = await runner.validate(codeBlock);
      
      return {
        codeBlock,
        ...validationResult
      };
    } catch (error) {
      return {
        codeBlock,
        valid: false,
        error: error.message,
        type: 'validation_error'
      };
    }
  }

  /**
   * Gets the appropriate runner for a language
   * @param {string} language - The code language
   * @returns {Object} Runner for the language
   */
  getRunner(language) {
    // Map common language aliases to primary names
    const languageMap = {
      'js': 'javascript',
      'ts': 'typescript',
      'py': 'python',
      'rb': 'ruby',
      'sh': 'bash',
      'bash': 'shell',
      'zsh': 'shell',
      'c++': 'cpp'
    };
    
    const normalizedLanguage = (languageMap[language.toLowerCase()] || language).toLowerCase();
    
    return this.runners[normalizedLanguage] || this.runners.default;
  }

  /**
   * Logs validation results
   * @param {Object} document - The validated document
   * @param {Array} results - The validation results
   */
  logValidationResults(document, results) {
    const invalidBlocks = results.filter(result => !result.valid);
    
    if (invalidBlocks.length > 0) {
      this.logger.warn('Document contains invalid code examples', {
        documentId: document.id || 'unknown',
        invalidCount: invalidBlocks.length,
        totalCount: results.length,
        invalidBlocks: invalidBlocks.map(result => ({
          language: result.codeBlock.language,
          code: result.codeBlock.code.substring(0, 100) + (result.codeBlock.code.length > 100 ? '...' : ''),
          error: result.error || result.message
        }))
      });
    } else {
      this.logger.info('All code examples in document are valid', {
        documentId: document.id || 'unknown',
        codeBlockCount: results.length
      });
    }
  }

  /**
   * Generates a human-readable result message
   * @param {Array} results - The validation results
   * @returns {string} Human-readable result message
   */
  generateResultMessage(results) {
    const totalBlocks = results.length;
    const invalidBlocks = results.filter(result => !result.valid);
    const invalidCount = invalidBlocks.length;
    
    if (totalBlocks === 0) {
      return 'No code blocks found in document';
    }
    
    if (invalidCount === 0) {
      return `All ${totalBlocks} code blocks are valid`;
    }
    
    return `${invalidCount} of ${totalBlocks} code blocks are invalid`;
  }

  /**
   * Registers a new parser
   * @param {string} documentType - The document type
   * @param {Object} parser - The parser to register
   */
  registerParser(documentType, parser) {
    this.parsers[documentType] = parser;
  }

  /**
   * Registers a new runner
   * @param {string} language - The language
   * @param {Object} runner - The runner to register
   */
  registerRunner(language, runner) {
    this.runners[language] = runner;
  }
}

module.exports = CodeValidator;