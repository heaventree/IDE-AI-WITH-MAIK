/**
 * External Link Checker for Documentation System
 * 
 * This module validates external links to ensure they are accessible.
 */

class ExternalLinkChecker {
  /**
   * Creates a new ExternalLinkChecker instance
   * @param {Object} options - Configuration options
   * @param {Function} options.httpClient - HTTP client for making requests
   * @param {number} options.timeout - Timeout for requests in milliseconds
   * @param {boolean} options.followRedirects - Whether to follow redirects
   * @param {Function} options.logger - Logging function for validation results
   */
  constructor(options = {}) {
    this.httpClient = options.httpClient;
    this.timeout = options.timeout || 5000;
    this.followRedirects = options.followRedirects !== undefined ? options.followRedirects : true;
    this.logger = options.logger || console;
    this.userAgent = options.userAgent || 'Documentation-Link-Validator/1.0';
  }

  /**
   * Checks an external link for validity
   * @param {Object} link - The link object containing href and context
   * @param {Object} document - The source document containing the link
   * @param {Object} options - Additional options
   * @param {boolean} options.validateExternal - Whether to actually validate external links
   * @returns {Object} Validation result
   */
  async checkLink(link, document, options = {}) {
    const { validateExternal = true } = options;
    const href = link.href.trim();
    
    try {
      // Check if link has valid protocol
      if (!href.startsWith('http://') && !href.startsWith('https://')) {
        return {
          link,
          valid: false,
          message: 'External link must start with http:// or https://',
          type: 'invalid_protocol'
        };
      }
      
      // Skip actual validation if disabled
      if (!validateExternal) {
        return {
          link,
          valid: true,
          message: 'External link validation skipped',
          type: 'validation_skipped'
        };
      }
      
      // Skip validation if no HTTP client available
      if (!this.httpClient) {
        return {
          link,
          valid: true,
          message: 'External link validation not available',
          type: 'validation_unavailable'
        };
      }
      
      // Perform HTTP HEAD request to check if link is accessible
      const response = await this.validateUrl(href);
      
      if (response.valid) {
        return {
          link,
          valid: true,
          message: `External link is accessible (${response.status})`,
          type: 'accessible_link',
          status: response.status,
          contentType: response.contentType
        };
      } else {
        return {
          link,
          valid: false,
          message: `External link is not accessible: ${response.error} (${response.status})`,
          type: 'inaccessible_link',
          status: response.status,
          error: response.error
        };
      }
    } catch (error) {
      this.logger.error('Error checking external link', {
        link: href,
        documentId: document.id || 'unknown',
        error: error.message
      });
      
      return {
        link,
        valid: false,
        error: error.message,
        message: `Error checking external link: ${error.message}`,
        type: 'checker_error'
      };
    }
  }

  /**
   * Validates a URL by making an HTTP request
   * @param {string} url - The URL to validate
   * @returns {Object} Validation result
   */
  async validateUrl(url) {
    try {
      // First try with HEAD request (less bandwidth)
      const response = await this.httpClient.request({
        method: 'HEAD',
        url,
        timeout: this.timeout,
        followRedirects: this.followRedirects,
        headers: {
          'User-Agent': this.userAgent
        }
      });
      
      // Check if response is successful (2xx status code)
      if (response.status >= 200 && response.status < 300) {
        return {
          valid: true,
          status: response.status,
          contentType: response.headers['content-type']
        };
      }
      
      // Some servers don't support HEAD, try GET for error cases
      if (response.status >= 400) {
        try {
          // Try with GET request as fallback
          const getResponse = await this.httpClient.request({
            method: 'GET',
            url,
            timeout: this.timeout,
            followRedirects: this.followRedirects,
            headers: {
              'User-Agent': this.userAgent
            }
          });
          
          // Check if GET response is successful
          if (getResponse.status >= 200 && getResponse.status < 300) {
            return {
              valid: true,
              status: getResponse.status,
              contentType: getResponse.headers['content-type']
            };
          }
          
          return {
            valid: false,
            status: getResponse.status,
            error: `HTTP error: ${getResponse.status}`
          };
        } catch (getError) {
          // If GET also fails, return the original HEAD error
          return {
            valid: false,
            status: response.status,
            error: `HTTP error: ${response.status}`
          };
        }
      }
      
      // Handle 3xx without redirect following
      if (response.status >= 300 && response.status < 400) {
        return {
          valid: true,
          status: response.status,
          contentType: response.headers['content-type'],
          location: response.headers['location']
        };
      }
      
      // Any other status code
      return {
        valid: false,
        status: response.status,
        error: `HTTP error: ${response.status}`
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message,
        status: 0
      };
    }
  }
}

module.exports = ExternalLinkChecker;