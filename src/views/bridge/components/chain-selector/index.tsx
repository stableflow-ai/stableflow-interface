import { useState } from "react";
import chains from "@/config/chains";

interface Chain {
  name: string;
  icon: string;
  key: string;
}

interface ChainSelectorProps {
  selectedChain: Chain | null;
  onChainSelect: (chain: Chain) => void;
  label?: string;
}

export default function ChainSelector({
  selectedChain,
  onChainSelect,
  label = "Select Chain"
}: ChainSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleChainSelect = (chain: Chain) => {
    onChainSelect(chain);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="relative">
        <button
          type="button"
          className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {selectedChain ? (
                <>
                  <div className="w-6 h-6 bg-gray-200 rounded-full mr-3 flex items-center justify-center">
                    {selectedChain.icon || selectedChain.name.charAt(0)}
                  </div>
                  <span className="text-gray-900">{selectedChain.name}</span>
                </>
              ) : (
                <span className="text-gray-500">Please select a chain</span>
              )}
            </div>
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </button>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
            <div className="py-1">
              {chains.map((chain) => (
                <button
                  key={chain.key}
                  type="button"
                  className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                  onClick={() => handleChainSelect(chain)}
                >
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-gray-200 rounded-full mr-3 flex items-center justify-center">
                      {chain.icon || chain.name.charAt(0)}
                    </div>
                    <span className="text-gray-900">{chain.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
