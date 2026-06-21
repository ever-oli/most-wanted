import { createRoot } from "react-dom/client";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import App from "./App.tsx";
import "./index.css";

const convexUrl = import.meta.env.VITE_CONVEX_URL as string | undefined;
if (!convexUrl) {
  // Set after running `npx convex dev` (it writes VITE_CONVEX_URL to .env.local).
  console.error("VITE_CONVEX_URL is not set — run `npx convex dev` to configure your deployment.");
}

const convex = new ConvexReactClient(convexUrl ?? "https://placeholder.convex.cloud");

createRoot(document.getElementById("root")!).render(
  <ConvexProvider client={convex}>
    <App />
  </ConvexProvider>,
);
