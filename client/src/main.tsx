import { createRoot } from "react-dom/client";
import { useState, useEffect } from 'react';
import "./index.css";

// Extremely simplified app for debugging
function SimpleApp() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Check system preference on mount
  useEffect(() => {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setIsDarkMode(true);
    }
  }, []);

  return (
    <div className={isDarkMode ? "dark" : ""}>
      <div className="font-sans antialiased bg-neutral-100 text-neutral-900 dark:bg-dark-400 dark:text-white min-h-screen p-8">
        <h1 className="text-3xl font-bold mb-4">Bolt DIY Enhanced</h1>
        <p className="mb-4">This is a simplified version of the app to diagnose initialization issues.</p>
        <button 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => setIsDarkMode(!isDarkMode)}
        >
          Toggle Dark Mode: {isDarkMode ? 'Dark' : 'Light'}
        </button>
      </div>
    </div>
  );
}

// Get the root element directly
const rootElement = document.getElementById("root");

if (rootElement) {
  // Render our simplified app with no providers
  createRoot(rootElement).render(<SimpleApp />);
} else {
  console.error("Root element not found");
}
