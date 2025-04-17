import { useState, useCallback } from 'react';
import { nanoid } from 'nanoid';
import { AIMessage, AIAgent } from '@/types';
import { useToast } from './use-toast';

export const useAI = () => {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeAgent, setActiveAgent] = useState<AIAgent>('Coder');
  const { toast } = useToast();

  // Send a query to the AI API
  const sendQuery = useCallback(async (query: string, agent?: AIAgent) => {
    if (isProcessing) return;
    
    // Set the agent to use (default to active agent if not specified)
    const selectedAgent = agent || activeAgent;
    
    // Create a user message
    const userMessage: AIMessage = {
      id: nanoid(),
      role: 'user',
      content: query,
      timestamp: new Date(),
      agent: selectedAgent
    };
    
    // Add the user message to the messages list
    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);
    
    try {
      // Make API request to the backend
      const response = await fetch('/api/ai/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent: selectedAgent,
          query,
          context: {
            projectId: 'demo-project',
            files: [],
            activeFile: ''
          }
        })
      });
      
      if (!response.ok) {
        throw new Error(`AI request failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error?.message || 'Unknown API error');
      }
      
      // Create an assistant message from the response
      const assistantMessage: AIMessage = {
        id: nanoid(),
        role: 'assistant',
        content: data.data.response,
        timestamp: new Date(),
        agent: data.data.agent,
        model: data.data.model
      };
      
      // Add the assistant message to the messages list
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI request error:', error);
      
      toast({
        title: 'AI Request Error',
        description: (error as Error).message,
        type: 'error'
      });
      
      // Create an error message
      const errorMessage: AIMessage = {
        id: nanoid(),
        role: 'assistant',
        content: `Sorry, I encountered an error: ${(error as Error).message}. Please try again.`,
        timestamp: new Date(),
        agent: selectedAgent
      };
      
      // Add the error message to the messages list
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  }, [activeAgent, isProcessing, toast]);
  
  // Change the active agent
  const setAgent = useCallback((agent: AIAgent) => {
    setActiveAgent(agent);
  }, []);
  
  // Clear all messages
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);
  
  return {
    messages,
    isProcessing,
    activeAgent,
    sendQuery,
    setAgent,
    clearMessages
  };
};