import { useState } from "react";

/**
 * Simple Support Button
 * Displays a support button in the bottom-right corner
 * Opens a contact options menu when clicked
 */
export default function SupportButton() {
  const [isOpen, setIsOpen] = useState(false);

  const contactOptions = [
    {
      label: "Twitter",
      icon: "𝕏",
      link: "https://x.com/0xStableFlow",
      color: "#000000"
    },
    {
      label: "Email",
      icon: "✉",
      link: "mailto:support@stableflow.xyz",
      color: "#6284F5"
    },
    {
      label: "Telegram",
      icon: "✈",
      link: "https://t.me/stableflow",
      color: "#0088cc"
    }
  ];

  return (
    <>
      {/* Support Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-[20px] right-[20px] z-[9998] w-[56px] h-[56px] rounded-full bg-[#0E3616] text-white shadow-lg hover:bg-[#1a5028] transition-all duration-300 flex items-center justify-center"
        aria-label="Support"
      >
        {isOpen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        )}
      </button>

      {/* Contact Options Menu */}
      {isOpen && (
        <div className="fixed bottom-[90px] right-[20px] z-[9998] bg-white rounded-[12px] shadow-xl p-[12px] min-w-[200px]">
          <div className="text-[14px] font-[600] text-[#2B3337] mb-[8px] px-[8px]">
            Contact Us
          </div>
          {contactOptions.map((option, index) => (
            <a
              key={index}
              href={option.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-[12px] px-[12px] py-[10px] rounded-[8px] hover:bg-[#F5F5F5] transition-colors duration-200"
            >
              <span className="text-[20px]">{option.icon}</span>
              <span className="text-[14px] font-[500] text-[#2B3337]">
                {option.label}
              </span>
            </a>
          ))}
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[9997]"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
