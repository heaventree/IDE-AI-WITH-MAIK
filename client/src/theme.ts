import { Theme } from 'theme-ui';
import { deep, swiss } from '@theme-ui/presets';

// Combining aspects of different themes with customizations
const theme: Theme = {
  ...deep, // Use deep as base for dark mode
  colors: {
    // Dark mode colors based on NobleUI dark theme
    ...deep.colors,
    primary: '#727cf5', // Vibrant indigo-blue from NobleUI
    secondary: '#6571ff', // Secondary blue-purple 
    accent: '#0acf97', // Accent green from NobleUI
    highlight: '#a6adff', // Lighter highlight blue
    danger: '#fa5c7c', // Error/danger red
    warning: '#ffbc00', // Warning yellow
    success: '#0acf97', // Success green
    info: '#3096f3', // Info blue
    muted: '#283046', // Muted dark blue
    background: '#151937', // Deep blue-black from NobleUI
    text: '#d0d2e0', // Light grayish blue text
    lightgray: '#414561',
    
    // IDE specific colors
    sidebar: '#1a1f33', // Dark sidebar matching NobleUI
    editor: '#151937', // Editor background matching NobleUI
    terminal: '#111425', // Dark terminal background
    terminalText: '#d0d2e0',
    statusBar: '#171c30', // Status bar slightly darker than sidebar
    statusText: '#a6adff', // Status text in highlight color
    menuBar: '#1a1f33', // Exact same as sidebar
    menuText: '#d0d2e0',
    border: '#2d324b', // Border color from NobleUI
    
    // Light mode as an option
    modes: {
      light: {
        ...swiss.colors,
        primary: '#4361ee',
        secondary: '#3d5a80',
        accent: '#4cc9f0',
        highlight: '#ade8f4',
        muted: '#e9ecef',
        background: '#f8f9fa',
        text: '#212529',
        lightgray: '#ced4da',
        sidebar: '#f1f3f5',
        editor: '#ffffff',
        terminal: '#2b2d42',
        terminalText: '#8d99ae',
        statusBar: '#e9ecef',
        statusText: '#495057',
        menuBar: '#ffffff',
        menuText: '#212529',
        border: '#ced4da',
      },
    },
  },
  
  // Custom font sizes
  fontSizes: [12, 14, 16, 18, 20, 24, 32, 48],
  
  // Space scale for margin, padding
  space: [0, 4, 8, 16, 24, 32, 48, 64, 128],
  
  // Custom font settings
  fonts: {
    ...swiss.fonts,
    body: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    heading: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    monospace: 'Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  },
  
  // Component specific styles
  styles: {
    ...swiss.styles,
    root: {
      fontFamily: 'body',
      fontWeight: 'body',
      lineHeight: 'body',
    },
  },
  
  // Custom variants
  buttons: {
    primary: {
      bg: 'primary',
      color: 'white',
      '&:hover': {
        bg: 'secondary',
      },
    },
    secondary: {
      bg: 'secondary',
      color: 'white',
      '&:hover': {
        bg: 'primary',
      },
    },
    ghost: {
      bg: 'transparent',
      color: 'primary',
      border: '1px solid',
      borderColor: 'primary',
      '&:hover': {
        bg: 'highlight',
      },
    },
    icon: {
      bg: 'transparent',
      color: 'text',
      p: 1,
      '&:hover': {
        color: 'primary',
      },
    },
  },

  // IDE specific components
  cards: {
    primary: {
      p: 3,
      borderRadius: 4,
      boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
      bg: 'white',
    },
    compact: {
      p: 2,
      borderRadius: 2,
      boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
      bg: 'white',
    },
  },

  // UI elements
  layout: {
    container: {
      maxWidth: 1200,
    },
    sidebar: {
      width: [0, '240px', '280px'],
      bg: 'sidebar',
      height: '100%',
      overflow: 'auto',
    },
    editor: {
      bg: 'editor',
      height: '100%',
      flex: 1,
    },
    terminal: {
      bg: 'terminal',
      color: 'terminalText',
      fontFamily: 'monospace',
      p: 2,
      height: '200px',
      overflow: 'auto',
    },
    menuBar: {
      bg: 'menuBar',
      color: 'menuText',
      height: '60px',
      display: 'flex',
      alignItems: 'center',
      px: 3,
      boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
    },
    statusBar: {
      bg: 'statusBar',
      color: 'statusText',
      height: '24px',
      fontSize: 0,
      display: 'flex',
      alignItems: 'center',
      px: 2,
    },
  },
};

export default theme;