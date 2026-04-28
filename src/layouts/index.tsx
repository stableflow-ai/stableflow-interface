import { Outlet, useLocation } from "react-router-dom";
import { lazy, Suspense, useRef } from "react";
import UserActions from "./user-actions";

// import useUpdateTxns from "@/hooks/use-update-txns";
// import SupportButton from "@/components/support-button";
// import { AuroraBackground } from "./bg";

const MaintenanceBanner = lazy(() => import("@/components/maintenance-banner"));
const Footer = lazy(() => import("./footer"));
const Footer2 = lazy(() => import("./footer2"));
const Wallet = lazy(() => import("@/sections/wallet"));
const PixelBlast = lazy(() => import("@/components/pixel-blast"));

const LoadingSpinner = () => null;

export default function Layout() {
  const containerRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const isFooter2 = [/^\/ecosystem$/].some((reg) => reg.test(location.pathname));
  const isHomePage = location.pathname === "/";

  // useUpdateTxns();

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#F6F8FC]">
      {/* Video Background */}
      {
        isHomePage && (
          <div className="absolute inset-0 w-full h-full z-0">
            <Suspense fallback={<LoadingSpinner />}>
              <PixelBlast />
            </Suspense>
          </div>
        )
      }
      {/* <AuroraBackground /> */}

      {/* Maintenance Banner */}
      <Suspense fallback={<LoadingSpinner />}>
        <MaintenanceBanner />
      </Suspense>

      {/* Content Layer */}
      <div ref={containerRef} className="relative z-10 w-full h-full overflow-y-auto">
        <Suspense fallback={<LoadingSpinner />}>
          <UserActions />
        </Suspense>
        <Outlet />
        <Suspense fallback={<LoadingSpinner />}>
          <Wallet />
        </Suspense>

        {
          isFooter2 ? (
            <Suspense fallback={<LoadingSpinner />}>
              <Footer2 />
            </Suspense>
          ) : (
            <Suspense fallback={<LoadingSpinner />}>
              <Footer containerRef={containerRef} />
            </Suspense>
          )
        }
      </div>
    </div>
  );
}
