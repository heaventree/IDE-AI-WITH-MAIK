import { createRoot } from "react-dom/client";
import "./styles/maik-ide.css"; // Import single comprehensive CSS file
import { Toaster } from "@/components/ui/toaster";
import { WebSocketProvider } from "./contexts/WebSocketContext";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import App from "./App";

// App with all providers in the correct order
function AppWithProviders() {
  return (
    <QueryClientProvider client={queryClient}>
      <WebSocketProvider>
        <App />
        <Toaster />
      </WebSocketProvider>
    </QueryClientProvider>
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