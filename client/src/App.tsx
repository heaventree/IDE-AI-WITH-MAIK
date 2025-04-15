import { Switch, Route } from "wouter";
import NotFound from "@/pages/not-found";
import { useEffect, useState } from "react";

// Super simplified App component to debug initialization issues
function App() {
  // Use a local state for theme instead of the context
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Check system preference on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDark);
    }
  }, []);

  return (
    <div className={isDarkMode ? "dark" : ""}>
      <div className="font-sans antialiased bg-neutral-100 text-neutral-900 dark:bg-dark-400 dark:text-white h-screen p-8">
        <h1 className="text-3xl font-bold mb-4">Bolt DIY Enhanced</h1>
        <p className="mb-4">Welcome to the IDE. We're currently resolving initialization issues.</p>
        <button 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => setIsDarkMode(!isDarkMode)}
        >
          Toggle Dark Mode
        </button>
        
        <div className="hidden">
          <Switch>
            <Route path="/" component={() => <div>Home</div>} />
            <Route component={NotFound} />
          </Switch>
        </div>
      </div>
    </div>
  );
}

export default App;
