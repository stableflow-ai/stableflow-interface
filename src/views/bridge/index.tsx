import useBridge from "./hooks/use-bridge";
import ChainSelector from "./components/chain-selector";
import TokenSelector from "./components/token-selector";
import { getAddressPlaceholder } from "@/utils/address-validation";
import Button from "@/components/button";

export default function Bridge() {
  const {
    fromChain,
    toChain,
    handleFromChainSelect,
    handleToChainSelect,
    fromToken,
    toToken,
    handleFromTokenSelect,
    handleToTokenSelect,
    recipientAddress,
    handleRecipientAddressChange,
    addressValidation,
    amount,
    amountError,
    handleAmountChange,
    quoting,
    transfer
  } = useBridge();

  return (
    <div className="p-6 space-y-6">
      <div className="w-[400px] border border-gray-200 p-6 rounded-[10px] space-y-4">
        {/* From section */}
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-gray-900">From</h3>
          <ChainSelector
            selectedChain={fromChain}
            onChainSelect={handleFromChainSelect}
            label="Select Source Chain"
          />
          <TokenSelector
            selectedChain={fromChain?.key || null}
            selectedToken={fromToken}
            onTokenSelect={handleFromTokenSelect}
            label="Select Source Token"
          />

          {/* Amount Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Amount
            </label>
            <div className="relative">
              <input
                type="text"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="Enter amount"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  amount && amountError
                    ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                    : amount && !amountError
                    ? "border-green-300 focus:ring-green-500 focus:border-green-500"
                    : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                }`}
              />
              {fromToken && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <span className="text-sm text-gray-500">
                    {fromToken.symbol}
                  </span>
                </div>
              )}
            </div>
            {amountError && (
              <p className="text-xs text-red-600 flex items-center">
                <svg
                  className="w-3 h-3 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {amountError}
              </p>
            )}
            {amount && !amountError && (
              <p className="text-xs text-green-600 flex items-center">
                <svg
                  className="w-3 h-3 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Valid amount
              </p>
            )}
          </div>
        </div>

        {/* Swap button */}
        <div className="flex justify-center">
          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
              />
            </svg>
          </button>
        </div>

        {/* To section */}
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-gray-900">To</h3>
          <ChainSelector
            selectedChain={toChain}
            onChainSelect={handleToChainSelect}
            label="Select Target Chain"
          />
          <TokenSelector
            selectedChain={toChain?.key || null}
            selectedToken={toToken}
            onTokenSelect={handleToTokenSelect}
            label="Select Target Token"
          />
        </div>

        {/* Recipient Address Input */}
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-gray-900">
            Recipient Address
          </h3>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Enter recipient address
            </label>
            <input
              type="text"
              value={recipientAddress}
              onChange={(e) => handleRecipientAddressChange(e.target.value)}
              placeholder={
                toChain
                  ? getAddressPlaceholder(toChain.key)
                  : "Enter the recipient's wallet address"
              }
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                recipientAddress && toChain
                  ? addressValidation.isValid
                    ? "border-green-300 focus:ring-green-500 focus:border-green-500"
                    : "border-red-300 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              }`}
            />
            {recipientAddress && toChain && (
              <div className="space-y-1">
                {addressValidation.isValid ? (
                  <p className="text-xs text-green-600 flex items-center">
                    <svg
                      className="w-3 h-3 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Valid {toChain.name} address
                  </p>
                ) : (
                  <p className="text-xs text-red-600 flex items-center">
                    <svg
                      className="w-3 h-3 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {addressValidation.error || "Invalid address format"}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <Button
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
              fromChain &&
              toChain &&
              fromToken &&
              toToken &&
              recipientAddress &&
              addressValidation.isValid &&
              amount &&
              !amountError
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            disabled={
              !fromChain ||
              !toChain ||
              !fromToken ||
              !toToken ||
              !recipientAddress ||
              !addressValidation.isValid ||
              !amount ||
              !!amountError
            }
            loading={quoting}
            onClick={() => {
              transfer();
            }}
          >
            {fromChain &&
            toChain &&
            fromToken &&
            toToken &&
            recipientAddress &&
            addressValidation.isValid &&
            amount &&
            !amountError
              ? "Start Bridge Transfer"
              : "Complete all fields to continue"}
          </Button>
        </div>
      </div>
    </div>
  );
}
