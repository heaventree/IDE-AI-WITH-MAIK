/**
 * Documentation System Entry Point
 * 
 * Bootstraps and starts the application.
 */

const express = require('express');
const compression = require('compression');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

// Create Express app
const app = express();

// Set up middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disabled for simplicity in development
}));
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger setup (simple for now)
const logger = {
  info: (...args) => console.log('[INFO]', ...args),
  warn: (...args) => console.warn('[WARN]', ...args),
  error: (...args) => console.error('[ERROR]', ...args),
  debug: (...args) => console.debug('[DEBUG]', ...args)
};

// Mock dependencies for now (would be replaced with real implementations)
const dependencies = {
  logger,
  useCases: {
    createDocumentUseCase: {
      execute: async (command) => {
        logger.info('Creating document', command);
        return {
          id: 'mock-doc-1',
          title: command.title,
          status: 'draft',
          createdAt: new Date().toISOString()
        };
      }
    },
    publishDocumentUseCase: {
      execute: async (command) => {
        logger.info('Publishing document', command);
        return {
          id: command.documentId,
          status: 'published',
          publishedAt: new Date().toISOString()
        };
      }
    },
    searchDocumentsUseCase: {
      execute: async (query) => {
        logger.info('Searching documents', query);
        
        // If searching for a specific document
        if (query.documentId) {
          return {
            documents: [{
              id: query.documentId,
              title: 'Example Document',
              status: 'draft',
              createdAt: new Date().toISOString()
            }],
            totalCount: 1,
            limit: 20,
            offset: 0
          };
        }
        
        return {
          documents: [
            {
              id: 'mock-doc-1',
              title: 'Example Document 1',
              status: 'draft',
              createdAt: new Date().toISOString()
            },
            {
              id: 'mock-doc-2',
              title: 'Example Document 2',
              status: 'published',
              createdAt: new Date().toISOString(),
              publishedAt: new Date().toISOString()
            }
          ],
          totalCount: 2,
          limit: query.limit || 20,
          offset: query.offset || 0
        };
      }
    }
  }
};

// Set up authentication middleware
const { setupAuthMiddleware } = require('./architecture/interfaces/api/middlewares/AuthMiddleware');
setupAuthMiddleware(app, { enabled: false }, logger);

// Register API routes
const { registerRoutes } = require('./architecture/interfaces/api/ApiRouteRegistry');
registerRoutes(app, dependencies);

// Serve static files from the current directory
app.use(express.static(path.join(__dirname)));

// Set up error handling middleware
const { setupErrorHandling } = require('./architecture/interfaces/api/middlewares/ErrorHandlingMiddleware');
setupErrorHandling(app, logger);

// Start the server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, '0.0.0.0', () => {
  logger.info(`Server running on port ${PORT}`);
  
  // Log server info
  logger.info('Documentation System started');
  logger.info(`API available at http://localhost:${PORT}/api`);
  logger.info(`Health check available at http://localhost:${PORT}/api/health`);
  logger.info(`Web UI available at http://localhost:${PORT}/`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
  });
});

module.exports = { app, server };