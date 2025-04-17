/**
 * Event Bus Factory
 * 
 * Factory for creating event bus instances.
 */

/**
 * Memory event bus implementation
 * @private
 */
class MemoryEventBus {
  /**
   * Create a new MemoryEventBus
   * 
   * @param {Logger} logger - Logger instance
   */
  constructor(logger) {
    this.handlers = new Map();
    this.logger = logger;
  }
  
  /**
   * Subscribe to an event
   * 
   * @param {string} eventType - Event type
   * @param {Function} handler - Event handler
   * @returns {Function} Unsubscribe function
   */
  subscribe(eventType, handler) {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    
    this.handlers.get(eventType).add(handler);
    
    this.logger.debug('Subscribed to event', { eventType });
    
    // Return unsubscribe function
    return () => {
      if (this.handlers.has(eventType)) {
        this.handlers.get(eventType).delete(handler);
        
        if (this.handlers.get(eventType).size === 0) {
          this.handlers.delete(eventType);
        }
        
        this.logger.debug('Unsubscribed from event', { eventType });
      }
    };
  }
  
  /**
   * Publish an event
   * 
   * @param {string} eventType - Event type
   * @param {Object} event - Event data
   * @returns {Promise<void>} Promise that resolves when all handlers have been called
   */
  async publish(eventType, event) {
    if (!this.handlers.has(eventType)) {
      this.logger.debug('No handlers for event', { eventType });
      return;
    }
    
    const handlers = this.handlers.get(eventType);
    
    this.logger.debug('Publishing event', { eventType, handlerCount: handlers.size });
    
    const promises = [];
    
    for (const handler of handlers) {
      try {
        const promise = handler(event);
        
        if (promise && typeof promise.then === 'function') {
          promises.push(promise);
        }
      } catch (error) {
        this.logger.error('Error in event handler', { 
          eventType, 
          error: error.message, 
          stack: error.stack 
        });
      }
    }
    
    await Promise.all(promises);
  }
  
  /**
   * Shut down the event bus
   * 
   * @returns {Promise<void>} Promise that resolves when the event bus has been shut down
   */
  async shutdown() {
    this.handlers.clear();
    this.logger.debug('Event bus shut down');
  }
}

/**
 * Create an event bus
 * 
 * @param {Object} config - Event bus configuration
 * @param {Logger} logger - Logger instance
 * @returns {Object} Event bus
 */
function createEventBus(config = {}, logger) {
  const { driver = 'memory' } = config;
  
  if (driver === 'memory') {
    return new MemoryEventBus(logger);
  }
  
  // In a real implementation, we would support other event bus
  // drivers like RabbitMQ, Kafka, etc.
  
  throw new Error(`Unsupported event bus driver: ${driver}`);
}

module.exports = { createEventBus };