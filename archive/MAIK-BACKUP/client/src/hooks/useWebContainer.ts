import { useState, useCallback, useEffect } from 'react';
import { WebContainerService } from '../services/WebContainerService';
import { CommandResult } from '../types';

export const useWebContainer = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const initialize = useCallback(async () => {
    if (isInitialized || isInitializing) return;
    
    setIsInitializing(true);
    setError(null);
    
    try {
      await WebContainerService.init();
      setIsInitialized(true);
    } catch (err) {
      setError(err as Error);
      console.error('Failed to initialize WebContainer:', err);
    } finally {
      setIsInitializing(false);
    }
  }, [isInitialized, isInitializing]);

  const executeCommand = useCallback(async (command: string): Promise<CommandResult> => {
    if (!isInitialized) {
      throw new Error('WebContainer not initialized');
    }
    
    try {
      return await WebContainerService.executeCommand(command);
    } catch (err) {
      console.error('Command execution failed:', err);
      throw err;
    }
  }, [isInitialized]);

  const writeFile = useCallback(async (path: string, content: string): Promise<void> => {
    if (!isInitialized) {
      throw new Error('WebContainer not initialized');
    }
    
    try {
      await WebContainerService.writeFile(path, content);
    } catch (err) {
      console.error('File write failed:', err);
      throw err;
    }
  }, [isInitialized]);

  const readFile = useCallback(async (path: string): Promise<string> => {
    if (!isInitialized) {
      throw new Error('WebContainer not initialized');
    }
    
    try {
      return await WebContainerService.readFile(path);
    } catch (err) {
      console.error('File read failed:', err);
      throw err;
    }
  }, [isInitialized]);

  // Auto-initialize on mount
  useEffect(() => {
    if (!isInitialized && !isInitializing) {
      initialize();
    }
  }, [initialize, isInitialized, isInitializing]);

  return {
    isInitialized,
    isInitializing,
    error,
    initialize,
    executeCommand,
    writeFile,
    readFile
  };
};
