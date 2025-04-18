/**
 * Document Controller
 * 
 * Handles HTTP requests related to documents.
 */

const ApiResponse = require('../api/ApiResponse');
const { ValidationException } = require('../../application/exceptions/ApplicationExceptions');
const { DocumentNotFoundException } = require('../../core/domain/exceptions/DocumentExceptions');

class DocumentController {
  /**
   * Create a new DocumentController
   * 
   * @param {CreateDocumentUseCase} createDocumentUseCase - Use case for creating documents
   * @param {GetDocumentUseCase} getDocumentUseCase - Use case for retrieving documents
   * @param {UpdateDocumentUseCase} updateDocumentUseCase - Use case for updating documents
   * @param {PublishDocumentUseCase} publishDocumentUseCase - Use case for publishing documents
   * @param {SearchDocumentsUseCase} searchDocumentsUseCase - Use case for searching documents
   * @param {Logger} logger - Logger instance
   */
  constructor(
    createDocumentUseCase,
    getDocumentUseCase,
    updateDocumentUseCase,
    publishDocumentUseCase,
    searchDocumentsUseCase,
    logger
  ) {
    this.createDocumentUseCase = createDocumentUseCase;
    this.getDocumentUseCase = getDocumentUseCase;
    this.updateDocumentUseCase = updateDocumentUseCase;
    this.publishDocumentUseCase = publishDocumentUseCase;
    this.searchDocumentsUseCase = searchDocumentsUseCase;
    this.logger = logger;
  }
  
  /**
   * Handle document creation
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<void>}
   */
  async createDocument(req, res) {
    try {
      const command = {
        title: req.body.title,
        content: req.body.content,
        ownerId: req.user.id, // Assuming user ID is available from authentication middleware
        metadata: req.body.metadata
      };
      
      const result = await this.createDocumentUseCase.execute(command);
      
      res.status(201).json(ApiResponse.created(result));
    } catch (error) {
      this._handleError(error, res);
    }
  }
  
  /**
   * Handle document retrieval
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<void>}
   */
  async getDocument(req, res) {
    try {
      const query = {
        documentId: req.params.id,
        userId: req.user.id // Assuming user ID is available from authentication middleware
      };
      
      const result = await this.getDocumentUseCase.execute(query);
      
      res.status(200).json(ApiResponse.success(result));
    } catch (error) {
      this._handleError(error, res);
    }
  }
  
  /**
   * Handle document update
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<void>}
   */
  async updateDocument(req, res) {
    try {
      const command = {
        documentId: req.params.id,
        userId: req.user.id, // Assuming user ID is available from authentication middleware
        content: req.body.content,
        changes: req.body.changes
      };
      
      const result = await this.updateDocumentUseCase.execute(command);
      
      res.status(200).json(ApiResponse.success(result));
    } catch (error) {
      this._handleError(error, res);
    }
  }
  
  /**
   * Handle document publishing
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<void>}
   */
  async publishDocument(req, res) {
    try {
      const command = {
        documentId: req.params.id,
        userId: req.user.id // Assuming user ID is available from authentication middleware
      };
      
      const result = await this.publishDocumentUseCase.execute(command);
      
      res.status(200).json(ApiResponse.success(result));
    } catch (error) {
      this._handleError(error, res);
    }
  }
  
  /**
   * Handle document search
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<void>}
   */
  async searchDocuments(req, res) {
    try {
      const query = {
        searchQuery: req.query.q,
        ownerId: req.query.ownerId || req.user.id, // Default to current user if not specified
        status: req.query.status,
        tag: req.query.tag,
        limit: req.query.limit ? parseInt(req.query.limit, 10) : 20,
        offset: req.query.offset ? parseInt(req.query.offset, 10) : 0
      };
      
      const result = await this.searchDocumentsUseCase.execute(query);
      
      res.status(200).json(ApiResponse.success(result));
    } catch (error) {
      this._handleError(error, res);
    }
  }
  
  /**
   * Handle errors and send appropriate responses
   * 
   * @param {Error} error - Error to handle
   * @param {Object} res - Express response object
   * @private
   */
  _handleError(error, res) {
    this.logger.error('Controller error', { error: error.message, stack: error.stack });
    
    if (error instanceof ValidationException) {
      return res.status(400).json(
        ApiResponse.validationError(error.userMessage, error.validationErrors)
      );
    }
    
    if (error instanceof DocumentNotFoundException) {
      return res.status(404).json(
        ApiResponse.notFound('Document not found', 'document', error.documentId)
      );
    }
    
    if (error.name === 'UnauthorizedOperationException') {
      return res.status(403).json(
        ApiResponse.forbidden(
          'You do not have permission to perform this operation',
          error.operation,
          error.resourceType
        )
      );
    }
    
    if (error.name === 'ApplicationException') {
      return res.status(500).json(
        ApiResponse.serverError(error.userMessage, error.code)
      );
    }
    
    // Default server error
    res.status(500).json(
      ApiResponse.serverError('An unexpected error occurred')
    );
  }
}

module.exports = DocumentController;