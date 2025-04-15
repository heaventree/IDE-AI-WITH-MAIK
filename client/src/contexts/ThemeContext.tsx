import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Theme = "light" | "dark";

interface ThemeContextProps {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>("light");
  
  // Initialize theme after component mounts to avoid SSR issues
  useEffect(() => {
    try {
      // Try to get theme from localStorage
      const savedTheme = localStorage?.getItem("theme") as Theme | null;
      
      // If saved, use it
      if (savedTheme && (savedTheme === "light" || savedTheme === "dark")) {
        setTheme(savedTheme);
      } else if (typeof window !== 'undefined' && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        // Otherwise use system preference
        setTheme("dark");
      }
    } catch (error) {
      console.warn("Could not access localStorage for theme:", error);
    }
  }, []);

  // Update localStorage when theme changes
  useEffect(() => {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem("theme", theme);
      }
    } catch (error) {
      console.warn("Could not save theme to localStorage:", error);
    }
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
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
