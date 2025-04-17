/**
 * Schema Validation Module for Documentation System
 * 
 * This module provides data validation and schema enforcement functionality
 * to ensure data integrity and consistency throughout the system.
 */

/**
 * Schema Validator class for validating data against schemas
 */
class SchemaValidator {
  /**
   * Create a new SchemaValidator instance
   * @param {Object} [options] - Configuration options
   * @param {Object} [options.customTypes] - Custom data types for validation
   * @param {Object} [options.customFormats] - Custom formats for string validation
   * @param {Function} [options.errorFormatter] - Function to format validation errors
   */
  constructor(options = {}) {
    this.schemas = {};
    this.customTypes = {
      ...this._defaultCustomTypes(),
      ...options.customTypes
    };
    this.customFormats = {
      ...this._defaultCustomFormats(),
      ...options.customFormats
    };
    this.errorFormatter = options.errorFormatter || this._defaultErrorFormatter;
  }
  
  /**
   * Register a schema
   * @param {string} schemaId - Unique identifier for the schema
   * @param {Object} schema - JSON Schema object
   * @returns {Object} Registered schema
   */
  registerSchema(schemaId, schema) {
    if (!schemaId) {
      throw new Error('Schema ID is required');
    }
    
    if (!schema || typeof schema !== 'object') {
      throw new Error('Schema must be a valid object');
    }
    
    // Store schema with its ID
    this.schemas[schemaId] = {
      id: schemaId,
      schema,
      createdAt: new Date().toISOString()
    };
    
    return this.schemas[schemaId];
  }
  
  /**
   * Get a registered schema by ID
   * @param {string} schemaId - Schema identifier
   * @returns {Object|null} Schema or null if not found
   */
  getSchema(schemaId) {
    return this.schemas[schemaId] || null;
  }
  
  /**
   * Get all registered schemas
   * @returns {Object} All schemas
   */
  getAllSchemas() {
    return { ...this.schemas };
  }
  
  /**
   * Remove a schema
   * @param {string} schemaId - Schema identifier
   * @returns {boolean} Whether the schema was removed
   */
  removeSchema(schemaId) {
    if (this.schemas[schemaId]) {
      delete this.schemas[schemaId];
      return true;
    }
    return false;
  }
  
  /**
   * Validate data against a schema
   * @param {Object} data - Data to validate
   * @param {string|Object} schema - Schema ID or schema object
   * @param {Object} [options] - Validation options
   * @param {boolean} [options.throwOnError=false] - Throw error if validation fails
   * @param {boolean} [options.removeAdditional=false] - Remove additional properties
   * @param {boolean} [options.useDefaults=false] - Use default values from schema
   * @param {boolean} [options.coerceTypes=false] - Coerce types if possible
   * @returns {Object} Validation result
   */
  validate(data, schema, options = {}) {
    // Get schema by ID if string is provided
    const schemaObj = typeof schema === 'string' ? this.getSchema(schema) : { schema };
    
    if (!schemaObj || !schemaObj.schema) {
      throw new Error(typeof schema === 'string' ? `Schema not found: ${schema}` : 'Invalid schema');
    }
    
    // Validation options
    const validationOptions = {
      throwOnError: options.throwOnError || false,
      removeAdditional: options.removeAdditional || false,
      useDefaults: options.useDefaults || false,
      coerceTypes: options.coerceTypes || false
    };
    
    // Validate the data
    const result = this._validateAgainstSchema(data, schemaObj.schema, validationOptions);
    
    // Throw error if requested and validation failed
    if (validationOptions.throwOnError && !result.valid) {
      const error = new Error(`Validation failed: ${result.errors.map(e => e.message).join(', ')}`);
      error.validationErrors = result.errors;
      error.validationResult = result;
      throw error;
    }
    
    return result;
  }
  
  /**
   * Create a validator function for a specific schema
   * @param {string|Object} schema - Schema ID or schema object
   * @param {Object} [options] - Validation options
   * @returns {Function} Validator function
   */
  createValidator(schema, options = {}) {
    return (data) => this.validate(data, schema, options);
  }
  
  /**
   * Validate a specific field
   * @param {*} value - Field value
   * @param {Object} fieldSchema - Field schema
   * @param {Object} [options] - Validation options
   * @returns {Object} Validation result
   */
  validateField(value, fieldSchema, options = {}) {
    const schema = {
      type: 'object',
      properties: {
        field: fieldSchema
      }
    };
    
    const result = this.validate({ field: value }, schema, options);
    
    return {
      valid: result.valid,
      errors: result.errors.map(error => ({
        ...error,
        path: error.path.replace(/^\.field/, '')
      }))
    };
  }
  
  /**
   * Sanitize data according to schema
   * @param {Object} data - Data to sanitize
   * @param {string|Object} schema - Schema ID or schema object
   * @param {Object} [options] - Sanitization options
   * @param {boolean} [options.removeAdditional=true] - Remove additional properties
   * @param {boolean} [options.useDefaults=true] - Use default values from schema
   * @param {boolean} [options.coerceTypes=true] - Coerce types if possible
   * @param {boolean} [options.trim=true] - Trim string values
   * @param {boolean} [options.stripHtml=true] - Strip HTML from string values
   * @returns {Object} Sanitized data
   */
  sanitize(data, schema, options = {}) {
    // Get schema by ID if string is provided
    const schemaObj = typeof schema === 'string' ? this.getSchema(schema) : { schema };
    
    if (!schemaObj || !schemaObj.schema) {
      throw new Error(typeof schema === 'string' ? `Schema not found: ${schema}` : 'Invalid schema');
    }
    
    // Sanitization options with defaults
    const sanitizeOptions = {
      removeAdditional: options.removeAdditional !== false,
      useDefaults: options.useDefaults !== false,
      coerceTypes: options.coerceTypes !== false,
      trim: options.trim !== false,
      stripHtml: options.stripHtml !== false
    };
    
    // Clone data to avoid modifying the original
    const sanitizedData = this._deepClone(data);
    
    // Apply sanitization
    this._sanitizeObject(sanitizedData, schemaObj.schema, sanitizeOptions);
    
    return sanitizedData;
  }
  
  /**
   * Generate sample data from a schema
   * @param {string|Object} schema - Schema ID or schema object
   * @param {Object} [options] - Generation options
   * @param {boolean} [options.useExamples=true] - Use examples from schema if available
   * @param {boolean} [options.useDefaults=true] - Use default values from schema if available
   * @param {boolean} [options.requiredOnly=false] - Generate only required fields
   * @returns {Object} Generated sample data
   */
  generateSample(schema, options = {}) {
    // Get schema by ID if string is provided
    const schemaObj = typeof schema === 'string' ? this.getSchema(schema) : { schema };
    
    if (!schemaObj || !schemaObj.schema) {
      throw new Error(typeof schema === 'string' ? `Schema not found: ${schema}` : 'Invalid schema');
    }
    
    // Generation options
    const genOptions = {
      useExamples: options.useExamples !== false,
      useDefaults: options.useDefaults !== false,
      requiredOnly: options.requiredOnly || false
    };
    
    // Generate sample data
    return this._generateFromSchema(schemaObj.schema, genOptions);
  }
  
  /**
   * Generate documentation for a schema
   * @param {string|Object} schema - Schema ID or schema object
   * @param {Object} [options] - Documentation options
   * @param {string} [options.format='markdown'] - Output format ('markdown', 'html', 'json')
   * @param {boolean} [options.includeExamples=true] - Include examples in documentation
   * @returns {string|Object} Schema documentation
   */
  generateDocs(schema, options = {}) {
    // Get schema by ID if string is provided
    const schemaObj = typeof schema === 'string' ? this.getSchema(schema) : { schema };
    
    if (!schemaObj || !schemaObj.schema) {
      throw new Error(typeof schema === 'string' ? `Schema not found: ${schema}` : 'Invalid schema');
    }
    
    // Documentation options
    const docOptions = {
      format: options.format || 'markdown',
      includeExamples: options.includeExamples !== false
    };
    
    // Generate documentation
    const docData = this._generateSchemaDocs(schemaObj.schema, schemaObj.id || 'schema');
    
    // Format documentation
    switch (docOptions.format.toLowerCase()) {
      case 'html':
        return this._formatDocsHtml(docData, docOptions);
      case 'json':
        return docData;
      case 'markdown':
      default:
        return this._formatDocsMarkdown(docData, docOptions);
    }
  }
  
  /**
   * Validate data against a schema
   * @param {Object} data - Data to validate
   * @param {Object} schema - Schema object
   * @param {Object} options - Validation options
   * @returns {Object} Validation result
   * @private
   */
  _validateAgainstSchema(data, schema, options) {
    const errors = [];
    const context = { path: '', options };
    const valid = this._validateValue(data, schema, errors, context);
    
    return {
      valid,
      errors: errors.map(error => this.errorFormatter(error, context)),
      data
    };
  }
  
  /**
   * Validate a value against a schema
   * @param {*} value - Value to validate
   * @param {Object} schema - Schema for the value
   * @param {Array} errors - Array to collect errors
   * @param {Object} context - Validation context
   * @returns {boolean} Whether validation passed
   * @private
   */
  _validateValue(value, schema, errors, context) {
    // Apply defaults if enabled
    if (context.options.useDefaults && value === undefined && schema.default !== undefined) {
      value = schema.default;
    }
    
    // Required check
    if (value === undefined) {
      if (schema.required) {
        errors.push({
          type: 'required',
          path: context.path,
          message: 'Required value is missing'
        });
        return false;
      }
      return true; // Skip validation for undefined optional values
    }
    
    // Null check
    if (value === null) {
      if (schema.type === 'null' || (Array.isArray(schema.type) && schema.type.includes('null'))) {
        return true;
      }
      
      if (schema.nullable) {
        return true;
      }
      
      errors.push({
        type: 'type',
        path: context.path,
        message: `Value must not be null`
      });
      return false;
    }
    
    // Type validation
    if (schema.type) {
      if (!this._validateType(value, schema.type, schema, errors, context)) {
        return false;
      }
    }
    
    // Enum validation
    if (schema.enum && !schema.enum.includes(value)) {
      errors.push({
        type: 'enum',
        path: context.path,
        message: `Value must be one of: ${schema.enum.join(', ')}`,
        allowedValues: schema.enum
      });
      return false;
    }
    
    // Validate by type
    let typeValid = true;
    const valueType = Array.isArray(value) ? 'array' : typeof value;
    
    switch (valueType) {
      case 'string':
        typeValid = this._validateString(value, schema, errors, context);
        break;
      case 'number':
        typeValid = this._validateNumber(value, schema, errors, context);
        break;
      case 'boolean':
        // No additional validation for booleans
        break;
      case 'object':
        typeValid = this._validateObject(value, schema, errors, context);
        break;
      case 'array':
        typeValid = this._validateArray(value, schema, errors, context);
        break;
    }
    
    // Custom validation
    if (typeValid && schema.validate && typeof schema.validate === 'function') {
      try {
        const customValid = schema.validate(value, context);
        
        if (customValid !== true) {
          errors.push({
            type: 'custom',
            path: context.path,
            message: typeof customValid === 'string' ? customValid : 'Custom validation failed'
          });
          return false;
        }
      } catch (error) {
        errors.push({
          type: 'custom',
          path: context.path,
          message: error.message || 'Custom validation error'
        });
        return false;
      }
    }
    
    return typeValid;
  }
  
  /**
   * Validate a value's type
   * @param {*} value - Value to validate
   * @param {string|Array} type - Expected type(s)
   * @param {Object} schema - Schema for the value
   * @param {Array} errors - Array to collect errors
   * @param {Object} context - Validation context
   * @returns {boolean} Whether type validation passed
   * @private
   */
  _validateType(value, type, schema, errors, context) {
    // Convert single type to array
    const types = Array.isArray(type) ? type : [type];
    
    // Check if value matches any allowed type
    for (const expectedType of types) {
      // Standard JSON Schema types
      if (this._checkType(value, expectedType)) {
        return true;
      }
      
      // Custom types
      if (this.customTypes[expectedType] && 
          this.customTypes[expectedType].check(value, schema)) {
        return true;
      }
    }
    
    // Type coercion
    if (context.options.coerceTypes) {
      const coercedValue = this._coerceType(value, types[0], schema);
      if (coercedValue !== undefined) {
        // Replace the original value with coerced value
        if (context.parent && context.key !== undefined) {
          context.parent[context.key] = coercedValue;
        }
        return true;
      }
    }
    
    // Type validation failed
    errors.push({
      type: 'type',
      path: context.path,
      message: `Expected ${types.join(' or ')}, got ${Array.isArray(value) ? 'array' : typeof value}`,
      expectedTypes: types,
      actualType: Array.isArray(value) ? 'array' : typeof value
    });
    
    return false;
  }
  
  /**
   * Check if a value matches a type
   * @param {*} value - Value to check
   * @param {string} type - Type to check against
   * @returns {boolean} Whether the value matches the type
   * @private
   */
  _checkType(value, type) {
    switch (type) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' && !isNaN(value);
      case 'integer':
        return typeof value === 'number' && !isNaN(value) && Number.isInteger(value);
      case 'boolean':
        return typeof value === 'boolean';
      case 'object':
        return typeof value === 'object' && value !== null && !Array.isArray(value);
      case 'array':
        return Array.isArray(value);
      case 'null':
        return value === null;
      default:
        return false;
    }
  }
  
  /**
   * Try to coerce a value to a different type
   * @param {*} value - Value to coerce
   * @param {string} type - Target type
   * @param {Object} schema - Schema for the value
   * @returns {*} Coerced value or undefined if coercion failed
   * @private
   */
  _coerceType(value, type, schema) {
    try {
      switch (type) {
        case 'string':
          if (typeof value === 'number' || typeof value === 'boolean') {
            return String(value);
          }
          if (value instanceof Date) {
            return value.toISOString();
          }
          return undefined;
          
        case 'number':
          if (typeof value === 'string' && /^-?\d+(\.\d+)?$/.test(value)) {
            const num = Number(value);
            return isNaN(num) ? undefined : num;
          }
          if (typeof value === 'boolean') {
            return value ? 1 : 0;
          }
          return undefined;
          
        case 'integer':
          if (typeof value === 'string' && /^-?\d+$/.test(value)) {
            const num = Number(value);
            return isNaN(num) ? undefined : Math.floor(num);
          }
          if (typeof value === 'number' && !isNaN(value)) {
            return Math.floor(value);
          }
          if (typeof value === 'boolean') {
            return value ? 1 : 0;
          }
          return undefined;
          
        case 'boolean':
          if (typeof value === 'string') {
            if (/^(true|1|yes)$/i.test(value)) return true;
            if (/^(false|0|no)$/i.test(value)) return false;
          }
          if (typeof value === 'number') {
            return value !== 0;
          }
          return undefined;
          
        case 'array':
          if (typeof value === 'string' && schema.items) {
            try {
              return JSON.parse(value);
            } catch (e) {
              return value.split(',').map(s => s.trim());
            }
          }
          return undefined;
          
        case 'object':
          if (typeof value === 'string') {
            try {
              return JSON.parse(value);
            } catch (e) {
              return undefined;
            }
          }
          return undefined;
          
        default:
          return undefined;
      }
    } catch (error) {
      return undefined;
    }
  }
  
  /**
   * Validate a string
   * @param {string} value - String to validate
   * @param {Object} schema - Schema for the string
   * @param {Array} errors - Array to collect errors
   * @param {Object} context - Validation context
   * @returns {boolean} Whether validation passed
   * @private
   */
  _validateString(value, schema, errors, context) {
    // Minlength
    if (schema.minLength !== undefined && value.length < schema.minLength) {
      errors.push({
        type: 'minLength',
        path: context.path,
        message: `String must be at least ${schema.minLength} characters long`,
        minLength: schema.minLength,
        actualLength: value.length
      });
      return false;
    }
    
    // Maxlength
    if (schema.maxLength !== undefined && value.length > schema.maxLength) {
      errors.push({
        type: 'maxLength',
        path: context.path,
        message: `String must be at most ${schema.maxLength} characters long`,
        maxLength: schema.maxLength,
        actualLength: value.length
      });
      return false;
    }
    
    // Pattern
    if (schema.pattern) {
      const regex = new RegExp(schema.pattern);
      if (!regex.test(value)) {
        errors.push({
          type: 'pattern',
          path: context.path,
          message: schema.patternError || `String must match pattern: ${schema.pattern}`,
          pattern: schema.pattern
        });
        return false;
      }
    }
    
    // Format validation
    if (schema.format) {
      const formatValidator = this.customFormats[schema.format];
      if (formatValidator && !formatValidator.validate(value)) {
        errors.push({
          type: 'format',
          path: context.path,
          message: formatValidator.error || `String must be valid ${schema.format}`,
          format: schema.format
        });
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Validate a number
   * @param {number} value - Number to validate
   * @param {Object} schema - Schema for the number
   * @param {Array} errors - Array to collect errors
   * @param {Object} context - Validation context
   * @returns {boolean} Whether validation passed
   * @private
   */
  _validateNumber(value, schema, errors, context) {
    // Minimum
    if (schema.minimum !== undefined) {
      const valid = schema.exclusiveMinimum ? value > schema.minimum : value >= schema.minimum;
      if (!valid) {
        errors.push({
          type: 'minimum',
          path: context.path,
          message: schema.exclusiveMinimum
            ? `Number must be greater than ${schema.minimum}`
            : `Number must be greater than or equal to ${schema.minimum}`,
          limit: schema.minimum,
          exclusive: !!schema.exclusiveMinimum,
          actual: value
        });
        return false;
      }
    }
    
    // Maximum
    if (schema.maximum !== undefined) {
      const valid = schema.exclusiveMaximum ? value < schema.maximum : value <= schema.maximum;
      if (!valid) {
        errors.push({
          type: 'maximum',
          path: context.path,
          message: schema.exclusiveMaximum
            ? `Number must be less than ${schema.maximum}`
            : `Number must be less than or equal to ${schema.maximum}`,
          limit: schema.maximum,
          exclusive: !!schema.exclusiveMaximum,
          actual: value
        });
        return false;
      }
    }
    
    // MultipleOf
    if (schema.multipleOf !== undefined) {
      const remainder = value % schema.multipleOf;
      if (Math.abs(remainder) > Number.EPSILON) {
        errors.push({
          type: 'multipleOf',
          path: context.path,
          message: `Number must be a multiple of ${schema.multipleOf}`,
          multipleOf: schema.multipleOf,
          actual: value
        });
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Validate an object
   * @param {Object} value - Object to validate
   * @param {Object} schema - Schema for the object
   * @param {Array} errors - Array to collect errors
   * @param {Object} context - Validation context
   * @returns {boolean} Whether validation passed
   * @private
   */
  _validateObject(value, schema, errors, context) {
    let valid = true;
    
    // Properties
    if (schema.properties) {
      for (const propName in schema.properties) {
        const propSchema = schema.properties[propName];
        const propValue = value[propName];
        const propPath = context.path ? `${context.path}.${propName}` : propName;
        const propContext = {
          ...context,
          path: propPath,
          parent: value,
          key: propName
        };
        
        const propValid = this._validateValue(propValue, propSchema, errors, propContext);
        valid = valid && propValid;
      }
    }
    
    // Required properties
    if (schema.required && Array.isArray(schema.required)) {
      for (const requiredProp of schema.required) {
        if (value[requiredProp] === undefined) {
          errors.push({
            type: 'required',
            path: context.path ? `${context.path}.${requiredProp}` : requiredProp,
            message: `Required property '${requiredProp}' is missing`,
            missingProperty: requiredProp
          });
          valid = false;
        }
      }
    }
    
    // Additional properties
    if (schema.additionalProperties !== undefined) {
      const definedProps = schema.properties ? Object.keys(schema.properties) : [];
      const additionalProps = Object.keys(value).filter(prop => !definedProps.includes(prop));
      
      if (schema.additionalProperties === false && additionalProps.length > 0) {
        // Additional properties not allowed
        for (const prop of additionalProps) {
          errors.push({
            type: 'additionalProperties',
            path: context.path ? `${context.path}.${prop}` : prop,
            message: `Additional property '${prop}' is not allowed`,
            additionalProperty: prop
          });
          valid = false;
        }
      } else if (typeof schema.additionalProperties === 'object') {
        // Validate additional properties against schema
        for (const prop of additionalProps) {
          const propValue = value[prop];
          const propPath = context.path ? `${context.path}.${prop}` : prop;
          const propContext = {
            ...context,
            path: propPath,
            parent: value,
            key: prop
          };
          
          const propValid = this._validateValue(propValue, schema.additionalProperties, errors, propContext);
          valid = valid && propValid;
        }
      }
      
      // Remove additional properties if requested
      if (context.options.removeAdditional && schema.additionalProperties === false) {
        for (const prop of additionalProps) {
          delete value[prop];
        }
      }
    }
    
    // Minimum properties
    if (schema.minProperties !== undefined) {
      const propCount = Object.keys(value).length;
      if (propCount < schema.minProperties) {
        errors.push({
          type: 'minProperties',
          path: context.path,
          message: `Object must have at least ${schema.minProperties} properties`,
          minProperties: schema.minProperties,
          actualProperties: propCount
        });
        valid = false;
      }
    }
    
    // Maximum properties
    if (schema.maxProperties !== undefined) {
      const propCount = Object.keys(value).length;
      if (propCount > schema.maxProperties) {
        errors.push({
          type: 'maxProperties',
          path: context.path,
          message: `Object must have at most ${schema.maxProperties} properties`,
          maxProperties: schema.maxProperties,
          actualProperties: propCount
        });
        valid = false;
      }
    }
    
    return valid;
  }
  
  /**
   * Validate an array
   * @param {Array} value - Array to validate
   * @param {Object} schema - Schema for the array
   * @param {Array} errors - Array to collect errors
   * @param {Object} context - Validation context
   * @returns {boolean} Whether validation passed
   * @private
   */
  _validateArray(value, schema, errors, context) {
    let valid = true;
    
    // Minimum items
    if (schema.minItems !== undefined && value.length < schema.minItems) {
      errors.push({
        type: 'minItems',
        path: context.path,
        message: `Array must have at least ${schema.minItems} items`,
        minItems: schema.minItems,
        actualItems: value.length
      });
      valid = false;
    }
    
    // Maximum items
    if (schema.maxItems !== undefined && value.length > schema.maxItems) {
      errors.push({
        type: 'maxItems',
        path: context.path,
        message: `Array must have at most ${schema.maxItems} items`,
        maxItems: schema.maxItems,
        actualItems: value.length
      });
      valid = false;
    }
    
    // Unique items
    if (schema.uniqueItems) {
      const uniqueItems = new Set();
      const duplicates = [];
      
      for (let i = 0; i < value.length; i++) {
        const item = value[i];
        const itemStr = JSON.stringify(item);
        
        if (uniqueItems.has(itemStr)) {
          duplicates.push(i);
        } else {
          uniqueItems.add(itemStr);
        }
      }
      
      if (duplicates.length > 0) {
        errors.push({
          type: 'uniqueItems',
          path: context.path,
          message: 'Array items must be unique',
          duplicateIndices: duplicates
        });
        valid = false;
      }
    }
    
    // Items validation
    if (schema.items) {
      if (Array.isArray(schema.items)) {
        // Tuple validation
        for (let i = 0; i < Math.min(value.length, schema.items.length); i++) {
          const itemSchema = schema.items[i];
          const itemValue = value[i];
          const itemPath = `${context.path}[${i}]`;
          const itemContext = {
            ...context,
            path: itemPath,
            parent: value,
            key: i
          };
          
          const itemValid = this._validateValue(itemValue, itemSchema, errors, itemContext);
          valid = valid && itemValid;
        }
        
        // Additional items
        if (schema.additionalItems !== false && schema.items.length < value.length) {
          const additionalSchema = typeof schema.additionalItems === 'object' ? schema.additionalItems : {};
          
          for (let i = schema.items.length; i < value.length; i++) {
            const itemValue = value[i];
            const itemPath = `${context.path}[${i}]`;
            const itemContext = {
              ...context,
              path: itemPath,
              parent: value,
              key: i
            };
            
            const itemValid = this._validateValue(itemValue, additionalSchema, errors, itemContext);
            valid = valid && itemValid;
          }
        } else if (schema.additionalItems === false && schema.items.length < value.length) {
          errors.push({
            type: 'additionalItems',
            path: context.path,
            message: `Array must not have more than ${schema.items.length} items`,
            maxItems: schema.items.length,
            actualItems: value.length
          });
          valid = false;
        }
      } else {
        // All items must match the same schema
        for (let i = 0; i < value.length; i++) {
          const itemValue = value[i];
          const itemPath = `${context.path}[${i}]`;
          const itemContext = {
            ...context,
            path: itemPath,
            parent: value,
            key: i
          };
          
          const itemValid = this._validateValue(itemValue, schema.items, errors, itemContext);
          valid = valid && itemValid;
        }
      }
    }
    
    return valid;
  }
  
  /**
   * Default error formatter
   * @param {Object} error - Error object
   * @param {Object} context - Validation context
   * @returns {Object} Formatted error
   * @private
   */
  _defaultErrorFormatter(error, context) {
    return {
      path: error.path || '',
      type: error.type,
      message: error.message,
      ...error
    };
  }
  
  /**
   * Sanitize an object according to schema
   * @param {Object} data - Data to sanitize
   * @param {Object} schema - Schema object
   * @param {Object} options - Sanitization options
   * @param {string} [path=''] - Current property path
   * @private
   */
  _sanitizeObject(data, schema, options, path = '') {
    if (!data || typeof data !== 'object') {
      return;
    }
    
    if (Array.isArray(data)) {
      this._sanitizeArray(data, schema, options, path);
      return;
    }
    
    // Apply property sanitization
    if (schema.properties) {
      for (const propName in schema.properties) {
        const propPath = path ? `${path}.${propName}` : propName;
        const propSchema = schema.properties[propName];
        
        // Set default value if undefined
        if (options.useDefaults && data[propName] === undefined && propSchema.default !== undefined) {
          data[propName] = this._deepClone(propSchema.default);
        }
        
        // Sanitize property value
        if (data[propName] !== undefined) {
          this._sanitizeValue(data[propName], propSchema, options, propPath);
        }
      }
    }
    
    // Remove additional properties if requested
    if (options.removeAdditional && schema.additionalProperties === false && schema.properties) {
      const allowedProps = Object.keys(schema.properties);
      for (const prop in data) {
        if (!allowedProps.includes(prop)) {
          delete data[prop];
        }
      }
    }
  }
  
  /**
   * Sanitize an array according to schema
   * @param {Array} data - Array to sanitize
   * @param {Object} schema - Schema object
   * @param {Object} options - Sanitization options
   * @param {string} path - Current property path
   * @private
   */
  _sanitizeArray(data, schema, options, path) {
    if (!Array.isArray(data)) {
      return;
    }
    
    // Sanitize array items
    if (schema.items) {
      if (Array.isArray(schema.items)) {
        // Tuple validation
        for (let i = 0; i < Math.min(data.length, schema.items.length); i++) {
          const itemSchema = schema.items[i];
          const itemPath = `${path}[${i}]`;
          this._sanitizeValue(data[i], itemSchema, options, itemPath);
        }
        
        // Additional items
        if (typeof schema.additionalItems === 'object' && schema.items.length < data.length) {
          for (let i = schema.items.length; i < data.length; i++) {
            const itemPath = `${path}[${i}]`;
            this._sanitizeValue(data[i], schema.additionalItems, options, itemPath);
          }
        }
      } else {
        // All items must match the same schema
        for (let i = 0; i < data.length; i++) {
          const itemPath = `${path}[${i}]`;
          this._sanitizeValue(data[i], schema.items, options, itemPath);
        }
      }
    }
  }
  
  /**
   * Sanitize a value according to schema
   * @param {*} value - Value to sanitize
   * @param {Object} schema - Schema object
   * @param {Object} options - Sanitization options
   * @param {string} path - Current property path
   * @private
   */
  _sanitizeValue(value, schema, options, path) {
    if (value === undefined || value === null) {
      return;
    }
    
    const valueType = Array.isArray(value) ? 'array' : typeof value;
    
    // Type coercion
    if (options.coerceTypes && schema.type) {
      const types = Array.isArray(schema.type) ? schema.type : [schema.type];
      if (!types.includes(valueType)) {
        const coercedValue = this._coerceType(value, types[0], schema);
        if (coercedValue !== undefined) {
          value = coercedValue;
        }
      }
    }
    
    // Sanitize by type
    if (typeof value === 'string') {
      this._sanitizeString(value, schema, options);
    } else if (typeof value === 'object' && !Array.isArray(value)) {
      this._sanitizeObject(value, schema, options, path);
    } else if (Array.isArray(value)) {
      this._sanitizeArray(value, schema, options, path);
    }
  }
  
  /**
   * Sanitize a string
   * @param {string} value - String to sanitize
   * @param {Object} schema - Schema object
   * @param {Object} options - Sanitization options
   * @returns {string} Sanitized string
   * @private
   */
  _sanitizeString(value, schema, options) {
    if (typeof value !== 'string') {
      return value;
    }
    
    let result = value;
    
    // Trim string
    if (options.trim) {
      result = result.trim();
    }
    
    // Strip HTML
    if (options.stripHtml) {
      result = result.replace(/<[^>]*>/g, '');
    }
    
    return result;
  }
  
  /**
   * Deep clone an object
   * @param {*} value - Value to clone
   * @returns {*} Cloned value
   * @private
   */
  _deepClone(value) {
    if (value === null || value === undefined || typeof value !== 'object') {
      return value;
    }
    
    if (Array.isArray(value)) {
      return value.map(item => this._deepClone(item));
    }
    
    if (value instanceof Date) {
      return new Date(value);
    }
    
    const result = {};
    for (const key in value) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        result[key] = this._deepClone(value[key]);
      }
    }
    
    return result;
  }
  
  /**
   * Generate sample data from a schema
   * @param {Object} schema - Schema object
   * @param {Object} options - Generation options
   * @returns {*} Generated sample data
   * @private
   */
  _generateFromSchema(schema, options) {
    // Use example if available and requested
    if (options.useExamples && schema.example !== undefined) {
      return this._deepClone(schema.example);
    }
    
    // Use default if available and requested
    if (options.useDefaults && schema.default !== undefined) {
      return this._deepClone(schema.default);
    }
    
    // Generate based on schema type
    const type = schema.type || 'object';
    const types = Array.isArray(type) ? type : [type];
    
    // Use first type as main type
    const mainType = types[0];
    
    switch (mainType) {
      case 'object':
        return this._generateObjectSample(schema, options);
      case 'array':
        return this._generateArraySample(schema, options);
      case 'string':
        return this._generateStringSample(schema);
      case 'number':
      case 'integer':
        return this._generateNumberSample(schema);
      case 'boolean':
        return this._generateBooleanSample(schema);
      case 'null':
        return null;
      default:
        // Try custom type
        if (this.customTypes[mainType] && this.customTypes[mainType].sample) {
          return this.customTypes[mainType].sample(schema);
        }
        
        return null;
    }
  }
  
  /**
   * Generate a sample object
   * @param {Object} schema - Schema object
   * @param {Object} options - Generation options
   * @returns {Object} Generated object
   * @private
   */
  _generateObjectSample(schema, options) {
    const result = {};
    
    if (!schema.properties) {
      return result;
    }
    
    // Generate property values
    for (const propName in schema.properties) {
      const propSchema = schema.properties[propName];
      
      // Skip non-required fields if requiredOnly option is set
      if (options.requiredOnly &&
          (!schema.required || !schema.required.includes(propName))) {
        continue;
      }
      
      result[propName] = this._generateFromSchema(propSchema, options);
    }
    
    return result;
  }
  
  /**
   * Generate a sample array
   * @param {Object} schema - Schema object
   * @param {Object} options - Generation options
   * @returns {Array} Generated array
   * @private
   */
  _generateArraySample(schema, options) {
    const result = [];
    
    if (!schema.items) {
      return result;
    }
    
    // Calculate number of items
    const minItems = schema.minItems || 0;
    const maxItems = schema.maxItems || 5;
    const numItems = Math.min(minItems + 1, maxItems);
    
    if (Array.isArray(schema.items)) {
      // Tuple validation
      for (let i = 0; i < Math.min(numItems, schema.items.length); i++) {
        result.push(this._generateFromSchema(schema.items[i], options));
      }
    } else {
      // All items use the same schema
      for (let i = 0; i < numItems; i++) {
        result.push(this._generateFromSchema(schema.items, options));
      }
    }
    
    return result;
  }
  
  /**
   * Generate a sample string
   * @param {Object} schema - Schema object
   * @returns {string} Generated string
   * @private
   */
  _generateStringSample(schema) {
    // Generate based on format
    if (schema.format) {
      if (this.customFormats[schema.format] && this.customFormats[schema.format].sample) {
        return this.customFormats[schema.format].sample();
      }
      
      switch (schema.format) {
        case 'email':
          return 'user@example.com';
        case 'uri':
          return 'https://example.com';
        case 'date':
          return new Date().toISOString().split('T')[0];
        case 'date-time':
          return new Date().toISOString();
        case 'time':
          return new Date().toISOString().split('T')[1].split('.')[0];
        case 'uuid':
          return '00000000-0000-0000-0000-000000000000';
        case 'hostname':
          return 'example.com';
        case 'ipv4':
          return '192.0.2.1';
        case 'ipv6':
          return '2001:0db8:85a3:0000:0000:8a2e:0370:7334';
      }
    }
    
    // Generate based on enum
    if (schema.enum && schema.enum.length > 0) {
      return schema.enum[0];
    }
    
    // Generate based on pattern
    if (schema.pattern) {
      return `Pattern: ${schema.pattern}`;
    }
    
    // Default sample string
    const minLength = schema.minLength || 0;
    const maxLength = schema.maxLength || 10;
    const length = Math.min(minLength + 5, maxLength);
    
    return 'Sample'.padEnd(length, ' ').substring(0, length);
  }
  
  /**
   * Generate a sample number
   * @param {Object} schema - Schema object
   * @returns {number} Generated number
   * @private
   */
  _generateNumberSample(schema) {
    // Generate based on enum
    if (schema.enum && schema.enum.length > 0) {
      return schema.enum[0];
    }
    
    const minimum = schema.minimum !== undefined ? schema.minimum : 0;
    const maximum = schema.maximum !== undefined ? schema.maximum : 100;
    
    if (schema.type === 'integer') {
      return minimum;
    }
    
    return minimum;
  }
  
  /**
   * Generate a sample boolean
   * @param {Object} schema - Schema object
   * @returns {boolean} Generated boolean
   * @private
   */
  _generateBooleanSample(schema) {
    return false;
  }
  
  /**
   * Generate documentation data for a schema
   * @param {Object} schema - Schema object
   * @param {string} name - Schema name
   * @param {string} [path=''] - Current property path
   * @returns {Object} Documentation data
   * @private
   */
  _generateSchemaDocs(schema, name, path = '') {
    const docs = {
      name,
      path,
      description: schema.description || '',
      type: schema.type || 'object',
      required: !!schema.required,
      default: schema.default,
      example: schema.example,
      properties: []
    };
    
    // Add additional info based on type
    if (schema.type === 'string' || (Array.isArray(schema.type) && schema.type.includes('string'))) {
      docs.format = schema.format;
      docs.minLength = schema.minLength;
      docs.maxLength = schema.maxLength;
      docs.pattern = schema.pattern;
      docs.enum = schema.enum;
    } else if (schema.type === 'number' || schema.type === 'integer' || 
               (Array.isArray(schema.type) && (schema.type.includes('number') || schema.type.includes('integer')))) {
      docs.minimum = schema.minimum;
      docs.maximum = schema.maximum;
      docs.exclusiveMinimum = schema.exclusiveMinimum;
      docs.exclusiveMaximum = schema.exclusiveMaximum;
      docs.multipleOf = schema.multipleOf;
      docs.enum = schema.enum;
    } else if (schema.type === 'array' || (Array.isArray(schema.type) && schema.type.includes('array'))) {
      docs.minItems = schema.minItems;
      docs.maxItems = schema.maxItems;
      docs.uniqueItems = schema.uniqueItems;
      
      // Document array items
      if (schema.items) {
        if (Array.isArray(schema.items)) {
          // Tuple validation
          docs.items = schema.items.map((item, i) => 
            this._generateSchemaDocs(item, `${name}[${i}]`, `${path}[${i}]`)
          );
        } else {
          // All items use the same schema
          docs.items = this._generateSchemaDocs(schema.items, `${name}[]`, `${path}[]`);
        }
      }
    } else if (schema.type === 'object' || !schema.type || 
               (Array.isArray(schema.type) && schema.type.includes('object'))) {
      docs.minProperties = schema.minProperties;
      docs.maxProperties = schema.maxProperties;
      docs.additionalProperties = schema.additionalProperties;
      
      // Document properties
      if (schema.properties) {
        for (const propName in schema.properties) {
          const propSchema = schema.properties[propName];
          const propPath = path ? `${path}.${propName}` : propName;
          const propDocs = this._generateSchemaDocs(propSchema, propName, propPath);
          
          // Mark required properties
          if (schema.required && schema.required.includes(propName)) {
            propDocs.required = true;
          }
          
          docs.properties.push(propDocs);
        }
      }
    }
    
    return docs;
  }
  
  /**
   * Format documentation as Markdown
   * @param {Object} docData - Documentation data
   * @param {Object} options - Documentation options
   * @returns {string} Markdown documentation
   * @private
   */
  _formatDocsMarkdown(docData, options) {
    let markdown = `# ${docData.name}\n\n`;
    
    if (docData.description) {
      markdown += `${docData.description}\n\n`;
    }
    
    markdown += `**Type:** ${Array.isArray(docData.type) ? docData.type.join(', ') : docData.type}\n\n`;
    
    // Add type-specific information
    if (docData.type === 'string' || (Array.isArray(docData.type) && docData.type.includes('string'))) {
      if (docData.format) markdown += `**Format:** ${docData.format}\n\n`;
      if (docData.minLength !== undefined) markdown += `**Minimum Length:** ${docData.minLength}\n\n`;
      if (docData.maxLength !== undefined) markdown += `**Maximum Length:** ${docData.maxLength}\n\n`;
      if (docData.pattern) markdown += `**Pattern:** \`${docData.pattern}\`\n\n`;
      if (docData.enum) markdown += `**Allowed Values:** ${docData.enum.map(v => `\`${v}\``).join(', ')}\n\n`;
    } else if (docData.type === 'number' || docData.type === 'integer' || 
               (Array.isArray(docData.type) && (docData.type.includes('number') || docData.type.includes('integer')))) {
      if (docData.minimum !== undefined) markdown += `**Minimum:** ${docData.minimum}${docData.exclusiveMinimum ? ' (exclusive)' : ''}\n\n`;
      if (docData.maximum !== undefined) markdown += `**Maximum:** ${docData.maximum}${docData.exclusiveMaximum ? ' (exclusive)' : ''}\n\n`;
      if (docData.multipleOf !== undefined) markdown += `**Multiple Of:** ${docData.multipleOf}\n\n`;
      if (docData.enum) markdown += `**Allowed Values:** ${docData.enum.map(v => `\`${v}\``).join(', ')}\n\n`;
    } else if (docData.type === 'array' || (Array.isArray(docData.type) && docData.type.includes('array'))) {
      if (docData.minItems !== undefined) markdown += `**Minimum Items:** ${docData.minItems}\n\n`;
      if (docData.maxItems !== undefined) markdown += `**Maximum Items:** ${docData.maxItems}\n\n`;
      if (docData.uniqueItems) markdown += `**Unique Items:** Required\n\n`;
      
      // Document array items
      if (docData.items) {
        if (Array.isArray(docData.items)) {
          markdown += `## Array Items (Tuple)\n\n`;
          docData.items.forEach((item, i) => {
            markdown += `### Item ${i + 1}\n\n`;
            markdown += this._formatDocsMarkdown(item, options).split('\n').slice(1).join('\n');
            markdown += '\n\n';
          });
        } else {
          markdown += `## Array Items\n\n`;
          markdown += this._formatDocsMarkdown(docData.items, options).split('\n').slice(1).join('\n');
          markdown += '\n\n';
        }
      }
    } else if (docData.type === 'object' || !docData.type || 
               (Array.isArray(docData.type) && docData.type.includes('object'))) {
      if (docData.minProperties !== undefined) markdown += `**Minimum Properties:** ${docData.minProperties}\n\n`;
      if (docData.maxProperties !== undefined) markdown += `**Maximum Properties:** ${docData.maxProperties}\n\n`;
      if (docData.additionalProperties === false) markdown += `**Additional Properties:** Not allowed\n\n`;
      else if (typeof docData.additionalProperties === 'object') markdown += `**Additional Properties:** Must conform to schema\n\n`;
      
      // Document properties
      if (docData.properties && docData.properties.length > 0) {
        markdown += `## Properties\n\n`;
        
        docData.properties.forEach(prop => {
          markdown += `### ${prop.name}${prop.required ? ' (Required)' : ''}\n\n`;
          
          if (prop.description) {
            markdown += `${prop.description}\n\n`;
          }
          
          markdown += `**Type:** ${Array.isArray(prop.type) ? prop.type.join(', ') : prop.type}\n\n`;
          
          if (prop.default !== undefined) {
            markdown += `**Default:** \`${JSON.stringify(prop.default)}\`\n\n`;
          }
          
          // Add type-specific information for property
          if (prop.type === 'string' || (Array.isArray(prop.type) && prop.type.includes('string'))) {
            if (prop.format) markdown += `**Format:** ${prop.format}\n\n`;
            if (prop.minLength !== undefined) markdown += `**Minimum Length:** ${prop.minLength}\n\n`;
            if (prop.maxLength !== undefined) markdown += `**Maximum Length:** ${prop.maxLength}\n\n`;
            if (prop.pattern) markdown += `**Pattern:** \`${prop.pattern}\`\n\n`;
            if (prop.enum) markdown += `**Allowed Values:** ${prop.enum.map(v => `\`${v}\``).join(', ')}\n\n`;
          } else if (prop.type === 'number' || prop.type === 'integer' || 
                     (Array.isArray(prop.type) && (prop.type.includes('number') || prop.type.includes('integer')))) {
            if (prop.minimum !== undefined) markdown += `**Minimum:** ${prop.minimum}${prop.exclusiveMinimum ? ' (exclusive)' : ''}\n\n`;
            if (prop.maximum !== undefined) markdown += `**Maximum:** ${prop.maximum}${prop.exclusiveMaximum ? ' (exclusive)' : ''}\n\n`;
            if (prop.multipleOf !== undefined) markdown += `**Multiple Of:** ${prop.multipleOf}\n\n`;
            if (prop.enum) markdown += `**Allowed Values:** ${prop.enum.map(v => `\`${v}\``).join(', ')}\n\n`;
          }
          
          // For object and array types, recursively document their structure
          if (prop.type === 'object' || (Array.isArray(prop.type) && prop.type.includes('object'))) {
            if (prop.properties && prop.properties.length > 0) {
              markdown += `#### Sub-properties\n\n`;
              prop.properties.forEach(subProp => {
                markdown += `- **${subProp.name}${subProp.required ? ' (Required)' : ''}**: ${Array.isArray(subProp.type) ? subProp.type.join(', ') : subProp.type}`;
                if (subProp.description) {
                  markdown += ` - ${subProp.description}`;
                }
                markdown += `\n`;
              });
              markdown += `\n`;
            }
          } else if (prop.type === 'array' || (Array.isArray(prop.type) && prop.type.includes('array'))) {
            if (prop.items) {
              if (Array.isArray(prop.items)) {
                markdown += `**Items:** Tuple of different types\n\n`;
              } else {
                markdown += `**Items Type:** ${Array.isArray(prop.items.type) ? prop.items.type.join(', ') : prop.items.type}\n\n`;
              }
            }
          }
        });
      }
    }
    
    // Add examples if available
    if (options.includeExamples && docData.example !== undefined) {
      markdown += `## Example\n\n\`\`\`json\n${JSON.stringify(docData.example, null, 2)}\n\`\`\`\n\n`;
    }
    
    return markdown;
  }
  
  /**
   * Format documentation as HTML
   * @param {Object} docData - Documentation data
   * @param {Object} options - Documentation options
   * @returns {string} HTML documentation
   * @private
   */
  _formatDocsHtml(docData, options) {
    const md = this._formatDocsMarkdown(docData, options);
    
    // Simple MD to HTML conversion (for a real implementation, use a proper MD library)
    let html = `<!DOCTYPE html>
<html>
<head>
  <title>${docData.name} Schema Documentation</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; color: #333; }
    h1 { border-bottom: 1px solid #eee; padding-bottom: 10px; }
    h2 { margin-top: 30px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
    h3 { margin-top: 25px; }
    code, pre { background: #f5f5f5; padding: 2px 5px; border-radius: 3px; font-family: monospace; }
    pre { padding: 15px; overflow-x: auto; }
    .property { margin-bottom: 30px; padding: 10px; border-left: 3px solid #2196F3; background: #f9f9f9; }
    .required { color: #d9534f; font-weight: bold; }
    .description { margin-bottom: 10px; }
    .type { font-weight: bold; margin-bottom: 10px; }
    .constraints { margin-bottom: 10px; }
    .example { background: #e8f5e9; padding: 15px; border-radius: 5px; margin-top: 20px; }
  </style>
</head>
<body>`;
    
    // Convert markdown to simple HTML 
    // This is a very basic conversion - a proper MD to HTML converter would be better
    html += md
      .replace(/^# (.*)/gm, '<h1>$1</h1>')
      .replace(/^## (.*)/gm, '<h2>$1</h2>')
      .replace(/^### (.*)/gm, '<h3>$1</h3>')
      .replace(/^#### (.*)/gm, '<h4>$1</h4>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/```json\n([\s\S]*?)```/g, '<pre><code class="json">$1</code></pre>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/- (.*)/g, '<li>$1</li>');
    
    html += `</body></html>`;
    
    return html;
  }
  
  /**
   * Default custom type definitions
   * @returns {Object} Default custom types
   * @private
   */
  _defaultCustomTypes() {
    return {
      // Example custom type for email
      'email': {
        check: (value) => {
          return typeof value === 'string' && 
                 /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value);
        },
        sample: () => 'user@example.com'
      },
      // Example custom type for URL
      'url': {
        check: (value) => {
          return typeof value === 'string' && 
                 /^https?:\/\/[^\s/$.?#].[^\s]*$/.test(value);
        },
        sample: () => 'https://example.com'
      }
    };
  }
  
  /**
   * Default custom format definitions
   * @returns {Object} Default custom formats
   * @private
   */
  _defaultCustomFormats() {
    return {
      'email': {
        validate: (value) => {
          return typeof value === 'string' && 
                 /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value);
        },
        error: 'String must be a valid email address',
        sample: () => 'user@example.com'
      },
      'uri': {
        validate: (value) => {
          return typeof value === 'string' && 
                 /^https?:\/\/[^\s/$.?#].[^\s]*$/.test(value);
        },
        error: 'String must be a valid URI',
        sample: () => 'https://example.com'
      },
      'date': {
        validate: (value) => {
          return typeof value === 'string' && 
                 /^\d{4}-\d{2}-\d{2}$/.test(value);
        },
        error: 'String must be a valid date in format YYYY-MM-DD',
        sample: () => new Date().toISOString().split('T')[0]
      },
      'date-time': {
        validate: (value) => {
          return typeof value === 'string' && 
                 /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/.test(value);
        },
        error: 'String must be a valid date-time in ISO 8601 format',
        sample: () => new Date().toISOString()
      },
      'uuid': {
        validate: (value) => {
          return typeof value === 'string' && 
                 /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
        },
        error: 'String must be a valid UUID',
        sample: () => '00000000-0000-0000-0000-000000000000'
      },
      'hostname': {
        validate: (value) => {
          return typeof value === 'string' && 
                 /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(value);
        },
        error: 'String must be a valid hostname',
        sample: () => 'example.com'
      },
      'ipv4': {
        validate: (value) => {
          return typeof value === 'string' && 
                 /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(value);
        },
        error: 'String must be a valid IPv4 address',
        sample: () => '192.0.2.1'
      },
      'ipv6': {
        validate: (value) => {
          // Simple IPv6 validation - in production use a more robust solution
          return typeof value === 'string' && 
                 /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/.test(value);
        },
        error: 'String must be a valid IPv6 address',
        sample: () => '2001:0db8:85a3:0000:0000:8a2e:0370:7334'
      }
    };
  }
}

module.exports = SchemaValidator;