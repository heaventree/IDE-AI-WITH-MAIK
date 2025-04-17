/**
 * In-Memory Domain Event Publisher Implementation
 * 
 * Domain event publisher implementation that stores events in memory.
 */

const DomainEventPublisher = require('../../core/domain/events/DomainEventPublisher');

/**
 * In-memory domain event publisher
 */
class InMemoryDomainEventPublisher extends DomainEventPublisher {
  /**
   * Create a new InMemoryDomainEventPublisher
   * 
   * @param {Logger} logger - Logger instance
   */
  constructor(logger) {
    super();
    
    /**
     * Event subscribers by event name
     * @type {Map<string, Map<string, Function>>}
     */
    this.subscribers = new Map();
    
    /**
     * Logger instance
     * @type {Logger}
     */
    this.logger = logger;
  }
  
  /**
   * Publish a domain event
   * 
   * @param {DomainEvent} event - Event to publish
   * @returns {Promise<void>}
   */
  async publish(event) {
    const eventName = event.eventName;
    
    this.logger.debug('Publishing event', { 
      eventName, 
      eventId: event.eventId, 
      aggregateId: event.aggregateId 
    });
    
    if (!this.subscribers.has(eventName)) {
      this.logger.debug('No subscribers for event', { eventName });
      return;
    }
    
    const eventSubscribers = this.subscribers.get(eventName);
    
    // Execute handlers asynchronously
    const executionPromises = [];
    
    for (const [subscriptionId, handler] of eventSubscribers.entries()) {
      try {
        const handlerPromise = Promise.resolve().then(() => handler(event))
          .catch(error => {
            this.logger.error('Error in event handler', { 
              error: error.message, 
              stack: error.stack,
              eventName,
              subscriptionId 
            });
          });
        
        executionPromises.push(handlerPromise);
      } catch (error) {
        this.logger.error('Error executing event handler', { 
          error: error.message, 
          stack: error.stack,
          eventName,
          subscriptionId 
        });
      }
    }
    
    await Promise.all(executionPromises);
    
    this.logger.debug('Event published successfully', { 
      eventName, 
      subscriberCount: eventSubscribers.size 
    });
  }
  
  /**
   * Subscribe to a domain event
   * 
   * @param {string} eventName - Name of the event to subscribe to
   * @param {Function} handler - Event handler function
   * @returns {string} Subscription ID
   */
  subscribe(eventName, handler) {
    if (typeof handler !== 'function') {
      throw new Error('Event handler must be a function');
    }
    
    if (!this.subscribers.has(eventName)) {
      this.subscribers.set(eventName, new Map());
    }
    
    const subscriptionId = this._generateSubscriptionId();
    this.subscribers.get(eventName).set(subscriptionId, handler);
    
    this.logger.debug('Subscribed to event', { eventName, subscriptionId });
    
    return subscriptionId;
  }
  
  /**
   * Unsubscribe from a domain event
   * 
   * @param {string} subscriptionId - Subscription ID
   * @returns {boolean} True if the subscription was found and removed
   */
  unsubscribe(subscriptionId) {
    let found = false;
    
    for (const [eventName, subscribers] of this.subscribers.entries()) {
      if (subscribers.has(subscriptionId)) {
        subscribers.delete(subscriptionId);
        found = true;
        
        this.logger.debug('Unsubscribed from event', { eventName, subscriptionId });
        
        // Clean up empty subscriber maps
        if (subscribers.size === 0) {
          this.subscribers.delete(eventName);
        }
        
        break;
      }
    }
    
    return found;
  }
  
  /**
   * Check if there are subscribers for an event
   * 
   * @param {string} eventName - Name of the event
   * @returns {boolean} True if there are subscribers
   */
  hasSubscribers(eventName) {
    return this.subscribers.has(eventName) && this.subscribers.get(eventName).size > 0;
  }
  
  /**
   * Get the number of subscribers for an event
   * 
   * @param {string} eventName - Name of the event
   * @returns {number} Number of subscribers
   */
  getSubscriberCount(eventName) {
    if (!this.subscribers.has(eventName)) {
      return 0;
    }
    
    return this.subscribers.get(eventName).size;
  }
  
  /**
   * Clear all subscriptions
   */
  clearSubscriptions() {
    this.subscribers.clear();
    this.logger.debug('All event subscriptions cleared');
  }
  
  /**
   * Generate a unique subscription ID
   * 
   * @returns {string} Subscription ID
   * @private
   */
  _generateSubscriptionId() {
    return 'sub_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36);
  }
}

module.exports = InMemoryDomainEventPublisher;