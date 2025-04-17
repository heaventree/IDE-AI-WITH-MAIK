import { createRoot } from "react-dom/client";
import "./styles/index.css"; // Import new centralized CSS system
import { Toaster } from "@/components/ui/toaster";
import { WebSocketProvider } from "./contexts/WebSocketContext";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import ThemeUIContextProvider from "./contexts/ThemeUIProvider"; 
import App from "./App";

// App with all providers in the correct order
function AppWithProviders() {
  return (
    <ThemeUIContextProvider>
      <QueryClientProvider client={queryClient}>
        <WebSocketProvider>
          <App />
          <Toaster />
        </WebSocketProvider>
      </QueryClientProvider>
    </ThemeUIContextProvider>
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