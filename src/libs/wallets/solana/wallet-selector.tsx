import Modal from "@/components/modal";
import { useWallet } from "@solana/wallet-adapter-react";
import type { Wallet } from "@solana/wallet-adapter-react";
import { createContext, useContext, useState, useMemo, useCallback } from "react";
import type { MouseEvent } from "react";

interface SolanaWalletModalProps {
  className?: string;
  container?: string;
  // Wallet order configuration. Wallets in the array will be sorted by their order, wallets not in the array will be placed at the end
  walletOrder?: string[];
}

interface SolanaWalletModalProviderProps extends SolanaWalletModalProps {
  children: any;
}

interface SolanaWalletModalContextState {
  visible: boolean;
  setVisible: (open: boolean) => void;
}

export const SolanaWalletModalContext = createContext<Partial<SolanaWalletModalContextState>>({});

export function useSolanaWalletModal(): Partial<SolanaWalletModalContextState> {
  return useContext(SolanaWalletModalContext);
}

const SolanaWalletSelectorProvider = (props: SolanaWalletModalProviderProps) => {
  const { children } = props;

  const [visible, setVisible] = useState(false);

  return (
    <SolanaWalletModalContext.Provider
      value={{
        visible,
        setVisible,
      }}
    >
      {children}
      {visible && <SolanaWalletModal {...props} />}
    </SolanaWalletModalContext.Provider>
  );
};

export default SolanaWalletSelectorProvider;

const SolanaWalletModal = (props: SolanaWalletModalProps) => {
  const { wallets, select } = useWallet();
  const { visible, setVisible } = useSolanaWalletModal();
  const { walletOrder = [] } = props;

  // Sort wallets: installed wallets first, then sort by walletOrder configuration
  const sortedWallets = useMemo(() => {
    const installed: Wallet[] = [];
    const notInstalled: Wallet[] = [];

    // First, categorize by installation status
    // WalletReadyState.Installed value is "Installed"
    for (const wallet of wallets) {
      if (wallet.readyState === "Installed") {
        installed.push(wallet);
      } else {
        notInstalled.push(wallet);
      }
    }

    // Sort function: sort according to walletOrder configuration
    const sortWallets = (walletList: Wallet[]) => {
      return [...walletList].sort((a, b) => {
        const aIndex = walletOrder.indexOf(a.adapter.name);
        const bIndex = walletOrder.indexOf(b.adapter.name);

        // If both are in the configuration, sort by configuration order
        if (aIndex !== -1 && bIndex !== -1) {
          return aIndex - bIndex;
        }
        // If only a is in the configuration, a comes first
        if (aIndex !== -1) {
          return -1;
        }
        // If only b is in the configuration, b comes first
        if (bIndex !== -1) {
          return 1;
        }
        // If neither is in the configuration, keep original order
        return 0;
      });
    };

    return [...sortWallets(installed), ...sortWallets(notInstalled)];
  }, [wallets, walletOrder]);

  const handleClose = useCallback(() => {
    setVisible?.(false);
  }, [setVisible]);

  const handleWalletClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>, walletName: string) => {
      event.preventDefault();
      select(walletName as any);
      handleClose();
    },
    [select, handleClose]
  );

  return (
    <Modal
      open={visible}
      onClose={handleClose}
      className="flex items-center justify-center"
    >
      <div className="p-[24px] bg-white rounded-b-none md:rounded-b-[16px] rounded-t-[16px] w-full md:w-[400px] max-w-[unset] md:max-w-[90vw] max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-[20px]">
          <h2 className="text-[20px] font-semibold text-[#1A1A1A]">
            Connect a wallet on Solana to continue
          </h2>
          <button
            onClick={handleClose}
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
        {sortedWallets.length > 0 ? (
          <div className="space-y-[8px] max-h-[400px] overflow-y-auto">
            {sortedWallets.map((wallet) => (
              <button
                key={wallet.adapter.name}
                onClick={(e) => handleWalletClick(e, wallet.adapter.name)}
                className="button w-full flex items-center gap-[16px] p-[16px] rounded-[12px] hover:bg-[#F8F9FA] transition-colors"
              >
                {/* Wallet Icon */}
                <div className="w-[40px] h-[40px] rounded-[8px] bg-[#F5F5F5] flex items-center justify-center shrink-0">
                  {wallet.adapter.icon ? (
                    <img
                      src={wallet.adapter.icon}
                      alt={wallet.adapter.name}
                      className="w-[24px] h-[24px]"
                    />
                  ) : (
                    <div className="w-[24px] h-[24px] rounded-full bg-[#E5E5E5]" />
                  )}
                </div>

                {/* Wallet Info */}
                <div className="flex-1 text-left">
                  <div className="text-[16px] font-medium text-[#1A1A1A] mb-[2px]">
                    {wallet.adapter.name}
                  </div>
                </div>

                {/* Installed Badge */}
                {wallet.readyState === "Installed" && (
                  <div className="uppercase text-[12px] p-[2px_6px] text-[#26d962] bg-[rgba(38,217,98,0.20)] rounded-[4px]">
                    Detected
                  </div>
                )}
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-[40px]">
            <p className="text-[16px] text-[#666666]">
              You'll need a wallet on Solana to continue
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-[20px] pt-[16px] border-t border-[#E5E5E5]">
          <p className="text-[12px] text-[#999999] text-center">
            By connecting a wallet, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </Modal>
  );
};
