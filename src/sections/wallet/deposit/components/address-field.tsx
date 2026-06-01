import DestinationAddress from "@/views/bridge/components/networks/destination-address";
import EditButton from "@/views/bridge/components/networks/edit-button";
import useWalletsStore, { type WalletType } from "@/stores/use-wallets";
import { useDepositStore } from "@/stores/use-deposit";
import {
  getAddressPlaceholder,
  validateAddress,
} from "@/utils/address-validation";
import { useEffect, useMemo, useState } from "react";

export default function AddressField() {
  const depositStore = useDepositStore();
  const walletsStore = useWalletsStore();
  const token = depositStore.token;
  const [isEditing, setIsEditing] = useState(false);

  const wallet = useMemo(() => {
    if (!token?.chainType) return null;
    return walletsStore[token.chainType as WalletType];
  }, [walletsStore, token?.chainType]);

  const isConnected = !!wallet?.account;

  const addressValidation = useMemo(() => {
    if (!token?.chainType) {
      return { isValid: false, error: "Select a network" };
    }
    return validateAddress(depositStore.recipientAddress, token.chainType);
  }, [depositStore.recipientAddress, token?.chainType]);

  useEffect(() => {
    if (!token || isEditing) return;

    if (isConnected && wallet?.account) {
      depositStore.setRecipientAddress(wallet.account);
      setIsEditing(false);
    }
  }, [token?.blockchain, token?.chainType, isConnected, wallet?.account, isEditing]);

  useEffect(() => {
    setIsEditing(!isConnected);
  }, [token?.blockchain, isConnected]);

  if (!token) return null;

  const placeholder = getAddressPlaceholder(token.chainType);

  const handleConnect = (e: React.MouseEvent) => {
    e.stopPropagation();
    wallet?.connect?.();
  };

  if (!isConnected) {
    return (
      <div>
        <div className="text-[#9FA7BA] text-[14px] px-[4px] mb-[6px]">
          Recipient address
        </div>
        <div className="flex items-stretch gap-[8px]">
          <div className="flex-1 min-w-0 border border-[#EDF0F7] rounded-[12px] px-[10px] min-h-[40px] flex items-center">
            <input
              type="text"
              className="text-[14px] font-[500] text-[#444C59] outline-none w-full bg-transparent"
              placeholder={placeholder}
              value={depositStore.recipientAddress}
              onChange={(e) => depositStore.setRecipientAddress(e.target.value)}
            />
          </div>
          <button
            type="button"
            className="shrink-0 duration-300 cursor-pointer w-[90px] h-[40px] rounded-[16px] bg-white shadow-[0_2px_6px_0_rgba(0,0,0,0.10)] text-[14px] text-[#444C59] hover:bg-[#6284F5] hover:text-white button"
            onClick={handleConnect}
          >
            Connect
          </button>
        </div>
        {depositStore.recipientAddress && !addressValidation.isValid && (
          <p className="text-[12px] text-[#FF6A19] mt-[6px] px-[4px]">
            {addressValidation.error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="text-[#9FA7BA] text-[14px] px-[4px] mb-[6px]">
        Recipient address
      </div>
      <div className="border border-[#EDF0F7] rounded-[12px] p-[10px] min-h-[50px] flex items-center">
        {isEditing ? (
          <input
            type="text"
            className="text-[14px] font-[500] text-[#444C59] outline-none w-full bg-transparent"
            placeholder={placeholder}
            autoFocus
            value={depositStore.recipientAddress}
            onChange={(e) => depositStore.setRecipientAddress(e.target.value)}
          />
        ) : (
          <div className="flex justify-between items-center w-full gap-[8px]">
            {depositStore.recipientAddress ? (
              <DestinationAddress
                isError={!addressValidation.isValid}
                address={depositStore.recipientAddress}
                onClick={() => {
                  depositStore.setRecipientAddress("");
                  setIsEditing(true);
                }}
              />
            ) : (
              <span className="text-[12px] text-[#9FA7BA]">{placeholder}</span>
            )}
            <EditButton token={token} onClick={() => setIsEditing(true)} />
          </div>
        )}
      </div>
      {depositStore.recipientAddress && !addressValidation.isValid && (
        <p className="text-[12px] text-[#FF6A19] mt-[6px] px-[4px]">
          {addressValidation.error}
        </p>
      )}
      {isEditing && (
        <button
          type="button"
          className="button text-[#444C59] text-[12px] underline mt-[6px] px-[4px]"
          onClick={() => {
            setIsEditing(false);
            if (wallet?.account) {
              depositStore.setRecipientAddress(wallet.account);
            }
          }}
        >
          Use connected wallet
        </button>
      )}
    </div>
  );
}

export function useDepositAddressValidation() {
  const depositStore = useDepositStore();
  const token = depositStore.token;

  return useMemo(() => {
    if (!token?.chainType) {
      return { isValid: false, error: "Select a network" };
    }
    return validateAddress(depositStore.recipientAddress, token.chainType);
  }, [depositStore.recipientAddress, token?.chainType]);
}
