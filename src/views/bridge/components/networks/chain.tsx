import clsx from "clsx";
import useWalletStore from "@/stores/use-wallet";

export default function Chain({ token, isTo }: any) {
  const walletStore = useWalletStore();
  const openWallet = () => {
    const params: Record<string, any> = {
      showWallet: true,
      isTo
    };
    if (walletStore.fromToken.symbol === "USDT") {
      params.usdtExpand = true;
      params.usdcExpand = false;
    }
    if (walletStore.fromToken.symbol === "USDC") {
      params.usdtExpand = false;
      params.usdcExpand = true;
    }

    walletStore.set(params);
  };
  if (!token?.chainType) {
    return (
      <div
        className={clsx(
          "button h-[100px] shrink-0 flex flex-col justify-center rounded-[13px] px-[14px] pt-[6px] hover:bg-[#FAFBFF] button duration-300",
          isTo ? "items-end" : "items-start"
        )}
        onClick={openWallet}
      >
        <div className="w-[50px] h-[50px] rounded-[12px] bg-[#EDF0F7]" />
        <div
          className={clsx(
            "text-[14px] text-[#9FA7BA] mt-[6px]",
            isTo && "text-right"
          )}
        >
          Select Network
        </div>
      </div>
    );
  }
  return <WithChain token={token} isTo={isTo} openWallet={openWallet} />;
}

const WithChain = ({ token, isTo, openWallet }: any) => {
  return (
    <div
      className={clsx(
        "button h-[100px] shrink-0 flex flex-col justify-center rounded-[13px] px-[14px] pt-[6px] hover:bg-[#FAFBFF] button duration-300",
        isTo ? "items-end" : "items-start"
      )}
      onClick={openWallet}
    >
      <img
        src={token.chainIcon}
        className="w-[50px] h-[50px] rounded-[12px] bg-[#EDF0F7]"
      />
      <div className="text-[14px] flex items-center gap-[8px] mt-[6px]">
        <div className="text-[#444C59]">{token.chainName}</div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="10"
          height="5"
          viewBox="0 0 10 5"
          fill="none"
        >
          <path
            d="M1 1L5.13793 4L9 1"
            stroke="#B3BBCE"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
};
