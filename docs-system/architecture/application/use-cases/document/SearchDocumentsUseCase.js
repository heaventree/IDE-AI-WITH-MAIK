/**
 * Search Documents Use Case
 * 
 * Application service that handles searching for documents.
 */

const { ApplicationException } = require('../../exceptions/ApplicationExceptions');
const { SearchDocumentsValidator } = require('../../validators/DocumentValidators');
const DocumentDTO = require('../../dtos/DocumentDTO');

class SearchDocumentsUseCase {
  /**
   * Create a new SearchDocumentsUseCase
   * 
   * @param {DocumentRepository} documentRepository - Repository for document access
   * @param {Logger} logger - Logger instance
   */
  constructor(documentRepository, logger) {
    this.documentRepository = documentRepository;
    this.logger = logger;
  }
  
  /**
   * Execute the use case
   * 
   * @param {SearchDocumentsQuery} query - Query parameters for document search
   * @returns {Promise<Object>} Search results
   */
  async execute(query) {
    this.logger.info('Searching documents', {
      searchQuery: query.searchQuery,
      ownerId: query.ownerId,
      status: query.status,
      tag: query.tag,
      limit: query.limit,
      offset: query.offset
    });
    
    try {
      // Validate the query
      SearchDocumentsValidator.validate(query);
      
      // Normalize the query
      const normalizedQuery = this._normalizeQuery(query);
      
      // Determine search strategy
      let documents;
      
      if (normalizedQuery.tag) {
        // Search by tag
        documents = await this.documentRepository.findByTag(
          normalizedQuery.tag,
          {
            ownerId: normalizedQuery.ownerId,
            status: normalizedQuery.status,
            limit: normalizedQuery.limit,
            offset: normalizedQuery.offset,
            sort: { updatedAt: -1 }
          }
        );
      } else if (normalizedQuery.status) {
        // Search by status
        documents = await this.documentRepository.findByStatus(
          normalizedQuery.status,
          {
            ownerId: normalizedQuery.ownerId,
            tag: normalizedQuery.tag,
            limit: normalizedQuery.limit,
            offset: normalizedQuery.offset,
            sort: { updatedAt: -1 }
          }
        );
      } else if (normalizedQuery.searchQuery) {
        // Search by query
        documents = await this.documentRepository.search(
          {
            searchQuery: normalizedQuery.searchQuery,
            ownerId: normalizedQuery.ownerId,
            status: normalizedQuery.status,
            tag: normalizedQuery.tag
          },
          {
            limit: normalizedQuery.limit,
            offset: normalizedQuery.offset,
            useTextSearch: true
          }
        );
      } else {
        // Default to search by owner
        documents = await this.documentRepository.findByOwnerId(
          normalizedQuery.ownerId,
          {
            status: normalizedQuery.status,
            tag: normalizedQuery.tag,
            limit: normalizedQuery.limit,
            offset: normalizedQuery.offset,
            sort: { updatedAt: -1 }
          }
        );
      }
      
      // Get total count (for pagination)
      const totalCount = await this._getTotalCount(normalizedQuery);
      
      // Convert to DTOs
      const documentDTOs = DocumentDTO.createMinimalCollection(documents);
      
      this.logger.info('Documents found', { count: documents.length, totalCount });
      
      return {
        documents: documentDTOs,
        totalCount,
        limit: normalizedQuery.limit,
        offset: normalizedQuery.offset,
        hasMore: totalCount > (normalizedQuery.offset + documents.length)
      };
    } catch (error) {
      // Validation exceptions are already in the correct format, so just re-throw
      if (error.name === 'ValidationException') {
        throw error;
      }
      
      this.logger.error('Failed to search documents', { 
        error: error.message,
        stack: error.stack,
        query
      });
      
      // Wrap other exceptions
      throw new ApplicationException(
        'APP-2004',
        'Failed to search documents',
        error.message,
        error
      );
    }
  }
  
  /**
   * Normalize the search query
   * 
   * @param {SearchDocumentsQuery} query - Original query
   * @returns {Object} Normalized query
   * @private
   */
  _normalizeQuery(query) {
    return {
      searchQuery: query.searchQuery || null,
      ownerId: query.ownerId || null,
      status: query.status || null,
      tag: query.tag || null,
      limit: query.limit || 20,
      offset: query.offset || 0
    };
  }
  
  /**
   * Get the total count of documents matching the query
   * 
   * @param {Object} normalizedQuery - Normalized query
   * @returns {Promise<number>} Total count
   * @private
   */
  async _getTotalCount(normalizedQuery) {
    if (normalizedQuery.ownerId) {
      // For now, use a simple count based on owner
      // This could be improved to account for filters
      return this.documentRepository.countByOwnerId(normalizedQuery.ownerId);
    }
    
    // If no owner is specified, we don't try to get a total count
    // This would typically be implemented with a more sophisticated search mechanism
    return 100;
  }
}

module.exports = SearchDocumentsUseCase;