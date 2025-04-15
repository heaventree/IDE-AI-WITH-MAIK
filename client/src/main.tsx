import { createRoot } from "react-dom/client";
import "./index.css";
import { ThemeProvider } from "./contexts/ThemeContext";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import App from "./App";

// App with all providers in correct order
function AppWithProviders() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <App />
        <Toaster />
      </QueryClientProvider>
    </ThemeProvider>
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