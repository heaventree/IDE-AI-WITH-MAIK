/**
 * Aggregate Root
 * 
 * Base class for aggregate roots.
 */

const Entity = require('./Entity');

/**
 * Aggregate Root
 * 
 * Base class for aggregate roots.
 * @extends Entity
 */
class AggregateRoot extends Entity {
  constructor(id) {
    super(id);
    this._domainEvents = [];
  }
  
  /**
   * Get domain events
   * 
   * @returns {Array} Domain events
   */
  getDomainEvents() {
    return [...this._domainEvents];
  }
  
  /**
   * Clear domain events
   */
  clearEvents() {
    this._domainEvents = [];
  }
  
  /**
   * Add domain event
   * 
   * @param {DomainEvent} domainEvent - Domain event
   */
  addDomainEvent(domainEvent) {
    this._domainEvents.push(domainEvent);
  }
}

module.exports = AggregateRoot;