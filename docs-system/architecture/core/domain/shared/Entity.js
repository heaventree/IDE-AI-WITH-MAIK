/**
 * Entity
 * 
 * Base class for domain entities.
 */

/**
 * Entity
 * 
 * Base class for domain entities.
 */
class Entity {
  /**
   * Create a new entity
   * 
   * @param {string} id - Entity ID
   */
  constructor(id) {
    this._id = id;
  }
  
  /**
   * Get entity ID
   * 
   * @returns {string} Entity ID
   */
  get id() {
    return this._id;
  }
  
  /**
   * Check if this entity is equal to another entity
   * 
   * @param {Entity} entity - Entity to compare with
   * @returns {boolean} True if entities are equal
   */
  equals(entity) {
    if (entity === null || entity === undefined) {
      return false;
    }
    
    if (this === entity) {
      return true;
    }
    
    if (!(entity instanceof Entity)) {
      return false;
    }
    
    return this._id === entity._id;
  }
}

module.exports = Entity;