/** @jsxImportSource theme-ui */
import React, { useEffect, useState } from 'react';
import { Flex, Text, Box } from 'theme-ui';
import { 
  Zap, Clock, GitBranch, Circle, 
  FileCode, Bell, Wifi, Cpu, 
  CheckCircle, Terminal
} from 'lucide-react';
import { useWebSocket } from '../../contexts/WebSocketContext';

interface StatusBarProps {
  // Add props as needed
}

const StatusBar: React.FC<StatusBarProps> = () => {
  const { connected } = useWebSocket();
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  
  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  return (
    <Flex sx={{ width: '100%', justifyContent: 'space-between' }}>
      {/* Left status items */}
      <Flex variant="layout.statusBarItems">
        <Box className="status-item" 
          sx={{ 
            color: connected ? 'success' : 'foregroundMuted',
          }}
        >
          <Circle size={8} fill={connected ? 'currentColor' : 'none'} />
          <Text>
            {connected ? 'Connected' : 'Disconnected'}
          </Text>
        </Box>
        
        <Box className="status-item">
          <Zap size={12} />
          <Text>Ready</Text>
        </Box>
        
        <Box className="status-item">
          <FileCode size={12} />
          <Text>TypeScript</Text>
        </Box>
        
        <Box className="status-item">
          <Terminal size={12} />
          <Text>main.ts</Text>
        </Box>
      </Flex>
      
      {/* Right status items */}
      <Flex variant="layout.statusBarItems">
        <Box className="status-item" title="Git branch">
          <GitBranch size={12} />
          <Text>main</Text>
        </Box>
        
        <Box className="status-item" title="Performance: 98% efficient">
          <Cpu size={12} />
          <Text>98%</Text>
        </Box>
        
        <Box className="status-item" title="All systems normal">
          <CheckCircle size={12} color="#0acf97" />
          <Text sx={{ color: 'success' }}>All good</Text>
        </Box>
        
        <Box className="status-item" title="Current time">
          <Clock size={12} />
          <Text>{time}</Text>
        </Box>
      </Flex>
    </Flex>
  );
};

export default StatusBar;