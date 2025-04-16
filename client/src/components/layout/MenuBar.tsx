/** @jsxImportSource theme-ui */
import React from 'react';
import { Flex, Heading, IconButton, useColorMode } from 'theme-ui';
import { 
  Menu, Code, Sun, Moon, Github, Coffee, Save, Play, 
  Settings, HelpCircle, Download, Upload
} from 'lucide-react';

interface MenuBarProps {
  toggleSidebar: () => void;
}

const MenuBar: React.FC<MenuBarProps> = ({ toggleSidebar }) => {
  const [colorMode, setColorMode] = useColorMode();
  
  const toggleColorMode = () => {
    setColorMode(colorMode === 'light' ? 'dark' : 'light');
  };
  
  return (
    <Flex 
      sx={{
        alignItems: 'center',
        justifyContent: 'space-between',
        p: 2,
        height: 48, // Fixed height to match sidebar
        borderBottom: '1px solid',
        borderColor: 'border',
        bg: 'menuBar',
        color: 'menuText',
      }}
    >
      {/* Left section */}
      <Flex sx={{ alignItems: 'center' }}>
        <IconButton
          aria-label="Toggle sidebar"
          onClick={toggleSidebar}
          sx={{ mr: 2 }}
        >
          <Menu size={18} />
        </IconButton>
        
        <Heading
          as="h1"
          sx={{
            fontSize: 3,
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            background: 'linear-gradient(90deg, #4361ee, #3a86ff, #ff006e)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mr: 3,
          }}
        >
          <Code size={20} strokeWidth={2.5} style={{ marginRight: '8px' }} />
          MAIK IDE
        </Heading>
        
        {/* Quick actions */}
        <Flex sx={{ alignItems: 'center', gap: 1 }}>
          <IconButton aria-label="Save file" title="Save file">
            <Save size={16} />
          </IconButton>
          <IconButton aria-label="Run code" title="Run code">
            <Play size={16} />
          </IconButton>
        </Flex>
      </Flex>
      
      {/* Right section */}
      <Flex sx={{ alignItems: 'center', gap: 1 }}>
        <IconButton 
          aria-label="Import"
          title="Import"
          sx={{ fontSize: 1 }}
        >
          <Download size={16} />
        </IconButton>
        
        <IconButton 
          aria-label="Export"
          title="Export"
          sx={{ fontSize: 1 }}
        >
          <Upload size={16} />
        </IconButton>
        
        <IconButton 
          aria-label="Settings"
          title="Settings"
          sx={{ fontSize: 1 }}
        >
          <Settings size={16} />
        </IconButton>
        
        <IconButton 
          aria-label="Help"
          title="Help"
          sx={{ fontSize: 1 }}
        >
          <HelpCircle size={16} />
        </IconButton>
        
        <IconButton 
          aria-label="GitHub"
          title="View on GitHub"
          sx={{ fontSize: 1 }}
        >
          <Github size={16} />
        </IconButton>
        
        <IconButton 
          aria-label="Buy me a coffee"
          title="Buy me a coffee"
          sx={{ fontSize: 1 }}
        >
          <Coffee size={16} />
        </IconButton>
        
        <IconButton 
          aria-label="Toggle dark mode"
          onClick={toggleColorMode}
          sx={{ fontSize: 1 }}
        >
          {colorMode === 'light' ? <Moon size={16} /> : <Sun size={16} />}
        </IconButton>
      </Flex>
    </Flex>
  );
};

export default MenuBar;