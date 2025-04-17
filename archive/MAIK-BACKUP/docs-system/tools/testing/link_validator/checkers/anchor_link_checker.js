/**
 * Anchor Link Checker for Documentation System
 * 
 * This module validates anchor links within documentation to ensure they
 * reference valid headings or elements with IDs.
 */

class AnchorLinkChecker {
  /**
   * Creates a new AnchorLinkChecker instance
   * @param {Object} options - Configuration options
   * @param {Function} options.logger - Logging function for validation results
   */
  constructor(options = {}) {
    this.logger = options.logger || console;
  }

  /**
   * Checks an anchor link for validity
   * @param {Object} link - The link object containing href and context
   * @param {Object} document - The source document containing the link
   * @returns {Object} Validation result
   */
  async checkLink(link, document) {
    const href = link.href.trim();
    
    try {
      // Handle empty anchors
      if (href === '#') {
        return {
          link,
          valid: true,
          message: 'Link references page top',
          type: 'self_reference'
        };
      }
      
      // Make sure it starts with a hash
      if (!href.startsWith('#')) {
        return {
          link,
          valid: false,
          message: 'Anchor link does not start with #',
          type: 'invalid_anchor_format'
        };
      }
      
      // Extract the anchor name
      const anchor = href.substring(1);
      
      // Check if the anchor is empty
      if (!anchor) {
        return {
          link,
          valid: true,
          message: 'Link references page top',
          type: 'self_reference'
        };
      }
      
      // Look for headings in the document content that would generate this anchor
      const content = document.content || '';
      
      // Common heading-to-anchor conversion: lowercase, replace spaces with hyphens, remove punctuation
      const potentialHeadings = this.findPotentialHeadings(content);
      const matchingHeadings = this.findMatchingHeadings(potentialHeadings, anchor);
      
      if (matchingHeadings.length > 0) {
        return {
          link,
          valid: true,
          message: `Link references valid heading: ${matchingHeadings[0].text}`,
          type: 'heading_reference',
          heading: matchingHeadings[0]
        };
      }
      
      // Look for explicit HTML IDs in the document
      const explicitIds = this.findExplicitIds(content);
      const matchingIds = explicitIds.filter(id => id === anchor);
      
      if (matchingIds.length > 0) {
        return {
          link,
          valid: true,
          message: `Link references valid element ID: ${matchingIds[0]}`,
          type: 'element_id_reference'
        };
      }
      
      // No matching heading or ID found
      return {
        link,
        valid: false,
        message: `Anchor target not found: ${anchor}`,
        type: 'missing_anchor',
        suggestions: this.findSimilarAnchors(anchor, [...this.headingsToAnchors(potentialHeadings), ...explicitIds])
      };
    } catch (error) {
      this.logger.error('Error checking anchor link', {
        link: href,
        documentId: document.id || 'unknown',
        error: error.message
      });
      
      return {
        link,
        valid: false,
        error: error.message,
        message: `Error checking anchor link: ${error.message}`,
        type: 'checker_error'
      };
    }
  }

  /**
   * Finds all headings in the content
   * @param {string} content - The document content
   * @returns {Array} Array of heading objects with level, text, and position
   */
  findPotentialHeadings(content) {
    const headings = [];
    const headingRegex = /^(#{1,6})\s+(.+?)(?:\s+#{1,6})?$/gm;
    
    let match;
    while ((match = headingRegex.exec(content)) !== null) {
      const [fullMatch, hashes, text] = match;
      
      headings.push({
        level: hashes.length,
        text: text.trim(),
        position: match.index,
        length: fullMatch.length
      });
    }
    
    // Also look for HTML headings
    const htmlHeadingRegex = /<h([1-6])(?:\s+[^>]*)?>(.*?)<\/h\1>/gmi;
    
    while ((match = htmlHeadingRegex.exec(content)) !== null) {
      const [fullMatch, level, text] = match;
      
      headings.push({
        level: parseInt(level),
        text: this.removeHtmlTags(text.trim()),
        position: match.index,
        length: fullMatch.length,
        html: true
      });
    }
    
    return headings;
  }

  /**
   * Removes HTML tags from text
   * @param {string} text - The text with potential HTML tags
   * @returns {string} Text without HTML tags
   */
  removeHtmlTags(text) {
    return text.replace(/<[^>]*>/g, '');
  }

  /**
   * Converts a heading text to an anchor ID
   * @param {string} text - The heading text
   * @returns {string} The anchor ID
   */
  headingToAnchor(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\- ]/g, '') // Remove punctuation
      .replace(/\s+/g, '-'); // Replace spaces with hyphens
  }

  /**
   * Converts multiple headings to anchor IDs
   * @param {Array} headings - Array of heading objects
   * @returns {Array} Array of anchor IDs
   */
  headingsToAnchors(headings) {
    return headings.map(heading => this.headingToAnchor(heading.text));
  }

  /**
   * Finds headings that match a target anchor
   * @param {Array} headings - Array of heading objects
   * @param {string} targetAnchor - The target anchor to match
   * @returns {Array} Array of matching heading objects
   */
  findMatchingHeadings(headings, targetAnchor) {
    return headings.filter(heading => {
      const headingAnchor = this.headingToAnchor(heading.text);
      return headingAnchor === targetAnchor;
    });
  }

  /**
   * Finds explicit element IDs in the content
   * @param {string} content - The document content
   * @returns {Array} Array of ID strings
   */
  findExplicitIds(content) {
    const ids = [];
    const idRegex = /id=["']([^"']+)["']/g;
    
    let match;
    while ((match = idRegex.exec(content)) !== null) {
      ids.push(match[1]);
    }
    
    return ids;
  }

  /**
   * Finds similar anchors to suggest when a link is broken
   * @param {string} anchor - The target anchor
   * @param {Array} availableAnchors - Array of available anchor IDs
   * @returns {Array} Array of similar anchor IDs
   */
  findSimilarAnchors(anchor, availableAnchors) {
    // Simple similarity measure: how many characters in common at the start
    const getSimilarity = (a, b) => {
      const minLength = Math.min(a.length, b.length);
      let commonPrefixLength = 0;
      
      for (let i = 0; i < minLength; i++) {
        if (a[i] === b[i]) {
          commonPrefixLength++;
        } else {
          break;
        }
      }
      
      return commonPrefixLength / Math.max(a.length, b.length);
    };
    
    // Find anchors with similarity above threshold
    const similarAnchors = availableAnchors
      .map(availableAnchor => ({
        anchor: availableAnchor,
        similarity: getSimilarity(anchor, availableAnchor)
      }))
      .filter(item => item.similarity > 0.5) // Threshold for similarity
      .sort((a, b) => b.similarity - a.similarity)
      .map(item => item.anchor)
      .slice(0, 3); // Limit to top 3 suggestions
    
    return similarAnchors;
  }
}

module.exports = AnchorLinkChecker;