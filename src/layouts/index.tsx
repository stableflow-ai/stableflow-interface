import { Outlet } from "react-router-dom";
import { lazy, Suspense, useRef } from "react";
import UserActions from "./user-actions";
import { getLogo } from "@/utils/format/logo";
import PixelBlast from "@/components/pixel-blast";

// import useUpdateTxns from "@/hooks/use-update-txns";
// import SupportButton from "@/components/support-button";
// import { AuroraBackground } from "./bg";

const MaintenanceBanner = lazy(() => import("@/components/maintenance-banner"));
const Footer = lazy(() => import("./footer"));
const Wallet = lazy(() => import("@/sections/wallet"));

const LoadingSpinner = () => null;

export default function Layout() {
  const containerRef = useRef<HTMLDivElement>(null);

  // useUpdateTxns();

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 w-full h-full z-0 bg-white">
        <PixelBlast />
      </div>
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

        <Suspense fallback={<LoadingSpinner />}>
          <Footer containerRef={containerRef} />
        </Suspense>
      </div>
    </div>
  );
}
