/** @jsxImportSource theme-ui */
import React from 'react';
import { Flex, Box, Heading, IconButton, useColorMode } from 'theme-ui';
import { 
  Menu, Code, Sun, Moon, Github, Coffee, Save, Play, 
  Settings, HelpCircle, Download, Upload, ChevronLeft
} from 'lucide-react';

interface MenuBarProps {
  toggleSidebar: () => void;
  sidebarOpen: boolean;
}

const MenuBar: React.FC<MenuBarProps> = ({ toggleSidebar, sidebarOpen }) => {
  const [colorMode, setColorMode] = useColorMode();
  
  const toggleColorMode = () => {
    setColorMode(colorMode === 'light' ? 'dark' : 'light');
  };
  
  return (
    <Flex sx={{ width: '100%', justifyContent: 'space-between' }}>
      {/* Left section - Brand and main controls */}
      <Flex variant="layout.menuBarBrand">
        <IconButton
          variant="icon"
          aria-label="Toggle sidebar"
          onClick={toggleSidebar}
          title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
        >
          {sidebarOpen ? <ChevronLeft size={18} /> : <Menu size={18} />}
        </IconButton>
        
        <Box className="logo">
          <Code size={22} strokeWidth={2.5} style={{ color: '#727cf5' }} />
        </Box>
        
        <Heading as="h1" variant="text.gradient">
          MAIK IDE
        </Heading>
        
        {/* Main action buttons */}
        <Flex sx={{ ml: 4, gap: 2 }}>
          <IconButton 
            variant="icon"
            aria-label="Save file" 
            title="Save file (Ctrl+S)"
          >
            <Save size={18} />
          </IconButton>
          
          <IconButton 
            variant="icon"
            aria-label="Run code" 
            title="Run code (F5)"
            sx={{ color: 'success' }}
          >
            <Play size={18} />
          </IconButton>
        </Flex>
      </Flex>
      
      {/* Right section - Tools and settings */}
      <Flex as="nav">
        <Flex as="ul" variant="layout.menuList">
          <li>
            <IconButton 
              variant="icon"
              aria-label="Import"
              title="Import project"
            >
              <Download size={18} />
            </IconButton>
          </li>
          
          <li>
            <IconButton 
              variant="icon"
              aria-label="Export"
              title="Export project"
            >
              <Upload size={18} />
            </IconButton>
          </li>
          
          <li>
            <IconButton 
              variant="icon"
              aria-label="Settings"
              title="Settings"
            >
              <Settings size={18} />
            </IconButton>
          </li>
          
          <li>
            <IconButton 
              variant="icon"
              aria-label="Help"
              title="Help"
            >
              <HelpCircle size={18} />
            </IconButton>
          </li>
          
          <li>
            <IconButton 
              variant="icon"
              aria-label="GitHub"
              title="View on GitHub"
            >
              <Github size={18} />
            </IconButton>
          </li>
          
          <li>
            <IconButton 
              variant="icon"
              aria-label="Buy me a coffee"
              title="Buy me a coffee"
            >
              <Coffee size={18} />
            </IconButton>
          </li>
          
          <li>
            <IconButton 
              variant="icon"
              aria-label="Toggle dark mode"
              onClick={toggleColorMode}
              title={colorMode === 'light' ? "Switch to dark mode" : "Switch to light mode"}
            >
              {colorMode === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </IconButton>
          </li>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default MenuBar;