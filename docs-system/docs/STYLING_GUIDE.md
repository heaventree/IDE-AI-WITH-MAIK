# MAIK AI Coding App - Styling Guide

## Overview

This document establishes the **mandatory styling approach** for the MAIK AI Coding App. Due to past instability with multiple competing styling methods, this guide serves as the official standard that **must** be followed by all developers to ensure UI consistency and prevent layout breakage.

## Single Source of Truth

All visual styling in the application must derive from a single source of truth:

1. **Design Tokens** (`client/src/lib/designTokens.ts`): The primary source for all color values, spacing, typography, shadows, etc.
2. **Design System** (`client/src/lib/designSystem.ts`): The access point for all styling patterns, providing organized component styles.
3. **CSS Variables** (`client/src/index.css`): Auto-generated from the design tokens, providing CSS access to tokens.

Never add hardcoded values or alternative styling approaches. The design system will be actively enforced and monitored in code reviews.

## How to Use the Design System

### For Tailwind CSS Components (Recommended):

```tsx
import { buttonStyles } from '@/lib/designSystem';
import { Button } from '@/components/ui/Button';

// Use Tailwind classes that reference CSS variables
function MyComponent() {
  return (
    <div className="bg-background text-foreground p-4">
      <h2 className="text-xl font-semibold mb-2">My Component</h2>
      <Button className="bg-primary text-white hover:bg-primary-hover">
        Click Me
      </Button>
    </div>
  );
}
```

### For Theme UI Components (Legacy):

```tsx
import { Box, Text, Button } from 'theme-ui';
import { sx } from '@/lib/designSystem';

function MyComponent() {
  return (
    <Box sx={sx({ 
      bg: 'background', 
      color: 'foreground',
      p: 4 
    })}>
      <Text sx={sx({ 
        fontSize: 'xl', 
        fontWeight: 'semibold',
        mb: 2 
      })}>
        My Component
      </Text>
      <Button
        sx={sx(buttonStyles.variants.primary)}
      >
        Click Me
      </Button>
    </Box>
  );
}
```

## Component Styling Guidelines

1. **Use CSS Variables**: Always reference CSS variables for any values defined in the design system:
   ```css
   .my-component {
     background-color: var(--background);
     color: var(--foreground);
     padding: var(--space-4);
   }
   ```

2. **Responsive Design**: Use the design system's spacing and breakpoints for consistent layouts:
   ```tsx
   <div className="p-2 md:p-4 lg:p-6">Content</div>
   ```

3. **Component Patterns**: For common UI patterns, use the provided styling patterns:
   ```tsx
   import { cardStyles } from '@/lib/designSystem';
   
   <div style={{
     borderRadius: cardStyles.base.borderRadius,
     background: cardStyles.base.bg,
     padding: cardStyles.base.padding,
     ...cardStyles.variants.primary
   }}>
     Card Content
   </div>
   ```

## Adding New Styles

If you need to introduce a new component or style pattern:

1. First, check if it can be built from existing design tokens
2. If needed, **add the pattern to the design system first**
3. Only then implement the component using these design system patterns

Example of adding a new style pattern:

```ts
// Add to client/src/lib/designSystem.ts
export const tooltipStyles = {
  base: {
    bg: colors.backgroundFloating,
    color: colors.foreground,
    padding: `${spacing[2]} ${spacing[3]}`,
    borderRadius: radii.md,
    boxShadow: shadows.lg,
    fontSize: typography.fontSizes.sm,
  },
  variants: {
    default: { /* ... */ },
    info: { /* ... */ },
  }
};

// Export it
export default {
  // ...existing exports
  tooltipStyles,
};
```

## Modifying Existing Styles

To change any visual aspect of the application:

1. Update `designTokens.ts` for any global token values that need changing
2. Check if the change impacts other components and adjust accordingly
3. Test thoroughly on multiple screen sizes
4. Document any significant changes

## Prohibited Practices

The following styling approaches are **strictly prohibited**:

1. **Direct CSS Imports**: Don't create separate CSS files with competing styles
2. **Hardcoded Values**: Never use hardcoded color values, spacing, etc.
3. **Inline Styles**: Don't use inline styles with hardcoded values
4. **Mixed Approaches**: Don't mix styling approaches within a component
5. **CSS-in-JS Libraries**: Don't introduce additional CSS-in-JS libraries

## Tools & Utilities

The design system provides several helpers:

- `tw`: Helper for consistent Tailwind classes
- `sx`: Helper for consistent Theme UI styling
- `updateThemeJson`: Updates theme.json from design tokens

## Testing & Verification

Before committing changes:

1. Verify your UI works at multiple screen sizes
2. Ensure you've only used design system values
3. Validate that components look consistent with the rest of the app
4. Test in both Light and Dark modes if applicable

## Compatibility Note

This design system bridges both Tailwind and Theme UI to provide a transition path, but all new components should be built with the Tailwind approach for long-term consistency.

---

*Last updated: April 17, 2025*