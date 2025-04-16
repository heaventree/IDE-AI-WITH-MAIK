import React, { ReactNode, useState } from 'react';
import MenuBar from './MenuBar';
import Sidebar from './Sidebar';
import StatusBar from './StatusBar';

interface IDELayoutProps {
  children: ReactNode;
}

const IDELayout: React.FC<IDELayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
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

  return (
    <div className="ide-container">
      {/* Top menu bar */}
      <header className="ide-menubar">
        <MenuBar toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
      </header>
      
      {/* Main content area */}
      <div className="ide-content">
        {/* Sidebar */}
        {sidebarOpen && (
          <aside className="ide-sidebar">
            <Sidebar />
          </aside>
        )}
        
        {/* Main editor and terminal stack */}
        <main className="ide-main">
          {/* Main editor area */}
          <div className="ide-editor">
            {editorComponent || otherComponents}
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