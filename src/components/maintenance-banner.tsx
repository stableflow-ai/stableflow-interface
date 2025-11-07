import dayjs from "@/libs/dayjs";
import { useState, useEffect } from "react";

const MaintenanceDuration = 60; // minutes
const MaintenanceStart = "2025-11-07T07:30:00Z";

export default function MaintenanceBanner() {
  const TEST_MODE = false;

  const [isVisible, setIsVisible] = useState(false);

  const formatDuration = (minutes: number) => {
    const dur = dayjs.duration(minutes, "minutes");
    const hours = dur.hours();
    const mins = dur.minutes();

    if (hours > 0 && mins > 0) {
      return `${hours} ${hours === 1 ? "hour" : "hours"} ${mins} ${mins === 1 ? "minute" : "minutes"}`;
    }
    if (hours > 0) {
      return `${hours} ${hours === 1 ? "hour" : "hours"}`;
    }
    return `${mins} ${mins === 1 ? "minute" : "minutes"}`;
  };

  useEffect(() => {

    if (TEST_MODE) {
      setIsVisible(true);
      return;
    }

    const checkMaintenanceTime = () => {
      const now = new Date();

      const maintenanceStart = new Date(MaintenanceStart);

      const maintenanceEnd = new Date(maintenanceStart.getTime() + MaintenanceDuration * 60 * 1000);

      const inMaintenanceWindow = now >= maintenanceStart && now <= maintenanceEnd;

      setIsVisible(inMaintenanceWindow);
    };

    checkMaintenanceTime();

    const interval = setInterval(checkMaintenanceTime, 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-gradient-to-r from-[#FF6B35] to-[#F7931E] text-white shadow-lg">
      <div className="max-w-[1200px] mx-auto px-[15px] py-[8px]">
        <div className="flex items-center justify-center gap-[12px] text-[13px] md:text-[14px]">
          <span className="text-center">
            1Click Services will undergo scheduled maintenance on <strong>{dayjs(MaintenanceStart).format("YYYY-MM-DD HH:mm")} - {dayjs(MaintenanceStart).add(MaintenanceDuration, "minutes").format("YYYY-MM-DD HH:mm")}</strong> | Duration: <strong>{formatDuration(MaintenanceDuration)}</strong>
          </span>

          <a
            href="https://status.near-intents.org/posts/details/PMQ4BWC"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center gap-[4px] bg-white text-[#FF6B35] px-[12px] py-[4px] rounded-[6px] font-[600] text-[12px] hover:bg-opacity-90 transition-all duration-300 whitespace-nowrap"
          >
            <span>Track Status</span>
            <span>→</span>
          </a>
        </div>
      </div>
    </div>
  );
}
