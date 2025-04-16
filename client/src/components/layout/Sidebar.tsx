/** @jsxImportSource theme-ui */
import React, { useState } from 'react';
import { Box, Flex, Button, Text } from 'theme-ui';

// Simple folder structure for demo
const sampleFiles: FileProps[] = [
  { id: 'f1', name: 'src', type: 'folder', children: [
    { id: 'f2', name: 'components', type: 'folder', children: [
      { id: 'f3', name: 'Button.tsx', type: 'file' },
      { id: 'f4', name: 'Card.tsx', type: 'file' },
    ]},
    { id: 'f5', name: 'App.tsx', type: 'file' },
    { id: 'f6', name: 'index.tsx', type: 'file' },
  ]},
  { id: 'f7', name: 'public', type: 'folder', children: [
    { id: 'f8', name: 'index.html', type: 'file' },
    { id: 'f9', name: 'favicon.ico', type: 'file' },
  ]},
  { id: 'f10', name: 'package.json', type: 'file' },
  { id: 'f11', name: 'tsconfig.json', type: 'file' },
];

interface FileProps {
  name: string;
  type: 'file' | 'folder';
  children?: FileProps[];
  id: string;
  level?: number;
}

// Component for rendering file/folder items
const FileItem: React.FC<FileProps> = ({ name, type, children, level = 0, id }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const toggleFolder = () => {
    if (type === 'folder') {
      setIsOpen(!isOpen);
    }
  };
  
  return (
    <Box sx={{ ml: level * 3 }}>
      <Flex 
        onClick={toggleFolder}
        sx={{ 
          alignItems: 'center', 
          py: 1, 
          px: 2,
          cursor: 'pointer',
          '&:hover': {
            bg: 'muted',
          },
          borderRadius: 'sm'
        }}
      >
        {type === 'folder' && (
          <Text sx={{ mr: 1 }}>{isOpen ? '📂' : '📁'}</Text>
        )}
        {type === 'file' && <Text sx={{ mr: 1 }}>📄</Text>}
        <Text sx={{ fontSize: 1 }}>{name}</Text>
      </Flex>
      
      {isOpen && type === 'folder' && children && (
        <Box>
          {children.map(child => (
            <FileItem 
              key={child.id} 
              {...child} 
              level={level + 1} 
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

interface SidebarProps {
  // Add props as needed
}

const Sidebar: React.FC<SidebarProps> = () => {
  const [activeTab, setActiveTab] = useState<'files' | 'search' | 'extensions'>('files');
  
  return (
    <Flex 
      sx={{ 
        variant: 'layout.sidebar',
        flexDirection: 'column',
        height: '100%', 
      }}
    >
      {/* Sidebar tabs */}
      <Flex sx={{ borderBottom: '1px solid', borderColor: 'lightgray' }}>
        <Button 
          variant={activeTab === 'files' ? 'primary' : 'text'}
          onClick={() => setActiveTab('files')}
          sx={{ 
            flex: 1, 
            py: 2,
            borderRadius: 0,
          }}
        >
          Files
        </Button>
        <Button 
          variant={activeTab === 'search' ? 'primary' : 'text'}
          onClick={() => setActiveTab('search')}
          sx={{ 
            flex: 1, 
            py: 2,
            borderRadius: 0, 
          }}
        >
          Search
        </Button>
        <Button 
          variant={activeTab === 'extensions' ? 'primary' : 'text'}
          onClick={() => setActiveTab('extensions')}
          sx={{ 
            flex: 1, 
            py: 2,
            borderRadius: 0,
          }}
        >
          Ext
        </Button>
      </Flex>
      
      {/* File explorer */}
      {activeTab === 'files' && (
        <Box sx={{ overflowY: 'auto', flex: 1, p: 2 }}>
          <Text sx={{ fontWeight: 'bold', mb: 2, fontSize: 1 }}>EXPLORER</Text>
          {sampleFiles.map(file => (
            <FileItem key={file.id} {...file} />
          ))}
        </Box>
      )}
      
      {/* Search panel */}
      {activeTab === 'search' && (
        <Box sx={{ p: 2 }}>
          <Text sx={{ fontWeight: 'bold', mb: 2, fontSize: 1 }}>SEARCH</Text>
          <Box sx={{ bg: 'muted', p: 2, borderRadius: 'sm' }}>
            <Text sx={{ fontSize: 1 }}>Search functionality coming soon...</Text>
          </Box>
        </Box>
      )}
      
      {/* Extensions panel */}
      {activeTab === 'extensions' && (
        <Box sx={{ p: 2 }}>
          <Text sx={{ fontWeight: 'bold', mb: 2, fontSize: 1 }}>EXTENSIONS</Text>
          <Box sx={{ bg: 'muted', p: 2, borderRadius: 'sm' }}>
            <Text sx={{ fontSize: 1 }}>Extensions marketplace coming soon...</Text>
          </Box>
        </Box>
      )}
    </Flex>
  );
};

export default Sidebar;