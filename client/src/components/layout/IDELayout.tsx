/** @jsxImportSource theme-ui */
import React, { useState } from 'react';
import { Box, Flex, useColorMode } from 'theme-ui';
import MenuBar from './MenuBar';
import Sidebar from './Sidebar';
import StatusBar from './StatusBar';
import Editor from '../editor/Editor';
import Terminal from '../terminal/Terminal';

// Simple IDE Layout that doesn't depend on other components yet
const IDELayout: React.FC = () => {
  const [colorMode, setColorMode] = useColorMode();
  
  // Toggle dark/light mode
  const toggleColorMode = () => {
    setColorMode(colorMode === 'default' ? 'dark' : 'default');
  };
  
  // State for terminal visibility
  const [showTerminal, setShowTerminal] = useState(true);
  
  // Toggle terminal
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
              flex: 1,
              overflow: 'hidden'
            }}
          >
            <Editor />
          </Box>
          
          {/* Terminal (conditionally rendered) */}
          {showTerminal && (
            <Box 
              sx={{ 
                height: '200px',
                minHeight: '200px'
              }}
            >
              <Terminal />
            </Box>
          )}
        </Flex>
      </Flex>
      
      {/* Status Bar */}
      <StatusBar onTerminalToggle={toggleTerminal} />
    </Flex>
  );
};

export default IDELayout;