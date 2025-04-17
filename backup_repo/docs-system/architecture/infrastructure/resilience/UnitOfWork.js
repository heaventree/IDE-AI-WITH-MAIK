/**
 * Unit of Work
 * 
 * Implementation of the Unit of Work pattern for transactional operations.
 */

/**
 * Unit of work states
 * @enum {string}
 */
const UnitOfWorkState = {
  ACTIVE: 'ACTIVE',
  COMMITTED: 'COMMITTED',
  ROLLED_BACK: 'ROLLED_BACK'
};

/**
 * Unit of work implementation for MongoDB
 */
class UnitOfWork {
  /**
   * Create a new UnitOfWork
   * 
   * @param {Object} mongoClient - MongoDB client or database instance
   * @param {Logger} logger - Logger instance
   */
  constructor(mongoClient, logger) {
    /**
     * MongoDB client or database instance
     * @type {Object}
     */
    this.mongoClient = mongoClient;
    
    /**
     * Logger instance
     * @type {Logger}
     */
    this.logger = logger;
    
    /**
     * Current MongoDB session
     * @type {Object|null}
     */
    this.session = null;
    
    /**
     * Current state of the unit of work
     * @type {UnitOfWorkState}
     */
    this.state = UnitOfWorkState.ACTIVE;
  }
  
  /**
   * Start a new transaction
   * 
   * @returns {Promise<Object>} MongoDB session
   */
  async beginTransaction() {
    if (this.session) {
      throw new Error('Transaction already in progress');
    }
    
    this.logger.debug('Beginning transaction');
    
    try {
      this.session = this.mongoClient.startSession();
      await this.session.startTransaction();
      this.state = UnitOfWorkState.ACTIVE;
      
      return this.session;
    } catch (error) {
      this.logger.error('Failed to begin transaction', { error: error.message, stack: error.stack });
      throw error;
    }
  }
  
  /**
   * Commit the current transaction
   * 
   * @returns {Promise<void>}
   */
  async commitTransaction() {
    if (!this.session) {
      throw new Error('No active transaction');
    }
    
    if (this.state !== UnitOfWorkState.ACTIVE) {
      throw new Error(`Cannot commit transaction in state: ${this.state}`);
    }
    
    this.logger.debug('Committing transaction');
    
    try {
      await this.session.commitTransaction();
      this.state = UnitOfWorkState.COMMITTED;
    } catch (error) {
      this.logger.error('Failed to commit transaction', { error: error.message, stack: error.stack });
      throw error;
    } finally {
      this.session.endSession();
      this.session = null;
    }
  }
  
  /**
   * Rollback the current transaction
   * 
   * @returns {Promise<void>}
   */
  async rollbackTransaction() {
    if (!this.session) {
      throw new Error('No active transaction');
    }
    
    if (this.state !== UnitOfWorkState.ACTIVE) {
      throw new Error(`Cannot rollback transaction in state: ${this.state}`);
    }
    
    this.logger.debug('Rolling back transaction');
    
    try {
      await this.session.abortTransaction();
      this.state = UnitOfWorkState.ROLLED_BACK;
    } catch (error) {
      this.logger.error('Failed to rollback transaction', { error: error.message, stack: error.stack });
      throw error;
    } finally {
      this.session.endSession();
      this.session = null;
    }
  }
  
  /**
   * Execute a function within a transaction
   * 
   * @param {Function} fn - Function to execute
   * @returns {Promise<*>} Result of the function
   */
  async execute(fn) {
    let result;
    
    try {
      await this.beginTransaction();
      
      // Execute the function
      result = await fn();
      
      // Commit the transaction
      await this.commitTransaction();
      
      return result;
    } catch (error) {
      this.logger.error('Transaction failed', { error: error.message, stack: error.stack });
      
      // Rollback the transaction if it's still active
      if (this.session && this.state === UnitOfWorkState.ACTIVE) {
        await this.rollbackTransaction();
      }
      
      throw error;
    }
  }
  
  /**
   * Get the current MongoDB session
   * 
   * @returns {Object|null} MongoDB session
   */
  getSession() {
    return this.session;
  }
  
  /**
   * Get the current state of the unit of work
   * 
   * @returns {UnitOfWorkState} Current state
   */
  getState() {
    return this.state;
  }
}

module.exports = UnitOfWork;