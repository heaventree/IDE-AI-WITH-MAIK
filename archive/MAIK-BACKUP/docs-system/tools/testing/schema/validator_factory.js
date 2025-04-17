/**
 * Schema Validator Factory for Documentation System
 * 
 * This module provides a factory for creating schema validators
 * with appropriate schemas loaded for different document types.
 */

const SchemaValidator = require('./schema_validator');
const templateSchemas = require('./template_schemas');

/**
 * Schema Validator Factory
 */
class ValidatorFactory {
  /**
   * Creates a new ValidatorFactory instance
   * @param {Object} options - Configuration options
   * @param {Object} options.customSchemas - Additional schemas beyond the default templates
   * @param {Object} options.logger - Logging function for validation results
   * @param {boolean} options.strictMode - If true, validation fails on any schema violation
   */
  constructor(options = {}) {
    this.schemas = { ...templateSchemas, ...(options.customSchemas || {}) };
    this.logger = options.logger || console;
    this.strictMode = options.strictMode !== undefined ? options.strictMode : true;
  }

  /**
   * Creates a schema validator for a specific document type
   * @param {string} documentType - The type of document to create validator for
   * @returns {SchemaValidator} SchemaValidator instance configured for the document type
   * @throws {Error} If schema not found for document type
   */
  createValidator(documentType) {
    if (!this.schemas[documentType]) {
      throw new Error(`Schema not found for document type: ${documentType}`);
    }
    
    return new SchemaValidator({
      schemaStore: { [documentType]: this.schemas[documentType] },
      strictMode: this.strictMode,
      logger: this.logger
    });
  }

  /**
   * Creates a universal schema validator with all registered schemas
   * @returns {SchemaValidator} SchemaValidator instance with all schemas
   */
  createUniversalValidator() {
    return new SchemaValidator({
      schemaStore: this.schemas,
      strictMode: this.strictMode,
      logger: this.logger
    });
  }

  /**
   * Gets a list of all available document types
   * @returns {Array<string>} Array of document type names
   */
  getAvailableDocumentTypes() {
    return Object.keys(this.schemas);
  }

  /**
   * Registers a new schema
   * @param {string} documentType - The document type name
   * @param {Object} schema - The schema definition
   * @throws {Error} If schema already exists and overwrite is false
   */
  registerSchema(documentType, schema, overwrite = false) {
    if (this.schemas[documentType] && !overwrite) {
      throw new Error(`Schema already exists for document type: ${documentType}`);
    }
    
    this.schemas[documentType] = schema;
  }

  /**
   * Validates a document against a specific schema
   * @param {Object} document - The document to validate
   * @param {string} documentType - The type of document being validated
   * @returns {Object} Validation result with success flag and any errors
   */
  validateDocument(document, documentType) {
    const validator = this.createValidator(documentType);
    return validator.validateDocument(document, documentType);
  }

  /**
   * Determines the appropriate document type for a document
   * @param {Object} document - The document to analyze
   * @returns {string|null} The determined document type or null if not determined
   */
  determineDocumentType(document) {
    // Try to determine based on metadata
    if (document.metadata) {
      // Check for specific metadata fields that indicate document type
      if (document.metadata.api) return 'apiDocumentation';
      if (document.metadata.architecture) return 'technicalArchitecture';
      if (document.metadata.integration) return 'integrationDocumentation';
      if (document.metadata.security) return 'securityDocumentation';
      if (document.metadata.audit) return 'auditDocumentation';
      if (document.metadata.project) return 'projectOverview';
    }
    
    // Try to determine based on content patterns
    if (document.content) {
      if (/^## API |^# .*API |^## Endpoints/.test(document.content)) return 'apiDocumentation';
      if (/^## Architecture |^# .*Architecture/.test(document.content)) return 'technicalArchitecture';
      if (/^## Integration |^# .*Integration/.test(document.content)) return 'integrationDocumentation';
      if (/^## Security |^# .*Security/.test(document.content)) return 'securityDocumentation';
      if (/^## Audit |^# .*Audit|^## Executive Summary/.test(document.content)) return 'auditDocumentation';
      if (/^## Project |^# .*Project Overview|^## Project Goals/.test(document.content)) return 'projectOverview';
      if (/^## Development |^# .*Guidelines|^## Code Style/.test(document.content)) return 'developmentGuidelines';
    }
    
    // Fall back to base schema if no specific type determined
    return 'base';
  }

  /**
   * Auto-validate a document by determining its type and applying the appropriate schema
   * @param {Object} document - The document to validate
   * @returns {Object} Validation result with document type, success flag, and any errors
   */
  autoValidateDocument(document) {
    const documentType = this.determineDocumentType(document);
    
    if (!documentType) {
      return {
        documentType: null,
        valid: false,
        errors: [{
          type: 'document_type_unknown',
          message: 'Could not determine document type for validation'
        }]
      };
    }
    
    const result = this.validateDocument(document, documentType);
    
    return {
      documentType,
      ...result
    };
  }
}

module.exports = ValidatorFactory;