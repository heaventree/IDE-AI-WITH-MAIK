/**
 * MAIK AI Coding App - Design Tokens
 * 
 * This is the SINGLE SOURCE OF TRUTH for all design values in the application.
 * All component styling should reference these tokens rather than hardcoded values.
 * 
 * DO NOT MODIFY THIS FILE without team approval and documentation.
 * Changes here affect the entire application styling.
 */

// Color System - Based on the existing theme.json and design system specs
export const colors = {
  // Brand colors
  primary: '#7b68ee',
  primaryHover: '#6658e5',
  primaryPressed: '#5a4cdb',
  primaryMuted: 'rgba(123, 104, 238, 0.15)',
  primaryTransparent: 'rgba(123, 104, 238, 0.08)',
  
  secondary: '#8e77ff',
  accent: '#00dfb5',
  highlight: '#c678dd',
  
  // Semantic colors
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  
  // Text colors
  foreground: '#e2e4f3',
  foregroundMuted: '#b8bcce',
  foregroundSubtle: '#7a7e96',
  
  // Background colors
  background: '#0f1127',
  backgroundElevated: '#151831',
  backgroundFloating: '#1c1e38',
  backgroundHover: 'rgba(123, 104, 238, 0.08)',
  backgroundActive: 'rgba(123, 104, 238, 0.15)',
  
  // Borders
  border: 'rgba(72, 82, 133, 0.8)',
  borderMuted: 'rgba(72, 82, 133, 0.5)',
  
  // Component-specific
  sidebar: '#151831',
  editor: '#0f1127',
  terminal: '#0c0e20',
  menubar: '#151831',
  statusbar: '#101328',
};

// Spacing System
export const spacing = {
  0: '0',
  1: '0.25rem', // 4px
  2: '0.5rem',  // 8px
  3: '0.75rem', // 12px
  4: '1rem',    // 16px
  5: '1.25rem', // 20px
  6: '1.5rem',  // 24px
  8: '2rem',    // 32px
  10: '2.5rem', // 40px
  12: '3rem',   // 48px
  16: '4rem',   // 64px
  20: '5rem',   // 80px
  24: '6rem',   // 96px
};

// Typography System
export const typography = {
  fontFamily: {
    sans: 'Inter, system-ui, -apple-system, sans-serif',
    mono: 'JetBrains Mono, Menlo, Monaco, Consolas, monospace',
  },
  fontSizes: {
    xs: '0.75rem',  // 12px
    sm: '0.875rem', // 14px
    md: '1rem',     // 16px
    lg: '1.125rem', // 18px
    xl: '1.25rem',  // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
  },
  fontWeights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeights: {
    none: '1',
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
  },
};

// Border Radius
export const radii = {
  none: '0',
  sm: '0.25rem', // 4px
  md: '0.375rem', // 6px
  lg: '0.5rem',  // 8px
  xl: '0.75rem', // 12px
  '2xl': '1rem', // 16px
  full: '9999px',
};

// Shadows
export const shadows = {
  none: 'none',
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  glow: '0 0 15px rgba(123, 104, 238, 0.2)',
};

// Transitions
export const transitions = {
  fast: '0.15s ease-out',
  medium: '0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '0.5s cubic-bezier(0.16, 1, 0.3, 1)',
};

// Z-index
export const zIndices = {
  0: '0',
  10: '10',
  20: '20',
  30: '30',
  40: '40',
  50: '50',
  dropdown: '1000',
  modal: '1400',
  popover: '1500',
  tooltip: '1600',
};

// Component dimensions
export const sizes = {
  menubarHeight: '44px',
  sidebarWidth: '300px',
  statusbarHeight: '24px',
  terminalHeight: '300px',
};

// Export a CSS variables generator function
export function generateCssVariables() {
  return `
    :root {
      /* Colors */
      --primary: ${colors.primary};
      --primary-hover: ${colors.primaryHover};
      --primary-pressed: ${colors.primaryPressed};
      --primary-muted: ${colors.primaryMuted};
      --primary-transparent: ${colors.primaryTransparent};
      
      --secondary: ${colors.secondary};
      --accent: ${colors.accent};
      --highlight: ${colors.highlight};
      
      --success: ${colors.success};
      --warning: ${colors.warning};
      --error: ${colors.error};
      --info: ${colors.info};
      
      --foreground: ${colors.foreground};
      --foreground-muted: ${colors.foregroundMuted};
      --foreground-subtle: ${colors.foregroundSubtle};
      
      --background: ${colors.background};
      --background-elevated: ${colors.backgroundElevated};
      --background-floating: ${colors.backgroundFloating};
      --background-hover: ${colors.backgroundHover};
      --background-active: ${colors.backgroundActive};
      
      --border: ${colors.border};
      --border-muted: ${colors.borderMuted};
      
      --sidebar: ${colors.sidebar};
      --editor: ${colors.editor};
      --terminal: ${colors.terminal};
      --menubar: ${colors.menubar};
      --statusbar: ${colors.statusbar};
      
      /* Spacing */
      --space-1: ${spacing[1]};
      --space-2: ${spacing[2]};
      --space-3: ${spacing[3]};
      --space-4: ${spacing[4]};
      --space-5: ${spacing[5]};
      --space-6: ${spacing[6]};
      --space-8: ${spacing[8]};
      --space-10: ${spacing[10]};
      --space-12: ${spacing[12]};
      --space-16: ${spacing[16]};
      --space-20: ${spacing[20]};
      --space-24: ${spacing[24]};
      
      /* Typography */
      --font-sans: ${typography.fontFamily.sans};
      --font-mono: ${typography.fontFamily.mono};
      
      --font-size-xs: ${typography.fontSizes.xs};
      --font-size-sm: ${typography.fontSizes.sm};
      --font-size-md: ${typography.fontSizes.md};
      --font-size-lg: ${typography.fontSizes.lg};
      --font-size-xl: ${typography.fontSizes.xl};
      --font-size-2xl: ${typography.fontSizes['2xl']};
      --font-size-3xl: ${typography.fontSizes['3xl']};
      --font-size-4xl: ${typography.fontSizes['4xl']};
      
      --font-weight-normal: ${typography.fontWeights.normal};
      --font-weight-medium: ${typography.fontWeights.medium};
      --font-weight-semibold: ${typography.fontWeights.semibold};
      --font-weight-bold: ${typography.fontWeights.bold};
      
      /* Border Radius */
      --radius-sm: ${radii.sm};
      --radius-md: ${radii.md};
      --radius-lg: ${radii.lg};
      --radius-xl: ${radii.xl};
      --radius-2xl: ${radii['2xl']};
      
      /* Shadows */
      --shadow-sm: ${shadows.sm};
      --shadow-md: ${shadows.md};
      --shadow-lg: ${shadows.lg};
      --shadow-xl: ${shadows.xl};
      --shadow-glow: ${shadows.glow};
      
      /* Transitions */
      --transition-fast: ${transitions.fast};
      --transition-medium: ${transitions.medium};
      --transition-slow: ${transitions.slow};
      
      /* Sizes */
      --menubar-height: ${sizes.menubarHeight};
      --sidebar-width: ${sizes.sidebarWidth};
      --statusbar-height: ${sizes.statusbarHeight};
      --terminal-height: ${sizes.terminalHeight};
    }
  `;
}

// Generate theme.json compatible object
export const themeConfig = {
  variant: "professional",
  primary: colors.primary,
  secondary: colors.secondary,
  accent: colors.accent,
  highlight: colors.highlight,
  background: colors.background,
  foreground: colors.foreground,
  appearance: "dark",
  radius: 0.5
};

export default {
  colors,
  spacing,
  typography,
  radii,
  shadows,
  transitions,
  zIndices,
  sizes,
  generateCssVariables,
  themeConfig
};