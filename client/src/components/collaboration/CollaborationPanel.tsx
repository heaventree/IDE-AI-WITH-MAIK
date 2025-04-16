/** @jsxImportSource theme-ui */
import React, { useState, useEffect } from 'react';
import { Box, Flex, Text, Badge } from 'theme-ui';
import { useWebSocket } from '../../contexts/WebSocketContext';
import { WebSocketMessageType } from '../../services/WebSocketService';

interface User {
  id: string;
  color: string;
  lastActivity: number;
}

interface CollaborationPanelProps {
  // Add props as needed
}

const CollaborationPanel: React.FC<CollaborationPanelProps> = () => {
  const { connected, messages } = useWebSocket();
  const [users, setUsers] = useState<Record<string, User>>({});
  
  // Random user colors
  const getRandomColor = () => {
    const colors = [
      '#4361ee', // blue
      '#3a86ff', // bright blue
      '#ff006e', // pink
      '#8338ec', // purple
      '#fb5607', // orange
      '#ff9f1c', // amber
      '#2ec4b6', // teal
      '#06d6a0', // green
    ];
    
    return colors[Math.floor(Math.random() * colors.length)];
  };
  
  // Process incoming messages
  useEffect(() => {
    if (messages.length === 0) return;
    
    // Get the most recent message
    const message = messages[messages.length - 1];
    
    if (!message.userId) return;
    
    switch (message.type) {
      case WebSocketMessageType.USER_JOINED:
        setUsers(prev => ({
          ...prev,
          [message.userId!]: {
            id: message.userId!,
            color: getRandomColor(),
            lastActivity: Date.now(),
          }
        }));
        break;
        
      case WebSocketMessageType.USER_LEFT:
        setUsers(prev => {
          const newUsers = { ...prev };
          delete newUsers[message.userId!];
          return newUsers;
        });
        break;
        
      case WebSocketMessageType.CURSOR_POSITION:
      case WebSocketMessageType.EDIT:
      case WebSocketMessageType.FILE_CHANGE:
        setUsers(prev => {
          if (prev[message.userId!]) {
            return {
              ...prev,
              [message.userId!]: {
                ...prev[message.userId!],
                lastActivity: Date.now(),
              }
            };
          }
          return prev;
        });
        break;
    }
  }, [messages]);
  
  return (
    <Box sx={{ p: 2 }}>
      <Flex sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Text sx={{ fontWeight: 'bold', fontSize: 1 }}>Collaboration</Text>
        <Badge 
          variant="primary" 
          sx={{ 
            bg: connected ? 'green' : 'gray', 
            fontSize: 0, 
            px: 2,
            py: 1,
            borderRadius: 'full'
          }}
        >
          {connected ? 'Connected' : 'Disconnected'}
        </Badge>
      </Flex>
      
      <Text sx={{ fontSize: 0, mb: 2 }}>Connected users:</Text>
      
      {Object.values(users).length === 0 ? (
        <Text sx={{ fontSize: 0, color: 'gray' }}>No other users connected</Text>
      ) : (
        <Box>
          {Object.values(users).map(user => (
            <Flex 
              key={user.id} 
              sx={{ 
                alignItems: 'center', 
                mb: 1,
                py: 1,
                px: 2,
                borderRadius: 'sm',
                '&:hover': {
                  bg: 'muted',
                }
              }}
            >
              <Box 
                sx={{ 
                  width: 8, 
                  height: 8, 
                  borderRadius: '50%', 
                  bg: user.color,
                  mr: 2,
                }}
              />
              <Text sx={{ fontSize: 0 }}>
                {user.id.length > 10 ? `${user.id.substring(0, 10)}...` : user.id}
              </Text>
            </Flex>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default CollaborationPanel;