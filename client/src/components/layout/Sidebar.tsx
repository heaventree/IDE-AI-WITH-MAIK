import React, { useState } from 'react';
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
    <div className="filetree-item-container">
      <div
        className={`filetree-item ${isActive ? 'active' : ''}`}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={toggleExpanded}
      >
        {item.type === 'folder' ? (
          <div className="filetree-expander">
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </div>
        ) : (
          <div className="filetree-spacer" />
        )}
        
        <div className="filetree-icon">
          {item.type === 'folder' ? <FolderTree size={18} /> : <FileIcon name={item.name} language={item.language} />}
        </div>
        
        <div className={`filetree-name ${item.type === 'folder' ? 'folder' : 'file'}`}>
          {item.name}
        </div>
      </div>
      
      {item.type === 'folder' && expanded && item.children && (
        <div className="filetree-children">
          {item.children.map((child, index) => (
            <FileTreeItem 
              key={`${child.name}-${index}`} 
              item={child} 
              depth={depth + 1}
              isActive={child.name === 'main.tsx'} // Just for demo, highlight the main file
            />
          ))}
        </div>
      )}
    </div>
  );
};

const SidebarTab: React.FC<{
  id: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}> = ({ id, icon, label, active, onClick }) => (
  <button
    type="button"
    className={`sidebar-tab ${active ? 'active' : ''}`}
    onClick={onClick}
    aria-label={label}
    title={label}
  >
    {icon}
  </button>
);

const Sidebar: React.FC<SidebarProps> = () => {
  const [activeTab, setActiveTab] = useState<'files' | 'collab' | 'git' | 'search'>('files');
  
  return (
    <div className="sidebar-container">
      {/* Sidebar tabs */}
      <div className="sidebar-tabs">
        {[
          { id: 'files', icon: <FolderTree size={18} />, label: 'File explorer' },
          { id: 'search', icon: <Search size={18} />, label: 'Search' },
          { id: 'git', icon: <GitBranch size={18} />, label: 'Git' },
          { id: 'collab', icon: <Users size={18} />, label: 'Collaboration' }
        ].map(tab => (
          <SidebarTab
            key={tab.id}
            id={tab.id}
            icon={tab.icon}
            label={tab.label}
            active={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id as any)}
          />
        ))}
      </div>
      
      {/* Tab content */}
      <div className="sidebar-content">
        {activeTab === 'files' && (
          <div className="sidebar-section">
            <div className="sidebar-header">
              <div className="sidebar-title">EXPLORER</div>
              <div className="sidebar-actions">
                <button 
                  className="icon-button small"
                  aria-label="New file" 
                  title="New file"
                >
                  <FilePlus size={16} />
                </button>
                <button 
                  className="icon-button small"
                  aria-label="New folder" 
                  title="New folder"
                >
                  <FolderPlus size={16} />
                </button>
              </div>
            </div>
            <div className="filetree">
              {sampleFiles.map((file, index) => (
                <FileTreeItem key={`${file.name}-${index}`} item={file} depth={0} />
              ))}
            </div>
          </div>
        )}
        
        {activeTab === 'search' && (
          <div className="sidebar-section">
            <div className="sidebar-header">
              <div className="sidebar-title">SEARCH</div>
            </div>
            <div className="sidebar-message">
              Search functionality coming soon...
            </div>
          </div>
        )}
        
        {activeTab === 'git' && (
          <div className="sidebar-section">
            <div className="sidebar-header">
              <div className="sidebar-title">GIT</div>
            </div>
            <div className="sidebar-message">
              Git integration coming soon...
            </div>
          </div>
        )}
        
        {activeTab === 'collab' && <CollaborationPanel />}
      </div>
    </div>
  );
};

export default Sidebar;