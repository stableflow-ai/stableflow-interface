import { useState, useEffect } from "react";

export default function BackToTop() {
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Show/hide back to top button based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const scrollContainer = document.querySelector('.overflow-y-auto');
      let scrollTop = 0;

      if (scrollContainer) {
        scrollTop = scrollContainer.scrollTop;
      } else {
        scrollTop = window.pageYOffset ||
          document.documentElement.scrollTop ||
          document.body.scrollTop ||
          0;
      }

      const shouldShow = scrollTop > 50;
      setShowBackToTop(shouldShow);
    };

    const scrollContainer = document.querySelector('.overflow-y-auto');
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
    } else {
      window.addEventListener('scroll', handleScroll);
    }

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
    const scrollContainer = document.querySelector('.overflow-y-auto');
    if (scrollContainer) {
      scrollContainer.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    } else {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  if (!showBackToTop) {
    return null;
  }

  return (
    <button
      onClick={scrollToTop}
      className="fixed cursor-pointer bottom-[20px] right-[15px] transform md:right-[15px] z-50 w-[36px] h-[36px] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
      style={{ backgroundColor: '#6284F5' }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#243262'}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6284F5'}
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
  );
}

