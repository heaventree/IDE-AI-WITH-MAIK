/**
 * Template Schemas for Documentation System
 * 
 * This file contains schema definitions for all documentation templates.
 * These schemas are used to validate documents against their expected structure.
 */

const templateSchemas = {
  /**
   * Base schema that applies to all documentation
   */
  base: {
    type: 'object',
    required: ['id', 'title', 'content', 'metadata'],
    properties: {
      id: {
        type: 'string',
        minLength: 1,
        maxLength: 100,
        pattern: '^[a-zA-Z0-9_-]+$'
      },
      title: {
        type: 'string',
        minLength: 1,
        maxLength: 200
      },
      content: {
        type: 'string',
        minLength: 1
      },
      metadata: {
        type: 'object',
        required: ['version', 'created', 'updated'],
        properties: {
          version: {
            type: 'string',
            pattern: '^\\d+\\.\\d+\\.\\d+$'
          },
          created: {
            type: 'string',
            pattern: '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}Z$'
          },
          updated: {
            type: 'string',
            pattern: '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}Z$'
          },
          authors: {
            type: 'array',
            items: {
              type: 'string'
            }
          },
          tags: {
            type: 'array',
            items: {
              type: 'string'
            }
          },
          classification: {
            type: 'string',
            enum: ['public', 'internal', 'confidential', 'restricted']
          }
        }
      }
    },
    structure: {
      requiredSections: ['Introduction'],
      validators: [
        // Ensure document starts with a level 1 heading that matches the title
        (document) => {
          const titlePattern = new RegExp(`^# ${document.title}`, 'm');
          return {
            valid: titlePattern.test(document.content),
            message: `Document should start with a level 1 heading matching its title: '# ${document.title}'`
          };
        }
      ]
    }
  },

  /**
   * Schema for Project Overview documents
   */
  projectOverview: {
    type: 'object',
    required: ['id', 'title', 'content', 'metadata'],
    properties: {
      id: {
        type: 'string',
        minLength: 1,
        maxLength: 100,
        pattern: '^[a-zA-Z0-9_-]+$'
      },
      title: {
        type: 'string',
        minLength: 1,
        maxLength: 200
      },
      content: {
        type: 'string',
        minLength: 1
      },
      metadata: {
        type: 'object',
        required: ['version', 'created', 'updated', 'project'],
        properties: {
          version: {
            type: 'string',
            pattern: '^\\d+\\.\\d+\\.\\d+$'
          },
          created: {
            type: 'string',
            pattern: '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}Z$'
          },
          updated: {
            type: 'string',
            pattern: '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}Z$'
          },
          authors: {
            type: 'array',
            items: {
              type: 'string'
            }
          },
          tags: {
            type: 'array',
            items: {
              type: 'string'
            }
          },
          classification: {
            type: 'string',
            enum: ['public', 'internal', 'confidential', 'restricted']
          },
          project: {
            type: 'object',
            required: ['name', 'description'],
            properties: {
              name: {
                type: 'string',
                minLength: 1
              },
              description: {
                type: 'string',
                minLength: 1
              },
              startDate: {
                type: 'string',
                pattern: '^\\d{4}-\\d{2}-\\d{2}$'
              },
              status: {
                type: 'string',
                enum: ['planning', 'active', 'completed', 'archived', 'on-hold']
              }
            }
          }
        }
      }
    },
    structure: {
      requiredSections: [
        'Introduction',
        'Project Goals',
        'Key Stakeholders',
        'Timeline',
        'Tech Stack',
        'Additional Resources'
      ],
      sectionOrder: [
        'Introduction',
        'Project Goals',
        'Key Stakeholders',
        'Timeline',
        'Tech Stack',
        'Architecture Overview',
        'Development Workflow',
        'Additional Resources'
      ],
      enforceSectionOrder: true
    }
  },

  /**
   * Schema for Technical Architecture documents
   */
  technicalArchitecture: {
    type: 'object',
    required: ['id', 'title', 'content', 'metadata'],
    properties: {
      id: {
        type: 'string',
        minLength: 1,
        maxLength: 100,
        pattern: '^[a-zA-Z0-9_-]+$'
      },
      title: {
        type: 'string',
        minLength: 1,
        maxLength: 200
      },
      content: {
        type: 'string',
        minLength: 1
      },
      metadata: {
        type: 'object',
        required: ['version', 'created', 'updated', 'architecture'],
        properties: {
          version: {
            type: 'string',
            pattern: '^\\d+\\.\\d+\\.\\d+$'
          },
          created: {
            type: 'string',
            pattern: '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}Z$'
          },
          updated: {
            type: 'string',
            pattern: '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}Z$'
          },
          authors: {
            type: 'array',
            items: {
              type: 'string'
            }
          },
          tags: {
            type: 'array',
            items: {
              type: 'string'
            }
          },
          classification: {
            type: 'string',
            enum: ['public', 'internal', 'confidential', 'restricted']
          },
          architecture: {
            type: 'object',
            required: ['patterns', 'components'],
            properties: {
              patterns: {
                type: 'array',
                items: {
                  type: 'string'
                }
              },
              components: {
                type: 'array',
                items: {
                  type: 'string'
                }
              },
              status: {
                type: 'string',
                enum: ['proposed', 'approved', 'implemented', 'deprecated']
              }
            }
          }
        }
      }
    },
    structure: {
      requiredSections: [
        'Introduction',
        'Architecture Overview',
        'Components',
        'Data Flow',
        'Deployment',
        'Security Considerations'
      ],
      sectionOrder: [
        'Introduction',
        'Architecture Overview',
        'Components',
        'Data Flow',
        'Interfaces',
        'Deployment',
        'Security Considerations',
        'Performance Considerations',
        'Scaling Strategy',
        'Monitoring',
        'Disaster Recovery',
        'Appendix'
      ],
      enforceSectionOrder: true,
      validators: [
        // Ensure architecture diagrams are included
        (document) => {
          const diagramPattern = /```(mermaid|diagram|plantuml)|!\[.*?\]\(.*?\)/m;
          return {
            valid: diagramPattern.test(document.content),
            message: 'Architecture document should include at least one diagram (Mermaid, PlantUML, or image)'
          };
        }
      ]
    }
  },

  /**
   * Schema for API Documentation
   */
  apiDocumentation: {
    type: 'object',
    required: ['id', 'title', 'content', 'metadata'],
    properties: {
      id: {
        type: 'string',
        minLength: 1,
        maxLength: 100,
        pattern: '^[a-zA-Z0-9_-]+$'
      },
      title: {
        type: 'string',
        minLength: 1,
        maxLength: 200
      },
      content: {
        type: 'string',
        minLength: 1
      },
      metadata: {
        type: 'object',
        required: ['version', 'created', 'updated', 'api'],
        properties: {
          version: {
            type: 'string',
            pattern: '^\\d+\\.\\d+\\.\\d+$'
          },
          created: {
            type: 'string',
            pattern: '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}Z$'
          },
          updated: {
            type: 'string',
            pattern: '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}Z$'
          },
          authors: {
            type: 'array',
            items: {
              type: 'string'
            }
          },
          tags: {
            type: 'array',
            items: {
              type: 'string'
            }
          },
          classification: {
            type: 'string',
            enum: ['public', 'internal', 'confidential', 'restricted']
          },
          api: {
            type: 'object',
            required: ['name', 'version', 'baseUrl'],
            properties: {
              name: {
                type: 'string',
                minLength: 1
              },
              version: {
                type: 'string',
                pattern: '^v\\d+(\\.\\d+)?$'
              },
              baseUrl: {
                type: 'string',
                format: 'uri'
              },
              authorization: {
                type: 'string',
                enum: ['none', 'api_key', 'oauth2', 'jwt', 'basic']
              }
            }
          }
        }
      }
    },
    structure: {
      requiredSections: [
        'Introduction',
        'Authentication',
        'Endpoints',
        'Request/Response Format',
        'Error Handling'
      ],
      sectionOrder: [
        'Introduction',
        'Authentication',
        'Base URL',
        'Endpoints',
        'Request/Response Format',
        'Error Handling',
        'Rate Limiting',
        'Webhooks',
        'Pagination',
        'Examples',
        'Appendix'
      ],
      enforceSectionOrder: true,
      validators: [
        // Ensure endpoint documentation includes method, path, and response
        (document) => {
          const endpointsSection = document.content.match(/^## Endpoints.*?(?=^## |$)/ms);
          if (!endpointsSection) return { valid: true }; // Section not found, other validation will catch this
          
          const endpointPattern = /#{3,}\s+.+\n+.*`(GET|POST|PUT|DELETE|PATCH)`.*`.*`/gm;
          return {
            valid: endpointPattern.test(endpointsSection[0]),
            message: 'Endpoint documentation should include HTTP method and path in code blocks'
          };
        }
      ]
    }
  },

  /**
   * Schema for Development Guidelines
   */
  developmentGuidelines: {
    type: 'object',
    required: ['id', 'title', 'content', 'metadata'],
    properties: {
      id: {
        type: 'string',
        minLength: 1,
        maxLength: 100,
        pattern: '^[a-zA-Z0-9_-]+$'
      },
      title: {
        type: 'string',
        minLength: 1,
        maxLength: 200
      },
      content: {
        type: 'string',
        minLength: 1
      },
      metadata: {
        type: 'object',
        required: ['version', 'created', 'updated'],
        properties: {
          version: {
            type: 'string',
            pattern: '^\\d+\\.\\d+\\.\\d+$'
          },
          created: {
            type: 'string',
            pattern: '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}Z$'
          },
          updated: {
            type: 'string',
            pattern: '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}Z$'
          },
          authors: {
            type: 'array',
            items: {
              type: 'string'
            }
          },
          tags: {
            type: 'array',
            items: {
              type: 'string'
            }
          },
          classification: {
            type: 'string',
            enum: ['public', 'internal', 'confidential', 'restricted']
          }
        }
      }
    },
    structure: {
      requiredSections: [
        'Introduction',
        'Code Style',
        'Development Workflow',
        'Testing Requirements',
        'Documentation Standards',
        'Security Guidelines'
      ],
      sectionOrder: [
        'Introduction',
        'Code Style',
        'Development Workflow',
        'Testing Requirements',
        'Documentation Standards',
        'Security Guidelines',
        'Performance Guidelines',
        'Accessibility Requirements',
        'Tools and Environment',
        'Resources'
      ],
      enforceSectionOrder: true,
      validators: [
        // Ensure code examples are included
        (document) => {
          const codeBlockPattern = /```[a-zA-Z0-9]*\n[\s\S]*?\n```/;
          return {
            valid: codeBlockPattern.test(document.content),
            message: 'Development guidelines should include code examples in code blocks'
          };
        }
      ]
    }
  },

  /**
   * Schema for Security Documentation
   */
  securityDocumentation: {
    type: 'object',
    required: ['id', 'title', 'content', 'metadata'],
    properties: {
      id: {
        type: 'string',
        minLength: 1,
        maxLength: 100,
        pattern: '^[a-zA-Z0-9_-]+$'
      },
      title: {
        type: 'string',
        minLength: 1,
        maxLength: 200
      },
      content: {
        type: 'string',
        minLength: 1
      },
      metadata: {
        type: 'object',
        required: ['version', 'created', 'updated', 'security'],
        properties: {
          version: {
            type: 'string',
            pattern: '^\\d+\\.\\d+\\.\\d+$'
          },
          created: {
            type: 'string',
            pattern: '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}Z$'
          },
          updated: {
            type: 'string',
            pattern: '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}Z$'
          },
          authors: {
            type: 'array',
            items: {
              type: 'string'
            }
          },
          tags: {
            type: 'array',
            items: {
              type: 'string'
            }
          },
          classification: {
            type: 'string',
            enum: ['public', 'internal', 'confidential', 'restricted']
          },
          security: {
            type: 'object',
            required: ['confidentiality'],
            properties: {
              confidentiality: {
                type: 'string',
                enum: ['public', 'internal', 'confidential', 'restricted']
              },
              reviewedBy: {
                type: 'array',
                items: {
                  type: 'string'
                }
              },
              lastReviewDate: {
                type: 'string',
                pattern: '^\\d{4}-\\d{2}-\\d{2}$'
              }
            }
          }
        }
      }
    },
    structure: {
      requiredSections: [
        'Introduction',
        'Threat Model',
        'Authentication and Authorization',
        'Data Protection',
        'Secure Development Practices',
        'Incident Response'
      ],
      sectionOrder: [
        'Introduction',
        'Threat Model',
        'Authentication and Authorization',
        'Data Protection',
        'Secure Development Practices',
        'Logging and Monitoring',
        'Incident Response',
        'Compliance',
        'Security Testing',
        'Appendix'
      ],
      enforceSectionOrder: true,
      validators: [
        // Ensure proper classification notice
        (document) => {
          const classification = document.metadata.security.confidentiality;
          const classificationPattern = new RegExp(`CLASSIFICATION: ${classification.toUpperCase()}`, 'i');
          return {
            valid: classificationPattern.test(document.content),
            message: `Security document should include classification notice: 'CLASSIFICATION: ${classification.toUpperCase()}'`
          };
        }
      ]
    }
  },

  /**
   * Schema for Integration Documentation
   */
  integrationDocumentation: {
    type: 'object',
    required: ['id', 'title', 'content', 'metadata'],
    properties: {
      id: {
        type: 'string',
        minLength: 1,
        maxLength: 100,
        pattern: '^[a-zA-Z0-9_-]+$'
      },
      title: {
        type: 'string',
        minLength: 1,
        maxLength: 200
      },
      content: {
        type: 'string',
        minLength: 1
      },
      metadata: {
        type: 'object',
        required: ['version', 'created', 'updated', 'integration'],
        properties: {
          version: {
            type: 'string',
            pattern: '^\\d+\\.\\d+\\.\\d+$'
          },
          created: {
            type: 'string',
            pattern: '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}Z$'
          },
          updated: {
            type: 'string',
            pattern: '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}Z$'
          },
          authors: {
            type: 'array',
            items: {
              type: 'string'
            }
          },
          tags: {
            type: 'array',
            items: {
              type: 'string'
            }
          },
          classification: {
            type: 'string',
            enum: ['public', 'internal', 'confidential', 'restricted']
          },
          integration: {
            type: 'object',
            required: ['service', 'type'],
            properties: {
              service: {
                type: 'string',
                minLength: 1
              },
              type: {
                type: 'string',
                enum: ['api', 'webhook', 'file', 'database', 'messaging', 'other']
              },
              status: {
                type: 'string',
                enum: ['planned', 'development', 'testing', 'production', 'deprecated']
              }
            }
          }
        }
      }
    },
    structure: {
      requiredSections: [
        'Introduction',
        'Prerequisites',
        'Integration Overview',
        'Configuration',
        'Data Flow',
        'Error Handling',
        'Troubleshooting'
      ],
      sectionOrder: [
        'Introduction',
        'Prerequisites',
        'Integration Overview',
        'Architecture',
        'Configuration',
        'Data Flow',
        'Authentication',
        'API Reference',
        'Error Handling',
        'Monitoring',
        'Troubleshooting',
        'Examples',
        'Appendix'
      ],
      enforceSectionOrder: true,
      validators: [
        // Ensure configuration examples are included
        (document) => {
          const configPattern = /```[a-zA-Z0-9]*\n[\s\S]*?\n```/;
          const configSection = document.content.match(/^## Configuration.*?(?=^## |$)/ms);
          
          if (!configSection) return { valid: true }; // Section not found, other validation will catch this
          
          return {
            valid: configPattern.test(configSection[0]),
            message: 'Configuration section should include configuration examples in code blocks'
          };
        }
      ]
    }
  },

  /**
   * Schema for Audit Documents
   */
  auditDocumentation: {
    type: 'object',
    required: ['id', 'title', 'content', 'metadata'],
    properties: {
      id: {
        type: 'string',
        minLength: 1,
        maxLength: 100,
        pattern: '^[a-zA-Z0-9_-]+$'
      },
      title: {
        type: 'string',
        minLength: 1,
        maxLength: 200
      },
      content: {
        type: 'string',
        minLength: 1
      },
      metadata: {
        type: 'object',
        required: ['version', 'created', 'updated', 'audit'],
        properties: {
          version: {
            type: 'string',
            pattern: '^\\d+\\.\\d+\\.\\d+$'
          },
          created: {
            type: 'string',
            pattern: '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}Z$'
          },
          updated: {
            type: 'string',
            pattern: '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}Z$'
          },
          authors: {
            type: 'array',
            items: {
              type: 'string'
            }
          },
          tags: {
            type: 'array',
            items: {
              type: 'string'
            }
          },
          classification: {
            type: 'string',
            enum: ['public', 'internal', 'confidential', 'restricted']
          },
          audit: {
            type: 'object',
            required: ['level', 'score', 'date'],
            properties: {
              level: {
                type: 'integer',
                minimum: 1,
                maximum: 3
              },
              score: {
                type: 'number',
                minimum: 0,
                maximum: 100
              },
              date: {
                type: 'string',
                pattern: '^\\d{4}-\\d{2}-\\d{2}$'
              },
              auditors: {
                type: 'array',
                items: {
                  type: 'string'
                }
              }
            }
          }
        }
      }
    },
    structure: {
      requiredSections: [
        'Executive Summary',
        'Assessment Methodology',
        'Findings',
        'Recommendations',
        'Conclusion'
      ],
      sectionOrder: [
        'Executive Summary',
        'Assessment Methodology',
        'Scoring Breakdown',
        'Findings',
        'Recommendations',
        'Conclusion',
        'Appendix'
      ],
      enforceSectionOrder: true,
      validators: [
        // Ensure scoring table is included
        (document) => {
          const tablePattern = /\|.*\|.*\|.*\|.*\|/;
          const scoringSection = document.content.match(/^## Scoring Breakdown.*?(?=^## |$)/ms);
          
          if (!scoringSection) {
            // Check if it's in the executive summary instead
            const execSummary = document.content.match(/^## Executive Summary.*?(?=^## |$)/ms);
            return {
              valid: execSummary && tablePattern.test(execSummary[0]),
              message: 'Audit document should include a scoring table in Executive Summary or Scoring Breakdown section'
            };
          }
          
          return {
            valid: tablePattern.test(scoringSection[0]),
            message: 'Scoring Breakdown section should include a scoring table'
          };
        }
      ]
    }
  }
};

module.exports = templateSchemas;