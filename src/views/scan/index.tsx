import clsx from "clsx";
import { useEffect, useRef } from "react";
import useScan from "./hooks/use-scan";
import AddressBookModal from "./components/address-book-modal";
import chains from "@/config/chains";
import { formatAddress } from "@/utils/format/address";
import type { AddressBookItem } from "@/stores/use-address-book";

export default function Scan() {
  const {
    // State
    selectedNetwork,
    recipientAddress,
    amount,
    showMoreOptions,
    isLoading,
    addressError,
    
    // Setters
    setSelectedNetwork,
    setRecipientAddress,
    setShowMoreOptions,
    handleAmountChange,
    setShowAddressBook,
    setShowAddressDropdown,
    
    // Computed values
    sourceWalletName,
    primaryNetworks,
    allNetworks,
    selectedChain,
    isContinueDisabled,
    filteredAddresses,
    
    // Handlers
    handleContinue,
    handleAddressSelect,
    
    // Store values
    selectedToken,
    
    // UI state
    showAddressBook,
    showAddressDropdown,
  } = useScan();

  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputWrapperRef = useRef<HTMLDivElement>(null);

  // Hide dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputWrapperRef.current &&
        !inputWrapperRef.current.contains(event.target as Node)
      ) {
        setShowAddressDropdown(false);
      }
    };

    if (showAddressDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showAddressDropdown, setShowAddressDropdown]);

  return (
    <div className="w-full min-h-dvh pb-[100px] flex flex-col items-center overflow-y-auto overflow-x-hidden">
      <div className="md:w-[600px] w-full mx-auto pt-[60px] md:pt-[80px] shrink-0 px-[20px] md:px-0">
        {/* Title Section */}
        <div className="mb-[32px]">
          <h1 className="text-[32px] md:text-[40px] font-medium text-[#2B3337] mb-[12px]">
            Scan-to-Pay
          </h1>
          <p className="text-[14px] md:text-[16px] text-[#2B3337]/70 leading-relaxed">
            One-hop cross-chain payment: Scan the QR code with your {sourceWalletName} wallet, and the system automatically bridges to your target network address.
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-[16px] shadow-[0_2px_6px_0_rgba(0,0,0,0.10)] p-[24px] md:p-[32px]">
          {/* Select Target Network Section */}
          <div className="mb-[32px]">
            <label className="block text-[16px] font-medium text-[#2B3337] mb-[16px]">
              Select Target Network
            </label>
            <div className="flex gap-[12px] flex-wrap">
              {primaryNetworks.map((network) => {
                const isSelected = selectedNetwork === network.key;
                return (
                  <button
                    key={network.key}
                    onClick={() => setSelectedNetwork(network.key)}
                    className={clsx(
                      "relative flex flex-col items-center justify-center gap-[8px]",
                      "w-[120px] h-[120px] rounded-[12px] border-2 transition-all",
                      "hover:border-opacity-80",
                      isSelected
                        ? "border-[#7083ee] bg-[#FAFBFF]"
                        : "border-[#E5E7EB] bg-white"
                    )}
                  >
                    {isSelected && (
                      <div className="absolute top-[8px] right-[8px] w-[8px] h-[8px] rounded-full bg-[#7083ee]" />
                    )}
                    <div
                      className="w-[50px] h-[50px] rounded-full flex items-center justify-center"
                      style={{
                        backgroundColor: network.primaryColor || "#7083ee",
                      }}
                    >
                      <img
                        src={network.chainIcon}
                        alt={network.chainName}
                        className="w-[30px] h-[30px] object-contain"
                      />
                    </div>
                    <span className="text-[14px] font-medium text-[#2B3337]">
                      {network.chainName}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* More Options */}
            <button
              onClick={() => setShowMoreOptions(!showMoreOptions)}
              className="mt-[16px] flex items-center gap-[6px] text-[14px] text-[#9FA7BA] hover:text-[#2B3337] transition-colors"
            >
              <svg
                className={clsx(
                  "w-[16px] h-[16px] transition-transform",
                  showMoreOptions && "rotate-180"
                )}
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
              <span>More Options ({allNetworks.length - primaryNetworks.length})</span>
            </button>

            {/* Expanded Networks */}
            {showMoreOptions && (
              <div className="mt-[16px] flex gap-[12px] flex-wrap">
                {allNetworks
                  .filter((n) => !primaryNetworks.some((pn) => pn.key === n.key))
                  .map((network) => {
                    const isSelected = selectedNetwork === network.key;
                    return (
                      <button
                        key={network.key}
                        onClick={() => setSelectedNetwork(network.key)}
                        className={clsx(
                          "relative flex flex-col items-center justify-center gap-[8px]",
                          "w-[120px] h-[120px] rounded-[12px] border-2 transition-all",
                          "hover:border-opacity-80",
                          isSelected
                            ? "border-[#7083ee] bg-[#FAFBFF]"
                            : "border-[#E5E7EB] bg-white"
                        )}
                      >
                        {isSelected && (
                          <div className="absolute top-[8px] right-[8px] w-[8px] h-[8px] rounded-full bg-[#7083ee]" />
                        )}
                        <div
                          className="w-[50px] h-[50px] rounded-full flex items-center justify-center"
                          style={{
                            backgroundColor: network.primaryColor || "#7083ee",
                          }}
                        >
                          <img
                            src={network.chainIcon}
                            alt={network.chainName}
                            className="w-[30px] h-[30px] object-contain"
                          />
                        </div>
                        <span className="text-[14px] font-medium text-[#2B3337]">
                          {network.chainName}
                        </span>
                      </button>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Recipient Address Section */}
          <div className="mb-[32px]">
            <label className="block text-[16px] font-medium text-[#2B3337] mb-[8px]">
              Recipient Address <span className="text-red-500">*</span>
            </label>
            <div className="relative" ref={inputWrapperRef}>
              <input
                type="text"
                value={recipientAddress}
                onChange={(e) => {
                  setRecipientAddress(e.target.value);
                  if (e.target.value.trim()) {
                    setShowAddressDropdown(true);
                  }
                }}
                onFocus={() => {
                  if (filteredAddresses.length > 0) {
                    setShowAddressDropdown(true);
                  }
                }}
                placeholder="Enter your address"
                className={clsx(
                  "w-full h-[52px] pr-[48px] pl-[16px] rounded-[12px] border text-[14px] text-[#2B3337] placeholder:text-[#9FA7BA] focus:outline-none transition-colors",
                  addressError ? "border-red-500" : "border-[#E5E7EB] focus:border-[#7083ee]"
                )}
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAddressBook(true);
                }}
                className="button absolute right-[8px] top-1/2 -translate-y-1/2 w-[36px] h-[36px] flex items-center justify-center rounded-[8px] hover:bg-[#F5F5F5] transition-colors"
                title="Address Book"
              >
                <img
                  src="/icon-notebook.svg"
                  alt="Address Book"
                  className="w-[20px] h-[20px]"
                />
              </button>
              
              {/* Address Dropdown */}
              {showAddressDropdown && filteredAddresses.length > 0 && (
                <div
                  ref={dropdownRef}
                  className="absolute top-full left-0 right-0 mt-[4px] bg-white rounded-[12px] border border-[#E5E7EB] shadow-[0_4px_12px_0_rgba(0,0,0,0.15)] z-50 max-h-[240px] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  {filteredAddresses.map((item: AddressBookItem) => {
                    const chainInfo = chains[item.chain as keyof typeof chains];
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleAddressSelect(item.address, item.chain)}
                        className="w-full px-[16px] py-[12px] flex items-center gap-[12px] hover:bg-[#F5F5F5] transition-colors text-left border-b border-[#E5E7EB] last:border-b-0"
                      >
                        {chainInfo && (
                          <img
                            src={chainInfo.chainIcon}
                            alt={chainInfo.chainName}
                            className="w-[24px] h-[24px] shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          {item.alias && (
                            <div className="text-[14px] font-medium text-[#2B3337] mb-[2px] truncate">
                              {item.alias}
                            </div>
                          )}
                          <div className="text-[12px] text-[#9FA7BA] font-mono truncate">
                            {formatAddress(item.address, 6, 6)}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            {addressError ? (
              <p className="mt-[8px] text-[12px] text-red-500">{addressError}</p>
            ) : (
              <p className="mt-[8px] text-[12px] text-[#9FA7BA]">
                Enter the {selectedChain?.chainName.toLowerCase() || "ethereum"} address where you want to receive funds
              </p>
            )}
          </div>

          {/* Amount Section */}
          <div className="mb-[32px]">
            <label className="block text-[16px] font-medium text-[#2B3337] mb-[8px]">
              Amount ({selectedToken})
            </label>
            <input
              type="text"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="Optional: Leave empty to enter amount in wallet"
              className="w-full h-[52px] px-[16px] rounded-[12px] border border-[#E5E7EB] text-[14px] text-[#2B3337] placeholder:text-[#9FA7BA] focus:outline-none focus:border-[#7083ee] transition-colors"
            />
            <p className="mt-[8px] text-[12px] text-[#9FA7BA]">
              Optional: Leave empty to enter amount in wallet
            </p>
          </div>

          {/* Continue Button */}
          <button
            onClick={handleContinue}
            disabled={isContinueDisabled}
            className={clsx(
              "w-full h-[52px] rounded-[12px] text-[16px] font-medium transition-all",
              isContinueDisabled
                ? "bg-[#E5E7EB] text-[#9FA7BA] cursor-not-allowed"
                : "bg-[#7083ee] text-white hover:bg-[#5a6bd8] cursor-pointer"
            )}
          >
            {isLoading ? "Loading..." : "Continue"}
          </button>
        </div>
      </div>

      {/* Address Book Modal */}
      <AddressBookModal
        open={showAddressBook}
        onClose={() => setShowAddressBook(false)}
        onSelect={handleAddressSelect}
        currentChain={selectedNetwork}
      />
    </div>
  );
}
