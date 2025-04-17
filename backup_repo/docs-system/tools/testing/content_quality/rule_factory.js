/**
 * Rule Factory for Content Quality Validation
 * 
 * This module provides a factory for creating content quality rules
 * with appropriate configurations for different document types.
 */

const readabilityRules = require('./rules/readability_rules');
const completenessRules = require('./rules/completeness_rules');
const consistencyRules = require('./rules/consistency_rules');

/**
 * Rule Factory for content quality validation
 */
class RuleFactory {
  /**
   * Creates a new RuleFactory instance
   * @param {Object} options - Configuration options
   * @param {Object} options.glossary - Terminology glossary for consistency checks
   * @param {Function} options.logger - Logging function for rule results
   */
  constructor(options = {}) {
    this.glossary = options.glossary || {};
    this.logger = options.logger || console;
    this.rules = this.createDefaultRules();
  }

  /**
   * Creates default content quality rules for different document types
   * @returns {Object} Default rules by category and document type
   */
  createDefaultRules() {
    // Combine all rule sets
    const allRules = {
      ...readabilityRules,
      ...completenessRules,
      ...consistencyRules
    };
    
    // Organize rules by document type
    const rulesByType = {
      // Generic rules applicable to all document types
      generic: { ...allRules },
      
      // Technical documentation
      technical: {},
      
      // API documentation
      api: {},
      
      // Integration documentation
      integration: {},
      
      // User guides
      guide: {}
    };
    
    return rulesByType;
  }

  /**
   * Gets all rules for a document type
   * @param {string} documentType - The document type
   * @returns {Object} Rules for the document type
   */
  getRules(documentType) {
    // Get type-specific rules
    const typeRules = this.rules[documentType] || {};
    
    // Get generic rules
    const genericRules = this.rules.generic || {};
    
    // Combine rules
    return {
      ...genericRules,
      ...typeRules
    };
  }

  /**
   * Gets rules by category for a document type
   * @param {string} documentType - The document type
   * @param {string} category - The rule category
   * @returns {Object} Rules in the category for the document type
   */
  getRulesByCategory(documentType, category) {
    const allRules = this.getRules(documentType);
    
    // Filter rules by category
    const categoryRules = {};
    
    for (const [ruleId, rule] of Object.entries(allRules)) {
      if (rule.category === category) {
        categoryRules[ruleId] = rule;
      }
    }
    
    return categoryRules;
  }

  /**
   * Registers a new rule
   * @param {string} ruleId - The rule ID
   * @param {Object} rule - The rule to register
   * @param {string} documentType - The document type (omit for generic rule)
   */
  registerRule(ruleId, rule, documentType = 'generic') {
    // Ensure the document type exists
    if (!this.rules[documentType]) {
      this.rules[documentType] = {};
    }
    
    // Register the rule
    this.rules[documentType][ruleId] = rule;
  }

  /**
   * Removes a rule
   * @param {string} ruleId - The rule ID to remove
   * @param {string} documentType - The document type (omit for generic rule)
   * @returns {boolean} Whether the rule was removed
   */
  removeRule(ruleId, documentType = 'generic') {
    // Ensure the document type exists
    if (!this.rules[documentType]) {
      return false;
    }
    
    // Check if rule exists
    if (!this.rules[documentType][ruleId]) {
      return false;
    }
    
    // Remove the rule
    delete this.rules[documentType][ruleId];
    return true;
  }

  /**
   * Gets rule categories
   * @returns {Array} Array of unique rule categories
   */
  getRuleCategories() {
    const categories = new Set();
    
    // Iterate through all document types and rules
    for (const typeRules of Object.values(this.rules)) {
      for (const rule of Object.values(typeRules)) {
        if (rule.category) {
          categories.add(rule.category);
        }
      }
    }
    
    return Array.from(categories);
  }

  /**
   * Sets the glossary for terminology consistency checks
   * @param {Object} glossary - The terminology glossary
   */
  setGlossary(glossary) {
    this.glossary = glossary || {};
  }

  /**
   * Adds terms to the glossary
   * @param {Object} terms - Terms to add to the glossary
   */
  addGlossaryTerms(terms) {
    this.glossary = {
      ...this.glossary,
      ...terms
    };
  }

  /**
   * Gets the glossary
   * @returns {Object} The terminology glossary
   */
  getGlossary() {
    return this.glossary;
  }
}

module.exports = RuleFactory;