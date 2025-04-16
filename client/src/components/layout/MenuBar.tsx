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
  
  // Reusable hover style for all icon buttons
  const iconButtonHoverStyle = {
    '&:hover': {
      color: 'primary',
      bg: 'rgba(114, 124, 245, 0.08)',
    }
  };
  
  return (
    <Flex 
      sx={{
        alignItems: 'center',
        justifyContent: 'space-between',
        p: 2,
        height: '60px', // Exact height to match sidebar 
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
            background: 'linear-gradient(90deg, #727cf5, #6571ff, #4a57eb)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mr: 3,
            letterSpacing: '0.5px',
          }}
        >
          <Code size={20} strokeWidth={2.5} style={{ marginRight: '8px' }} />
          MAIK IDE
        </Heading>
        
        {/* Quick actions */}
        <Flex sx={{ alignItems: 'center', gap: 2 }}>
          <IconButton 
            aria-label="Save file" 
            title="Save file"
            sx={iconButtonHoverStyle}
          >
            <Save size={18} />
          </IconButton>
          <IconButton 
            aria-label="Run code" 
            title="Run code"
            sx={iconButtonHoverStyle}
          >
            <Play size={18} />
          </IconButton>
        </Flex>
      </Flex>
      
      {/* Right section */}
      <Flex sx={{ alignItems: 'center', gap: 2 }}>
        <IconButton 
          aria-label="Import"
          title="Import"
          sx={{ 
            fontSize: 1,
            ...iconButtonHoverStyle
          }}
        >
          <Download size={18} />
        </IconButton>
        
        <IconButton 
          aria-label="Export"
          title="Export"
          sx={{ 
            fontSize: 1,
            ...iconButtonHoverStyle
          }}
        >
          <Upload size={18} />
        </IconButton>
        
        <IconButton 
          aria-label="Settings"
          title="Settings"
          sx={{ 
            fontSize: 1,
            ...iconButtonHoverStyle
          }}
        >
          <Settings size={18} />
        </IconButton>
        
        <IconButton 
          aria-label="Help"
          title="Help"
          sx={{ 
            fontSize: 1,
            ...iconButtonHoverStyle
          }}
        >
          <HelpCircle size={18} />
        </IconButton>
        
        <IconButton 
          aria-label="GitHub"
          title="View on GitHub"
          sx={{ 
            fontSize: 1,
            ...iconButtonHoverStyle
          }}
        >
          <Github size={18} />
        </IconButton>
        
        <IconButton 
          aria-label="Buy me a coffee"
          title="Buy me a coffee"
          sx={{ 
            fontSize: 1,
            ...iconButtonHoverStyle
          }}
        >
          <Coffee size={18} />
        </IconButton>
        
        <IconButton 
          aria-label="Toggle dark mode"
          onClick={toggleColorMode}
          sx={{ 
            fontSize: 1,
            ...iconButtonHoverStyle
          }}
        >
          {colorMode === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </IconButton>
      </Flex>
    </Flex>
  );
};

export default MenuBar;