import React from 'react';
import { 
  Menu, Zap, Sun, Moon, Github, Coffee, Save, Play, Pause,
  Settings, HelpCircle, Download, Upload, ChevronLeft, 
  MoreVertical, Users, Bell, GitBranch, FileDown, Code
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
  className = "",
  children,
  badge
}: { 
  icon: React.ReactNode; 
  onClick?: () => void; 
  label: string; 
  title?: string;
  className?: string;
  children?: React.ReactNode;
  badge?: number | string;
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    title={title || label}
    className={`icon-button ${className}`}
  >
    {icon}
    {badge !== undefined && <span className="icon-badge">{badge}</span>}
    {children}
  </button>
);

const DropdownMenu = ({ 
  label,
  title,
  icon,
  children,
  className = ""
}: {
  label: string;
  title?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) => {
  const [open, setOpen] = React.useState(false);
  
  const toggleOpen = () => {
    setOpen(!open);
  };
  
  return (
    <div className={`dropdown-menu ${className} ${open ? 'open' : ''}`}>
      <IconButton
        icon={icon}
        onClick={toggleOpen}
        label={label}
        title={title || label}
      />
      
      {open && (
        <div className="dropdown-content">
          {children}
        </div>
      )}
    </div>
  );
};

const MenuItem = ({
  icon,
  label,
  onClick,
  shortcut,
  className = ""
}: {
  icon?: React.ReactNode;
  label: string;
  onClick?: () => void;
  shortcut?: string;
  className?: string;
}) => (
  <button 
    className={`menu-item ${className}`}
    onClick={onClick}
  >
    {icon && <span className="menu-item-icon">{icon}</span>}
    <span className="menu-item-label">{label}</span>
    {shortcut && <span className="menu-item-shortcut">{shortcut}</span>}
  </button>
);

const MenuDivider = () => <div className="menu-divider"></div>;

const MenuBar: React.FC<MenuBarProps> = ({ toggleSidebar, sidebarOpen }) => {
  // We'll use a state hook that mimics the color mode for now
  const [isDarkMode, setIsDarkMode] = React.useState(true);
  const [isRunning, setIsRunning] = React.useState(false);
  
  const toggleColorMode = () => {
    setIsDarkMode(!isDarkMode);
  };
  
  const toggleRunState = () => {
    setIsRunning(!isRunning);
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
          className="sidebar-toggle"
        />
        
        <div className="menubar-brand">
          <div className="menubar-logo">
            <Zap size={22} className="menubar-logo-icon" />
          </div>
          
          <h1 className="gradient-text menubar-title">MAIK IDE</h1>
        </div>
        
        {/* Main navigation menu */}
        <div className="menubar-nav-area">
          <DropdownMenu
            label="File"
            icon={<span className="nav-text">File</span>}
            className="nav-dropdown"
          >
            <MenuItem icon={<Save size={14} />} label="Save" shortcut="Ctrl+S" />
            <MenuItem icon={<FileDown size={14} />} label="Save As..." shortcut="Ctrl+Shift+S" />
            <MenuDivider />
            <MenuItem icon={<Download size={14} />} label="Import Project" />
            <MenuItem icon={<Upload size={14} />} label="Export Project" />
          </DropdownMenu>
          
          <DropdownMenu
            label="Edit"
            icon={<span className="nav-text">Edit</span>}
            className="nav-dropdown"
          >
            <MenuItem label="Undo" shortcut="Ctrl+Z" />
            <MenuItem label="Redo" shortcut="Ctrl+Y" />
            <MenuDivider />
            <MenuItem label="Cut" shortcut="Ctrl+X" />
            <MenuItem label="Copy" shortcut="Ctrl+C" />
            <MenuItem label="Paste" shortcut="Ctrl+V" />
          </DropdownMenu>
          
          <DropdownMenu
            label="View"
            icon={<span className="nav-text">View</span>}
            className="nav-dropdown"
          >
            <MenuItem label="Toggle Sidebar" shortcut="Ctrl+B" />
            <MenuItem label="Toggle Terminal" shortcut="Ctrl+`" />
            <MenuDivider />
            <MenuItem 
              label={isDarkMode ? "Light Mode" : "Dark Mode"} 
              icon={isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
              onClick={toggleColorMode}
            />
          </DropdownMenu>
        </div>
        
        {/* Main action buttons */}
        <div className="menubar-actions">
          <button 
            className={`run-button ${isRunning ? 'running' : ''}`}
            onClick={toggleRunState}
            title={isRunning ? "Stop (Shift+F5)" : "Run (F5)"}
          >
            {isRunning ? (
              <>
                <Pause size={14} />
                <span>Stop</span>
              </>
            ) : (
              <>
                <Play size={14} />
                <span>Run</span>
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Right section - Tools and settings */}
      <div className="menubar-right">
        <div className="menubar-branch">
          <div className="branch-indicator">
            <GitBranch size={14} />
            <span className="branch-name">main</span>
          </div>
        </div>
        
        <div className="menubar-actions">
          <IconButton 
            icon={<Users size={18} />}
            label="Collaborators"
            title="3 collaborators online"
            badge="3"
          />
          
          <IconButton 
            icon={<Bell size={18} />}
            label="Notifications"
            title="You have 2 notifications"
            badge="2"
          />
          
          <IconButton 
            icon={<Code size={18} />}
            label="AI Assist"
            title="AI Coding Assistant"
          />
          
          <IconButton 
            icon={isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            onClick={toggleColorMode}
            label="Toggle dark mode"
            title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          />
          
          <DropdownMenu
            label="More actions"
            icon={<MoreVertical size={18} />}
            className="more-dropdown"
          >
            <MenuItem icon={<Settings size={14} />} label="Settings" />
            <MenuItem icon={<HelpCircle size={14} />} label="Help" />
            <MenuItem icon={<Github size={14} />} label="GitHub" />
            <MenuItem icon={<Coffee size={14} />} label="Support Project" />
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default MenuBar;