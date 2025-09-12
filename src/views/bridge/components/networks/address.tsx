import useWalletsStore, { type WalletType } from "@/stores/use-wallets";
import metamask from "@/assets/metamask.png";
import { formatAddress } from "@/utils/format/address";
import { useState } from "react";
import useBridgeStore from "@/stores/use-bridge";

export default function Address({ token, isTo }: any) {
  if (!token?.chainType)
    return <div className="w-[38px] h-[12px] rounded-[6px] bg-[#EDF0F7]" />;
  return <WithChain token={token} isTo={isTo} />;
}

const WithChain = ({ token, isTo }: any) => {
  const wallet = useWalletsStore()[token.chainType as WalletType];

  if (!wallet.account)
    return (
      <div
        className="text-[12px] text-[#0E3616] button"
        onClick={() => {
          wallet.connect();
        }}
      >
        Connect {token.chainName} wallet
      </div>
    );
  return <WithAccount token={token} wallet={wallet} isTo={isTo} />;
};

const WithAccount = ({ token, wallet, isTo }: any) => {
  const [edit, setEdit] = useState(false);
  const bridgeStore = useBridgeStore();
  return (
    <div className="flex items-center gap-[8px]">
      {edit ? (
        <input
          type="text"
          className="text-[12px] font-[500] text-[#444C59] outline-none px-[14px]"
          placeholder="Paste here"
          autoFocus
          value={bridgeStore.recipientAddress}
          onChange={(e) => {
            bridgeStore.set({ recipientAddress: e.target.value });
          }}
        />
      ) : (
        <>
          {token.chainType === "evm" ? (
            <img className="w-[12px] h-[12px]" src={metamask} />
          ) : (
            wallet.walletIcon && (
              <img className="w-[12px] h-[12px]" src={wallet.walletIcon} />
            )
          )}
          <span className="text-[14px] font-[500]">
            {formatAddress(wallet.account, 5, 4)}
          </span>
        </>
      )}
      {isTo &&
        (edit ? (
          <button
            className="button text-[#444C59] text-[12px] underline duration-300"
            onClick={() => {
              setEdit(false);
              bridgeStore.set({ recipientAddress: "" });
            }}
          >
            Cancel
          </button>
        ) : (
          <EditButton onClick={() => setEdit(true)} />
        ))}
    </div>
  );
};

const EditButton = ({ onClick }: any) => {
  return (
    <button
      className={"button text-[#B3BBCE] hover:text-[#6284F5] duration-300"}
      onClick={onClick}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
      >
        <path
          d="M11.1429 10.3099H0.857143C0.342857 10.3099 0 10.6479 0 11.1549C0 11.662 0.342857 12 0.857143 12H11.1429C11.6571 12 12 11.662 12 11.1549C12 10.6479 11.6571 10.3099 11.1429 10.3099ZM1.71429 9.46479H4.28571C4.54286 9.46479 4.71429 9.38028 4.88571 9.21127L9.68571 4.47887C10.2 3.97183 10.4571 3.38028 10.4571 2.70423C10.4571 2.02817 10.2 1.43662 9.68571 0.929578L9.51429 0.760563C9 0.253521 8.4 0 7.71429 0C7.02857 0 6.42857 0.253521 5.91429 0.760563L1.11429 5.49296C0.942857 5.66197 0.857143 5.83099 0.857143 6.08451V8.61972C0.857143 9.12676 1.2 9.46479 1.71429 9.46479ZM2.57143 6.42254L7.11429 1.94366C7.28571 1.77465 7.45714 1.69014 7.71429 1.69014C7.97143 1.69014 8.14286 1.77465 8.31429 1.94366L8.48571 2.11268C8.65714 2.28169 8.74286 2.4507 8.74286 2.70423C8.74286 2.95775 8.65714 3.12676 8.48571 3.29577L3.94286 7.77465H2.57143V6.42254Z"
          fill="currentColor"
        />
      </svg>
    </button>
  );
};
