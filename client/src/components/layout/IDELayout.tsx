/** @jsxImportSource theme-ui */
import React, { ReactNode, useState } from 'react';
import { Box, Flex } from 'theme-ui';
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
  
  return (
    <Flex
      sx={{
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      {/* Top menu bar */}
      <MenuBar toggleSidebar={toggleSidebar} />
      
      {/* Main content area with sidebar */}
      <Flex
        sx={{
          flex: 1,
          overflow: 'hidden',
        }}
      >
        {/* Sidebar */}
        {sidebarOpen && (
          <Sidebar />
        )}
        
        {/* Main editor/content area */}
        <Box
          sx={{
            flex: 1,
            overflow: 'auto',
            position: 'relative',
          }}
        >
          {children}
        </Box>
      </Flex>
      
      {/* Bottom status bar */}
      <StatusBar />
    </Flex>
  );
};

export default IDELayout;