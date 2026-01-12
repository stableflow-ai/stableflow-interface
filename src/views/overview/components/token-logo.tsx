import chains from "@/config/chains";
import { stablecoinLogoMap } from "@/config/tokens";
import { getTokenLogo } from "@/utils/format/logo";
import clsx from "clsx";

const TokenLogo = (props: any) => {
  const { symbol, chain, className } = props;

  return (
    <div
      className={clsx("relative shrink-0 w-[20px] h-[20px] bg-center bg-contain bg-no-repeat", className)}
      style={{
        backgroundImage: `url(${stablecoinLogoMap[symbol] || getTokenLogo(symbol)})`,
      }}
    >
      <img
        src={chains[chain]?.chainIcon}
        alt=""
        className="absolute bottom-[-2px] right-[-4px] w-[60%] h-[60%] shrink-0 object-center object-contain"
      />
    </div>
  );
};

export default TokenLogo;
