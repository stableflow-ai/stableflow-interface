import { useState } from "react";
import {
  TronLinkAdapter,
  OkxWalletAdapter
} from "@tronweb3/tronwallet-adapters";
import Modal from "@/components/modal";

export const wallets = [new TronLinkAdapter(), new OkxWalletAdapter()];

interface WalletSelectorProps {
  open: boolean;
  onClose: () => void;
  onWalletSelect: (walletName: string) => void;
}

export default function AptosWalletSelector({
  open,
  onClose,
  onWalletSelect
}: WalletSelectorProps) {
  const [isConnecting, setIsConnecting] = useState<string | null>(null);

  // Handle wallet selection and connection
  const handleWalletSelect = async (wallet: any) => {
    try {
      setIsConnecting(wallet.name);
      await wallet.connect();
      onWalletSelect(wallet);
      onClose();
    } catch (error) {
      console.error(`Failed to connect to ${wallet.name}:`, error);
    } finally {
      setIsConnecting(null);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      className="flex items-center justify-center"
      innerClassName="bg-white rounded-[16px] w-[400px] max-w-[90vw] max-h-[80vh] overflow-hidden"
    >
      <div className="p-[24px]">
        {/* Header */}
        <div className="flex items-center justify-between mb-[20px]">
          <h2 className="text-[20px] font-[600] text-[#1A1A1A]">
            Select Tron Wallet
          </h2>
          <button
            onClick={onClose}
            className="w-[32px] h-[32px] rounded-full bg-[#F5F5F5] flex items-center justify-center hover:bg-[#E5E5E5] transition-colors"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 4L4 12M4 4L12 12"
                stroke="#666666"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Wallet List */}
        <div className="space-y-[8px] max-h-[400px] overflow-y-auto">
          {wallets.map((wallet) => (
            <button
              key={wallet.name}
              onClick={() => handleWalletSelect(wallet)}
              disabled={isConnecting === wallet.name}
              className="button w-full flex items-center gap-[16px] p-[16px] rounded-[12px] hover:bg-[#F8F9FA] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {/* Wallet Icon */}
              <div className="w-[40px] h-[40px] rounded-[8px] bg-[#F5F5F5] flex items-center justify-center flex-shrink-0">
                {wallet.icon ? (
                  <img
                    src={wallet.icon}
                    alt={wallet.name}
                    className="w-[24px] h-[24px]"
                  />
                ) : (
                  <div className="w-[24px] h-[24px] rounded-full bg-[#E5E5E5]" />
                )}
              </div>

              {/* Wallet Info */}
              <div className="flex-1 text-left">
                <div className="text-[16px] font-[500] text-[#1A1A1A] mb-[2px]">
                  {wallet.name}
                </div>
                <div className="text-[14px] text-[#666666]">{wallet.name}</div>
              </div>

              {/* Loading State */}
              {isConnecting === wallet.name && (
                <div className="w-[20px] h-[20px] border-2 border-[#6284F5] border-t-transparent rounded-full animate-spin" />
              )}
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-[20px] pt-[16px] border-t border-[#E5E5E5]">
          <p className="text-[12px] text-[#999999] text-center">
            By connecting a wallet, you agree to our Terms of Service and
            Privacy Policy
          </p>
        </div>
      </div>
    </Modal>
  );
}
