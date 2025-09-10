import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./app.tsx";

import("react-toastify/dist/ReactToastify.css");

createRoot(document.getElementById("root")!).render(<App />);
