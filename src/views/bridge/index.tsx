import ConnectWallet from "@/components/connect-wallet";

const buttonProps = {
  className: "w-[100px] h-[40px]",
  isPrimary: false
};

export default function Bridge() {
  return (
    <div>
      <ConnectWallet type="evm" buttonProps={buttonProps} />
      <ConnectWallet type="solana" buttonProps={buttonProps} />
      <ConnectWallet type="near" buttonProps={buttonProps} />
    </div>
  );
}
