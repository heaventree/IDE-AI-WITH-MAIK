/**
 * MAIK IDE Design System - Centralized Design Management
 * 
 * This file serves as the single source of truth for all design tokens,
 * visual styles, and theming across the application.
 */

// =============================================================================
// COLOR SYSTEM
// =============================================================================
export const colors = {
  // Brand Colors
  brand: {
    primary: '#7b68ee',    // Main purple
    secondary: '#8e77ff',  // Lighter purple
    accent: '#00dfb5',     // Teal accent
    highlight: '#c678dd',  // Pink highlight
  },
  
  // Backgrounds
  background: {
    base: '#0f1127',       // Main background
    elevated: '#1a1f33',   // Slightly elevated surfaces
    floating: '#222641',   // Floating elements (cards, popovers)
    hover: '#1e2342',      // Hover state
    active: '#232849',     // Active/pressed state
    disabled: '#171c30',   // Disabled elements
  },
  
  // Foreground/Text Colors
  foreground: {
    base: '#e2e4f3',       // Primary text
    muted: '#a6a9be',      // Secondary text
    subtle: '#6e7191',     // Tertiary text
    disabled: '#4d5273',   // Disabled text
  },
  
  // Semantic colors
  status: {
    success: {
      base: '#0acf97',
      muted: 'rgba(10, 207, 151, 0.15)',
    },
    warning: {
      base: '#ffbc00',
      muted: 'rgba(255, 188, 0, 0.15)',
    },
    danger: {
      base: '#fa5c7c',
      muted: 'rgba(250, 92, 124, 0.15)',
    },
    info: {
      base: '#3096f3',
      muted: 'rgba(48, 150, 243, 0.15)',
    },
  },
  
  // Borders
  border: {
    base: '#2d324b',       // Standard borders
    muted: '#252a40',      // Subtle borders
    focus: '#4a57eb',      // Focus rings
  },
  
  // IDE-specific colors
  ide: {
    sidebar: '#1a1f33',
    sidebarText: '#d0d2e0',
    sidebarItemHover: 'rgba(114, 124, 245, 0.08)',
    sidebarItemActive: 'rgba(114, 124, 245, 0.15)',
    
    terminal: '#111425',
    terminalText: '#d0d2e0',
    
    editor: '#151937',
    editorGutter: '#1a1f33',
    editorSelection: 'rgba(114, 124, 245, 0.3)',
    editorLineHighlight: 'rgba(114, 124, 245, 0.05)',
    
    statusBar: '#171c30',
    statusText: '#a6adff',
    
    menuBar: '#1a1f33',
    menuText: '#d0d2e0',
    menuPopup: '#222641',
  },
  
  // Light mode colors (if needed)
  light: {
    background: {
      base: '#f8f9fa',
      elevated: '#ffffff',
      floating: '#ffffff',
      hover: '#e9ecef',
      active: '#dee2e6',
      disabled: '#f1f3f6',
    },
    foreground: {
      base: '#212529',
      muted: '#495057',
      subtle: '#6c757d',
      disabled: '#adb5bd',
    },
    // ... other light mode colors
  }
};

// =============================================================================
// TYPOGRAPHY SYSTEM
// =============================================================================
export const typography = {
  fonts: {
    body: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    heading: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: 'Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  },
  fontSizes: {
    xs: '0.75rem',   // 12px
    sm: '0.875rem',  // 14px
    base: '1rem',    // 16px
    lg: '1.125rem',  // 18px
    xl: '1.25rem',   // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
  },
  fontWeights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeights: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
  letterSpacings: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
};

// =============================================================================
// SPACING SYSTEM
// =============================================================================
export const spacing = {
  0: '0',
  0.5: '0.125rem', // 2px
  1: '0.25rem',    // 4px
  1.5: '0.375rem', // 6px
  2: '0.5rem',     // 8px
  2.5: '0.625rem', // 10px
  3: '0.75rem',    // 12px
  3.5: '0.875rem', // 14px
  4: '1rem',       // 16px
  5: '1.25rem',    // 20px
  6: '1.5rem',     // 24px
  8: '2rem',       // 32px
  10: '2.5rem',    // 40px
  12: '3rem',      // 48px
  16: '4rem',      // 64px
  20: '5rem',      // 80px
  24: '6rem',      // 96px
  32: '8rem',      // 128px
};

// =============================================================================
// SHADOWS AND EFFECTS
// =============================================================================
export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  none: 'none',
  
  // Floating elements
  floating: '0 4px 20px rgba(0, 0, 0, 0.25)',
  
  // Card shadows
  card: '0 2px 8px rgba(0, 0, 0, 0.15)',
  cardHover: '0 4px 12px rgba(0, 0, 0, 0.2)',
};

// =============================================================================
// BORDER RADIUS
// =============================================================================
export const radii = {
  none: '0',
  sm: '0.125rem',   // 2px
  default: '0.25rem', // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px',   // Full rounded (circle for square elements)
};

// =============================================================================
// TRANSITIONS
// =============================================================================
export const transitions = {
  default: 'all 0.2s ease',
  fast: 'all 0.1s ease',
  slow: 'all 0.3s ease',
  
  // Specific transitions
  transform: 'transform 0.2s ease',
  opacity: 'opacity 0.2s ease',
  colors: 'background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease',
  shadow: 'box-shadow 0.2s ease',
};

// =============================================================================
// Z-INDEX SCALE
// =============================================================================
export const zIndices = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
};

// =============================================================================
// COMPONENT-SPECIFIC STYLES
// =============================================================================

// Button styles
export const buttonStyles = {
  // Base button style
  base: {
    borderRadius: radii.default,
    transition: transitions.default,
    fontWeight: typography.fontWeights.medium,
    fontSize: typography.fontSizes.sm,
  },
  
  // Button variants
  variants: {
    primary: {
      bg: colors.brand.primary,
      color: colors.foreground.base,
      hoverBg: '#8977f0', // slightly lighter
      activeBg: '#6a59dd', // slightly darker
    },
    secondary: {
      bg: colors.background.elevated,
      color: colors.foreground.base,
      border: `1px solid ${colors.border.base}`,
      hoverBg: colors.background.hover,
      hoverBorder: colors.brand.primary,
    },
    ghost: {
      bg: 'transparent',
      color: colors.foreground.base,
      hoverBg: colors.ide.sidebarItemHover,
      hoverColor: colors.brand.primary,
    },
    outline: {
      bg: 'transparent',
      color: colors.brand.primary,
      border: `1px solid ${colors.brand.primary}`,
      hoverBg: 'rgba(123, 104, 238, 0.15)', // primaryMuted
    },
    danger: {
      bg: colors.status.danger.base,
      color: colors.foreground.base,
      hoverBg: '#ff647f', // slightly lighter red
      activeBg: '#e54d6d', // slightly darker red
    },
  },
  
  // Button sizes
  sizes: {
    xs: {
      height: '1.5rem', // 24px
      px: spacing[2], 
      fontSize: typography.fontSizes.xs,
    },
    sm: {
      height: '2rem', // 32px
      px: spacing[3],
      fontSize: typography.fontSizes.xs,
    },
    md: {
      height: '2.5rem', // 40px
      px: spacing[4],
      fontSize: typography.fontSizes.sm,
    },
    lg: {
      height: '3rem', // 48px
      px: spacing[6],
      fontSize: typography.fontSizes.base,
    },
  },
};

// Card styles
export const cardStyles = {
  base: {
    borderRadius: radii.lg,
    backgroundColor: colors.background.elevated,
    borderColor: colors.border.muted,
  },
  variants: {
    standard: {
      padding: spacing[4],
      boxShadow: shadows.card,
    },
    compact: {
      padding: spacing[3],
      boxShadow: shadows.sm,
    },
    floating: {
      padding: spacing[4],
      boxShadow: shadows.floating,
      backgroundColor: colors.background.floating,
    },
    glass: {
      padding: spacing[4],
      borderRadius: radii.xl,
      backgroundColor: 'rgba(26, 31, 51, 0.6)',
      backdropFilter: 'blur(10px)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
    },
  },
};

// Input styles
export const inputStyles = {
  base: {
    borderRadius: radii.default,
    borderColor: colors.border.base,
    backgroundColor: colors.background.base,
    color: colors.foreground.base,
    fontSize: typography.fontSizes.sm,
    padding: `${spacing[2]} ${spacing[3]}`,
    height: '2.5rem', // 40px standard height
    focusBorderColor: colors.brand.primary,
    focusRingColor: 'rgba(123, 104, 238, 0.3)', // primaryMuted
  },
  variants: {
    outline: {
      border: `1px solid ${colors.border.base}`,
    },
    filled: {
      backgroundColor: colors.background.elevated,
      border: 'none',
    },
    flushed: {
      borderRadius: '0',
      borderTop: 'none',
      borderLeft: 'none',
      borderRight: 'none',
      borderBottomWidth: '1px',
      px: spacing[0],
    },
  },
  sizes: {
    sm: {
      height: '2rem', // 32px
      fontSize: typography.fontSizes.xs,
      padding: `${spacing[1]} ${spacing[2]}`,
    },
    md: {
      height: '2.5rem', // 40px
      fontSize: typography.fontSizes.sm,
      padding: `${spacing[2]} ${spacing[3]}`,
    },
    lg: {
      height: '3rem', // 48px
      fontSize: typography.fontSizes.base,
      padding: `${spacing[2.5]} ${spacing[4]}`,
    },
  },
};

// =============================================================================
// THEME CONFIG - Export for use with theme.json
// =============================================================================
export const themeConfig = {
  variant: "professional",
  primary: colors.brand.primary,
  secondary: colors.brand.secondary,
  accent: colors.brand.accent,
  highlight: colors.brand.highlight,
  background: colors.background.base,
  foreground: colors.foreground.base,
  appearance: "dark",
  radius: 0.5
};

// =============================================================================
// HELPERS - Generate CSS variables from tokens
// =============================================================================

/**
 * Generate CSS variables for design tokens
 * Usage: import { generateCssVariables } from 'designSystem';
 *        const cssVariables = generateCssVariables();
 *        // Insert into stylesheet or use with styled-components/emotion
 */
export function generateCssVariables() {
  // Flatten the tokens into CSS variables
  const flattenObject = (obj: Record<string, any>, prefix = '') => {
    return Object.keys(obj).reduce((acc: Record<string, string>, key) => {
      const prefixedKey = prefix ? `${prefix}-${key}` : key;
      
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        Object.assign(acc, flattenObject(obj[key], prefixedKey));
      } else {
        acc[`--${prefixedKey}`] = obj[key];
      }
      
      return acc;
    }, {});
  };
  
  // Generate variables for each token category
  const colorVars = flattenObject(colors, 'color');
  const spacingVars = Object.entries(spacing).reduce((acc: Record<string, string>, [key, value]) => {
    acc[`--spacing-${key}`] = value;
    return acc;
  }, {});
  const radiusVars = flattenObject(radii, 'radius');
  const fontVars = flattenObject(typography, 'font');
  const shadowVars = flattenObject(shadows, 'shadow');
  
  // Combine all variables
  const allVars = {
    ...colorVars,
    ...spacingVars,
    ...radiusVars,
    ...fontVars,
    ...shadowVars,
  };
  
  // Convert to CSS string
  return Object.entries(allVars)
    .map(([name, value]) => `${name}: ${value};`)
    .join('\n');
}

/**
 * Example usage:
 * 
 * // In a component
 * import { colors, typography, buttonStyles } from './designSystem';
 * 
 * const CustomButton = styled.button`
 *   background-color: ${colors.brand.primary};
 *   font-size: ${typography.fontSizes.sm};
 *   border-radius: ${buttonStyles.base.borderRadius};
 *   
 *   &:hover {
 *     background-color: ${buttonStyles.variants.primary.hoverBg};
 *   }
 * `;
 * 
 * // To manage theme.json
 * import { themeConfig } from './designSystem';
 * // Then write themeConfig to theme.json
 */

export default {
  colors,
  typography,
  spacing,
  shadows,
  radii,
  transitions,
  zIndices,
  buttonStyles,
  cardStyles,
  inputStyles,
  themeConfig,
  generateCssVariables,
};