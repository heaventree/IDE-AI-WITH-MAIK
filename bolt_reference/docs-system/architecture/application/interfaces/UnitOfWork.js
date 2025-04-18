/**
 * Unit of Work Interface
 * 
 * Interface for the Unit of Work pattern that coordinates transactional operations.
 * This ensures that all operations within a transaction either succeed together or fail together.
 */

/**
 * @interface
 */
class UnitOfWork {
  /**
   * Execute a function within a transaction
   * 
   * @param {Function} work - Async function to execute within the transaction
   * @returns {Promise<*>} Result of the work function
   */
  async execute(work) {
    throw new Error('Method not implemented');
  }
  
  /**
   * Begin a transaction
   * 
   * @returns {Promise<void>}
   */
  async beginTransaction() {
    throw new Error('Method not implemented');
  }
  
  /**
   * Commit the current transaction
   * 
   * @returns {Promise<void>}
   */
  async commitTransaction() {
    throw new Error('Method not implemented');
  }
  
  /**
   * Rollback the current transaction
   * 
   * @returns {Promise<void>}
   */
  async rollbackTransaction() {
    throw new Error('Method not implemented');
  }
  
  /**
   * Get a repository for a specific aggregate type
   * 
   * @param {string} aggregateType - Type of aggregate
   * @returns {Object} Repository for the specified aggregate type
   */
  getRepository(aggregateType) {
    throw new Error('Method not implemented');
  }
}

module.exports = UnitOfWork;