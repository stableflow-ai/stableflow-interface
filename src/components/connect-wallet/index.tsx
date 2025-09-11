import { ConnectButton } from "@rainbow-me/rainbowkit";
import Button from "../button";
import SolanaConnectWallet from "./solana";
import useWalletsStore from "@/stores/use-wallets";

export default function ConnectWallet({
  type,
  buttonProps
}: {
  type: "evm" | "solana" | "near";
  buttonProps: any;
}) {
  const wallets = useWalletsStore();
  if (type === "evm") {
    return wallets.evm?.account ? (
      <div>{wallets.evm.account}</div>
    ) : (
      <ConnectButton showBalance={false} />
    );
  }
  if (type === "solana") {
    return <SolanaConnectWallet account={wallets.sol?.account} />;
  }
  return wallets.near?.account ? (
    <div>{wallets.near.account}</div>
  ) : (
    <Button
      {...buttonProps}
      onClick={() => {
        wallets.near.connect();
      }}
    >
      Connect Wallet
    </Button>
  );
}
