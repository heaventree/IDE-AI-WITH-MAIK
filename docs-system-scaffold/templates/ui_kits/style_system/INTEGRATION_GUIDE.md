# Styling System Integration Guide

This guide provides instructions for integrating the Robust Styling System into new or existing projects to prevent CSS styling breakage during feature development.

## Table of Contents

1. [New Project Integration](#new-project-integration)
2. [Existing Project Integration](#existing-project-integration)
3. [Framework-Specific Considerations](#framework-specific-considerations)
4. [Common Issues and Solutions](#common-issues-and-solutions)
5. [Best Practices](#best-practices)

## New Project Integration

For new projects, the styling system should be the **first implementation step** before any UI components are created.

### Step 1: Setup Core Files

Create the following directory structure:

```
src/
├── lib/
│   ├── designTokens.ts    (from template)
│   └── designSystem.ts    (from template)
└── providers/
    └── StyleProvider.tsx  (from template)
```

### Step 2: Configure Your Project

1. **React Projects**:

```jsx
// src/App.jsx or src/App.tsx
import React from 'react';
import StyleProvider from './providers/StyleProvider';

function App() {
  return (
    <StyleProvider initialMode="system">
      {/* Your application content */}
    </StyleProvider>
  );
}

export default App;
```

2. **For Tailwind Projects**:

Add the following to your `tailwind.config.js`:

```js
const { themeConfig } = require('./src/lib/designTokens');

module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: themeConfig.colors,
      fontFamily: themeConfig.fonts,
      fontSize: themeConfig.fontSizes,
      spacing: themeConfig.space,
      borderRadius: themeConfig.radii,
      boxShadow: themeConfig.shadows,
    },
  },
  plugins: [],
};
```

3. **For Theme UI Projects**:

```jsx
// src/theme.js
import { themeConfig } from './lib/designTokens';

export default {
  colors: themeConfig.colors,
  fonts: themeConfig.fonts,
  fontSizes: themeConfig.fontSizes,
  space: themeConfig.space,
  radii: themeConfig.radii,
  shadows: themeConfig.shadows,
};
```

### Step 3: Initialize Design System

Import and initialize the design system in your application entry point:

```jsx
// src/index.jsx or src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { initializeDesignSystem } from './lib/designSystem';

// Initialize the design system
initializeDesignSystem();

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
```

## Existing Project Integration

For existing projects, a phased approach is recommended:

### Step 1: Add Core Files

Add the core styling system files as described in the new project integration section.

### Step 2: Update Existing Components Incrementally

1. **Identify Key Components**: Start with the most commonly used/shared components
2. **Refactor One at a Time**: Update each component to use the design system
3. **Create a Parallel Component Library**: Build new components following the design system alongside existing ones

Example refactoring approach:

```jsx
// Before
function Button({ children }) {
  return (
    <button 
      style={{ 
        backgroundColor: '#1a73e8', 
        color: 'white',
        padding: '8px 16px',
        borderRadius: '4px',
      }}
    >
      {children}
    </button>
  );
}

// After
import { componentStyles } from '../lib/designSystem';

function Button({ children }) {
  return (
    <button style={componentStyles.button.primary}>
      {children}
    </button>
  );
}
```

### Step 3: Set Migration Deadline

Set a deadline after which all new components must use the design system and plan for complete migration of existing components.

## Framework-Specific Considerations

### React

The provided template files are ready for React. Simply follow the integration steps above.

### Vue

For Vue projects:

1. Create a `ThemePlugin.js` that registers the styling system
2. Use the Composition API to create a `useTheme` composable
3. Create a Vue-specific StyleProvider component

### Angular

For Angular projects:

1. Create a ThemeService to manage theme state
2. Use Angular's DI system to provide the service
3. Create components for theme management

## Common Issues and Solutions

### "My theming isn't consistent across components"

**Solution**: Ensure all components reference the design tokens, not hard-coded values.

### "Dark mode doesn't affect all elements"

**Solution**: Check that all color values are using CSS variables or theme references.

### "My third-party components don't match our theme"

**Solution**: Create wrapper components that apply your design system styles to third-party components.

### "CSS specificity conflicts are overriding my styles"

**Solution**: Use the CSS variables approach which is immune to most specificity issues.

## Best Practices

1. **Never Hard-Code Values**: Always reference design tokens
2. **Validate Before Commit**: Create a pre-commit hook that checks for hard-coded values
3. **Document Component Styles**: Include styling notes in component documentation
4. **Create a Storybook**: Showcase all styled components in a Storybook
5. **Automated Tests**: Write tests that verify theme switching works correctly
6. **Regular Audits**: Periodically audit the codebase for styling inconsistencies

## Next Steps

After integrating the styling system:

1. Create a component library based on the design system
2. Document your design tokens and component styles
3. Set up theme switching in your user interface
4. Implement automation to validate styling consistency