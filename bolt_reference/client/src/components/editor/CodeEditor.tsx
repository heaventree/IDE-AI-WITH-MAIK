import { useState, useEffect, useCallback } from 'react';
import EditorTabs from './EditorTabs';
import OutputTabs from '../output/OutputTabs';
import AIAssistant from '../ai/AIAssistant';
import { useProject } from '../../contexts/ProjectContext';

enum OutputTab {
  Preview = 'Preview',
  Terminal = 'Terminal',
  AIAssistant = 'AI Assistant',
  Problems = 'Problems'
}

const CodeEditor = () => {
  const { projectState, saveFile } = useProject();
  const [currentContent, setCurrentContent] = useState('');
  const [activeTab, setActiveTab] = useState<OutputTab>(OutputTab.AIAssistant);
  
  // Update editor content when active file changes
  useEffect(() => {
    if (projectState.activeFile && projectState.files[projectState.activeFile]) {
      setCurrentContent(projectState.files[projectState.activeFile].content || '');
    } else {
      setCurrentContent('');
    }
  }, [projectState.activeFile, projectState.files]);
  
  // Handle content change
  const handleContentChange = useCallback((value: string) => {
    setCurrentContent(value);
    
    // Mark file as having unsaved changes
    if (projectState.activeFile) {
      const updatedUnsavedChanges = new Set(projectState.unsavedChanges);
      updatedUnsavedChanges.add(projectState.activeFile);
    }
  }, [projectState.activeFile, projectState.unsavedChanges]);
  
  // Handle save
  const handleSave = useCallback(() => {
    if (projectState.activeFile) {
      saveFile(projectState.activeFile, currentContent);
    }
  }, [projectState.activeFile, currentContent, saveFile]);
  
  useEffect(() => {
    // Set up Ctrl+S shortcut for saving
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleSave]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Editor tabs */}
      <EditorTabs />
      
      {/* Code editor and preview split view */}
      <div className="flex-1 flex overflow-hidden">
        {/* Code editor */}
        <div className="w-1/2 flex flex-col border-r border-neutral-300 dark:border-dark-100 resize-horizontal min-w-[300px] max-w-[70%]">
          {/* Code editor header */}
          <div className="p-2 border-b border-neutral-300 dark:border-dark-100 bg-neutral-100 dark:bg-dark-300 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-medium">EDITOR</span>
            </div>
            <div className="flex space-x-1">
              <button className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-dark-100 transition text-xs" title="Format">
                <i className="ri-indent-increase"></i>
              </button>
              <button className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-dark-100 transition text-xs" title="Find">
                <i className="ri-search-line"></i>
              </button>
              <button 
                className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-dark-100 transition text-xs" 
                title="Save"
                onClick={handleSave}
              >
                <i className="ri-save-line"></i>
              </button>
            </div>
          </div>
          
          {/* Code editor content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar bg-white dark:bg-dark-400 p-4">
            {projectState.activeFile ? (
              <textarea 
                className="code-editor font-mono text-sm leading-6 w-full h-full bg-transparent outline-none resize-none"
                value={currentContent}
                onChange={(e) => handleContentChange(e.target.value)}
                spellCheck={false}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-neutral-500 dark:text-neutral-400">
                No file open
              </div>
            )}
          </div>
        </div>
        
        {/* App preview / AI Assistance area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Output tabs */}
          <OutputTabs activeTab={activeTab} onTabChange={setActiveTab} />
          
          {/* Output content */}
          <div className="flex-1 bg-white dark:bg-dark-400 overflow-hidden">
            {activeTab === OutputTab.AIAssistant && <AIAssistant />}
            {activeTab === OutputTab.Preview && (
              <div className="h-full flex items-center justify-center text-neutral-500 dark:text-neutral-400">
                Preview will appear here when you run your application
              </div>
            )}
            {activeTab === OutputTab.Terminal && (
              <div className="h-full flex items-center justify-center text-neutral-500 dark:text-neutral-400">
                Terminal output will appear in the panel below
              </div>
            )}
            {activeTab === OutputTab.Problems && (
              <div className="h-full flex items-center justify-center text-neutral-500 dark:text-neutral-400">
                Problems will be listed here
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
