import { IS_PRODUCTION } from "@/config/api";
import { getStableflowIcon } from "@/utils/format/logo";
import clsx from "clsx";

const X_URL = IS_PRODUCTION
  ? "https://x.stableflow.ai"
  : "https://test.x.stableflow.ai";

type TransferAllTokensLinkProps = {
  isRoutes?: boolean;
};

const TransferAllTokensLink = ({ isRoutes = false }: TransferAllTokensLinkProps) => {
  return (
    <a
      href={X_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={clsx(
        "flex items-center gap-1 text-[#444C59] text-sm font-normal leading-none underline hover:opacity-80 duration-150",
        isRoutes
          ? "mt-[50px] md:fixed md:left-1/2 md:-translate-x-1/2 md:bottom-[20px] md:mt-0 md:z-12"
          : "fixed left-1/2 -translate-x-1/2 bottom-[80px] md:bottom-[20px] z-12",
      )}
    >
      Transfer all tokens
      <img
        src={getStableflowIcon("icon-arrow-right-up.svg")}
        alt=""
        className="w-[7px] h-[7px] object-contain shrink-0"
      />
    </a>
  );
};

export default TransferAllTokensLink;
