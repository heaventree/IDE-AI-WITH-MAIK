/**
 * Plugin Loader System
 * 
 * This module handles the loading, registration, and management of plugins for the Documentation System.
 * It provides a standardized interface for plugins to integrate with the core system.
 */

const fs = require('fs');
const path = require('path');

/**
 * Plugin Loader Class
 */
class PluginLoader {
  /**
   * Create a new PluginLoader instance
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    this.options = {
      pluginsDir: path.join(__dirname),
      ...options
    };
    
    // Registered plugins by type and name
    this.plugins = {
      themes: {},
      processors: {},
      integrations: {},
      workflows: {}
    };
    
    // Registered hooks by target
    this.hooks = {};
    
    // Registered extensions by point
    this.extensions = {};
    
    // Active theme
    this.activeTheme = null;
    
    // Plugin system API
    this.pluginAPI = this.createPluginAPI();
  }
  
  /**
   * Initialize the plugin system
   * @returns {Promise<Object>} Result of initialization
   */
  async initialize() {
    console.log('Initializing plugin system');
    
    try {
      // Scan for available plugins
      await this.scanPlugins();
      
      // Load theme registry
      await this.loadThemeRegistry();
      
      // Set default theme if none is active
      if (!this.activeTheme) {
        await this.activateDefaultTheme();
      }
      
      return {
        success: true,
        plugins: this.getPluginSummary()
      };
    } catch (error) {
      console.error('Error initializing plugin system:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Scan plugin directories to find available plugins
   * @returns {Promise<void>}
   */
  async scanPlugins() {
    console.log('Scanning for plugins in:', this.options.pluginsDir);
    
    const pluginTypes = ['themes', 'processors', 'integrations', 'workflows'];
    
    for (const type of pluginTypes) {
      const typeDir = path.join(this.options.pluginsDir, type);
      
      if (!fs.existsSync(typeDir)) {
        console.log(`Plugin directory not found: ${typeDir}`);
        continue;
      }
      
      const pluginDirs = fs.readdirSync(typeDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
      
      for (const pluginDir of pluginDirs) {
        const manifestPath = path.join(typeDir, pluginDir, 'manifest.json');
        
        if (fs.existsSync(manifestPath)) {
          try {
            const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
            this.registerPlugin(type, pluginDir, manifest);
          } catch (error) {
            console.error(`Error loading plugin manifest: ${manifestPath}`, error);
          }
        }
      }
    }
  }
  
  /**
   * Load the theme registry
   * @returns {Promise<void>}
   */
  async loadThemeRegistry() {
    const registryPath = path.join(this.options.pluginsDir, 'themes', 'theme-registry.json');
    
    if (fs.existsSync(registryPath)) {
      try {
        this.themeRegistry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
        console.log(`Loaded theme registry with ${this.themeRegistry.themes.length} themes`);
      } catch (error) {
        console.error('Error loading theme registry:', error);
        this.themeRegistry = { themes: [] };
      }
    } else {
      console.log('Theme registry not found, creating empty registry');
      this.themeRegistry = { themes: [] };
    }
  }
  
  /**
   * Activate the default theme
   * @returns {Promise<void>}
   */
  async activateDefaultTheme() {
    if (this.themeRegistry.themes.length > 0) {
      const defaultTheme = this.themeRegistry.themes.find(theme => theme.id === 'default') || 
                           this.themeRegistry.themes[0];
      
      await this.activateTheme(defaultTheme.id);
    }
  }
  
  /**
   * Register a plugin in the system
   * @param {string} type - Plugin type
   * @param {string} directory - Plugin directory name
   * @param {Object} manifest - Plugin manifest
   */
  registerPlugin(type, directory, manifest) {
    if (!manifest.name) {
      console.error(`Invalid plugin manifest: missing name property`);
      return;
    }
    
    console.log(`Registering plugin: ${manifest.name} (${type})`);
    
    // Store plugin info
    this.plugins[type][manifest.name] = {
      directory,
      manifest,
      status: 'registered',
      hooks: {},
      extensions: {}
    };
    
    // Register hooks defined in manifest
    if (manifest.hooks && Array.isArray(manifest.hooks)) {
      for (const hook of manifest.hooks) {
        this.registerPluginHook(manifest.name, hook);
      }
    }
  }
  
  /**
   * Register a hook from a plugin
   * @param {string} pluginName - Name of the plugin
   * @param {Object} hook - Hook definition
   */
  registerPluginHook(pluginName, hook) {
    if (!hook.id || !hook.target || !hook.type) {
      console.error(`Invalid hook definition in plugin ${pluginName}:`, hook);
      return;
    }
    
    if (!this.hooks[hook.target]) {
      this.hooks[hook.target] = [];
    }
    
    this.hooks[hook.target].push({
      pluginName,
      hook
    });
    
    console.log(`Registered hook: ${hook.id} targeting ${hook.target} from ${pluginName}`);
  }
  
  /**
   * Activate a theme by ID
   * @param {string} themeId - ID of the theme to activate
   * @returns {Promise<Object>} Result of theme activation
   */
  async activateTheme(themeId) {
    try {
      console.log(`Attempting to activate theme: ${themeId}`);
      
      const themeInfo = this.themeRegistry.themes.find(theme => theme.id === themeId);
      
      if (!themeInfo) {
        throw new Error(`Theme not found: ${themeId}`);
      }
      
      const themeName = Object.keys(this.plugins.themes).find(
        name => this.plugins.themes[name].directory === themeInfo.path
      );
      
      if (!themeName) {
        throw new Error(`Theme plugin not found: ${themeId} (${themeInfo.path})`);
      }
      
      const theme = this.plugins.themes[themeName];
      
      // Deactivate current theme if any
      try {
        if (this.activeTheme) {
          console.log(`Currently active theme: ${this.activeTheme}`);
          
          // Find the theme name that corresponds to the active theme ID
          const activeThemeInfo = this.themeRegistry.themes.find(theme => theme.id === this.activeTheme);
          if (activeThemeInfo) {
            const activeThemeName = Object.keys(this.plugins.themes).find(
              name => this.plugins.themes[name].directory === activeThemeInfo.path
            );
            
            if (activeThemeName) {
              await this.deactivateTheme(activeThemeName);
            } else {
              console.warn(`Could not find theme plugin for active theme: ${this.activeTheme}`);
              // Just clear the active theme without deactivating
              this.activeTheme = null;
            }
          } else {
            console.warn(`Active theme not found in registry: ${this.activeTheme}`);
            // Just clear the active theme without deactivating
            this.activeTheme = null;
          }
        }
      } catch (deactivateError) {
        console.error('Error deactivating current theme:', deactivateError);
        // Continue with activation despite deactivation error
      }
      
      console.log(`Activating theme: ${themeName}`);
      
      // Update theme status
      theme.status = 'active';
      this.activeTheme = themeId;
      
      return {
        success: true,
        theme: themeInfo
      };
    } catch (error) {
      console.error('Error in activateTheme:', error);
      throw error;
    }
  }
  
  /**
   * Deactivate a theme
   * @param {string} themeName - Name of the theme to deactivate
   * @returns {Promise<void>}
   */
  async deactivateTheme(themeName) {
    try {
      if (!this.plugins.themes[themeName]) {
        console.warn(`Theme not found during deactivation: ${themeName}`);
        return; // Safely return instead of throwing an error
      }
      
      console.log(`Deactivating theme: ${themeName}`);
      
      // Update theme status
      this.plugins.themes[themeName].status = 'registered';
      
      // Clear active theme only if it matches the theme we're deactivating
      const themeInfo = this.themeRegistry.themes.find(
        theme => theme.path === this.plugins.themes[themeName].directory
      );
      
      if (themeInfo && this.activeTheme === themeInfo.id) {
        this.activeTheme = null;
      }
    } catch (error) {
      console.error(`Error deactivating theme ${themeName}:`, error);
      // We'll swallow this error to prevent it from blocking theme activation
    }
  }
  
  /**
   * Apply a hook with content
   * @param {string} target - Hook target identifier
   * @param {*} defaultContent - Default content if no hook is registered
   * @param {*} ...args - Additional arguments to pass to hook implementation
   * @returns {*} Resulting content after applying hooks
   */
  applyHook(target, defaultContent, ...args) {
    if (!this.hooks[target] || this.hooks[target].length === 0) {
      return defaultContent;
    }
    
    let result = defaultContent;
    
    // Find hooks for the active theme
    const themeHooks = this.hooks[target].filter(
      h => this.activeTheme && h.pluginName === this.activeTheme
    );
    
    if (themeHooks.length > 0) {
      // Apply only theme hooks (theme always takes precedence)
      for (const { hook } of themeHooks) {
        try {
          result = this.executeHook(hook, result, ...args);
        } catch (error) {
          console.error(`Error executing hook ${hook.id} for target ${target}:`, error);
        }
      }
    } else {
      // If no theme hooks, apply all other hooks in registration order
      for (const { hook } of this.hooks[target]) {
        try {
          result = this.executeHook(hook, result, ...args);
        } catch (error) {
          console.error(`Error executing hook ${hook.id} for target ${target}:`, error);
        }
      }
    }
    
    return result;
  }
  
  /**
   * Execute a hook implementation
   * @param {Object} hook - Hook definition
   * @param {*} content - Content to transform
   * @param {*} ...args - Additional arguments
   * @returns {*} Transformed content
   */
  executeHook(hook, content, ...args) {
    // Implementation will depend on hook type
    // For now, this is a placeholder
    return content;
  }
  
  /**
   * Get extensions for a specific extension point
   * @param {string} pointId - Extension point identifier
   * @returns {Array} Array of registered extensions
   */
  getExtensions(pointId) {
    if (!this.extensions[pointId]) {
      return [];
    }
    
    return this.extensions[pointId].map(ext => ext.content);
  }
  
  /**
   * Create the plugin API interface
   * @returns {Object} Plugin API interface
   */
  createPluginAPI() {
    return {
      // Hook registration
      registerHook: (pluginName, hookId, target, implementation) => {
        this.registerHook(pluginName, hookId, target, implementation);
      },
      
      // Hook application
      applyHook: (target, defaultContent, ...args) => {
        return this.applyHook(target, defaultContent, ...args);
      },
      
      // Extension registration
      registerExtension: (pluginName, pointId, content) => {
        this.registerExtension(pluginName, pointId, content);
      },
      
      // Extension retrieval
      getExtensions: (pointId) => {
        return this.getExtensions(pointId);
      },
      
      // Resource handling
      getResource: (pluginName, resourcePath) => {
        return this.getPluginResource(pluginName, resourcePath);
      },
      
      // Configuration
      getConfig: (pluginName, optionId) => {
        return this.getPluginConfig(pluginName, optionId);
      },
      
      // Theme management
      getActiveTheme: () => {
        return this.getActiveTheme();
      },
      
      activateTheme: (themeId) => {
        return this.activateTheme(themeId);
      },
      
      // Logging
      log: (pluginName, level, message) => {
        this.logPluginMessage(pluginName, level, message);
      }
    };
  }
  
  /**
   * Get plugin API for a specific plugin
   * @param {string} pluginName - Name of the plugin
   * @returns {Object} Scoped plugin API
   */
  getPluginAPI(pluginName) {
    const api = { ...this.pluginAPI };
    
    // Scope methods to this plugin
    api.registerHook = (hookId, target, implementation) => {
      return this.pluginAPI.registerHook(pluginName, hookId, target, implementation);
    };
    
    api.registerExtension = (pointId, content) => {
      return this.pluginAPI.registerExtension(pluginName, pointId, content);
    };
    
    api.getResource = (resourcePath) => {
      return this.pluginAPI.getResource(pluginName, resourcePath);
    };
    
    api.getConfig = (optionId) => {
      return this.pluginAPI.getConfig(pluginName, optionId);
    };
    
    api.log = (level, message) => {
      return this.pluginAPI.log(pluginName, level, message);
    };
    
    return api;
  }
  
  /**
   * Register a hook implementation
   * @param {string} pluginName - Name of the plugin
   * @param {string} hookId - Hook identifier
   * @param {string} target - Hook target
   * @param {Function} implementation - Hook implementation
   */
  registerHook(pluginName, hookId, target, implementation) {
    // Verify plugin exists
    const pluginType = this.getPluginType(pluginName);
    if (!pluginType) {
      console.error(`Cannot register hook: plugin ${pluginName} not found`);
      return;
    }
    
    // Store hook implementation
    this.plugins[pluginType][pluginName].hooks[hookId] = {
      target,
      implementation
    };
    
    // Register in global hooks registry
    if (!this.hooks[target]) {
      this.hooks[target] = [];
    }
    
    this.hooks[target].push({
      pluginName,
      hook: {
        id: hookId,
        target,
        type: 'function'
      }
    });
    
    console.log(`Registered dynamic hook: ${hookId} targeting ${target} from ${pluginName}`);
  }
  
  /**
   * Register an extension
   * @param {string} pluginName - Name of the plugin
   * @param {string} pointId - Extension point identifier
   * @param {*} content - Extension content
   */
  registerExtension(pluginName, pointId, content) {
    // Verify plugin exists
    const pluginType = this.getPluginType(pluginName);
    if (!pluginType) {
      console.error(`Cannot register extension: plugin ${pluginName} not found`);
      return;
    }
    
    // Store extension in plugin
    if (!this.plugins[pluginType][pluginName].extensions[pointId]) {
      this.plugins[pluginType][pluginName].extensions[pointId] = [];
    }
    
    this.plugins[pluginType][pluginName].extensions[pointId].push(content);
    
    // Register in global extensions registry
    if (!this.extensions[pointId]) {
      this.extensions[pointId] = [];
    }
    
    this.extensions[pointId].push({
      pluginName,
      content
    });
    
    console.log(`Registered extension for ${pointId} from ${pluginName}`);
  }
  
  /**
   * Get resource path for a plugin
   * @param {string} pluginName - Name of the plugin
   * @param {string} resourcePath - Relative path to resource
   * @returns {string} Absolute path to resource
   */
  getPluginResource(pluginName, resourcePath) {
    const pluginType = this.getPluginType(pluginName);
    if (!pluginType) {
      console.error(`Cannot get resource: plugin ${pluginName} not found`);
      return null;
    }
    
    const pluginDir = this.plugins[pluginType][pluginName].directory;
    return path.join(this.options.pluginsDir, pluginType, pluginDir, resourcePath);
  }
  
  /**
   * Get configuration value for a plugin option
   * @param {string} pluginName - Name of the plugin
   * @param {string} optionId - Option identifier
   * @returns {*} Configuration value
   */
  getPluginConfig(pluginName, optionId) {
    const pluginType = this.getPluginType(pluginName);
    if (!pluginType) {
      console.error(`Cannot get config: plugin ${pluginName} not found`);
      return null;
    }
    
    const plugin = this.plugins[pluginType][pluginName];
    
    // Find option in manifest
    if (plugin.manifest.config && plugin.manifest.config.options) {
      const option = plugin.manifest.config.options.find(opt => opt.id === optionId);
      if (option) {
        // Return actual config value if set, otherwise default
        return plugin.config?.[optionId] ?? option.default;
      }
    }
    
    return null;
  }
  
  /**
   * Get active theme information
   * @returns {Object|null} Active theme info or null if none active
   */
  getActiveTheme() {
    if (!this.activeTheme) {
      return null;
    }
    
    // Find the active theme in the registry
    const activeThemeInfo = this.themeRegistry.themes.find(theme => theme.id === this.activeTheme);
    if (!activeThemeInfo) {
      return null;
    }
    
    return activeThemeInfo;
  }
  
  /**
   * Find which type a plugin belongs to
   * @param {string} pluginName - Name of the plugin
   * @returns {string|null} Plugin type or null if not found
   */
  getPluginType(pluginName) {
    for (const type of Object.keys(this.plugins)) {
      if (this.plugins[type][pluginName]) {
        return type;
      }
    }
    return null;
  }
  
  /**
   * Log a message from a plugin
   * @param {string} pluginName - Name of the plugin
   * @param {string} level - Log level
   * @param {string} message - Log message
   */
  logPluginMessage(pluginName, level, message) {
    const validLevels = ['info', 'warn', 'error', 'debug'];
    const logLevel = validLevels.includes(level) ? level : 'info';
    
    console[logLevel](`[${pluginName}] ${message}`);
  }
  
  /**
   * Get summary of registered plugins
   * @returns {Object} Summary of plugins by type
   */
  getPluginSummary() {
    const summary = {};
    
    for (const type of Object.keys(this.plugins)) {
      summary[type] = Object.keys(this.plugins[type]).map(name => {
        const plugin = this.plugins[type][name];
        return {
          name,
          directory: plugin.directory,
          version: plugin.manifest.version,
          status: plugin.status
        };
      });
    }
    
    return summary;
  }
}

module.exports = PluginLoader;