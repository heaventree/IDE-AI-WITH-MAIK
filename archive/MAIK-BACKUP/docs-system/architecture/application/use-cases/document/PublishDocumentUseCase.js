/**
 * Publish Document Use Case
 * 
 * Application service that handles publishing a document.
 */

const { ApplicationException, UnauthorizedOperationException } = require('../../exceptions/ApplicationExceptions');
const { PublishDocumentValidator } = require('../../validators/DocumentValidators');
const { DocumentNotFoundException } = require('../../../core/domain/exceptions/DocumentExceptions');
const DocumentDTO = require('../../dtos/DocumentDTO');

class PublishDocumentUseCase {
  /**
   * Create a new PublishDocumentUseCase
   * 
   * @param {DocumentRepository} documentRepository - Repository for document access
   * @param {WorkflowRepository} [workflowRepository=null] - Repository for workflow access
   * @param {UnitOfWork} unitOfWork - Unit of work for transaction management
   * @param {DomainEventPublisher} eventPublisher - Publisher for domain events
   * @param {Logger} logger - Logger instance
   */
  constructor(documentRepository, workflowRepository, unitOfWork, eventPublisher, logger) {
    this.documentRepository = documentRepository;
    this.workflowRepository = workflowRepository;
    this.unitOfWork = unitOfWork;
    this.eventPublisher = eventPublisher;
    this.logger = logger;
  }
  
  /**
   * Execute the use case
   * 
   * @param {PublishDocumentCommand} command - Command containing publish parameters
   * @returns {Promise<DocumentDTO>} Data transfer object representing the published document
   */
  async execute(command) {
    this.logger.info('Publishing document', { documentId: command.documentId, userId: command.userId });
    
    try {
      // Validate the command
      PublishDocumentValidator.validate(command);
      
      // Execute within a transaction
      return await this.unitOfWork.execute(async () => {
        // Get the document
        const document = await this.documentRepository.findById(command.documentId);
        
        if (!document) {
          throw new DocumentNotFoundException(command.documentId);
        }
        
        // Check if user has permission to publish the document
        if (!document.isOwnedBy(command.userId) && !this._canPublish(document, command.userId)) {
          throw new UnauthorizedOperationException('publish', 'document', command.documentId);
        }
        
        // Publish the document
        const publishRecord = document.publish(command.userId, command.environment);
        
        // Create a workflow if a workflow repository is provided
        if (this.workflowRepository) {
          await this._createPublishWorkflow(document, publishRecord, command.userId);
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
        
        this.logger.info('Document published successfully', { 
          documentId: document.id, 
          publishId: publishRecord.publishId
        });
        
        // Return DTO
        return new DocumentDTO(document);
      });
    } catch (error) {
      // Validation exceptions are already in the correct format, so just re-throw
      if (error.name === 'ValidationException') {
        throw error;
      }
      
      this.logger.error('Failed to publish document', { 
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
          'APP-2020',
          'Cannot publish document in its current state',
          error.message,
          error
        );
      }
      
      if (error.name === 'DocumentAccessDeniedException') {
        throw new UnauthorizedOperationException(
          'publish',
          'document',
          command.documentId
        );
      }
      
      // Wrap other exceptions
      throw new ApplicationException(
        'APP-2003',
        'Failed to publish document',
        error.message,
        error
      );
    }
  }
  
  /**
   * Check if a user can publish a document
   * 
   * @param {Document} document - Document to check
   * @param {string} userId - User ID
   * @returns {boolean} True if the user can publish the document
   * @private
   */
  _canPublish(document, userId) {
    // For now, only the owner can publish the document
    // This could be expanded to include users with specific roles
    return document.isOwnedBy(userId);
  }
  
  /**
   * Create a publishing workflow
   * 
   * @param {Document} document - Document to publish
   * @param {Object} publishRecord - Publish record
   * @param {string} publisherId - Publisher ID
   * @returns {Promise<Object>} Created workflow
   * @private
   */
  async _createPublishWorkflow(document, publishRecord, publisherId) {
    if (!this.workflowRepository) {
      return null;
    }
    
    // Create a workflow for the publish operation
    const workflow = {
      workflowId: this._generateId(),
      documentId: document.id,
      publishId: publishRecord.publishId,
      versionNumber: publishRecord.versionNumber,
      type: 'publish',
      environment: publishRecord.environment,
      status: 'pending',
      steps: [
        {
          stepId: this._generateId(),
          name: 'validation',
          status: 'pending',
          order: 1
        },
        {
          stepId: this._generateId(),
          name: 'compilation',
          status: 'pending',
          order: 2
        },
        {
          stepId: this._generateId(),
          name: 'deployment',
          status: 'pending',
          order: 3
        }
      ],
      createdBy: publisherId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Save the workflow
    await this.workflowRepository.save(workflow);
    
    return workflow;
  }
  
  /**
   * Generate a unique ID
   * 
   * @returns {string} Unique ID
   * @private
   */
  _generateId() {
    return Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36);
  }
}

module.exports = PublishDocumentUseCase;