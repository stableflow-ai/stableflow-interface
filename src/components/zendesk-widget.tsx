import { useEffect } from "react";

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
  useEffect(() => {
    // Read Zendesk Web Widget Key from environment variable
    // Configure in .env file: VITE_ZENDESK_KEY=your_key_here
    const ZENDESK_KEY = import.meta.env.VITE_ZENDESK_KEY;
    
    // Debug information
    console.log("Zendesk Widget component loaded");
    console.log("VITE_ZENDESK_KEY:", ZENDESK_KEY ? "configured" : "not configured");
    console.log("Environment variable value:", import.meta.env.VITE_ZENDESK_KEY);
    
    // If key is not configured, do not load the widget
    if (!ZENDESK_KEY) {
      console.warn("Please configure VITE_ZENDESK_KEY in .env file");
      console.warn("Format: VITE_ZENDESK_KEY=your_key_here");
      console.warn("Restart dev server after configuration");
      return;
    }
    
    console.log("Loading Zendesk Widget...");

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
        console.log("Zendesk API available");
        
        // Customize button color (optional)
        // window.zE("messenger:set", "color", "#0E3616");
        
        // Note: Language is set in Zendesk Admin Center, not via API
        // Admin Center > Channels > Messaging > Settings > Language
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
  return null;
}

// TypeScript type declaration
declare global {
  interface Window {
    zE?: any;
  }
}
