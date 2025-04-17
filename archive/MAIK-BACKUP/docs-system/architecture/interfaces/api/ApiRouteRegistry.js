/**
 * API Route Registry
 * 
 * Registry for API routes.
 */

const { createDocumentRoutes } = require('./routes/DocumentRoutes');

/**
 * Register API routes
 * 
 * @param {Express} app - Express application
 * @param {Object} dependencies - Dependencies
 */
function registerRoutes(app, dependencies) {
  const { logger } = dependencies;
  
  // Health check route
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });
  
  // Register document routes
  app.use('/api/documents', createDocumentRoutes(dependencies));
  
  logger.info('API routes registered');
}

module.exports = { registerRoutes };