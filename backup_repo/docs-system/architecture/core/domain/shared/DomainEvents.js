/**
 * Domain Events Manager
 * 
 * Singleton class that manages the collection and dispatch of domain events.
 */

class DomainEvents {
  /**
   * Initialize the DomainEvents manager
   */
  static init() {
    this.markedAggregates = [];
    this.isDispatching = false;
    this.eventHandlerMap = {};
  }
  
  /**
   * Mark an aggregate for event dispatching
   * 
   * @param {AggregateRoot} aggregate - Aggregate with pending events
   */
  static markAggregateForDispatch(aggregate) {
    const aggregateFound = this.findMarkedAggregateByID(aggregate.id);

    if (!aggregateFound) {
      this.markedAggregates.push(aggregate);
    }
  }
  
  /**
   * Find a marked aggregate by ID
   * 
   * @param {string} id - Aggregate ID
   * @returns {AggregateRoot|undefined} Found aggregate or undefined
   */
  static findMarkedAggregateByID(id) {
    return this.markedAggregates.find(aggregate => aggregate.id === id);
  }
  
  /**
   * Dispatch all events from marked aggregates
   * 
   * @param {DomainEventPublisher} eventPublisher - Publisher to dispatch events
   */
  static async dispatchEventsForAggregate(eventPublisher) {
    if (this.isDispatching) {
      return;
    }
    
    this.isDispatching = true;
    
    const aggregates = [...this.markedAggregates];
    this.markedAggregates = [];
    
    for (const aggregate of aggregates) {
      const events = [...aggregate.domainEvents];
      aggregate.clearEvents();
      
      for (const event of events) {
        await eventPublisher.publish(event);
      }
    }
    
    this.isDispatching = false;
  }
  
  /**
   * Register a domain event handler
   * 
   * @param {string} eventType - Event type to handle
   * @param {Function} callback - Event handler function
   */
  static register(eventType, callback) {
    if (!this.eventHandlerMap[eventType]) {
      this.eventHandlerMap[eventType] = [];
    }
    
    this.eventHandlerMap[eventType].push(callback);
  }
  
  /**
   * Clear all event handlers
   */
  static clearHandlers() {
    this.eventHandlerMap = {};
  }
  
  /**
   * Clear all marked aggregates
   */
  static clearMarkedAggregates() {
    this.markedAggregates = [];
  }
}

// Initialize the static properties
DomainEvents.init();

module.exports = DomainEvents;