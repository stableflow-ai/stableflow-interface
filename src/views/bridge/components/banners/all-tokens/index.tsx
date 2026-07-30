import { IS_PRODUCTION } from "@/config/api";

const X_URL = IS_PRODUCTION
  ? "https://x.stableflow.ai"
  : "https://test.x.stableflow.ai";

const AllTokens = () => {
  return (
    <div className="mt-7.5 flex justify-center items-center">
      <a
        href={X_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between w-full md:w-[472px] h-[46px] px-4 md:px-4 rounded-lg bg-cover bg-center bg-no-repeat duration-150 hover:opacity-80"
        style={{ backgroundImage: "url('/bridge/banners/all-tokens.png')" }}
      >
        <span className="text-white text-sm font-medium leading-[1.5] whitespace-nowrap">
          Transfer from mainly networks, all tokens.
        </span>
        <span className="shrink-0 w-[90px] h-[26px] rounded-md bg-white text-black text-xs font-medium flex justify-center items-center">
          Transfer Now
        </span>
      </a>
    </div>
  );
};

export default AllTokens;
