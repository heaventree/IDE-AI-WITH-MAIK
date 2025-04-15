import { useState, useRef, useEffect } from 'react';
import { useProject } from '../../contexts/ProjectContext';

const Terminal = () => {
  const { executeCommand } = useProject();
  const [expanded, setExpanded] = useState(true);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [outputHistory, setOutputHistory] = useState<Array<{command: string, output: string}>>([]);
  const [currentCommand, setCurrentCommand] = useState('');
  const commandInputRef = useRef<HTMLInputElement>(null);
  
  // Auto focus command input when terminal is expanded
  useEffect(() => {
    if (expanded && commandInputRef.current) {
      commandInputRef.current.focus();
    }
  }, [expanded]);

  const handleCommandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentCommand.trim()) return;
    
    // Add command to history
    setCommandHistory(prev => [...prev, currentCommand]);
    
    try {
      // Execute command
      const result = await executeCommand(currentCommand);
      
      // Add output to history
      setOutputHistory(prev => [
        ...prev,
        {
          command: currentCommand,
          output: result.stdout + (result.stderr ? '\n' + result.stderr : '')
        }
      ]);
    } catch (error) {
      // Add error to history
      setOutputHistory(prev => [
        ...prev,
        {
          command: currentCommand,
          output: `Error: ${(error as Error).message}`
        }
      ]);
    }
    
    // Clear current command
    setCurrentCommand('');
  };

  return (
    <div 
      className={`border-t border-neutral-300 dark:border-dark-100 bg-dark-500 text-green-400 font-mono text-sm overflow-y-auto custom-scrollbar resize-vertical ${
        expanded ? 'h-64' : 'h-8'
      }`}
    >
      <div className="p-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-medium text-neutral-400">TERMINAL</span>
        </div>
        <div className="flex space-x-1">
          <button 
            className="p-1 rounded hover:bg-dark-300 transition text-xs text-neutral-400"
            onClick={() => setExpanded(!expanded)}
          >
            <i className={`ri-${expanded ? 'subtract-line' : 'add-line'}`}></i>
          </button>
          <button 
            className="p-1 rounded hover:bg-dark-300 transition text-xs text-neutral-400"
            onClick={() => setOutputHistory([])}
          >
            <i className="ri-eraser-line"></i>
          </button>
        </div>
      </div>
      
      {expanded && (
        <div className="px-3 pb-3 overflow-y-auto" style={{ maxHeight: 'calc(100% - 32px)' }}>
          {/* Output history */}
          {outputHistory.map((entry, index) => (
            <div key={index} className="mb-2">
              <div className="text-white">$ {entry.command}</div>
              <pre className="whitespace-pre-wrap break-all">{entry.output}</pre>
            </div>
          ))}
          
          {/* Command input */}
          <form onSubmit={handleCommandSubmit} className="flex items-center">
            <span className="text-white mr-1">$</span>
            <input
              ref={commandInputRef}
              type="text"
              className="flex-1 bg-transparent outline-none border-none text-green-400"
              value={currentCommand}
              onChange={(e) => setCurrentCommand(e.target.value)}
              placeholder="Enter command..."
            />
          </form>
        </div>
      )}
    </div>
  );
};

export default Terminal;
