import { Buffer } from "buffer";
import ErrorPage from "./views/error";
import * as Sentry from "@sentry/react";

if (typeof window !== "undefined") {
  (window as any).Buffer = Buffer;
}

import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./app.tsx";

if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN as string,
    // Setting this option to true will send default PII data to Sentry.
    // For example, automatic IP address collection on events
    sendDefaultPii: true
  });
}

createRoot(document.getElementById("root")!).render(
  <Sentry.ErrorBoundary fallback={<ErrorPage />}>
    <App />
  </Sentry.ErrorBoundary>
);
