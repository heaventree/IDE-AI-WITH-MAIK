/**
 * Domain Event Publisher
 * 
 * Publishes domain events to the event bus.
 */

/**
 * Publishes domain events
 */
class DomainEventPublisher {
  /**
   * Create a new DomainEventPublisher
   * 
   * @param {EventBus} eventBus - Event bus
   * @param {Logger} logger - Logger
   */
  constructor(eventBus, logger) {
    /**
     * Event bus
     * @type {EventBus}
     */
    this.eventBus = eventBus;
    
    /**
     * Logger
     * @type {Logger}
     */
    this.logger = logger;
  }
  
  /**
   * Publish a domain event
   * 
   * @param {DomainEvent} event - Event to publish
   * @returns {Promise<void>} Promise that resolves when the event is published
   */
  async publish(event) {
    try {
      this.logger.debug('Publishing domain event', {
        eventId: event.eventId,
        aggregateId: event.aggregateId,
        eventType: event.eventType
      });
      
      await this.eventBus.publish(event.eventType, event.serialize());
      
      this.logger.debug('Domain event published', {
        eventId: event.eventId,
        eventType: event.eventType
      });
    } catch (error) {
      this.logger.error('Failed to publish domain event', {
        eventId: event.eventId,
        eventType: event.eventType,
        error: error.message,
        stack: error.stack
      });
      
      throw error;
    }
  }
  
  /**
   * Publish multiple domain events
   * 
   * @param {Array<DomainEvent>} events - Events to publish
   * @returns {Promise<void>} Promise that resolves when all events are published
   */
  async publishAll(events) {
    if (!events || events.length === 0) {
      return;
    }
    
    this.logger.debug('Publishing multiple domain events', {
      count: events.length
    });
    
    for (const event of events) {
      await this.publish(event);
    }
  }
  
  /**
   * Publish events from an aggregate
   * 
   * @param {AggregateRoot} aggregate - Aggregate with events
   * @returns {Promise<void>} Promise that resolves when all events are published
   */
  async publishFromAggregate(aggregate) {
    if (!aggregate.hasUncommittedEvents()) {
      return;
    }
    
    const events = aggregate.getUncommittedEvents();
    
    try {
      await this.publishAll(events);
      aggregate.clearEvents();
    } catch (error) {
      this.logger.error('Failed to publish events from aggregate', {
        aggregateId: aggregate.id,
        aggregateType: aggregate.constructor.name,
        error: error.message,
        stack: error.stack
      });
      
      throw error;
    }
  }
}

module.exports = { DomainEventPublisher };