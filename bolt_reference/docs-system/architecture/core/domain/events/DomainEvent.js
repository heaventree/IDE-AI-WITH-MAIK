/**
 * Domain Event Base Class
 * 
 * Base class for all domain events.
 */

/**
 * Represents a domain event
 */
class DomainEvent {
  /**
   * Create a new DomainEvent
   * 
   * @param {string} aggregateId - ID of the aggregate that generated the event
   * @param {string} eventType - Type of event
   * @param {Object} data - Event data
   * @param {Date} [timestamp=new Date()] - Event timestamp
   */
  constructor(aggregateId, eventType, data, timestamp = new Date()) {
    /**
     * Event ID
     * @type {string}
     */
    this.eventId = this._generateId();
    
    /**
     * ID of the aggregate that generated the event
     * @type {string}
     */
    this.aggregateId = aggregateId;
    
    /**
     * Type of event
     * @type {string}
     */
    this.eventType = eventType;
    
    /**
     * Event data
     * @type {Object}
     */
    this.data = { ...data };
    
    /**
     * Event timestamp
     * @type {Date}
     */
    this.timestamp = timestamp;
  }
  
  /**
   * Generate a unique ID
   * 
   * @returns {string} Unique ID
   * @private
   */
  _generateId() {
    return Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36);
  }
  
  /**
   * Create a JSON representation of this event
   * 
   * @returns {Object} JSON representation
   */
  toJSON() {
    return {
      eventId: this.eventId,
      aggregateId: this.aggregateId,
      eventType: this.eventType,
      data: this.data,
      timestamp: this.timestamp
    };
  }
  
  /**
   * Get a serializable version of this event
   * 
   * @returns {Object} Serializable event
   */
  serialize() {
    return {
      ...this.toJSON(),
      timestamp: this.timestamp.toISOString()
    };
  }
  
  /**
   * Create an event from a serialized representation
   * 
   * @param {Object} serialized - Serialized event
   * @returns {DomainEvent} Domain event
   * @static
   */
  static deserialize(serialized) {
    const event = new DomainEvent(
      serialized.aggregateId,
      serialized.eventType,
      serialized.data,
      new Date(serialized.timestamp)
    );
    
    event.eventId = serialized.eventId;
    
    return event;
  }
}

module.exports = DomainEvent;