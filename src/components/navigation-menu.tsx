import { Link, useLocation } from "react-router-dom";
import clsx from "clsx";

export const menuItems = [
  {
    label: "Transfer",
    path: "/",
    isExternal: false
  },
  {
    label: "Developer",
    path: "/developer",
    isExternal: false
  },
  {
    label: "Learn",
    path: "/learn-more",
    isExternal: false
  }
];

export default function NavigationMenu() {
  const location = useLocation();

  return (
    <nav className="flex items-center gap-[24px] md:gap-[32px]">
      <Link to="/" className="shrink-0 flex items-center">
        <img
          src="/logo.svg"
          alt="StableFlow"
          className="h-[20px] md:h-[24px] w-auto"
        />
      </Link>
      {menuItems.map((item, index) => {
        const isActive = item.path === "/"
          ? location.pathname === "/"
          : location.pathname.startsWith(item.path);

        if (item.isExternal) {
          return (
            <a
              key={index}
              href={item.path}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[14px] md:text-[15px] font-[500] text-[#2B3337]/70 hover:text-[#2B3337] transition-colors duration-200 pb-[4px]"
            >
              {item.label}
            </a>
          );
        }

        return (
          <Link
            key={index}
            to={item.path}
            className={clsx(
              "text-[14px] md:text-[15px] font-[500] transition-colors duration-200 relative pb-[4px]",
              isActive
                ? "text-[#2B3337]"
                : "text-[#2B3337]/70 hover:text-[#2B3337]"
            )}
          >
            {item.label}
            {isActive && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#0E3616] rounded-full" />
            )}
          </Link>
        );
      })}
      <HyperliquidDeposit />
    </nav>
  );
}

export const HyperliquidDeposit = (props: any) => {
  const { className } = props;

  return (
    <a
      href="https://deposit.stableflow.ai/"
      target="_blank"
      className={clsx(
        "flex items-center gap-1 h-9 rounded-[20px] px-2.5 text-[#444C59] hover:text-black duration-150 font-[SpaceGrotesk] text-xs font-normal leading-[100%] shadow-[0_0_10px_0_rgba(0,0,0,0.10)] hover:shadow-[0_0_15px_0_rgba(0,0,0,0.20)] bg-[linear-gradient(90deg,_rgba(65,207,172,0.00)_0%,_rgba(65,207,172,0.50)_100%)]",
        className
      )}
    >
      <span className="">
        Cheapest way to deposit
      </span>
      <img
        src="/logo-hyperliquid.svg"
        alt=""
        className="w-22 h-3 object-center object-contain shrink-0"
      />
      <span className="w-5 h-5 flex justify-center items-center bg-black rounded-full text-white">
        <svg width="5" height="8" viewBox="0 0 5 8" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 1L4 4.10345L1 7" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </span>
    </a>
  );
};
