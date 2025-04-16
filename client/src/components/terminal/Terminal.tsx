/** @jsxImportSource theme-ui */
import React, { useState, useRef, useEffect } from 'react';
import { Box, Flex, Input } from 'theme-ui';

const Terminal: React.FC = () => {
  const [commandHistory, setCommandHistory] = useState<string[]>([
    'Welcome to Bolt DIY Terminal',
    'Type "help" to see available commands',
    '> '
  ]);
  const [currentCommand, setCurrentCommand] = useState('');
  const terminalRef = useRef<HTMLDivElement>(null);

  const handleCommand = (command: string) => {
    if (!command.trim()) return;
    
    // Add command to history
    setCommandHistory(prev => [...prev.slice(0, -1), `> ${command}`, '> ']);
    
    // Process command
    const cmd = command.trim().toLowerCase();
    
    switch (cmd) {
      case 'help':
        setCommandHistory(prev => [...prev.slice(0, -1), 
          'Available commands:',
          '  help - Show this help',
          '  clear - Clear terminal',
          '  echo <text> - Print text',
          '  date - Show current date',
          '> '
        ]);
        break;
      case 'clear':
        setCommandHistory(['> ']);
        break;
      case 'date':
        setCommandHistory(prev => [...prev.slice(0, -1), 
          new Date().toString(),
          '> '
        ]);
        break;
      default:
        if (cmd.startsWith('echo ')) {
          const text = command.substring(5);
          setCommandHistory(prev => [...prev.slice(0, -1), text, '> ']);
        } else {
          setCommandHistory(prev => [...prev.slice(0, -1), 
            `Command not found: ${command}`,
            '> '
          ]);
        }
        break;
    }
    
    // Clear input
    setCurrentCommand('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCommand(currentCommand);
    }
  };

  // Auto scroll to bottom
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [commandHistory]);

  return (
    <Box 
      sx={{ 
        bg: 'terminal',
        color: 'terminalText',
        fontFamily: 'monospace',
        fontSize: 1,
        p: 2,
        height: '100%',
        overflow: 'auto'
      }}
      ref={terminalRef}
    >
      {/* Output Lines */}
      <Box>
        {commandHistory.map((line, i) => (
          <Box key={i} sx={{ whiteSpace: 'pre-wrap', mb: 1 }}>
            {line}
          </Box>
        ))}
      </Box>
      
      {/* Input Line (hidden, just for handling input) */}
      <Input
        type="text"
        value={currentCommand}
        onChange={e => setCurrentCommand(e.target.value)}
        onKeyDown={handleKeyDown}
        autoFocus
        sx={{
          position: 'absolute',
          left: '-9999px',  // Hide it off-screen
          width: '1px',
          height: '1px',
          opacity: 0
        }}
      />
    </Box>
  );
};

export default Terminal;