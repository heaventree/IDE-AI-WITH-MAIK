/**
 * MAIK AI Coding App - Unified Style Provider
 * 
 * This provider consolidates all styling approaches into a single tree:
 * 1. Injects CSS variables from design tokens
 * 2. Provides Theme UI context with the theme from our design system
 * 3. Configures dark/light mode based on system preference
 * 
 * IMPORTANT: This is the central styling provider and MUST wrap the application.
 * Never create additional styling providers or contexts.
 */

import React, { useEffect, useState } from 'react';
import { ThemeUIProvider } from 'theme-ui';
import theme from '../theme';
import { useTheme } from '../contexts/ThemeContext';
import { generateCssVariables } from '../lib/designTokens';
import { updateThemeJson } from '../lib/designSystem';

// StyleProvider props
interface StyleProviderProps {
  children: React.ReactNode;
}

/**
 * Get CSS variables as a string from design tokens
 */
const getCssVariables = (): string => {
  return generateCssVariables();
};

/**
 * StyleProvider component that unifies all styling approaches
 */
export const StyleProvider: React.FC<StyleProviderProps> = ({ children }) => {
  // Get theme state from ThemeContext
  const { theme: colorMode } = useTheme();
  
  // State for CSS variables
  const [cssVariables, setCssVariables] = useState<string>('');
  
  // Set up CSS variables on mount
  useEffect(() => {
    setCssVariables(getCssVariables());
  }, []);
  
  // Handle theme changes (light/dark mode)
  useEffect(() => {
    // Apply theme class to document for Tailwind dark mode
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(colorMode);
    }
  }, [colorMode]);
  
  return (
    <>
      {/* Inject CSS variables */}
      {cssVariables && (
        <style id="maik-design-tokens" dangerouslySetInnerHTML={{ __html: cssVariables }} />
      )}
      
      {/* Provide Theme UI theme */}
      <ThemeUIProvider theme={theme}>
        {children}
      </ThemeUIProvider>
    </>
  );
};

export default StyleProvider;