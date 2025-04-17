/**
 * Schema Registry Module for Documentation System
 * 
 * This module provides centralized schema management and version control
 * for data schemas used throughout the system.
 */

const crypto = require('crypto');

/**
 * Schema Registry class for managing and versioning schemas
 */
class SchemaRegistry {
  /**
   * Create a new SchemaRegistry instance
   * @param {Object} [options] - Configuration options
   * @param {Function} [options.storage] - Storage provider for schemas
   * @param {Function} [options.validator] - Schema validator
   * @param {Function} [options.logger] - Logging function
   * @param {boolean} [options.validateSchemas=true] - Whether to validate schemas against meta-schema
   */
  constructor(options = {}) {
    this.storage = options.storage || new MemoryStorage();
    this.validator = options.validator;
    this.logger = options.logger || console;
    this.validateSchemas = options.validateSchemas !== false;
    
    // Initialize meta-schema for JSON Schema validation
    this.metaSchema = this._getJsonSchemaMetaSchema();
  }
  
  /**
   * Register a schema
   * @param {string} namespace - Schema namespace
   * @param {string} name - Schema name
   * @param {Object} schema - Schema definition
   * @param {Object} [options] - Registration options
   * @param {string} [options.version] - Schema version (auto-generated if not provided)
   * @param {boolean} [options.default=false] - Whether this is the default version
   * @param {Object} [options.metadata={}] - Additional schema metadata
   * @returns {Object} Registered schema
   */
  async registerSchema(namespace, name, schema, options = {}) {
    if (!namespace || !name || !schema) {
      throw new Error('Namespace, name, and schema are required');
    }
    
    // Validate the schema against meta-schema if enabled
    if (this.validateSchemas) {
      const isValid = this._validateAgainstMetaSchema(schema);
      if (!isValid) {
        throw new Error('Invalid schema: does not conform to JSON Schema specification');
      }
    }
    
    // Generate schema ID
    const schemaId = this._generateSchemaId(namespace, name);
    
    // Generate version if not provided
    const version = options.version || this._generateVersion();
    
    // Normalize schema
    const normalizedSchema = this._normalizeSchema(schema, schemaId, version);
    
    // Create schema record
    const schemaRecord = {
      id: schemaId,
      namespace,
      name,
      version,
      schema: normalizedSchema,
      fingerprint: this._generateFingerprint(schema),
      createdAt: new Date().toISOString(),
      isDefault: options.default || false,
      metadata: options.metadata || {}
    };
    
    // Check if this should be the default version
    const isFirstVersion = !(await this.hasSchema(namespace, name));
    if (isFirstVersion) {
      schemaRecord.isDefault = true;
    }
    
    // Store the schema
    const result = await this.storage.saveSchema(schemaRecord);
    
    // If marked as default, update other versions
    if (schemaRecord.isDefault && !isFirstVersion) {
      await this._updateDefaultVersion(namespace, name, version);
    }
    
    this.logger.info(`Registered schema ${namespace}.${name} (version ${version})`, {
      namespace,
      name,
      version,
      schemaId,
      isDefault: schemaRecord.isDefault
    });
    
    return result;
  }
  
  /**
   * Check if a schema exists
   * @param {string} namespace - Schema namespace
   * @param {string} name - Schema name
   * @returns {Promise<boolean>} Whether the schema exists
   */
  async hasSchema(namespace, name) {
    const schemaId = this._generateSchemaId(namespace, name);
    const schemas = await this.storage.getSchemaVersions(schemaId);
    return schemas.length > 0;
  }
  
  /**
   * Get a schema by namespace and name
   * @param {string} namespace - Schema namespace
   * @param {string} name - Schema name
   * @param {Object} [options] - Options
   * @param {string} [options.version] - Specific version to retrieve
   * @param {boolean} [options.defaultVersion=true] - Whether to get the default version
   * @param {boolean} [options.latestVersion=false] - Whether to get the latest version
   * @returns {Promise<Object|null>} Schema record or null if not found
   */
  async getSchema(namespace, name, options = {}) {
    const schemaId = this._generateSchemaId(namespace, name);
    
    // Get specific version
    if (options.version) {
      return this.storage.getSchema(schemaId, options.version);
    }
    
    // Get latest version
    if (options.latestVersion) {
      const versions = await this.storage.getSchemaVersions(schemaId);
      if (versions.length === 0) {
        return null;
      }
      
      // Sort by creation date (descending)
      versions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      return versions[0];
    }
    
    // Get default version (default behavior)
    if (options.defaultVersion !== false) {
      const versions = await this.storage.getSchemaVersions(schemaId);
      if (versions.length === 0) {
        return null;
      }
      
      const defaultVersion = versions.find(v => v.isDefault);
      return defaultVersion || versions[0]; // Fallback to first version if no default
    }
    
    return null;
  }
  
  /**
   * Get all versions of a schema
   * @param {string} namespace - Schema namespace
   * @param {string} name - Schema name
   * @returns {Promise<Array>} Array of schema versions
   */
  async getSchemaVersions(namespace, name) {
    const schemaId = this._generateSchemaId(namespace, name);
    return this.storage.getSchemaVersions(schemaId);
  }
  
  /**
   * Get all schemas in a namespace
   * @param {string} namespace - Schema namespace
   * @returns {Promise<Array>} Array of schemas
   */
  async getNamespaceSchemas(namespace) {
    return this.storage.getNamespaceSchemas(namespace);
  }
  
  /**
   * Get all registered namespaces
   * @returns {Promise<Array>} Array of namespace strings
   */
  async getNamespaces() {
    return this.storage.getNamespaces();
  }
  
  /**
   * Set the default version for a schema
   * @param {string} namespace - Schema namespace
   * @param {string} name - Schema name
   * @param {string} version - Version to set as default
   * @returns {Promise<boolean>} Whether the operation was successful
   */
  async setDefaultVersion(namespace, name, version) {
    const schemaId = this._generateSchemaId(namespace, name);
    
    // Verify version exists
    const schema = await this.storage.getSchema(schemaId, version);
    if (!schema) {
      throw new Error(`Schema version not found: ${namespace}.${name}, version ${version}`);
    }
    
    // Update default version
    await this._updateDefaultVersion(namespace, name, version);
    
    this.logger.info(`Set default version for ${namespace}.${name} to ${version}`, {
      namespace,
      name,
      version
    });
    
    return true;
  }
  
  /**
   * Delete a specific schema version
   * @param {string} namespace - Schema namespace
   * @param {string} name - Schema name
   * @param {string} version - Version to delete
   * @returns {Promise<boolean>} Whether the operation was successful
   */
  async deleteSchemaVersion(namespace, name, version) {
    const schemaId = this._generateSchemaId(namespace, name);
    
    // Verify version exists
    const schema = await this.storage.getSchema(schemaId, version);
    if (!schema) {
      return false;
    }
    
    // Check if this is the default version
    if (schema.isDefault) {
      // Get other versions
      const versions = await this.storage.getSchemaVersions(schemaId);
      if (versions.length > 1) {
        // Find another version to make default
        const otherVersions = versions.filter(v => v.version !== version);
        // Use the most recent one
        otherVersions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        await this._updateDefaultVersion(namespace, name, otherVersions[0].version);
      }
    }
    
    // Delete the version
    const result = await this.storage.deleteSchema(schemaId, version);
    
    this.logger.info(`Deleted schema version ${namespace}.${name}, version ${version}`, {
      namespace,
      name,
      version
    });
    
    return result;
  }
  
  /**
   * Delete all versions of a schema
   * @param {string} namespace - Schema namespace
   * @param {string} name - Schema name
   * @returns {Promise<boolean>} Whether the operation was successful
   */
  async deleteSchema(namespace, name) {
    const schemaId = this._generateSchemaId(namespace, name);
    const result = await this.storage.deleteAllSchemaVersions(schemaId);
    
    this.logger.info(`Deleted all versions of schema ${namespace}.${name}`, {
      namespace,
      name
    });
    
    return result;
  }
  
  /**
   * Compare two schema versions
   * @param {string} namespace - Schema namespace
   * @param {string} name - Schema name
   * @param {string} versionA - First version
   * @param {string} versionB - Second version
   * @returns {Promise<Object>} Comparison result
   */
  async compareSchemaVersions(namespace, name, versionA, versionB) {
    const schemaId = this._generateSchemaId(namespace, name);
    
    // Get both schema versions
    const schemaA = await this.storage.getSchema(schemaId, versionA);
    const schemaB = await this.storage.getSchema(schemaId, versionB);
    
    if (!schemaA || !schemaB) {
      throw new Error('One or both schema versions not found');
    }
    
    // Perform comparison
    const comparison = this._compareSchemas(schemaA.schema, schemaB.schema);
    
    return {
      schemaId,
      namespace,
      name,
      versions: {
        a: {
          version: versionA,
          createdAt: schemaA.createdAt,
          fingerprint: schemaA.fingerprint
        },
        b: {
          version: versionB,
          createdAt: schemaB.createdAt,
          fingerprint: schemaB.fingerprint
        }
      },
      compatible: comparison.compatible,
      changes: comparison.changes
    };
  }
  
  /**
   * Check if a schema is compatible with the latest version
   * @param {string} namespace - Schema namespace
   * @param {string} name - Schema name
   * @param {Object} schema - New schema to check
   * @returns {Promise<Object>} Compatibility check result
   */
  async checkCompatibility(namespace, name, schema) {
    // Get the latest version
    const latestSchema = await this.getSchema(namespace, name, { latestVersion: true });
    
    if (!latestSchema) {
      // No existing schema, so it's compatible
      return {
        compatible: true,
        changes: []
      };
    }
    
    // Perform comparison
    const comparison = this._compareSchemas(latestSchema.schema, schema);
    
    return {
      compatible: comparison.compatible,
      changes: comparison.changes,
      latestVersion: latestSchema.version
    };
  }
  
  /**
   * Validate a document against a schema
   * @param {Object} document - Document to validate
   * @param {string} namespace - Schema namespace
   * @param {string} name - Schema name
   * @param {Object} [options] - Validation options
   * @param {string} [options.version] - Specific version to use
   * @returns {Promise<Object>} Validation result
   */
  async validate(document, namespace, name, options = {}) {
    if (!this.validator) {
      throw new Error('Schema validator not configured');
    }
    
    // Get the schema
    const schema = await this.getSchema(namespace, name, options);
    
    if (!schema) {
      throw new Error(`Schema not found: ${namespace}.${name}`);
    }
    
    // Validate using the configured validator
    return this.validator.validate(document, schema.schema);
  }
  
  /**
   * Generate a unique schema ID from namespace and name
   * @param {string} namespace - Schema namespace
   * @param {string} name - Schema name
   * @returns {string} Schema ID
   * @private
   */
  _generateSchemaId(namespace, name) {
    return `${namespace}.${name}`;
  }
  
  /**
   * Generate a version string
   * @returns {string} Version string
   * @private
   */
  _generateVersion() {
    // Format: YYYYMMDD.HHMMSS.random
    const now = new Date();
    const date = now.toISOString().replace(/[-:T.Z]/g, '').substring(0, 14);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${date.substring(0, 8)}.${date.substring(8, 14)}.${random}`;
  }
  
  /**
   * Generate a fingerprint for a schema
   * @param {Object} schema - Schema object
   * @returns {string} Schema fingerprint
   * @private
   */
  _generateFingerprint(schema) {
    // Create a canonical JSON string
    const canonicalJson = JSON.stringify(this._sortObjectKeys(schema));
    
    // Generate SHA-256 hash
    return crypto
      .createHash('sha256')
      .update(canonicalJson)
      .digest('hex');
  }
  
  /**
   * Sort object keys recursively for deterministic serialization
   * @param {*} obj - Object to sort
   * @returns {*} Object with sorted keys
   * @private
   */
  _sortObjectKeys(obj) {
    if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
      return obj;
    }
    
    return Object.keys(obj)
      .sort()
      .reduce((result, key) => {
        result[key] = this._sortObjectKeys(obj[key]);
        return result;
      }, {});
  }
  
  /**
   * Normalize a schema
   * @param {Object} schema - Schema to normalize
   * @param {string} id - Schema ID
   * @param {string} version - Schema version
   * @returns {Object} Normalized schema
   * @private
   */
  _normalizeSchema(schema, id, version) {
    const normalized = { ...schema };
    
    // Add $id if not present
    if (!normalized.$id) {
      normalized.$id = `https://schemas.documentation-system.org/${id}/v/${version}`;
    }
    
    // Add $schema if not present
    if (!normalized.$schema) {
      normalized.$schema = 'http://json-schema.org/draft-07/schema#';
    }
    
    return normalized;
  }
  
  /**
   * Validate a schema against the JSON Schema meta-schema
   * @param {Object} schema - Schema to validate
   * @returns {boolean} Whether the schema is valid
   * @private
   */
  _validateAgainstMetaSchema(schema) {
    if (!this.validator) {
      // Skip validation if no validator is configured
      return true;
    }
    
    try {
      const result = this.validator.validate(schema, this.metaSchema);
      return result.valid;
    } catch (error) {
      this.logger.error('Error validating schema against meta-schema', error);
      return false;
    }
  }
  
  /**
   * Update the default version for a schema
   * @param {string} namespace - Schema namespace
   * @param {string} name - Schema name
   * @param {string} defaultVersion - Version to set as default
   * @returns {Promise<void>}
   * @private
   */
  async _updateDefaultVersion(namespace, name, defaultVersion) {
    const schemaId = this._generateSchemaId(namespace, name);
    const versions = await this.storage.getSchemaVersions(schemaId);
    
    // Update default flag for all versions
    for (const schema of versions) {
      if (schema.version === defaultVersion && !schema.isDefault) {
        // Set as default
        await this.storage.updateSchema(schemaId, schema.version, {
          isDefault: true
        });
      } else if (schema.version !== defaultVersion && schema.isDefault) {
        // Remove default flag
        await this.storage.updateSchema(schemaId, schema.version, {
          isDefault: false
        });
      }
    }
  }
  
  /**
   * Compare two schemas
   * @param {Object} schemaA - First schema
   * @param {Object} schemaB - Second schema
   * @returns {Object} Comparison result
   * @private
   */
  _compareSchemas(schemaA, schemaB) {
    // Note: In a production implementation, use a proper schema comparison library
    
    const changes = [];
    let compatible = true;
    
    // Simple property comparison
    const allProps = new Set([
      ...Object.keys(schemaA.properties || {}),
      ...Object.keys(schemaB.properties || {})
    ]);
    
    for (const prop of allProps) {
      const propA = schemaA.properties && schemaA.properties[prop];
      const propB = schemaB.properties && schemaB.properties[prop];
      
      if (!propA) {
        // Property added
        changes.push({
          type: 'add',
          path: `properties.${prop}`,
          description: `Added property '${prop}'`
        });
      } else if (!propB) {
        // Property removed
        changes.push({
          type: 'remove',
          path: `properties.${prop}`,
          description: `Removed property '${prop}'`
        });
        
        // Removing a property is a breaking change if it was required
        if (schemaA.required && schemaA.required.includes(prop)) {
          compatible = false;
        }
      } else if (JSON.stringify(propA) !== JSON.stringify(propB)) {
        // Property changed
        changes.push({
          type: 'change',
          path: `properties.${prop}`,
          description: `Changed property '${prop}'`
        });
        
        // Check if change is compatible (basic check)
        if (propA.type !== propB.type) {
          compatible = false;
        }
      }
    }
    
    // Check required properties
    if (schemaA.required && schemaB.required) {
      const requiredA = new Set(schemaA.required);
      const requiredB = new Set(schemaB.required);
      
      // New required properties
      const newRequired = [...requiredB].filter(prop => !requiredA.has(prop));
      if (newRequired.length > 0) {
        changes.push({
          type: 'change',
          path: 'required',
          description: `Added required properties: ${newRequired.join(', ')}`
        });
        
        // Adding required properties is a breaking change
        compatible = false;
      }
      
      // Removed required properties
      const removedRequired = [...requiredA].filter(prop => !requiredB.has(prop));
      if (removedRequired.length > 0) {
        changes.push({
          type: 'change',
          path: 'required',
          description: `Removed required properties: ${removedRequired.join(', ')}`
        });
      }
    } else if (schemaA.required && !schemaB.required) {
      changes.push({
        type: 'change',
        path: 'required',
        description: 'Removed all required properties'
      });
    } else if (!schemaA.required && schemaB.required) {
      changes.push({
        type: 'change',
        path: 'required',
        description: `Added required properties: ${schemaB.required.join(', ')}`
      });
      
      // Adding required properties is a breaking change
      compatible = false;
    }
    
    return {
      compatible,
      changes
    };
  }
  
  /**
   * Get the JSON Schema meta-schema
   * @returns {Object} JSON Schema meta-schema
   * @private
   */
  _getJsonSchemaMetaSchema() {
    // Simplified version of JSON Schema Draft-07 meta-schema
    return {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "$id": "http://json-schema.org/draft-07/schema#",
      "title": "Core schema meta-schema",
      "type": ["object", "boolean"],
      "properties": {
        "$id": { "type": "string", "format": "uri-reference" },
        "$schema": { "type": "string", "format": "uri" },
        "$ref": { "type": "string", "format": "uri-reference" },
        "title": { "type": "string" },
        "description": { "type": "string" },
        "default": true,
        "examples": { "type": "array", "items": true },
        "multipleOf": { "type": "number", "exclusiveMinimum": 0 },
        "maximum": { "type": "number" },
        "exclusiveMaximum": { "type": "number" },
        "minimum": { "type": "number" },
        "exclusiveMinimum": { "type": "number" },
        "maxLength": { "type": "integer", "minimum": 0 },
        "minLength": { "type": "integer", "minimum": 0, "default": 0 },
        "pattern": { "type": "string", "format": "regex" },
        "additionalItems": { "$ref": "#" },
        "items": {
          "anyOf": [
            { "$ref": "#" },
            {
              "type": "array",
              "items": { "$ref": "#" }
            }
          ],
          "default": true
        },
        "maxItems": { "type": "integer", "minimum": 0 },
        "minItems": { "type": "integer", "minimum": 0, "default": 0 },
        "uniqueItems": { "type": "boolean", "default": false },
        "contains": { "$ref": "#" },
        "maxProperties": { "type": "integer", "minimum": 0 },
        "minProperties": { "type": "integer", "minimum": 0, "default": 0 },
        "required": {
          "type": "array",
          "items": { "type": "string" },
          "uniqueItems": true,
          "default": []
        },
        "additionalProperties": { "$ref": "#" },
        "definitions": {
          "type": "object",
          "additionalProperties": { "$ref": "#" },
          "default": {}
        },
        "properties": {
          "type": "object",
          "additionalProperties": { "$ref": "#" },
          "default": {}
        },
        "patternProperties": {
          "type": "object",
          "additionalProperties": { "$ref": "#" },
          "default": {}
        },
        "dependencies": {
          "type": "object",
          "additionalProperties": {
            "anyOf": [
              { "$ref": "#" },
              {
                "type": "array",
                "items": { "type": "string" },
                "uniqueItems": true
              }
            ]
          }
        },
        "propertyNames": { "$ref": "#" },
        "const": true,
        "enum": {
          "type": "array",
          "items": true,
          "minItems": 1,
          "uniqueItems": true
        },
        "type": {
          "anyOf": [
            {
              "enum": [
                "array",
                "boolean",
                "integer",
                "null",
                "number",
                "object",
                "string"
              ]
            },
            {
              "type": "array",
              "items": {
                "enum": [
                  "array",
                  "boolean",
                  "integer",
                  "null",
                  "number",
                  "object",
                  "string"
                ]
              },
              "minItems": 1,
              "uniqueItems": true
            }
          ]
        },
        "format": { "type": "string" },
        "allOf": {
          "type": "array",
          "items": { "$ref": "#" }
        },
        "anyOf": {
          "type": "array",
          "items": { "$ref": "#" }
        },
        "oneOf": {
          "type": "array",
          "items": { "$ref": "#" }
        },
        "not": { "$ref": "#" }
      },
      "default": true
    };
  }
}

/**
 * Memory-based storage for schema registry
 */
class MemoryStorage {
  constructor() {
    this.schemas = {};
    this.namespaces = new Set();
  }
  
  /**
   * Save a schema
   * @param {Object} schema - Schema to save
   * @returns {Promise<Object>} Saved schema
   */
  async saveSchema(schema) {
    if (!this.schemas[schema.id]) {
      this.schemas[schema.id] = [];
    }
    
    // Add namespace to set
    this.namespaces.add(schema.namespace);
    
    // Check if version exists
    const existingIndex = this.schemas[schema.id].findIndex(s => s.version === schema.version);
    
    if (existingIndex >= 0) {
      // Update existing version
      this.schemas[schema.id][existingIndex] = schema;
    } else {
      // Add new version
      this.schemas[schema.id].push(schema);
    }
    
    return schema;
  }
  
  /**
   * Get a specific schema version
   * @param {string} schemaId - Schema identifier
   * @param {string} version - Schema version
   * @returns {Promise<Object|null>} Schema or null if not found
   */
  async getSchema(schemaId, version) {
    if (!this.schemas[schemaId]) {
      return null;
    }
    
    return this.schemas[schemaId].find(s => s.version === version) || null;
  }
  
  /**
   * Get all versions of a schema
   * @param {string} schemaId - Schema identifier
   * @returns {Promise<Array>} Schema versions
   */
  async getSchemaVersions(schemaId) {
    return this.schemas[schemaId] || [];
  }
  
  /**
   * Get all schemas in a namespace
   * @param {string} namespace - Namespace
   * @returns {Promise<Array>} Schemas in namespace
   */
  async getNamespaceSchemas(namespace) {
    const results = [];
    
    for (const schemaId in this.schemas) {
      for (const schema of this.schemas[schemaId]) {
        if (schema.namespace === namespace) {
          // Add only default or latest version of each schema
          const isIncluded = results.some(s => s.id === schema.id);
          if (!isIncluded) {
            // Find default version
            const defaultVersion = this.schemas[schemaId].find(s => s.isDefault);
            results.push(defaultVersion || schema);
          }
        }
      }
    }
    
    return results;
  }
  
  /**
   * Get all namespaces
   * @returns {Promise<Array>} Namespaces
   */
  async getNamespaces() {
    return [...this.namespaces];
  }
  
  /**
   * Update a schema
   * @param {string} schemaId - Schema identifier
   * @param {string} version - Schema version
   * @param {Object} updates - Schema updates
   * @returns {Promise<Object|null>} Updated schema or null if not found
   */
  async updateSchema(schemaId, version, updates) {
    if (!this.schemas[schemaId]) {
      return null;
    }
    
    const schemaIndex = this.schemas[schemaId].findIndex(s => s.version === version);
    
    if (schemaIndex < 0) {
      return null;
    }
    
    this.schemas[schemaId][schemaIndex] = {
      ...this.schemas[schemaId][schemaIndex],
      ...updates
    };
    
    return this.schemas[schemaId][schemaIndex];
  }
  
  /**
   * Delete a schema version
   * @param {string} schemaId - Schema identifier
   * @param {string} version - Schema version
   * @returns {Promise<boolean>} Whether the operation was successful
   */
  async deleteSchema(schemaId, version) {
    if (!this.schemas[schemaId]) {
      return false;
    }
    
    const initialLength = this.schemas[schemaId].length;
    this.schemas[schemaId] = this.schemas[schemaId].filter(s => s.version !== version);
    
    return initialLength > this.schemas[schemaId].length;
  }
  
  /**
   * Delete all versions of a schema
   * @param {string} schemaId - Schema identifier
   * @returns {Promise<boolean>} Whether the operation was successful
   */
  async deleteAllSchemaVersions(schemaId) {
    if (!this.schemas[schemaId]) {
      return false;
    }
    
    delete this.schemas[schemaId];
    
    // Cleanup namespaces
    this._refreshNamespaces();
    
    return true;
  }
  
  /**
   * Refresh the namespace set
   * @private
   */
  _refreshNamespaces() {
    this.namespaces.clear();
    
    for (const schemaId in this.schemas) {
      for (const schema of this.schemas[schemaId]) {
        this.namespaces.add(schema.namespace);
      }
    }
  }
}

module.exports = {
  SchemaRegistry,
  MemoryStorage
};