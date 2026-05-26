import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { marked } from "marked";
import hljs from "highlight.js";
import "highlight.js/styles/github-dark.min.css";
import MainTitle from "@/components/main-title";
// Import markdown file as raw string via Vite's ?raw modifier
// Path from this file (src/views/developer) to project root is ../../../
import guide from "../../../DEVELOPER_GUIDE.md?raw";
import { ApplayAPIAccess } from "./config";
import { csl } from "@/utils/log";
import { useLayoutContext } from "@/layouts/context";

const SCROLL_OFFSET = 80;

// GitHub-compatible heading slug (matches DEVELOPER_GUIDE.md TOC links)
function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// Normalize certain markdown quirks before rendering
function preprocessMarkdown(md: string): string {
  let text = md;
  // 1) Convert linked image badge to plain text link: [![Alt](img)](url) -> [Alt](url)
  text = text.replace(/\[!\[([^\]]+)\]\([^\)]+\)\]\(([^\)]+)\)/g, (_m, alt, href) => {
    return `[${alt}](${href})`;
  });
  // 2) Convert standalone badge image to target link using known form URL
  //    ![Apply for API Access](https://img.shields.io/...) -> [Apply for API Access](<google-form>)
  const formUrl = ApplayAPIAccess;
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
    csl("DeveloperDocs renderer.link", "sky-500", "Badge link detected: %o", { href, text });
    return `<a href="${href}" onclick="event.preventDefault(); window.open('${href}', '_blank', 'noopener,noreferrer');" class="md-btn">${text}</a>`;
  }

  // External links open in new tab
  return `<a href="${href}" onclick="event.preventDefault(); window.open('${href}', '_blank', 'noopener,noreferrer');">${text}</a>`;
};

// Handle code blocks
renderer.code = ({ text, lang }: { text: string; lang?: string }) => {
  let highlighted = text;
  try {
    if (lang && hljs.getLanguage(lang)) {
      highlighted = hljs.highlight(text, { language: lang }).value;
    } else {
      highlighted = hljs.highlightAuto(text).value;
    }
  } catch { }
  return `<pre class="md-code"><code class="hljs language-${lang || ''}">${highlighted}</code></pre>`;
};

// Handle inline code
renderer.codespan = ({ text }: { text: string }) => {
  return `<code class="inline">${text}</code>`;
};

// Handle headings with proper IDs for anchor links
renderer.heading = ({ text, depth }: { text: string; depth: number }) => {
  const id = slugifyHeading(text);
  const anchorLink = `#${id}`;

  return `<h${depth} id="${id}" class="md-h md-h${depth} md-heading-link">
    <a href="${anchorLink}" class="md-heading-anchor" onclick="event.preventDefault(); const url = window.location.href.split('#')[0] + '${anchorLink}'; navigator.clipboard.writeText(url).then(() => { const link = event.target.closest('.md-heading-anchor'); link.style.color = '#0ea5e9'; setTimeout(() => { link.style.color = ''; }, 1500); }); window.location.hash = '${anchorLink}'; return false;">${text}</a>
  </h${depth}>`;
};

// Set the custom renderer
marked.use({ renderer });

export default function DeveloperDocs() {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const proseRef = useRef<HTMLDivElement>(null);
  const { containerRef } = useLayoutContext();

  const html = useMemo(() => marked(preprocessMarkdown(guide)), []);

  const scrollToHash = useCallback((hash: string, retries = 10) => {
    if (!hash) return;

    const attemptScroll = (remaining: number) => {
      requestAnimationFrame(() => {
        const element = document.getElementById(hash.slice(1));
        if (element) {
          const scrollContainer = containerRef.current;
          if (scrollContainer) {
            const containerRect = scrollContainer.getBoundingClientRect();
            const elementRect = element.getBoundingClientRect();
            const scrollTop =
              scrollContainer.scrollTop +
              elementRect.top -
              containerRect.top -
              SCROLL_OFFSET;

            scrollContainer.scrollTo({
              top: scrollTop,
              behavior: "smooth",
            });
          } else {
            const elementTop =
              element.getBoundingClientRect().top + window.pageYOffset - SCROLL_OFFSET;
            window.scrollTo({
              top: elementTop,
              behavior: "smooth",
            });
          }
        } else if (remaining > 0) {
          setTimeout(() => attemptScroll(remaining - 1), 50);
        }
      });
    };

    attemptScroll(retries);
  }, [containerRef]);

  // Scroll to anchor on mount / hash change (external entry, back/forward, heading links)
  useEffect(() => {
    scrollToHash(window.location.hash);

    const onHashChange = () => scrollToHash(window.location.hash);
    window.addEventListener("hashchange", onHashChange);

    return () => window.removeEventListener("hashchange", onHashChange);
  }, [html, scrollToHash]);

  // Intercept TOC and in-doc anchor clicks for nested scroll container
  useEffect(() => {
    const proseEl = proseRef.current;
    if (!proseEl) return;

    const onClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target || target.classList.contains("md-heading-anchor")) return;

      const href = target.getAttribute("href");
      if (!href?.startsWith("#")) return;

      e.preventDefault();
      if (window.location.hash !== href) {
        window.location.hash = href;
      } else {
        scrollToHash(href);
      }
    };

    proseEl.addEventListener("click", onClick);
    return () => proseEl.removeEventListener("click", onClick);
  }, [html, scrollToHash]);

  // Show/hide back to top button based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const scrollContainer = containerRef.current;
      let scrollTop = 0;

      if (scrollContainer) {
        scrollTop = scrollContainer.scrollTop;
      } else {
        scrollTop =
          window.pageYOffset ||
          document.documentElement.scrollTop ||
          document.body.scrollTop ||
          0;
      }

      setShowBackToTop(scrollTop > 50);
    };

    const scrollContainer = containerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll);
    } else {
      window.addEventListener("scroll", handleScroll);
    }

    handleScroll();

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener("scroll", handleScroll);
      } else {
        window.removeEventListener("scroll", handleScroll);
      }
    };
  }, [containerRef]);

  const scrollToTop = () => {
    const scrollContainer = containerRef.current;
    if (scrollContainer) {
      scrollContainer.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } else {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="w-full min-h-[100dvh] flex flex-col items-center mb-[100px]">
      <div className="md:w-[1100px] w-full mx-auto pt-[60px] md:pt-[60px] shrink-0 relative">
        {/* <BackButton className="absolute translate-x-[10px] translate-y-[-5px] md:translate-y-[10px] md:translate-x-[0px]" /> */}
        <MainTitle className="!hidden md:!flex" />
        <div className="px-[10px] md:px-0 mt-[40px] mb-[40px]">
          <div className="bg-white/80 rounded-[12px] shadow-[0_0_10px_0_rgba(0,0,0,0.05)] p-[16px] md:p-[24px]">
            <div className="text-[20px] md:text-[24px] font-semibold mb-[12px]">Developer Guide</div>
            <div
              ref={proseRef}
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
        .prose .md-heading-link{position:relative}
        .prose .md-heading-anchor{color:inherit;text-decoration:none;transition:all 0.2s ease}
        .prose .md-heading-anchor:hover{text-decoration:underline}
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
        .prose table{display:block;width:100%;border-collapse:collapse;margin:12px 0;background:white;border-radius:8px;overflow-x:auto;box-shadow:0 1px 3px rgba(0,0,0,0.1)}
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
