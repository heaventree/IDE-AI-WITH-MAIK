import { createRoot } from "react-dom/client";
import "./index.css";
import { ThemeUIProvider } from "theme-ui";
import theme from "./theme";
import { Toaster } from "@/components/ui/toaster";
import { WebSocketProvider } from "./contexts/WebSocketContext";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import App from "./App";

// App with all providers in the correct order
function AppWithProviders() {
  return (
    <ThemeUIProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <WebSocketProvider>
          <App />
          <Toaster />
        </WebSocketProvider>
      </QueryClientProvider>
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