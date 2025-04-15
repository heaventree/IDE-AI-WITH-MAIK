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

function App() {
  const { theme } = useTheme();

  return (
    <div className={theme === "dark" ? "dark" : ""}>
      <div className="font-sans antialiased bg-neutral-100 text-neutral-900 dark:bg-dark-400 dark:text-white h-screen">
        <Switch>
          <Route path="/" component={IDE} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </div>
  );
}

export default App;
