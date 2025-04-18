/**
 * MAIK IDE Design System
 * 
 * This file defines the core design system tokens, patterns, and utilities
 * that ensure consistent styling across the application. It serves as the
 * foundation for both manually created and AI-generated UI components.
 */

// Import theme manually since TypeScript doesn't recognize the JSON import
// @ts-ignore
const theme = {
  primary: '#7b68ee',
  secondary: '#8e77ff',
  accent: '#00dfb5',
  highlight: '#c678dd',
  background: '#0f1127',
  foreground: '#e2e4f3',
  variant: 'professional', 
  appearance: 'dark',
  radius: 0.5
};

// ===== Color System =====

export const colors = {
  // Primary palette
  primary: {
    default: theme.primary || '#7b68ee',
    hover: '#6658e5',
    pressed: '#5a4cdb',
    muted: 'rgba(123, 104, 238, 0.15)',
    transparent: 'rgba(123, 104, 238, 0.08)',
  },
  
  // Secondary palette
  secondary: {
    default: theme.secondary || '#8e77ff',
    hover: '#7c63ff',
    pressed: '#6a4fff',
    muted: 'rgba(142, 119, 255, 0.15)',
    transparent: 'rgba(142, 119, 255, 0.08)',
  },
  
  // Accent colors
  accent: {
    default: theme.accent || '#00dfb5',
    hover: '#00c9a3',
    pressed: '#00b592',
    muted: 'rgba(0, 223, 181, 0.15)',
    transparent: 'rgba(0, 223, 181, 0.08)',
  },
  
  // Highlight color
  highlight: {
    default: theme.highlight || '#c678dd',
    hover: '#b566cb',
    pressed: '#a455b9',
    muted: 'rgba(198, 120, 221, 0.15)',
    transparent: 'rgba(198, 120, 221, 0.08)',
  },
  
  // Status colors
  status: {
    danger: '#ec4899',
    warning: '#f59e0b',
    success: '#0dcb97',
    info: '#38bdf8',
  },
  
  // Text colors
  text: {
    primary: theme.foreground || '#e2e4f3',
    secondary: '#b8bcce',
    tertiary: '#7a7e96', 
    inverse: '#0f1127',
  },
  
  // Background colors
  background: {
    base: theme.background || '#0f1127',
    elevated: '#151831',
    floating: '#1c1e38',
    hover: 'rgba(123, 104, 238, 0.08)',
    active: 'rgba(123, 104, 238, 0.15)',
  },
  
  // Border colors
  border: {
    default: 'rgba(72, 82, 133, 0.8)',
    muted: 'rgba(72, 82, 133, 0.5)',
    focus: theme.primary || '#7b68ee',
  },
  
  // Component-specific colors
  component: {
    sidebar: '#151831',
    editor: '#0f1127',
    terminal: '#0c0e20',
    menubar: '#151831',
    statusbar: '#101328',
  },
};

// ===== Typography System =====

export const typography = {
  fontFamily: {
    sans: 'Inter, system-ui, sans-serif',
    mono: 'JetBrains Mono, Menlo, monospace',
  },
  
  fontWeight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  
  fontSize: {
    xs: '0.75rem',      // 12px
    sm: '0.8125rem',    // 13px
    base: '0.875rem',   // 14px
    md: '1rem',         // 16px
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '1.875rem',  // 30px
    '4xl': '2.25rem',   // 36px
  },
  
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  }
};

// ===== Spacing System =====

export const spacing = {
  '0': '0',
  '0.5': '0.125rem',  // 2px
  '1': '0.25rem',     // 4px
  '1.5': '0.375rem',  // 6px
  '2': '0.5rem',      // 8px
  '2.5': '0.625rem',  // 10px
  '3': '0.75rem',     // 12px
  '4': '1rem',        // 16px
  '5': '1.25rem',     // 20px
  '6': '1.5rem',      // 24px
  '8': '2rem',        // 32px
  '10': '2.5rem',     // 40px
  '12': '3rem',       // 48px
  '16': '4rem',       // 64px
  '20': '5rem',       // 80px
  '24': '6rem',       // 96px
  '32': '8rem',       // 128px
};

// ===== Shadow System =====

export const shadows = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.2)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.2)',
  glow: '0 0 15px rgba(123, 104, 238, 0.2)',
  'glow-strong': '0 0 20px rgba(123, 104, 238, 0.4)',
};

// ===== Border Radius System =====

export const radii = {
  none: '0',
  sm: '0.25rem',    // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px',
};

// ===== Z-index System =====

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

// ===== Animation System =====

export const animations = {
  transition: {
    fast: '0.15s ease',
    medium: '0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '0.5s cubic-bezier(0.4, 0, 0.2, 1)',
    spring: '0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },
  keyframes: {
    fadeIn: {
      from: { opacity: 0 },
      to: { opacity: 1 },
    },
    slideInUp: {
      from: { transform: 'translateY(10px)', opacity: 0 },
      to: { transform: 'translateY(0)', opacity: 1 },
    },
    pulse: {
      '0%': { opacity: 0.6 },
      '50%': { opacity: 1 },
      '100%': { opacity: 0.6 },
    },
  },
};

// ===== Component Patterns =====

export const patterns = {
  // Button patterns
  button: {
    base: {
      fontWeight: typography.fontWeight.semibold,
      borderRadius: radii.md,
      transition: animations.transition.fast,
    },
    sizes: {
      sm: {
        fontSize: typography.fontSize.xs,
        padding: `${spacing['1.5']} ${spacing['3']}`,
        height: spacing['8'],
      },
      md: {
        fontSize: typography.fontSize.sm,
        padding: `${spacing['2']} ${spacing['4']}`,
        height: spacing['10'],
      },
      lg: {
        fontSize: typography.fontSize.base,
        padding: `${spacing['2.5']} ${spacing['5']}`,
        height: spacing['12'],
      },
    },
    variants: {
      primary: {
        background: colors.primary.default,
        color: colors.text.primary,
        hoverBg: colors.primary.hover,
        activeBg: colors.primary.pressed,
      },
      secondary: {
        background: 'transparent',
        color: colors.text.primary,
        border: `1px solid ${colors.border.default}`,
        hoverBg: colors.background.hover,
        activeBg: colors.background.active,
      },
      accent: {
        background: colors.accent.default,
        color: colors.background.base,
        hoverBg: colors.accent.hover,
        activeBg: colors.accent.pressed,
      },
      ghost: {
        background: 'transparent',
        color: colors.text.primary,
        hoverBg: colors.background.hover,
        activeBg: colors.background.active,
      },
    },
    states: {
      disabled: {
        opacity: 0.5,
        cursor: 'not-allowed',
      },
      loading: {
        position: 'relative',
        cursor: 'progress',
      },
    },
  },
  
  // Input patterns
  input: {
    base: {
      background: colors.background.elevated,
      borderRadius: radii.md,
      border: `1px solid ${colors.border.default}`,
      color: colors.text.primary,
      fontSize: typography.fontSize.sm,
      transition: animations.transition.fast,
    },
    sizes: {
      sm: {
        height: spacing['8'],
        padding: `${spacing['1']} ${spacing['3']}`,
      },
      md: {
        height: spacing['10'],
        padding: `${spacing['2']} ${spacing['4']}`,
      },
      lg: {
        height: spacing['12'],
        padding: `${spacing['3']} ${spacing['5']}`,
      },
    },
    states: {
      focus: {
        borderColor: colors.primary.default,
        boxShadow: `0 0 0 1px ${colors.primary.default}`,
      },
      error: {
        borderColor: colors.status.danger,
        boxShadow: `0 0 0 1px ${colors.status.danger}`,
      },
      disabled: {
        opacity: 0.6,
        cursor: 'not-allowed',
        backgroundColor: colors.background.active,
      },
    },
  },
  
  // Card patterns
  card: {
    base: {
      background: colors.background.elevated,
      borderRadius: radii.lg,
      border: `1px solid ${colors.border.muted}`,
      overflow: 'hidden',
    },
    variants: {
      elevated: {
        boxShadow: shadows.md,
      },
      outline: {
        border: `1px solid ${colors.border.default}`,
      },
      ghost: {
        border: 'none',
        background: 'transparent',
      },
    },
    sizes: {
      sm: {
        padding: spacing['4'],
      },
      md: {
        padding: spacing['6'],
      },
      lg: {
        padding: spacing['8'],
      },
    },
  },
};

// ===== Layout Constants =====

export const layout = {
  menubarHeight: '44px',
  sidebarWidth: '300px',
  statusbarHeight: '24px',
  terminalHeight: '300px',
};

// ===== Helper Functions =====

/**
 * Generates CSS variable value string from a design token
 */
export function tokenToVariable(token: string): string {
  return `var(${token})`;
}

/**
 * Creates a serializable representation of the design system
 * for use in AI context or storage
 */
export function serializeDesignSystem() {
  return {
    colors,
    typography,
    spacing,
    shadows,
    radii,
    animations,
    patterns,
    layout,
  };
}

// Export the full design system
export const designSystem = {
  colors,
  typography,
  spacing,
  shadows,
  radii,
  zIndices,
  animations,
  patterns,
  layout,
  tokenToVariable,
  serializeDesignSystem,
};

export default designSystem;