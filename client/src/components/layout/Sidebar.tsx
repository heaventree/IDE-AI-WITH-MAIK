/** @jsxImportSource theme-ui */
import React, { useState } from 'react';
import { Box, Flex, Text } from 'theme-ui';

// Simple File Explorer
const FileExplorer = () => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    'src': true,
    'components': true
  });

  const toggleFolder = (path: string) => {
    setExpanded(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };

  // Sample file structure
  const files = [
    {
      name: 'src',
      path: 'src',
      type: 'folder',
      children: [
        {
          name: 'components',
          path: 'src/components',
          type: 'folder',
          children: [
            { name: 'App.tsx', path: 'src/components/App.tsx', type: 'file' },
            { name: 'Header.tsx', path: 'src/components/Header.tsx', type: 'file' }
          ]
        },
        {
          name: 'utils',
          path: 'src/utils',
          type: 'folder',
          children: [
            { name: 'helpers.ts', path: 'src/utils/helpers.ts', type: 'file' },
            { name: 'api.ts', path: 'src/utils/api.ts', type: 'file' }
          ]
        },
        { name: 'index.tsx', path: 'src/index.tsx', type: 'file' },
        { name: 'styles.css', path: 'src/styles.css', type: 'file' }
      ]
    },
    { name: 'package.json', path: 'package.json', type: 'file' },
    { name: 'README.md', path: 'README.md', type: 'file' }
  ];

  const renderFileTree = (items: any[], level = 0) => {
    return items.map(item => (
      <Box key={item.path} sx={{ ml: level * 2 }}>
        <Flex
          onClick={() => item.type === 'folder' && toggleFolder(item.path)}
          sx={{
            alignItems: 'center',
            p: 1,
            cursor: item.type === 'folder' ? 'pointer' : 'default',
            '&:hover': {
              bg: 'muted'
            },
            borderRadius: 1
          }}
        >
          {/* Folder/File Icon */}
          <Box sx={{ mr: 1, color: item.type === 'folder' ? 'primary' : 'text' }}>
            {item.type === 'folder' ? (
              expanded[item.path] ? '📂' : '📁'
            ) : (
              '📄'
            )}
          </Box>
          
          {/* File/Folder Name */}
          <Text>{item.name}</Text>
        </Flex>
        
        {/* Render children if it's an expanded folder */}
        {item.type === 'folder' && expanded[item.path] && item.children && (
          <Box sx={{ mt: 1 }}>
            {renderFileTree(item.children, level + 1)}
          </Box>
        )}
      </Box>
    ));
  };

  return (
    <Box sx={{ p: 2 }}>
      <Text sx={{ fontWeight: 'bold', mb: 2 }}>Files</Text>
      {renderFileTree(files)}
    </Box>
  );
};

// Sidebar tabs
const SidebarTabs = () => {
  const [activeTab, setActiveTab] = useState('files');
  
  const tabs = [
    { id: 'files', label: '📁', title: 'Files' },
    { id: 'search', label: '🔍', title: 'Search' },
    { id: 'git', label: '📊', title: 'Git' },
    { id: 'ai', label: '🤖', title: 'AI' }
  ];
  
  return (
    <Flex sx={{ flexDirection: 'column', height: '100%' }}>
      {/* Tab buttons */}
      <Flex sx={{ 
        borderRight: '1px solid', 
        borderColor: 'lightgray',
        flexDirection: 'column',
        width: '48px',
        bg: 'sidebar',
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 1
      }}>
        {tabs.map(tab => (
          <Box
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            title={tab.title}
            sx={{
              p: 2,
              fontSize: 3,
              textAlign: 'center',
              cursor: 'pointer',
              borderLeft: '3px solid',
              borderColor: activeTab === tab.id ? 'primary' : 'transparent',
              bg: activeTab === tab.id ? 'background' : 'transparent',
              '&:hover': {
                bg: 'muted'
              }
            }}
          >
            {tab.label}
          </Box>
        ))}
      </Flex>
      
      {/* Tab content */}
      <Box sx={{ ml: '48px', height: '100%', overflow: 'auto' }}>
        {activeTab === 'files' && <FileExplorer />}
        {activeTab === 'search' && (
          <Box sx={{ p: 2 }}>
            <Text sx={{ fontWeight: 'bold', mb: 2 }}>Search</Text>
            <Text sx={{ color: 'gray' }}>Search functionality will go here</Text>
          </Box>
        )}
        {activeTab === 'git' && (
          <Box sx={{ p: 2 }}>
            <Text sx={{ fontWeight: 'bold', mb: 2 }}>Git</Text>
            <Text sx={{ color: 'gray' }}>Git integration will go here</Text>
          </Box>
        )}
        {activeTab === 'ai' && (
          <Box sx={{ p: 2 }}>
            <Text sx={{ fontWeight: 'bold', mb: 2 }}>AI Assistant</Text>
            <Text sx={{ color: 'gray' }}>AI tools will go here</Text>
          </Box>
        )}
      </Box>
    </Flex>
  );
};

const Sidebar: React.FC = () => {
  return <SidebarTabs />;
};

export default Sidebar;