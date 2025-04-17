import { useState, useCallback } from 'react';
import { AIMessage, AIAgent, AIModel } from '../types';
import { nanoid } from 'nanoid';
import { AIOrchestrator } from '../services/AIOrchestrator';
import { useProject } from '../contexts/ProjectContext';

export const useAI = () => {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { projectState } = useProject();

  const sendQuery = useCallback(async (query: string, agent: AIAgent = 'Coder', model: AIModel = 'GPT-4') => {
    if (!query.trim() || isProcessing) return;
    
    // Add user message
    const userMessage: AIMessage = {
      id: nanoid(),
      role: 'user',
      content: query,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);
    
    try {
      // Get response from AI
      const response = await AIOrchestrator.routeQuery({
        agent,
        model,
        query,
        context: {
          files: projectState.files,
          selectedFile: projectState.activeFile
        }
      });
      
      // Add AI message
      const aiMessage: AIMessage = {
        id: nanoid(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        agent,
        model
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('AI query failed:', error);
      
      // Add error message
      const errorMessage: AIMessage = {
        id: nanoid(),
        role: 'assistant',
        content: `I'm sorry, I encountered an error while processing your request. Please try again later.`,
        timestamp: new Date(),
        agent,
        model
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, projectState.files, projectState.activeFile]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isProcessing,
    sendQuery,
    clearMessages
  };
};
