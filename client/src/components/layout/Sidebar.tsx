/** @jsxImportSource theme-ui */
import React, { useState } from 'react';
import { Box, Flex, Text, Button, IconButton } from 'theme-ui';
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
const FileTreeItem: React.FC<{ item: FileItem, depth: number, isActive?: boolean }> = ({ 
  item, 
  depth,
  isActive = false
}) => {
  const [expanded, setExpanded] = useState(true);
  
  const toggleExpanded = () => {
    if (item.type === 'folder') {
      setExpanded(!expanded);
    }
  };
  
  return (
    <Box>
      <Flex
        variant="layout.sidebarItem"
        className={isActive ? 'active' : ''}
        sx={{
          pl: depth * 3 + 2,
          borderLeftColor: isActive ? 'primary' : 'transparent',
        }}
        onClick={toggleExpanded}
      >
        {item.type === 'folder' ? (
          <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </Box>
        ) : (
          <Box sx={{ ml: 2, mr: 1 }} />
        )}
        
        <Box sx={{ 
          mr: 3, 
          display: 'flex', 
          alignItems: 'center', 
          color: 'inherit'
        }}>
          {item.type === 'folder' ? <FolderTree size={18} /> : <FileIcon name={item.name} language={item.language} />}
        </Box>
        
        <Text sx={{ 
          fontSize: 1, 
          fontWeight: item.type === 'folder' ? 600 : 400,
          color: 'inherit'
        }}>
          {item.name}
        </Text>
      </Flex>
      
      {item.type === 'folder' && expanded && item.children && item.children.map((child, index) => (
        <FileTreeItem 
          key={`${child.name}-${index}`} 
          item={child} 
          depth={depth + 1}
          isActive={child.name === 'main.tsx'} // Just for demo, highlight the main file
        />
      ))}
    </Box>
  );
};

const Sidebar: React.FC<SidebarProps> = () => {
  const [activeTab, setActiveTab] = useState<'files' | 'collab' | 'git' | 'search'>('files');
  
  return (
    <Flex sx={{ flexDirection: 'column', height: '100%' }}>
      {/* Sidebar tabs */}
      <Flex
        sx={{
          borderBottom: '1px solid',
          borderColor: 'border',
          bg: 'backgroundElevated',
        }}
      >
        {[
          { id: 'files', icon: <FolderTree size={18} />, label: 'File explorer' },
          { id: 'search', icon: <Search size={18} />, label: 'Search' },
          { id: 'git', icon: <GitBranch size={18} />, label: 'Git' },
          { id: 'collab', icon: <Users size={18} />, label: 'Collaboration' }
        ].map(tab => (
          <IconButton
            key={tab.id}
            variant="icon"
            onClick={() => setActiveTab(tab.id as any)}
            aria-label={tab.label}
            title={tab.label}
            sx={{
              flex: 1,
              py: 2,
              borderRadius: 0,
              borderBottom: activeTab === tab.id ? '2px solid' : '2px solid transparent',
              borderColor: activeTab === tab.id ? 'primary' : 'transparent',
              color: activeTab === tab.id ? 'primary' : 'foreground',
              '&:hover': {
                bg: 'sidebarItemHover',
              },
            }}
          >
            {tab.icon}
          </IconButton>
        ))}
      </Flex>
      
      {/* Tab content */}
      <Box variant="layout.sidebarSection" sx={{ flex: 1, overflow: 'auto' }}>
        {activeTab === 'files' && (
          <Box>
            <Flex sx={{ 
              justifyContent: 'space-between', 
              alignItems: 'center',
              px: 3,
              py: 2,
              mb: 1
            }}>
              <Text variant="text.label">EXPLORER</Text>
              <Flex sx={{ alignItems: 'center', gap: 2 }}>
                <IconButton 
                  variant="icon"
                  aria-label="New file" 
                  title="New file"
                  sx={{ width: '24px', height: '24px' }}
                >
                  <FilePlus size={16} />
                </IconButton>
                <IconButton 
                  variant="icon"
                  aria-label="New folder" 
                  title="New folder"
                  sx={{ width: '24px', height: '24px' }}
                >
                  <FolderPlus size={16} />
                </IconButton>
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
          <Box sx={{ p: 3 }}>
            <Text variant="text.label" sx={{ mb: 2 }}>SEARCH</Text>
            <Text variant="text.caption">Search functionality coming soon...</Text>
          </Box>
        )}
        
        {activeTab === 'git' && (
          <Box sx={{ p: 3 }}>
            <Text variant="text.label" sx={{ mb: 2 }}>GIT</Text>
            <Text variant="text.caption">Git integration coming soon...</Text>
          </Box>
        )}
        
        {activeTab === 'collab' && <CollaborationPanel />}
      </Box>
    </Flex>
  );
};

export default Sidebar;