import useWalletStore from "@/stores/use-wallet";
import ChainIcon from "./chain-icon";
import useWalletsStore from "@/stores/use-wallets";

export default function UserActions() {
  const walletStore = useWalletStore();
  const walletsStore = useWalletsStore();

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
          <HistoryButton onClick={() => {}} />
          <ChainsButton
            onClick={() => {
              walletStore.set({ showWallet: true });
            }}
            evmConnected={!!walletsStore.evm.account}
            solConnected={!!walletsStore.sol.account}
            nearConnected={!!walletsStore.near.account}
          />
        </div>
      )}
    </div>
  );
}

const HistoryButton = ({ onClick }: any) => {
  return (
    <button
      onClick={onClick}
      className="w-[106px] h-[36px] flex justify-center items-center gap-[8px] rounded-[18px] bg-white shadow-[0_0_6px_0_rgba(0,0,0,0.10)]"
    >
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
      <span className="text-[14px] text-[#444C59]">History</span>
    </button>
  );
};

const ChainsButton = ({
  onClick,
  evmConnected,
  solConnected,
  nearConnected
}: any) => {
  return (
    <button
      onClick={onClick}
      className="p-[6px] flex justify-center items-center button rounded-[18px] bg-white shadow-[0_0_6px_0_rgba(0,0,0,0.10)]"
    >
      <ChainIcon chain="evm" connected={evmConnected} />
      <ChainIcon chain="sol" connected={solConnected} className="ml-[-8px]" />
      <ChainIcon
        chain="near"
        connected={nearConnected}
        className="ml-[-8px] mr-[10px]"
      />
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="10"
        height="5"
        viewBox="0 0 10 5"
        fill="none"
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
