/**
 * Server Bootstrap
 * 
 * Bootstrap the server and application dependencies.
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const { loadConfig } = require('../infrastructure/config/ConfigLoader');
const { createLogger } = require('../infrastructure/logging/LoggerFactory');
const { createEventBus } = require('../infrastructure/events/EventBusFactory');
const { createMongoClient } = require('../infrastructure/persistence/mongo/MongoClientFactory');
const { registerRoutes } = require('../interfaces/api/ApiRouteRegistry');
const { setupErrorHandling } = require('../interfaces/api/middlewares/ErrorHandlingMiddleware');
const { setupAuthMiddleware } = require('../interfaces/api/middlewares/AuthMiddleware');
const { UnitOfWorkImpl } = require('../infrastructure/persistence/UnitOfWorkImpl');
const { MongoDocumentRepository } = require('../infrastructure/persistence/MongoDocumentRepository');
const { DomainEventPublisher } = require('../core/domain/events/DomainEventPublisher');

/**
 * Bootstrap the server and application dependencies
 * 
 * @returns {Promise<Object>} Server instance and dependencies
 */
async function bootstrapServer() {
  // Load configuration
  const config = loadConfig();
  
  // Set up logger
  const logger = createLogger(config.logging);
  
  // Connect to the database
  const mongoClient = await createMongoClient(config.database, logger);
  
  // Create the event bus
  const eventBus = createEventBus(config.events, logger);
  
  // Create the domain event publisher
  const eventPublisher = new DomainEventPublisher(eventBus, logger);
  
  // Create repositories
  const documentRepository = new MongoDocumentRepository(mongoClient, logger);
  
  // Create unit of work
  const unitOfWork = new UnitOfWorkImpl(mongoClient, logger);
  
  // Create the Express application
  const app = express();
  
  // Configure middleware
  app.use(cors(config.cors));
  app.use(helmet());
  app.use(compression());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  
  // Setup authentication
  setupAuthMiddleware(app, config.auth, logger);
  
  // Register routes
  registerRoutes(app, {
    config,
    logger,
    documentRepository,
    unitOfWork,
    eventPublisher
  });
  
  // Setup error handling (must be last)
  setupErrorHandling(app, logger);
  
  // Create the server
  const server = app.listen(config.server.port, config.server.host);
  
  // Handle server shutdown
  const shutdown = async () => {
    logger.info('Shutting down server...');
    
    // Close the server
    server.close(() => {
      logger.info('Server closed');
    });
    
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
    
    process.exit(0);
  };
  
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
  
  return {
    server,
    app,
    logger,
    config,
    documentRepository,
    unitOfWork,
    eventPublisher
  };
}

module.exports = { bootstrapServer };