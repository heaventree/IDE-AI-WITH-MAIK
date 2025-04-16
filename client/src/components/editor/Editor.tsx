import React, { useEffect, useRef, useState } from 'react';
import { 
  X, Plus, Maximize2, Minimize2, 
  FileCode, FileBadge, FileJson, FileText 
} from 'lucide-react';
import { WebSocketMessageType } from '../../services/WebSocketService';
import { useWebSocket } from '../../contexts/WebSocketContext';

interface EditorProps {
  initialContent?: string;
  language?: string;
  fileName?: string;
}

interface TabInfo {
  id: string;
  name: string;
  language: string;
  content: string;
}

// Get file icon based on file name/extension
const getFileIcon = (fileName: string, size = 16) => {
  if (fileName.endsWith('.json')) return <FileJson size={size} />;
  if (fileName.endsWith('.md')) return <FileText size={size} />;
  if (fileName.endsWith('.ts') || fileName.endsWith('.tsx') || fileName.endsWith('.js') || fileName.endsWith('.jsx')) {
    return <FileCode size={size} />;
  }
  return <FileBadge size={size} />;
};

// Tab component for editor
const EditorTab: React.FC<{
  tab: TabInfo;
  isActive: boolean;
  onActivate: () => void;
  onClose: (e: React.MouseEvent) => void;
}> = ({ tab, isActive, onActivate, onClose }) => (
  <button 
    type="button"
    className={`editor-tab ${isActive ? 'active' : ''}`}
    onClick={onActivate}
  >
    <div className="editor-tab-content">
      <div className="editor-tab-icon">{getFileIcon(tab.name, 14)}</div>
      <div className="editor-tab-name">{tab.name}</div>
    </div>
    <button 
      type="button" 
      className="editor-tab-close"
      onClick={onClose}
      aria-label={`Close ${tab.name}`}
    >
      <X size={14} />
    </button>
  </button>
);

const Editor = ({ 
  initialContent = '', 
  language = 'typescript',
  fileName = 'untitled.ts'
}: EditorProps) => {
  const [tabs, setTabs] = useState<TabInfo[]>([
    {
      id: '1',
      name: fileName,
      language,
      content: initialContent,
    }
  ]);
  const [activeTabId, setActiveTabId] = useState('1');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { sendMessage } = useWebSocket();
  
  // Get the active tab
  const activeTab = tabs.find(tab => tab.id === activeTabId) || tabs[0];
  
  // Handle content change
  const handleContentChange = (content: string) => {
    setTabs(prev => prev.map(tab => 
      tab.id === activeTabId ? { ...tab, content } : tab
    ));
    
    // Send content changes via WebSocket
    sendMessage(WebSocketMessageType.EDIT, {
      fileId: activeTabId,
      fileName: activeTab.name,
      content,
      timestamp: Date.now(),
    });
  };

  // Handle tab close
  const handleCloseTab = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Don't close the last tab
    if (tabs.length === 1) return;
    
    // Remove the tab
    setTabs(prev => prev.filter(tab => tab.id !== tabId));
    
    // If we're closing the active tab, activate another tab
    if (tabId === activeTabId) {
      const index = tabs.findIndex(tab => tab.id === tabId);
      const newActiveIndex = index === 0 ? 1 : index - 1;
      setActiveTabId(tabs[newActiveIndex].id);
    }
  };
  
  // Add a new tab
  const handleAddTab = () => {
    const newId = `tab-${Date.now()}`;
    const newTab: TabInfo = {
      id: newId,
      name: 'untitled.ts',
      language: 'typescript',
      content: '',
    };
    
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newId);
  };
  
  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };
  
  // Try to focus the textarea whenever the active tab changes
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [activeTabId]);
  
  return (
    <div className={`editor-container ${isFullscreen ? 'fullscreen' : ''}`}>
      {/* Tab bar */}
      <div className="editor-tabbar">
        <div className="editor-tabs">
          {tabs.map(tab => (
            <EditorTab
              key={tab.id}
              tab={tab}
              isActive={tab.id === activeTabId}
              onActivate={() => setActiveTabId(tab.id)}
              onClose={(e) => handleCloseTab(tab.id, e)}
            />
          ))}
          
          <button
            type="button"
            className="icon-button new-tab-button"
            onClick={handleAddTab}
            aria-label="New tab"
            title="New tab"
          >
            <Plus size={14} />
          </button>
        </div>
        
        <button
          type="button"
          className="icon-button fullscreen-button"
          onClick={toggleFullscreen}
          aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        >
          {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
        </button>
      </div>
      
      {/* Editor content */}
      <div className="editor-content">
        <textarea
          ref={textareaRef}
          value={activeTab.content}
          onChange={(e) => handleContentChange(e.target.value)}
          className="editor-textarea"
          spellCheck={false}
        />
      </div>
    </div>
  );
};

// Set display name for component identification in layout
Editor.displayName = 'Editor';

export default Editor;