/**
 * Create Document Use Case
 * 
 * Application service that handles creating a new document.
 */

const { ApplicationException, BusinessRuleViolationException } = require('../../exceptions/ApplicationExceptions');
const { CreateDocumentValidator } = require('../../validators/DocumentValidators');
const Document = require('../../../core/domain/document/Document');
const DocumentDTO = require('../../dtos/DocumentDTO');

class CreateDocumentUseCase {
  /**
   * Create a new CreateDocumentUseCase
   * 
   * @param {DocumentRepository} documentRepository - Repository for document access
   * @param {UnitOfWork} unitOfWork - Unit of work for transaction management
   * @param {DomainEventPublisher} eventPublisher - Publisher for domain events
   * @param {Logger} logger - Logger instance
   */
  constructor(documentRepository, unitOfWork, eventPublisher, logger) {
    this.documentRepository = documentRepository;
    this.unitOfWork = unitOfWork;
    this.eventPublisher = eventPublisher;
    this.logger = logger;
  }
  
  /**
   * Execute the use case
   * 
   * @param {CreateDocumentCommand} command - Command containing document creation data
   * @returns {Promise<DocumentDTO>} Data transfer object representing the created document
   */
  async execute(command) {
    this.logger.info('Creating document', { title: command.title, ownerId: command.ownerId });
    
    try {
      // Validate the command
      CreateDocumentValidator.validate(command);
      
      // Check if user has reached document limit
      await this._checkDocumentLimit(command.ownerId);
      
      // Execute within a transaction
      return await this.unitOfWork.execute(async () => {
        // Generate an ID for the new document
        const documentId = await this.documentRepository.nextId();
        
        // Create the document
        const document = new Document(documentId, command.title, command.ownerId, command.metadata || {});
        
        // Add initial version if content is provided
        if (command.content) {
          document.createInitialVersion(command.content);
        }
        
        // Add tags if provided
        if (command.tags && Array.isArray(command.tags) && command.tags.length > 0) {
          document.addTags(command.tags, command.ownerId);
        }
        
        // Save to repository
        await this.documentRepository.save(document);
        
        // Publish domain events
        if (document.hasUncommittedEvents()) {
          for (const event of document.domainEvents) {
            await this.eventPublisher.publish(event);
          }
          document.clearEvents();
        }
        
        this.logger.info('Document created successfully', { documentId: document.id });
        
        // Return DTO
        return new DocumentDTO(document);
      });
    } catch (error) {
      // Validation exceptions are already in the correct format, so just re-throw
      if (error.name === 'ValidationException') {
        throw error;
      }
      
      this.logger.error('Failed to create document', { 
        error: error.message,
        stack: error.stack,
        title: command.title,
        ownerId: command.ownerId
      });
      
      // Wrap other exceptions
      if (error.name === 'DocumentLimitExceededException') {
        throw new BusinessRuleViolationException(
          'document-limit-exceeded',
          'You have reached the maximum number of documents allowed for your account.'
        );
      }
      
      throw new ApplicationException(
        'APP-2001',
        'Failed to create document',
        error.message,
        error
      );
    }
  }
  
  /**
   * Check if a user has reached their document limit
   * 
   * @param {string} userId - User ID
   * @returns {Promise<void>}
   * @throws {Error} If the user has reached their document limit
   * @private
   */
  async _checkDocumentLimit(userId) {
    // Get the number of documents the user already has
    const count = await this.documentRepository.countByOwnerId(userId);
    
    // For now, use a simple hard-coded limit
    // This could be improved to fetch limits from a user service
    const limit = 1000;
    
    if (count >= limit) {
      throw new Error(`User ${userId} has reached the document limit of ${limit}`);
    }
  }
}

module.exports = CreateDocumentUseCase;