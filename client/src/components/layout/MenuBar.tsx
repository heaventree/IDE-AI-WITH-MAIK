import React from 'react';
import { 
  Menu, Code, Sun, Moon, Github, Coffee, Save, Play, 
  Settings, HelpCircle, Download, Upload, ChevronLeft
} from 'lucide-react';

interface MenuBarProps {
  toggleSidebar: () => void;
  sidebarOpen: boolean;
}

const IconButton = ({ 
  icon, 
  onClick, 
  label, 
  title, 
  className = ""
}: { 
  icon: React.ReactNode; 
  onClick?: () => void; 
  label: string; 
  title?: string;
  className?: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    title={title || label}
    className={`icon-button ${className}`}
  >
    {icon}
  </button>
);

const MenuBar: React.FC<MenuBarProps> = ({ toggleSidebar, sidebarOpen }) => {
  // We'll use a state hook that mimics the color mode for now
  const [isDarkMode, setIsDarkMode] = React.useState(true);
  
  const toggleColorMode = () => {
    setIsDarkMode(!isDarkMode);
  };
  
  return (
    <div className="menubar-container">
      {/* Left section - Brand and main controls */}
      <div className="menubar-left">
        <IconButton
          icon={sidebarOpen ? <ChevronLeft size={18} /> : <Menu size={18} />}
          onClick={toggleSidebar}
          label="Toggle sidebar"
          title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
        />
        
        <div className="menubar-brand">
          <div className="menubar-logo">
            <Code size={22} strokeWidth={2.5} color="#727cf5" />
          </div>
          
          <h1 className="gradient-text menubar-title">MAIK IDE</h1>
        </div>
        
        {/* Main action buttons */}
        <div className="menubar-actions">
          <IconButton 
            icon={<Save size={18} />}
            label="Save file"
            title="Save file (Ctrl+S)"
          />
          
          <IconButton 
            icon={<Play size={18} color="#0acf97" />}
            label="Run code"
            title="Run code (F5)"
          />
        </div>
      </div>
      
      {/* Right section - Tools and settings */}
      <nav className="menubar-nav">
        <ul className="menubar-nav-list">
          <li>
            <IconButton 
              icon={<Download size={18} />}
              label="Import"
              title="Import project"
            />
          </li>
          
          <li>
            <IconButton 
              icon={<Upload size={18} />}
              label="Export"
              title="Export project"
            />
          </li>
          
          <li>
            <IconButton 
              icon={<Settings size={18} />}
              label="Settings"
              title="Settings"
            />
          </li>
          
          <li>
            <IconButton 
              icon={<HelpCircle size={18} />}
              label="Help"
              title="Help"
            />
          </li>
          
          <li>
            <IconButton 
              icon={<Github size={18} />}
              label="GitHub"
              title="View on GitHub"
            />
          </li>
          
          <li>
            <IconButton 
              icon={<Coffee size={18} />}
              label="Sponsor"
              title="Buy me a coffee"
            />
          </li>
          
          <li>
            <IconButton 
              icon={isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              onClick={toggleColorMode}
              label="Toggle dark mode"
              title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            />
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default MenuBar;