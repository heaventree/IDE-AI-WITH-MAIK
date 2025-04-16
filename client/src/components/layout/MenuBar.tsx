/** @jsxImportSource theme-ui */
import React from 'react';
import { Flex, Box, Button } from 'theme-ui';

interface MenuBarProps {
  // Add props as needed
}

const MenuBar: React.FC<MenuBarProps> = () => {
  return (
    <Flex 
      sx={{ 
        variant: 'layout.menuBar',
        justifyContent: 'space-between'
      }}
    >
      <Flex sx={{ alignItems: 'center' }}>
        <Box sx={{ fontWeight: 'bold', fontSize: 2, mr: 4 }}>
          MAIK IDE
        </Box>
        
        <Flex as="nav" sx={{ gap: 3 }}>
          <Button variant="text" sx={{ py: 1 }}>File</Button>
          <Button variant="text" sx={{ py: 1 }}>Edit</Button>
          <Button variant="text" sx={{ py: 1 }}>View</Button>
          <Button variant="text" sx={{ py: 1 }}>Run</Button>
          <Button variant="text" sx={{ py: 1 }}>Tools</Button>
          <Button variant="text" sx={{ py: 1 }}>Help</Button>
        </Flex>
      </Flex>
      
      <Flex sx={{ alignItems: 'center', gap: 2 }}>
        <Button 
          variant="primary" 
          sx={{ 
            fontSize: 0,
            py: 1,
            px: 2,
            borderRadius: 'default'
          }}
        >
          Run Project
        </Button>
      </Flex>
    </Flex>
  );
};

export default MenuBar;