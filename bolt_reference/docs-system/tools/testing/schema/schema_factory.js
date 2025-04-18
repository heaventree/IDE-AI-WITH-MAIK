/**
 * Schema Factory for Documentation System
 * 
 * This module provides a factory for creating schema validators with
 * appropriate schema definitions for different document types.
 */

const SchemaValidator = require('./schema_validator');

/**
 * Schema Factory
 */
class SchemaFactory {
  /**
   * Creates a new SchemaFactory instance
   * @param {Object} options - Configuration options
   * @param {Function} options.logger - Logging function for validation results
   */
  constructor(options = {}) {
    this.logger = options.logger || console;
    this.schemas = this.createDefaultSchemas();
  }

  /**
   * Creates default schema definitions
   * @returns {Object} Default schemas
   */
  createDefaultSchemas() {
    return {
      // Technical documentation schema
      technical: {
        type: 'object',
        required: ['id', 'title', 'content'],
        properties: {
          id: {
            type: 'string',
            minLength: 1
          },
          title: {
            type: 'string',
            minLength: 1
          },
          description: {
            type: 'string'
          },
          content: {
            type: 'string',
            minLength: 1
          },
          tags: {
            type: 'array',
            items: {
              type: 'string'
            }
          },
          author: {
            type: 'string'
          },
          created: {
            type: 'string',
            format: 'date-time'
          },
          updated: {
            type: 'string',
            format: 'date-time'
          },
          version: {
            type: 'string'
          },
          status: {
            type: 'string',
            enum: ['draft', 'review', 'published', 'archived']
          },
          related: {
            type: 'array',
            items: {
              type: 'string'
            }
          }
        }
      },
      
      // Integration documentation schema
      integration: {
        type: 'object',
        required: ['id', 'title', 'content', 'integration_type'],
        properties: {
          id: {
            type: 'string',
            minLength: 1
          },
          title: {
            type: 'string',
            minLength: 1
          },
          description: {
            type: 'string'
          },
          content: {
            type: 'string',
            minLength: 1
          },
          integration_type: {
            type: 'string',
            minLength: 1
          },
          api_version: {
            type: 'string'
          },
          auth_method: {
            type: 'string'
          },
          endpoints: {
            type: 'array',
            items: {
              type: 'object',
              required: ['path', 'method'],
              properties: {
                path: {
                  type: 'string',
                  minLength: 1
                },
                method: {
                  type: 'string',
                  enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
                },
                description: {
                  type: 'string'
                },
                parameters: {
                  type: 'array',
                  items: {
                    type: 'object',
                    required: ['name', 'type'],
                    properties: {
                      name: {
                        type: 'string',
                        minLength: 1
                      },
                      type: {
                        type: 'string'
                      },
                      required: {
                        type: 'boolean'
                      },
                      description: {
                        type: 'string'
                      }
                    }
                  }
                },
                responses: {
                  type: 'object',
                  additionalProperties: {
                    type: 'object',
                    properties: {
                      description: {
                        type: 'string'
                      },
                      schema: {
                        type: 'object'
                      }
                    }
                  }
                }
              }
            }
          },
          tags: {
            type: 'array',
            items: {
              type: 'string'
            }
          },
          author: {
            type: 'string'
          },
          created: {
            type: 'string',
            format: 'date-time'
          },
          updated: {
            type: 'string',
            format: 'date-time'
          },
          version: {
            type: 'string'
          },
          status: {
            type: 'string',
            enum: ['draft', 'review', 'published', 'archived']
          },
          related: {
            type: 'array',
            items: {
              type: 'string'
            }
          }
        }
      },
      
      // User guide schema
      guide: {
        type: 'object',
        required: ['id', 'title', 'content'],
        properties: {
          id: {
            type: 'string',
            minLength: 1
          },
          title: {
            type: 'string',
            minLength: 1
          },
          description: {
            type: 'string'
          },
          content: {
            type: 'string',
            minLength: 1
          },
          audience: {
            type: 'string'
          },
          prerequisites: {
            type: 'array',
            items: {
              type: 'string'
            }
          },
          steps: {
            type: 'array',
            items: {
              type: 'object',
              required: ['title', 'content'],
              properties: {
                title: {
                  type: 'string',
                  minLength: 1
                },
                content: {
                  type: 'string',
                  minLength: 1
                },
                image: {
                  type: 'string'
                }
              }
            }
          },
          tags: {
            type: 'array',
            items: {
              type: 'string'
            }
          },
          author: {
            type: 'string'
          },
          created: {
            type: 'string',
            format: 'date-time'
          },
          updated: {
            type: 'string',
            format: 'date-time'
          },
          version: {
            type: 'string'
          },
          status: {
            type: 'string',
            enum: ['draft', 'review', 'published', 'archived']
          },
          related: {
            type: 'array',
            items: {
              type: 'string'
            }
          }
        }
      },
      
      // API documentation schema
      api: {
        type: 'object',
        required: ['id', 'title', 'content', 'api_version'],
        properties: {
          id: {
            type: 'string',
            minLength: 1
          },
          title: {
            type: 'string',
            minLength: 1
          },
          description: {
            type: 'string'
          },
          content: {
            type: 'string',
            minLength: 1
          },
          api_version: {
            type: 'string',
            minLength: 1
          },
          base_url: {
            type: 'string',
            format: 'uri'
          },
          auth_method: {
            type: 'string'
          },
          endpoints: {
            type: 'array',
            items: {
              type: 'object',
              required: ['path', 'method'],
              properties: {
                path: {
                  type: 'string',
                  minLength: 1
                },
                method: {
                  type: 'string',
                  enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
                },
                description: {
                  type: 'string'
                },
                parameters: {
                  type: 'array',
                  items: {
                    type: 'object',
                    required: ['name', 'type'],
                    properties: {
                      name: {
                        type: 'string',
                        minLength: 1
                      },
                      type: {
                        type: 'string'
                      },
                      required: {
                        type: 'boolean'
                      },
                      description: {
                        type: 'string'
                      }
                    }
                  }
                },
                responses: {
                  type: 'object',
                  additionalProperties: {
                    type: 'object',
                    properties: {
                      description: {
                        type: 'string'
                      },
                      schema: {
                        type: 'object'
                      }
                    }
                  }
                }
              }
            }
          },
          tags: {
            type: 'array',
            items: {
              type: 'string'
            }
          },
          author: {
            type: 'string'
          },
          created: {
            type: 'string',
            format: 'date-time'
          },
          updated: {
            type: 'string',
            format: 'date-time'
          },
          version: {
            type: 'string'
          },
          status: {
            type: 'string',
            enum: ['draft', 'review', 'published', 'archived']
          },
          related: {
            type: 'array',
            items: {
              type: 'string'
            }
          }
        }
      },
      
      // Default schema (minimal requirements)
      default: {
        type: 'object',
        required: ['id', 'title', 'content'],
        properties: {
          id: {
            type: 'string',
            minLength: 1
          },
          title: {
            type: 'string',
            minLength: 1
          },
          content: {
            type: 'string',
            minLength: 1
          }
        }
      }
    };
  }

  /**
   * Creates a schema validator with registered schemas
   * @returns {SchemaValidator} Configured schema validator
   */
  createValidator() {
    return new SchemaValidator({
      schemas: this.schemas,
      logger: this.logger
    });
  }

  /**
   * Registers a new schema
   * @param {string} documentType - The document type
   * @param {Object} schema - The schema to register
   */
  registerSchema(documentType, schema) {
    this.schemas[documentType] = schema;
  }

  /**
   * Gets a registered schema
   * @param {string} documentType - The document type
   * @returns {Object} The schema
   */
  getSchema(documentType) {
    return this.schemas[documentType];
  }

  /**
   * Lists all registered schema types
   * @returns {Array} Array of schema types
   */
  listSchemaTypes() {
    return Object.keys(this.schemas);
  }
}

module.exports = SchemaFactory;