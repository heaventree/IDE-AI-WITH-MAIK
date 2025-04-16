/** @jsxImportSource theme-ui */
import React, { useState, useRef, useEffect } from 'react';
import { Box, Flex, Text, Input } from 'theme-ui';

interface TerminalCommand {
  command: string;
  output: string;
}

interface TerminalProps {
  // Add props as needed
}

const Terminal: React.FC<TerminalProps> = () => {
  const [commandHistory, setCommandHistory] = useState<TerminalCommand[]>([]);
  const [currentCommand, setCurrentCommand] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  
  // Focus the input when the terminal is clicked
  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  // Auto-scroll to the bottom of the terminal
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [commandHistory]);
  
  // Process commands
  const handleCommand = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && currentCommand.trim()) {
      // Process command
      let output = '';
      
      // Simple command processing logic
      if (currentCommand === 'help') {
        output = `Available commands:
- help: Show this help message
- clear: Clear the terminal
- version: Show MAIK IDE version
- echo [text]: Echo the text`;
      } else if (currentCommand === 'clear') {
        setCommandHistory([]);
        setCurrentCommand('');
        return;
      } else if (currentCommand === 'version') {
        output = 'MAIK IDE v1.0.0';
      } else if (currentCommand.startsWith('echo ')) {
        output = currentCommand.substring(5);
      } else {
        output = `Command not found: ${currentCommand}`;
      }
      
      // Add to history
      setCommandHistory([...commandHistory, { command: currentCommand, output }]);
      setCurrentCommand('');
    }
  };
  
  return (
    <Flex 
      sx={{ 
        flexDirection: 'column',
        height: '100%',
        bg: 'terminal',
        color: 'terminalText',
        overflow: 'hidden',
        fontFamily: 'monospace',
      }}
      onClick={focusInput}
    >
      {/* Terminal header */}
      <Flex 
        sx={{ 
          alignItems: 'center', 
          justifyContent: 'space-between',
          borderBottom: '1px solid',
          borderColor: 'rgba(255,255,255,0.1)',
          py: 1,
          px: 2,
          height: '28px',
        }}
      >
        <Text sx={{ fontSize: 0 }}>TERMINAL</Text>
      </Flex>
      
      {/* Terminal content */}
      <Box 
        ref={terminalRef}
        sx={{ 
          p: 2,
          height: '100%',
          overflow: 'auto',
          fontSize: 1,
          flex: 1,
        }}
      >
        <Text sx={{ mb: 2 }}>Welcome to MAIK Terminal. Type 'help' for available commands.</Text>
        
        {/* Command history */}
        {commandHistory.map((cmd, index) => (
          <Box key={index} sx={{ mb: 2 }}>
            <Flex>
              <Text sx={{ color: 'primary', mr: 1 }}>{'>'}</Text>
              <Text>{cmd.command}</Text>
            </Flex>
            <Text sx={{ whiteSpace: 'pre-wrap', ml: 2 }}>{cmd.output}</Text>
          </Box>
        ))}
        
        {/* Current command input */}
        <Flex sx={{ alignItems: 'center' }}>
          <Text sx={{ color: 'primary', mr: 1 }}>{'>'}</Text>
          <Input
            ref={inputRef}
            value={currentCommand}
            onChange={(e) => setCurrentCommand(e.target.value)}
            onKeyDown={handleCommand}
            sx={{
              border: 'none',
              bg: 'transparent',
              color: 'terminalText',
              fontFamily: 'monospace',
              fontSize: 1,
              p: 0,
              m: 0,
              outline: 'none',
              width: '100%',
            }}
            autoFocus
          />
        </Flex>
      </Box>
    </Flex>
  );
};

export default Terminal;