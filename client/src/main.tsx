import { createRoot } from "react-dom/client";
import "./index.css";
import { ThemeUIProvider } from "theme-ui";
import theme from "./theme";
import { Toaster } from "@/components/ui/toaster";
import App from "./App";

// App with Theme UI provider
function AppWithProviders() {
  return (
    <ThemeUIProvider theme={theme}>
      <App />
      <Toaster />
    </ThemeUIProvider>
  );
}

// Get the root element directly
const rootElement = document.getElementById("root");

if (rootElement) {
  // Render our app with all providers
  createRoot(rootElement).render(<AppWithProviders />);
} else {
  console.error("Root element not found");
}