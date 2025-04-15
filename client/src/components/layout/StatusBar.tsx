import { useProject } from '../../contexts/ProjectContext';

const StatusBar = () => {
  const { projectState } = useProject();
  
  // Get active file extension if there is one
  const activeFileExt = projectState.activeFile ? 
    projectState.activeFile.split('.').pop()?.toUpperCase() : 'TEXT';
  
  // Get sync status text
  const getSyncStatusText = () => {
    const targets = projectState.backupStatus.targets;
    
    if (targets.length === 0) return 'Sync: None';
    
    return `Sync: ${targets.includes('github') ? 'GitHub' : ''}${
      targets.includes('github') && targets.includes('onedrive') ? ' + ' : ''
    }${targets.includes('onedrive') ? 'OneDrive' : ''}`;
  };

  return (
    <footer className="h-6 bg-primary-600 dark:bg-primary-800 text-white flex items-center justify-between px-3 text-xs">
      <div className="flex items-center space-x-3">
        <div className="flex items-center">
          <i className="ri-server-line mr-1"></i>
          <span>WebContainer: {
            projectState.containerStatus === 'ready' 
              ? 'Ready' 
              : projectState.containerStatus === 'loading'
              ? 'Loading...'
              : projectState.containerStatus === 'error'
              ? 'Error'
              : 'Idle'
          }</span>
        </div>
        <div className="flex items-center">
          <i className="ri-cloud-line mr-1"></i>
          <span>{getSyncStatusText()}</span>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <div>{activeFileExt || 'TEXT'}</div>
        <div>UTF-8</div>
        <div>LF</div>
        <div>Ln 1, Col 1</div>
      </div>
    </footer>
  );
};

export default StatusBar;
