/** @jsxImportSource theme-ui */
import React, { useState } from 'react';
import { Box, Flex, IconButton, useColorMode } from 'theme-ui';
import MenuBar from './MenuBar';
import Sidebar from './Sidebar';
import Editor from '../editor/Editor';
import Terminal from '../terminal/Terminal';
import StatusBar from './StatusBar';

// Simple icons
const SunIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="5"></circle>
    <line x1="12" y1="1" x2="12" y2="3"></line>
    <line x1="12" y1="21" x2="12" y2="23"></line>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
    <line x1="1" y1="12" x2="3" y2="12"></line>
    <line x1="21" y1="12" x2="23" y2="12"></line>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
  </svg>
);

const MoonIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
  </svg>
);

const IDELayout: React.FC = () => {
  const [colorMode, setColorMode] = useColorMode();
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [terminalHeight, setTerminalHeight] = useState(200);
  const [showTerminal, setShowTerminal] = useState(true);

  // Toggle dark/light mode
  const toggleColorMode = () => {
    setColorMode(colorMode === 'default' ? 'dark' : 'default');
  };

  // Toggle terminal visibility
  const toggleTerminal = () => {
    setShowTerminal(!showTerminal);
  };

  return (
    <Flex 
      sx={{ 
        flexDirection: 'column', 
        height: '100vh',
        bg: 'background',
        color: 'text',
        overflow: 'hidden'
      }}
    >
      {/* Top Menu Bar */}
      <MenuBar />
      
      {/* Main Content Area */}
      <Flex sx={{ flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        <Box 
          sx={{ 
            variant: 'layout.sidebar', 
            width: `${sidebarWidth}px`,
            minWidth: `${sidebarWidth}px`,
            transition: 'width 0.2s ease'
          }}
        >
          <Sidebar />
        </Box>
        
        {/* Editor and Terminal Area */}
        <Flex 
          sx={{ 
            flexDirection: 'column', 
            flex: 1,
            overflow: 'hidden'
          }}
        >
          {/* Editor */}
          <Box 
            sx={{ 
              variant: 'layout.editor',
              flex: 1
            }}
          >
            <Editor />
          </Box>
          
          {/* Terminal (collapsible) */}
          {showTerminal && (
            <Box 
              sx={{ 
                variant: 'layout.terminal',
                height: `${terminalHeight}px`,
                minHeight: `${terminalHeight}px`,
                transition: 'height 0.2s ease'
              }}
            >
              <Terminal />
            </Box>
          )}
        </Flex>
      </Flex>
      
      {/* Status Bar */}
      <StatusBar onTerminalToggle={toggleTerminal} />
      
      {/* Theme Toggle Button */}
      <IconButton
        onClick={toggleColorMode}
        aria-label="Toggle dark mode"
        sx={{
          position: 'fixed',
          bottom: '40px',
          right: '20px',
          zIndex: 1000,
          bg: 'background',
          color: 'text',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          border: '1px solid',
          borderColor: 'lightgray',
          '&:hover': {
            bg: 'muted',
          }
        }}
      >
        {colorMode === 'default' ? <MoonIcon /> : <SunIcon />}
      </IconButton>
    </Flex>
  );
};

export default IDELayout;