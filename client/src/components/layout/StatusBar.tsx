/** @jsxImportSource theme-ui */
import React from 'react';
import { Flex, Text, Badge } from 'theme-ui';
import { Zap, Clock, GitBranch, Circle } from 'lucide-react';
import { useWebSocket } from '../../contexts/WebSocketContext';

interface StatusBarProps {
  // Add props as needed
}

const StatusBar: React.FC<StatusBarProps> = () => {
  const { connected } = useWebSocket();
  
  return (
    <Flex
      sx={{
        alignItems: 'center',
        justifyContent: 'space-between',
        py: 1,
        px: 2,
        borderTop: '1px solid',
        borderColor: 'border',
        bg: 'statusBar',
        color: 'statusText',
        fontSize: 0,
      }}
    >
      {/* Left section */}
      <Flex sx={{ alignItems: 'center' }}>
        <Flex 
          sx={{ 
            alignItems: 'center', 
            mr: 3,
            color: connected ? 'green' : 'gray',
          }}
        >
          <Circle size={8} fill={connected ? 'currentColor' : 'none'} style={{ marginRight: '4px' }} />
          <Text>
            {connected ? 'Connected' : 'Disconnected'}
          </Text>
        </Flex>
        
        <Flex sx={{ alignItems: 'center', mr: 3 }}>
          <Zap size={12} style={{ marginRight: '4px' }} />
          <Text>Ready</Text>
        </Flex>
      </Flex>
      
      {/* Right section */}
      <Flex sx={{ alignItems: 'center' }}>
        <Flex sx={{ alignItems: 'center', mr: 3 }}>
          <GitBranch size={12} style={{ marginRight: '4px' }} />
          <Text>main</Text>
        </Flex>
        
        <Flex sx={{ alignItems: 'center' }}>
          <Clock size={12} style={{ marginRight: '4px' }} />
          <Text>{new Date().toLocaleTimeString()}</Text>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default StatusBar;