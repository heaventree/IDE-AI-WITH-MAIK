/**
 * MongoDB Client Factory
 * 
 * Factory for creating MongoDB client instances.
 */

const { MongoClient } = require('mongodb');

/**
 * Create a MongoDB client
 * 
 * @param {Object} config - MongoDB configuration
 * @param {Logger} logger - Logger instance
 * @returns {Promise<MongoClient>} MongoDB client
 */
async function createMongoClient(config, logger) {
  try {
    const { uri, options = {} } = config;
    
    logger.debug('Connecting to MongoDB', { uri });
    
    // Create the client
    const client = new MongoClient(uri, options);
    
    // Connect to the database
    await client.connect();
    
    // Test the connection
    await client.db().command({ ping: 1 });
    
    logger.info('Connected to MongoDB');
    
    return client;
  } catch (error) {
    logger.error('Failed to connect to MongoDB', { 
      error: error.message, 
      stack: error.stack 
    });
    
    throw error;
  }
}

module.exports = { createMongoClient };