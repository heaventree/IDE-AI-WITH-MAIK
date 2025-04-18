/**
 * Domain Event
 * 
 * Base class for domain events.
 */

/**
 * Domain Event
 * 
 * Base class for domain events.
 */
class DomainEvent {
  /**
   * Create a new domain event
   * 
   * @param {string} aggregateId - ID of the aggregate that raised the event
   */
  constructor(aggregateId) {
    this._aggregateId = aggregateId;
    this._dateOccurred = new Date();
    this._eventId = this._generateEventId();
  }
  
  /**
   * Get aggregate ID
   * 
   * @returns {string} Aggregate ID
   */
  get aggregateId() {
    return this._aggregateId;
  }
  
  /**
   * Get date occurred
   * 
   * @returns {Date} Date occurred
   */
  get dateOccurred() {
    return this._dateOccurred;
  }
  
  /**
   * Get event ID
   * 
   * @returns {string} Event ID
   */
  get eventId() {
    return this._eventId;
  }
  
  /**
   * Get event type
   * 
   * @returns {string} Event type
   */
  get eventType() {
    return this.constructor.name;
  }
  
  /**
   * Generate event ID
   * 
   * @returns {string} Event ID
   * @private
   */
  _generateEventId() {
    // Simple implementation for now - in a real system, we'd use a more robust ID generator
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
  
  /**
   * Convert domain event to a plain object
   * 
   * @returns {Object} Plain object representation of this domain event
   */
  toObject() {
    return {
      eventId: this._eventId,
      eventType: this.eventType,
      aggregateId: this._aggregateId,
      dateOccurred: this._dateOccurred.toISOString(),
      // Child classes should override this method to add their specific properties
    };
  }
}

module.exports = DomainEvent;