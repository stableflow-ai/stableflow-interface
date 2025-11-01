import useWalletStore from "@/stores/use-wallet";
import ChainIcon from "./chain-icon";
import useWalletsStore, { type WalletType } from "@/stores/use-wallets";
import { useLocation, useNavigate } from "react-router-dom";
import { useHistoryStore } from "@/stores/use-history";
import { useMemo } from "react";
import MainTitle from "@/components/main-title";
import useIsMobile from "@/hooks/use-is-mobile";
import { stablecoinWithChains } from "@/config/tokens";
import clsx from "clsx";
import NavigationMenu from "@/components/navigation-menu";

export default function UserActions() {
  const walletStore = useWalletStore();
  const walletsStore = useWalletsStore();
  const navigate = useNavigate();
  const pathname = useLocation();
  const isMobile = useIsMobile();
  const historyStore = useHistoryStore();

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
    <div className="w-full absolute z-[9] pl-[6px] md:pl-0 pr-[10px] top-[14px] flex justify-between items-center gap-[10px]">
      <div className="flex items-center gap-[32px] md:gap-[48px]">
        <div className="shrink-0">
          <MainTitle className="!flex md:!hidden !w-[unset]" />
        </div>
        <div className="hidden md:flex">
          <NavigationMenu />
        </div>
      </div>
      {!hideActions && (
        <div className="shrink-0">
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
                  hidden={false}
                />
              )}
              <ChainsButton
                onClick={() => {
                  walletStore.set({ showWallet: true });
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const HistoryButton = ({ onClick }: any) => {
  const pendingNumber = useHistoryStore((state) => state.pendingStatus.length);
  return (
    <>
      <button
        onClick={onClick}
        className="flex md:hidden relative button px-[10px] md:px-[18px] h-[32px] md:h-[36px] justify-center items-center text-[14px] gap-[8px] rounded-[18px] bg-white shadow-[0_0_6px_0_rgba(0,0,0,0.10)]"
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
          <path d="M3 3v18h18"/>
          <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/>
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
          <path d="M3 3v18h18"/>
          <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/>
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

  return (
    <button
      onClick={onClick}
      className="p-[6px] flex justify-center items-center button rounded-[18px] bg-white shadow-[0_0_6px_0_rgba(0,0,0,0.10)]"
    >
      {
        Object.entries(stablecoinWithChains).map(([chain, _tokens], index) => {
          return (
            <ChainIcon
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
