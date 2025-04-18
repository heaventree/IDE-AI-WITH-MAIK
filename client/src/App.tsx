/** @jsxImportSource theme-ui */
import { Switch, Route } from "wouter";
import NotFound from "@/pages/not-found";
import IDELayout from "./components/layout/IDELayout";
import Editor from "./components/editor/Editor";
import Terminal from "./components/terminal/Terminal";
import EntryPage from "./pages/EntryPage";
import PromptSystemDemo from "./pages/PromptSystemDemo";

// HomePage component with IDE layout
const HomePage = () => {
  return (
    <IDELayout>
      {/* Main editor area */}
      <Editor 
        initialContent="// Welcome to MAIK IDE\n// Start coding here...\n\nconst greeting = 'Hello, world!';\nconsole.log(greeting);" 
        language="typescript"
        fileName="main.ts"
      />
      
      {/* Terminal at the bottom */}
      <Terminal initialOpen={false} />
    </IDELayout>
  );
};

// Root App component with routing
function App() {
  return (
    <Switch>
      <Route path="/">
        <HomePage />
      </Route>
      <Route path="/entry">
        <EntryPage />
      </Route>
      <Route path="/prompt-system">
        <PromptSystemDemo />
      </Route>
      <Route path="*">
        <NotFound />
      </Route>
    </Switch>
  );
}

export default App;