import { csl } from "@/utils/log";
import { createContext, useContext, useEffect, useState } from "react";

type ZendeskContextType = {
  mounted: boolean;
  setMounted: (mounted: boolean) => void;
  opened: boolean;
  setOpened: (opened: boolean) => void;
  onOpen: () => void;
}

const ZendeskContext = createContext<ZendeskContextType>({
  mounted: false,
  setMounted: () => { },
  opened: false,
  setOpened: () => { },
  onOpen: () => { },
});

export const useZendeskContext = () => {
  return useContext(ZendeskContext);
};

/**
 * Zendesk Customer Support Widget
 * Displays a chat button in the bottom-right corner of the page
 * 
 * Configuration:
 * 1. Add VITE_ZENDESK_KEY=your_key_here to .env file in project root
 * 2. Get Web Widget Key from Zendesk Admin Center
 * 3. Restart dev server after modifying .env
 * 
 * Note: Must use VITE_ prefix (Vite requirement)
 */
export default function ZendeskPrivider(props: any) {
  const { children } = props;

  const [mounted, setMounted] = useState(false);
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    // Read Zendesk Web Widget Key from environment variable
    // Configure in .env file: VITE_ZENDESK_KEY=your_key_here
    const ZENDESK_KEY = import.meta.env.VITE_ZENDESK_KEY;

    // If key is not configured, do not load the widget
    if (!ZENDESK_KEY) {
      console.warn("Please configure VITE_ZENDESK_KEY in .env file");
      console.warn("Format: VITE_ZENDESK_KEY=your_key_here");
      console.warn("Restart dev server after configuration");
      return;
    }

    csl("Zendesk Widget", "gray-900", "Loading Zendesk Widget...");

    // @ts-ignore Doesn't work
    window.zESettings = {
      webWidget: {
        launcher: {
          display: false
        }
      }
    };

    // Load Zendesk Web Widget script
    const script = document.createElement("script");
    script.id = "ze-snippet";
    script.src = `https://static.zdassets.com/ekr/snippet.js?key=${ZENDESK_KEY}`;
    script.async = true;

    document.body.appendChild(script);

    // Optional: Customize Widget settings
    script.onload = () => {
      csl("Zendesk Widget", "gray-900", "Zendesk Widget script loaded successfully");
      if (window.zE) {
        setMounted(true);
        csl("Zendesk Widget", "gray-900", "Zendesk API available");

        // Customize button color (optional)
        window.zE("webWidget", "updateSettings", {
          webWidget: {
            // Doesn't work
            launcher: {
              display: false
            },
            color: {
              theme: "#000000",
              launcher: "#000000",
              launcherText: "#FFFFFF"
            },
            offset: {
              horizontal: "0px",
              vertical: "0px"
            },
          }
        });

        // Note: Language is set in Zendesk Admin Center, not via API
        // Admin Center > Channels > Messaging > Settings > Language
        window.zE("webWidget:on", "open", () => {
          setOpened(true);
        });

        // 2. Listen for widget close
        window.zE("webWidget:on", "close", () => {
          setOpened(false);
        });
      } else {
        console.warn("Zendesk API not available");
      }
    };

    script.onerror = () => {
      console.error("Zendesk Widget script failed to load");
    };

    // Cleanup function: remove script when component unmounts
    return () => {
      const existingScript = document.getElementById("ze-snippet");
      if (existingScript) {
        existingScript.remove();
      }
      // Remove Zendesk global object
      if (window.zE) {
        delete window.zE;
      }
    };
  }, []);

  return (
    <ZendeskContext.Provider
      value={{
        mounted,
        setMounted,
        opened,
        setOpened,
        onOpen: () => {
          window.zE("webWidget", "open");
        },
      }}
    >
      {children}
    </ZendeskContext.Provider>
  );
}

// TypeScript type declaration
declare global {
  interface Window {
    zE?: any;
  }
}
