import useEvmBalances from "@/hooks/use-evm-balances";
import { useDepositStore } from "@/stores/use-deposit";
import AddressField, { useDepositAddressValidation } from "./components/address-field";
import NetworkSelector from "./components/network-selector";
import TokenSelector from "./components/token-selector";

const Deposit2Wallet = () => {
  const depositStore = useDepositStore();
  const addressValidation = useDepositAddressValidation();
  const { loading: evmBalancesLoading } = useEvmBalances(
    depositStore.visible,
    depositStore.token?.symbol
  );

  const canConfirm =
    !!depositStore.token &&
    !!depositStore.recipientAddress.trim() &&
    addressValidation.isValid;

  return (
    <div className="flex flex-col gap-[16px]">
      <TokenSelector balancesLoading={evmBalancesLoading} />
      <NetworkSelector evmBalancesLoading={evmBalancesLoading} />
      <AddressField />
      <button
        type="button"
        disabled={!canConfirm}
        className="w-full h-[40px] cursor-pointer rounded-[16px] bg-[#6284F5] shadow-[0_2px_6px_0_rgba(0,0,0,0.10)] text-[14px] text-white hover:opacity-80 duration-150 disabled:opacity-40 disabled:cursor-not-allowed mt-[4px]"
        onClick={() => depositStore.setStep("qrcode")}
      >
        Confirm
      </button>
    </div>
  );
};

export default Deposit2Wallet;
