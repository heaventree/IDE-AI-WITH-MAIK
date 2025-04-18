/**
 * Martex Frontend Theme - Plugin Adapter
 * 
 * This module adapts the Martex frontend template to work as a plugin for the Documentation System.
 * It wraps the original theme functionality and exposes it through the plugin system API.
 */

(function() {
  'use strict';
  
  // Theme configuration with defaults
  let config = {
    headerStyle: 'default',
    primaryColor: '#4582ff',
    secondaryColor: '#3e7846',
    heroStyle: 'standard',
    footerStyle: 'standard'
  };
  
  // Plugin API reference
  let pluginAPI = null;
  
  // Cached DOM elements
  let headerElement = null;
  let heroElement = null;
  let footerElement = null;
  
  /**
   * Initialize the Martex theme
   * @param {Object} systemConfig - Configuration from the system
   * @param {Object} api - Plugin API instance
   * @returns {Object} Theme initialization status
   */
  function initialize(systemConfig, api) {
    console.log('Initializing Martex Frontend Theme');
    
    // Store the plugin API
    pluginAPI = api;
    
    // Merge provided config with defaults
    config = { ...config, ...systemConfig };
    
    // Cache DOM elements
    headerElement = document.querySelector('.header');
    heroElement = document.querySelector('.hero-section');
    footerElement = document.querySelector('.footer');
    
    // Apply initial configuration
    applyThemeConfig();
    
    // Register event listeners
    registerEventListeners();
    
    // Register dynamic hooks
    registerDynamicHooks();
    
    // Add theme class to body
    document.body.classList.add('martex-theme');
    
    // Initialize original Martex JS functionality if possible
    initializeMartexFunctionality();
    
    return {
      name: 'Martex Frontend Theme',
      version: '1.0.0',
      status: 'active'
    };
  }
  
  /**
   * Apply theme configuration
   */
  function applyThemeConfig() {
    // Apply header style
    if (headerElement) {
      headerElement.classList.remove('default-header', 'dark-header', 'transparent-header');
      headerElement.classList.add(`${config.headerStyle}-header`);
    }
    
    // Apply custom colors
    document.documentElement.style.setProperty('--theme-primary-color', config.primaryColor);
    document.documentElement.style.setProperty('--theme-secondary-color', config.secondaryColor);
    
    // Apply hero style
    if (heroElement) {
      heroElement.classList.remove('standard-hero', 'fullscreen-hero', 'video-hero', 'no-hero');
      if (config.heroStyle !== 'none') {
        heroElement.classList.add(`${config.heroStyle}-hero`);
      } else {
        heroElement.classList.add('no-hero');
      }
    }
    
    // Apply footer style
    if (footerElement) {
      footerElement.classList.remove('standard-footer', 'simple-footer', 'newsletter-footer');
      footerElement.classList.add(`${config.footerStyle}-footer`);
    }
  }
  
  /**
   * Register event listeners for theme functionality
   */
  function registerEventListeners() {
    // Handle window scroll for sticky header
    window.addEventListener('scroll', handleScroll);
    
    // Handle window resize for responsive adjustments
    window.addEventListener('resize', handleResize);
    
    // Handle navigation menu toggle
    document.addEventListener('click', function(event) {
      if (event.target.matches('.navbar-toggler') || event.target.closest('.navbar-toggler')) {
        toggleMobileMenu();
      }
    });
  }
  
  /**
   * Register dynamic hooks for system integration
   */
  function registerDynamicHooks() {
    if (pluginAPI) {
      // Example: Hook into content to add wrapper
      pluginAPI.registerHook('contentWrapper', 'system:content', (defaultContent) => {
        return `<div class="martex-content-wrapper">${defaultContent}</div>`;
      });
      
      // Example: Hook into hero section if used
      if (config.heroStyle !== 'none') {
        pluginAPI.registerHook('heroContent', 'system:hero', (defaultContent) => {
          return `<div class="martex-hero-wrapper ${config.heroStyle}-hero">${defaultContent}</div>`;
        });
      }
    }
  }
  
  /**
   * Initialize original Martex JS functionality
   */
  function initializeMartexFunctionality() {
    try {
      // Only run if jQuery is available (Martex relies on jQuery)
      if (typeof jQuery !== 'undefined') {
        const $ = jQuery;
        
        // Initialize WOW animations if available
        if (typeof WOW !== 'undefined') {
          new WOW().init();
        }
        
        // Initialize Owl Carousel sliders if available
        if ($.fn.owlCarousel) {
          $('.owl-carousel').each(function() {
            const $carousel = $(this);
            const options = {
              items: $carousel.data('items') || 1,
              loop: $carousel.data('loop') !== false,
              autoplay: $carousel.data('autoplay') !== false,
              margin: $carousel.data('margin') || 0,
              nav: $carousel.data('nav') || false,
              dots: $carousel.data('dots') !== false,
              navText: ['<i class="fa fa-angle-left"></i>', '<i class="fa fa-angle-right"></i>'],
              responsive: $carousel.data('responsive') || {}
            };
            
            $carousel.owlCarousel(options);
          });
        }
        
        // Initialize Magnific Popup for lightboxes
        if ($.fn.magnificPopup) {
          $('.popup-video').magnificPopup({
            type: 'iframe'
          });
          
          $('.popup-image').magnificPopup({
            type: 'image'
          });
          
          $('.popup-gallery').magnificPopup({
            type: 'image',
            gallery: {
              enabled: true
            }
          });
        }
        
        // Initialize form validation
        if ($.fn.validate) {
          $('.contact-form').validate({
            submitHandler: function(form) {
              // Handle form submission
              return false;
            }
          });
        }
        
        // Initialize counters
        if ($.fn.appear) {
          $('.count-element').appear(function() {
            $(this).countTo();
          });
        }
        
        // Initialize Isotope for portfolio filtering
        if (typeof Isotope !== 'undefined') {
          const $portfolioGrid = $('.portfolio-grid');
          if ($portfolioGrid.length) {
            const isotope = new Isotope('.portfolio-grid', {
              itemSelector: '.portfolio-item',
              layoutMode: 'fitRows'
            });
            
            // Filter items on button click
            $('.portfolio-filter').on('click', 'button', function() {
              const filterValue = $(this).attr('data-filter');
              isotope.arrange({ filter: filterValue });
              
              // Update active filter button
              $('.portfolio-filter button').removeClass('active');
              $(this).addClass('active');
            });
          }
        }
      }
    } catch (error) {
      console.warn('Error initializing Martex functionality:', error);
    }
  }
  
  /**
   * Handle window scroll event
   */
  function handleScroll() {
    // Add sticky class to header on scroll
    if (headerElement) {
      if (window.scrollY > 100) {
        headerElement.classList.add('header-sticky');
      } else {
        headerElement.classList.remove('header-sticky');
      }
    }
    
    // Parallax effects if needed
    applyParallaxEffects();
  }
  
  /**
   * Handle window resize event
   */
  function handleResize() {
    // Adjust for mobile/desktop views
    const width = window.innerWidth;
    
    if (width < 992) {
      document.body.classList.add('mobile-view');
      document.body.classList.remove('desktop-view');
    } else {
      document.body.classList.add('desktop-view');
      document.body.classList.remove('mobile-view');
    }
  }
  
  /**
   * Toggle mobile menu
   */
  function toggleMobileMenu() {
    const navbar = document.querySelector('.navbar-collapse');
    if (navbar) {
      navbar.classList.toggle('show');
    }
  }
  
  /**
   * Apply parallax effects to elements
   */
  function applyParallaxEffects() {
    const parallaxElements = document.querySelectorAll('.parallax');
    
    parallaxElements.forEach(element => {
      const scrollPosition = window.scrollY;
      const parallaxSpeed = element.dataset.parallaxSpeed || 0.5;
      const elementPosition = element.offsetTop;
      const distance = scrollPosition - elementPosition;
      
      if (distance > -window.innerHeight && distance < window.innerHeight) {
        const translateY = distance * parallaxSpeed;
        element.style.transform = `translateY(${translateY}px)`;
      }
    });
  }
  
  /**
   * Update theme configuration
   * @param {string} property - Configuration property to update
   * @param {*} value - New value for the property
   */
  function updateThemeConfig(property, value) {
    if (config.hasOwnProperty(property)) {
      config[property] = value;
      applyThemeConfig();
      
      if (pluginAPI) {
        pluginAPI.log('info', `Updated theme config: ${property} = ${value}`);
      }
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
   * Apply a component from the Martex theme
   * @param {string} componentId - ID of the component to apply
   * @param {string} targetSelector - CSS selector for the target element
   * @param {Object} options - Options for the component
   * @returns {Promise<boolean>} Success state
   */
  function applyComponent(componentId, targetSelector, options = {}) {
    return new Promise((resolve, reject) => {
      const targetElement = document.querySelector(targetSelector);
      if (!targetElement) {
        console.warn(`Target element not found: ${targetSelector}`);
        reject(new Error(`Target element not found: ${targetSelector}`));
        return;
      }
      
      // Fetch component template
      fetch(`/plugins/themes/martex-frontend/components/${componentId}.html`)
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
          
          // Initialize component JS
          initializeComponent(componentId, targetElement, options);
          
          resolve(true);
        })
        .catch(error => {
          console.error('Error applying component:', error);
          reject(error);
        });
    });
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
    if (typeof jQuery === 'undefined') {
      console.warn('jQuery is required for component initialization but not available');
      return;
    }
    
    const $ = jQuery;
    
    // Initialize specific components
    switch (componentId) {
      case 'hero-standard':
      case 'hero-fullscreen':
      case 'hero-video':
        initializeHero(element, componentId, options);
        break;
      
      case 'features-grid':
      case 'features-list':
        // Initialize with animations if WOW.js is available
        if (typeof WOW !== 'undefined') {
          element.querySelectorAll('.wow').forEach(el => {
            new WOW().sync(el);
          });
        }
        break;
      
      case 'testimonials':
        // Initialize testimonial carousel
        if ($.fn.owlCarousel) {
          $(element).find('.testimonial-carousel').owlCarousel({
            items: options.items || 1,
            loop: options.loop !== false,
            autoplay: options.autoplay !== false,
            margin: options.margin || 30,
            nav: options.nav || false,
            dots: options.dots !== false,
            responsive: options.responsive || {
              0: { items: 1 },
              768: { items: options.itemsTablet || 1 },
              992: { items: options.itemsDesktop || 1 }
            }
          });
        }
        break;
      
      case 'portfolio-grid':
        // Initialize portfolio filtering
        if (typeof Isotope !== 'undefined') {
          const $grid = $(element).find('.portfolio-grid');
          if ($grid.length) {
            const isotope = new Isotope($grid[0], {
              itemSelector: '.portfolio-item',
              layoutMode: options.layoutMode || 'fitRows'
            });
            
            // Filter items on button click
            $(element).find('.portfolio-filter button').on('click', function() {
              const filterValue = $(this).attr('data-filter');
              isotope.arrange({ filter: filterValue });
              
              // Update active filter button
              $(element).find('.portfolio-filter button').removeClass('active');
              $(this).addClass('active');
            });
          }
        }
        
        // Initialize lightbox for portfolio items
        if ($.fn.magnificPopup) {
          $(element).find('.portfolio-popup').magnificPopup({
            type: 'image',
            gallery: {
              enabled: true
            }
          });
        }
        break;
      
      case 'contact-form':
        // Initialize form validation
        if ($.fn.validate) {
          $(element).find('form').validate({
            submitHandler: function(form) {
              const successMessage = options.successMessage || 'Your message has been sent successfully!';
              const errorMessage = options.errorMessage || 'Error sending message. Please try again.';
              
              // If a form handler is provided, use it
              if (options.formHandler && typeof options.formHandler === 'function') {
                options.formHandler(form, {
                  success: successMessage,
                  error: errorMessage
                });
              } else {
                // Default form handler - just show success
                const formElement = $(form);
                formElement.find('.form-result').html(`<div class="alert alert-success">${successMessage}</div>`);
                form.reset();
              }
              
              return false;
            }
          });
        }
        break;
    }
  }
  
  /**
   * Initialize hero section
   * @param {Element} element - Hero element
   * @param {string} heroType - Type of hero section
   * @param {Object} options - Hero options
   */
  function initializeHero(element, heroType, options) {
    const $ = jQuery;
    
    // Initialize video background if applicable
    if (heroType === 'hero-video' && options.videoUrl) {
      const videoElement = element.querySelector('.hero-video-bg');
      if (videoElement) {
        videoElement.src = options.videoUrl;
      }
    }
    
    // Initialize slider background if applicable
    if (options.useSlider && $.fn.flexslider) {
      $(element).find('.hero-slider').flexslider({
        animation: options.sliderAnimation || 'fade',
        slideshowSpeed: options.slideshowSpeed || 5000,
        animationSpeed: options.animationSpeed || 1000,
        controlNav: options.controlNav !== false,
        directionNav: options.directionNav !== false,
        prevText: '',
        nextText: ''
      });
    }
    
    // Initialize parallax effect if applicable
    if (options.useParallax) {
      element.classList.add('parallax');
      element.dataset.parallaxSpeed = options.parallaxSpeed || 0.3;
    }
  }
  
  // Public API
  const MartexTheme = {
    initialize: initialize,
    getConfig: getConfig,
    updateThemeConfig: updateThemeConfig,
    applyComponent: applyComponent
  };
  
  // Expose to global scope
  window.MartexTheme = MartexTheme;
  
  // Return the public API
  return MartexTheme;
})();