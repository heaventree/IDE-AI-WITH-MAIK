/**
 * Domain Event Publisher Interface
 * 
 * Interface for publishing domain events to event handlers.
 * This decouples the domain model from event handling infrastructure.
 */

/**
 * @interface
 */
class DomainEventPublisher {
  /**
   * Publish a domain event
   * 
   * @param {DomainEvent} event - The domain event to publish
   * @returns {Promise<void>}
   */
  async publish(event) {
    throw new Error('Method not implemented');
  }
  
  /**
   * Register an event handler for a specific event type
   * 
   * @param {string} eventType - Type of event to handle
   * @param {Function} handler - Event handler function
   * @returns {void}
   */
  registerHandler(eventType, handler) {
    throw new Error('Method not implemented');
  }
  
  /**
   * Unregister an event handler
   * 
   * @param {string} eventType - Type of event
   * @param {Function} handler - Handler to unregister
   * @returns {void}
   */
  unregisterHandler(eventType, handler) {
    throw new Error('Method not implemented');
  }
  
  /**
   * Clear all handlers for a specific event type
   * 
   * @param {string} eventType - Type of event
   * @returns {void}
   */
  clearHandlers(eventType) {
    throw new Error('Method not implemented');
  }
}

module.exports = DomainEventPublisher;