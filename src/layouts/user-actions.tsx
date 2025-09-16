import useWalletStore from "@/stores/use-wallet";
import ChainIcon from "./chain-icon";
import useWalletsStore from "@/stores/use-wallets";
import { useLocation, useNavigate } from "react-router-dom";
import { useHistoryStore } from "@/stores/use-history";
import { useMemo } from "react";
import MainTitle from "@/components/main-title";

export default function UserActions() {
  const walletStore = useWalletStore();
  const walletsStore = useWalletsStore();
  const navigate = useNavigate();
  const pathname = useLocation();

  const isHistory = useMemo(() => {
    return pathname.pathname === "/history";
  }, [pathname]);

  return (
    <div className="w-full absolute z-[9] pl-[6px] md:pl-0 pr-[10px] top-[14px] flex justify-between items-center gap-[10px]">
      <div className="shrink-0">
        <MainTitle className="!flex md:!hidden !w-[unset]" />
      </div>
      <div className="shrink-0">
        {!walletsStore.evm.account &&
          !walletsStore.sol.account &&
          !walletsStore.near.account ? (
          <button
            onClick={() => {
              walletStore.set({ showWallet: true });
            }}
            className="button px-[15px] md:px-[20px] py-[6px] md:py-[8px] bg-[#6284F5] rounded-[18px] text-[16px] text-white"
          >
            Connect
          </button>
        ) : (
          <div className="flex items-center gap-[14px]">
            {
              !isHistory && (
                <HistoryButton
                  onClick={() => {
                    navigate("/history");
                  }}
                />
              )
            }
            <ChainsButton
              onClick={() => {
                walletStore.set({ showWallet: true });
              }}
              evmConnected={!!walletsStore.evm.account}
              solConnected={!!walletsStore.sol.account}
              nearConnected={!!walletsStore.near.account}
              tronConnected={!!walletsStore.tron.account}
            />
          </div>
        )}
      </div>
    </div>
  );
}

const HistoryButton = ({ onClick }: any) => {
  const pendingNumber = useHistoryStore((state) => state.pendingStatus.length);
  return (
    <button
      onClick={onClick}
      className="button px-[15px] md:px-[18px] h-[36px] flex justify-center items-center text-[14px] gap-[8px] rounded-[18px] bg-white shadow-[0_0_6px_0_rgba(0,0,0,0.10)]"
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
          <span className="text-[#444C59] hidden md:block">History</span>
        </>
      )}
    </button>
  );
};

const ChainsButton = ({
  onClick,
  evmConnected,
  solConnected,
  nearConnected,
  tronConnected
}: any) => {
  return (
    <button
      onClick={onClick}
      className="p-[6px] flex justify-center items-center button rounded-[18px] bg-white shadow-[0_0_6px_0_rgba(0,0,0,0.10)]"
    >
      <ChainIcon chain="evm" connected={evmConnected} />
      <ChainIcon chain="sol" connected={solConnected} className="ml-[-8px]" />
      <ChainIcon chain="near" connected={nearConnected} className="ml-[-8px]" />
      <ChainIcon chain="tron" connected={tronConnected} className="ml-[-8px]" />
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
