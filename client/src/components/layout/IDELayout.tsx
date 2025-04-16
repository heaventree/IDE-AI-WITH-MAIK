/** @jsxImportSource theme-ui */
import React, { ReactNode, useState } from 'react';
import { Box, Grid } from 'theme-ui';
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
  // We expect children to contain Editor and Terminal components
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
      !editorComponent || child !== editorComponent && 
      !terminalComponent || child !== terminalComponent
  );
  
  return (
    <Grid
      as="main"
      variant="layout.mainGrid"
      css={{
        gridTemplateAreas: sidebarOpen 
          ? `
            "menubar menubar"
            "sidebar editor"
            "sidebar terminal"
            "statusbar statusbar"
          `
          : `
            "menubar menubar"
            "editor editor"
            "terminal terminal"
            "statusbar statusbar"
          `,
        gridTemplateColumns: sidebarOpen ? 'minmax(280px, 22%) 1fr' : '1fr',
      }}
    >
      {/* Top menu bar */}
      <Box variant="layout.menuBar">
        <MenuBar toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
      </Box>
      
      {/* Sidebar */}
      {sidebarOpen && (
        <Box variant="layout.sidebar">
          <Sidebar />
        </Box>
      )}
      
      {/* Main editor area */}
      <Box variant="layout.editor">
        {editorComponent || otherComponents}
      </Box>
      
      {/* Terminal area */}
      <Box variant="layout.terminal">
        {terminalComponent}
      </Box>
      
      {/* Bottom status bar */}
      <Box variant="layout.statusBar">
        <StatusBar />
      </Box>
    </Grid>
  );
};

export default IDELayout;