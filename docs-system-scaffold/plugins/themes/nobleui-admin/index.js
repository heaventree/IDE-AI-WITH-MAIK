/**
 * NobleUI Admin Theme - Plugin Adapter
 * 
 * This module adapts the NobleUI admin template to work as a plugin for the Documentation System.
 * It wraps the original theme functionality and exposes it through the plugin system API.
 */

(function() {
  'use strict';
  
  // Theme configuration
  let config = {
    layoutMode: 'vertical',
    navbarColor: 'navbar-light',
    sidebarColor: 'sidebar-light',
    sidebarCollapsed: false,
    rtlEnabled: false
  };
  
  // Plugin API reference
  let pluginAPI = null;
  
  // Cached elements
  let bodyElement = null;
  let sidebarElement = null;
  let navbarElement = null;
  
  /**
   * Initialize the NobleUI theme
   * @param {Object} systemConfig - Configuration from the system
   * @param {Object} api - Plugin API instance
   * @returns {Object} Theme initialization status
   */
  function initialize(systemConfig, api) {
    console.log('Initializing NobleUI Admin Theme');
    
    // Store the plugin API
    pluginAPI = api;
    
    // Merge provided config with defaults
    config = { ...config, ...systemConfig };
    
    // Make sure DOM is ready before accessing elements
    if (document.readyState === 'loading') {
      console.log('DOM not yet ready, waiting for DOMContentLoaded event...');
      document.addEventListener('DOMContentLoaded', function() {
        initializeTheme();
      });
    } else {
      // DOM is ready, initialize immediately
      initializeTheme();
    }
    
    return {
      name: 'NobleUI Admin Theme',
      version: '1.0.0',
      status: 'active'
    };
  }
  
  /**
   * Initialize theme once DOM is ready
   */
  function initializeTheme() {
    console.log('DOM ready, initializing NobleUI Admin Theme components');
    
    try {
      // Cache DOM elements safely
      bodyElement = document.body;
      
      // These elements might not exist yet, so handle potential null values
      sidebarElement = document.querySelector('.sidebar');
      navbarElement = document.querySelector('.navbar');
      
      // Apply initial configuration
      applyThemeConfig();
      
      // Register event listeners
      registerEventListeners();
      
      // Register dynamic hooks
      registerDynamicHooks();
      
      // Add theme class to body (this should be safe as document.body always exists)
      if (bodyElement) {
        bodyElement.classList.add('nobleui-theme');
      }
      
      // Initialize NobleUI core features if available
      initializeNobleUICore();
      
      console.log('NobleUI Admin Theme initialized successfully');
    } catch (error) {
      console.error('Error initializing NobleUI Admin Theme:', error);
    }
  }
  
  /**
   * Apply theme configuration
   */
  function applyThemeConfig() {
    // Only proceed if bodyElement is available
    if (!bodyElement) {
      console.warn('Cannot apply theme config: bodyElement is not available');
      return;
    }
    
    try {
      // Apply layout mode
      if (config.layoutMode === 'horizontal') {
        bodyElement.classList.add('layout-horizontal');
        bodyElement.classList.remove('layout-vertical');
      } else {
        bodyElement.classList.add('layout-vertical');
        bodyElement.classList.remove('layout-horizontal');
      }
      
      // Apply navbar color - safely check if element exists
      if (navbarElement) {
        navbarElement.classList.remove('navbar-light', 'navbar-dark');
        navbarElement.classList.add(config.navbarColor);
      }
      
      // Apply sidebar color - safely check if element exists
      if (sidebarElement) {
        sidebarElement.classList.remove('sidebar-light', 'sidebar-dark');
        sidebarElement.classList.add(config.sidebarColor);
      }
      
      // Apply sidebar collapsed state
      if (config.sidebarCollapsed) {
        bodyElement.classList.add('sidebar-folded');
      } else {
        bodyElement.classList.remove('sidebar-folded');
      }
      
      // Apply RTL mode
      if (config.rtlEnabled) {
        bodyElement.setAttribute('dir', 'rtl');
        document.documentElement.setAttribute('dir', 'rtl');
      } else {
        bodyElement.removeAttribute('dir');
        document.documentElement.removeAttribute('dir');
      }
    } catch (error) {
      console.error('Error applying theme configuration:', error);
    }
  }
  
  /**
   * Register event listeners for theme functionality
   */
  function registerEventListeners() {
    // Register click handlers for sidebar toggle
    document.addEventListener('click', function(event) {
      if (event.target.matches('.sidebar-toggler') || event.target.closest('.sidebar-toggler')) {
        toggleSidebar();
      }
      
      if (event.target.matches('[data-bs-toggle="settings-panel"]') || 
          event.target.closest('[data-bs-toggle="settings-panel"]')) {
        toggleSettingsPanel();
      }
      
      if (event.target.matches('.theme-option')) {
        const themeOption = event.target;
        const property = themeOption.getAttribute('data-theme-property');
        const value = themeOption.getAttribute('data-theme-value');
        
        if (property && value) {
          updateThemeConfig(property, value);
        }
      }
    });
    
    // Handle window resize events for responsive adjustments
    window.addEventListener('resize', handleResize);
  }
  
  /**
   * Register dynamic hooks for system integration
   */
  function registerDynamicHooks() {
    // Example: Hook into the content area
    if (pluginAPI) {
      pluginAPI.registerHook('contentWrapper', 'system:content', (defaultContent) => {
        return `<div class="nobleui-content-wrapper">${defaultContent}</div>`;
      });
    }
  }
  
  /**
   * Initialize NobleUI core functionality
   */
  function initializeNobleUICore() {
    // This will initialize the original NobleUI functionality
    // Only call if the required NobleUI JS is loaded
    try {
      if (typeof feather !== 'undefined') {
        feather.replace();
      }
      
      // Call NobleUI's template initialization if available
      if (window.NobleUI && typeof window.NobleUI.init === 'function') {
        window.NobleUI.init();
      }
      
      // Initialize dropdown menus
      if (typeof bootstrap !== 'undefined' && bootstrap.Dropdown) {
        const dropdownElementList = [].slice.call(document.querySelectorAll('[data-bs-toggle="dropdown"]'));
        dropdownElementList.map(function (dropdownToggleEl) {
          return new bootstrap.Dropdown(dropdownToggleEl);
        });
      }
      
      // Initialize tooltips
      if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
          return new bootstrap.Tooltip(tooltipTriggerEl);
        });
      }
      
      // Initialize chart.js if present
      initCharts();
      
    } catch (error) {
      console.warn('Error initializing NobleUI core:', error);
    }
  }
  
  /**
   * Initialize charts if Chart.js is available
   */
  function initCharts() {
    if (typeof Chart !== 'undefined') {
      // Find charts in the document
      const chartElements = document.querySelectorAll('.nobleui-chart');
      
      chartElements.forEach(chartElement => {
        const chartType = chartElement.getAttribute('data-chart-type') || 'line';
        const chartData = JSON.parse(chartElement.getAttribute('data-chart-data') || '{}');
        const chartOptions = JSON.parse(chartElement.getAttribute('data-chart-options') || '{}');
        
        try {
          new Chart(chartElement, {
            type: chartType,
            data: chartData,
            options: chartOptions
          });
        } catch (error) {
          console.warn('Error initializing chart:', error);
        }
      });
    }
  }
  
  /**
   * Toggle sidebar collapsed state
   */
  function toggleSidebar() {
    if (!bodyElement) {
      console.warn('Cannot toggle sidebar: bodyElement is not available');
      return;
    }
    
    try {
      bodyElement.classList.toggle('sidebar-folded');
      config.sidebarCollapsed = bodyElement.classList.contains('sidebar-folded');
    } catch (error) {
      console.error('Error toggling sidebar:', error);
    }
  }
  
  /**
   * Toggle settings panel
   */
  function toggleSettingsPanel() {
    try {
      const settingsPanel = document.querySelector('.settings-panel');
      if (settingsPanel) {
        settingsPanel.classList.toggle('open');
      }
    } catch (error) {
      console.error('Error toggling settings panel:', error);
    }
  }
  
  /**
   * Update theme configuration
   * @param {string} property - Configuration property to update
   * @param {*} value - New value for the property
   */
  function updateThemeConfig(property, value) {
    try {
      // Update config object
      if (config.hasOwnProperty(property)) {
        config[property] = value;
        
        // Apply the updated configuration
        applyThemeConfig();
        
        // Notify the plugin system of configuration change
        if (pluginAPI) {
          pluginAPI.log('info', `Updated theme config: ${property} = ${value}`);
        }
      }
    } catch (error) {
      console.error(`Error updating theme config (${property}=${value}):`, error);
    }
  }
  
  /**
   * Handle window resize events
   */
  function handleResize() {
    if (!bodyElement) {
      console.warn('Cannot handle resize: bodyElement is not available');
      return;
    }
    
    try {
      const width = window.innerWidth;
      
      // Mobile adjustments
      if (width < 992) {
        bodyElement.classList.add('sidebar-folded', 'sidebar-mobile');
      } else {
        bodyElement.classList.remove('sidebar-mobile');
        if (!config.sidebarCollapsed) {
          bodyElement.classList.remove('sidebar-folded');
        }
      }
    } catch (error) {
      console.error('Error handling resize:', error);
    }
  }
  
  /**
   * Get current theme configuration
   * @returns {Object} Current theme configuration
   */
  function getConfig() {
    return { ...config };
  }
  
  /**
   * Apply a layout component from NobleUI
   * @param {string} componentId - ID of the component to apply
   * @param {string} targetSelector - CSS selector for the target element
   * @param {Object} options - Options for the component
   * @returns {boolean} Success state
   */
  function applyComponent(componentId, targetSelector, options = {}) {
    const targetElement = document.querySelector(targetSelector);
    if (!targetElement) {
      console.warn(`Target element not found: ${targetSelector}`);
      return false;
    }
    
    try {
      // Fetch component template from assets
      fetch(`/plugins/themes/nobleui-admin/components/${componentId}.html`)
        .then(response => {
          if (!response.ok) {
            throw new Error(`Failed to load component: ${componentId}`);
          }
          return response.text();
        })
        .then(html => {
          // Process template with options
          const processedHtml = processTemplate(html, options);
          
          // Insert into target
          targetElement.innerHTML = processedHtml;
          
          // Initialize component JS if needed
          initializeComponent(componentId, targetElement, options);
          
          return true;
        })
        .catch(error => {
          console.error('Error applying component:', error);
          return false;
        });
    } catch (error) {
      console.error('Error in applyComponent:', error);
      return false;
    }
  }
  
  /**
   * Process a template string with options
   * @param {string} template - Template string with placeholders
   * @param {Object} options - Values for placeholders
   * @returns {string} Processed template
   */
  function processTemplate(template, options) {
    let result = template;
    
    // Replace placeholders with values from options
    for (const [key, value] of Object.entries(options)) {
      const placeholder = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      result = result.replace(placeholder, value);
    }
    
    return result;
  }
  
  /**
   * Initialize component-specific JavaScript
   * @param {string} componentId - ID of the component
   * @param {Element} element - DOM element containing the component
   * @param {Object} options - Component options
   */
  function initializeComponent(componentId, element, options) {
    // Initialize specific components
    switch (componentId) {
      case 'data-table':
        initializeDataTable(element, options);
        break;
      case 'chart':
        initializeChart(element, options);
        break;
      case 'form':
        initializeForm(element, options);
        break;
      // Add more component initializers as needed
    }
    
    // Initialize feather icons in the component
    if (typeof feather !== 'undefined') {
      feather.replace({ root: element });
    }
  }
  
  /**
   * Initialize DataTable component
   * @param {Element} element - Container element
   * @param {Object} options - DataTable options
   */
  function initializeDataTable(element, options) {
    const tableElement = element.querySelector('table');
    if (tableElement && typeof $.fn.DataTable !== 'undefined') {
      $(tableElement).DataTable(options.dataTableOptions || {});
    }
  }
  
  /**
   * Initialize Chart component
   * @param {Element} element - Container element
   * @param {Object} options - Chart options
   */
  function initializeChart(element, options) {
    const chartElement = element.querySelector('canvas');
    if (chartElement && typeof Chart !== 'undefined') {
      new Chart(chartElement, {
        type: options.type || 'line',
        data: options.data || {},
        options: options.chartOptions || {}
      });
    }
  }
  
  /**
   * Initialize Form components
   * @param {Element} element - Form container
   * @param {Object} options - Form options
   */
  function initializeForm(element, options) {
    // Initialize Select2
    if (typeof $.fn.select2 !== 'undefined') {
      element.querySelectorAll('select.select2').forEach(select => {
        $(select).select2();
      });
    }
    
    // Initialize datepicker
    if (typeof $.fn.datepicker !== 'undefined') {
      element.querySelectorAll('.datepicker').forEach(input => {
        $(input).datepicker(options.datepickerOptions || {});
      });
    }
    
    // Initialize file uploads
    if (typeof $.fn.dropify !== 'undefined') {
      element.querySelectorAll('.dropify').forEach(input => {
        $(input).dropify();
      });
    }
    
    // Initialize tags input
    if (typeof $.fn.tagsInput !== 'undefined') {
      element.querySelectorAll('.tags-input').forEach(input => {
        $(input).tagsInput();
      });
    }
  }
  
  // Public API
  const NobleUITheme = {
    initialize: initialize,
    getConfig: getConfig,
    applyComponent: applyComponent,
    toggleSidebar: toggleSidebar,
    toggleSettingsPanel: toggleSettingsPanel
  };
  
  // Expose to global scope
  window.NobleUITheme = NobleUITheme;
  
  // Return the public API
  return NobleUITheme;
})();