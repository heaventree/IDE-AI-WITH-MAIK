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
    sidebarText: '#d0d2e0', // Sidebar text
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
    
    // Outline button
    outline: {
      bg: 'transparent',
      color: 'primary',
      fontSize: 1,
      fontWeight: 500,
      borderRadius: '4px',
      transition: 'all 0.2s ease',
      border: '1px solid',
      borderColor: 'primary',
      cursor: 'pointer',
      '&:hover': {
        bg: 'primaryMuted',
      },
      '&:active': {
        bg: 'primaryMuted',
        opacity: 0.8,
      },
      '&:focus-visible': {
        outline: '2px solid',
        outlineColor: 'borderFocus',
        outlineOffset: '2px',
      },
      '&:disabled': {
        color: 'foregroundDisabled',
        borderColor: 'borderMuted',
        cursor: 'not-allowed',
      },
    },
    
    // Danger button
    danger: {
      bg: 'danger',
      color: 'white',
      fontSize: 1,
      fontWeight: 500,
      borderRadius: '4px',
      transition: 'all 0.2s ease',
      border: 'none',
      cursor: 'pointer',
      '&:hover': {
        bg: 'danger',
        opacity: 0.9,
        transform: 'translateY(-1px)',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
      },
      '&:active': {
        opacity: 1,
        transform: 'translateY(0px)',
        boxShadow: 'none',
      },
      '&:focus-visible': {
        outline: '2px solid',
        outlineColor: 'danger',
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
    
    // Icon button
    icon: {
      bg: 'transparent',
      color: 'foreground',
      p: 1,
      width: '32px',
      height: '32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
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
    
    // Text button (no background or border)
    text: {
      bg: 'transparent',
      color: 'foreground',
      p: 1,
      fontSize: 1,
      borderRadius: '4px',
      transition: 'all 0.2s ease',
      border: 'none',
      cursor: 'pointer',
      '&:hover': {
        color: 'primary',
      },
      '&:active': {
        opacity: 0.8,
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

  // Enhanced card components for modern UI
  cards: {
    // Standard card
    primary: {
      p: 3,
      borderRadius: '6px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      bg: 'backgroundElevated',
      border: '1px solid',
      borderColor: 'borderMuted',
      transition: 'all 0.2s ease',
      '&:hover': {
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        transform: 'translateY(-2px)',
        borderColor: 'border',
      },
    },
    
    // Compact card for tight spaces
    compact: {
      p: 2,
      borderRadius: '4px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
      bg: 'backgroundElevated',
      border: '1px solid',
      borderColor: 'borderMuted',
    },
    
    // Floating card for popups/tooltips
    floating: {
      p: 3,
      borderRadius: '8px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
      bg: 'backgroundFloating',
      border: '1px solid',
      borderColor: 'border',
    },
    
    // Panel card for IDE sections
    panel: {
      p: 0,
      borderRadius: '0',
      bg: 'backgroundElevated', 
      borderBottom: '1px solid',
      borderColor: 'border',
    },
    
    // Glass card with blur effect
    glass: {
      p: 3,
      borderRadius: '12px',
      bg: 'rgba(26, 31, 51, 0.6)',
      backdropFilter: 'blur(10px)',
      border: '1px solid',
      borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    
    // Interactive card with stronger hover effects
    interactive: {
      p: 3,
      borderRadius: '6px',
      bg: 'backgroundElevated',
      border: '1px solid',
      borderColor: 'borderMuted',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      '&:hover': {
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        transform: 'translateY(-2px)',
        borderColor: 'primary',
      },
      '&:active': {
        transform: 'translateY(0)',
        boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
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

    // Status items in the status bar
    statusItems: {
      display: 'flex',
      alignItems: 'center',
      height: '100%',
      color: 'foregroundMuted',
      fontSize: 0,
      '& .status-item': {
        display: 'flex',
        alignItems: 'center',
        px: 2,
        gap: 1,
        borderRight: '1px solid',
        borderColor: 'border',
        height: '100%',
      }
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
      width: '100%',
      bg: 'sidebar',
      height: '100%',
      overflow: 'auto',
      borderRight: '1px solid',
      borderColor: 'border',
      transition: 'all 0.3s ease',
      display: 'flex',
      flexDirection: 'column',
      '&.collapsed': {
        width: '60px',
      },
      // Custom scrollbar
      '&::-webkit-scrollbar': {
        width: '8px',
      },
      '&::-webkit-scrollbar-track': {
        background: 'transparent',
      },
      '&::-webkit-scrollbar-thumb': {
        background: 'rgba(114, 124, 245, 0.3)',
        borderRadius: '4px',
      },
      '&::-webkit-scrollbar-thumb:hover': {
        background: 'rgba(114, 124, 245, 0.5)',
      },
    },
    
    // Sidebar section
    sidebarSection: {
      p: 0,
      my: 2,
      '& h3': {
        fontSize: 1,
        fontWeight: 600,
        color: 'foregroundMuted',
        mx: 3,
        my: 2,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
      }
    },
    
    // Sidebar item
    sidebarItem: {
      py: 2,
      px: 3,
      display: 'flex',
      alignItems: 'center',
      color: 'sidebarText',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      borderLeft: '3px solid',
      borderColor: 'transparent',
      '&:hover': {
        bg: 'sidebarItemHover',
        color: 'primary',
      },
      '&.active': {
        bg: 'sidebarItemActive',
        color: 'primary',
        borderColor: 'primary',
      },
      '& svg': {
        mr: 2,
        flexShrink: 0,
      },
    },
    
    // Main editor area
    editor: {
      gridArea: 'editor',
      bg: 'editor',
      height: '100%',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    },
    
    // Editor tabs
    editorTabs: {
      display: 'flex',
      bg: 'backgroundElevated',
      borderBottom: '1px solid',
      borderColor: 'border',
      overflowX: 'auto',
      '&::-webkit-scrollbar': {
        height: '0px',
      },
    },
    
    // Editor tab
    editorTab: {
      py: 2,
      px: 3,
      display: 'flex',
      alignItems: 'center',
      fontSize: 0,
      color: 'foregroundMuted',
      bg: 'transparent',
      cursor: 'pointer',
      borderRight: '1px solid',
      borderColor: 'borderMuted',
      whiteSpace: 'nowrap',
      transition: 'all 0.2s ease',
      '&:hover': {
        color: 'foreground',
        bg: 'backgroundHover',
      },
      '&.active': {
        color: 'foreground',
        bg: 'editor',
        borderBottom: '2px solid',
        borderColor: 'primary',
        fontWeight: 500,
      },
      '& svg': {
        mr: 2,
        flexShrink: 0,
      },
      '& .close': {
        ml: 2,
        opacity: 0.5,
        '&:hover': {
          opacity: 1,
        },
      },
    },
    
    // Editor content
    editorContent: {
      flex: 1,
      overflow: 'auto',
      position: 'relative',
      fontSize: 1,
      fontFamily: 'monospace',
      lineHeight: 1.6,
      '&::-webkit-scrollbar': {
        width: '10px',
        height: '10px',
      },
      '&::-webkit-scrollbar-track': {
        background: 'transparent',
      },
      '&::-webkit-scrollbar-thumb': {
        background: 'rgba(45, 50, 75, 0.5)',
        borderRadius: '4px',
      },
      '&::-webkit-scrollbar-thumb:hover': {
        background: 'rgba(45, 50, 75, 0.8)',
      },
    },
    
    // Terminal
    terminal: {
      gridArea: 'terminal',
      bg: 'terminal',
      color: 'terminalText',
      fontFamily: 'monospace',
      p: 0,
      height: '100%',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      borderTop: '1px solid',
      borderColor: 'border',
    },
    
    // Terminal header
    terminalHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      bg: 'backgroundElevated',
      px: 3,
      py: 1,
      borderBottom: '1px solid',
      borderColor: 'borderMuted',
      '& h3': {
        fontSize: 0,
        fontWeight: 600,
        color: 'foregroundMuted',
        margin: 0,
      },
    },
    
    // Terminal content
    terminalContent: {
      flex: 1,
      overflow: 'auto',
      p: 2,
      '&::-webkit-scrollbar': {
        width: '8px',
      },
      '&::-webkit-scrollbar-track': {
        background: 'transparent',
      },
      '&::-webkit-scrollbar-thumb': {
        background: 'rgba(45, 50, 75, 0.5)',
        borderRadius: '4px',
      },
      '&::-webkit-scrollbar-thumb:hover': {
        background: 'rgba(45, 50, 75, 0.8)',
      },
      '& .command': {
        color: 'terminalCommand',
        fontWeight: 600,
      },
      '& .output': {
        color: 'terminalOutput',
      },
      '& .error': {
        color: 'danger',
      },
      '& .success': {
        color: 'success',
      },
    },
    
    // Menu bar
    menuBar: {
      gridArea: 'menubar',
      bg: 'menuBar',
      color: 'menuText',
      height: '60px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      px: 3,
      borderBottom: '1px solid',
      borderColor: 'border',
      zIndex: 10,
    },
    
    // Menu bar brand section
    menuBarBrand: {
      display: 'flex',
      alignItems: 'center',
      '& .logo': {
        mr: 2,
        height: '32px',
        width: 'auto',
      },
      '& h1': {
        fontSize: 3,
        fontWeight: 700,
        margin: 0,
        background: 'linear-gradient(90deg, #727cf5 0%, #6571ff 50%, #4a57eb 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      },
    },
    
    // Menu list
    menuList: {
      display: 'flex',
      alignItems: 'center',
      listStyle: 'none',
      margin: 0,
      padding: 0,
      '& li': {
        mr: 3,
        position: 'relative',
      },
      '& li:last-child': {
        mr: 0,
      },
    },
    
    // Menu item
    menuItem: {
      cursor: 'pointer',
      px: 2,
      py: 1,
      borderRadius: '4px',
      transition: 'all 0.2s ease',
      '&:hover': {
        bg: 'menuItemHover',
      },
      '&.active': {
        color: 'primary',
      },
    },
    
    // Status bar
    statusBar: {
      gridArea: 'statusbar',
      bg: 'statusBar',
      color: 'statusText',
      height: '24px',
      fontSize: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      px: 2,
      borderTop: '1px solid',
      borderColor: 'border',
    },
    
    // Status items
    statusItems: {
      display: 'flex',
      alignItems: 'center',
      '& .status-item': {
        display: 'flex',
        alignItems: 'center',
        px: 2,
        borderRight: '1px solid',
        borderColor: 'borderMuted',
        '& svg': {
          mr: 1,
        },
      },
      '& .status-item:last-child': {
        borderRight: 'none',
      },
    },
    
    // Collaboration panel
    collaborationPanel: {
      position: 'absolute',
      bottom: '50px',
      right: '20px',
      width: '300px',
      maxHeight: '50vh',
      bg: 'backgroundFloating',
      borderRadius: '8px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
      border: '1px solid',
      borderColor: 'border',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 1000,
    },
    
    // Collaboration header
    collaborationHeader: {
      bg: 'primary',
      color: 'white',
      py: 2,
      px: 3,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      '& h3': {
        margin: 0,
        fontSize: 1,
        fontWeight: 600,
      },
    },
    
    // Collaboration content
    collaborationContent: {
      flex: 1,
      overflow: 'auto',
      p: 0,
      '&::-webkit-scrollbar': {
        width: '8px',
      },
      '&::-webkit-scrollbar-track': {
        background: 'transparent',
      },
      '&::-webkit-scrollbar-thumb': {
        background: 'rgba(114, 124, 245, 0.3)',
        borderRadius: '4px',
      },
      '&::-webkit-scrollbar-thumb:hover': {
        background: 'rgba(114, 124, 245, 0.5)',
      },
    },
    
    // Modal
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      bg: 'rgba(21, 25, 55, 0.7)', // Based on background color
      backdropFilter: 'blur(4px)',
      zIndex: 1000,
    },
    
    // Modal content
    modalContent: {
      width: '600px',
      maxWidth: '90vw',
      maxHeight: '85vh',
      bg: 'backgroundFloating',
      borderRadius: '8px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      border: '1px solid',
      borderColor: 'border',
    },
    
    // Modal header
    modalHeader: {
      bg: 'backgroundElevated',
      py: 3,
      px: 4,
      borderBottom: '1px solid',
      borderColor: 'borderMuted',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      '& h2': {
        margin: 0,
        fontSize: 2,
        fontWeight: 600,
      },
    },
    
    // Modal body
    modalBody: {
      flex: 1,
      overflow: 'auto',
      p: 4,
      '&::-webkit-scrollbar': {
        width: '8px',
      },
      '&::-webkit-scrollbar-track': {
        background: 'transparent',
      },
      '&::-webkit-scrollbar-thumb': {
        background: 'rgba(114, 124, 245, 0.3)',
        borderRadius: '4px',
      },
      '&::-webkit-scrollbar-thumb:hover': {
        background: 'rgba(114, 124, 245, 0.5)',
      },
    },
    
    // Modal footer
    modalFooter: {
      bg: 'backgroundElevated',
      py: 3,
      px: 4,
      borderTop: '1px solid',
      borderColor: 'borderMuted',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      '& button': {
        ml: 2,
      },
    },
  },
  
  // Text variants for different UI contexts
  text: {
    heading: {
      fontFamily: 'heading',
      fontWeight: 700,
      lineHeight: '1.3',
      color: 'foreground',
    },
    title: {
      fontFamily: 'heading',
      fontSize: 4,
      fontWeight: 700,
      lineHeight: '1.3',
      color: 'foreground',
      mb: 3,
    },
    subtitle: {
      fontFamily: 'heading',
      fontSize: 3,
      fontWeight: 600,
      lineHeight: '1.4',
      color: 'foregroundMuted',
      mb: 2,
    },
    label: {
      fontFamily: 'body',
      fontSize: 1,
      fontWeight: 600,
      color: 'foreground',
      mb: 1,
    },
    caption: {
      fontFamily: 'body',
      fontSize: 0,
      fontWeight: 400,
      color: 'foregroundMuted',
    },
    code: {
      fontFamily: 'monospace',
      fontSize: 1,
      bg: 'rgba(45, 50, 75, 0.5)',
      color: 'foreground',
      p: 1,
      borderRadius: '4px',
    },
    gradient: {
      background: 'linear-gradient(90deg, #727cf5 0%, #6571ff 50%, #4a57eb 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
  },
  
  // Form elements
  forms: {
    // Standard input
    input: {
      borderColor: 'border',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderRadius: '4px',
      p: 2,
      bg: 'backgroundElevated',
      color: 'foreground',
      fontFamily: 'body',
      fontSize: 1,
      outline: 'none',
      width: '100%',
      transition: 'all 0.2s ease',
      '&:hover': {
        borderColor: 'primary',
      },
      '&:focus': {
        borderColor: 'primary',
        boxShadow: '0 0 0 3px rgba(114, 124, 245, 0.15)',
      },
      '&:disabled': {
        bg: 'backgroundDisabled',
        color: 'foregroundDisabled',
        cursor: 'not-allowed',
      },
      '&::placeholder': {
        color: 'foregroundSubtle',
      },
    },
    
    // Textarea
    textarea: {
      borderColor: 'border',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderRadius: '4px',
      p: 2,
      bg: 'backgroundElevated',
      color: 'foreground',
      fontFamily: 'body',
      fontSize: 1,
      outline: 'none',
      width: '100%',
      minHeight: '120px',
      resize: 'vertical',
      transition: 'all 0.2s ease',
      '&:hover': {
        borderColor: 'primary',
      },
      '&:focus': {
        borderColor: 'primary',
        boxShadow: '0 0 0 3px rgba(114, 124, 245, 0.15)',
      },
      '&:disabled': {
        bg: 'backgroundDisabled',
        color: 'foregroundDisabled',
        cursor: 'not-allowed',
      },
      '&::placeholder': {
        color: 'foregroundSubtle',
      },
    },
    
    // Select
    select: {
      borderColor: 'border',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderRadius: '4px',
      p: 2,
      paddingRight: '2rem',
      bg: 'backgroundElevated',
      color: 'foreground',
      fontFamily: 'body',
      fontSize: 1,
      outline: 'none',
      width: '100%',
      transition: 'all 0.2s ease',
      cursor: 'pointer',
      '&:hover': {
        borderColor: 'primary',
      },
      '&:focus': {
        borderColor: 'primary',
        boxShadow: '0 0 0 3px rgba(114, 124, 245, 0.15)',
      },
      '&:disabled': {
        bg: 'backgroundDisabled',
        color: 'foregroundDisabled',
        cursor: 'not-allowed',
      },
    },
    
    // Checkbox
    checkbox: {
      color: 'primary',
      borderColor: 'border',
      borderWidth: '2px',
      borderStyle: 'solid',
      borderRadius: '3px',
      bg: 'backgroundElevated',
      '&:hover': {
        borderColor: 'primary',
      },
      '&:checked': {
        bg: 'primary',
        borderColor: 'primary',
      },
      '&:focus': {
        boxShadow: '0 0 0 3px rgba(114, 124, 245, 0.15)',
      },
      '&:disabled': {
        bg: 'backgroundDisabled',
        borderColor: 'borderMuted',
        cursor: 'not-allowed',
      },
    },
    
    // Radio
    radio: {
      color: 'primary',
      borderColor: 'border',
      borderWidth: '2px',
      borderStyle: 'solid',
      bg: 'backgroundElevated',
      '&:hover': {
        borderColor: 'primary',
      },
      '&:checked': {
        bg: 'primary',
        borderColor: 'primary',
      },
      '&:focus': {
        boxShadow: '0 0 0 3px rgba(114, 124, 245, 0.15)',
      },
      '&:disabled': {
        bg: 'backgroundDisabled',
        borderColor: 'borderMuted',
        cursor: 'not-allowed',
      },
    },
    
    // Slider
    slider: {
      color: 'primary',
      '&::-webkit-slider-thumb': {
        bg: 'primary',
        border: 'none',
        '&:hover': {
          bg: 'primaryHover',
        },
      },
      '&:focus': {
        '&::-webkit-slider-thumb': {
          boxShadow: '0 0 0 3px rgba(114, 124, 245, 0.15)',
        },
      },
      '&:disabled': {
        bg: 'backgroundDisabled',
        '&::-webkit-slider-thumb': {
          bg: 'foregroundDisabled',
        },
      },
    },
    
    // Label
    label: {
      fontSize: 1,
      fontWeight: 600,
      mb: 1,
      display: 'block',
      color: 'foreground',
    },
  },
};

export default theme;