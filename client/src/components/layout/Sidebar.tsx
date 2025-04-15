import { useState, useMemo } from 'react';
import { useProject } from '../../contexts/ProjectContext';
import { FileEntry } from '../../types';

const Sidebar = () => {
  const { projectState, openFile, createFile, createFolder } = useProject();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ 'src': true });

  const fileTree = useMemo(() => {
    const tree: Record<string, FileEntry> = {};
    
    // Build file tree from flat files object
    Object.values(projectState.files).forEach(file => {
      const pathParts = file.path.split('/');
      let currentLevel = tree;
      
      // Navigate through path parts to build the tree
      pathParts.forEach((part, index) => {
        const isLast = index === pathParts.length - 1;
        const currentPath = pathParts.slice(0, index + 1).join('/');
        
        if (isLast) {
          // Add actual file at the last level
          currentLevel[part] = { ...file };
        } else {
          // Create folder if it doesn't exist
          if (!currentLevel[part]) {
            currentLevel[part] = {
              name: part,
              path: currentPath,
              type: 'folder',
              children: {}
            };
          }
          
          // Move to next level
          if (!currentLevel[part].children) {
            currentLevel[part].children = {};
          }
          currentLevel = currentLevel[part].children as Record<string, FileEntry>;
        }
      });
    });
    
    return tree;
  }, [projectState.files]);

  const toggleFolder = (path: string) => {
    setExpanded(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };

  const getFileIcon = (file: FileEntry) => {
    if (file.type === 'folder') {
      return expanded[file.path] ? (
        <i className="ri-folder-open-line mr-1.5 text-primary-500"></i>
      ) : (
        <i className="ri-folder-line mr-1.5 text-amber-500"></i>
      );
    }
    
    // File type icons based on extension
    switch (file.extension) {
      case 'tsx':
      case 'jsx':
        return <i className="ri-reactjs-line mr-1.5 text-primary-500"></i>;
      case 'ts':
      case 'js':
        return <i className="ri-file-code-line mr-1.5 text-neutral-700 dark:text-neutral-400"></i>;
      case 'json':
        return <i className="ri-file-text-line mr-1.5 text-neutral-700 dark:text-neutral-400"></i>;
      case 'md':
        return <i className="ri-markdown-line mr-1.5 text-blue-500"></i>;
      case 'css':
      case 'scss':
        return <i className="ri-palette-line mr-1.5 text-pink-500"></i>;
      default:
        return <i className="ri-file-line mr-1.5 text-neutral-700 dark:text-neutral-400"></i>;
    }
  };

  const renderFileTree = (tree: Record<string, FileEntry>, level = 0) => {
    return Object.values(tree)
      .sort((a, b) => {
        // Folders first, then sort alphabetically
        if (a.type === 'folder' && b.type !== 'folder') return -1;
        if (a.type !== 'folder' && b.type === 'folder') return 1;
        return a.name.localeCompare(b.name);
      })
      .map(item => (
        <div key={item.path} style={{ marginLeft: `${level * 16}px` }}>
          {item.type === 'folder' ? (
            <>
              <div 
                className="flex items-center p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-dark-100 cursor-pointer"
                onClick={() => toggleFolder(item.path)}
              >
                {getFileIcon(item)}
                <span className="text-sm">{item.name}</span>
              </div>
              
              {expanded[item.path] && item.children && (
                <div>
                  {renderFileTree(item.children as Record<string, FileEntry>, level + 1)}
                </div>
              )}
            </>
          ) : (
            <div 
              className={`flex items-center p-1.5 rounded cursor-pointer ${
                projectState.activeFile === item.path 
                  ? 'bg-neutral-200 dark:bg-dark-100' 
                  : 'hover:bg-neutral-200 dark:hover:bg-dark-100'
              }`}
              onClick={() => openFile(item.path)}
            >
              {getFileIcon(item)}
              <span className="text-sm">{item.name}</span>
            </div>
          )}
        </div>
      ));
  };

  const handleNewFile = () => {
    const fileName = prompt('Enter file name:');
    if (fileName) {
      createFile(fileName);
    }
  };

  const handleNewFolder = () => {
    const folderName = prompt('Enter folder name:');
    if (folderName) {
      createFolder(folderName);
    }
  };

  return (
    <aside className="w-48 lg:w-64 border-r border-neutral-300 dark:border-dark-100 flex flex-col bg-neutral-100 dark:bg-dark-300 overflow-hidden transition-all duration-200 ease-in-out">
      {/* Sidebar header with project name */}
      <div className="p-3 border-b border-neutral-300 dark:border-dark-100 flex justify-between items-center">
        <h2 className="font-medium text-sm">PROJECT EXPLORER</h2>
        <div className="flex space-x-1">
          <button 
            className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-dark-100 transition text-neutral-700 dark:text-neutral-300" 
            title="New File"
            onClick={handleNewFile}
          >
            <i className="ri-file-add-line text-sm"></i>
          </button>
          <button 
            className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-dark-100 transition text-neutral-700 dark:text-neutral-300" 
            title="New Folder"
            onClick={handleNewFolder}
          >
            <i className="ri-folder-add-line text-sm"></i>
          </button>
          <button 
            className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-dark-100 transition text-neutral-700 dark:text-neutral-300" 
            title="Refresh"
          >
            <i className="ri-refresh-line text-sm"></i>
          </button>
        </div>
      </div>
      
      {/* Project explorer tree */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
        <div className="py-1">
          {renderFileTree(fileTree)}
        </div>
      </div>
      
      {/* Sidebar footer with sync status */}
      <div className="p-2 border-t border-neutral-300 dark:border-dark-100 bg-neutral-200 dark:bg-dark-200">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center">
            <i className="ri-cloud-line mr-1 text-secondary-500"></i>
            <span>
              {projectState.backupStatus.syncStatus === 'syncing' 
                ? 'Syncing...' 
                : projectState.backupStatus.syncStatus === 'error'
                ? 'Sync error'
                : projectState.backupStatus.lastBackup 
                ? `Synced (${new Date(projectState.backupStatus.lastBackup).toLocaleTimeString()})` 
                : 'Not synced yet'}
            </span>
          </div>
          <div className="flex space-x-2">
            <button 
              className={`p-1 rounded ${
                projectState.backupStatus.targets.includes('github')
                  ? 'bg-neutral-300 dark:bg-dark-100'
                  : 'hover:bg-neutral-300 dark:hover:bg-dark-100'
              } transition`} 
              title="GitHub"
            >
              <i className="ri-github-fill"></i>
            </button>
            <button 
              className={`p-1 rounded ${
                projectState.backupStatus.targets.includes('onedrive')
                  ? 'bg-neutral-300 dark:bg-dark-100'
                  : 'hover:bg-neutral-300 dark:hover:bg-dark-100'
              } transition`} 
              title="OneDrive"
            >
              <i className="ri-microsoft-line"></i>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
