/**
 * Markdown Code Block Parser for Documentation System
 * 
 * This module extracts code blocks from Markdown content for validation.
 */

class MarkdownCodeParser {
  /**
   * Creates a new MarkdownCodeParser instance
   * @param {Object} options - Configuration options
   * @param {boolean} options.includeUnspecifiedLanguage - Whether to include code blocks without a specified language
   * @param {Array} options.excludedLanguages - Languages to exclude from extraction
   */
  constructor(options = {}) {
    this.includeUnspecifiedLanguage = options.includeUnspecifiedLanguage !== undefined ? options.includeUnspecifiedLanguage : true;
    this.excludedLanguages = options.excludedLanguages || ['text', 'plaintext', 'output', 'console'];
  }

  /**
   * Extracts code blocks from a Markdown document
   * @param {Object} document - The document containing Markdown content
   * @returns {Array} Array of code block objects with language, code, and context
   */
  extractCodeBlocks(document) {
    const content = document.content || '';
    const codeBlocks = [];
    
    // Regular expression to match fenced code blocks ```language\ncode```
    const fencedCodeBlockRegex = /```(?:([\w+-]+)\n)?([\s\S]*?)```/g;
    
    let match;
    while ((match = fencedCodeBlockRegex.exec(content)) !== null) {
      const language = (match[1] || '').trim().toLowerCase();
      const code = match[2];
      
      // Skip excluded languages
      if (this.excludedLanguages.includes(language)) {
        continue;
      }
      
      // Skip blocks without language if includeUnspecifiedLanguage is false
      if (!language && !this.includeUnspecifiedLanguage) {
        continue;
      }
      
      codeBlocks.push({
        language: language || 'text',
        code: code,
        context: this.getContext(content, match.index),
        position: {
          start: match.index,
          end: match.index + match[0].length,
          lineNumber: this.getLineNumber(content, match.index)
        },
        documentId: document.id || 'unknown'
      });
    }
    
    // Also look for indented code blocks (4 spaces or 1 tab)
    const indentedCodeBlockRegex = /(?:^(?:[ ]{4}|\t).*?$\n?)+/gm;
    
    while ((match = indentedCodeBlockRegex.exec(content)) !== null) {
      // Skip if there's a fenced code block that overlaps with this indented block
      const isOverlapping = codeBlocks.some(block => 
        (match.index >= block.position.start && match.index < block.position.end) ||
        (match.index + match[0].length > block.position.start && match.index + match[0].length <= block.position.end)
      );
      
      if (isOverlapping) {
        continue;
      }
      
      // Only include indented blocks if we're including unspecified language
      if (this.includeUnspecifiedLanguage) {
        // Remove the indentation from each line
        const code = match[0].replace(/^(?:[ ]{4}|\t)/gm, '');
        
        codeBlocks.push({
          language: 'text', // Indented blocks don't specify language
          code: code,
          context: this.getContext(content, match.index),
          position: {
            start: match.index,
            end: match.index + match[0].length,
            lineNumber: this.getLineNumber(content, match.index)
          },
          documentId: document.id || 'unknown'
        });
      }
    }
    
    // Also check for HTML code blocks <pre><code class="language-*">
    const htmlCodeBlockRegex = /<pre><code(?:\s+class="language-([^"]+)")?>([^<]+)<\/code><\/pre>/g;
    
    while ((match = htmlCodeBlockRegex.exec(content)) !== null) {
      const language = (match[1] || '').trim().toLowerCase();
      const code = this.decodeHtmlEntities(match[2]);
      
      // Skip excluded languages
      if (this.excludedLanguages.includes(language)) {
        continue;
      }
      
      // Skip blocks without language if includeUnspecifiedLanguage is false
      if (!language && !this.includeUnspecifiedLanguage) {
        continue;
      }
      
      codeBlocks.push({
        language: language || 'text',
        code: code,
        context: this.getContext(content, match.index),
        position: {
          start: match.index,
          end: match.index + match[0].length,
          lineNumber: this.getLineNumber(content, match.index)
        },
        documentId: document.id || 'unknown',
        html: true
      });
    }
    
    return codeBlocks;
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
    
    // Get a reasonable amount of context (preceding heading + a few lines)
    let heading = '';
    const headingMatch = content.substring(0, contextStart).match(/(?:^|\n)(#{1,6} .+)(?:\n|$)(?!.*\n#{1,6} )/);
    
    if (headingMatch) {
      heading = headingMatch[1] + '\n';
    }
    
    // Combine heading and immediate context
    return (heading + content.substring(contextStart, contextEnd)).trim();
  }

  /**
   * Decodes HTML entities in code blocks
   * @param {string} html - HTML string with entities
   * @returns {string} Decoded string
   */
  decodeHtmlEntities(html) {
    return html
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
  }
}

module.exports = MarkdownCodeParser;