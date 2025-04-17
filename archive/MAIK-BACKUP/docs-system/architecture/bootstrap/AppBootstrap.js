/**
 * Application Bootstrap
 * 
 * Bootstrap application dependencies.
 */

const { loadConfig } = require('../infrastructure/config/ConfigLoader');
const { createLogger } = require('../infrastructure/logging/LoggerFactory');
const { createEventBus } = require('../infrastructure/events/EventBusFactory');
const { createMongoClient } = require('../infrastructure/persistence/mongo/MongoClientFactory');
const { UnitOfWorkImpl } = require('../infrastructure/persistence/UnitOfWorkImpl');
const { MongoDocumentRepository } = require('../infrastructure/persistence/MongoDocumentRepository');
const { DomainEventPublisher } = require('../core/domain/events/DomainEventPublisher');

// Use cases
const CreateDocumentUseCase = require('../application/use-cases/document/CreateDocumentUseCase');
const PublishDocumentUseCase = require('../application/use-cases/document/PublishDocumentUseCase');
const SearchDocumentsUseCase = require('../application/use-cases/document/SearchDocumentsUseCase');

// Domain services
const DocumentPublishingService = require('../core/domain/document/services/DocumentPublishingService');

/**
 * Bootstrap application dependencies
 * 
 * @param {Object} [options={}] - Bootstrap options
 * @returns {Promise<Object>} Application container with dependencies
 */
async function bootstrapApp(options = {}) {
  // Load configuration
  const config = options.config || loadConfig();
  
  // Set up logger
  const logger = options.logger || createLogger(config.logging);
  
  // Connect to the database
  const mongoClient = options.mongoClient || await createMongoClient(config.database, logger);
  
  // Create the event bus
  const eventBus = options.eventBus || createEventBus(config.events, logger);
  
  // Create the domain event publisher
  const eventPublisher = options.eventPublisher || new DomainEventPublisher(eventBus, logger);
  
  // Create repositories
  const documentRepository = options.documentRepository || new MongoDocumentRepository(mongoClient, logger);
  const workflowRepository = options.workflowRepository || null; // Add this later
  
  // Create unit of work
  const unitOfWork = options.unitOfWork || new UnitOfWorkImpl(mongoClient, logger);
  
  // Create domain services
  const documentPublishingService = new DocumentPublishingService(
    documentRepository,
    workflowRepository
  );
  
  // Create use cases
  const createDocumentUseCase = new CreateDocumentUseCase(
    documentRepository,
    unitOfWork,
    eventPublisher,
    logger
  );
  
  const publishDocumentUseCase = new PublishDocumentUseCase(
    documentRepository,
    workflowRepository,
    unitOfWork,
    eventPublisher,
    logger
  );
  
  const searchDocumentsUseCase = new SearchDocumentsUseCase(
    documentRepository,
    logger
  );
  
  // Return the application container
  return {
    config,
    logger,
    mongoClient,
    eventBus,
    eventPublisher,
    unitOfWork,
    
    // Repositories
    repositories: {
      documentRepository,
      workflowRepository
    },
    
    // Domain services
    domainServices: {
      documentPublishingService
    },
    
    // Use cases
    useCases: {
      createDocumentUseCase,
      publishDocumentUseCase,
      searchDocumentsUseCase
    },
    
    // Shutdown function
    shutdown: async () => {
      logger.info('Shutting down application...');
      
      // Close the MongoDB connection
      try {
        if (mongoClient) {
          await mongoClient.close();
          logger.info('MongoDB connection closed');
        }
      } catch (error) {
        logger.error('Error closing MongoDB connection', error);
      }
      
      // Close the event bus
      try {
        if (eventBus) {
          await eventBus.shutdown();
          logger.info('Event bus closed');
        }
      } catch (error) {
        logger.error('Error closing event bus', error);
      }
    }
  };
}

module.exports = { bootstrapApp };