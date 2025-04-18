import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// Simple project state type for testing
interface SimpleProjectState {
  containerStatus: 'idle' | 'loading' | 'ready' | 'error';
  files: Record<string, any>;
  activeFile: string | null;
}

// Simple context interface
interface SimpleProjectContextProps {
  projectState: SimpleProjectState;
  initializeProject: () => Promise<void>;
}

// Default state
const defaultState: SimpleProjectState = {
  containerStatus: 'idle',
  files: {},
  activeFile: null
};

// Create context with null check
const SimpleProjectContext = createContext<SimpleProjectContextProps | null>(null);

// Provider component
export function SimpleProjectProvider({ children }: { children: ReactNode }) {
  const [projectState, setProjectState] = useState<SimpleProjectState>(defaultState);

  // Simple initialize function
  const initializeProject = useCallback(async () => {
    console.log("Initializing project...");
    
    // Simulate loading
    setProjectState(prev => ({ ...prev, containerStatus: 'loading' }));
    
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update state
    setProjectState(prev => ({
      ...prev,
      containerStatus: 'ready',
      files: {
        'file1.txt': { name: 'file1.txt', content: 'Hello World' },
        'file2.js': { name: 'file2.js', content: 'console.log("Hello");' }
      }
    }));
    
    console.log("Project initialized successfully");
  }, []);

  // Create value object
  const value = {
    projectState,
    initializeProject
  };

  // Return provider
  return (
    <SimpleProjectContext.Provider value={value}>
      {children}
    </SimpleProjectContext.Provider>
  );
}

// Hook for consuming context
export function useSimpleProject(): SimpleProjectContextProps {
  const context = useContext(SimpleProjectContext);
  if (!context) {
    throw new Error('useSimpleProject must be used within a SimpleProjectProvider');
  }
  return context;
}