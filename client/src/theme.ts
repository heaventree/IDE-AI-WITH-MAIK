import { Theme } from 'theme-ui';
import { deep, swiss } from '@theme-ui/presets';

// Advanced theme system inspired by Webstudio and modern IDEs
const theme: Theme = {
  ...deep, // Use deep as base for dark mode
  colors: {
    // Core semantic colors
    ...deep.colors,
    primary: '#727cf5', // Vibrant indigo-blue from NobleUI
    primaryHover: '#616fe8', // Slightly darker for hover states
    primaryPressed: '#5662e0', // Even darker for pressed states
    primaryMuted: 'rgba(114, 124, 245, 0.15)', // For subtle backgrounds
    primaryTransparent: 'rgba(114, 124, 245, 0.08)', // For very subtle hover states
    
    secondary: '#6571ff', // Secondary blue-purple
    accent: '#0acf97', // Accent green from NobleUI
    highlight: '#a6adff', // Lighter highlight blue
    
    // Status and feedback colors
    danger: '#fa5c7c', // Error/danger red
    dangerMuted: 'rgba(250, 92, 124, 0.15)', // Subtle danger background
    warning: '#ffbc00', // Warning yellow
    warningMuted: 'rgba(255, 188, 0, 0.15)', // Subtle warning background
    success: '#0acf97', // Success green
    successMuted: 'rgba(10, 207, 151, 0.15)', // Subtle success background
    info: '#3096f3', // Info blue
    infoMuted: 'rgba(48, 150, 243, 0.15)', // Subtle info background
    
    // UI colors
    foreground: '#d0d2e0', // Main text color
    foregroundMuted: '#a6a9be', // Secondary text color
    foregroundSubtle: '#6e7191', // Tertiary text color
    foregroundDisabled: '#4d5273', // Disabled text
    
    background: '#151937', // Deep blue-black from NobleUI
    backgroundHover: '#1e2342', // Slightly lighter for hover
    backgroundActive: '#232849', // Even lighter for active states
    backgroundElevated: '#1a1f33', // For elevated UI elements
    backgroundFloating: '#222641', // For floating elements like tooltips
    backgroundDisabled: '#171c30', // For disabled elements
    
    // Borders and dividers
    border: '#2d324b', // Standard border
    borderMuted: '#252a40', // Subtle border 
    borderFocus: '#4a57eb', // Focus outline color
    
    // IDE specific semantic colors
    sidebar: '#1a1f33', // Dark sidebar matching NobleUI
    sidebarItem: 'transparent', // Sidebar item background
    sidebarItemHover: 'rgba(114, 124, 245, 0.08)', // Sidebar item hover
    sidebarItemActive: 'rgba(114, 124, 245, 0.15)', // Sidebar active item
    sidebarText: '#d0d2e0', // Sidebar text (same as foreground)
    sidebarActiveText: '#727cf5', // Active sidebar text color (primary)
    sidebarTextMuted: '#a6a9be', // Sidebar secondary text
    
    editor: '#151937', // Editor background matching NobleUI
    editorGutter: '#1a1f33', // Editor gutter background
    editorLineHighlight: 'rgba(114, 124, 245, 0.05)', // Current line highlight
    editorSelection: 'rgba(114, 124, 245, 0.3)', // Text selection
    
    terminal: '#111425', // Dark terminal background
    terminalText: '#d0d2e0', // Terminal text
    terminalCommand: '#727cf5', // Command text
    terminalOutput: '#a6a9be', // Output text
    
    statusBar: '#171c30', // Status bar slightly darker than sidebar
    statusText: '#a6adff', // Status text in highlight color
    statusIcon: '#727cf5', // Status bar icons
    
    menuBar: '#1a1f33', // Menu bar background
    menuText: '#d0d2e0', // Menu text
    menuPopup: '#222641', // Menu popup background
    menuItemHover: 'rgba(114, 124, 245, 0.08)', // Menu item hover
    
    // Light mode as an option
    modes: {
      light: {
        ...swiss.colors,
        primary: '#4361ee',
        primaryHover: '#3b55d9',
        primaryPressed: '#304ac7',
        primaryMuted: 'rgba(67, 97, 238, 0.15)',
        primaryTransparent: 'rgba(67, 97, 238, 0.08)',
        
        secondary: '#3d5a80',
        accent: '#4cc9f0',
        highlight: '#ade8f4',
        
        danger: '#e63946',
        dangerMuted: 'rgba(230, 57, 70, 0.15)',
        warning: '#f4a261',
        warningMuted: 'rgba(244, 162, 97, 0.15)',
        success: '#2a9d8f',
        successMuted: 'rgba(42, 157, 143, 0.15)',
        info: '#3a86ff',
        infoMuted: 'rgba(58, 134, 255, 0.15)',
        
        foreground: '#212529',
        foregroundMuted: '#495057',
        foregroundSubtle: '#6c757d',
        foregroundDisabled: '#adb5bd',
        
        background: '#f8f9fa',
        backgroundHover: '#e9ecef',
        backgroundActive: '#dee2e6',
        backgroundElevated: '#ffffff',
        backgroundFloating: '#ffffff',
        backgroundDisabled: '#f1f3f6',
        
        border: '#ced4da',
        borderMuted: '#e9ecef',
        borderFocus: '#4361ee',
        
        sidebar: '#f1f3f5',
        sidebarItem: 'transparent',
        sidebarItemHover: 'rgba(67, 97, 238, 0.08)',
        sidebarItemActive: 'rgba(67, 97, 238, 0.15)',
        sidebarText: '#212529',
        sidebarTextMuted: '#6c757d',
        
        editor: '#ffffff',
        editorGutter: '#f1f3f5',
        editorLineHighlight: 'rgba(67, 97, 238, 0.05)',
        editorSelection: 'rgba(67, 97, 238, 0.3)',
        
        terminal: '#2b2d42',
        terminalText: '#edf2f4',
        terminalCommand: '#4361ee',
        terminalOutput: '#8d99ae',
        
        statusBar: '#e9ecef',
        statusText: '#495057',
        statusIcon: '#4361ee',
        
        menuBar: '#ffffff',
        menuText: '#212529',
        menuPopup: '#ffffff',
        menuItemHover: 'rgba(67, 97, 238, 0.08)',
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
  
  // Advanced button variants inspired by Webstudio
  buttons: {
    // Tab button (inactive)
    tab: {
      bg: 'transparent',
      color: 'foregroundMuted',
      fontSize: 1,
      py: 2,
      px: 3,
      borderRight: '1px solid',
      borderColor: 'border',
      borderBottom: 'none',
      borderRadius: 0,
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      minWidth: 120,
      whiteSpace: 'nowrap',
      transition: 'all 0.2s ease',
      '&:hover': {
        color: 'foreground',
        bg: 'backgroundHover',
      },
      '& .tab-close': {
        ml: 2,
        opacity: 0.5,
        '&:hover': {
          opacity: 1,
        },
      },
    },
    
    // Active tab button
    tabActive: {
      bg: 'editor',
      color: 'primary',
      fontSize: 1,
      py: 2,
      px: 3,
      borderRight: '1px solid',
      borderColor: 'border',
      borderBottom: '2px solid',
      borderBottomColor: 'primary',
      borderRadius: 0,
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      minWidth: 120,
      whiteSpace: 'nowrap',
      transition: 'all 0.2s ease',
      '&:hover': {
        color: 'primary',
      },
      '& .tab-close': {
        ml: 2,
        opacity: 0.5,
        '&:hover': {
          opacity: 1,
        },
      },
    },
    
    // Primary action button
    primary: {
      bg: 'primary',
      color: 'white',
      fontSize: 1,
      fontWeight: 500,
      borderRadius: '4px',
      transition: 'all 0.2s ease',
      border: 'none',
      cursor: 'pointer',
      '&:hover': {
        bg: 'primaryHover',
        transform: 'translateY(-1px)',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
      },
      '&:active': {
        bg: 'primaryPressed',
        transform: 'translateY(0px)',
        boxShadow: 'none',
      },
      '&:focus-visible': {
        outline: '2px solid',
        outlineColor: 'borderFocus',
        outlineOffset: '2px',
      },
      '&:disabled': {
        bg: 'backgroundDisabled',
        color: 'foregroundDisabled',
        cursor: 'not-allowed',
        transform: 'none',
        boxShadow: 'none',
      },
    },
    
    // Secondary action button
    secondary: {
      bg: 'backgroundElevated',
      color: 'foreground',
      fontSize: 1,
      fontWeight: 500,
      borderRadius: '4px',
      transition: 'all 0.2s ease',
      border: '1px solid',
      borderColor: 'border',
      cursor: 'pointer',
      '&:hover': {
        bg: 'backgroundHover',
        borderColor: 'primary',
        color: 'primary',
      },
      '&:active': {
        bg: 'backgroundActive',
      },
      '&:focus-visible': {
        outline: '2px solid',
        outlineColor: 'borderFocus',
        outlineOffset: '2px',
      },
      '&:disabled': {
        bg: 'backgroundDisabled',
        color: 'foregroundDisabled',
        borderColor: 'borderMuted',
        cursor: 'not-allowed',
      },
    },
    
    // Subtle button with no background
    ghost: {
      bg: 'transparent',
      color: 'foreground',
      fontSize: 1,
      fontWeight: 500,
      borderRadius: '4px',
      transition: 'all 0.2s ease',
      border: 'none',
      cursor: 'pointer',
      '&:hover': {
        bg: 'sidebarItemHover',
        color: 'primary',
      },
      '&:active': {
        bg: 'sidebarItemActive',
      },
      '&:focus-visible': {
        outline: '2px solid',
        outlineColor: 'borderFocus',
        outlineOffset: '2px',
      },
      '&:disabled': {
        color: 'foregroundDisabled',
        cursor: 'not-allowed',
      },
    },
  },
  
  // Enhanced layout components for a sophisticated IDE
  layout: {
    // Main container
    container: {
      maxWidth: 1200,
      mx: 'auto',
      px: [2, 3, 4],
    },
    
    // Tab bar for the editor
    tabBar: {
      display: 'flex',
      justifyContent: 'space-between',
      bg: 'backgroundElevated',
      borderBottom: '1px solid',
      borderColor: 'border',
    },
    
    // Container for tabs in the editor
    tabContainer: {
      display: 'flex',
      flex: 1,
      overflowX: 'auto',
      overflowY: 'hidden',
      '&::-webkit-scrollbar': {
        height: '4px',
      },
      '&::-webkit-scrollbar-track': {
        background: 'transparent',
      },
      '&::-webkit-scrollbar-thumb': {
        background: 'rgba(114, 124, 245, 0.3)',
        borderRadius: '4px',
      },
    },

    // Tab container helper styles
    tabHelper: {
      display: 'flex',
      alignItems: 'center',
      bg: 'backgroundElevated',
      borderBottom: '1px solid',
      borderColor: 'border',
    },
    
    // Main layout grid
    mainGrid: {
      display: 'grid',
      gridTemplateColumns: 'minmax(280px, 22%) 1fr',
      gridTemplateRows: '60px 1fr 200px 24px',
      gridTemplateAreas: `
        "menubar menubar"
        "sidebar editor"
        "sidebar terminal"
        "statusbar statusbar"
      `,
      height: '100vh',
      overflow: 'hidden',
    },
    
    // Collapsible sidebar
    sidebar: {
      gridArea: 'sidebar',
      bg: 'sidebar',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      borderRight: '1px solid',
      borderColor: 'border',
    },
    
    // Menu bar at the top of the IDE
    menubar: {
      gridArea: 'menubar',
      bg: 'menuBar',
      borderBottom: '1px solid',
      borderColor: 'border',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px',
      height: '60px',
    },
    
    // The editor area
    editor: {
      gridArea: 'editor',
      bg: 'editor',
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
    },
    
    // The terminal area below the editor
    terminal: {
      gridArea: 'terminal',
      bg: 'terminal',
      borderTop: '1px solid',
      borderColor: 'border',
      display: 'flex',
      flexDirection: 'column',
    },
    
    // Status bar at the bottom of the IDE
    statusbar: {
      gridArea: 'statusbar',
      bg: 'statusBar',
      borderTop: '1px solid',
      borderColor: 'border',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 8px',
      fontSize: 0,
      color: 'foregroundMuted',
      height: '24px',
    },
  },
};

export default theme;