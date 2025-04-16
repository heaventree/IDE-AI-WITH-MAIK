/** @jsxImportSource theme-ui */
import React, { useState, useRef, useEffect } from 'react';
import { Box, Flex, IconButton, Text } from 'theme-ui';
import { ChevronRight, X, Minimize, Maximize, Terminal as TerminalIcon } from 'lucide-react';

interface TerminalProps {
  initialOpen?: boolean;
}

interface TerminalHistoryItem {
  type: 'command' | 'output' | 'error' | 'success';
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
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              '&:hover': {
                bg: 'secondary',
                transition: 'all 0.2s ease',
              },
            }}
          >
            <ChevronRight size={24} />
          </IconButton>
        </Flex>
      )}
      
      {/* Terminal panel */}
      {isOpen && (
        <Box variant="layout.terminal">
          {/* Terminal header */}
          <Flex variant="layout.terminalHeader">
            <Flex sx={{ alignItems: 'center' }}>
              <TerminalIcon size={14} sx={{ mr: 1 }} />
              <Text variant="text.label" sx={{ fontSize: 0 }}>TERMINAL</Text>
            </Flex>
            <Flex>
              <IconButton
                variant="icon"
                onClick={toggleMinimize}
                aria-label={minimized ? 'Maximize terminal' : 'Minimize terminal'}
                title={minimized ? 'Maximize terminal' : 'Minimize terminal'}
                sx={{ width: '28px', height: '28px', mr: 1 }}
              >
                {minimized ? <Maximize size={14} /> : <Minimize size={14} />}
              </IconButton>
              <IconButton
                variant="icon"
                onClick={toggleTerminal}
                aria-label="Close terminal"
                title="Close terminal"
                sx={{ width: '28px', height: '28px' }}
              >
                <X size={14} />
              </IconButton>
            </Flex>
          </Flex>
          
          {/* Terminal content */}
          {!minimized && (
            <Box variant="layout.terminalContent">
              {/* Command history */}
              <Box 
                ref={historyRef}
                sx={{ 
                  mb: 2,
                  fontSize: 0,
                  fontFamily: 'monospace',
                  lineHeight: 1.5,
                }}
              >
                {history.map((item, index) => (
                  <Box key={index} sx={{ mb: 1 }}>
                    {item.type === 'command' ? (
                      <Flex>
                        <Text className="command" sx={{ mr: 1 }}>{'>'}</Text>
                        <Text className="command">{item.content}</Text>
                      </Flex>
                    ) : item.type === 'error' ? (
                      <Text className="error" sx={{ whiteSpace: 'pre-wrap' }}>{item.content}</Text>
                    ) : item.type === 'success' ? (
                      <Text className="success" sx={{ whiteSpace: 'pre-wrap' }}>{item.content}</Text>
                    ) : (
                      <Text className="output" sx={{ whiteSpace: 'pre-wrap' }}>{item.content}</Text>
                    )}
                  </Box>
                ))}
              </Box>
              
              {/* Command input */}
              <form onSubmit={handleSubmit}>
                <Flex sx={{ alignItems: 'center' }}>
                  <Text className="command" sx={{ mr: 1 }}>{'>'}</Text>
                  <Box sx={{ flex: 1 }}>
                    <input
                      ref={inputRef}
                      value={command}
                      onChange={(e) => setCommand(e.target.value)}
                      sx={{
                        width: '100%',
                        bg: 'transparent',
                        border: 'none',
                        outline: 'none',
                        color: 'terminalText',
                        fontSize: 0,
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

// Set display name for component identification in layout
Terminal.displayName = 'Terminal';

export default Terminal;