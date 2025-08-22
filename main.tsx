import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { trackWebVitals } from "./lib/performance";
import { analytics } from "./lib/analytics";

// Initialize performance tracking and analytics
trackWebVitals();
analytics.initialize();

createRoot(document.getElementById("root")!).render(<App />);
