import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { Toaster } from "@/components/ui/toaster";

// Get the root element directly
const rootElement = document.getElementById("root");

// Extremely simplified - just render the App with no providers
if (rootElement) {
  createRoot(rootElement).render(
    <>
      <App />
      <Toaster />
    </>
  );
} else {
  console.error("Root element not found");
}
