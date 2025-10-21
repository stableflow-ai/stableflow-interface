import React, { useEffect, useState } from "react";
import AptosWallet from "@/libs/wallets/aptos/wallet";
import useWalletsStore from "@/stores/use-wallets";
import useBalancesStore from "@/stores/use-balances";
import useIsMobile from "@/hooks/use-is-mobile";
import { useDebounceFn } from "ahooks";
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { Network } from "@aptos-labs/ts-sdk";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import Modal from "@/components/modal";

export default function AptosProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const isMobile = useIsMobile();

  return (
    <AptosWalletAdapterProvider
      autoConnect={true}
      dappConfig={{ network: Network.MAINNET }}
      onError={(error) => {
        console.log("error", error);
      }}
    >
      {children} {isMobile ? <Content /> : <Content />}
    </AptosWalletAdapterProvider>
  );
}

const Content = () => {
  const [mounted, setMounted] = useState(false);
  const setWallets = useWalletsStore((state) => state.set);
  const {
    account,
    connect,
    disconnect,
    signAndSubmitTransaction,
    wallet,
    wallets,
  } = useWallet();
  const setBalancesStore = useBalancesStore((state) => state.set);

  // Wallet selector
  const [open, setOpen] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const onConnect = async (walletName: string) => {
    try {
      setIsConnecting(walletName);
      await connect(walletName);
      onClose();
    } catch (error) {
      console.error(`Failed to connect to ${walletName}:`, error);
    } finally {
      setIsConnecting(null);
    }
  };
  const onClose = () => {
    setOpen(false);
  };
  const onOpen = () => {
    setOpen(true);
  };

  const { run: connect2AptosWallets } = useDebounceFn(() => {
    if (!mounted) return;
    const aptosWallet = new AptosWallet({
      account,
      signAndSubmitTransaction,
    });
    setWallets({
      aptos: {
        account: account?.address.toString() || null,
        wallet: aptosWallet,
        walletIcon: wallet?.icon,
        connect: () => {
          if (wallet) {
            onConnect(wallet.name);
          } else {
            onOpen();
          }
        },
        disconnect: () => {
          disconnect();
          setBalancesStore({
            aptosBalances: {}
          });
          setWallets({
            aptos: {
              account: null,
              wallet: null,
              connect: () => { },
              disconnect: () => { }
            }
          });
        }
      }
    });
  }, { wait: 500 });

  useEffect(() => {
    connect2AptosWallets();
  }, [account, mounted]);

  const { run: connectDelay } = useDebounceFn(() => {
    if (!wallet) {
      return;
    }
    onConnect(wallet.name);
  }, { wait: 500 });

  useEffect(() => {
    connectDelay();
  }, [wallet]);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Modal
      open={open}
      onClose={onClose}
      className="flex items-center justify-center"
    >
      <div className="p-[24px] bg-white rounded-b-[0px] md:rounded-b-[16px] rounded-t-[16px] w-full md:w-[400px] max-w-[unset] md:max-w-[90vw] max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-[20px]">
          <h2 className="text-[20px] font-[600] text-[#1A1A1A]">
            Select Aptos Wallet
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
          {wallets
            .filter((_wallet) => !["Continue with Apple", "Continue with Google"].includes(_wallet.name))
            .map((_wallet) => (
              <button
                key={_wallet.name}
                onClick={() => onConnect(_wallet.name)}
                disabled={isConnecting === _wallet.name}
                className="button w-full flex items-center gap-[16px] p-[16px] rounded-[12px] hover:bg-[#F8F9FA] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {/* Wallet Icon */}
                <div className="w-[40px] h-[40px] rounded-[8px] bg-[#F5F5F5] flex items-center justify-center flex-shrink-0">
                  {_wallet.icon ? (
                    <img
                      src={_wallet.icon}
                      alt={_wallet.name}
                      className="w-[24px] h-[24px]"
                    />
                  ) : (
                    <div className="w-[24px] h-[24px] rounded-full bg-[#E5E5E5]" />
                  )}
                </div>

                {/* Wallet Info */}
                <div className="flex-1 text-left">
                  <div className="text-[16px] font-[500] text-[#1A1A1A] mb-[2px]">
                    {_wallet.name}
                  </div>
                  <div className="text-[14px] text-[#666666]">{_wallet.name}</div>
                </div>

                {/* Loading State */}
                {isConnecting === _wallet.name && (
                  <div className="w-[20px] h-[20px] border-2 border-[#6284F5] border-t-transparent rounded-full animate-spin" />
                )}
              </button>
            ))}
        </div>

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

// const MobileContent = () => {
//   const setWallets = useWalletsStore((state) => state.set);

//   useWatchOKXConnect((okxConnect: any) => {
//     const { okxUniversalProvider, connect, disconnect, icon } = okxConnect;
//     const provider = new OKXSolanaProvider(okxUniversalProvider);
//     const account = provider.getAccount()?.address || null;
//     const solanaWallet = new SolanaWallet({
//       publicKey: account ? new PublicKey(account) : null,
//       signTransaction: (transaction: Transaction) => {
//         return provider.signTransaction(transaction, "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp");
//       },
//     });

//     setWallets({
//       aptos: {
//         account,
//         wallet: solanaWallet,
//         walletIcon: icon,
//         connect: connect,
//         disconnect: disconnect,
//       }
//     });
//   });

//   return null;
// };
