import React, { useState, useEffect } from 'react';
import { ThemeUIProvider as ThemeProvider, useColorMode } from 'theme-ui';
import theme from '../theme';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeUIContextProvider = ({ children }: ThemeProviderProps) => {
  // Initialize with dark mode
  return (
    <ThemeProvider theme={theme}>
      <InitDarkMode>{children}</InitDarkMode>
    </ThemeProvider>
  );
};

// Component to initialize dark mode after mount
const InitDarkMode = ({ children }: { children: React.ReactNode }) => {
  const [, setColorMode] = useColorMode();
  
  useEffect(() => {
    // Set dark mode on initial render
    setColorMode('dark');
  }, [setColorMode]);
  
  return <>{children}</>;
};

export default ThemeUIContextProvider;