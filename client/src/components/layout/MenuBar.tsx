/** @jsxImportSource theme-ui */
import React from 'react';
import { Box, Flex, Button, Heading } from 'theme-ui';
import { Menu, FileText, Settings, User, Search, Zap } from 'lucide-react';

interface MenuBarProps {
  toggleSidebar: () => void;
  sidebarOpen: boolean;
}

const MenuBar: React.FC<MenuBarProps> = ({ toggleSidebar, sidebarOpen }) => {
  return (
    <Flex
      sx={{
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 2,
      }}
    >
      {/* Left section */}
      <Flex sx={{ alignItems: 'center', gap: 2 }}>
        <Button
          variant="icon"
          onClick={toggleSidebar}
          title={sidebarOpen ? 'Hide Sidebar' : 'Show Sidebar'}
          aria-label={sidebarOpen ? 'Hide Sidebar' : 'Show Sidebar'}
          sx={{ color: 'foreground' }}
        >
          <Menu size={20} />
        </Button>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Zap size={20} color="var(--theme-ui-colors-primary)" />
          <Heading as="h1" sx={{ fontSize: 2, margin: 0, fontWeight: 'bold' }}>
            MAIK IDE
          </Heading>
        </Box>
        
        <Box sx={{ marginLeft: 3, display: 'flex', gap: 2 }}>
          <Button
            variant="menuItem"
            sx={{ fontSize: 1, padding: '4px 8px' }}
          >
            File
          </Button>
          <Button
            variant="menuItem"
            sx={{ fontSize: 1, padding: '4px 8px' }}
          >
            Edit
          </Button>
          <Button
            variant="menuItem"
            sx={{ fontSize: 1, padding: '4px 8px' }}
          >
            View
          </Button>
          <Button
            variant="menuItem"
            sx={{ fontSize: 1, padding: '4px 8px' }}
          >
            Run
          </Button>
        </Box>
      </Flex>
      
      {/* Right section */}
      <Flex sx={{ alignItems: 'center', gap: 2 }}>
        <Button
          variant="icon"
          title="Search"
          aria-label="Search"
          sx={{ color: 'foreground' }}
        >
          <Search size={18} />
        </Button>
        
        <Button
          variant="icon"
          title="Settings"
          aria-label="Settings"
          sx={{ color: 'foreground' }}
        >
          <Settings size={18} />
        </Button>
        
        <Button
          variant="icon"
          title="User Profile"
          aria-label="User Profile"
          sx={{ 
            width: 28, 
            height: 28, 
            borderRadius: '50%', 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'backgroundElevated',
            color: 'primary',
          }}
        >
          <User size={18} />
        </Button>
      </Flex>
    </Flex>
  );
};

export default MenuBar;