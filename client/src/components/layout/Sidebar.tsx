import React, { useState } from 'react';
import { 
  FolderTree, FileCode, FileJson, FileText, 
  Search, Users, GitBranch, Code, Database, Settings,
  ChevronDown, ChevronRight, FilePlus, FolderPlus, 
  AlertCircle, Coffee, Globe, Package, PlusCircle, 
  ServerCrash, Zap, Diamond
} from 'lucide-react';

// Vertical sidebar component in FlutterFlow style
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

// Sample file structure
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
            name: 'components',
            type: 'folder',
            children: [
              {
                name: 'Button.tsx',
                type: 'file',
                language: 'typescript'
              },
              {
                name: 'Card.tsx',
                type: 'file',
                language: 'typescript'
              },
              {
                name: 'Input.tsx',
                type: 'file',
                language: 'typescript'
              }
            ]
          },
          {
            name: 'App.tsx',
            type: 'file',
            language: 'typescript'
          },
          {
            name: 'main.tsx',
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
  const getIconClass = () => {
    if (language === 'json') return 'file-icon-json';
    if (language === 'markdown') return 'file-icon-md';
    if (name.endsWith('.tsx') || name.endsWith('.ts')) return 'file-icon-ts';
    if (name.endsWith('.js') || name.endsWith('.jsx')) return 'file-icon-js';
    if (name.endsWith('.css')) return 'file-icon-css';
    if (name.endsWith('.html')) return 'file-icon-html';
    if (name.match(/\.(png|jpg|jpeg|gif|svg|webp)$/i)) return 'file-icon-img';
    return 'file-icon-default';
  };

  const getIcon = () => {
    if (language === 'json') return <FileJson size={16} />;
    if (language === 'markdown') return <FileText size={16} />;
    if (name.endsWith('.tsx') || name.endsWith('.ts') || name.endsWith('.js') || name.endsWith('.jsx')) {
      return <FileCode size={16} />;
    }
    return <FileText size={16} />;
  };

  return <span className={getIconClass()}>{getIcon()}</span>;
};

// File or folder item component with enhanced styling
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
    <div>
      <div
        className={`file-tree-item ${isActive ? 'active' : ''}`}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={toggleExpanded}
      >
        {item.type === 'folder' && (
          <span className={`file-tree-toggle ${expanded ? 'expanded' : ''}`}>
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </span>
        )}
        
        <span className="file-tree-item-icon">
          {item.type === 'folder' ? 
            <FolderTree size={16} className="file-icon-directory" /> : 
            <FileIcon name={item.name} language={item.language} />
          }
        </span>
        
        <span className="file-tree-item-name">
          {item.name}
        </span>
      </div>
      
      {item.type === 'folder' && expanded && item.children && (
        <div className="file-tree-directory">
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

// Search component
const SearchPanel: React.FC = () => (
  <div className="search-panel">
    <div className="search-input-container">
      <Search size={14} className="search-icon" />
      <input 
        type="text" 
        className="search-input" 
        placeholder="Search in project..." 
      />
    </div>

    <div className="search-options">
      <label className="search-option">
        <input type="checkbox" className="search-checkbox" />
        <span>Case sensitive</span>
      </label>
      <label className="search-option">
        <input type="checkbox" className="search-checkbox" />
        <span>Whole word</span>
      </label>
      <label className="search-option">
        <input type="checkbox" className="search-checkbox" />
        <span>Regular expression</span>
      </label>
    </div>

    <div className="search-history">
      <div className="search-history-heading">Recent Searches</div>
      <div className="search-history-items">
        <div className="search-history-item">
          <Search size={12} />
          <span>api.connectDatabase</span>
        </div>
        <div className="search-history-item">
          <Search size={12} />
          <span>renderComponent</span>
        </div>
      </div>
    </div>
  </div>
);

// Git panel component
const GitPanel: React.FC = () => (
  <div className="git-panel">
    <div className="git-branch">
      <GitBranch size={14} className="git-branch-icon" />
      <span className="git-branch-name">main</span>
      <div className="git-sync">
        <div className="git-sync-status">
          <span className="git-upload">↑3</span>
          <span className="git-download">↓0</span>
        </div>
      </div>
    </div>

    <div className="git-changes">
      <div className="git-changes-header">Changes (3)</div>
      <div className="git-change-items">
        <div className="git-change-item modified">
          <div className="git-change-status">M</div>
          <div className="git-change-file">src/components/Button.tsx</div>
        </div>
        <div className="git-change-item added">
          <div className="git-change-status">A</div>
          <div className="git-change-file">src/components/Card.tsx</div>
        </div>
        <div className="git-change-item modified">
          <div className="git-change-status">M</div>
          <div className="git-change-file">package.json</div>
        </div>
      </div>
    </div>

    <div className="git-actions">
      <button className="git-action-button commit">
        <GitBranch size={14} />
        <span>Commit</span>
      </button>
      <div className="git-action-buttons">
        <button className="git-action-button secondary">Pull</button>
        <button className="git-action-button secondary">Push</button>
      </div>
    </div>
  </div>
);

// Extension card component
const ExtensionCard: React.FC<{ name: string, version: string, icon: React.ReactNode }> = ({ 
  name, version, icon 
}) => (
  <div className="extension-card">
    <div className="extension-icon">
      {icon}
    </div>
    <div className="extension-info">
      <div className="extension-name">{name}</div>
      <div className="extension-version">{version}</div>
    </div>
    <div className="extension-actions">
      <button className="extension-button">
        <Settings size={14} />
      </button>
    </div>
  </div>
);

// Extensions panel component
const ExtensionsPanel: React.FC = () => (
  <div className="extensions-panel">
    <div className="extensions-search">
      <Search size={14} className="extensions-search-icon" />
      <input 
        type="text" 
        className="extensions-search-input" 
        placeholder="Search extensions..."
      />
    </div>
    
    <div className="extensions-list">
      <div className="extensions-heading">Installed</div>
      <ExtensionCard 
        name="Git Integration" 
        version="v1.2.0" 
        icon={<GitBranch size={24} />}
      />
      <ExtensionCard 
        name="Database Tools" 
        version="v0.9.4" 
        icon={<Database size={24} />}
      />
      <ExtensionCard 
        name="Code AI" 
        version="v2.1.3" 
        icon={<Zap size={24} />}
      />
      
      <div className="extensions-heading">Recommended</div>
      <ExtensionCard 
        name="Theme Designer" 
        version="v1.0.2" 
        icon={<Diamond size={24} />}
      />
    </div>
  </div>
);

// Collaboration component
const CollaborationPanel: React.FC = () => (
  <div className="collaboration-panel">
    <div className="users-online">
      <div className="users-online-heading">Online (3)</div>
      <div className="users-list">
        <div className="user-item">
          <div className="user-avatar blue">JD</div>
          <div className="user-info">
            <div className="user-name">John Doe</div>
            <div className="user-status">Editing src/components/Button.tsx</div>
          </div>
        </div>
        <div className="user-item">
          <div className="user-avatar green">AS</div>
          <div className="user-info">
            <div className="user-name">Alice Smith</div>
            <div className="user-status">Viewing Git changes</div>
          </div>
        </div>
        <div className="user-item">
          <div className="user-avatar purple">RJ</div>
          <div className="user-info">
            <div className="user-name">Robert Johnson</div>
            <div className="user-status">Inactive</div>
          </div>
        </div>
      </div>
    </div>

    <div className="collaboration-chat">
      <div className="chat-heading">Team Chat</div>
      <div className="chat-messages">
        <div className="chat-message">
          <div className="chat-avatar blue">JD</div>
          <div className="message-content">
            <div className="message-header">
              <span className="message-author">John Doe</span>
              <span className="message-time">10:42 AM</span>
            </div>
            <div className="message-text">Just pushed the button component updates</div>
          </div>
        </div>
        <div className="chat-message">
          <div className="chat-avatar green">AS</div>
          <div className="message-content">
            <div className="message-header">
              <span className="message-author">Alice Smith</span>
              <span className="message-time">10:45 AM</span>
            </div>
            <div className="message-text">Looks great! I'll review it now.</div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const Sidebar: React.FC<SidebarProps> = () => {
  const [activeSidebarIcon, setActiveSidebarIcon] = useState<string>('files');
  
  // Render appropriate content based on active sidebar icon
  const renderSidebarContent = () => {
    switch (activeSidebarIcon) {
      case 'files':
        return (
          <div className="sidebar-section">
            <div className="sidebar-section-header">
              <div>EXPLORER</div>
              <div className="sidebar-section-actions">
                <button 
                  className="btn btn-ghost btn-xs"
                  aria-label="New file" 
                  title="New file"
                >
                  <FilePlus size={16} />
                </button>
                <button 
                  className="btn btn-ghost btn-xs"
                  aria-label="New folder" 
                  title="New folder"
                >
                  <FolderPlus size={16} />
                </button>
              </div>
            </div>
            <div className="file-tree">
              {sampleFiles.map((file, index) => (
                <FileTreeItem key={`${file.name}-${index}`} item={file} depth={0} />
              ))}
            </div>
          </div>
        );
      
      case 'search':
        return <SearchPanel />;
      
      case 'git':
        return <GitPanel />;
      
      case 'extensions':
        return <ExtensionsPanel />;
      
      case 'collab':
        return <CollaborationPanel />;
      
      default:
        return (
          <div className="sidebar-message">
            Select an option from the sidebar
          </div>
        );
    }
  };
  
  return (
    <div className="sidebar">
      <div className="sidebar-tabs">
        <div 
          className={`sidebar-tab ${activeSidebarIcon === 'files' ? 'active' : ''}`}
          onClick={() => setActiveSidebarIcon('files')}
        >
          Files
        </div>
        <div 
          className={`sidebar-tab ${activeSidebarIcon === 'search' ? 'active' : ''}`}
          onClick={() => setActiveSidebarIcon('search')}
        >
          Search
        </div>
        <div 
          className={`sidebar-tab ${activeSidebarIcon === 'git' ? 'active' : ''}`}
          onClick={() => setActiveSidebarIcon('git')}
        >
          Git
        </div>
      </div>
      
      <div className="sidebar-content">
        <div className="sidebar-section">
          <div className="sidebar-section-header">
            <div>EXPLORER</div>
            <div className="sidebar-section-actions">
              <button 
                className="btn btn-ghost btn-xs"
                aria-label="New file" 
                title="New file"
              >
                <FilePlus size={16} />
              </button>
              <button 
                className="btn btn-ghost btn-xs"
                aria-label="New folder" 
                title="New folder"
              >
                <FolderPlus size={16} />
              </button>
            </div>
          </div>
          
          <div className="file-tree">
            {sampleFiles.map((file, index) => (
              <FileTreeItem key={`${file.name}-${index}`} item={file} depth={0} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;