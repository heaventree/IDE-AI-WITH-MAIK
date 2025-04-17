/**
 * Markdown Link Parser for Documentation System
 * 
 * This module extracts links from Markdown content for validation.
 */

class MarkdownLinkParser {
  /**
   * Creates a new MarkdownLinkParser instance
   * @param {Object} options - Configuration options
   * @param {boolean} options.includeImageLinks - Whether to include image links
   * @param {boolean} options.includeAutoLinks - Whether to include automatic links
   * @param {boolean} options.includeHtmlLinks - Whether to include HTML links
   */
  constructor(options = {}) {
    this.includeImageLinks = options.includeImageLinks !== undefined ? options.includeImageLinks : true;
    this.includeAutoLinks = options.includeAutoLinks !== undefined ? options.includeAutoLinks : true;
    this.includeHtmlLinks = options.includeHtmlLinks !== undefined ? options.includeHtmlLinks : true;
  }

  /**
   * Extracts links from a Markdown document
   * @param {Object} document - The document containing Markdown content
   * @returns {Array} Array of link objects with href, text, and context
   */
  extractLinks(document) {
    const content = document.content || '';
    const links = [];
    
    // Extract standard Markdown links [text](url)
    this.extractStandardLinks(content, links);
    
    // Extract reference-style links [text][reference]
    this.extractReferenceLinks(content, links);
    
    // Extract automatic links <http://example.com>
    if (this.includeAutoLinks) {
      this.extractAutoLinks(content, links);
    }
    
    // Extract HTML links <a href="url">text</a>
    if (this.includeHtmlLinks) {
      this.extractHtmlLinks(content, links);
    }
    
    // Add document metadata to each link
    links.forEach(link => {
      link.documentId = document.id || 'unknown';
      link.type = this.determineType(link.href);
    });
    
    return links;
  }

  /**
   * Extracts standard Markdown links [text](url)
   * @param {string} content - The content to extract from
   * @param {Array} links - Array to add extracted links to
   */
  extractStandardLinks(content, links) {
    // Regular expression for standard links [text](url)
    const standardLinkRegex = /!?\[([^\]]*)\]\(([^)]+)\)/g;
    
    let match;
    while ((match = standardLinkRegex.exec(content)) !== null) {
      const isImage = match[0].startsWith('!');
      
      // Skip image links if not included
      if (isImage && !this.includeImageLinks) {
        continue;
      }
      
      const text = match[1];
      let href = match[2];
      
      // Extract URL from links with title attributes
      if (href.includes(' "')) {
        href = href.substring(0, href.indexOf(' "'));
      } else if (href.includes(" '")) {
        href = href.substring(0, href.indexOf(" '"));
      }
      
      links.push({
        href: href.trim(),
        text: text,
        context: this.getContext(content, match.index),
        position: {
          start: match.index,
          end: match.index + match[0].length,
          lineNumber: this.getLineNumber(content, match.index)
        },
        isImage
      });
    }
  }

  /**
   * Extracts reference-style Markdown links [text][reference]
   * @param {string} content - The content to extract from
   * @param {Array} links - Array to add extracted links to
   */
  extractReferenceLinks(content, links) {
    // Find all reference definitions [id]: url
    const referenceDefinitions = {};
    const referenceDefRegex = /^\s*\[([^\]]+)\]:\s*(\S+)(?:\s+"([^"]+)")?\s*$/gm;
    
    let refMatch;
    while ((refMatch = referenceDefRegex.exec(content)) !== null) {
      const id = refMatch[1].toLowerCase();
      const url = refMatch[2];
      referenceDefinitions[id] = url;
    }
    
    // Find reference-style links [text][id]
    const referenceLinkRegex = /!?\[([^\]]+)\]\[([^\]]*)\]/g;
    
    let match;
    while ((match = referenceLinkRegex.exec(content)) !== null) {
      const isImage = match[0].startsWith('!');
      
      // Skip image links if not included
      if (isImage && !this.includeImageLinks) {
        continue;
      }
      
      const text = match[1];
      const id = (match[2] || text).toLowerCase(); // Empty id uses text as id
      
      // Only include links with a reference definition
      if (referenceDefinitions[id]) {
        links.push({
          href: referenceDefinitions[id],
          text: text,
          referenceId: id,
          context: this.getContext(content, match.index),
          position: {
            start: match.index,
            end: match.index + match[0].length,
            lineNumber: this.getLineNumber(content, match.index)
          },
          isImage
        });
      }
    }
    
    // Find shorthand reference-style links [text][]
    const shorthandLinkRegex = /!?\[([^\]]+)\]\[\]/g;
    
    while ((match = shorthandLinkRegex.exec(content)) !== null) {
      const isImage = match[0].startsWith('!');
      
      // Skip image links if not included
      if (isImage && !this.includeImageLinks) {
        continue;
      }
      
      const text = match[1];
      const id = text.toLowerCase();
      
      // Only include links with a reference definition
      if (referenceDefinitions[id]) {
        links.push({
          href: referenceDefinitions[id],
          text: text,
          referenceId: id,
          context: this.getContext(content, match.index),
          position: {
            start: match.index,
            end: match.index + match[0].length,
            lineNumber: this.getLineNumber(content, match.index)
          },
          isImage
        });
      }
    }
  }

  /**
   * Extracts automatic Markdown links <http://example.com>
   * @param {string} content - The content to extract from
   * @param {Array} links - Array to add extracted links to
   */
  extractAutoLinks(content, links) {
    // Regular expression for automatic links <http://example.com>
    const autoLinkRegex = /<(https?:\/\/[^>]+)>/g;
    
    let match;
    while ((match = autoLinkRegex.exec(content)) !== null) {
      const href = match[1];
      
      links.push({
        href: href,
        text: href,
        context: this.getContext(content, match.index),
        position: {
          start: match.index,
          end: match.index + match[0].length,
          lineNumber: this.getLineNumber(content, match.index)
        },
        isAuto: true
      });
    }
  }

  /**
   * Extracts HTML links <a href="url">text</a>
   * @param {string} content - The content to extract from
   * @param {Array} links - Array to add extracted links to
   */
  extractHtmlLinks(content, links) {
    // Regular expression for HTML links <a href="url">text</a>
    const htmlLinkRegex = /<a\s+(?:[^>]*?\s+)?href=["']([^"']*)["'][^>]*>(.*?)<\/a>/g;
    
    let match;
    while ((match = htmlLinkRegex.exec(content)) !== null) {
      const href = match[1];
      const text = this.removeHtmlTags(match[2]);
      
      links.push({
        href: href,
        text: text,
        context: this.getContext(content, match.index),
        position: {
          start: match.index,
          end: match.index + match[0].length,
          lineNumber: this.getLineNumber(content, match.index)
        },
        isHtml: true
      });
    }
    
    // Also look for HTML image links <img src="url" alt="text">
    if (this.includeImageLinks) {
      const htmlImageRegex = /<img\s+(?:[^>]*?\s+)?src=["']([^"']*)["'][^>]*?(?:alt=["']([^"']*)["'][^>]*?)?>/g;
      
      while ((match = htmlImageRegex.exec(content)) !== null) {
        const href = match[1];
        const text = match[2] || '';
        
        links.push({
          href: href,
          text: text,
          context: this.getContext(content, match.index),
          position: {
            start: match.index,
            end: match.index + match[0].length,
            lineNumber: this.getLineNumber(content, match.index)
          },
          isImage: true,
          isHtml: true
        });
      }
    }
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
   * Gets the line number for a position in content
   * @param {string} content - The content
   * @param {number} position - The character position
   * @returns {number} The line number (1-based)
   */
  getLineNumber(content, position) {
    const contentBeforePosition = content.substring(0, position);
    return (contentBeforePosition.match(/\n/g) || []).length + 1;
  }

  /**
   * Gets context around a position (for error reporting)
   * @param {string} content - The content
   * @param {number} position - The character position
   * @returns {string} Context snippet
   */
  getContext(content, position) {
    // Find the start of the paragraph or heading containing the position
    let contextStart = content.lastIndexOf('\n\n', position);
    if (contextStart === -1) {
      contextStart = 0;
    } else {
      contextStart += 2; // Skip the newlines
    }
    
    // Find the end of the paragraph or section
    let contextEnd = content.indexOf('\n\n', position);
    if (contextEnd === -1) {
      contextEnd = content.length;
    }
    
    // Get a reasonable amount of context (the paragraph or section containing the link)
    return content.substring(contextStart, contextEnd).trim();
  }

  /**
   * Determines the type of a link based on its href
   * @param {string} href - The link href
   * @returns {string} Link type
   */
  determineType(href) {
    if (!href) {
      return 'invalid';
    }
    
    if (href.startsWith('http://') || href.startsWith('https://')) {
      return 'external';
    }
    
    if (href.startsWith('#')) {
      return 'anchor';
    }
    
    if (href.includes('#')) {
      return 'internal_with_anchor';
    }
    
    return 'internal';
  }
}

module.exports = MarkdownLinkParser;