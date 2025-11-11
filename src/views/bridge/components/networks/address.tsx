import useWalletsStore, { type WalletType } from "@/stores/use-wallets";
import metamask from "@/assets/metamask.png";
import { formatAddress } from "@/utils/format/address";
import { useState } from "react";
import useBridgeStore from "@/stores/use-bridge";
import Popover from "@/components/popover";
import clsx from "clsx";

export default function Address({ token, isTo, addressValidation }: any) {
  if (!token?.chainType)
    return <div className="w-[38px] h-[12px] rounded-[6px] bg-[#EDF0F7]" />;
  return (
    <WithChain
      token={token}
      isTo={isTo}
      addressValidation={addressValidation}
    />
  );
}

const WithChain = ({ token, isTo, addressValidation }: any) => {
  const wallet = useWalletsStore()[token.chainType as WalletType];

  if (!wallet.account && !isTo)
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
  return (
    <WithAccount
      token={token}
      wallet={wallet}
      isTo={isTo}
      addressValidation={addressValidation}
    />
  );
};

const WithAccount = ({ token, wallet, isTo, addressValidation }: any) => {
  const [edit, setEdit] = useState(false);
  const bridgeStore = useBridgeStore();
  return (
    <div
      className={clsx(
        "flex items-center gap-[8px] w-full md:w-[unset]",
        isTo ? "justify-end" : "justify-start",
      )}
    >
      {edit ? (
        <input
          type="text"
          className="text-[12px] font-[500] text-[#444C59] outline-none px-[5px] md:px-[14px] flex-1 w-0 md:w-[unset]"
          placeholder="Paste here"
          autoFocus
          value={bridgeStore.recipientAddress}
          onChange={(e) => {
            bridgeStore.set({ recipientAddress: e.target.value });
          }}
          onBlur={() => {
            setEdit(false);
          }}
        />
      ) : bridgeStore.recipientAddress && !!addressValidation ? (
        <ValidateAddress
          isError={!addressValidation.isValid}
          address={bridgeStore.recipientAddress}
          onClick={() => {
            bridgeStore.set({ recipientAddress: "" });
            setEdit(true);
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
          <span className="text-[12px] text-[#0E3616] font-[400]">
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
          !(bridgeStore.recipientAddress && !!addressValidation) && (
            <Popover
              content={
                <div className="w-[142px] h-[42px] text-[14px] text-center leading-[42px] rounded-[8px] bg-white shadow-[0_0_6px_0_rgba(0,0,0,0.10)]">
                  Custom Address
                </div>
              }
              placement="Top"
              trigger="Hover"
            >
              <EditButton onClick={() => setEdit(true)} />
            </Popover>
          )
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

const ValidateAddress = ({ isError, address, onClick }: any) => {
  return (
    <div className="flex items-center">
      {isError ? (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <rect opacity="0.2" width="14" height="14" rx="4" fill="#FF6A19" />
          <path
            d="M7 4V7"
            stroke="#FF6A19"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <circle cx="7" cy="10" r="1" fill="#FF6A19" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
        >
          <rect opacity="0.2" width="14" height="14" rx="4" fill="#4DCF5E" />
          <path
            d="M4 7L6 9L10 5"
            stroke="#4DCF5E"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      )}
      <span
        className={clsx(
          "text-[12px] font-[400] ml-[6px] mr-[2px]",
          isError ? "text-[#FF6A19]" : "text-[#444C59]"
        )}
      >
        {formatAddress(address, 12, 10)}
      </span>
      <button className="button p-[2px]" onClick={onClick}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
        >
          <circle cx="6" cy="6" r="5.2" stroke="#B3BBCE" strokeWidth="1.6" />
          <path
            d="M3.5 6H8.5"
            stroke="#B3BBCE"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
};
