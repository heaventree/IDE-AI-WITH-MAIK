/** @jsxImportSource theme-ui */
import { Switch, Route } from "wouter";
import NotFound from "@/pages/not-found";
import { useTheme } from "./contexts/ThemeContext";
import IDELayout from "./components/layout/IDELayout";

// Root App component with routing
function App() {
  return (
    <Switch>
      <Route path="/" component={IDELayout} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default App;