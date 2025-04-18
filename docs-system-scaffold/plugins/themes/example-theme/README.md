# Example Theme Plugin

This plugin demonstrates the theme plugin architecture for the Documentation System. It provides a clean, modern theme with customizable options.

## Features

- Responsive design for all device sizes
- Light and dark mode support
- Customizable color scheme
- Collapsible sidebar navigation
- Clean typography and spacing
- Accessible interface elements

## Installation

1. Ensure the Documentation System is installed and running
2. Copy this directory to `/docs-system/plugins/themes/example-theme`
3. Add the theme to the theme registry in `/docs-system/plugins/themes/theme-registry.json`
4. Restart the Documentation System server

## Configuration

The theme supports the following configuration options:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `primaryColor` | Color | `#4e73df` | The primary brand color used throughout the theme |
| `useSidebarCollapse` | Boolean | `true` | Whether the sidebar should be collapsible |
| `fontFamily` | Select | `system-ui` | The main font family for the theme |

## Structure

- `/assets/css/theme.css` - The main CSS file for the theme
- `/index.js` - The JavaScript entry point for the theme
- `/templates/layout.html` - The main layout template
- `/components/` - Custom components for the theme
- `/lib/` - Utility functions and libraries

## Usage

Once installed, the theme can be activated through the Documentation System settings:

1. Go to Admin > Settings > Appearance
2. Select "Example Theme" from the theme dropdown
3. Configure the theme options as desired
4. Save changes

## Development

To modify this theme:

1. Make changes to the theme files
2. Reload the Documentation System
3. Test your changes in various browsers and device sizes
4. Update documentation for any new options or features

## Hook Implementations

This theme implements the following system hooks:

- `system:header` - Custom header with search and actions
- `system:navigation` - Sidebar navigation with collapsible sections
- `system:footer` - Simple footer with copyright and theme information

## License

This theme is part of the Documentation System and is licensed under the same terms.

## Credits

- Font Awesome for icons
- System font stack for typography