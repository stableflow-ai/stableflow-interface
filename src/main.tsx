import { Buffer } from "buffer";

if (typeof window !== "undefined") {
  (window as any).Buffer = Buffer;
}

import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./app.tsx";

createRoot(document.getElementById("root")!).render(<App />);
