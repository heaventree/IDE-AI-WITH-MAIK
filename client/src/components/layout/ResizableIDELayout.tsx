/** @jsxImportSource theme-ui */
import React, { ReactNode, useState, useEffect } from 'react';
import { 
  Panel, 
  PanelGroup, 
  PanelResizeHandle 
} from 'react-resizable-panels';
import { Box } from 'theme-ui';
import MenuBar from './MenuBar';
import Sidebar from './Sidebar';
import StatusBar from './StatusBar';
import { Zap, Coffee } from 'lucide-react';
import AIChat from '../ai/AIChat';
import { AIChatMode } from '../ai/AIChat';

interface ResizableIDELayoutProps {
  children: ReactNode;
}

const ResizableIDELayout: React.FC<ResizableIDELayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [aiChatMode, setAIChatMode] = useState<AIChatMode>('docked');
  
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
  
  // Find AI Chat component
  const aiChatComponent = childrenArray.find(
    child => React.isValidElement(child) && 
    (child.type as any).displayName === 'AIChat'
  );
  
  // Other components that don't match specific areas
  const otherComponents = childrenArray.filter(
    child => 
      (!editorComponent || child !== editorComponent) && 
      (!terminalComponent || child !== terminalComponent) &&
      (!aiChatComponent || child !== aiChatComponent)
  );

  // Handle AI Chat mode change
  const handleAIChatModeChange = (mode: AIChatMode) => {
    setAIChatMode(mode);
  };
  
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

  // Resize handle component
  const ResizeHandle = ({ className = '', ...props }) => (
    <PanelResizeHandle 
      className={`resize-handle ${className}`}
      {...props}
    >
      <div className="resize-handle-bar" />
    </PanelResizeHandle>
  );

  return (
    <div className="ide-container">
      {/* Top menu bar */}
      <header className="ide-menubar">
        <MenuBar toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
      </header>
      
      {/* Main content area with resizable panels */}
      <div className="ide-content">
        <PanelGroup direction="horizontal">
          {/* Sidebar panel */}
          {sidebarOpen && (
            <>
              <Panel defaultSize={20} minSize={15} maxSize={30}>
                <aside className="ide-sidebar-wrapper open">
                  <Sidebar />
                </aside>
              </Panel>
              <ResizeHandle />
            </>
          )}
          
          {/* Main content + chat panel */}
          <Panel>
            <PanelGroup direction="horizontal">
              {/* Editor + terminal panel */}
              <Panel defaultSize={aiChatMode === 'docked' ? 70 : 100}>
                <PanelGroup direction="vertical">
                  {/* Editor panel */}
                  <Panel defaultSize={70}>
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
                  </Panel>

                  <ResizeHandle />
                  
                  {/* Terminal panel */}
                  <Panel defaultSize={30}>
                    <div className="ide-terminal-container">
                      {terminalComponent}
                    </div>
                  </Panel>
                </PanelGroup>
              </Panel>
              
              {/* AI Chat panel (when in docked mode) */}
              {aiChatMode === 'docked' && (
                <>
                  <ResizeHandle />
                  <Panel defaultSize={30} minSize={20} maxSize={50}>
                    <Box
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        backgroundColor: 'backgroundElevated',
                        border: '1px solid',
                        borderColor: 'border',
                        borderRadius: '4px',
                        overflow: 'hidden',
                      }}
                    >
                      {/* Custom AI chat for docked mode */}
                      <Box
                        sx={{
                          padding: 2,
                          backgroundColor: 'backgroundFloating',
                          borderBottom: '1px solid',
                          borderColor: 'border',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        <Zap size={18} color="var(--theme-ui-colors-primary)" sx={{ marginRight: 2 }} />
                        <Box sx={{ fontSize: 2, fontWeight: 'bold' }}>AI Assistant</Box>
                      </Box>
                      
                      {/* Create a clone of AIChat component with docked mode */}
                      <AIChat 
                        initialOpen={true} 
                        initialMode="docked" 
                        onModeChange={handleAIChatModeChange}
                      />
                    </Box>
                  </Panel>
                </>
              )}
            </PanelGroup>
          </Panel>
        </PanelGroup>
      </div>
      
      {/* Bottom status bar */}
      <footer className="ide-statusbar">
        <StatusBar />
      </footer>
      
      {/* Floating AIChat component (when not in docked mode) */}
      {aiChatMode !== 'docked' && (
        <AIChat 
          initialOpen={true} 
          initialMode={aiChatMode} 
          onModeChange={handleAIChatModeChange}
        />
      )}
    </div>
  );
};

// Set display name for component identification
ResizableIDELayout.displayName = 'ResizableIDELayout';

export default ResizableIDELayout;