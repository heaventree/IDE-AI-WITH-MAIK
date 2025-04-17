/** @jsxImportSource theme-ui */
import React, { useState } from 'react';
import { Box, Flex, Button, Text } from 'theme-ui';
import { 
  FolderOpen, 
  File, 
  Box as BoxIcon, 
  Search, 
  Users, 
  GitBranch, 
  Settings, 
  Play,
  Terminal,
  Database
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const [activeTab, setActiveTab] = useState('files');

  const renderSidebarContent = () => {
    switch (activeTab) {
      case 'files':
        return (
          <Box sx={{ padding: 2 }}>
            <Flex sx={{ alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
              <Text sx={{ fontWeight: 'bold', fontSize: 1 }}>EXPLORER</Text>
              <Flex sx={{ gap: 1 }}>
                <Button variant="icon" title="New File" sx={{ padding: 1 }}>
                  <File size={16} />
                </Button>
                <Button variant="icon" title="New Folder" sx={{ padding: 1 }}>
                  <FolderOpen size={16} />
                </Button>
              </Flex>
            </Flex>
            
            <Box sx={{ marginLeft: 2 }}>
              <Flex 
                sx={{ 
                  alignItems: 'center', 
                  gap: 2, 
                  padding: '4px 8px',
                  borderRadius: 'default', 
                  '&:hover': { backgroundColor: 'backgroundHover' }, 
                  cursor: 'pointer',
                  marginBottom: 1
                }}
              >
                <FolderOpen size={16} color="var(--theme-ui-colors-foregroundMuted)" />
                <Text sx={{ fontSize: 1 }}>Project</Text>
              </Flex>
              
              <Box sx={{ marginLeft: 3 }}>
                <Flex 
                  sx={{ 
                    alignItems: 'center', 
                    gap: 2, 
                    padding: '4px 8px',
                    borderRadius: 'default', 
                    backgroundColor: 'backgroundHover',
                    cursor: 'pointer',
                    marginBottom: 1
                  }}
                >
                  <FolderOpen size={14} color="var(--theme-ui-colors-foregroundMuted)" />
                  <Text sx={{ fontSize: 1 }}>src</Text>
                </Flex>
                
                <Box sx={{ marginLeft: 3 }}>
                  <Flex 
                    sx={{ 
                      alignItems: 'center', 
                      gap: 2, 
                      padding: '4px 8px',
                      borderRadius: 'default', 
                      '&:hover': { backgroundColor: 'backgroundHover' }, 
                      cursor: 'pointer',
                      marginBottom: 1
                    }}
                  >
                    <FolderOpen size={14} color="var(--theme-ui-colors-foregroundMuted)" />
                    <Text sx={{ fontSize: 1 }}>components</Text>
                  </Flex>
                  
                  <Flex 
                    sx={{ 
                      alignItems: 'center', 
                      gap: 2, 
                      padding: '4px 8px',
                      borderRadius: 'default', 
                      '&:hover': { backgroundColor: 'backgroundHover' }, 
                      cursor: 'pointer',
                      marginBottom: 1
                    }}
                  >
                    <File size={14} color="var(--theme-ui-colors-foregroundMuted)" />
                    <Text sx={{ fontSize: 1 }}>App.tsx</Text>
                  </Flex>
                  
                  <Flex 
                    sx={{ 
                      alignItems: 'center', 
                      gap: 2, 
                      padding: '4px 8px',
                      borderRadius: 'default', 
                      '&:hover': { backgroundColor: 'backgroundHover' }, 
                      cursor: 'pointer',
                      marginBottom: 1
                    }}
                  >
                    <File size={14} color="var(--theme-ui-colors-foregroundMuted)" />
                    <Text sx={{ fontSize: 1 }}>index.tsx</Text>
                  </Flex>
                </Box>
              </Box>
              
              <Flex 
                sx={{ 
                  alignItems: 'center', 
                  gap: 2, 
                  padding: '4px 8px',
                  borderRadius: 'default', 
                  '&:hover': { backgroundColor: 'backgroundHover' }, 
                  cursor: 'pointer',
                  marginBottom: 1
                }}
              >
                <File size={16} color="var(--theme-ui-colors-foregroundMuted)" />
                <Text sx={{ fontSize: 1 }}>package.json</Text>
              </Flex>
              
              <Flex 
                sx={{ 
                  alignItems: 'center', 
                  gap: 2, 
                  padding: '4px 8px',
                  borderRadius: 'default', 
                  '&:hover': { backgroundColor: 'backgroundHover' }, 
                  cursor: 'pointer',
                  marginBottom: 1
                }}
              >
                <File size={16} color="var(--theme-ui-colors-foregroundMuted)" />
                <Text sx={{ fontSize: 1 }}>README.md</Text>
              </Flex>
            </Box>
          </Box>
        );
      
      case 'search':
        return (
          <Box sx={{ padding: 2 }}>
            <Text sx={{ fontWeight: 'bold', fontSize: 1, marginBottom: 3 }}>SEARCH</Text>
            <input
              type="text"
              placeholder="Search in files..."
              style={{
                width: '100%',
                backgroundColor: 'var(--theme-ui-colors-backgroundElevated)',
                border: '1px solid var(--theme-ui-colors-border)',
                borderRadius: '4px',
                padding: '8px',
                fontSize: '14px',
                color: 'var(--theme-ui-colors-foreground)',
                marginBottom: '12px',
                outline: 'none',
              }}
            />
            <Text sx={{ fontSize: 0, color: 'foregroundMuted' }}>No search results yet</Text>
          </Box>
        );
      
      default:
        return (
          <Box sx={{ padding: 2 }}>
            <Text sx={{ fontWeight: 'bold', fontSize: 1, marginBottom: 3 }}>
              {activeTab.toUpperCase()}
            </Text>
          </Box>
        );
    }
  };

  return (
    <Flex sx={{ height: '100%', flexDirection: 'column' }}>
      {/* Sidebar activity bar */}
      <Flex
        sx={{
          width: '50px',
          height: '100%',
          flexDirection: 'column',
          backgroundColor: 'backgroundFloating',
          borderRight: '1px solid',
          borderColor: 'border',
          padding: '12px 0',
          alignItems: 'center',
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <Button
          variant={activeTab === 'files' ? 'iconActive' : 'icon'}
          onClick={() => setActiveTab('files')}
          title="Explorer"
          aria-label="Explorer"
          sx={{ marginBottom: 1 }}
        >
          <BoxIcon size={24} />
        </Button>
        
        <Button
          variant={activeTab === 'search' ? 'iconActive' : 'icon'}
          onClick={() => setActiveTab('search')}
          title="Search"
          aria-label="Search"
          sx={{ marginBottom: 1 }}
        >
          <Search size={24} />
        </Button>
        
        <Button
          variant={activeTab === 'git' ? 'iconActive' : 'icon'}
          onClick={() => setActiveTab('git')}
          title="Source Control"
          aria-label="Source Control"
          sx={{ marginBottom: 1 }}
        >
          <GitBranch size={24} />
        </Button>
        
        <Button
          variant={activeTab === 'debug' ? 'iconActive' : 'icon'}
          onClick={() => setActiveTab('debug')}
          title="Run and Debug"
          aria-label="Run and Debug"
          sx={{ marginBottom: 1 }}
        >
          <Play size={24} />
        </Button>
        
        <Button
          variant={activeTab === 'terminal' ? 'iconActive' : 'icon'}
          onClick={() => setActiveTab('terminal')}
          title="Terminal"
          aria-label="Terminal"
          sx={{ marginBottom: 1 }}
        >
          <Terminal size={24} />
        </Button>
        
        <Button
          variant={activeTab === 'database' ? 'iconActive' : 'icon'}
          onClick={() => setActiveTab('database')}
          title="Database"
          aria-label="Database"
          sx={{ marginBottom: 1 }}
        >
          <Database size={24} />
        </Button>
        
        <Box sx={{ marginTop: 'auto' }}>
          <Button
            variant={activeTab === 'settings' ? 'iconActive' : 'icon'}
            onClick={() => setActiveTab('settings')}
            title="Settings"
            aria-label="Settings"
            sx={{ marginBottom: 1 }}
          >
            <Settings size={24} />
          </Button>
        </Box>
      </Flex>
      
      {/* Sidebar content area */}
      <Box
        sx={{
          flexGrow: 1,
          marginLeft: '50px',
          overflow: 'auto',
          height: '100%',
        }}
      >
        {renderSidebarContent()}
      </Box>
    </Flex>
  );
};

export default Sidebar;