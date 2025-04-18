# Theme Development Guide

This guide provides step-by-step instructions for creating new themes for the Documentation System using the plugin architecture.

## Prerequisites

Before starting theme development, make sure you have:

1. A local installation of the Documentation System
2. Basic knowledge of HTML, CSS, and JavaScript
3. Familiarity with the system's plugin architecture
4. Development tools for web development

## Theme Development Process

### Step 1: Create Theme Structure

Start by creating the basic file structure for your theme:

```
/docs-system/plugins/themes/your-theme-name/
  manifest.json          # Theme metadata and configuration
  index.js               # JavaScript functionality
  README.md              # Theme documentation
  /assets/
    /css/
      theme.css          # Main theme stylesheet
    /img/                # Theme images
    /fonts/              # Custom fonts (if needed)
  /templates/
    layout.html          # Main layout template
  /components/           # Optional component files
```

### Step 2: Define Theme Manifest

Create the `manifest.json` file with your theme's metadata:

```json
{
  "name": "your-theme-name",
  "displayName": "Your Theme Name",
  "version": "1.0.0",
  "type": "theme",
  "author": "Your Name",
  "description": "Description of your theme",
  "compatibility": {
    "coreVersion": {
      "minimum": "1.0.0",
      "maximum": "2.0.0"
    }
  },
  "entryPoints": {
    "styles": ["assets/css/theme.css"],
    "scripts": ["index.js"],
    "templates": ["templates/layout.html"]
  },
  "config": {
    "options": [
      {
        "id": "primaryColor",
        "type": "color",
        "default": "#4e73df",
        "label": "Primary Color"
      },
      {
        "id": "fontFamily",
        "type": "select",
        "default": "system-ui",
        "label": "Font Family",
        "options": [
          {"value": "system-ui", "label": "System Default"},
          {"value": "Roboto, sans-serif", "label": "Roboto"}
        ]
      }
    ]
  },
  "hooks": [
    {
      "id": "header",
      "type": "template",
      "target": "system:header"
    },
    {
      "id": "navigation",
      "type": "component",
      "target": "system:navigation"
    },
    {
      "id": "footer",
      "type": "template",
      "target": "system:footer"
    }
  ]
}
```

### Step 3: Create Core CSS Styles

Develop your theme's CSS in `assets/css/theme.css`:

1. Use a namespace for your theme to prevent conflicts (e.g., `.your-theme-name`)
2. Define CSS variables for customizable elements
3. Implement styles for all core components
4. Ensure responsive design for mobile devices
5. Include both light and dark mode variants
6. Implement accessibility features

Example structure:

```css
/**
 * Your Theme Name
 */

/* Theme namespace and variables */
.your-theme-name {
  --primary-color: #4e73df;
  --font-family: system-ui, sans-serif;
  /* More variables... */
}

/* Layout components */
.your-theme-name .header { /* Header styles */ }
.your-theme-name .sidebar { /* Sidebar styles */ }
.your-theme-name .content { /* Content styles */ }
.your-theme-name .footer { /* Footer styles */ }

/* UI components */
.your-theme-name .card { /* Card styles */ }
.your-theme-name .button { /* Button styles */ }
.your-theme-name .form-control { /* Form control styles */ }
/* More components... */

/* Dark mode */
.your-theme-name.dark-mode {
  /* Dark mode variable overrides */
}

/* Responsive adjustments */
@media (max-width: 768px) {
  /* Mobile styles */
}
```

### Step 4: Implement JavaScript Functionality

Create your theme's JavaScript in `index.js`:

```javascript
/**
 * Your Theme Name
 */

(function() {
  'use strict';
  
  // Theme configuration
  let config = {};
  
  /**
   * Initialize the theme
   */
  function initialize(systemConfig, pluginAPI) {
    console.log('Initializing Your Theme');
    
    // Store configuration
    config = systemConfig || {};
    
    // Apply theme configuration
    applyThemeConfig(config);
    
    // Register dynamic hooks
    registerHooks(pluginAPI);
    
    // Set up event listeners
    registerEventListeners();
    
    // Add theme class to body
    document.body.classList.add('your-theme-name');
    
    return {
      name: 'Your Theme Name',
      version: '1.0.0',
      status: 'active'
    };
  }
  
  /**
   * Apply theme configuration
   */
  function applyThemeConfig(config) {
    // Apply CSS variables from config
    if (config.primaryColor) {
      document.documentElement.style.setProperty('--primary-color', config.primaryColor);
    }
    
    if (config.fontFamily) {
      document.documentElement.style.setProperty('--font-family', config.fontFamily);
    }
  }
  
  /**
   * Register dynamic hooks
   */
  function registerHooks(pluginAPI) {
    // Example of registering a dynamic hook
    pluginAPI.registerHook('customSection', 'system:content', (defaultContent) => {
      return defaultContent + '<div class="custom-section">Added by theme</div>';
    });
  }
  
  /**
   * Register event listeners
   */
  function registerEventListeners() {
    // Example: Theme toggle button
    document.addEventListener('click', (event) => {
      if (event.target.matches('#theme-toggle')) {
        toggleDarkMode();
      }
    });
  }
  
  /**
   * Toggle dark mode
   */
  function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
  }
  
  // Export theme API
  return {
    initialize: initialize
  };
})();
```

### Step 5: Create Layout Template

Create your layout template in `templates/layout.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{PAGE_TITLE}} | Documentation System</title>
  
  <!-- Theme CSS -->
  <link rel="stylesheet" href="{{THEME_PATH}}/assets/css/theme.css">
  
  <!-- Additional CSS -->
  {{ADDITIONAL_CSS}}
</head>
<body>
  <!-- Header -->
  <header class="header">
    {{SYSTEM_HEADER}}
  </header>
  
  <div class="wrapper">
    <!-- Navigation -->
    <div class="sidebar">
      {{SYSTEM_NAVIGATION}}
    </div>
    
    <!-- Main Content -->
    <main class="content">
      {{PAGE_CONTENT}}
    </main>
  </div>
  
  <!-- Footer -->
  <footer class="footer">
    {{SYSTEM_FOOTER}}
  </footer>
  
  <!-- Theme JavaScript -->
  <script src="{{THEME_PATH}}/index.js"></script>
  
  <!-- Theme Initialization -->
  <script>
    document.addEventListener('DOMContentLoaded', function() {
      if (typeof YourTheme !== 'undefined') {
        YourTheme.initialize({{THEME_CONFIG}}, window.pluginSystem.getPluginAPI('your-theme-name'));
      }
    });
  </script>
  
  <!-- Additional JavaScript -->
  {{ADDITIONAL_SCRIPTS}}
</body>
</html>
```

### Step 6: Document Your Theme

Create a `README.md` file with clear documentation:

```markdown
# Your Theme Name

A brief description of your theme and its purpose.

## Features

- List key features
- Mention any special capabilities

## Installation

Instructions for installing the theme.

## Configuration

Explain all configuration options and their effects.

## Customization

Guidance for further customizing the theme.
```

### Step 7: Register Your Theme

Add your theme to the registry in `docs-system/plugins/themes/theme-registry.json`:

```json
{
  "themes": [
    // Existing themes...
    {
      "id": "your-theme-id",
      "name": "Your Theme Name",
      "version": "1.0.0",
      "description": "Description of your theme",
      "path": "your-theme-name",
      "author": "Your Name",
      "preview": "your-theme-name/assets/preview.png",
      "tags": ["your", "theme", "tags"],
      "category": "documentation"
    }
  ]
}
```

### Step 8: Test Your Theme

To properly test your theme:

1. Restart the Documentation System
2. Navigate to Admin > Settings > Appearance
3. Select your theme from the dropdown
4. Configure any theme options
5. Test all pages and functionality
6. Test responsive design on different screen sizes
7. Validate accessibility

## Theme Configuration Options

The following configuration types are supported:

| Type | Description | Example |
|------|-------------|---------|
| `string` | Text input | Site title, copyright text |
| `color` | Color picker | Theme colors |
| `boolean` | Toggle switch | Feature flags |
| `select` | Dropdown selection | Font family, layout options |
| `number` | Numeric input | Font size, spacing values |
| `array` | List of values | Social media links |

## System Hooks

Your theme can target these system hooks:

| Hook Target | Description | Type |
|-------------|-------------|------|
| `system:header` | Main site header | Template |
| `system:navigation` | Site navigation | Component |
| `system:footer` | Site footer | Template |
| `system:content` | Main content area | Content |
| `system:sidebar` | Secondary sidebar | Component |

## Best Practices

1. **Namespacing**: Always namespace your CSS to prevent conflicts
2. **Performance**: Minimize JavaScript and CSS size
3. **Accessibility**: Meet WCAG AA guidelines
4. **Responsive Design**: Test on all device sizes
5. **Documentation**: Thoroughly document all features and options
6. **Browser Compatibility**: Test in multiple browsers

## Advanced Techniques

### Creating Custom Components

For complex UI components, create separate files in the `components` directory:

```javascript
// components/accordion.js
function createAccordion(items) {
  // Implementation...
}

module.exports = {
  createAccordion
};
```

### Using Template Partials

Break down complex templates into partials:

```html
<!-- templates/partials/header.html -->
<header class="custom-header">
  <!-- Header content -->
</header>
```

Then include them in your main template:

```html
<!-- In layout.html -->
{{> partials/header}}
```

### Theme Variants

To offer variations of your theme:

1. Create a variants configuration in your manifest:

```json
"variants": [
  {
    "id": "light",
    "name": "Light Mode",
    "default": true
  },
  {
    "id": "dark",
    "name": "Dark Mode"
  }
]
```

2. Add variant-specific CSS:

```css
/* Light variant (default) */
.your-theme-name.variant-light {
  --background-color: #ffffff;
  --text-color: #333333;
}

/* Dark variant */
.your-theme-name.variant-dark {
  --background-color: #222222;
  --text-color: #ffffff;
}
```

## Troubleshooting

### Common Issues

1. **Theme not appearing**: Check the theme registry and ensure paths are correct
2. **Styles not applying**: Verify CSS namespace and precedence
3. **JavaScript errors**: Check the browser console for errors
4. **Hook not working**: Verify hook target names and registration

### Theme Validation

Before submitting your theme, validate it with:

```bash
node docs-system/plugins/tools/validate-theme.js your-theme-name
```

## Theme Submission

To submit your theme to the central repository:

1. Ensure it passes all validation checks
2. Create a detailed README
3. Include a preview image
4. Submit a pull request to the themes repository

---

For more information, see the complete [Plugin Architecture Specification](/docs-system/plugins/PLUGIN_ARCHITECTURE_SPECIFICATION.md).