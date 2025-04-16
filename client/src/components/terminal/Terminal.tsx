/** @jsxImportSource theme-ui */
import React, { useState, useRef, useEffect } from 'react';
import { Box, Flex, IconButton, Text } from 'theme-ui';
import { ChevronRight, X, Minimize, Maximize } from 'lucide-react';

interface TerminalProps {
  initialOpen?: boolean;
}

interface TerminalHistoryItem {
  type: 'command' | 'output';
  content: string;
}

const Terminal: React.FC<TerminalProps> = ({ initialOpen = false }) => {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [command, setCommand] = useState('');
  const [history, setHistory] = useState<TerminalHistoryItem[]>([
    { type: 'output', content: 'Welcome to MAIK IDE Terminal' },
    { type: 'output', content: 'Type "help" for a list of available commands' },
  ]);
  const [minimized, setMinimized] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);
  
  // Focus the input when the terminal is opened
  useEffect(() => {
    if (isOpen && !minimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, minimized]);
  
  // Scroll to bottom when history changes
  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight;
    }
  }, [history]);
  
  // Handle command submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!command.trim()) return;
    
    // Add command to history
    setHistory(prev => [...prev, { type: 'command', content: command }]);
    
    // Process command
    processCommand(command);
    
    // Clear command input
    setCommand('');
  };
  
  // Process a command
  const processCommand = (cmd: string) => {
    const lowerCmd = cmd.toLowerCase().trim();
    
    if (lowerCmd === 'clear' || lowerCmd === 'cls') {
      setHistory([]);
      return;
    }
    
    if (lowerCmd === 'help') {
      setHistory(prev => [...prev, { 
        type: 'output', 
        content: `Available commands:
  help - Show this help message
  clear - Clear the terminal
  echo [text] - Echo text back to the terminal
  time - Show current time
  exit - Close the terminal` 
      }]);
      return;
    }
    
    if (lowerCmd === 'exit') {
      setIsOpen(false);
      return;
    }
    
    if (lowerCmd === 'time') {
      const now = new Date();
      setHistory(prev => [...prev, { 
        type: 'output', 
        content: `Current time: ${now.toLocaleTimeString()}` 
      }]);
      return;
    }
    
    if (lowerCmd.startsWith('echo ')) {
      const text = cmd.substring(5);
      setHistory(prev => [...prev, { type: 'output', content: text }]);
      return;
    }
    
    // Command not recognized
    setHistory(prev => [...prev, { 
      type: 'output', 
      content: `Command not found: ${cmd}. Type "help" for available commands.` 
    }]);
  };
  
  // Toggle terminal visibility
  const toggleTerminal = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setMinimized(false);
    }
  };
  
  // Toggle minimized state
  const toggleMinimize = () => {
    setMinimized(!minimized);
  };
  
  return (
    <Box
      sx={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 10,
      }}
    >
      {/* Terminal button */}
      {!isOpen && (
        <Flex
          sx={{
            position: 'absolute',
            bottom: 0,
            right: 16,
            mb: 2,
          }}
        >
          <IconButton
            onClick={toggleTerminal}
            aria-label="Open terminal"
            title="Open terminal"
            sx={{
              borderRadius: 'full',
              bg: 'primary',
              color: 'white',
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              '&:hover': {
                bg: 'primary',
                opacity: 0.9,
              },
            }}
          >
            <ChevronRight size={24} />
          </IconButton>
        </Flex>
      )}
      
      {/* Terminal panel */}
      {isOpen && (
        <Box
          sx={{
            bg: 'black',
            color: 'white',
            borderTop: '1px solid',
            borderColor: 'gray',
            height: minimized ? 40 : 240,
            overflow: 'hidden',
          }}
        >
          {/* Terminal header */}
          <Flex
            sx={{
              alignItems: 'center',
              justifyContent: 'space-between',
              bg: 'rgba(255,255,255,0.1)',
              p: 1,
              borderBottom: '1px solid',
              borderColor: 'rgba(255,255,255,0.2)',
            }}
          >
            <Text sx={{ fontSize: 1, fontWeight: 'bold' }}>Terminal</Text>
            <Flex>
              <IconButton
                onClick={toggleMinimize}
                aria-label={minimized ? 'Maximize terminal' : 'Minimize terminal'}
                title={minimized ? 'Maximize terminal' : 'Minimize terminal'}
                sx={{ mr: 1 }}
              >
                {minimized ? <Maximize size={14} /> : <Minimize size={14} />}
              </IconButton>
              <IconButton
                onClick={toggleTerminal}
                aria-label="Close terminal"
                title="Close terminal"
              >
                <X size={14} />
              </IconButton>
            </Flex>
          </Flex>
          
          {/* Terminal content */}
          {!minimized && (
            <Box sx={{ p: 2, height: 'calc(100% - 40px)', display: 'flex', flexDirection: 'column' }}>
              {/* Command history */}
              <Box 
                ref={historyRef}
                sx={{ 
                  flex: 1, 
                  overflow: 'auto',
                  mb: 2,
                  fontSize: 0,
                  fontFamily: 'monospace',
                }}
              >
                {history.map((item, index) => (
                  <Box key={index} sx={{ mb: 1 }}>
                    {item.type === 'command' ? (
                      <Flex>
                        <Text sx={{ color: 'primary', mr: 1 }}>{'>'}</Text>
                        <Text>{item.content}</Text>
                      </Flex>
                    ) : (
                      <Text sx={{ whiteSpace: 'pre-wrap' }}>{item.content}</Text>
                    )}
                  </Box>
                ))}
              </Box>
              
              {/* Command input */}
              <form onSubmit={handleSubmit}>
                <Flex sx={{ alignItems: 'center' }}>
                  <Text sx={{ color: 'primary', mr: 1 }}>{'>'}</Text>
                  <Box sx={{ flex: 1 }}>
                    <input
                      ref={inputRef}
                      value={command}
                      onChange={(e) => setCommand(e.target.value)}
                      style={{
                        width: '100%',
                        backgroundColor: 'transparent',
                        border: 'none',
                        outline: 'none',
                        color: 'inherit',
                        fontSize: '14px',
                        fontFamily: 'monospace',
                      }}
                      spellCheck={false}
                      autoComplete="off"
                    />
                  </Box>
                </Flex>
              </form>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default Terminal;