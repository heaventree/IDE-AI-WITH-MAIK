# NobleUI Admin Theme Plugin

This plugin adapts the NobleUI Bootstrap 5 admin template for use in the Documentation System as a theme plugin. It provides a complete admin dashboard interface with extensive UI components and features.

## Features

- **Responsive Design**: Fully responsive layout works on all devices
- **Two Layout Options**: Vertical sidebar and horizontal top navigation
- **Dark & Light Modes**: Support for both light and dark themes
- **Customizable**: Configurable colors, layouts, and components
- **Modern UI**: Clean, modern design with Bootstrap 5
- **Extensive Components**: Full set of UI components for building complex interfaces
- **Interactive Charts**: Chart.js integration for data visualization
- **Data Tables**: Advanced data tables with sorting and filtering
- **Form Elements**: Comprehensive form controls and validation

## Installation

1. Download the NobleUI theme from the UI Starter Kits repository.
2. Extract the NobleUI assets to the `/docs-system/plugins/themes/nobleui-admin/assets/` directory.
3. The theme is now ready to use through the plugin system.

## Usage

Once installed, the theme can be activated through the Documentation System's theme settings. Two layout options are available:

1. **Vertical Layout**: Traditional sidebar navigation (default)
2. **Horizontal Layout**: Top navigation bar

## Configuration

The theme supports the following configuration options:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `layoutMode` | Select | `vertical` | Layout mode (vertical or horizontal) |
| `navbarColor` | Select | `navbar-light` | Navbar color scheme (light or dark) |
| `sidebarColor` | Select | `sidebar-light` | Sidebar color scheme (light or dark) |
| `sidebarCollapsed` | Boolean | `false` | Whether the sidebar should be collapsed by default |
| `rtlEnabled` | Boolean | `false` | Enable RTL (Right-to-Left) mode |

## Available Components

The NobleUI theme includes numerous pre-built components that can be used in the Documentation System:

### Dashboard Components
- Revenue charts
- Sales statistics
- Monthly sales reports
- Analytics dashboards
- Stat cards

### UI Components
- Accordions
- Alerts
- Badges
- Breadcrumbs
- Buttons
- Cards
- Carousel
- Collapse
- Dropdowns
- List Groups
- Media Objects
- Modals
- Navigation
- Pagination
- Popovers
- Progress Bars
- Spinners
- Tabs
- Tooltips

### Form Components
- Basic Elements
- Advanced Elements
- Editors
- Wizards
- Validation

### Table Components
- Basic Tables
- Data Tables

## Component Usage

To use a component in your application:

```javascript
// Example: Apply a data table component
NobleUITheme.applyComponent('data-table', '#table-container', {
  dataTableOptions: {
    pageLength: 10,
    searching: true
  }
});

// Example: Apply a chart component
NobleUITheme.applyComponent('chart', '#chart-container', {
  type: 'line',
  data: {
    labels: ['Jan', 'Feb', 'Mar'],
    datasets: [{
      label: 'Sales',
      data: [30, 40, 60]
    }]
  }
});
```

## Development

To modify or extend this theme:

1. Make changes to the templates in `/templates/`
2. Update styles in the theme CSS files
3. Modify component behavior in `index.js`
4. Update the configuration options in `manifest.json` if needed
5. Test your changes across different devices and browsers

## Structure

```
nobleui-admin/
├── assets/                # Original NobleUI assets
│   ├── css/              # CSS files
│   ├── fonts/            # Font files
│   ├── images/           # Image assets
│   ├── js/               # JavaScript files
│   └── vendors/          # Third-party libraries
├── components/           # Component templates
├── templates/            # Layout templates
│   ├── layout-vertical.html
│   └── layout-horizontal.html
├── index.js              # Plugin entry point
├── manifest.json         # Plugin manifest
└── README.md             # Documentation
```

## Credits

- **Original Theme**: NobleUI by Nobleui.com
- **Adapter**: Documentation System Team

## License

This adapter is part of the Documentation System. The original NobleUI theme is subject to its own licensing terms.

## Notes

- This plugin requires Bootstrap 5 and its dependencies to function properly.
- Some features may require jQuery for full functionality.
- For advanced customization, refer to the original NobleUI documentation.