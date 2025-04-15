import { createRoot } from "react-dom/client";
import { useState } from 'react';
import "./index.css";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { ProjectProvider } from "./contexts/ProjectContext";
import { Toaster } from "@/components/ui/toaster";

// Simple app component with ThemeProvider
function SimpleApp() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className={theme === "dark" ? "dark" : ""}>
      <div className="font-sans antialiased bg-neutral-100 text-neutral-900 dark:bg-dark-400 dark:text-white min-h-screen p-8">
        <h1 className="text-3xl font-bold mb-4">Bolt DIY Enhanced</h1>
        <p className="mb-4">This is a simplified test version with all providers.</p>
        <button 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mb-4"
          onClick={toggleTheme}
        >
          Toggle Dark Mode: {theme}
        </button>
        
        <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded">
          <p>Testing with Theme, Query and Project providers</p>
        </div>
      </div>
    </div>
  );
}

// Wrapper component with all providers in correct order
function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <ProjectProvider>
          <SimpleApp />
          <Toaster />
        </ProjectProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

// Get the root element directly
const rootElement = document.getElementById("root");

if (rootElement) {
  // Render our app with all providers
  createRoot(rootElement).render(<App />);
} else {
  console.error("Root element not found");
}
