/**
 * Completeness Rules for Content Quality Validation
 * 
 * This module provides rules for assessing content completeness, including
 * checks for required sections, examples, details, and cross-references.
 */

/**
 * Completeness rules for content quality validation
 */
const completenessRules = {
  // Check for required sections in technical documentation
  requiredSections: {
    name: 'Required Sections Check',
    category: 'completeness',
    description: 'Verifies that required sections are present in the document.',
    validate: (content, options = {}) => {
      const issues = [];
      const { documentType } = options;
      
      // Define required sections based on document type
      const requiredSectionsByType = {
        // Technical documentation
        technical: [
          'Introduction',
          'Getting Started',
          'Installation',
          'Usage',
          'API Reference',
          'Examples'
        ],
        
        // API documentation
        api: [
          'Introduction',
          'Authentication',
          'Endpoints',
          'Parameters',
          'Responses',
          'Errors',
          'Examples'
        ],
        
        // Integration documentation
        integration: [
          'Introduction',
          'Prerequisites',
          'Configuration',
          'Integration Steps',
          'Testing',
          'Troubleshooting'
        ],
        
        // User guides
        guide: [
          'Introduction',
          'Prerequisites',
          'Steps',
          'Conclusion'
        ],
        
        // Default (generic documentation)
        default: [
          'Introduction',
          'Content',
          'Conclusion'
        ]
      };
      
      // Get required sections for this document type
      const requiredSections = requiredSectionsByType[documentType] || requiredSectionsByType.default;
      
      // Get actual section titles
      const sectionTitles = content.sections.map(section => section.title);
      
      // Check for missing sections
      for (const requiredSection of requiredSections) {
        // Look for exact or similar matches
        const hasSection = sectionTitles.some(title => {
          // Exact match
          if (title.toLowerCase() === requiredSection.toLowerCase()) {
            return true;
          }
          
          // Partial match (e.g., "API Reference" vs "API")
          if (title.toLowerCase().includes(requiredSection.toLowerCase()) ||
              requiredSection.toLowerCase().includes(title.toLowerCase())) {
            return true;
          }
          
          return false;
        });
        
        if (!hasSection) {
          issues.push({
            type: 'missing_section',
            message: `Required section "${requiredSection}" is missing.`,
            section: requiredSection,
            severity: 'warning'
          });
        }
      }
      
      return issues;
    }
  },
  
  // Check for code examples in technical documentation
  codeExamples: {
    name: 'Code Examples Check',
    category: 'completeness',
    description: 'Verifies that code examples are provided where appropriate.',
    validate: (content, options = {}) => {
      const issues = [];
      const { documentType } = options;
      
      // Only apply to relevant document types
      const relevantTypes = ['technical', 'api', 'integration'];
      if (!relevantTypes.includes(documentType)) {
        return [];
      }
      
      // Check content for code blocks
      const codeBlockPatterns = [
        /```[\w-]*\n[\s\S]*?\n```/g, // Markdown code blocks
        /<pre><code>[\s\S]*?<\/code><\/pre>/g, // HTML code blocks
        /<pre>[\s\S]*?<\/pre>/g // HTML pre blocks
      ];
      
      let hasCodeExample = false;
      for (const pattern of codeBlockPatterns) {
        if (pattern.test(content.raw)) {
          hasCodeExample = true;
          break;
        }
      }
      
      if (!hasCodeExample) {
        issues.push({
          type: 'missing_code_examples',
          message: 'No code examples found in the document. Consider adding code snippets to illustrate key concepts.',
          severity: 'warning'
        });
      }
      
      // Check API sections for code examples
      if (documentType === 'api') {
        const apiSections = content.sections.filter(section => {
          return ['endpoints', 'api', 'reference', 'usage'].some(term => 
            section.title.toLowerCase().includes(term)
          );
        });
        
        for (const section of apiSections) {
          let hasExample = false;
          for (const pattern of codeBlockPatterns) {
            if (pattern.test(section.content)) {
              hasExample = true;
              break;
            }
          }
          
          if (!hasExample) {
            issues.push({
              type: 'section_missing_code_examples',
              message: `Section "${section.title}" would benefit from code examples.`,
              section: section.title,
              severity: 'suggestion'
            });
          }
        }
      }
      
      return issues;
    }
  },
  
  // Check for detailed explanations
  explanationDetail: {
    name: 'Explanation Detail Check',
    category: 'completeness',
    description: 'Assesses whether explanations provide sufficient detail.',
    validate: (content) => {
      const issues = [];
      
      // Check section lengths
      content.sections.forEach(section => {
        const wordCount = section.content.split(/\s+/).filter(w => w.match(/\w/)).length;
        
        // Skip title/introduction sections
        if (['title', 'introduction', 'overview'].includes(section.title.toLowerCase())) {
          return;
        }
        
        // Check if section is too short
        if (wordCount < 50) {
          issues.push({
            type: 'thin_content',
            message: `Section "${section.title}" has minimal content (${wordCount} words). Consider expanding with more detail.`,
            section: section.title,
            wordCount,
            severity: wordCount < 25 ? 'warning' : 'suggestion'
          });
        }
        
        // Check if there are lists without explanations
        if ((section.content.match(/^[-*]\s+.+/gm) || []).length > 3 && wordCount < 100) {
          issues.push({
            type: 'list_without_context',
            message: `Section "${section.title}" contains lists but minimal explanatory text. Consider adding more context.`,
            section: section.title,
            severity: 'suggestion'
          });
        }
      });
      
      return issues;
    }
  },
  
  // Check for cross-references to related content
  crossReferences: {
    name: 'Cross-Reference Check',
    category: 'completeness',
    description: 'Checks for appropriate cross-references to related content.',
    validate: (content, options = {}) => {
      const issues = [];
      const { documentType } = options;
      
      // Only apply to relevant document types
      const relevantTypes = ['technical', 'api', 'integration', 'guide'];
      if (!relevantTypes.includes(documentType)) {
        return [];
      }
      
      // Check for links in the content
      const linkPatterns = [
        /\[.+?\]\(.+?\)/g, // Markdown links
        /<a\s+(?:[^>]*?\s+)?href=["'][^"']*["'][^>]*>.*?<\/a>/g // HTML links
      ];
      
      let linkCount = 0;
      for (const pattern of linkPatterns) {
        const matches = content.raw.match(pattern) || [];
        linkCount += matches.length;
      }
      
      // Check if document has no links at all
      if (linkCount === 0) {
        issues.push({
          type: 'no_cross_references',
          message: 'Document lacks cross-references to related content. Consider adding links to related resources.',
          severity: 'warning'
        });
      }
      
      // Check "See Also" or "Related" section
      const hasSeeAlsoSection = content.sections.some(section => {
        return ['see also', 'related', 'references'].some(term => 
          section.title.toLowerCase().includes(term)
        );
      });
      
      if (!hasSeeAlsoSection && content.sections.length > 3) {
        issues.push({
          type: 'missing_see_also',
          message: 'Consider adding a "See Also" or "Related" section with links to related content.',
          severity: 'suggestion'
        });
      }
      
      return issues;
    }
  },
  
  // Check for error handling documentation
  errorHandling: {
    name: 'Error Handling Documentation Check',
    category: 'completeness',
    description: 'Verifies that error handling is documented appropriately.',
    validate: (content, options = {}) => {
      const issues = [];
      const { documentType } = options;
      
      // Only apply to relevant document types
      const relevantTypes = ['technical', 'api', 'integration'];
      if (!relevantTypes.includes(documentType)) {
        return [];
      }
      
      // Check for error-related keywords in content
      const errorTerms = ['error', 'exception', 'fail', 'troubleshoot', 'debug'];
      const hasErrorContent = errorTerms.some(term => 
        content.raw.toLowerCase().includes(term)
      );
      
      if (!hasErrorContent) {
        issues.push({
          type: 'missing_error_handling',
          message: 'No error handling or troubleshooting information found. Consider adding guidance on handling common errors.',
          severity: 'warning'
        });
      }
      
      // Check for a dedicated errors or troubleshooting section
      const hasErrorSection = content.sections.some(section => {
        return ['error', 'exception', 'troubleshoot', 'debug'].some(term => 
          section.title.toLowerCase().includes(term)
        );
      });
      
      if (!hasErrorSection && documentType === 'api') {
        issues.push({
          type: 'missing_error_section',
          message: 'API documentation should include a dedicated section for error handling or troubleshooting.',
          severity: 'warning'
        });
      }
      
      return issues;
    }
  },
  
  // Check for image inclusion in user guides
  missingImages: {
    name: 'Image Inclusion Check',
    category: 'completeness',
    description: 'Checks if user guides include helpful images or diagrams.',
    validate: (content, options = {}) => {
      const issues = [];
      const { documentType } = options;
      
      // Only apply to relevant document types
      if (documentType !== 'guide') {
        return [];
      }
      
      // Check for images in content
      const imagePatterns = [
        /!\[.+?\]\(.+?\)/g, // Markdown images
        /<img\s+(?:[^>]*?\s+)?src=["'][^"']*["'][^>]*>/g // HTML images
      ];
      
      let imageCount = 0;
      for (const pattern of imagePatterns) {
        const matches = content.raw.match(pattern) || [];
        imageCount += matches.length;
      }
      
      if (imageCount === 0) {
        issues.push({
          type: 'missing_images',
          message: 'User guide contains no images. Consider adding screenshots or diagrams to enhance clarity.',
          severity: 'warning'
        });
      }
      
      return issues;
    }
  }
};

module.exports = completenessRules;