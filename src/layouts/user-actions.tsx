import useWalletStore from "@/stores/use-wallet";
import ChainIcon from "./chain-icon";
import useWalletsStore, { type WalletType } from "@/stores/use-wallets";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useHistoryStore } from "@/stores/use-history";
import { useMemo, useState } from "react";
import MainTitle from "@/components/main-title";
import useIsMobile from "@/hooks/use-is-mobile";
import { stablecoinWithChains } from "@/config/tokens";
import clsx from "clsx";
import NavigationMenu from "@/components/navigation-menu";
import { usePendingHistory } from "@/views/history/hooks/use-pending-history";

export default function UserActions() {
  const walletStore = useWalletStore();
  const walletsStore = useWalletsStore();
  const navigate = useNavigate();
  const pathname = useLocation();
  const isMobile = useIsMobile();
  const historyStore = useHistoryStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isHistory = useMemo(() => {
    return pathname.pathname === "/history";
  }, [pathname]);

  const isOverview = useMemo(() => {
    return pathname.pathname === "/overview";
  }, [pathname]);

  const hideActions = useMemo(() => {
    return pathname.pathname === "/developer" || pathname.pathname === "/learn-more";
  }, [pathname]);

  return (
    <>
      <div className="w-full absolute z-[9] pl-[6px] md:pl-0 pr-[10px] top-[14px] flex justify-between items-center gap-[10px]">
        <div className="flex items-center gap-[32px] md:gap-[48px]">
          <div className="shrink-0">
            <MainTitle className="!flex md:!hidden !w-[unset]" />
          </div>
          <div className="hidden md:flex">
            <NavigationMenu />
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-[7px]">
          {!hideActions && (
            <>
              {!walletsStore.evm.account &&
                !walletsStore.sol.account &&
                !walletsStore.near.account &&
                !walletsStore.tron.account ? (
                <button
                  onClick={() => {
                    walletStore.set({ showWallet: true });
                  }}
                  className="button px-[15px] md:px-[20px] py-[6px] md:py-[8px] bg-[#6284F5] rounded-[18px] text-[16px] text-white"
                >
                  Connect
                </button>
              ) : (
                <div className="flex items-center gap-[7px]">
                  {!isHistory && !isOverview && (
                    <HistoryButton
                      onClick={() => {
                        if (isMobile) {
                          historyStore.setOpenDrawer(!historyStore.openDrawer);
                          return;
                        }
                        navigate("/history");
                      }}
                    />
                  )}
                  {!isHistory && !isOverview && (
                    <OverviewButton
                      onClick={() => {
                        navigate("/overview");
                      }}
                      hidden={true}
                    />
                  )}
                  <ChainsButton
                    onClick={() => {
                      walletStore.set({ showWallet: true });
                    }}
                  />
                </div>
              )}
            </>
          )}
          {/* Mobile menu button */}
          <MobileMenuButton 
            isOpen={mobileMenuOpen} 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
          />
        </div>
      </div>
      {/* Mobile menu drawer */}
      <MobileMenuDrawer 
        isOpen={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)} 
      />
    </>
  );
}

const HistoryButton = ({ onClick }: any) => {
  usePendingHistory();
  const pendingNumber = useHistoryStore((state) => state.pendingNumber);
  return (
    <>
      <button
        onClick={onClick}
        className="flex md:hidden relative button px-[12px] md:px-[18px] h-[38px] md:h-[36px] justify-center items-center text-[14px] gap-[8px] rounded-[19px] md:rounded-[18px] bg-white shadow-[0_0_6px_0_rgba(0,0,0,0.10)]"
      >
        <img
          src="/icon-records.svg"
          alt=""
          className="w-[14px] h-[16px] object-center object-contain shrink-0"
        />
        {pendingNumber > 0 && (
          <div className="w-[9px] h-[9px] rounded-full bg-[#FFBF19] absolute right-[10px] top-[8px] border border-white z-[1]"></div>
        )}
      </button>
      <button
        onClick={onClick}
        className="hidden md:flex button px-[10px] md:px-[18px] h-[32px] md:h-[36px] justify-center items-center text-[14px] gap-[8px] rounded-[18px] bg-white shadow-[0_0_6px_0_rgba(0,0,0,0.10)]"
      >
        {pendingNumber > 0 ? (
          <>
            <div className="w-[20px] h-[20px] rounded-[50%] bg-[#6284F5] text-white font-[400] flex justify-center items-center">
              {pendingNumber}
            </div>
            <div className="font-[400]">Pending</div>
          </>
        ) : (
          <>
            <img
              src="/icon-records.svg"
              alt=""
              className="w-[14px] h-[16px] object-center object-contain shrink-0"
            />
            <span className="text-[#444C59]">History</span>
          </>
        )}
      </button>
    </>
  );
};

const OverviewButton = ({ onClick, hidden }: any) => {
  if (hidden) {
    return null;
  }
  return (
    <>
      <button
        onClick={onClick}
        className="flex md:hidden button px-[10px] md:px-[18px] h-[32px] md:h-[36px] justify-center items-center text-[14px] gap-[8px] rounded-[18px] bg-white shadow-[0_0_6px_0_rgba(0,0,0,0.10)]"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-[#444C59]"
        >
          <path d="M3 3v18h18" />
          <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
        </svg>
      </button>
      <button
        onClick={onClick}
        className="hidden md:flex button px-[10px] md:px-[18px] h-[32px] md:h-[36px] justify-center items-center text-[14px] gap-[8px] rounded-[18px] bg-white shadow-[0_0_6px_0_rgba(0,0,0,0.10)]"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-[#444C59]"
        >
          <path d="M3 3v18h18" />
          <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
        </svg>
        <span className="text-[#444C59]">Overview</span>
      </button>
    </>
  );
};

const ChainsButton = ({
  onClick,
}: any) => {
  const walletsStore = useWalletsStore();

  const isMobile = useIsMobile();

  // Get the list of chains to display
  const chainsToDisplay = useMemo(() => {
    const allChains = Object.entries(stablecoinWithChains);
    
    if (!isMobile) {
      // Desktop: show all chains
      return allChains;
    }
    
    // Mobile: prioritize EVM, if EVM is not connected, show other connected wallet
    if (walletsStore.evm?.account) {
      // EVM is connected, show EVM
      return allChains.filter(([chain]) => chain === 'evm');
    }
    
    // EVM is not connected, find other connected wallet
    const connectedChain = allChains.find(([chain]) => 
      walletsStore?.[chain as WalletType]?.account
    );
    
    if (connectedChain) {
      return [connectedChain];
    }
    
    // None connected, default to first one (EVM)
    return allChains.slice(0, 1);
  }, [isMobile, walletsStore.evm?.account, walletsStore.sol?.account, walletsStore.near?.account, walletsStore.tron?.account]);

  return (
    <button
      onClick={onClick}
      className="p-[6px] flex justify-center items-center button rounded-[18px] bg-white shadow-[0_0_6px_0_rgba(0,0,0,0.10)]"
    >
      {
        chainsToDisplay.map(([chain, _tokens], index) => {
          return (
            <ChainIcon
              key={index}
              chain={chain}
              connected={!!walletsStore?.[chain as WalletType]?.account}
              className={clsx(index > 0 && "ml-[-8px]")}
            />
          );
        })
      }
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="10"
        height="5"
        viewBox="0 0 10 5"
        fill="none"
        className="ml-[10px]"
      >
        <path
          d="M9 1L4.86207 4L1 0.999999"
          stroke="#A1A699"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
};

const MobileMenuButton = ({ isOpen, onClick }: { isOpen: boolean; onClick: () => void }) => {
  // Hide when menu is open since close button is inside the drawer
  if (isOpen) {
    return null;
  }

  return (
    <button
      onClick={onClick}
      className="flex md:hidden w-[38px] h-[38px] justify-center items-center button rounded-[19px] bg-white shadow-[0_0_6px_0_rgba(0,0,0,0.10)]"
    >
      {/* Menu icon (hamburger) */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-[#444C59]"
      >
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="18" x2="21" y2="18" />
      </svg>
    </button>
  );
};

const MobileMenuDrawer = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const location = useLocation();

  const menuItems = [
    {
      label: "Transfer",
      path: "/",
      isExternal: false
    },
    {
      label: "Deposit",
      path: "https://deposit.stableflow.ai/",
      isExternal: true
    },
    {
      label: "Developer",
      path: "/developer",
      isExternal: false
    },
    {
      label: "Learn",
      path: "/learn-more",
      isExternal: false
    }
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className={clsx(
          "fixed inset-0 bg-black/30 z-[99] md:hidden transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />
      {/* Drawer */}
      <div
        className={clsx(
          "fixed top-0 left-0 right-0 bg-white z-[100] md:hidden transition-transform duration-300 ease-out shadow-[0_4px_12px_0_rgba(0,0,0,0.15)]",
          isOpen ? "translate-y-0" : "-translate-y-full"
        )}
      >
        {/* Close button inside drawer */}
        <button
          onClick={onClose}
          className="absolute top-[20px] right-[15px] w-[38px] h-[38px] flex justify-center items-center button rounded-[19px] bg-white shadow-[0_0_6px_0_rgba(0,0,0,0.10)]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-[#444C59]"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <div className="pt-[60px] pb-[20px] px-[20px]">
          <nav className="flex flex-col gap-[16px]">
            {menuItems.map((item) => {
              const isActive = item.path === "/" 
                ? location.pathname === "/" 
                : location.pathname.startsWith(item.path);

              if (item.isExternal) {
                return (
                  <a
                    key={item.label}
                    href={item.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={onClose}
                    className="text-[16px] font-[500] text-[#2B3337]/70 hover:text-[#2B3337] transition-colors duration-200 py-[8px]"
                  >
                    {item.label}
                  </a>
                );
              }

              return (
                <Link
                  key={item.label}
                  to={item.path}
                  onClick={onClose}
                  className={clsx(
                    "text-[16px] font-[500] transition-colors duration-200 py-[8px] relative",
                    isActive 
                      ? "text-[#2B3337]" 
                      : "text-[#2B3337]/70 hover:text-[#2B3337]"
                  )}
                >
                  <span className="flex items-center gap-[8px]">
                    {item.label}
                    {isActive && (
                      <div className="w-[6px] h-[6px] rounded-full bg-[#0E3616]" />
                    )}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
};
