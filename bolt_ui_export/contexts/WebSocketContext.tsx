import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { WebSocketService, WebSocketMessage, WebSocketMessageType } from '../services/WebSocketService';

interface WebSocketContextProps {
  connected: boolean;
  sendMessage: (type: WebSocketMessageType, payload: any) => void;
  messages: WebSocketMessage[];
  clearMessages: () => void;
}

const WebSocketContext = createContext<WebSocketContextProps>({
  connected: false,
  sendMessage: () => {},
  messages: [],
  clearMessages: () => {},
});

export const WebSocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  const wsService = WebSocketService.getInstance();
  
  // Initialize WebSocket connection
  useEffect(() => {
    // Add connection listener
    const handleConnectionChange = (isConnected: boolean) => {
      setConnected(isConnected);
    };
    
    // Add message listener
    const handleMessage = (message: WebSocketMessage) => {
      setMessages(prev => [...prev, message]);
    };
    
    // Register listeners
    wsService.addConnectionListener(handleConnectionChange);
    wsService.addMessageListener(handleMessage);
    
    // Connect to WebSocket server
    wsService.connect();
    
    // Cleanup on unmount
    return () => {
      wsService.removeConnectionListener(handleConnectionChange);
      wsService.removeMessageListener(handleMessage);
      wsService.disconnect();
    };
  }, []);
  
  // Send a message
  const sendMessage = (type: WebSocketMessageType, payload: any) => {
    wsService.sendMessage({
      type,
      payload,
      timestamp: Date.now(),
    });
  };
  
  // Clear messages
  const clearMessages = () => {
    setMessages([]);
  };
  
  // Context value
  const value: WebSocketContextProps = {
    connected,
    sendMessage,
    messages,
    clearMessages,
  };
  
  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = (): WebSocketContextProps => {
  return useContext(WebSocketContext);
};