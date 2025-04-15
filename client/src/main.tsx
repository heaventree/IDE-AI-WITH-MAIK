import { createRoot } from "react-dom/client";
import { useState, useEffect } from 'react';
import "./index.css";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";

// Our simple app using ThemeProvider
function SimpleApp() {
  // Use the theme context
  const { theme, toggleTheme } = useTheme();

  return (
    <div className={theme === "dark" ? "dark" : ""}>
      <div className="font-sans antialiased bg-neutral-100 text-neutral-900 dark:bg-dark-400 dark:text-white min-h-screen p-8">
        <h1 className="text-3xl font-bold mb-4">Bolt DIY Enhanced</h1>
        <p className="mb-4">This is a simplified version of the app with ThemeProvider.</p>
        <button 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={toggleTheme}
        >
          Toggle Dark Mode: {theme}
        </button>
      </div>
    </div>
  );
}

// Wrapper component to ensure proper provider structure
function App() {
  return (
    <ThemeProvider>
      <SimpleApp />
    </ThemeProvider>
  );
}

// Get the root element directly
const rootElement = document.getElementById("root");

if (rootElement) {
  // Render our app with ThemeProvider
  createRoot(rootElement).render(<App />);
} else {
  console.error("Root element not found");
}
