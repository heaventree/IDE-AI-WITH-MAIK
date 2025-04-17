/**
 * Value Object
 * 
 * Base class for value objects.
 * Value objects are immutable and equality is determined by comparing all properties.
 */

/**
 * Value Object
 * 
 * Base class for value objects.
 */
class ValueObject {
  /**
   * Check if this value object is equal to another value object
   * 
   * @param {ValueObject} valueObject - Value object to compare with
   * @returns {boolean} True if value objects are equal
   */
  equals(valueObject) {
    if (valueObject === null || valueObject === undefined) {
      return false;
    }
    
    if (this === valueObject) {
      return true;
    }
    
    if (this.constructor.name !== valueObject.constructor.name) {
      return false;
    }
    
    // Compare properties
    const thisProps = Object.getOwnPropertyNames(this);
    const otherProps = Object.getOwnPropertyNames(valueObject);
    
    if (thisProps.length !== otherProps.length) {
      return false;
    }
    
    // All properties must be equal
    for (const prop of thisProps) {
      if (this[prop] !== valueObject[prop]) {
        // Handle case where property is an object (including arrays)
        if (typeof this[prop] === 'object' && typeof valueObject[prop] === 'object') {
          if (JSON.stringify(this[prop]) !== JSON.stringify(valueObject[prop])) {
            return false;
          }
        } else {
          return false;
        }
      }
    }
    
    return true;
  }
  
  /**
   * Get a copy of this value object
   * 
   * @returns {ValueObject} Copy of this value object
   */
  clone() {
    return Object.assign(Object.create(Object.getPrototypeOf(this)), this);
  }
  
  /**
   * Convert value object to a plain object
   * 
   * @returns {Object} Plain object representation of this value object
   */
  toObject() {
    const obj = {};
    const props = Object.getOwnPropertyNames(this);
    
    for (const prop of props) {
      // Skip properties that start with underscore
      if (prop.startsWith('_')) {
        continue;
      }
      
      obj[prop] = this[prop];
    }
    
    return obj;
  }
}

module.exports = ValueObject;