# MAIK-AI-CODING-APP - Design System

## Overview

The MAIK-AI-CODING-APP Design System provides a unified visual language and component library for creating consistent, accessible, and performant interfaces across the platform. It prioritizes developer experience, readability, and productivity while maintaining a professional aesthetic.

## Brand Guidelines

### Brand Voice & Personality

Professional, concise, and helpful. Communications should empower developers by being clear, informative, and respectful of their time and expertise.

### Logo Usage

- **Primary Logo**: The primary logo should be used in the header/navigation of applications and on official communications. Always use the SVG version for digital applications.
- **Secondary Logo**: The monochrome version can be used in situations where the full-color logo would be visually distracting or when space is limited.
- **Minimum Size**: The logo should not be displayed smaller than 24px in height to maintain legibility.
- **Clear Space**: Maintain a clear space around the logo equal to the height of the 'M' in the logo.
- **Do's and Don'ts**: 
  - Do: Use the logo on appropriate backgrounds with sufficient contrast, maintain aspect ratio, use the SVG version when possible.
  - Don't: Stretch or distort the logo, change the colors, rotate the logo, or place it on busy backgrounds that reduce visibility.

## Color System

### Primary Colors

| Color Name | Hex Code | RGB | Usage |
|------------|----------|-----|-------|
| Brand Blue | #3B82F6 | 59, 130, 246 | Primary actions, key UI elements, header backgrounds |
| Dark Blue | #1E40AF | 30, 64, 175 | Secondary actions, hover states for primary elements |
| Light Blue | #93C5FD | 147, 197, 253 | Highlights, focus states, secondary UI elements |

### Secondary Colors

| Color Name | Hex Code | RGB | Usage |
|------------|----------|-----|-------|
| Slate | #64748B | 100, 116, 139 | Subdued UI elements, secondary text |
| Indigo | #6366F1 | 99, 102, 241 | Accent elements, visual indicators |
| Teal | #14B8A6 | 20, 184, 166 | Success states, completion indicators |

### Semantic Colors

| Color Name | Hex Code | RGB | Usage |
|------------|----------|-----|-------|
| Success | #22C55E | 34, 197, 94 | Success messages, completion indicators, positive actions |
| Warning | #F59E0B | 245, 158, 11 | Warning messages, alerts requiring attention but not critical |
| Error | #EF4444 | 239, 68, 68 | Error messages, destructive actions, critical alerts |
| Info | #3B82F6 | 59, 130, 246 | Informational messages, neutral alerts, general notifications |

### Neutral Colors

| Color Name | Hex Code | RGB | Usage |
|------------|----------|-----|-------|
| White | #FFFFFF | 255, 255, 255 | Background for light mode, text for dark mode |
| Gray 100 | #F3F4F6 | 243, 244, 246 | Subtle backgrounds, hover states in light mode |
| Gray 700 | #374151 | 55, 65, 81 | Text in light mode, UI elements in dark mode |
| Gray 900 | #111827 | 17, 24, 39 | Background for dark mode, text for light mode |

### Color Combinations

| Combination | Usage | Contrast Ratio |
|-------------|-------|---------------|
| Brand Blue on White | Primary buttons, interactive elements | 4.5:1 (WCAG AA compliant) |
| White on Brand Blue | Button text, inverted UI elements | 4.5:1 (WCAG AA compliant) |
| Dark Blue on Light Blue | Highlighted information, callouts | 3:1 (WCAG AA compliant for large text) |

## Typography

### Font Families

- **Primary Font**: Inter, a versatile sans-serif typeface optimized for screen readability
- **Secondary Font**: SF Pro Display, used for headings and emphasized UI elements
- **Code Font**: Jetbrains Mono, a monospaced font designed for code with ligature support

### Type Scale

| Name | Size | Line Height | Weight | Usage |
|------|------|-------------|--------|-------|
| Display | 32px | 40px | 700 | Main headings, page titles |
| Heading | 24px | 32px | 600 | Section headings, modal titles |
| Subheading | 18px | 28px | 500 | Subsection headings, list titles |
| Body | 16px | 24px | 400 | Body text, main content, UI elements |
| Small | 14px | 20px | 400 | Secondary text, captions, helper text |

### Text Styles

| Style Name | Description | CSS |
|------------|-------------|-----|
| Code Block | Used for displaying code samples and snippets | font-family: 'Jetbrains Mono', monospace; font-size: 14px; line-height: 1.5; background-color: #f9fafb; padding: 1rem; border-radius: 0.375rem; |
| Inline Code | Used for code references within normal text | font-family: 'Jetbrains Mono', monospace; font-size: 0.875em; background-color: #f9fafb; padding: 0.2em 0.4em; border-radius: 0.25rem; |
| Error Message | Used for error notifications and alerts | font-family: 'Inter', sans-serif; font-size: 14px; color: #EF4444; font-weight: 500; |

## Spacing System

| Name | Size | Usage |
|------|------|-------|
| xs | 4px | Minimal spacing, tight UI elements, icon padding |
| sm | 8px | Default spacing between related elements |
| md | 16px | Standard spacing between UI components |
| lg | 24px | Spacing between distinct sections |
| xl | 32px | Major section breaks, large component spacing |
| 2xl | 48px | Page section spacing, major layout divisions |

## Grid System

MAIK-AI-CODING-APP uses a 12-column responsive grid system with adjustable gutters based on viewport size. The grid adapts to different screen sizes through our breakpoint system.

### Breakpoints

| Name | Size | Description |
|------|------|-------------|
| sm | 640px | Small devices, portrait phones |
| md | 768px | Medium devices, landscape phones, small tablets |
| lg | 1024px | Large devices, tablets, small laptops |
| xl | 1280px | Extra large devices, desktops, large laptops |

## UI Components

### Primary Components

#### Buttons

| Button Type | Usage | States | Example |
|-------------|-------|--------|---------|
| Primary Button | Main actions, form submissions, key user flows | Default, Hover, Focus, Active, Disabled | <Button variant="primary">Submit</Button> |
| Secondary Button | Alternative actions, secondary options | Default, Hover, Focus, Active, Disabled | <Button variant="secondary">Cancel</Button> |
| Tertiary Button | Minor actions, inline options, compact UI areas | Default, Hover, Focus, Active, Disabled | <Button variant="tertiary">Learn More</Button> |

#### Form Controls

| Control Type | Usage | States | Example |
|--------------|-------|--------|---------|
| Text Input | Single-line text entry, basic information collection | Default, Focus, Filled, Error, Disabled | <Input placeholder="Enter your name" /> |
| Select Dropdown | Option selection from predefined choices | Default, Open, Selected, Disabled | <Select><SelectItem value="option1">Option 1</SelectItem></Select> |
| Checkbox | Boolean selections, multiple choice options | Unchecked, Checked, Indeterminate, Disabled | <Checkbox label="Agree to terms" /> |

#### Navigation

| Nav Type | Usage | States | Example |
|----------|-------|--------|---------|
| Main Navigation | Primary app navigation, top-level sections | Default, Active, Hover | <NavigationMenu><NavigationMenuItem>Dashboard</NavigationMenuItem></NavigationMenu> |
| Sidebar Navigation | Secondary navigation, subsections | Default, Active, Collapsed, Expanded | <Sidebar><SidebarItem>Settings</SidebarItem></Sidebar> |

### Composite Components

| Component | Usage | Properties | Example |
|-----------|-------|------------|---------|
| Card | Content containers, grouped information | title, content, footer, variant | <Card title="Feature">Content goes here</Card> |
| Modal Dialog | Focus interactions, confirmations, forms | title, content, actions, size, closeButton | <Dialog><DialogTitle>Confirm Action</DialogTitle></Dialog> |
| Toast Notification | Temporary feedback, status updates | message, type, duration, action | <Toast variant="success">Operation completed</Toast> |

## Icons & Illustrations

### Icon System

MAIK-AI-CODING-APP uses Lucide React icons for consistent UI elements, with customizable size, color, and weight attributes.

### Icon Usage Guidelines

- Keep icon sizes consistent with the surrounding UI elements
- Use icons to enhance meaning, not replace text for critical actions
- Maintain proper color contrast for accessibility when using icons

### Illustration Style

Clean, minimal illustrations with a focus on clarity and relevance to developer workflows. Illustrations should use the brand color palette and maintain a consistent weight and style.

## Animation & Motion

### Principles

- Be purposeful - animations should serve a function, not distract
- Be responsive - animations should feel instantaneous and enhance the sense of direct manipulation
- Be subtle - animations should feel natural and not call attention to themselves

### Timing

| Speed | Duration | Easing | Usage |
|-------|----------|--------|-------|
| Fast | 150ms | ease-out | Micro-interactions, feedback, state changes |
| Medium | 300ms | ease-in-out | Transitions, revealing content |
| Slow | 500ms | cubic-bezier(0.16, 1, 0.3, 1) | Major transitions, modal dialogs |

### Common Animations

| Animation | Usage | Example |
|-----------|-------|---------|
| Fade | Appearing/disappearing elements, toast notifications | opacity: 0 to opacity: 1 |
| Slide | Off-canvas menus, drawer components | transform: translateX(-100%) to translateX(0) |
| Scale | Modal dialogs, popovers, dropdown menus | transform: scale(0.9) to scale(1) |

## Implementation

### CSS Variables

```css
:root {
  /* Color Variables */
  --primary: #3B82F6;
  --primary-dark: #1E40AF;
  --primary-light: #93C5FD;
  --secondary: #64748B;
  --secondary-alt: #6366F1;
  --accent: #14B8A6;
  --success: #22C55E;
  --warning: #F59E0B;
  --error: #EF4444;
  --info: #3B82F6;
  --background: #FFFFFF;
  --background-alt: #F3F4F6;
  --text: #111827;
  --text-secondary: #374151;
  
  /* Typography Variables */
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-display: 'SF Pro Display', 'Inter', sans-serif;
  --font-mono: 'Jetbrains Mono', monospace;
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-md: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 1.875rem;
  --font-size-4xl: 2.25rem;
  
  /* Spacing Variables */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.25rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-10: 2.5rem;
  --space-12: 3rem;
  --space-16: 4rem;
  --space-20: 5rem;
  --space-24: 6rem;
  
  /* Animation Variables */
  --transition-fast: 150ms ease-out;
  --transition-medium: 300ms ease-in-out;
  --transition-slow: 500ms cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
}
