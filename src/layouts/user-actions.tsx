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
import NavigationMenu, { HyperliquidDeposit, menuItems } from "@/components/navigation-menu";
import { useTrack } from "@/hooks/use-track";
import { getStableflowIcon } from "@/utils/format/logo";
import Social from "@/components/social";

export default function UserActions() {
  const walletStore = useWalletStore();
  const walletsStore = useWalletsStore();
  const navigate = useNavigate();
  const pathname = useLocation();
  const isMobile = useIsMobile();
  const historyStore = useHistoryStore();
  const { addHistory } = useTrack();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isHistory = useMemo(() => {
    return pathname.pathname === "/history";
  }, [pathname]);

  const isOverview = useMemo(() => {
    return pathname.pathname === "/overview";
  }, [pathname]);

  const hideActions = useMemo(() => {
    const regs = [
      /^\/developer/,
      /^\/learn-more/
    ];
    return regs.some((reg) => reg.test(pathname.pathname));
  }, [pathname]);

  return (
    <>
      <div className="w-full absolute z-9 pl-1.5 md:pl-5 pr-2.5 top-4 flex justify-between items-center gap-2.5">
        <NavigationMenu />
        <div className="shrink-0 flex items-center gap-2">
          {!hideActions ? (
            <>
              {!walletsStore.evm.account &&
                !walletsStore.sol.account &&
                !walletsStore.near.account &&
                !walletsStore.tron.account ? (
                <button
                  onClick={() => {
                    walletStore.set({ showWallet: true });
                  }}
                  className="button px-3.5 md:px-5 py-1.5 md:py-2 bg-[#6284F5] rounded-4.5 text-base text-white"
                >
                  Connect
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  {!isHistory && !isOverview && (
                    <HistoryButton
                      onClick={() => {
                        addHistory({ type: "click" });
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
          ) : (
            <div className="h-9.5"></div>
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
  const pendingNumber = useHistoryStore((state) => state.pendingNumber);
  return (
    <>
      <button
        onClick={onClick}
        className="flex md:hidden relative button px-3 md:px-4.5 h-9.5 md:h-9 justify-center items-center text-[14px] gap-2 rounded-[19px] md:rounded-[18px] bg-white shadow-[0_0_6px_0_rgba(0,0,0,0.10)]"
      >
        <img
          src={getStableflowIcon("icon-records.svg")}
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
              src={getStableflowIcon("icon-records.svg")}
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
        <div className="flex justify-between items-center px-4 pt-5">
          <HyperliquidDeposit className="" />
          {/* Close button inside drawer */}
          <button
            onClick={onClose}
            className="w-[38px] h-[38px] flex justify-center items-center button rounded-[19px] bg-white shadow-[0_0_6px_0_rgba(0,0,0,0.10)]"
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
        </div>

        <div className="pt-4 pb-5 px-5">
          <nav className="flex flex-col gap-0.5">
            {menuItems.map((item, index) => {
              if (typeof item.path !== "string") {
                return (
                  <div className="flex flex-col gap-0.5">
                    <div className="flex flex-col gap-0.5">
                      {
                        item.children.map((child, index) => {
                          const isActive = location.pathname.startsWith(child.path);
                          return (
                            <Link
                              key={index}
                              to={child.path}
                              target={child.isExternal ? "_blank" : undefined}
                              className={clsx(
                                "w-full h-11 px-2 rounded-lg text-base text-[#444C59] font-['SpaceGrotesk'] flex justify-between items-center gap-2 font-normal hover:bg-[#F5F7FD] duration-150 cursor-pointer",
                                isActive ? "bg-[#F5F7FD]" : "bg-white",
                              )}
                              onClick={onClose}
                            >
                              {child.label}
                              {
                                child.isExternal && (
                                  <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 11 11" fill="none">
                                    <path d="M3.83333 0.5H2.5C1.39543 0.5 0.5 1.39543 0.5 2.5V8.5C0.5 9.60457 1.39543 10.5 2.5 10.5H8.5C9.60457 10.5 10.5 9.60457 10.5 8.5V7M4.5 6.81579L10.5 0.5M10.5 0.5H6.5M10.5 0.5V4.5" stroke="#9FA7BA" stroke-linecap="round" stroke-linejoin="round" />
                                  </svg>
                                )
                              }
                            </Link>
                          );
                        })
                      }
                    </div>
                    <div className="border-t border-[#F2F2F2] mt-0.5 pt-3.5 px-2">
                      <div className="">
                        Social
                      </div>
                      <Social className="gap-2.5! mt-3" />
                    </div>
                  </div>
                )
              }

              const isActive = item.path === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(item.path);

              if (item.isExternal) {
                return (
                  <a
                    key={index}
                    href={item.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={onClose}
                    className={clsx(
                      "text-base font-normal text-[#444C59] hover:text-black transition-colors duration-200 h-11 flex items-center px-2",
                      isActive ? "bg-[#F5F7FD]" : "bg-white",
                    )}
                  >
                    {item.label}
                  </a>
                );
              }

              return (
                <Link
                  key={index}
                  to={item.path}
                  onClick={onClose}
                  className={clsx(
                    "text-base font-normal text-[#444C59] hover:text-black transition-colors duration-200 h-11 relative flex items-center px-2",
                    isActive ? "bg-[#F5F7FD]" : "bg-white",
                  )}
                >
                  <span className="flex items-center gap-[8px]">
                    {item.label}
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
