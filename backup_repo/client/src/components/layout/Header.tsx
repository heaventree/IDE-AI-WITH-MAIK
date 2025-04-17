import { useState, useEffect } from 'react';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Check system preference on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check if document has dark class (set by App.tsx)
      const isDark = document.documentElement.classList.contains('dark');
      setIsDarkMode(isDark);
      
      // Create an observer to watch for changes to the dark class
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.attributeName === 'class') {
            const isDark = document.documentElement.classList.contains('dark');
            setIsDarkMode(isDark);
          }
        });
      });
      
      observer.observe(document.documentElement, { attributes: true });
      
      return () => observer.disconnect();
    }
  }, []);
  
  // Simple toggle function for dark mode
  const toggleDarkMode = () => {
    if (typeof window !== 'undefined') {
      document.documentElement.classList.toggle('dark');
      setIsDarkMode(!isDarkMode);
    }
  };

  return (
    <header className="bg-neutral-100 border-b border-neutral-300 dark:bg-dark-300 dark:border-dark-100 h-12 flex items-center px-3 justify-between">
      <div className="flex items-center space-x-3">
        <div className="flex items-center justify-center h-8 w-8 bg-primary-500 text-white rounded">
          <i className="ri-flashlight-line text-lg"></i>
        </div>
        <h1 className="font-semibold text-lg hidden sm:inline-block">Bolt DIY Enhanced</h1>
        
        <div className="flex space-x-1 ml-4">
          <button className="text-sm px-3 py-1 rounded hover:bg-neutral-200 dark:hover:bg-dark-100 transition">File</button>
          <button className="text-sm px-3 py-1 rounded hover:bg-neutral-200 dark:hover:bg-dark-100 transition">Edit</button>
          <button className="text-sm px-3 py-1 rounded hover:bg-neutral-200 dark:hover:bg-dark-100 transition">View</button>
          <button className="text-sm px-3 py-1 rounded hover:bg-neutral-200 dark:hover:bg-dark-100 transition">Run</button>
          <button className="text-sm px-3 py-1 rounded hover:bg-neutral-200 dark:hover:bg-dark-100 transition">Help</button>
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        <div className="bg-neutral-200 dark:bg-dark-100 rounded-md flex items-center p-1 text-sm max-w-sm">
          <span className="px-2 py-1 text-neutral-500 dark:text-neutral-400">
            <i className="ri-search-line"></i>
          </span>
          <input 
            type="text" 
            placeholder="Search or use commands..." 
            className="bg-transparent border-none outline-none w-40 lg:w-64 placeholder-neutral-500 dark:placeholder-neutral-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <span className="px-2 py-1 text-neutral-500 dark:text-neutral-400 text-xs">Ctrl+P</span>
        </div>
        
        <button className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-dark-100 transition" title="Settings">
          <i className="ri-settings-3-line"></i>
        </button>
        
        <button 
          className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-dark-100 transition" 
          title="Toggle Dark Mode"
          onClick={toggleDarkMode}
        >
          <i className={isDarkMode ? "ri-sun-line" : "ri-moon-line"}></i>
        </button>
      </div>
    </header>
  );
};

export default Header;
