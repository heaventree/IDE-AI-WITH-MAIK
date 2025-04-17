/**
 * Dependency Injection Container
 * 
 * A simple dependency injection container that supports singletons and factories.
 */

class DependencyContainer {
  /**
   * Create a new DependencyContainer
   */
  constructor() {
    this.dependencies = new Map();
    this.singletons = new Map();
  }
  
  /**
   * Register a dependency
   * 
   * @param {string} name - Name of the dependency
   * @param {*} instance - Instance of the dependency
   */
  register(name, instance) {
    this.dependencies.set(name, { instance, isSingleton: false, factory: null });
  }
  
  /**
   * Register a singleton dependency
   * 
   * @param {string} name - Name of the dependency
   * @param {Function} factory - Factory function that creates the dependency
   */
  registerSingleton(name, factory) {
    this.dependencies.set(name, { instance: null, isSingleton: true, factory });
  }
  
  /**
   * Register a factory for a dependency
   * 
   * @param {string} name - Name of the dependency
   * @param {Function} factory - Factory function that creates the dependency
   */
  registerFactory(name, factory) {
    this.dependencies.set(name, { instance: null, isSingleton: false, factory });
  }
  
  /**
   * Resolve a dependency
   * 
   * @param {string} name - Name of the dependency to resolve
   * @returns {*} Resolved dependency
   */
  resolve(name) {
    const dependency = this.dependencies.get(name);
    
    if (!dependency) {
      throw new Error(`Dependency '${name}' not registered`);
    }
    
    // If it's a direct instance, return it
    if (dependency.instance !== null) {
      return dependency.instance;
    }
    
    // If it's a singleton and already created, return the cached instance
    if (dependency.isSingleton && this.singletons.has(name)) {
      return this.singletons.get(name);
    }
    
    // If it's a factory, create the instance
    if (dependency.factory) {
      const instance = dependency.factory(this);
      
      // If it's a singleton, cache the instance
      if (dependency.isSingleton) {
        this.singletons.set(name, instance);
      }
      
      return instance;
    }
    
    throw new Error(`Unable to resolve dependency '${name}'`);
  }
  
  /**
   * Check if a dependency is registered
   * 
   * @param {string} name - Name of the dependency
   * @returns {boolean} True if the dependency is registered
   */
  has(name) {
    return this.dependencies.has(name);
  }
  
  /**
   * Clear all registered dependencies
   */
  clear() {
    this.dependencies.clear();
    this.singletons.clear();
  }
  
  /**
   * Get all registered dependency names
   * 
   * @returns {Array<string>} List of dependency names
   */
  getRegisteredDependencies() {
    return Array.from(this.dependencies.keys());
  }
}

module.exports = DependencyContainer;