import { createRoot } from "react-dom/client";
import { useState, useEffect } from 'react';
import "./index.css";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { SimpleProjectProvider, useSimpleProject } from "./contexts/SimpleProjectContext";
import { Toaster } from "@/components/ui/toaster";

// Simple placeholder components
function PlaceholderHeader() {
  return <div className="h-12 bg-blue-600 text-white p-3">Bolt DIY Enhanced - Header Placeholder</div>;
}

function PlaceholderSidebar() {
  return <div className="w-48 bg-gray-100 dark:bg-gray-800 p-3">Sidebar Placeholder</div>;
}

function PlaceholderEditor() {
  return <div className="flex-1 bg-white dark:bg-gray-700 p-3">Code Editor Placeholder</div>;
}

function PlaceholderTerminal() {
  return <div className="h-32 bg-gray-900 text-green-400 p-3">Terminal Placeholder</div>;
}

function PlaceholderStatusBar() {
  return <div className="h-6 bg-gray-200 dark:bg-gray-600 text-xs flex items-center px-3">Status Bar Placeholder</div>;
}

// Simple IDE component
function SimpleIDE() {
  const { projectState, initializeProject } = useSimpleProject();
  const [initialized, setInitialized] = useState(false);
  
  useEffect(() => {
    if (!initialized) {
      initializeProject().then(() => {
        console.log("Project initialized");
        setInitialized(true);
      });
    }
  }, [initializeProject, initialized]);
  
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <PlaceholderHeader />
      <div className="flex-1 flex overflow-hidden">
        <PlaceholderSidebar />
        <PlaceholderEditor />
      </div>
      <PlaceholderTerminal />
      <PlaceholderStatusBar />
      
      {/* Debug info */}
      <div className="absolute top-14 right-3 bg-white dark:bg-gray-800 p-2 shadow rounded text-xs">
        <div>Container Status: {projectState.containerStatus}</div>
        <div>Files: {Object.keys(projectState.files).length}</div>
        <div>Active File: {projectState.activeFile || 'none'}</div>
      </div>
    </div>
  );
}

// Theme-aware layout wrapper
function ThemedLayout({ children }: { children: React.ReactNode }) {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <div className={theme === "dark" ? "dark" : ""}>
      <div className="font-sans antialiased bg-neutral-100 text-neutral-900 dark:bg-dark-400 dark:text-white min-h-screen">
        {children}
        
        {/* Theme toggle button */}
        <button 
          className="fixed bottom-3 right-3 bg-blue-500 text-white p-2 rounded shadow"
          onClick={toggleTheme}
        >
          Toggle {theme === "light" ? "Dark" : "Light"} Mode
        </button>
      </div>
    </div>
  );
}

// Simple app with minimal providers
function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <SimpleProjectProvider>
          <ThemedLayout>
            <SimpleIDE />
          </ThemedLayout>
          <Toaster />
        </SimpleProjectProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

// Get the root element directly
const rootElement = document.getElementById("root");

if (rootElement) {
  // Render our simplified app
  createRoot(rootElement).render(<App />);
} else {
  console.error("Root element not found");
}
