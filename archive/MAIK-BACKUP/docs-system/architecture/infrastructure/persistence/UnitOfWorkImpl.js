/**
 * Unit of Work Implementation
 * 
 * Implementation of the Unit of Work pattern for transaction management.
 */

/**
 * Unit of Work implementation
 */
class UnitOfWorkImpl {
  /**
   * Create a new UnitOfWorkImpl
   * 
   * @param {MongoClient} mongoClient - MongoDB client
   * @param {Logger} logger - Logger instance
   */
  constructor(mongoClient, logger) {
    /**
     * MongoDB client
     * @type {MongoClient}
     */
    this.mongoClient = mongoClient;
    
    /**
     * Logger
     * @type {Logger}
     */
    this.logger = logger;
  }
  
  /**
   * Execute a function within a transaction
   * 
   * @param {Function} work - Function to execute
   * @returns {Promise<*>} Result of the function
   */
  async execute(work) {
    const session = this.mongoClient.startSession();
    let result;
    
    try {
      this.logger.debug('Starting transaction');
      
      session.startTransaction({
        readConcern: { level: 'snapshot' },
        writeConcern: { w: 'majority' }
      });
      
      // Execute the work within the transaction
      result = await work(session);
      
      // Commit the transaction
      await session.commitTransaction();
      
      this.logger.debug('Transaction committed');
      
      return result;
    } catch (error) {
      this.logger.error('Transaction failed', { error: error.message, stack: error.stack });
      
      // Abort the transaction
      await session.abortTransaction();
      
      this.logger.debug('Transaction aborted');
      
      throw error;
    } finally {
      // End the session
      await session.endSession();
    }
  }
}

module.exports = { UnitOfWorkImpl };