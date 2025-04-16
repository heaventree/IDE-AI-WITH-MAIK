/** @jsxImportSource theme-ui */
import React, { useEffect, useRef, useState } from 'react';
import { Box, Flex, IconButton, Text, Button } from 'theme-ui';
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
    <Box sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      position: isFullscreen ? 'fixed' : 'relative',
      top: isFullscreen ? 0 : 'auto',
      left: isFullscreen ? 0 : 'auto',
      right: isFullscreen ? 0 : 'auto',
      bottom: isFullscreen ? 0 : 'auto',
      zIndex: isFullscreen ? 1000 : 'auto',
      bg: 'editor',
      color: 'text',
    }}>
      {/* Tab bar */}
      <Flex variant="layout.tabBar">
        <Flex variant="layout.tabContainer">
          {tabs.map(tab => (
            <Button
              key={tab.id}
              variant={tab.id === activeTabId ? "tabActive" : "tab"}
              onClick={() => setActiveTabId(tab.id)}
            >
              <Flex sx={{ alignItems: 'center' }}>
                {getFileIcon(tab.name, 14)}
                <Text sx={{ ml: 1 }}>{tab.name}</Text>
              </Flex>
              <Box 
                className="tab-close"
                onClick={(e) => handleCloseTab(tab.id, e)}
              >
                <X size={14} />
              </Box>
            </Button>
          ))}
          
          <Button
            variant="text"
            onClick={handleAddTab}
            sx={{
              py: 2,
              px: 2,
              borderRadius: 0,
              color: 'text',
              '&:hover': {
                bg: 'rgba(114, 124, 245, 0.08)',
                color: 'primary',
                transition: 'all 0.2s ease',
              },
            }}
            aria-label="New tab"
            title="New tab"
          >
            <Plus size={14} />
          </Button>
        </Flex>
        
        <Button
          variant="text"
          onClick={toggleFullscreen}
          sx={{
            py: 2,
            px: 2,
            borderRadius: 0,
            borderLeft: '1px solid',
            borderColor: 'border',
            color: 'text',
            '&:hover': {
              bg: 'rgba(114, 124, 245, 0.08)',
              color: 'primary',
              transition: 'all 0.2s ease',
            },
          }}
          aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        >
          {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
        </Button>
      </Flex>
      
      {/* Editor content */}
      <Box sx={{
        flex: 1,
        overflow: 'auto',
        position: 'relative',
        fontFamily: 'monospace',
      }}>
        <textarea
          ref={textareaRef}
          value={activeTab.content}
          onChange={(e) => handleContentChange(e.target.value)}
          style={{
            width: '100%',
            height: '100%',
            padding: '16px',
            backgroundColor: 'transparent',
            border: 'none',
            outline: 'none',
            fontFamily: 'monospace',
            fontSize: '14px',
            resize: 'none',
            color: 'inherit',
          }}
          spellCheck={false}
        />
      </Box>
    </Box>
  );
};

// Set display name for component identification in layout
Editor.displayName = 'Editor';

export default Editor;