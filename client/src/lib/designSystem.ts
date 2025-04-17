/**
 * MAIK AI Coding App - Design System
 * 
 * This module acts as a bridge between our design tokens and the UI framework.
 * It provides utilities for consistent styling across the application.
 * 
 * IMPORTANT: 
 * - When adding new components, use this system
 * - Do not modify styles directly in components
 * - Any new design patterns should be added here first
 */

import tokens from './designTokens';

// Re-export tokens for direct access
export const designTokens = tokens;
export const {
  colors,
  spacing,
  typography,
  radii,
  shadows,
  transitions,
  zIndices,
  sizes,
  themeConfig,
  generateCssVariables
} = tokens;

// Button style patterns
export const buttonStyles = {
  base: {
    borderRadius: radii.md,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    transition: transitions.fast,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: `${spacing[2]} ${spacing[4]}`,
  },
  variants: {
    primary: {
      bg: colors.primary,
      color: 'white',
      hoverBg: colors.primaryHover,
      activeBg: colors.primaryPressed,
      focusBorder: colors.primary,
    },
    secondary: {
      bg: colors.backgroundElevated,
      color: colors.foreground,
      border: `1px solid ${colors.border}`,
      hoverBg: colors.backgroundHover,
      hoverBorder: colors.primary,
      hoverColor: colors.primary,
      activeBg: colors.backgroundActive,
    },
    outline: {
      bg: 'transparent',
      color: colors.primary,
      border: `1px solid ${colors.primary}`,
      hoverBg: colors.primaryMuted,
      activeBg: colors.primaryMuted,
    },
    ghost: {
      bg: 'transparent',
      color: colors.foreground,
      hoverBg: colors.backgroundHover,
      hoverColor: colors.primary,
      activeBg: colors.backgroundActive,
    },
    danger: {
      bg: colors.error,
      color: 'white',
      hoverBg: colors.error,
      hoverOpacity: 0.9,
    },
  },
  sizes: {
    sm: {
      height: '28px',
      fontSize: typography.fontSizes.xs,
      padding: `0 ${spacing[3]}`,
    },
    md: {
      height: '36px',
      fontSize: typography.fontSizes.sm,
      padding: `0 ${spacing[4]}`,
    },
    lg: {
      height: '44px',
      fontSize: typography.fontSizes.md,
      padding: `0 ${spacing[5]}`,
    },
  },
};

// Card style patterns
export const cardStyles = {
  base: {
    borderRadius: radii.lg,
    bg: colors.backgroundElevated,
    padding: spacing[4],
  },
  variants: {
    primary: {
      border: `1px solid ${colors.borderMuted}`,
      boxShadow: shadows.md,
    },
    floating: {
      bg: colors.backgroundFloating,
      boxShadow: shadows.lg,
    },
    panel: {
      borderRadius: '0',
      padding: '0',
      borderBottom: `1px solid ${colors.border}`,
    },
    interactive: {
      cursor: 'pointer',
      transition: transitions.medium,
      hoverTransform: 'translateY(-2px)',
      hoverBoxShadow: shadows.lg,
      hoverBorderColor: colors.primary,
    },
  },
};

// Input style patterns
export const inputStyles = {
  base: {
    height: '36px',
    bg: colors.background,
    color: colors.foreground,
    border: `1px solid ${colors.border}`,
    borderRadius: radii.md,
    fontSize: typography.fontSizes.sm,
    padding: `${spacing[2]} ${spacing[3]}`,
    transition: transitions.fast,
  },
  states: {
    hover: {
      borderColor: colors.borderMuted,
    },
    focus: {
      borderColor: colors.primary,
      boxShadow: `0 0 0 2px ${colors.primaryMuted}`,
    },
    error: {
      borderColor: colors.error,
      boxShadow: `0 0 0 2px rgba(239, 68, 68, 0.15)`,
    },
    disabled: {
      bg: colors.backgroundElevated,
      color: colors.foregroundMuted,
      cursor: 'not-allowed',
    },
  },
};

// Helper function to generate Tailwind class strings from design system values
export function tw(strings: TemplateStringsArray, ...values: any[]) {
  return String.raw({ raw: strings }, ...values);
}

// Helper function to apply design system values to Theme UI sx prop
export function sx(styles: Record<string, any>) {
  return styles;
}

// Helper function to sync theme.json with our design tokens
export function updateThemeJson() {
  return JSON.stringify(themeConfig, null, 2);
}

// Export the design system for use throughout the application
export default {
  colors,
  spacing,
  typography,
  radii,
  shadows,
  transitions,
  zIndices,
  sizes,
  buttonStyles,
  cardStyles,
  inputStyles,
  themeConfig,
  generateCssVariables,
  tw,
  sx,
  updateThemeJson,
};