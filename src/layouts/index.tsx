import { Outlet } from "react-router-dom";
import Wallet from "@/sections/wallet";
import UserActions from "./user-actions";
// import useUpdateTxns from "@/hooks/use-update-txns";
import ZendeskWidget from "@/components/zendesk-widget";
import { lazy, Suspense } from "react";
// import SupportButton from "@/components/support-button";
// import { AuroraBackground } from "./bg";

const MaintenanceBanner = lazy(() => import("@/components/maintenance-banner"));

export default function Layout() {
  // useUpdateTxns();
  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 w-full h-full z-0 bg-white">
        <video
          className="w-full h-full object-cover opacity-40"
          autoPlay
          muted
          loop
          playsInline
          preload="none"
        >
          <source src="/bg.mp4" type="video/mp4" />
        </video>
      </div>
      {/* <AuroraBackground /> */}

      {/* Maintenance Banner */}
      <Suspense fallback={null}>
        <MaintenanceBanner />
      </Suspense>

      {/* Content Layer */}
      <div className="relative z-10 w-full h-full overflow-y-auto">
        <UserActions />
        <Outlet />
        <Wallet />
      </div>

      {/* Zendesk Customer Support Widget */}
      <ZendeskWidget />
    </div>
  );
}
