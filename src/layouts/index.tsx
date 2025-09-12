import { Outlet } from "react-router-dom";
import Wallet from "@/sections/wallet";
import UserActions from "./user-actions";

export default function Layout() {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Video Background */}
      <video
        className="absolute inset-0 w-full h-full object-cover z-0"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="/bg.mp4" type="video/mp4" />
      </video>

      {/* Content Layer */}
      <div className="relative z-10 w-full h-full">
        <UserActions />
        <Outlet />
        <Wallet />
      </div>
    </div>
  );
}
