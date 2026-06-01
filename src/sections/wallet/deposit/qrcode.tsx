import useCopy from "@/hooks/use-copy";
import { useDepositStore } from "@/stores/use-deposit";
import { formatAddress } from "@/utils/format/address";
import { QRCodeCanvas } from "qrcode.react";
import { useRef } from "react";
import { buildDepositQrValue, downloadQrCode } from "./utils";

const Deposit2WalletQrcode = () => {
  const depositStore = useDepositStore();
  const { onCopy } = useCopy();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const token = depositStore.token;
  const address = depositStore.recipientAddress;

  if (!token || !address) return null;

  const qrValue = buildDepositQrValue(token, address);
  const filename = `stableflow-deposit-${token.symbol}-${token.blockchain}.png`;

  const handleShare = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      downloadQrCode(canvas, filename);
    }
  };

  return (
    <div className="flex flex-col items-center gap-[16px]">
      <button
        type="button"
        className="self-start button text-[#444C59] text-[12px] flex items-center gap-[4px] hover:opacity-70"
        onClick={() => depositStore.setStep("form")}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="8"
          height="12"
          viewBox="0 0 8 12"
          fill="none"
        >
          <path
            d="M7 1L2 6L7 11"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Back
      </button>

      <div className="flex items-center gap-[8px]">
        <img
          src={token.icon}
          alt=""
          className="w-[24px] h-[24px] rounded-full"
        />
        <span className="text-[14px] font-[500] text-[#444C59]">
          {token.symbol} on {token.chainName}
        </span>
      </div>

      <div className="p-[12px] bg-white rounded-[12px] border border-[#EDF0F7]">
        <QRCodeCanvas
          ref={canvasRef}
          value={qrValue}
          size={220}
          level="M"
        />
      </div>

      <div className="w-full text-center">
        <p className="text-[12px] text-[#9FA7BA] mb-[4px]">Wallet address</p>
        <p className="text-[14px] font-[500] text-[#444C59] break-all px-[8px]">
          {formatAddress(address, 8, 8)}
        </p>
      </div>

      <div className="flex gap-[12px] w-full">
        <button
          type="button"
          className="flex-1 h-[36px] rounded-[16px] border border-[#EDF0F7] text-[14px] text-[#444C59] hover:bg-[#FAFBFF] duration-150 button"
          onClick={() => onCopy(address)}
        >
          Copy
        </button>
        <button
          type="button"
          className="flex-1 h-[36px] rounded-[16px] bg-[#6284F5] text-[14px] text-white hover:opacity-80 duration-150 button"
          onClick={handleShare}
        >
          Share
        </button>
      </div>

      <p className="text-[12px] text-[#9FA7BA] text-center leading-[150%]">
        Scan to send {token.symbol} on {token.chainName} to this address
      </p>
    </div>
  );
};

export default Deposit2WalletQrcode;
