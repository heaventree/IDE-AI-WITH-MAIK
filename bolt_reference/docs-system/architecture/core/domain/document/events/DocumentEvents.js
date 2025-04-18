/**
 * Document Domain Events
 * 
 * This file contains all domain events related to documents.
 */

const DomainEvent = require('../../shared/DomainEvent');

/**
 * Event raised when a document is created
 */
class DocumentCreatedEvent extends DomainEvent {
  /**
   * Create a new DocumentCreatedEvent
   * 
   * @param {Object} props - Event properties
   * @param {string} [props.id] - Optional event ID
   * @param {Date} [props.occurredOn] - Optional timestamp when the event occurred
   * @param {string} props.documentId - ID of the created document
   * @param {string} props.userId - ID of the user who created the document
   */
  constructor(props) {
    super(props);
    this.documentId = props.documentId;
    this.userId = props.userId;
  }
  
  /**
   * Get the event type
   * 
   * @returns {string} Event type
   */
  static get eventType() {
    return 'document.created';
  }
  
  /**
   * Serialize the event to a plain object
   * 
   * @returns {Object} Serialized event
   */
  serialize() {
    return {
      ...super.serialize(),
      documentId: this.documentId,
      userId: this.userId
    };
  }
  
  /**
   * Deserialize an event from a plain object
   * 
   * @param {Object} data - Serialized event data
   * @returns {DocumentCreatedEvent} Deserialized event
   */
  static deserialize(data) {
    return new DocumentCreatedEvent({
      id: data.id,
      occurredOn: new Date(data.occurredOn),
      documentId: data.documentId,
      userId: data.userId
    });
  }
}

/**
 * Event raised when a document is updated
 */
class DocumentUpdatedEvent extends DomainEvent {
  /**
   * Create a new DocumentUpdatedEvent
   * 
   * @param {Object} props - Event properties
   * @param {string} [props.id] - Optional event ID
   * @param {Date} [props.occurredOn] - Optional timestamp when the event occurred
   * @param {string} props.documentId - ID of the updated document
   * @param {number} [props.versionNumber] - Version number
   * @param {string} props.userId - ID of the user who updated the document
   */
  constructor(props) {
    super(props);
    this.documentId = props.documentId;
    this.versionNumber = props.versionNumber;
    this.userId = props.userId;
  }
  
  /**
   * Get the event type
   * 
   * @returns {string} Event type
   */
  static get eventType() {
    return 'document.updated';
  }
  
  /**
   * Serialize the event to a plain object
   * 
   * @returns {Object} Serialized event
   */
  serialize() {
    return {
      ...super.serialize(),
      documentId: this.documentId,
      versionNumber: this.versionNumber,
      userId: this.userId
    };
  }
  
  /**
   * Deserialize an event from a plain object
   * 
   * @param {Object} data - Serialized event data
   * @returns {DocumentUpdatedEvent} Deserialized event
   */
  static deserialize(data) {
    return new DocumentUpdatedEvent({
      id: data.id,
      occurredOn: new Date(data.occurredOn),
      documentId: data.documentId,
      versionNumber: data.versionNumber,
      userId: data.userId
    });
  }
}

/**
 * Event raised when a document is published
 */
class DocumentPublishedEvent extends DomainEvent {
  /**
   * Create a new DocumentPublishedEvent
   * 
   * @param {Object} props - Event properties
   * @param {string} [props.id] - Optional event ID
   * @param {Date} [props.occurredOn] - Optional timestamp when the event occurred
   * @param {string} props.documentId - ID of the published document
   * @param {string} props.userId - ID of the user who published the document
   */
  constructor(props) {
    super(props);
    this.documentId = props.documentId;
    this.userId = props.userId;
  }
  
  /**
   * Get the event type
   * 
   * @returns {string} Event type
   */
  static get eventType() {
    return 'document.published';
  }
  
  /**
   * Serialize the event to a plain object
   * 
   * @returns {Object} Serialized event
   */
  serialize() {
    return {
      ...super.serialize(),
      documentId: this.documentId,
      userId: this.userId
    };
  }
  
  /**
   * Deserialize an event from a plain object
   * 
   * @param {Object} data - Serialized event data
   * @returns {DocumentPublishedEvent} Deserialized event
   */
  static deserialize(data) {
    return new DocumentPublishedEvent({
      id: data.id,
      occurredOn: new Date(data.occurredOn),
      documentId: data.documentId,
      userId: data.userId
    });
  }
}

/**
 * Event raised when a document is archived
 */
class DocumentArchivedEvent extends DomainEvent {
  /**
   * Create a new DocumentArchivedEvent
   * 
   * @param {Object} props - Event properties
   * @param {string} [props.id] - Optional event ID
   * @param {Date} [props.occurredOn] - Optional timestamp when the event occurred
   * @param {string} props.documentId - ID of the archived document
   * @param {string} props.userId - ID of the user who archived the document
   * @param {string} [props.reason] - Reason for archiving
   */
  constructor(props) {
    super(props);
    this.documentId = props.documentId;
    this.userId = props.userId;
    this.reason = props.reason;
  }
  
  /**
   * Get the event type
   * 
   * @returns {string} Event type
   */
  static get eventType() {
    return 'document.archived';
  }
  
  /**
   * Serialize the event to a plain object
   * 
   * @returns {Object} Serialized event
   */
  serialize() {
    return {
      ...super.serialize(),
      documentId: this.documentId,
      userId: this.userId,
      reason: this.reason
    };
  }
  
  /**
   * Deserialize an event from a plain object
   * 
   * @param {Object} data - Serialized event data
   * @returns {DocumentArchivedEvent} Deserialized event
   */
  static deserialize(data) {
    return new DocumentArchivedEvent({
      id: data.id,
      occurredOn: new Date(data.occurredOn),
      documentId: data.documentId,
      userId: data.userId,
      reason: data.reason
    });
  }
}

/**
 * Event raised when a document is reviewed
 */
class DocumentReviewedEvent extends DomainEvent {
  /**
   * Create a new DocumentReviewedEvent
   * 
   * @param {Object} props - Event properties
   * @param {string} [props.id] - Optional event ID
   * @param {Date} [props.occurredOn] - Optional timestamp when the event occurred
   * @param {string} props.documentId - ID of the reviewed document
   * @param {string} props.userId - ID of the reviewer
   * @param {string} props.comments - Review comments
   */
  constructor(props) {
    super(props);
    this.documentId = props.documentId;
    this.userId = props.userId;
    this.comments = props.comments;
  }
  
  /**
   * Get the event type
   * 
   * @returns {string} Event type
   */
  static get eventType() {
    return 'document.reviewed';
  }
  
  /**
   * Serialize the event to a plain object
   * 
   * @returns {Object} Serialized event
   */
  serialize() {
    return {
      ...super.serialize(),
      documentId: this.documentId,
      userId: this.userId,
      comments: this.comments
    };
  }
  
  /**
   * Deserialize an event from a plain object
   * 
   * @param {Object} data - Serialized event data
   * @returns {DocumentReviewedEvent} Deserialized event
   */
  static deserialize(data) {
    return new DocumentReviewedEvent({
      id: data.id,
      occurredOn: new Date(data.occurredOn),
      documentId: data.documentId,
      userId: data.userId,
      comments: data.comments
    });
  }
}

/**
 * Event raised when a document is approved
 */
class DocumentApprovedEvent extends DomainEvent {
  /**
   * Create a new DocumentApprovedEvent
   * 
   * @param {Object} props - Event properties
   * @param {string} [props.id] - Optional event ID
   * @param {Date} [props.occurredOn] - Optional timestamp when the event occurred
   * @param {string} props.documentId - ID of the approved document
   * @param {string} props.userId - ID of the approver
   * @param {string} [props.comments] - Approval comments
   */
  constructor(props) {
    super(props);
    this.documentId = props.documentId;
    this.userId = props.userId;
    this.comments = props.comments;
  }
  
  /**
   * Get the event type
   * 
   * @returns {string} Event type
   */
  static get eventType() {
    return 'document.approved';
  }
  
  /**
   * Serialize the event to a plain object
   * 
   * @returns {Object} Serialized event
   */
  serialize() {
    return {
      ...super.serialize(),
      documentId: this.documentId,
      userId: this.userId,
      comments: this.comments
    };
  }
  
  /**
   * Deserialize an event from a plain object
   * 
   * @param {Object} data - Serialized event data
   * @returns {DocumentApprovedEvent} Deserialized event
   */
  static deserialize(data) {
    return new DocumentApprovedEvent({
      id: data.id,
      occurredOn: new Date(data.occurredOn),
      documentId: data.documentId,
      userId: data.userId,
      comments: data.comments
    });
  }
}

/**
 * Event raised when a document is rejected
 */
class DocumentRejectedEvent extends DomainEvent {
  /**
   * Create a new DocumentRejectedEvent
   * 
   * @param {Object} props - Event properties
   * @param {string} [props.id] - Optional event ID
   * @param {Date} [props.occurredOn] - Optional timestamp when the event occurred
   * @param {string} props.documentId - ID of the rejected document
   * @param {string} props.userId - ID of the user who rejected the document
   * @param {string} props.reason - Reason for rejection
   */
  constructor(props) {
    super(props);
    this.documentId = props.documentId;
    this.userId = props.userId;
    this.reason = props.reason;
  }
  
  /**
   * Get the event type
   * 
   * @returns {string} Event type
   */
  static get eventType() {
    return 'document.rejected';
  }
  
  /**
   * Serialize the event to a plain object
   * 
   * @returns {Object} Serialized event
   */
  serialize() {
    return {
      ...super.serialize(),
      documentId: this.documentId,
      userId: this.userId,
      reason: this.reason
    };
  }
  
  /**
   * Deserialize an event from a plain object
   * 
   * @param {Object} data - Serialized event data
   * @returns {DocumentRejectedEvent} Deserialized event
   */
  static deserialize(data) {
    return new DocumentRejectedEvent({
      id: data.id,
      occurredOn: new Date(data.occurredOn),
      documentId: data.documentId,
      userId: data.userId,
      reason: data.reason
    });
  }
}

module.exports = {
  DocumentCreatedEvent,
  DocumentUpdatedEvent,
  DocumentPublishedEvent,
  DocumentArchivedEvent,
  DocumentReviewedEvent,
  DocumentApprovedEvent,
  DocumentRejectedEvent
};