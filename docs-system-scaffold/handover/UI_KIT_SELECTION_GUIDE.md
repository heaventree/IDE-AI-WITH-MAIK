# UI Kit Selection Guide

## Purpose

This guide provides standardized UI kit options based on project type. All agents must select and implement the appropriate UI kit before beginning any functional code implementation.

## UI Development Tools

The following tools are available to assist with UI development:

### Automated UI Consistency Checker
Validates UI components across the application to ensure consistent styling, spacing, and interaction patterns. Use this tool to maintain design consistency throughout the project.

### Drag-and-Drop UI Prototype Builder
Enables rapid creation of UI prototypes without coding. Use this tool for quick visualization of UI concepts and to get stakeholder feedback before implementation.

### Adaptive Design System Selector
Intelligently suggests the most appropriate design system based on project requirements. Use this tool when starting a new project to identify the optimal UI framework.

### Dynamic UI Theme Generator
Creates custom theme variations while maintaining design consistency. Use this tool to generate branded themes that adhere to accessibility guidelines.

### Comprehensive UI Kit Repository with Boilerplate Templates
Provides access to a collection of pre-built UI kits and boilerplate templates for various application types. Use this repository to quickly implement standardized UI designs.

## UI-First Development Principle

**THE UI MUST ALWAYS COME FIRST**

Our development approach requires UI implementation to be prioritized before any functional code is written:

1. Select the appropriate UI kit based on project type
2. Implement the UI components needed for the feature
3. Only then begin implementing the functional code

This principle is non-negotiable and applies to all projects without exception.

## UI Kit Options by Project Type

### SaaS Web Applications

#### Option 1: Tailwind CSS + Alpine.js (Recommended)
**Best for:** Modern, responsive SaaS applications with clean, minimalist design

**Implementation:**
```html
<!-- Tailwind CSS via CDN -->
<link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
<!-- Alpine.js via CDN -->
<script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.12.0/dist/cdn.min.js"></script>
```

**Key Components:**
- Navigation: Responsive navbar with dropdown support
- Dashboard layouts: Card-based, sidebar layouts
- Forms: Clean form components with validation states
- Modals/Dialogs: Lightweight dialog components
- Tables: Responsive data tables
- Notifications: Toast notifications

**Example Boilerplate:** `/docs-system/templates/ui_kits/saas_tailwind_alpine/`

#### Option 2: Bootstrap 5 + Vanilla JS
**Best for:** Enterprise applications with complex UI requirements

**Implementation:**
```html
<!-- Bootstrap CSS -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
<!-- Bootstrap Bundle with Popper -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
```

**Key Components:**
- Navigation: Full-featured responsive navbar
- Dashboard layouts: Container-based layouts with grid system
- Forms: Rich form components with validation
- Modals/Dialogs: Feature-rich modal system
- Tables: Advanced data tables with sorting
- Notifications: Alert components

**Example Boilerplate:** `/docs-system/templates/ui_kits/saas_bootstrap/`

### Admin Dashboards

#### Option 1: Admin LTE (Recommended)
**Best for:** Feature-rich admin interfaces with analytics

**Implementation:**
```html
<!-- AdminLTE CSS -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/admin-lte@3.2/dist/css/adminlte.min.css">
<!-- Font Awesome -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
<!-- jQuery -->
<script src="https://code.jquery.com/jquery-3.6.3.min.js"></script>
<!-- AdminLTE JS -->
<script src="https://cdn.jsdelivr.net/npm/admin-lte@3.2/dist/js/adminlte.min.js"></script>
```

**Key Components:**
- Navigation: Complex sidebar navigation with nested levels
- Dashboard layouts: Analytics-focused with widgets
- Forms: Advanced form components and wizards
- Modals/Dialogs: Context-specific modals
- Tables: Advanced data tables with CRUD operations
- Charts: Multiple chart types for data visualization

**Example Boilerplate:** `/docs-system/templates/ui_kits/admin_lte/`

#### Option 2: Tabler
**Best for:** Modern, clean admin interfaces

**Implementation:**
```html
<!-- Tabler CSS -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/core@1.0.0-beta17/dist/css/tabler.min.css">
<!-- Tabler Icons -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons@1.119.0/iconfont/tabler-icons.min.css">
<!-- Tabler JS -->
<script src="https://cdn.jsdelivr.net/npm/@tabler/core@1.0.0-beta17/dist/js/tabler.min.js"></script>
```

**Key Components:**
- Navigation: Collapsible sidebar with badges and indicators
- Dashboard layouts: Clean, card-based layouts
- Forms: Comprehensive form components
- Modals/Dialogs: Clean, contextual dialogs
- Tables: Responsive data tables with filtering
- Charts: Integration with multiple charting libraries

**Example Boilerplate:** `/docs-system/templates/ui_kits/admin_tabler/`

### Documentation Systems

#### Option 1: Docsify (Recommended)
**Best for:** Single-page documentation sites

**Implementation:**
```html
<!-- Docsify CSS -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/docsify@4/lib/themes/vue.css">
<!-- Docsify JS -->
<script src="https://cdn.jsdelivr.net/npm/docsify@4/lib/docsify.min.js"></script>
<!-- Docsify Plugins -->
<script src="https://cdn.jsdelivr.net/npm/docsify@4/lib/plugins/search.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/docsify-copy-code@2"></script>
```

**Key Components:**
- Navigation: Sidebar navigation with search
- Content: Markdown rendering with code highlighting
- Theme: Clean, readable documentation theme
- Search: Full-text search functionality
- Code blocks: Syntax highlighting and copy functionality

**Example Boilerplate:** `/docs-system/templates/ui_kits/docs_docsify/`

#### Option 2: Documentation Theme (Custom)
**Best for:** Multi-page documentation with advanced features

**Implementation:**
```html
<!-- Our custom documentation CSS -->
<link rel="stylesheet" href="/css/documentation.css">
<!-- Highlight.js for code syntax -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/highlight.js@11.7.0/styles/github.min.css">
<script src="https://cdn.jsdelivr.net/npm/highlight.js@11.7.0/lib/highlight.min.js"></script>
<!-- Documentation JS -->
<script src="/js/documentation.js"></script>
```

**Key Components:**
- Navigation: Multi-level navigation with collapsible sections
- Content: Rich content layout with sidebars
- Search: Advanced search with filtering
- Code blocks: Enhanced code highlighting with examples
- Interactive elements: Tabbed interfaces, expandable sections

**Example Boilerplate:** `/docs-system/templates/ui_kits/docs_custom/`

### Mobile-First Applications

#### Option 1: Framework7
**Best for:** Mobile app-like web experiences

**Implementation:**
```html
<!-- Framework7 CSS -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/framework7@7.1.5/framework7-bundle.min.css">
<!-- Framework7 JS -->
<script src="https://cdn.jsdelivr.net/npm/framework7@7.1.5/framework7-bundle.min.js"></script>
```

**Key Components:**
- Navigation: Mobile-native navigation patterns
- Layouts: App-like layouts with panels
- Forms: Mobile-optimized form components
- Modals/Dialogs: Native-feeling dialogs and popovers
- Lists: Mobile-optimized list views
- Transitions: Smooth page transitions

**Example Boilerplate:** `/docs-system/templates/ui_kits/mobile_framework7/`

#### Option 2: Bootstrap + Mobile Optimizations
**Best for:** Responsive websites with mobile support

**Implementation:**
```html
<!-- Bootstrap CSS -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
<!-- Custom Mobile Optimizations -->
<link href="/css/mobile-optimizations.css" rel="stylesheet">
<!-- Bootstrap Bundle with Popper -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
```

**Key Components:**
- Navigation: Mobile-optimized navbar with offcanvas
- Layouts: Responsive layouts with touch optimization
- Forms: Touch-friendly form inputs
- Modals/Dialogs: Mobile-sized modals
- Tables: Responsive tables with horizontal scroll
- Interactions: Touch-optimized interactions

**Example Boilerplate:** `/docs-system/templates/ui_kits/mobile_bootstrap/`

### E-commerce Applications

#### Option 1: Shoelace Components (Recommended)
**Best for:** Modern, customizable e-commerce interfaces

**Implementation:**
```html
<!-- Shoelace Components -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.4.0/dist/themes/light.css">
<script type="module" src="https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.4.0/dist/shoelace.js"></script>
```

**Key Components:**
- Product Cards: Flexible product display components
- Shopping Cart: Dropdown and fullpage cart components
- Product Gallery: Image galleries with zoom
- Checkout Flow: Multi-step checkout process
- Reviews: Rating and review components
- Filters: Product filtering and sorting

**Example Boilerplate:** `/docs-system/templates/ui_kits/ecommerce_shoelace/`

#### Option 2: Bootstrap E-commerce
**Best for:** Traditional e-commerce sites

**Implementation:**
```html
<!-- Bootstrap CSS -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
<!-- E-commerce Custom CSS -->
<link href="/css/ecommerce.css" rel="stylesheet">
<!-- Bootstrap Bundle with Popper -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
```

**Key Components:**
- Product Listings: Grid and list product displays
- Product Details: Detailed product pages
- Shopping Cart: Cart and checkout flow
- User Account: Account management interfaces
- Order History: Order tracking and history
- Category Navigation: Hierarchical category navigation

**Example Boilerplate:** `/docs-system/templates/ui_kits/ecommerce_bootstrap/`

## Implementation Process

### Step 1: Identify Project Type
Determine which category your project falls into:
- SaaS Web Application
- Admin Dashboard
- Documentation System
- Mobile-First Application
- E-commerce Application
- Other (consult project lead for guidance)

### Step 2: Select UI Kit
Choose the appropriate UI kit from the options provided for your project type.

### Step 3: Implement Base UI
Before writing functional code:
1. Create the HTML structure with the selected UI kit
2. Implement the necessary UI components
3. Create a responsive layout that works on all target devices
4. Test the UI for accessibility and usability

### Step 4: Get UI Approval
Before proceeding to functional code:
1. Document the implemented UI components
2. Create screenshots of the UI for reference
3. Get approval from stakeholders if required

### Step 5: Functional Implementation
Only after completing steps 1-4:
1. Begin implementing the functional code
2. Connect the UI to the backend services
3. Implement business logic and data handling

## Creating Custom UI Kits

If you need to create a custom UI kit for a specialized project type:

1. Document the requirement for a custom UI kit
2. Create a new directory in `/docs-system/templates/ui_kits/`
3. Implement the core components needed for the project
4. Document the usage of each component
5. Add the new UI kit to this guide

## UI Consistency Guidelines

Regardless of the UI kit selected, maintain consistency in:

1. **Color Scheme**: Use consistent colors for similar actions
2. **Typography**: Maintain a consistent type hierarchy
3. **Spacing**: Use consistent spacing throughout the interface
4. **Interaction Patterns**: Keep interaction patterns consistent
5. **Error & Success States**: Use consistent patterns for feedback
6. **Loading States**: Implement consistent loading indicators

## Maintaining Existing Projects

When working on existing projects:

1. Identify the UI kit in use
2. Follow the established patterns and components
3. Maintain consistency with the existing UI
4. Only propose UI kit changes when there is a compelling reason

## Resources for UI Implementation

### Design Systems
- [Material Design](https://material.io/design)
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [IBM Carbon Design System](https://www.carbondesignsystem.com/)

### UI Component Libraries
- [Tailwind UI](https://tailwindui.com/)
- [Bootstrap Components](https://getbootstrap.com/docs/5.3/components/)
- [Material Components Web](https://material.io/components)

### Icons and Assets
- [Font Awesome](https://fontawesome.com/)
- [Material Icons](https://fonts.google.com/icons)
- [Heroicons](https://heroicons.com/)

### Accessibility Resources
- [WCAG 2.1 Guidelines](https://www.w3.org/TR/WCAG21/)
- [A11Y Project Checklist](https://www.a11yproject.com/checklist/)
- [Accessible Color Combinations](https://accessible-colors.com/)

---

*This UI Kit Selection Guide should be updated whenever new UI kits are added or existing ones are updated.*