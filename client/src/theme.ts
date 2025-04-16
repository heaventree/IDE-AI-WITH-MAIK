import { Theme } from 'theme-ui';
import { deep, swiss } from '@theme-ui/presets';

// Combining aspects of different themes with customizations
const theme: Theme = {
  ...deep, // Use deep as base for dark mode
  colors: {
    // Dark mode colors are now the default
    ...deep.colors,
    primary: '#00d8ff', // Vibrant cyan blue
    secondary: '#01b6d1', // Slightly darker cyan
    accent: '#ff2b51', // Vibrant red
    highlight: '#01c2ff', // Highlight cyan
    muted: '#2d3748',
    background: '#1a1d21',
    text: '#f8f9fa',
    lightgray: '#4a5568',
    
    // IDE specific colors
    sidebar: '#1a1d23', // Darker sidebar
    editor: '#282c34',
    terminal: '#1a1a20', // Darker terminal
    terminalText: '#a8b2d1',
    statusBar: '#1c1e24', // Darker status bar
    statusText: '#a8b2d1',
    menuBar: '#1a1d23', // Match sidebar
    menuText: '#f8f9fa',
    border: '#2d3748',
    
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
      height: '48px',
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