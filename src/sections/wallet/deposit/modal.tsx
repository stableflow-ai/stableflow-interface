import Modal from "@/components/modal";
import { useDepositStore } from "@/stores/use-deposit";
import clsx from "clsx";
import Deposit2Wallet from "./index";
import Deposit2WalletQrcode from "./qrcode";

const Deposit2WalletModal = () => {
  const { visible, step, closeModal } = useDepositStore();
  const title = step === "form" ? "Deposit" : "Scan to Deposit";

  return (
    <Modal open={visible} onClose={closeModal} isMaskClose={false}>
      <div
        className={clsx(
          "relative w-full max-h-[90vh] overflow-y-auto",
          "rounded-t-[20px] border border-[#F2F2F2] bg-white",
          "shadow-[0_2px_10px_rgba(0,0,0,0.08)]",
          "md:mx-4 md:max-w-[420px] md:rounded-xl",
          "px-[16px] pt-[16px] pb-[24px]"
        )}
      >
        <div className="flex justify-between items-center mb-[16px]">
          <span className="text-[18px] font-[500] text-black">{title}</span>
          <button
            type="button"
            className="button p-[4px] text-[#444C59] hover:opacity-70"
            aria-label="Close deposit modal"
            onClick={closeModal}
          >
            <svg viewBox="0 0 16 16" fill="none" className="size-4" aria-hidden>
              <path
                d="M1 1L15 15M15 1L1 15"
                stroke="currentColor"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {step === "form" ? <Deposit2Wallet /> : <Deposit2WalletQrcode />}
      </div>
    </Modal>
  );
};

export default Deposit2WalletModal;
