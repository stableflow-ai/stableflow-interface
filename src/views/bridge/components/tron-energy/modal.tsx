import Modal from "@/components/modal";
import TronEnergy from "./index";
import useBridgeStore from "@/stores/use-bridge";

const TronEnergyModal = (props: any) => {
  const { } = props;

  const bridgeStore = useBridgeStore();
  const { tronTransferVisible, setTronTransferVisible } = bridgeStore;

  const handleClose = () => {
    setTronTransferVisible(false);
    bridgeStore.set({ transferring: false });
  };

  return (
    <Modal
      open={tronTransferVisible}
      onClose={handleClose}
      isMaskClose={false}
      className="backdrop-blur-sm"
    >
      <div className="relative text-card-foreground flex flex-col gap-4 md:gap-6 py-4 md:py-6 w-full max-w-md bg-white border border-[#f2f2f2] rounded-b-none md:rounded-b-xl rounded-xl shadow-[0px_2px_6px_0px_rgba(0,0,0,0.1)]">
        {/* <button
          type="button"
          className="absolute top-4 right-4 cursor-pointer p-2 opacity-70 hover:opacity-100 transition-all"
          onClick={handleClose}
        >
          <img
            src="/icon-x.svg"
            className="w-3 h-3 shrink-0"
          />
        </button> */}
        <TronEnergy onClose={handleClose} />
      </div>
    </Modal>
  );
};

export default TronEnergyModal;
