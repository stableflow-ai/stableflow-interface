import { useState, useEffect } from "react";

interface Token {
  assetId: string;
  decimals: number;
  blockchain: string;
  symbol: string;
  price: number;
  priceUpdatedAt: string;
  contractAddress: string;
}

interface TokenSelectorProps {
  selectedChain: string | null;
  selectedToken: Token | null;
  onTokenSelect: (token: Token) => void;
  label?: string;
}

export default function TokenSelector({
  selectedChain,
  selectedToken,
  onTokenSelect,
  label = "Select Token"
}: TokenSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(false);

  // Dynamically load tokens based on selected chain
  useEffect(() => {
    const loadTokens = async () => {
      if (!selectedChain) {
        setTokens([]);
        return;
      }

      setLoading(true);
      try {
        let tokenData;
        switch (selectedChain) {
          case "near":
            tokenData = await import("@/config/tokens/near");
            break;
          case "sol":
            tokenData = await import("@/config/tokens/solana");
            break;
          case "arb":
            tokenData = await import("@/config/tokens/arb");
            break;
          default:
            tokenData = { default: {} };
        }

        const tokenList = Object.values(tokenData.default);
        setTokens(tokenList);
      } catch (error) {
        console.error("Failed to load tokens:", error);
        setTokens([]);
      } finally {
        setLoading(false);
      }
    };

    loadTokens();
  }, [selectedChain]);

  const handleTokenSelect = (token: Token) => {
    onTokenSelect(token);
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
          className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          onClick={() => setIsOpen(!isOpen)}
          disabled={!selectedChain || loading}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {selectedToken ? (
                <>
                  <div className="w-6 h-6 bg-blue-100 rounded-full mr-3 flex items-center justify-center">
                    <span className="text-blue-600 font-medium text-sm">
                      {selectedToken.symbol.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-900">
                      {selectedToken.symbol}
                    </span>
                    <span className="text-gray-500 text-sm ml-2">
                      ${selectedToken.price.toFixed(4)}
                    </span>
                  </div>
                </>
              ) : (
                <span className="text-gray-500">
                  {loading
                    ? "Loading..."
                    : !selectedChain
                    ? "Please select a chain first"
                    : "Please select a token"}
                </span>
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

        {isOpen && selectedChain && !loading && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
            <div className="py-1">
              {tokens.length > 0 ? (
                tokens.map((token) => (
                  <button
                    key={token.assetId}
                    type="button"
                    className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                    onClick={() => handleTokenSelect(token)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-blue-100 rounded-full mr-3 flex items-center justify-center">
                          <span className="text-blue-600 font-medium text-sm">
                            {token.symbol.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-900">{token.symbol}</span>
                          <div className="text-xs text-gray-500">
                            {token.blockchain.toUpperCase()}
                          </div>
                        </div>
                      </div>
                      <span className="text-gray-500 text-sm">
                        ${token.price.toFixed(4)}
                      </span>
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-3 py-2 text-gray-500 text-sm">
                  No tokens available for this chain
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
