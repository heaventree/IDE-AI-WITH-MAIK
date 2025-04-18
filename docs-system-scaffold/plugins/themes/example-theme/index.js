/**
 * Example Theme Plugin
 * 
 * This is the main entry point for the example theme plugin.
 * It demonstrates how to register hooks and integrate with the core system.
 */

(function() {
  'use strict';
  
  // Store plugin configuration
  let config = {};
  
  /**
   * Initialize the theme
   * @param {Object} systemConfig - Configuration values from the system
   * @param {Object} pluginAPI - API for interacting with the core system
   */
  function initialize(systemConfig, pluginAPI) {
    console.log('Initializing Example Theme Plugin');
    
    // Store configuration
    config = systemConfig || {};
    
    // Apply CSS variables based on configuration
    applyThemeConfig(config);
    
    // Register hooks
    registerHooks(pluginAPI);
    
    // Register event listeners
    registerEventListeners();
    
    // Add theme class to body
    document.body.classList.add('example-theme');
    
    return {
      name: 'Example Theme',
      version: '1.0.0',
      status: 'active'
    };
  }
  
  /**
   * Apply theme configuration values to CSS variables
   * @param {Object} config - Theme configuration options
   */
  function applyThemeConfig(config) {
    const root = document.documentElement;
    
    // Apply primary color if specified
    if (config.primaryColor) {
      root.style.setProperty('--primary-color', config.primaryColor);
    }
    
    // Apply font family if specified
    if (config.fontFamily) {
      root.style.setProperty('--font-family', config.fontFamily);
    }
    
    // Apply other configuration options as needed
  }
  
  /**
   * Register hooks with the plugin API
   * @param {Object} pluginAPI - API for interacting with the core system
   */
  function registerHooks(pluginAPI) {
    // Register header hook
    pluginAPI.registerHook('system:header', (defaultHeader) => {
      return `
        <header class="example-theme-header">
          <div class="header-brand">
            <img src="${pluginAPI.getResource('assets/logo.svg')}" alt="Logo">
            <span>Documentation System</span>
          </div>
          <div class="header-search">
            <input type="text" placeholder="Search documentation...">
          </div>
          <div class="header-actions">
            <div class="header-action-item">
              <button id="theme-toggle" class="btn btn-outline-primary">
                <i class="fas fa-moon"></i>
              </button>
            </div>
            <div class="header-action-item">
              <button class="btn btn-primary">
                <i class="fas fa-plus"></i> New
              </button>
            </div>
          </div>
        </header>
      `;
    });
    
    // Register navigation hook
    pluginAPI.registerHook('system:navigation', (defaultNavigation) => {
      const sidebarClass = config.useSidebarCollapse ? 'sidebar collapsed' : 'sidebar';
      
      return `
        <div class="${sidebarClass}" id="sidebar">
          <div class="sidebar-heading">
            Documentation
          </div>
          <div class="sidebar-divider"></div>
          <a href="#" class="sidebar-item active">
            <i class="fas fa-home"></i>
            <span>Home</span>
          </a>
          <a href="#" class="sidebar-item">
            <i class="fas fa-book"></i>
            <span>Guides</span>
          </a>
          <a href="#" class="sidebar-item">
            <i class="fas fa-code"></i>
            <span>API Reference</span>
          </a>
          <a href="#" class="sidebar-item">
            <i class="fas fa-puzzle-piece"></i>
            <span>Examples</span>
          </a>
          <div class="sidebar-heading">
            Tools
          </div>
          <div class="sidebar-divider"></div>
          <a href="#" class="sidebar-item">
            <i class="fas fa-tools"></i>
            <span>Settings</span>
          </a>
          <a href="#" class="sidebar-item">
            <i class="fas fa-user"></i>
            <span>Account</span>
          </a>
        </div>
      `;
    });
    
    // Register footer hook
    pluginAPI.registerHook('system:footer', (defaultFooter) => {
      return `
        <footer class="footer">
          <div class="container">
            <p>&copy; 2025 Documentation System. All rights reserved.</p>
            <p>Theme: Example Theme v1.0.0</p>
          </div>
        </footer>
      `;
    });
  }
  
  /**
   * Register event listeners for theme interactivity
   */
  function registerEventListeners() {
    // Listen for theme toggle button clicks
    document.addEventListener('click', (event) => {
      if (event.target.id === 'theme-toggle' || event.target.closest('#theme-toggle')) {
        toggleDarkMode();
      }
    });
    
    // Listen for sidebar toggle
    document.addEventListener('click', (event) => {
      if (event.target.id === 'sidebar-toggle' || event.target.closest('#sidebar-toggle')) {
        toggleSidebar();
      }
    });
    
    // Listen for mobile menu button
    document.addEventListener('click', (event) => {
      if (event.target.id === 'mobile-menu-toggle' || event.target.closest('#mobile-menu-toggle')) {
        toggleMobileMenu();
      }
    });
  }
  
  /**
   * Toggle between light and dark mode
   */
  function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    
    const themeToggleButton = document.getElementById('theme-toggle');
    if (themeToggleButton) {
      const icon = themeToggleButton.querySelector('i');
      if (document.body.classList.contains('dark-mode')) {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
      } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
      }
    }
  }
  
  /**
   * Toggle sidebar expanded/collapsed state
   */
  function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const content = document.querySelector('.content');
    
    if (sidebar) {
      sidebar.classList.toggle('collapsed');
    }
    
    if (content) {
      content.classList.toggle('sidebar-collapsed');
    }
  }
  
  /**
   * Toggle mobile menu for small screens
   */
  function toggleMobileMenu() {
    const sidebar = document.getElementById('sidebar');
    
    if (sidebar) {
      sidebar.classList.toggle('mobile-visible');
    }
  }
  
  // Export the theme API
  return {
    initialize: initialize
  };
})();