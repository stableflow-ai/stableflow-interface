import { useMemo, useState, useEffect } from "react";
import { marked } from "marked";
import BackButton from "@/components/back-button";
import MainTitle from "@/components/main-title";
// Import markdown file as raw string via Vite's ?raw modifier
// Path from this file (src/views/developer) to project root is ../../../
import guide from "../../../DEVELOPER_GUIDE.md?raw";

// Normalize certain markdown quirks before rendering
function preprocessMarkdown(md: string): string {
  let text = md;
  // 1) Convert linked image badge to plain text link: [![Alt](img)](url) -> [Alt](url)
  text = text.replace(/\[!\[([^\]]+)\]\([^\)]+\)\]\(([^\)]+)\)/g, (_m, alt, href) => {
    return `[${alt}](${href})`;
  });
  // 2) Convert standalone badge image to target link using known form URL
  //    ![Apply for API Access](https://img.shields.io/...) -> [Apply for API Access](<google-form>)
  const formUrl = "https://docs.google.com/forms/u/3/d/e/1FAIpQLSdTeV7UaZ1MiFxdJ2jH_PU60PIN3iqYJ1WXEOFY45TsAy6O5g/viewform";
  text = text.replace(/!\[\s*Apply\s*for\s*API\s*Access\s*\]\([^\)]+\)/gi, `[Apply for API Access](${formUrl})`);
  return text;
}

// Configure marked options
marked.setOptions({
  breaks: true,
  gfm: true, // GitHub Flavored Markdown
});

// Custom renderer to handle special cases
const renderer = new marked.Renderer();

// Handle image links (badges) - convert to button
renderer.image = ({ href, text }: { href: string; text: string }) => {
  return `<a href="${href}" onclick="event.preventDefault(); window.open('${href}', '_blank', 'noopener,noreferrer');" class="md-btn">${text}</a>`;
};

// Handle links - internal anchors vs external links
renderer.link = ({ href, text }: { href: string; text: string }) => {
  // Check if it's an internal anchor link (starts with #)
  if (href.startsWith('#')) {
    return `<a href="${href}">${text}</a>`;
  }
  
  // Check if this is a badge link (contains img.shields.io or similar badge services)
  if (href.includes('img.shields.io') || href.includes('badge') || text.includes('Apply for API Access')) {
    console.log('Badge link detected:', { href, text });
    return `<a href="${href}" onclick="event.preventDefault(); window.open('${href}', '_blank', 'noopener,noreferrer');" class="md-btn">${text}</a>`;
  }
  
  // External links open in new tab
  return `<a href="${href}" onclick="event.preventDefault(); window.open('${href}', '_blank', 'noopener,noreferrer');">${text}</a>`;
};

// Handle code blocks
renderer.code = ({ text, lang }: { text: string; lang?: string }) => {
  return `<pre class="md-code"><code class="language-${lang || ''}">${text}</code></pre>`;
};

// Handle inline code
renderer.codespan = ({ text }: { text: string }) => {
  return `<code class="inline">${text}</code>`;
};

// Handle headings with proper IDs for anchor links
renderer.heading = ({ text, depth }: { text: string; depth: number }) => {
  // Convert text to kebab-case for ID
  const id = text.toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .trim();
  
  return `<h${depth} id="${id}" class="md-h md-h${depth}">${text}</h${depth}>`;
};

// Set the custom renderer
marked.use({ renderer });

export default function DeveloperDocs() {
  const [showBackToTop, setShowBackToTop] = useState(false);
  
  const html = useMemo(() => marked(preprocessMarkdown(guide)), []);

  // Show/hide back to top button based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      // Find the scrollable container (the one with overflow-y-auto)
      const scrollContainer = document.querySelector('.overflow-y-auto');
      let scrollTop = 0;
      
      if (scrollContainer) {
        scrollTop = scrollContainer.scrollTop;
      } else {
        // Fallback to window scroll
        scrollTop = window.pageYOffset || 
                   document.documentElement.scrollTop || 
                   document.body.scrollTop || 
                   0;
      }
      
      const shouldShow = scrollTop > 50;
      setShowBackToTop(shouldShow);
    };

    // Add scroll listener to the scrollable container
    const scrollContainer = document.querySelector('.overflow-y-auto');
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
    } else {
      // Fallback to window
      window.addEventListener('scroll', handleScroll);
    }
    
    // Also check on mount
    handleScroll();
    
    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', handleScroll);
      } else {
        window.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  const scrollToTop = () => {
    // Find the scrollable container and scroll it
    const scrollContainer = document.querySelector('.overflow-y-auto');
    if (scrollContainer) {
      scrollContainer.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    } else {
      // Fallback to window scroll
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="w-full min-h-[100dvh] flex flex-col items-center mb-[100px]">
      <div className="md:w-[1100px] w-full mx-auto pt-[60px] md:pt-[60px] shrink-0 relative">
        <BackButton className="absolute translate-x-[10px] translate-y-[-5px] md:translate-y-[10px] md:translate-x-[0px]" />
        <MainTitle className="!hidden md:!flex" />
        <div className="px-[10px] md:px-0 mt-[40px] mb-[40px]">
          <div className="bg-white/80 rounded-[12px] shadow-[0_0_10px_0_rgba(0,0,0,0.05)] p-[16px] md:p-[24px]">
            <div className="text-[20px] md:text-[24px] font-semibold mb-[12px]">Developer Guide</div>
            <div
              className="prose max-w-none"
              // We render trusted local markdown converted to HTML
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>
        </div>
      </div>
      
      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-[20px] left-[50%] transform -translate-x-1/2 md:left-[calc(50%-590px)] md:translate-x-0 z-50 w-[36px] h-[36px] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
          style={{ backgroundColor: '#0E3616' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0a2a11'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0E3616'}
          aria-label="Back to Top"
        >
          <svg 
            className="w-4 h-4 transform group-hover:scale-110 transition-transform duration-200" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M5 10l7-7m0 0l7 7m-7-7v18" 
            />
          </svg>
        </button>
      )}
      <style>
        {`
        .prose h1,.prose h2,.prose h3,.prose h4,.prose h5,.prose h6{margin:16px 0 8px;line-height:1.3;color:#0a0a0a;scroll-margin-top:80px}
        .prose h1{font-size:28px;font-weight:700}
        .prose h2{font-size:22px;font-weight:700}
        .prose h3{font-size:18px;font-weight:600}
        .prose h4{font-size:16px;font-weight:600}
        .prose h5{font-size:14px;font-weight:600}
        .prose h6{font-size:12px;font-weight:600}
        .prose p{margin:8px 0;color:#1f2937;line-height:1.6}
        .prose ul{margin:8px 0 8px 20px;list-style:disc}
        .prose ol{margin:8px 0 8px 20px;list-style:decimal}
        .prose li{margin:4px 0;color:#374151}
        .prose pre{background:rgba(0,0,0,0.85);color:#e5e7eb;padding:12px;border-radius:8px;overflow:auto;margin:12px 0}
        .prose code{background:rgba(0,0,0,0.06);padding:1px 4px;border-radius:4px;color:#ffffff;font-size:12px;}
        .prose code.inline{background:rgba(0,0,0,0.06);padding:1px 4px;border-radius:4px;color:#111827}
        .prose hr{border:none;border-top:1px solid rgba(0,0,0,0.08);margin:18px 0}
        .prose a{color:#0ea5e9;text-decoration:underline;transition:color 0.2s ease}
        .prose a:hover{color:#0284c7}
        .prose a.md-btn{display:inline-flex;align-items:center;gap:8px;background:#4285F4;color:#fff !important;text-decoration:none;padding:8px 12px;border-radius:8px;font-weight:600;box-shadow:0 1px 2px rgba(0,0,0,0.1)}
        .prose a.md-btn:hover{background:#3367d6}
        html{scroll-behavior:smooth}
        .prose table{width:100%;border-collapse:collapse;margin:12px 0;background:white;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1)}
        .prose table th,.prose table td{border:1px solid rgba(0,0,0,0.1);padding:12px;text-align:left;font-size:14px}
        .prose table thead th{background:rgba(0,0,0,0.04);font-weight:600;color:#374151}
        .prose table tbody tr:nth-child(even){background:rgba(0,0,0,0.02)}
        .prose table tbody tr:hover{background:rgba(0,0,0,0.05)}
        .prose blockquote{border-left:4px solid #e5e7eb;padding-left:16px;margin:16px 0;color:#6b7280;font-style:italic}
        .prose strong{font-weight:700;color:#111827}
        .prose em{font-style:italic;color:#374151}
        `}
      </style>
    </div>
  );
}


