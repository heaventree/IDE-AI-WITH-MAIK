/**
 * Dependency Injection Container Configuration
 * 
 * Configures the application's dependency injection container.
 */

const winston = require('winston');
const mongodb = require('mongodb');

const DependencyContainer = require('./DependencyContainer');

// Core domain
const Document = require('../../core/domain/document/Document');
const DocumentRepository = require('../../core/domain/document/DocumentRepository');
const DocumentPublishingService = require('../../core/domain/document/services/DocumentPublishingService');

// Infrastructure implementations
const MongoDocumentRepository = require('../persistence/MongoDocumentRepository');
const WinstonLogger = require('../logging/WinstonLogger');
const InMemoryDomainEventPublisher = require('../event-bus/InMemoryDomainEventPublisher');
const { CircuitBreaker } = require('../resilience/CircuitBreaker');
const UnitOfWork = require('../resilience/UnitOfWork');
const AuthenticationService = require('../security/Authentication');

// Application services
const CreateDocumentUseCase = require('../../application/use-cases/document/CreateDocumentUseCase');
const GetDocumentUseCase = require('../../application/use-cases/document/GetDocumentUseCase');
const UpdateDocumentUseCase = require('../../application/use-cases/document/UpdateDocumentUseCase');
const PublishDocumentUseCase = require('../../application/use-cases/document/PublishDocumentUseCase');

// Interface layer
const DocumentController = require('../../interfaces/controllers/DocumentController');
const { createAuthMiddleware } = require('../../interfaces/middlewares/AuthMiddleware');
const createErrorMiddleware = require('../../interfaces/middlewares/ErrorMiddleware');

/**
 * Configure the dependency injection container
 * 
 * @param {Object} config - Application configuration
 * @returns {DependencyContainer} Configured container
 */
function configureContainer(config) {
  const container = new DependencyContainer();
  
  // Register configuration
  container.register('config', config);
  
  // Configure logging
  container.registerSingleton('winston', () => {
    return winston;
  });
  
  container.registerSingleton('logger', (container) => {
    const winston = container.resolve('winston');
    const config = container.resolve('config');
    
    return new WinstonLogger(winston, {
      level: config.logLevel || 'info'
    });
  });
  
  // Configure database
  container.registerSingleton('mongoClient', async (container) => {
    const config = container.resolve('config');
    const logger = container.resolve('logger');
    
    const client = new mongodb.MongoClient(config.mongodb.uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    try {
      await client.connect();
      logger.info('Connected to MongoDB');
      return client.db(config.mongodb.dbName);
    } catch (error) {
      logger.error('Failed to connect to MongoDB', { error: error.message });
      throw error;
    }
  });
  
  // Register resilience components
  container.registerFactory('circuitBreaker', (container) => {
    const logger = container.resolve('logger');
    return (operationName) => new CircuitBreaker({
      operationName,
      failureThreshold: 5,
      resetTimeout: 30000
    }, logger);
  });
  
  container.registerFactory('unitOfWork', (container) => {
    const mongoClient = container.resolve('mongoClient');
    const logger = container.resolve('logger');
    return new UnitOfWork(mongoClient, logger);
  });
  
  // Register event publisher
  container.registerSingleton('eventPublisher', (container) => {
    const logger = container.resolve('logger');
    return new InMemoryDomainEventPublisher(logger);
  });
  
  // Register authentication service
  container.registerSingleton('authService', (container) => {
    const config = container.resolve('config');
    const logger = container.resolve('logger');
    const circuitBreakerFactory = container.resolve('circuitBreaker');
    
    return new AuthenticationService(
      config.auth,
      logger,
      circuitBreakerFactory('auth')
    );
  });
  
  // Register repositories
  container.registerSingleton('documentRepository', (container) => {
    const mongoClient = container.resolve('mongoClient');
    const logger = container.resolve('logger');
    const circuitBreakerFactory = container.resolve('circuitBreaker');
    
    return new MongoDocumentRepository(
      mongoClient,
      logger,
      circuitBreakerFactory('documentRepository')
    );
  });
  
  // Register domain services
  container.registerFactory('documentPublishingService', (container) => {
    const documentRepository = container.resolve('documentRepository');
    
    // Assuming there's a workflow repository, or pass null if not needed
    const workflowRepository = container.has('workflowRepository') 
      ? container.resolve('workflowRepository') 
      : null;
    
    return new DocumentPublishingService(documentRepository, workflowRepository);
  });
  
  // Register application services (use cases)
  container.registerFactory('createDocumentUseCase', (container) => {
    const documentRepository = container.resolve('documentRepository');
    const unitOfWork = container.resolve('unitOfWork');
    const eventPublisher = container.resolve('eventPublisher');
    const logger = container.resolve('logger');
    
    return new CreateDocumentUseCase(
      documentRepository,
      unitOfWork,
      eventPublisher,
      logger
    );
  });
  
  container.registerFactory('getDocumentUseCase', (container) => {
    const documentRepository = container.resolve('documentRepository');
    const logger = container.resolve('logger');
    
    return new GetDocumentUseCase(documentRepository, logger);
  });
  
  container.registerFactory('updateDocumentUseCase', (container) => {
    const documentRepository = container.resolve('documentRepository');
    const unitOfWork = container.resolve('unitOfWork');
    const eventPublisher = container.resolve('eventPublisher');
    const logger = container.resolve('logger');
    
    return new UpdateDocumentUseCase(
      documentRepository,
      unitOfWork,
      eventPublisher,
      logger
    );
  });
  
  container.registerFactory('publishDocumentUseCase', (container) => {
    const documentRepository = container.resolve('documentRepository');
    const workflowRepository = container.has('workflowRepository') 
      ? container.resolve('workflowRepository') 
      : null;
    const unitOfWork = container.resolve('unitOfWork');
    const eventPublisher = container.resolve('eventPublisher');
    const logger = container.resolve('logger');
    
    return new PublishDocumentUseCase(
      documentRepository,
      workflowRepository,
      unitOfWork,
      eventPublisher,
      logger
    );
  });
  
  // Register controllers
  container.registerFactory('documentController', (container) => {
    const createDocumentUseCase = container.resolve('createDocumentUseCase');
    const getDocumentUseCase = container.resolve('getDocumentUseCase');
    const updateDocumentUseCase = container.resolve('updateDocumentUseCase');
    const publishDocumentUseCase = container.resolve('publishDocumentUseCase');
    const searchDocumentsUseCase = container.has('searchDocumentsUseCase') 
      ? container.resolve('searchDocumentsUseCase') 
      : null;
    const logger = container.resolve('logger');
    
    return new DocumentController(
      createDocumentUseCase,
      getDocumentUseCase,
      updateDocumentUseCase,
      publishDocumentUseCase,
      searchDocumentsUseCase,
      logger
    );
  });
  
  // Register middleware
  container.registerFactory('authMiddleware', (container) => {
    const authService = container.resolve('authService');
    const logger = container.resolve('logger');
    
    return createAuthMiddleware(authService, logger);
  });
  
  container.registerFactory('errorMiddleware', (container) => {
    const logger = container.resolve('logger');
    
    return createErrorMiddleware(logger);
  });
  
  return container;
}

module.exports = { configureContainer };