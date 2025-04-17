import React, { useState, useRef, useEffect } from 'react';
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
    <div className="terminal-wrapper">
      {/* Terminal button */}
      {!isOpen && (
        <div className="terminal-button-container">
          <button
            type="button"
            className="terminal-toggle-button"
            onClick={toggleTerminal}
            aria-label="Open terminal"
            title="Open terminal"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      )}
      
      {/* Terminal panel */}
      {isOpen && (
        <div className="terminal-container">
          {/* Terminal header */}
          <div className="terminal-header">
            <div className="terminal-title">
              <TerminalIcon size={14} />
              <span>TERMINAL</span>
            </div>
            <div className="terminal-controls">
              <button
                type="button"
                className="icon-button small"
                onClick={toggleMinimize}
                aria-label={minimized ? 'Maximize terminal' : 'Minimize terminal'}
                title={minimized ? 'Maximize terminal' : 'Minimize terminal'}
              >
                {minimized ? <Maximize size={14} /> : <Minimize size={14} />}
              </button>
              <button
                type="button"
                className="icon-button small"
                onClick={toggleTerminal}
                aria-label="Close terminal"
                title="Close terminal"
              >
                <X size={14} />
              </button>
            </div>
          </div>
          
          {/* Terminal content */}
          {!minimized && (
            <div className="terminal-content">
              {/* Command history */}
              <div 
                ref={historyRef}
                className="terminal-history"
              >
                {history.map((item, index) => (
                  <div key={index} className="terminal-history-item">
                    {item.type === 'command' ? (
                      <div className="terminal-command">
                        <span className="terminal-prompt">{'>'}</span>
                        <span>{item.content}</span>
                      </div>
                    ) : item.type === 'error' ? (
                      <div className="terminal-error">{item.content}</div>
                    ) : item.type === 'success' ? (
                      <div className="terminal-success">{item.content}</div>
                    ) : (
                      <div className="terminal-output">{item.content}</div>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Command input */}
              <form onSubmit={handleSubmit} className="terminal-input-form">
                <div className="terminal-input-container">
                  <span className="terminal-prompt">{'>'}</span>
                  <input
                    ref={inputRef}
                    value={command}
                    onChange={(e) => setCommand(e.target.value)}
                    className="terminal-input"
                    spellCheck={false}
                    autoComplete="off"
                  />
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Set display name for component identification in layout
Terminal.displayName = 'Terminal';

export default Terminal;