# Martex Frontend Theme Plugin

This plugin adapts the Martex SaaS and startup theme for use in the Documentation System as a theme plugin. It provides a modern, clean design with extensive components and layout options perfect for documentation, product pages, and marketing sites.

## Features

- **Multiple Layouts**: Standard, hero-based, and landing page layouts
- **Responsive Design**: Fully responsive on all devices
- **Modern UI**: Clean, attractive design for SaaS and startup applications
- **Extensive Components**: Hero sections, feature grids, testimonials, pricing tables, and more
- **Versatile Header Options**: Default, dark, and transparent options
- **Hero Section Variations**: Standard, fullscreen, and video background

## Installation

1. Download the Martex theme from the UI Starter Kits repository.
2. Extract the Martex assets to the `/docs-system/plugins/themes/martex-frontend/assets/` directory.
3. The theme is now ready to use through the plugin system.

## Usage

Once installed, the theme can be activated through the Documentation System's theme settings. Three layout options are available:

1. **Standard Layout**: Clean layout with standard header
2. **Hero Layout**: Includes a prominent hero section for marketing-focused pages
3. **Landing Layout**: Specialized landing page design for conversion-focused content

## Configuration

The theme supports the following configuration options:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `headerStyle` | Select | `default` | Header style (default, dark, transparent) |
| `primaryColor` | Color | `#4582ff` | Primary theme color |
| `secondaryColor` | Color | `#3e7846` | Secondary theme color |
| `heroStyle` | Select | `standard` | Hero section style (standard, fullscreen, video, none) |
| `footerStyle` | Select | `standard` | Footer style (standard, simple, newsletter) |

## Available Components

The Martex theme includes numerous pre-built components that can be used in the Documentation System:

### Header Components
- Standard Header
- Transparent Header
- Sticky Header

### Hero Sections
- Standard Hero
- Content-Focused Hero
- Image Hero
- Video Background Hero

### Content Sections
- Content Block
- Features Grid
- Features List
- Content with Image
- Testimonials
- Pricing Table
- FAQ Section
- Call-to-Action Section
- Team Section
- Portfolio Grid
- Blog Grid

### Form Components
- Contact Form
- Newsletter Form
- Signup Form
- Request Form

### Footer Components
- Standard Footer
- Simple Footer
- Newsletter Footer

## Component Usage

To use a component in your application:

```javascript
// Example: Apply a hero section
MartexTheme.applyComponent('hero-standard', '#hero-container', {
  heroTitle: 'Welcome to Our Platform',
  heroDescription: 'The most powerful solution for your business needs',
  primaryButtonText: 'Get Started',
  primaryButtonLink: '/signup',
  secondaryButtonText: 'Learn More',
  secondaryButtonLink: '/features'
});

// Example: Apply a testimonials section
MartexTheme.applyComponent('testimonials', '#testimonials-container', {
  title: 'What Our Customers Say',
  subtitle: 'Trusted by thousands of businesses',
  items: [
    {
      text: 'This platform has transformed our workflow completely.',
      author: 'John Smith',
      position: 'CEO, TechCorp'
    },
    {
      text: 'The interface is intuitive and the support is excellent.',
      author: 'Sarah Johnson',
      position: 'CTO, Innovate Inc.'
    }
  ]
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
martex-frontend/
├── assets/                # Original Martex assets
│   ├── css/              # CSS files
│   ├── fonts/            # Font files
│   ├── images/           # Image assets
│   ├── js/               # JavaScript files
│   └── vendors/          # Third-party libraries
├── components/           # Component templates
├── templates/            # Layout templates
│   ├── layout-standard.html
│   ├── layout-hero.html
│   └── layout-landing.html
├── index.js              # Plugin entry point
├── manifest.json         # Plugin manifest
└── README.md             # Documentation
```

## Credits

- **Original Theme**: Martex Theme
- **Adapter**: Documentation System Team

## License

This adapter is part of the Documentation System. The original Martex theme is subject to its own licensing terms.

## Notes

- This plugin requires jQuery and Bootstrap for full functionality.
- For advanced customization, refer to the original Martex documentation.