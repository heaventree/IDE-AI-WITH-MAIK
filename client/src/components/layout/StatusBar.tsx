/** @jsxImportSource theme-ui */
import React from 'react';
import { Flex, Box, Button, useColorMode } from 'theme-ui';

interface StatusBarProps {
  onTerminalToggle?: () => void;
}

const StatusBar: React.FC<StatusBarProps> = ({ onTerminalToggle }) => {
  const [colorMode, setColorMode] = useColorMode();
  
  // Toggle dark/light mode
  const toggleColorMode = () => {
    setColorMode(colorMode === 'default' ? 'dark' : 'default');
  };
  
  return (
    <Flex 
      sx={{ 
        variant: 'layout.statusBar',
        justifyContent: 'space-between',
        fontSize: 0,
      }}
    >
      <Flex sx={{ alignItems: 'center', gap: 3 }}>
        <Box>Ready</Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ color: 'primary' }}>JavaScript</Box>
          <Box>|</Box>
          <Box>Line: 1, Col: 1</Box>
        </Box>
      </Flex>
      
      <Flex sx={{ alignItems: 'center', gap: 2 }}>
        {onTerminalToggle && (
          <Button 
            variant="text" 
            onClick={onTerminalToggle}
            sx={{ 
              fontSize: 0,
              py: 0,
              height: '100%',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            Toggle Terminal
          </Button>
        )}
        
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

export default StatusBar;