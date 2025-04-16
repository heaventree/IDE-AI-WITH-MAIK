/** @jsxImportSource theme-ui */
import React, { useState } from 'react';
import { Box, Flex, Text, Button } from 'theme-ui';

const MenuBar: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const menuItems = [
    {
      label: 'File',
      items: ['New File', 'Open...', 'Save', 'Save As...', 'Export...', 'Close']
    },
    {
      label: 'Edit',
      items: ['Undo', 'Redo', 'Cut', 'Copy', 'Paste', 'Find...', 'Replace...']
    },
    {
      label: 'View',
      items: ['Command Palette', 'Terminal', 'Explorer', 'Problems', 'Output']
    },
    {
      label: 'Project',
      items: ['Open Project', 'Project Settings', 'Run', 'Build']
    },
    {
      label: 'AI',
      items: ['Generate Code', 'Explain Code', 'Optimize', 'Suggest Refactor']
    },
    {
      label: 'Help',
      items: ['Documentation', 'Keyboard Shortcuts', 'About']
    }
  ];

  const handleMenuClick = (label: string) => {
    if (activeMenu === label) {
      setActiveMenu(null);
    } else {
      setActiveMenu(label);
    }
  };

  const handleMenuItemClick = (item: string) => {
    console.log(`Menu item clicked: ${item}`);
    setActiveMenu(null);
  };

  return (
    <Box sx={{ variant: 'layout.menuBar', borderBottom: '1px solid', borderColor: 'lightgray' }}>
      <Flex sx={{ alignItems: 'center' }}>
        {/* Logo */}
        <Text sx={{ fontWeight: 'bold', mr: 4, fontSize: 2 }}>Bolt DIY</Text>
        
        {/* Menu Items */}
        <Flex sx={{ flex: 1 }}>
          {menuItems.map(menu => (
            <Box key={menu.label} sx={{ position: 'relative' }}>
              <Button
                variant="text"
                onClick={() => handleMenuClick(menu.label)}
                sx={{
                  py: 2,
                  px: 3,
                  bg: activeMenu === menu.label ? 'muted' : 'transparent',
                  color: 'text',
                  cursor: 'pointer',
                  fontWeight: 'normal',
                  '&:hover': {
                    bg: 'muted'
                  }
                }}
              >
                {menu.label}
              </Button>
              
              {/* Dropdown Menu */}
              {activeMenu === menu.label && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    zIndex: 10,
                    minWidth: '180px',
                    bg: 'background',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'lightgray',
                    p: 1
                  }}
                >
                  {menu.items.map(item => (
                    <Box
                      key={item}
                      onClick={() => handleMenuItemClick(item)}
                      sx={{
                        py: 1,
                        px: 2,
                        cursor: 'pointer',
                        borderRadius: 1,
                        '&:hover': {
                          bg: 'muted'
                        }
                      }}
                    >
                      {item}
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          ))}
        </Flex>
      </Flex>
    </Box>
  );
};

export default MenuBar;