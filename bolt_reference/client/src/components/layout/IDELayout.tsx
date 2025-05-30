import React, { ReactNode, useState, useEffect } from 'react';
import MenuBar from './MenuBar';
import Sidebar from './Sidebar';
import StatusBar from './StatusBar';
import { Zap, Coffee } from 'lucide-react';

interface IDELayoutProps {
  children: ReactNode;
}

const IDELayout: React.FC<IDELayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  
  // Simulate a loading state for the IDE
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500); // Show loading animation for 1.5 seconds
    
    return () => clearTimeout(timer);
  }, []);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  // Process children to determine what goes where
  const childrenArray = React.Children.toArray(children);
  
  // Find editor and terminal components
  const editorComponent = childrenArray.find(
    child => React.isValidElement(child) && 
    (child.type as any).displayName === 'Editor'
  );
  
  const terminalComponent = childrenArray.find(
    child => React.isValidElement(child) && 
    (child.type as any).displayName === 'Terminal'
  );
  
  // Other components that don't match specific areas
  const otherComponents = childrenArray.filter(
    child => 
      (!editorComponent || child !== editorComponent) && 
      (!terminalComponent || child !== terminalComponent)
  );

  // Loading screen
  if (isLoading) {
    return (
      <div className="ide-loading-screen">
        <div className="loading-content">
          <div className="loading-logo">
            <Zap size={48} className="loading-icon" />
          </div>
          <h1 className="loading-title">MAIK IDE</h1>
          <div className="loading-subtitle">Advanced AI-Powered Development</div>
          <div className="loading-bar">
            <div className="loading-progress"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ide-container">
      {/* Top menu bar */}
      <header className="ide-menubar">
        <MenuBar toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
      </header>
      
      {/* Main content area */}
      <div className="ide-content">
        {/* We always render the sidebar but control its visibility with CSS classes */}
        <aside className={`ide-sidebar-wrapper ${sidebarOpen ? 'open' : 'closed'}`}>
          <Sidebar />
        </aside>
        
        {/* Main editor and terminal stack */}
        <main className="ide-main">
          {/* Main editor area */}
          <div className="ide-editor">
            {editorComponent || (
              <div className="ide-welcome">
                <div className="welcome-content">
                  <h1 className="welcome-title">Welcome to MAIK IDE</h1>
                  <p className="welcome-subtitle">Your AI-powered development environment</p>
                  
                  <div className="welcome-actions">
                    <button className="welcome-action-button primary">
                      <Zap size={16} />
                      <span>New Project</span>
                    </button>
                    <button className="welcome-action-button secondary">
                      <Coffee size={16} />
                      <span>Open Recent</span>
                    </button>
                  </div>
                  
                  <div className="welcome-tips">
                    <div className="welcome-tip-title">Quick Tips</div>
                    <ul className="welcome-tips-list">
                      <li>Use <kbd>Ctrl</kbd>+<kbd>P</kbd> to quickly open files</li>
                      <li>Access AI assistance with <kbd>Ctrl</kbd>+<kbd>Space</kbd></li>
                      <li>Toggle terminal with <kbd>Ctrl</kbd>+<kbd>`</kbd></li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Terminal container is positioned by the Terminal component itself */}
          {terminalComponent}
        </main>
      </div>
      
      {/* Bottom status bar */}
      <footer className="ide-statusbar">
        <StatusBar />
      </footer>
    </div>
  );
};

export default IDELayout;