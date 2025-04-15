import { Switch, Route } from "wouter";
import NotFound from "@/pages/not-found";
import { useTheme } from "./contexts/ThemeContext";

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

// Simple placeholder component (doesn't use any context)
function SimplePlaceholderIDE() {
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
        <div>Container Status: Ready (Static)</div>
        <div>Files: 2 (Static)</div>
        <div>Active File: None (Static)</div>
      </div>
    </div>
  );
}

// Main app layout component
function AppLayout({ children }: { children: React.ReactNode }) {
  // Use theme hook here since we know ThemeProvider is available
  const { theme } = useTheme();
  
  return (
    <div className={theme === "dark" ? "dark" : ""}>
      <div className="font-sans antialiased bg-neutral-100 text-neutral-900 dark:bg-dark-400 dark:text-white h-screen">
        {children}
      </div>
    </div>
  );
}

// Root App component - doesn't use any hooks directly
function App() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={SimplePlaceholderIDE} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

export default App;