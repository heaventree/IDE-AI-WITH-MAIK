import React from 'react';
import { ThemeUIProvider as ThemeProvider } from 'theme-ui';
import theme from '../theme';

interface ThemeProviderProps {
  children: React.ReactNode;
}

// Simple ThemeUI Context Provider using the theme from theme.ts
export const ThemeUIContextProvider = ({ children }: ThemeProviderProps) => {
  return (
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  );
};

export default ThemeUIContextProvider;