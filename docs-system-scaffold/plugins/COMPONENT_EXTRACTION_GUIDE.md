# Component Extraction Guide

This guide provides step-by-step instructions for extracting individual UI components from theme plugins in the Documentation System. It focuses on identifying, isolating, and reusing components from complex themes.

## Overview

Component extraction allows you to:

1. **Reuse UI elements** across different parts of your application
2. **Maintain consistency** in design and functionality
3. **Simplify development** by using pre-built components
4. **Reduce duplication** of code and effort
5. **Create a component library** for your organization

## Prerequisites

Before extracting components, you should:

1. Have a fully integrated theme plugin in the Documentation System
2. Understand the theme's structure, CSS classes, and JavaScript functionality
3. Have basic knowledge of HTML, CSS, and JavaScript
4. Be familiar with the theme's dependencies (like jQuery, Bootstrap, etc.)

## Step 1: Identify Components to Extract

First, identify self-contained components in the theme that would be valuable to reuse:

1. **Browse the theme** to find UI elements that appear multiple times
2. **Look for common patterns** like cards, buttons, modals, sliders, etc.
3. **Check the theme documentation** for component examples
4. **Inspect the theme's HTML structure** to understand how components are built

When identifying components, look for these characteristics:

- **Self-contained**: The component should function independently
- **Reusable**: The component should be usable in different contexts
- **Valuable**: The component should provide real value when reused
- **Adaptable**: The component should be customizable for different uses

## Step 2: Analyze Component Structure

Once you've identified a component, analyze its structure:

1. **Identify the HTML markup** that defines the component
2. **Locate CSS styles** that apply to the component
3. **Find JavaScript functionality** associated with the component
4. **Determine dependencies** required by the component

For example, for a card component from NobleUI:

```html
<div class="card">
  <div class="card-header">
    <h5 class="card-title">Card Title</h5>
  </div>
  <div class="card-body">
    Card content goes here
  </div>
  <div class="card-footer">
    Card footer
  </div>
</div>
```

## Step 3: Extract Component HTML Template

Create a template file for the component in the theme's components directory:

1. Create a new HTML file in `/docs-system/plugins/themes/[theme-name]/components/`
2. Copy the component's HTML structure to the file
3. Replace hardcoded values with placeholders using handlebars-style syntax: `{{placeholder}}`
4. Add conditional sections for optional parts using `{{#if condition}}...{{/if}}`

Example for a card component (`/docs-system/plugins/themes/nobleui-admin/components/card.html`):

```html
<div class="card">
  <div class="card-header">
    <div class="d-flex justify-content-between align-items-center">
      <h5 class="card-title mb-0">{{title}}</h5>
      {{#if actions}}
      <div class="card-actions">
        {{actions}}
      </div>
      {{/if}}
    </div>
  </div>
  <div class="card-body">
    {{content}}
  </div>
  {{#if footer}}
  <div class="card-footer">
    {{footer}}
  </div>
  {{/if}}
</div>
```

## Step 4: Create Component Initialization Code

Add component initialization code to the theme's JavaScript adapter:

1. Open the theme's `index.js` file
2. Add a method to initialize the component with options
3. Implement any required JavaScript functionality

Example for a card component in the NobleUI theme:

```javascript
/**
 * Create a card component
 * @param {string} targetSelector - CSS selector for the target element
 * @param {Object} options - Card options
 * @returns {Promise<boolean>} Success state
 */
NobleUITheme.createCard = function(targetSelector, options) {
  return new Promise((resolve, reject) => {
    const targetElement = document.querySelector(targetSelector);
    if (!targetElement) {
      reject(new Error(`Target element not found: ${targetSelector}`));
      return;
    }
    
    // Fetch component template
    fetch('/plugins/themes/nobleui-admin/components/card.html')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to load card component template');
        }
        return response.text();
      })
      .then(html => {
        // Process template with options
        const processedHtml = processTemplate(html, options);
        
        // Insert into target
        targetElement.innerHTML = processedHtml;
        
        // Initialize any JS functionality
        if (options.collapsible) {
          initializeCollapsibleCard(targetElement);
        }
        
        resolve(true);
      })
      .catch(error => {
        console.error('Error creating card component:', error);
        reject(error);
      });
  });
};

/**
 * Initialize a collapsible card
 * @param {Element} cardElement - Card DOM element
 */
function initializeCollapsibleCard(cardElement) {
  const collapseBtn = cardElement.querySelector('.card-collapse-btn');
  const cardBody = cardElement.querySelector('.card-body');
  
  if (collapseBtn && cardBody) {
    collapseBtn.addEventListener('click', () => {
      cardBody.classList.toggle('collapsed');
      collapseBtn.classList.toggle('collapsed');
    });
  }
}
```

## Step 5: Document the Component

Document the component in the theme's README.md file:

1. Add a section for the component
2. Describe its purpose and when to use it
3. List all available options and their defaults
4. Provide usage examples

Example documentation:

```markdown
### Card Component

The card component provides a flexible container with header, body, and optional footer.

#### Usage

```javascript
NobleUITheme.createCard('#card-container', {
  title: 'Card Title',
  content: '<p>This is the card content</p>',
  footer: '<button class="btn btn-primary">Action</button>',
  actions: '<button class="btn btn-icon"><i data-feather="more-vertical"></i></button>',
  collapsible: true
});
```

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `title` | String | - | Card title displayed in the header |
| `content` | String | - | HTML content for the card body |
| `footer` | String | null | HTML content for the card footer (optional) |
| `actions` | String | null | HTML content for header actions (optional) |
| `collapsible` | Boolean | false | Whether the card can be collapsed |
```

## Step 6: Test the Component

Thoroughly test the extracted component:

1. Create a test page that uses the component
2. Test with different options and configurations
3. Verify that all functionality works correctly
4. Test in different browsers and screen sizes
5. Check for any CSS conflicts or JavaScript errors

## Step 7: Create a Component Library (Optional)

Once you've extracted multiple components, consider creating a component library:

1. Create a centralized documentation page for all components
2. Organize components by category or purpose
3. Include interactive examples
4. Provide search functionality

Example component library structure:

```
/docs-system/plugins/themes/nobleui-admin/component-library/
  index.html               # Main component library page
  /documentation/          # Component documentation
    card.html              # Card component documentation
    data-table.html        # Data table component documentation
    ...
  /examples/               # Interactive examples
    card-examples.html     # Card component examples
    data-table-examples.html # Data table component examples
    ...
```

## Component Categories by Theme

### NobleUI Admin Components

#### UI Components
- Cards
- Buttons
- Modals
- Tabs
- Accordions
- Alerts
- Badges
- Progress bars
- Spinners
- Tooltips
- Popovers

#### Form Components
- Input fields
- Checkboxes
- Radio buttons
- Switches
- Select dropdowns
- Date pickers
- File uploads
- Form validation

#### Data Components
- Data tables
- Charts
- Maps
- Statistics cards
- Timeline

### Martex Frontend Components

#### Hero Sections
- Standard hero
- Video background hero
- Animated hero
- Slider hero

#### Content Sections
- Feature grids
- Testimonials
- Pricing tables
- Team members
- Statistics counters
- Call-to-action sections
- FAQ accordions

#### Navigation Components
- Headers
- Footers
- Side navigation
- Mega menus
- Breadcrumbs

## Best Practices for Component Extraction

1. **Maintain Namespace**: Keep the theme's CSS namespace to prevent conflicts
2. **Include Dependencies**: Document all required dependencies
3. **Parameterize Everything**: Make all aspects of the component configurable
4. **Keep It Simple**: Extract the simplest version that works, then add complexity
5. **Test Thoroughly**: Test components in isolation and in combination
6. **Document Clearly**: Document all options, functionality, and usage examples
7. **Version Components**: If components evolve, maintain version information

## Troubleshooting Common Issues

### CSS Styles Not Applying

- Check for missing CSS classes in the component HTML
- Verify that the theme's CSS is loaded before using the component
- Check for CSS specificity issues that might override styles

### JavaScript Functionality Not Working

- Check browser console for errors
- Verify that dependencies (jQuery, Bootstrap, etc.) are loaded
- Ensure initialization code runs after the DOM is ready
- Check for JavaScript conflicts with other components

### Component Looks Different Than Expected

- Verify all required CSS files are loaded
- Check for missing structural elements in the HTML
- Verify that icons or other assets are properly referenced
- Check for responsive breakpoints that might change the layout

## Advanced Component Extraction

### Creating Composite Components

Combine multiple base components to create more complex UI elements:

```javascript
// Create a card with a chart inside
async function createChartCard(targetSelector, options) {
  // First create the card
  await NobleUITheme.createCard(targetSelector, {
    title: options.title,
    content: '<div id="chart-container"></div>',
    footer: options.footer
  });
  
  // Then add the chart to the container
  const chartContainer = document.querySelector(`${targetSelector} #chart-container`);
  if (chartContainer) {
    NobleUITheme.createChart(chartContainer, options.chartOptions);
  }
}
```

### Making Components Fully Customizable

Add deep customization options:

```javascript
// Highly customizable data table
NobleUITheme.createDataTable('#table-container', {
  columns: [
    { 
      field: 'id', 
      title: 'ID',
      sortable: true,
      width: '50px',
      formatter: (value) => `#${value}`
    },
    // More columns...
  ],
  data: [...],
  pagination: {
    enabled: true,
    pageSize: 10,
    pageSizes: [5, 10, 20, 50]
  },
  search: {
    enabled: true,
    placeholder: 'Search...'
  },
  sorting: {
    enabled: true,
    defaultColumn: 'id',
    defaultOrder: 'asc'
  }
});
```

---

By following this guide, you can extract reusable components from theme plugins, creating a rich component library for your Documentation System. This approach enhances development efficiency, maintains visual consistency, and maximizes the value of the theme plugins.