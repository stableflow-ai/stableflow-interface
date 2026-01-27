import { useEffect, useState } from "react";

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
export default function ZendeskWidget() {
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

    console.log("Loading Zendesk Widget...");

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
      console.log("Zendesk Widget script loaded successfully");
      if (window.zE) {
        setMounted(true);
        console.log("Zendesk API available");

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

        // 2. 监听表单关闭事件
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

  // This component does not render anything, only loads Zendesk script
  return mounted && !opened && (
    <button
      type="button"
      className="button fixed z-[11] bottom-2.5 right-3.5 text-md font-[SpaceGrotesk] font-normal leading-[100%] flex justify-center items-center gap-2 bg-black text-white h-9 pl-3 pr-4.5 rounded-3xl"
      onClick={() => {
        window.zE("webWidget", "open");
      }}
    >
      <img
        src="/icon-help.svg"
        alt=""
        className="w-4 h-4 object-center object-contain shrink-0"
      />
      <div>
        Help
      </div>
    </button>
  );
}

// TypeScript type declaration
declare global {
  interface Window {
    zE?: any;
  }
}
