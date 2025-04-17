/** @jsxImportSource theme-ui */
import { useState } from "react";
import { Switch, Route } from "wouter";
import NotFound from "@/pages/not-found";
import IDELayout from "./components/layout/IDELayout";
import ResizableIDELayout from "./components/layout/ResizableIDELayout";
import Editor from "./components/editor/Editor";
import Terminal from "./components/terminal/Terminal";
import AIChat from "./components/ai/AIChat";
import { Box, Button } from "theme-ui";
import { Monitor, Layers } from "lucide-react";

// Layout selector component
const LayoutSelector = ({ 
  onLayoutChange, 
  currentLayout 
}: { 
  onLayoutChange: (layout: string) => void;
  currentLayout: string;
}) => {
  return (
    <Box
      sx={{
        position: "fixed",
        top: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 1100,
        background: "backgroundElevated",
        borderRadius: "default",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        padding: 1,
        display: "flex",
        gap: 1,
        border: "1px solid",
        borderColor: "border",
      }}
    >
      <Button
        variant={currentLayout === "classic" ? "primary" : "secondary"}
        onClick={() => onLayoutChange("classic")}
        sx={{ 
          display: "flex", 
          alignItems: "center", 
          gap: 1,
          padding: "8px 12px",
          fontSize: 1
        }}
      >
        <Monitor size={16} />
        <span>Classic</span>
      </Button>
      <Button
        variant={currentLayout === "resizable" ? "primary" : "secondary"}
        onClick={() => onLayoutChange("resizable")}
        sx={{ 
          display: "flex", 
          alignItems: "center", 
          gap: 1,
          padding: "8px 12px",
          fontSize: 1
        }}
      >
        <Layers size={16} />
        <span>Resizable</span>
      </Button>
    </Box>
  );
};

// HomePage component with selectable layout
const HomePage = () => {
  const [layout, setLayout] = useState("classic");

  const commonContent = (
    <>
      {/* Main editor area */}
      <Editor 
        initialContent="// Welcome to MAIK IDE\n// Start coding here...\n\nconst greeting = 'Hello, world!';\nconsole.log(greeting);" 
        language="typescript"
        fileName="main.ts"
      />
      
      {/* Terminal at the bottom */}
      <Terminal initialOpen={true} />
      
      {/* AI Chat component */}
      <AIChat initialOpen={true} />
    </>
  );

  return (
    <>
      <LayoutSelector 
        onLayoutChange={setLayout} 
        currentLayout={layout} 
      />

      {layout === "classic" ? (
        <IDELayout>
          {commonContent}
        </IDELayout>
      ) : (
        <ResizableIDELayout>
          {commonContent}
        </ResizableIDELayout>
      )}
    </>
  );
};

// Root App component with routing
function App() {
  return (
    <Switch>
      <Route path="/">
        <HomePage />
      </Route>
      <Route path="*">
        <NotFound />
      </Route>
    </Switch>
  );
}

export default App;