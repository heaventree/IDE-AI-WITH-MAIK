/** @jsxImportSource theme-ui */
import React from 'react';
import { Box, Flex, Text, Button } from 'theme-ui';

interface StatusBarProps {
  onTerminalToggle?: () => void;
}

const StatusBar: React.FC<StatusBarProps> = ({ onTerminalToggle }) => {
  return (
    <Box sx={{ variant: 'layout.statusBar', borderTop: '1px solid', borderColor: 'lightgray' }}>
      <Flex sx={{ justifyContent: 'space-between', alignItems: 'center', height: '100%' }}>
        {/* Left side status items */}
        <Flex>
          <Text sx={{ mr: 3 }}>Line: 42, Col: 10</Text>
          <Text sx={{ mr: 3 }}>UTF-8</Text>
          <Text sx={{ mr: 3 }}>TypeScript</Text>
        </Flex>
        
        {/* Right side status items */}
        <Flex>
          <Button 
            variant="text" 
            onClick={onTerminalToggle}
            sx={{ 
              fontSize: 0,
              px: 2,
              py: 1,
              '&:hover': { bg: 'muted' }
            }}
          >
            Terminal
          </Button>
          <Text sx={{ ml: 3 }}>Ln 42, Col 10</Text>
          <Text sx={{ ml: 3 }}>Spaces: 2</Text>
        </Flex>
      </Flex>
    </Box>
  );
};

export default StatusBar;