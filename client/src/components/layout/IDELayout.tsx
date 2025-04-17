/** @jsxImportSource theme-ui */
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
      <div className="flex-center" style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        backgroundColor: 'var(--color-background)',
        zIndex: 9999
      }}>
        <div className="flex-column flex-center text-center">
          <div style={{ 
            width: '80px', 
            height: '80px', 
            borderRadius: 'var(--radius-lg)', 
            background: 'var(--color-background-floating)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-lg)',
            marginBottom: 'var(--spacing-4)',
            animation: 'pulse 2s infinite ease-in-out'
          }}>
            <Zap size={48} style={{ color: 'var(--color-primary)' }} />
          </div>
          <h1 className="gradient-text heading-lg mb-1">MAIK IDE</h1>
          <div className="text-sm text-muted mb-4">Advanced AI-Powered Development</div>
          <div style={{ 
            width: '200px', 
            height: '4px', 
            backgroundColor: 'var(--color-background-elevated)',
            borderRadius: '2px',
            overflow: 'hidden'
          }}>
            <div className="spinner" style={{ 
              width: '30%', 
              height: '100%', 
              background: 'var(--gradient-primary)',
              borderRadius: '2px',
              animation: 'loading-progress 1.5s infinite ease-in-out'
            }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div sx={{ 
      display: 'grid',
      gridTemplateColumns: 'var(--sidebar-width) 1fr',
      gridTemplateRows: 'var(--menubar-height) 1fr var(--statusbar-height)',
      gridTemplateAreas: `
        'menubar menubar'
        'sidebar editor'
        'statusbar statusbar'
      `,
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      bg: 'background'
    }}>
      {/* Top menu bar */}
      <div sx={{ 
        gridArea: 'menubar',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        bg: 'menuBar',
        borderBottom: '1px solid',
        borderColor: 'border',
        padding: '0 16px',
        height: 'var(--menubar-height)',
        zIndex: 20
      }}>
        <MenuBar toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
      </div>
      
      {/* Sidebar */}
      <div sx={{ 
        gridArea: 'sidebar',
        bg: 'sidebar',
        borderRight: '1px solid',
        borderColor: 'border',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        transition: 'transform var(--transition-medium)',
        transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)'
      }}>
        <Sidebar />
      </div>
      
      {/* Main editor area */}
      <div sx={{ 
        gridArea: 'editor',
        bg: 'editor',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {editorComponent || (
          <div sx={{ 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            textAlign: 'center'
          }}>
            <Zap size={48} sx={{ mb: 3 }} />
            <h1 sx={{ fontSize: 4, fontWeight: 'bold', mb: 2 }}>Welcome to MAIK IDE</h1>
            <p sx={{ fontSize: 2, color: 'foregroundMuted', mb: 4 }}>Your AI-powered development environment</p>
            
            <div sx={{ display: 'flex', gap: 3 }}>
              <button sx={{ 
                variant: 'buttons.primary',
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}>
                <Zap size={16} />
                <span>New Project</span>
              </button>
              <button sx={{ 
                variant: 'buttons.secondary',
                display: 'flex', 
                alignItems: 'center',
                gap: 2
              }}>
                <Coffee size={16} />
                <span>Open Recent</span>
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Terminal area */}
      <div sx={{
        position: 'absolute',
        bottom: 'var(--statusbar-height)',
        left: sidebarOpen ? 'var(--sidebar-width)' : '0',
        right: '0',
        height: 'var(--terminal-height)',
        bg: 'terminal',
        borderTop: '1px solid',
        borderColor: 'border',
        zIndex: 10,
        transition: 'left var(--transition-medium)'
      }}>
        {terminalComponent}
      </div>
      
      {/* Bottom status bar */}
      <div sx={{ 
        gridArea: 'statusbar',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        bg: 'statusBar',
        borderTop: '1px solid',
        borderColor: 'border',
        padding: '0 8px',
        height: 'var(--statusbar-height)',
        fontSize: 0,
        color: 'foregroundMuted'
      }}>
        <StatusBar />
      </div>
    </div>
  );
};

export default IDELayout;