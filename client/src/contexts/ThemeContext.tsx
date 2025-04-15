import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Theme = "light" | "dark";

interface ThemeContextProps {
  theme: Theme;
  toggleTheme: () => void;
}

// Create context with a default value to avoid null checks
const ThemeContext = createContext<ThemeContextProps>({
  theme: "light",
  toggleTheme: () => {}
});

// Safe localStorage functions
const safeGetItem = (key: string): string | null => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(key);
    }
  } catch (e) {
    console.warn("Error accessing localStorage:", e);
  }
  return null;
};

const safeSetItem = (key: string, value: string): void => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(key, value);
    }
  } catch (e) {
    console.warn("Error writing to localStorage:", e);
  }
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>("light");
  
  // Initialize theme after component mounts to avoid SSR issues
  useEffect(() => {
    // Try to get theme from localStorage safely
    const savedTheme = safeGetItem("theme") as Theme | null;
    
    // If saved, use it
    if (savedTheme && (savedTheme === "light" || savedTheme === "dark")) {
      setTheme(savedTheme);
    } else if (typeof window !== 'undefined' && window.matchMedia?.("(prefers-color-scheme: dark)")?.matches) {
      // Otherwise use system preference if available
      setTheme("dark");
    }
  }, []);

  // Update localStorage when theme changes
  useEffect(() => {
    safeSetItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === "light" ? "dark" : "light");
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextProps => {
  return useContext(ThemeContext);
};
