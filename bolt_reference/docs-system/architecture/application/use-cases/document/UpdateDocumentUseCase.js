/**
 * Update Document Use Case
 * 
 * Application service that handles updating an existing document.
 */

const { ApplicationException, UnauthorizedOperationException } = require('../../exceptions/ApplicationExceptions');
const { UpdateDocumentValidator } = require('../../validators/DocumentValidators');
const { DocumentNotFoundException } = require('../../../core/domain/exceptions/DocumentExceptions');
const DocumentDTO = require('../../dtos/DocumentDTO');

class UpdateDocumentUseCase {
  /**
   * Create a new UpdateDocumentUseCase
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
   * @param {UpdateDocumentCommand} command - Command containing document update data
   * @returns {Promise<DocumentDTO>} Data transfer object representing the updated document
   */
  async execute(command) {
    this.logger.info('Updating document', { documentId: command.documentId, userId: command.userId });
    
    try {
      // Validate the command
      UpdateDocumentValidator.validate(command);
      
      // Execute within a transaction
      return await this.unitOfWork.execute(async () => {
        // Get the document
        const document = await this.documentRepository.findById(command.documentId);
        
        if (!document) {
          throw new DocumentNotFoundException(command.documentId);
        }
        
        // Check if user has permission to update the document
        if (!document.isOwnedBy(command.userId)) {
          throw new UnauthorizedOperationException('update', 'document', command.documentId);
        }
        
        // Update the document
        document.update(command.content, command.userId, command.changes || {});
        
        // Save to repository
        await this.documentRepository.save(document);
        
        // Publish domain events
        if (document.hasUncommittedEvents()) {
          for (const event of document.domainEvents) {
            await this.eventPublisher.publish(event);
          }
          document.clearEvents();
        }
        
        this.logger.info('Document updated successfully', { 
          documentId: document.id, 
          versionNumber: document.getLatestVersion().versionNumber 
        });
        
        // Return DTO
        return new DocumentDTO(document);
      });
    } catch (error) {
      // Validation exceptions are already in the correct format, so just re-throw
      if (error.name === 'ValidationException') {
        throw error;
      }
      
      this.logger.error('Failed to update document', { 
        error: error.message,
        stack: error.stack,
        documentId: command.documentId,
        userId: command.userId
      });
      
      // Handle specific domain exceptions
      if (error instanceof DocumentNotFoundException) {
        throw error;
      }
      
      if (error.name === 'InvalidDocumentStateException') {
        throw new ApplicationException(
          'APP-2010',
          'Cannot update document in its current state',
          error.message,
          error
        );
      }
      
      // Wrap other exceptions
      throw new ApplicationException(
        'APP-2002',
        'Failed to update document',
        error.message,
        error
      );
    }
  }
}

module.exports = UpdateDocumentUseCase;