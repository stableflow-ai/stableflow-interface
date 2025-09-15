import useWalletStore from "@/stores/use-wallet";
import ChainIcon from "./chain-icon";
import useWalletsStore from "@/stores/use-wallets";
import { useNavigate } from "react-router-dom";
import { useHistoryStore } from "@/stores/use-history";

export default function UserActions() {
  const walletStore = useWalletStore();
  const walletsStore = useWalletsStore();
  const navigate = useNavigate();

  return (
    <div className="absolute right-[14px] top-[14px]">
      {!walletsStore.evm.account &&
      !walletsStore.sol.account &&
      !walletsStore.near.account ? (
        <button
          onClick={() => {
            walletStore.set({ showWallet: true });
          }}
          className="button  px-[20px] py-[8px] bg-[#6284F5] rounded-[18px] text-[16px] text-white"
        >
          Connect
        </button>
      ) : (
        <div className="flex items-center gap-[14px]">
          <HistoryButton
            onClick={() => {
              navigate("/history");
            }}
          />
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
  );
}

const HistoryButton = ({ onClick }: any) => {
  const pendingNumber = useHistoryStore((state) => state.pendingStatus.length);
  return (
    <button
      onClick={onClick}
      className="button w-[106px] h-[36px] flex justify-center items-center text-[14px] gap-[8px] rounded-[18px] bg-white shadow-[0_0_6px_0_rgba(0,0,0,0.10)]"
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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="16"
            viewBox="0 0 14 16"
            fill="none"
          >
            <path
              d="M4.85714 1V4.0625M9.57143 1V4.0625M4 6.6875H10M4 10.625H7.85714M3 15H11C12.1046 15 13 14.1046 13 13V4.75C13 3.64543 12.1046 2.75 11 2.75H3C1.89543 2.75 1 3.64543 1 4.75V13C1 14.1046 1.89543 15 3 15Z"
              stroke="#B3BBCE"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
          <span className="text-[#444C59]">History</span>
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
