/** @jsxImportSource theme-ui */
import React, { useState } from 'react';
import { Box, Flex, Text, Button } from 'theme-ui';
import { 
  FolderTree, FileCode, FileJson, FileText, 
  Search, Users, GitBranch, PanelRight,
  ChevronDown, ChevronRight, FilePlus, FolderPlus
} from 'lucide-react';
import CollaborationPanel from '../collaboration/CollaborationPanel';

interface SidebarProps {
  // Add props as needed
}

// File or folder item type
interface FileItem {
  name: string;
  type: 'file' | 'folder';
  children?: FileItem[];
  language?: string;
}

const sampleFiles: FileItem[] = [
  {
    name: 'Project',
    type: 'folder',
    children: [
      {
        name: 'src',
        type: 'folder',
        children: [
          {
            name: 'main.tsx',
            type: 'file',
            language: 'typescript'
          },
          {
            name: 'App.tsx',
            type: 'file',
            language: 'typescript'
          }
        ]
      },
      {
        name: 'package.json',
        type: 'file',
        language: 'json'
      },
      {
        name: 'README.md',
        type: 'file',
        language: 'markdown'
      }
    ]
  }
];

// File icon based on file type/extension
const FileIcon: React.FC<{ name: string, language?: string }> = ({ name, language }) => {
  if (language === 'json') return <FileJson size={18} />;
  if (language === 'markdown') return <FileText size={18} />;
  if (name.endsWith('.tsx') || name.endsWith('.ts') || name.endsWith('.js') || name.endsWith('.jsx')) {
    return <FileCode size={18} />;
  }
  return <FileText size={18} />;
};

// File or folder item component
const FileTreeItem: React.FC<{ item: FileItem, depth: number }> = ({ item, depth }) => {
  const [expanded, setExpanded] = useState(true);
  
  const toggleExpanded = () => {
    if (item.type === 'folder') {
      setExpanded(!expanded);
    }
  };
  
  return (
    <Box>
      <Flex
        sx={{
          alignItems: 'center',
          pl: depth * 3 + 1,
          py: 1,
          cursor: 'pointer',
          '&:hover': {
            bg: 'rgba(114, 124, 245, 0.08)', // Primary color with transparency for subtle hover effect
          },
        }}
        onClick={toggleExpanded}
      >
        {item.type === 'folder' ? (
          <Box sx={{ mr: 1 }}>
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </Box>
        ) : (
          <Box sx={{ ml: 2, mr: 1 }} />
        )}
        
        <Box sx={{ mr: 3, display: 'flex', alignItems: 'center', color: item.type === 'folder' ? 'primary' : 'text' }}>
          {item.type === 'folder' ? <FolderTree size={18} /> : <FileIcon name={item.name} language={item.language} />}
        </Box>
        
        <Text sx={{ 
          fontSize: 1, 
          fontWeight: item.type === 'folder' ? 'bold' : 'normal',
          color: item.type === 'folder' ? 'primary' : 'text'
        }}>{item.name}</Text>
      </Flex>
      
      {item.type === 'folder' && expanded && item.children && item.children.map((child, index) => (
        <FileTreeItem key={`${child.name}-${index}`} item={child} depth={depth + 1} />
      ))}
    </Box>
  );
};

const Sidebar: React.FC<SidebarProps> = () => {
  const [activeTab, setActiveTab] = useState<'files' | 'collab' | 'git' | 'search'>('files');
  
  return (
    <Box
      sx={{
        width: 240,
        borderRight: '1px solid',
        borderColor: 'border',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bg: 'sidebar',
        color: 'text',
      }}
    >
      {/* Sidebar tabs */}
      <Flex
        sx={{
          borderBottom: '1px solid',
          borderColor: 'border',
          height: '60px', // Exact same height as MenuBar
          alignItems: 'center', // Ensure buttons are vertically centered
        }}
      >
        <Button
          variant="text"
          onClick={() => setActiveTab('files')}
          sx={{
            flex: 1,
            py: 2,
            borderBottom: activeTab === 'files' ? '2px solid' : 'none',
            borderColor: 'primary',
            borderRadius: 0,
            color: activeTab === 'files' ? 'primary' : 'text',
            bg: 'transparent',
            '&:hover': {
              bg: 'rgba(114, 124, 245, 0.08)', // Match file tree hover style
              color: activeTab === 'files' ? 'primary' : 'highlight',
            },
            transition: 'all 0.2s ease',
          }}
          aria-label="File explorer"
          title="File explorer"
        >
          <FolderTree size={18} />
        </Button>
        
        <Button
          variant="text"
          onClick={() => setActiveTab('search')}
          sx={{
            flex: 1,
            py: 2,
            borderBottom: activeTab === 'search' ? '2px solid' : 'none',
            borderColor: 'primary',
            borderRadius: 0,
            color: activeTab === 'search' ? 'primary' : 'text',
            bg: 'transparent',
            '&:hover': {
              bg: 'rgba(114, 124, 245, 0.08)', // Match file tree hover style
              color: activeTab === 'search' ? 'primary' : 'highlight',
            },
            transition: 'all 0.2s ease',
          }}
          aria-label="Search"
          title="Search"
        >
          <Search size={18} />
        </Button>
        
        <Button
          variant="text"
          onClick={() => setActiveTab('git')}
          sx={{
            flex: 1,
            py: 2,
            borderBottom: activeTab === 'git' ? '2px solid' : 'none',
            borderColor: 'primary',
            borderRadius: 0,
            color: activeTab === 'git' ? 'primary' : 'text',
            bg: 'transparent',
            '&:hover': {
              bg: 'rgba(114, 124, 245, 0.08)', // Match file tree hover style
              color: activeTab === 'git' ? 'primary' : 'highlight',
            },
            transition: 'all 0.2s ease',
          }}
          aria-label="Git"
          title="Git"
        >
          <GitBranch size={18} />
        </Button>
        
        <Button
          variant="text"
          onClick={() => setActiveTab('collab')}
          sx={{
            flex: 1,
            py: 2,
            borderBottom: activeTab === 'collab' ? '2px solid' : 'none',
            borderColor: 'primary',
            borderRadius: 0,
            color: activeTab === 'collab' ? 'primary' : 'text',
            bg: 'transparent',
            '&:hover': {
              bg: 'rgba(114, 124, 245, 0.08)', // Match file tree hover style
              color: activeTab === 'collab' ? 'primary' : 'highlight',
            },
            transition: 'all 0.2s ease',
          }}
          aria-label="Collaboration"
          title="Collaboration"
        >
          <Users size={18} />
        </Button>
      </Flex>
      
      {/* Tab content */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {activeTab === 'files' && (
          <Box>
            <Flex sx={{ p: 2, justifyContent: 'space-between', alignItems: 'center' }}>
              <Text sx={{ fontWeight: 'bold', fontSize: 1 }}>Explorer</Text>
              <Flex sx={{ alignItems: 'center', gap: 3 }}>
                <Box 
                  as="span" 
                  sx={{ 
                    cursor: 'pointer',
                    display: 'flex',
                    color: 'text',
                    '&:hover': {
                      color: 'primary',
                    } 
                  }} 
                  aria-label="New file" 
                  title="New file"
                >
                  <FilePlus size={16} />
                </Box>
                <Box 
                  as="span"
                  sx={{ 
                    cursor: 'pointer',
                    display: 'flex',
                    color: 'text',
                    '&:hover': {
                      color: 'primary',
                    } 
                  }} 
                  aria-label="New folder" 
                  title="New folder"
                >
                  <FolderPlus size={16} />
                </Box>
              </Flex>
            </Flex>
            <Box>
              {sampleFiles.map((file, index) => (
                <FileTreeItem key={`${file.name}-${index}`} item={file} depth={0} />
              ))}
            </Box>
          </Box>
        )}
        
        {activeTab === 'search' && (
          <Box sx={{ p: 2 }}>
            <Text sx={{ fontWeight: 'bold', fontSize: 1, mb: 2 }}>Search</Text>
            <Text sx={{ fontSize: 0, color: 'gray' }}>Search functionality coming soon...</Text>
          </Box>
        )}
        
        {activeTab === 'git' && (
          <Box sx={{ p: 2 }}>
            <Text sx={{ fontWeight: 'bold', fontSize: 1, mb: 2 }}>Git</Text>
            <Text sx={{ fontSize: 0, color: 'gray' }}>Git integration coming soon...</Text>
          </Box>
        )}
        
        {activeTab === 'collab' && <CollaborationPanel />}
      </Box>
    </Box>
  );
};

export default Sidebar;