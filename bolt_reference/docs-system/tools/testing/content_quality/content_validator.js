/**
 * Content Quality Validator for Documentation System
 * 
 * This module validates documentation content quality, checking for issues like
 * readability, consistent terminology, completeness, and clarity.
 */

class ContentQualityValidator {
  /**
   * Creates a new ContentQualityValidator instance
   * @param {Object} options - Configuration options
   * @param {Object} options.rules - Content quality validation rules
   * @param {Object} options.glossary - Terminology glossary for consistency checks
   * @param {Function} options.logger - Logging function for validation results
   */
  constructor(options = {}) {
    this.rules = options.rules || {};
    this.glossary = options.glossary || {};
    this.logger = options.logger || console;
  }

  /**
   * Validates a document's content quality
   * @param {Object} document - The document to validate
   * @param {Object} options - Additional options
   * @param {string} options.documentType - The type of document (determines which rules to apply)
   * @param {Array} options.enabledRules - List of rule IDs to enable (empty means all)
   * @param {Array} options.disabledRules - List of rule IDs to disable
   * @returns {Object} Validation result with success flag and details
   */
  validateContent(document, options = {}) {
    try {
      const { documentType, enabledRules = [], disabledRules = [] } = options;
      
      // Get appropriate rules for document type
      const activeRules = this.getActiveRules(documentType, enabledRules, disabledRules);
      
      if (Object.keys(activeRules).length === 0) {
        return {
          valid: true,
          issues: [],
          message: 'No content quality rules to apply'
        };
      }
      
      // Prepare content for validation
      const content = this.prepareContent(document);
      
      // Apply each active rule
      const allIssues = [];
      
      for (const [ruleId, rule] of Object.entries(activeRules)) {
        try {
          const ruleIssues = this.applyRule(content, rule, document);
          
          // Add rule metadata to each issue
          ruleIssues.forEach(issue => {
            issue.ruleId = ruleId;
            issue.ruleName = rule.name;
            issue.ruleCategory = rule.category;
          });
          
          allIssues.push(...ruleIssues);
        } catch (ruleError) {
          this.logger.error(`Error applying rule ${ruleId}`, {
            documentId: document.id || 'unknown',
            error: ruleError.message
          });
          
          allIssues.push({
            ruleId: ruleId,
            ruleName: rule.name || ruleId,
            ruleCategory: rule.category || 'unknown',
            type: 'rule_error',
            message: `Error applying rule: ${ruleError.message}`,
            severity: 'error'
          });
        }
      }
      
      // Sort issues by severity
      allIssues.sort((a, b) => this.getSeverityWeight(b.severity) - this.getSeverityWeight(a.severity));
      
      // Calculate quality score
      const qualityScore = this.calculateQualityScore(allIssues, activeRules);
      
      // Log validation results
      this.logValidationResults(document, allIssues, qualityScore);
      
      // Determine if content passes validation (only critical issues make it invalid)
      const criticalIssues = allIssues.filter(issue => issue.severity === 'critical');
      
      return {
        valid: criticalIssues.length === 0,
        issues: allIssues,
        qualityScore,
        message: this.generateResultMessage(allIssues, qualityScore)
      };
    } catch (error) {
      this.logger.error('Content quality validation error', {
        documentId: document.id || 'unknown',
        error: error.message
      });
      
      return {
        valid: false,
        error: error.message,
        issues: [{
          type: 'validation_error',
          message: error.message,
          severity: 'error'
        }],
        qualityScore: 0
      };
    }
  }

  /**
   * Prepares document content for validation
   * @param {Object} document - The document to prepare
   * @returns {Object} Prepared content with sections
   */
  prepareContent(document) {
    const rawContent = document.content || '';
    
    // Extract sections based on headings
    const sections = this.extractSections(rawContent);
    
    return {
      raw: rawContent,
      sections,
      title: document.title || '',
      description: document.description || '',
      metadata: {
        ...document,
        content: undefined // Remove content to avoid duplication
      }
    };
  }

  /**
   * Extracts sections from content based on headings
   * @param {string} content - The raw content
   * @returns {Array} Array of section objects
   */
  extractSections(content) {
    const sections = [];
    const headingRegex = /^(#{1,6})\s+(.+?)(?:\s+#{1,6})?$/gm;
    
    let lastHeadingIndex = 0;
    let lastHeadingLevel = 0;
    let lastHeadingTitle = '';
    
    // Find all headings
    let match;
    while ((match = headingRegex.exec(content)) !== null) {
      const [fullMatch, hashes, title] = match;
      const level = hashes.length;
      const startPosition = match.index;
      
      // If we had a previous heading, add its section
      if (lastHeadingIndex > 0) {
        const sectionContent = content.substring(
          lastHeadingIndex + lastHeadingTitle.length + hashes.length + 1,
          startPosition
        ).trim();
        
        sections.push({
          title: lastHeadingTitle,
          level: lastHeadingLevel,
          content: sectionContent,
          position: {
            start: lastHeadingIndex,
            end: startPosition - 1
          }
        });
      } else if (startPosition > 0) {
        // Add content before first heading as an "intro" section
        const introContent = content.substring(0, startPosition).trim();
        
        if (introContent) {
          sections.push({
            title: 'Introduction',
            level: 0,
            content: introContent,
            position: {
              start: 0,
              end: startPosition - 1
            }
          });
        }
      }
      
      // Update for next iteration
      lastHeadingIndex = startPosition;
      lastHeadingLevel = level;
      lastHeadingTitle = title.trim();
    }
    
    // Add the last section
    if (lastHeadingIndex > 0) {
      const sectionContent = content.substring(
        lastHeadingIndex + lastHeadingTitle.length + lastHeadingLevel + 1
      ).trim();
      
      sections.push({
        title: lastHeadingTitle,
        level: lastHeadingLevel,
        content: sectionContent,
        position: {
          start: lastHeadingIndex,
          end: content.length - 1
        }
      });
    } else if (content.trim()) {
      // If no headings at all, treat entire content as one section
      sections.push({
        title: 'Content',
        level: 0,
        content: content.trim(),
        position: {
          start: 0,
          end: content.length - 1
        }
      });
    }
    
    return sections;
  }

  /**
   * Gets active rules based on document type and enabled/disabled rule lists
   * @param {string} documentType - The document type
   * @param {Array} enabledRules - List of enabled rule IDs
   * @param {Array} disabledRules - List of disabled rule IDs
   * @returns {Object} Map of active rules
   */
  getActiveRules(documentType, enabledRules, disabledRules) {
    // Get type-specific rules
    const typeRules = this.rules[documentType] || {};
    
    // Get generic rules
    const genericRules = this.rules.generic || {};
    
    // Combine rules
    const allRules = {
      ...genericRules,
      ...typeRules
    };
    
    // Filter based on enabled/disabled rules
    const filteredRules = {};
    
    for (const [ruleId, rule] of Object.entries(allRules)) {
      // Skip if explicitly disabled
      if (disabledRules.includes(ruleId)) {
        continue;
      }
      
      // Include if enabled list is empty or rule is explicitly enabled
      if (enabledRules.length === 0 || enabledRules.includes(ruleId)) {
        filteredRules[ruleId] = rule;
      }
    }
    
    return filteredRules;
  }

  /**
   * Applies a content quality rule to document content
   * @param {Object} content - The prepared content
   * @param {Object} rule - The rule to apply
   * @param {Object} document - The original document
   * @returns {Array} Array of issues found
   */
  applyRule(content, rule, document) {
    // Skip if no validate function
    if (typeof rule.validate !== 'function') {
      return [];
    }
    
    // Apply the rule
    return rule.validate(content, {
      glossary: this.glossary,
      documentType: document.type,
      documentId: document.id
    }) || [];
  }

  /**
   * Calculates a content quality score based on issues
   * @param {Array} issues - Array of content issues
   * @param {Object} rules - Map of active rules
   * @returns {number} Quality score (0-100)
   */
  calculateQualityScore(issues, rules) {
    if (Object.keys(rules).length === 0) {
      return 100; // Perfect score if no rules applied
    }
    
    // Count issues by severity
    const issueCounts = {
      critical: 0,
      error: 0,
      warning: 0,
      info: 0,
      suggestion: 0
    };
    
    issues.forEach(issue => {
      const severity = issue.severity || 'info';
      issueCounts[severity] = (issueCounts[severity] || 0) + 1;
    });
    
    // Assign weights to each severity
    const weights = {
      critical: 50,
      error: 10,
      warning: 3,
      info: 1,
      suggestion: 0.5
    };
    
    // Calculate penalty
    let penalty = 0;
    
    for (const [severity, count] of Object.entries(issueCounts)) {
      penalty += count * weights[severity];
    }
    
    // Cap at 100
    penalty = Math.min(penalty, 100);
    
    // Return score (100 - penalty)
    return Math.max(0, 100 - penalty);
  }

  /**
   * Gets a numeric weight for a severity level (for sorting)
   * @param {string} severity - The severity level
   * @returns {number} Numeric weight
   */
  getSeverityWeight(severity) {
    const weights = {
      critical: 5,
      error: 4,
      warning: 3,
      info: 2,
      suggestion: 1
    };
    
    return weights[severity] || 0;
  }

  /**
   * Logs validation results
   * @param {Object} document - The validated document
   * @param {Array} issues - The validation issues
   * @param {number} qualityScore - The content quality score
   */
  logValidationResults(document, issues, qualityScore) {
    // Count issues by severity
    const counts = issues.reduce((acc, issue) => {
      const severity = issue.severity || 'info';
      acc[severity] = (acc[severity] || 0) + 1;
      return acc;
    }, {});
    
    if (issues.length > 0) {
      this.logger.warn('Document has content quality issues', {
        documentId: document.id || 'unknown',
        issueCount: issues.length,
        qualityScore,
        severityCounts: counts,
        topIssues: issues.slice(0, 5).map(issue => ({
          ruleId: issue.ruleId,
          severity: issue.severity,
          message: issue.message
        }))
      });
    } else {
      this.logger.info('Document passes content quality validation', {
        documentId: document.id || 'unknown',
        qualityScore
      });
    }
  }

  /**
   * Generates a human-readable result message
   * @param {Array} issues - The validation issues
   * @param {number} qualityScore - The content quality score
   * @returns {string} Human-readable result message
   */
  generateResultMessage(issues, qualityScore) {
    if (issues.length === 0) {
      return `Content quality is excellent with a score of ${qualityScore}/100`;
    }
    
    // Count issues by severity
    const counts = issues.reduce((acc, issue) => {
      const severity = issue.severity || 'info';
      acc[severity] = (acc[severity] || 0) + 1;
      return acc;
    }, {});
    
    // Create counts string
    const countsStr = Object.entries(counts)
      .map(([severity, count]) => `${count} ${severity}`)
      .join(', ');
    
    return `Content quality score: ${qualityScore}/100 with ${issues.length} issues (${countsStr})`;
  }

  /**
   * Validates multiple documents
   * @param {Array} documents - Array of documents to validate
   * @param {Object} options - Additional options
   * @returns {Object} Validation results for all documents
   */
  validateMultipleDocuments(documents, options = {}) {
    const results = documents.map(document => this.validateContent(document, options));
    
    // Calculate average quality score
    const totalScore = results.reduce((sum, result) => sum + (result.qualityScore || 0), 0);
    const averageScore = results.length > 0 ? totalScore / results.length : 0;
    
    // Count documents with issues
    const documentsWithIssues = results.filter(result => !result.valid);
    
    return {
      valid: documentsWithIssues.length === 0,
      documents: results,
      validCount: results.length - documentsWithIssues.length,
      invalidCount: documentsWithIssues.length,
      averageQualityScore: averageScore,
      message: `${documentsWithIssues.length} of ${results.length} documents have content quality issues. Average quality score: ${averageScore.toFixed(1)}/100`
    };
  }
}

module.exports = ContentQualityValidator;