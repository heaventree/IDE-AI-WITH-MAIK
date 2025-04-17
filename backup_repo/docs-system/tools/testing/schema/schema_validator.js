/**
 * Schema Validator for Documentation System
 * 
 * This module validates document structures against defined schemas to ensure
 * they contain all required fields and follow the correct format.
 */

class SchemaValidator {
  /**
   * Creates a new SchemaValidator instance
   * @param {Object} options - Configuration options
   * @param {Object} options.schemas - Map of schema definitions by document type
   * @param {Function} options.logger - Logging function for validation results
   */
  constructor(options = {}) {
    this.schemas = options.schemas || {};
    this.logger = options.logger || console;
  }

  /**
   * Validates a document against its schema
   * @param {Object} document - The document to validate
   * @param {string} documentType - The type of document (determines schema to use)
   * @returns {Object} Validation result with success flag and details
   */
  validateDocument(document, documentType) {
    try {
      // Get appropriate schema for document type
      const schema = this.getSchema(documentType);
      
      if (!schema) {
        throw new Error(`No schema available for document type: ${documentType}`);
      }
      
      // Validate required fields
      const requiredErrors = this.validateRequiredFields(document, schema);
      
      // Validate field types
      const typeErrors = this.validateFieldTypes(document, schema);
      
      // Validate field formats
      const formatErrors = this.validateFieldFormats(document, schema);
      
      // Validate field constraints
      const constraintErrors = this.validateFieldConstraints(document, schema);
      
      // Combine all errors
      const allErrors = [
        ...requiredErrors,
        ...typeErrors,
        ...formatErrors,
        ...constraintErrors
      ];
      
      // Log validation results
      this.logValidationResults(document, allErrors);
      
      return {
        valid: allErrors.length === 0,
        errors: allErrors,
        message: this.generateResultMessage(allErrors)
      };
    } catch (error) {
      this.logger.error('Schema validation error', {
        documentId: document.id || 'unknown',
        error: error.message
      });
      
      return {
        valid: false,
        error: error.message,
        errors: [{
          type: 'validation_error',
          message: error.message
        }]
      };
    }
  }

  /**
   * Gets the appropriate schema for a document type
   * @param {string} documentType - The document type
   * @returns {Object} Schema for the document type
   */
  getSchema(documentType) {
    return (
      this.schemas[documentType] || 
      this.schemas.default
    );
  }

  /**
   * Validates that all required fields are present in the document
   * @param {Object} document - The document to validate
   * @param {Object} schema - The schema to validate against
   * @returns {Array} Array of validation errors
   */
  validateRequiredFields(document, schema) {
    const errors = [];
    
    // Check that all required fields exist
    if (schema.required && Array.isArray(schema.required)) {
      for (const fieldName of schema.required) {
        if (document[fieldName] === undefined) {
          errors.push({
            type: 'required_field_missing',
            field: fieldName,
            message: `Required field '${fieldName}' is missing`
          });
        }
      }
    }
    
    return errors;
  }

  /**
   * Validates that field values match their expected types
   * @param {Object} document - The document to validate
   * @param {Object} schema - The schema to validate against
   * @returns {Array} Array of validation errors
   */
  validateFieldTypes(document, schema) {
    const errors = [];
    
    // Check field types
    if (schema.properties) {
      for (const [fieldName, fieldSchema] of Object.entries(schema.properties)) {
        // Skip if field doesn't exist in document
        if (document[fieldName] === undefined) {
          continue;
        }
        
        const value = document[fieldName];
        const expectedType = fieldSchema.type;
        
        if (!expectedType) {
          continue;
        }
        
        // Check type
        if (!this.checkType(value, expectedType)) {
          errors.push({
            type: 'invalid_field_type',
            field: fieldName,
            expectedType,
            actualType: this.getType(value),
            message: `Field '${fieldName}' should be ${expectedType}, but got ${this.getType(value)}`
          });
        }
        
        // Check nested objects
        if (expectedType === 'object' && fieldSchema.properties) {
          const nestedErrors = this.validateFieldTypes(value, fieldSchema);
          errors.push(...nestedErrors.map(error => ({
            ...error,
            field: `${fieldName}.${error.field}`
          })));
        }
        
        // Check array items
        if (expectedType === 'array' && fieldSchema.items && Array.isArray(value)) {
          for (let i = 0; i < value.length; i++) {
            const itemValue = value[i];
            const itemSchema = fieldSchema.items;
            
            if (itemSchema.type && !this.checkType(itemValue, itemSchema.type)) {
              errors.push({
                type: 'invalid_array_item_type',
                field: `${fieldName}[${i}]`,
                expectedType: itemSchema.type,
                actualType: this.getType(itemValue),
                message: `Array item '${fieldName}[${i}]' should be ${itemSchema.type}, but got ${this.getType(itemValue)}`
              });
            }
            
            // Check nested object in array
            if (itemSchema.type === 'object' && itemSchema.properties) {
              const nestedErrors = this.validateFieldTypes(itemValue, itemSchema);
              errors.push(...nestedErrors.map(error => ({
                ...error,
                field: `${fieldName}[${i}].${error.field}`
              })));
            }
          }
        }
      }
    }
    
    return errors;
  }

  /**
   * Validates that field values match their expected formats
   * @param {Object} document - The document to validate
   * @param {Object} schema - The schema to validate against
   * @returns {Array} Array of validation errors
   */
  validateFieldFormats(document, schema) {
    const errors = [];
    
    // Check field formats
    if (schema.properties) {
      for (const [fieldName, fieldSchema] of Object.entries(schema.properties)) {
        // Skip if field doesn't exist in document
        if (document[fieldName] === undefined) {
          continue;
        }
        
        const value = document[fieldName];
        const format = fieldSchema.format;
        
        if (!format) {
          continue;
        }
        
        // Check format
        if (!this.checkFormat(value, format)) {
          errors.push({
            type: 'invalid_field_format',
            field: fieldName,
            format,
            message: `Field '${fieldName}' does not match format '${format}'`
          });
        }
        
        // Check nested objects
        if (fieldSchema.type === 'object' && fieldSchema.properties) {
          const nestedErrors = this.validateFieldFormats(value, fieldSchema);
          errors.push(...nestedErrors.map(error => ({
            ...error,
            field: `${fieldName}.${error.field}`
          })));
        }
        
        // Check array items
        if (fieldSchema.type === 'array' && fieldSchema.items && Array.isArray(value)) {
          for (let i = 0; i < value.length; i++) {
            const itemValue = value[i];
            const itemSchema = fieldSchema.items;
            
            if (itemSchema.format && !this.checkFormat(itemValue, itemSchema.format)) {
              errors.push({
                type: 'invalid_array_item_format',
                field: `${fieldName}[${i}]`,
                format: itemSchema.format,
                message: `Array item '${fieldName}[${i}]' does not match format '${itemSchema.format}'`
              });
            }
            
            // Check nested object in array
            if (itemSchema.type === 'object' && itemSchema.properties) {
              const nestedErrors = this.validateFieldFormats(itemValue, itemSchema);
              errors.push(...nestedErrors.map(error => ({
                ...error,
                field: `${fieldName}[${i}].${error.field}`
              })));
            }
          }
        }
      }
    }
    
    return errors;
  }

  /**
   * Validates that field values match their constraints (min, max, etc.)
   * @param {Object} document - The document to validate
   * @param {Object} schema - The schema to validate against
   * @returns {Array} Array of validation errors
   */
  validateFieldConstraints(document, schema) {
    const errors = [];
    
    // Check field constraints
    if (schema.properties) {
      for (const [fieldName, fieldSchema] of Object.entries(schema.properties)) {
        // Skip if field doesn't exist in document
        if (document[fieldName] === undefined) {
          continue;
        }
        
        const value = document[fieldName];
        
        // Check string length
        if (fieldSchema.type === 'string') {
          if (fieldSchema.minLength !== undefined && value.length < fieldSchema.minLength) {
            errors.push({
              type: 'string_too_short',
              field: fieldName,
              minLength: fieldSchema.minLength,
              actualLength: value.length,
              message: `Field '${fieldName}' is too short (min: ${fieldSchema.minLength}, actual: ${value.length})`
            });
          }
          
          if (fieldSchema.maxLength !== undefined && value.length > fieldSchema.maxLength) {
            errors.push({
              type: 'string_too_long',
              field: fieldName,
              maxLength: fieldSchema.maxLength,
              actualLength: value.length,
              message: `Field '${fieldName}' is too long (max: ${fieldSchema.maxLength}, actual: ${value.length})`
            });
          }
          
          if (fieldSchema.pattern && !new RegExp(fieldSchema.pattern).test(value)) {
            errors.push({
              type: 'pattern_mismatch',
              field: fieldName,
              pattern: fieldSchema.pattern,
              message: `Field '${fieldName}' does not match pattern '${fieldSchema.pattern}'`
            });
          }
        }
        
        // Check number range
        if (fieldSchema.type === 'number' || fieldSchema.type === 'integer') {
          if (fieldSchema.minimum !== undefined && value < fieldSchema.minimum) {
            errors.push({
              type: 'number_too_small',
              field: fieldName,
              minimum: fieldSchema.minimum,
              actual: value,
              message: `Field '${fieldName}' is too small (min: ${fieldSchema.minimum}, actual: ${value})`
            });
          }
          
          if (fieldSchema.maximum !== undefined && value > fieldSchema.maximum) {
            errors.push({
              type: 'number_too_large',
              field: fieldName,
              maximum: fieldSchema.maximum,
              actual: value,
              message: `Field '${fieldName}' is too large (max: ${fieldSchema.maximum}, actual: ${value})`
            });
          }
        }
        
        // Check array length
        if (fieldSchema.type === 'array') {
          if (fieldSchema.minItems !== undefined && value.length < fieldSchema.minItems) {
            errors.push({
              type: 'array_too_short',
              field: fieldName,
              minItems: fieldSchema.minItems,
              actualItems: value.length,
              message: `Array '${fieldName}' is too short (min: ${fieldSchema.minItems}, actual: ${value.length})`
            });
          }
          
          if (fieldSchema.maxItems !== undefined && value.length > fieldSchema.maxItems) {
            errors.push({
              type: 'array_too_long',
              field: fieldName,
              maxItems: fieldSchema.maxItems,
              actualItems: value.length,
              message: `Array '${fieldName}' is too long (max: ${fieldSchema.maxItems}, actual: ${value.length})`
            });
          }
          
          // Check unique items
          if (fieldSchema.uniqueItems && !this.areArrayItemsUnique(value)) {
            errors.push({
              type: 'array_items_not_unique',
              field: fieldName,
              message: `Array '${fieldName}' must have unique items`
            });
          }
        }
        
        // Check nested objects
        if (fieldSchema.type === 'object' && fieldSchema.properties) {
          const nestedErrors = this.validateFieldConstraints(value, fieldSchema);
          errors.push(...nestedErrors.map(error => ({
            ...error,
            field: `${fieldName}.${error.field}`
          })));
        }
        
        // Check array items
        if (fieldSchema.type === 'array' && fieldSchema.items && Array.isArray(value)) {
          for (let i = 0; i < value.length; i++) {
            const itemValue = value[i];
            const itemSchema = fieldSchema.items;
            
            // Check nested object in array
            if (itemSchema.type === 'object' && itemSchema.properties) {
              const nestedErrors = this.validateFieldConstraints(itemValue, itemSchema);
              errors.push(...nestedErrors.map(error => ({
                ...error,
                field: `${fieldName}[${i}].${error.field}`
              })));
            }
          }
        }
      }
    }
    
    return errors;
  }

  /**
   * Checks if a value matches an expected type
   * @param {*} value - The value to check
   * @param {string} expectedType - The expected type
   * @returns {boolean} Whether the value matches the type
   */
  checkType(value, expectedType) {
    switch (expectedType) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' && !isNaN(value);
      case 'integer':
        return typeof value === 'number' && !isNaN(value) && Number.isInteger(value);
      case 'boolean':
        return typeof value === 'boolean';
      case 'array':
        return Array.isArray(value);
      case 'object':
        return typeof value === 'object' && value !== null && !Array.isArray(value);
      case 'null':
        return value === null;
      default:
        return false;
    }
  }

  /**
   * Gets the type of a value as a string
   * @param {*} value - The value to check
   * @returns {string} The type of the value
   */
  getType(value) {
    if (value === null) {
      return 'null';
    }
    
    if (Array.isArray(value)) {
      return 'array';
    }
    
    if (typeof value === 'number' && Number.isInteger(value)) {
      return 'integer';
    }
    
    return typeof value;
  }

  /**
   * Checks if a value matches an expected format
   * @param {*} value - The value to check
   * @param {string} format - The expected format
   * @returns {boolean} Whether the value matches the format
   */
  checkFormat(value, format) {
    // Skip format validation for non-strings
    if (typeof value !== 'string') {
      return true;
    }
    
    switch (format) {
      case 'date':
        return /^\d{4}-\d{2}-\d{2}$/.test(value);
      case 'date-time':
        return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(.\d+)?(Z|[+-]\d{2}:\d{2})$/.test(value);
      case 'email':
        return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value);
      case 'uri':
        return /^https?:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/[^\s]*)?$/.test(value);
      case 'uuid':
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
      case 'hostname':
        return /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value);
      default:
        return true; // Unknown format, so assume valid
    }
  }

  /**
   * Checks if an array has unique items
   * @param {Array} array - The array to check
   * @returns {boolean} Whether the array has unique items
   */
  areArrayItemsUnique(array) {
    // Simple JSON string comparison for objects
    const stringified = array.map(item => JSON.stringify(item));
    return new Set(stringified).size === array.length;
  }

  /**
   * Logs validation results
   * @param {Object} document - The validated document
   * @param {Array} errors - The validation errors
   */
  logValidationResults(document, errors) {
    if (errors.length > 0) {
      this.logger.warn('Document has schema validation errors', {
        documentId: document.id || 'unknown',
        errorCount: errors.length,
        errors: errors.map(error => ({
          type: error.type,
          field: error.field,
          message: error.message
        }))
      });
    } else {
      this.logger.info('Document passes schema validation', {
        documentId: document.id || 'unknown'
      });
    }
  }

  /**
   * Generates a human-readable result message
   * @param {Array} errors - The validation errors
   * @returns {string} Human-readable result message
   */
  generateResultMessage(errors) {
    if (errors.length === 0) {
      return 'Document is valid according to schema';
    }
    
    return `Document has ${errors.length} schema validation errors`;
  }

  /**
   * Validates multiple documents
   * @param {Array} documents - Array of documents to validate
   * @param {string} documentType - The type of documents (determines schema to use)
   * @returns {Object} Validation results for all documents
   */
  validateMultipleDocuments(documents, documentType) {
    const results = documents.map(document => this.validateDocument(document, documentType));
    
    const invalidDocuments = results.filter(result => !result.valid);
    
    return {
      valid: invalidDocuments.length === 0,
      documents: results,
      validCount: results.length - invalidDocuments.length,
      invalidCount: invalidDocuments.length,
      message: `${invalidDocuments.length} of ${results.length} documents have schema validation errors`
    };
  }

  /**
   * Registers a schema
   * @param {string} documentType - The document type
   * @param {Object} schema - The schema to register
   */
  registerSchema(documentType, schema) {
    this.schemas[documentType] = schema;
  }
}

module.exports = SchemaValidator;