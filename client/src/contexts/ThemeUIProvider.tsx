import React from 'react';
import { ThemeProvider as ThemeUIProvider } from 'theme-ui';
import theme from '../theme';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeUIContextProvider = ({ children }: ThemeProviderProps) => {
  return (
    <ThemeUIProvider theme={theme}>
      {children}
    </ThemeUIProvider>
  );
};

export default ThemeUIContextProvider;