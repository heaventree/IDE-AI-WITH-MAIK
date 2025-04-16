/** @jsxImportSource theme-ui */
import React, { useState } from 'react';
import { Box, Flex, Button, useColorMode } from 'theme-ui';
import MenuBar from './MenuBar';
import Sidebar from './Sidebar';

// Simple IDE Layout that doesn't depend on other components yet
const IDELayout: React.FC = () => {
  const [colorMode, setColorMode] = useColorMode();
  
  // Toggle dark/light mode
  const toggleColorMode = () => {
    setColorMode(colorMode === 'default' ? 'dark' : 'default');
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
        <Sidebar />
        
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
              bg: 'editor',
              p: 3,
              flex: 1,
              fontFamily: 'monospace'
            }}
          >
            <Box sx={{ fontWeight: 'bold', mb: 2 }}>Editor</Box>
            <Box sx={{ whiteSpace: 'pre-wrap' }}>
              {`// Sample code
import React from 'react';

function App() {
  return (
    <div>
      <h1>Hello, MAIK IDE!</h1>
      <p>This is a code editor placeholder</p>
    </div>
  );
}

export default App;`}
            </Box>
          </Box>
          
          {/* Terminal */}
          <Box 
            sx={{ 
              bg: 'terminal',
              color: 'terminalText',
              fontFamily: 'monospace',
              p: 2,
              height: '200px',
              minHeight: '200px'
            }}
          >
            <Box sx={{ mb: 1 }}>Welcome to MAIK Terminal</Box>
            <Box sx={{ mb: 1 }}>Type commands here...</Box>
            <Box>{'> _'}</Box>
          </Box>
        </Flex>
      </Flex>
      
      {/* Status Bar */}
      <Flex 
        sx={{ 
          height: '24px', 
          bg: 'statusBar',
          color: 'statusText',
          fontSize: 0,
          alignItems: 'center',
          px: 2,
          borderTop: '1px solid',
          borderColor: 'lightgray',
          justifyContent: 'space-between'
        }}
      >
        <Box>Ready</Box>
        <Button 
          variant="text"
          onClick={toggleColorMode}
          sx={{ 
            fontSize: 0,
            py: 0,
            height: '100%',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {colorMode === 'default' ? '🌙 Dark Mode' : '☀️ Light Mode'}
        </Button>
      </Flex>
    </Flex>
  );
};

export default IDELayout;