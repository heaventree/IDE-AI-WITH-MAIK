import { useProject } from '../../contexts/ProjectContext';

const EditorTabs = () => {
  const { projectState, setActiveFile, closeFile } = useProject();
  
  const getFileIcon = (filePath: string) => {
    const extension = filePath.split('.').pop();
    
    switch (extension) {
      case 'tsx':
      case 'jsx':
        return <i className="ri-reactjs-line mr-1.5 text-primary-500"></i>;
      case 'ts':
      case 'js':
        return <i className="ri-file-code-line mr-1.5"></i>;
      case 'json':
        return <i className="ri-file-text-line mr-1.5"></i>;
      case 'md':
        return <i className="ri-markdown-line mr-1.5 text-blue-500"></i>;
      case 'css':
      case 'scss':
        return <i className="ri-palette-line mr-1.5 text-pink-500"></i>;
      default:
        return <i className="ri-file-line mr-1.5"></i>;
    }
  };
  
  const getFileName = (filePath: string) => {
    return filePath.split('/').pop() || filePath;
  };
  
  return (
    <div className="bg-neutral-200 dark:bg-dark-200 border-b border-neutral-300 dark:border-dark-100 flex overflow-x-auto custom-scrollbar">
      {projectState.openFiles.map(filePath => (
        <div 
          key={filePath}
          className={`flex items-center p-2 ${
            projectState.activeFile === filePath 
              ? 'bg-neutral-100 dark:bg-dark-300' 
              : 'text-neutral-700 dark:text-neutral-400'
          } border-r border-neutral-300 dark:border-dark-100 text-sm`}
          onClick={() => setActiveFile(filePath)}
        >
          {getFileIcon(filePath)}
          <span>{getFileName(filePath)}</span>
          {projectState.unsavedChanges.has(filePath) && (
            <span className="ml-1">•</span>
          )}
          <button 
            className="ml-2 p-1 rounded-full hover:bg-neutral-200 dark:hover:bg-dark-100"
            onClick={(e) => {
              e.stopPropagation();
              closeFile(filePath);
            }}
          >
            <i className="ri-close-line text-xs"></i>
          </button>
        </div>
      ))}
    </div>
  );
};

export default EditorTabs;
