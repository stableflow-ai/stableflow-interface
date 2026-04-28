import { Link, useLocation } from "react-router-dom";
import clsx from "clsx";
import { useTrack } from "@/hooks/use-track";
import { getStableflowLogo } from "@/utils/format/logo";
import Popover from "./popover";
import { lazy, Suspense, useRef } from "react";

const Social = lazy(() => import("@/components/social"));

export const menuItems = [
  {
    label: "Transfer",
    path: "/",
    isExternal: false,
  },
  {
    label: "Ecosystem",
    path: "/ecosystem",
    isExternal: false,
  },
  {
    label: "More",
    path: false,
    isExternal: false,
    children: [
      {
        label: "About",
        path: "/about",
        isExternal: false,
      },
      {
        label: "Developer",
        path: "/developer",
        isExternal: false,
      },
      {
        label: "Docs",
        path: "https://docs.stableflow.ai/",
        isExternal: true,
      },
      {
        label: "Explorer",
        path: "https://github.com/stableflow-ai/stableflow-interface",
        isExternal: true,
      },
      {
        label: "Bug Bounty",
        path: "https://github.com/stableflow-ai/stableflow-interface/issues",
        isExternal: true,
      },
    ],
  }
];

export default function NavigationMenu() {
  const location = useLocation();

  const popoverRef = useRef<any>(null);

  return (
    <nav className="flex items-center gap-6 md:gap-7.5">
      <Link to="/" className="shrink-0 flex items-center">
        <img
          src={getStableflowLogo("logo-stableflow-full.svg")}
          alt="StableFlow"
          className="w-33.5 h-8 md:h-8"
        />
      </Link>
      <div className="hidden md:flex items-center gap-6 md:gap-8">
        {menuItems.map((item, index) => {
          if (typeof item.path !== "string") {
            return (
              <Popover
                key={index}
                ref={popoverRef}
                placement="Bottom"
                trigger="Hover"
                offset={14}
                content={(
                  <div className="w-53 bg-white shadow-[0_0_10px_0_rgba(0,0,0,0.10)] rounded-2xl pt-1.5 pb-5.5 font-normal text-base text-[#444C59] font-['SpaceGrotesk']">
                    <div className="px-1.5">
                      {item.children.map((child, index) => {
                        const isActive = location.pathname.startsWith(child.path);
                        return (
                          <Link
                            key={index}
                            to={child.path}
                            className={clsx(
                              "w-full h-11 rounded-lg flex justify-between items-center gap-2 px-3.5 hover:bg-[#F5F7FD] duration-150 cursor-pointer",
                              isActive ? "bg-[#F5F7FD]" : "bg-white",
                            )}
                            target={child.isExternal ? "_blank" : undefined}
                            onClick={() => popoverRef.current?.close()}
                          >
                            {child.label}
                            {
                              child.isExternal && (
                                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 11 11" fill="none">
                                  <path d="M3.83333 0.5H2.5C1.39543 0.5 0.5 1.39543 0.5 2.5V8.5C0.5 9.60457 1.39543 10.5 2.5 10.5H8.5C9.60457 10.5 10.5 9.60457 10.5 8.5V7M4.5 6.81579L10.5 0.5M10.5 0.5H6.5M10.5 0.5V4.5" stroke="#9FA7BA" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              )
                            }
                          </Link>
                        );
                      })}
                    </div>
                    <div className="border-t border-[#F2F2F2] mt-0.5 pt-3.5 px-5">
                      <div className="">
                        Social
                      </div>
                      <Suspense fallback={null}>
                        <Social className="gap-2.5! mt-3" />
                      </Suspense>
                    </div>
                  </div>
                )}
                triggerContainerClassName="flex justify-center items-center gap-1.5 group cursor-pointer"
              >
                <div className="text-[#444C59] text-sm font-normal font-['SpaceGrotesk'] group-hover:text-black group-hover:font-medium duration-150">
                  More
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="11"
                  height="5"
                  viewBox="0 0 11 5"
                  fill="none"
                  className="rotate-180 group-hover:rotate-0 duration-150"
                >
                  <path d="M0.5 4.5L5.67241 0.5L10.5 4.5" stroke="#444C59" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Popover>
            );
          }

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
                className={clsx(
                  "text-sm md:text-[15px] font-normal hover:text-black transition-colors duration-150",
                  isActive ? "text-black" : "text-[#444C59]",
                )}
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
                "text-[14px] md:text-[15px] hover:text-black font-normal transition-colors duration-150 relative",
                isActive ? "text-black" : "text-[#444C59]",
              )}
            >
              {item.label}
              {isActive && (
                <div className="w-7.5 mx-auto absolute -bottom-1 left-0 right-0 h-[2px] bg-[#0E3616] rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
      <HyperliquidDeposit />
    </nav>
  );
}

export const HyperliquidDeposit = (props: any) => {
  const { className } = props;

  const { addExternalLinkClick } = useTrack();

  return (
    <a
      href="https://deposit.stableflow.ai/"
      target="_blank"
      className={clsx(
        "hidden md:flex items-center gap-1 h-9 bg-white rounded-[20px] px-2.5 text-[#444C59] hover:text-black duration-150 font-[SpaceGrotesk] text-xs font-normal leading-[100%] shadow-[0_0_10px_0_rgba(0,0,0,0.10)] hover:shadow-[0_0_15px_0_rgba(0,0,0,0.20)] bg-[linear-gradient(90deg,_rgba(65,207,172,0.00)_0%,_rgba(65,207,172,0.50)_100%)]",
        className
      )}
      onClick={() => addExternalLinkClick({ link: "https://deposit.stableflow.ai/" })}
    >
      <span className="">
        Cheapest way to deposit
      </span>
      <img
        src={getStableflowLogo("/logo-hyperliquid.svg")}
        alt=""
        className="w-22 h-3 object-center object-contain shrink-0"
      />
      <span className="w-5 h-5 flex justify-center items-center bg-black rounded-full text-white">
        <svg width="5" height="8" viewBox="0 0 5 8" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 1L4 4.10345L1 7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </a>
  );
};
