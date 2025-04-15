import { Switch, Route } from "wouter";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";
import Header from "./components/layout/Header";
import Sidebar from "./components/layout/Sidebar";
import StatusBar from "./components/layout/StatusBar";
import CodeEditor from "./components/editor/CodeEditor";
import Terminal from "./components/terminal/Terminal";
import { useTheme } from "./contexts/ThemeContext";
import { useProject } from "./contexts/ProjectContext";

// IDE component that uses the useProject hook
function IDE() {
  const { initializeProject } = useProject();

  useEffect(() => {
    initializeProject();
  }, [initializeProject]);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <CodeEditor />
      </div>
      <Terminal />
      <StatusBar />
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
        <Route path="/" component={IDE} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

export default App;
