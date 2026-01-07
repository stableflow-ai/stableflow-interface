import dayjs from "@/libs/dayjs";
import { BASE_API_URL } from "@/config/api";
import { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";

interface MaintenanceNotice {
  content: string;
  end_time: number; // Unix timestamp in seconds
  start_time: number; // Unix timestamp in seconds
}

interface ApiResponse {
  code: number;
  data: MaintenanceNotice | null;
}

const POLLING_INTERVAL = 5 * 60 * 1000; // 5 minutes

export default function MaintenanceBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [maintenanceData, setMaintenanceData] = useState<MaintenanceNotice | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Format duration from start_time to end_time
  const formatDuration = (startTime: number, endTime: number) => {
    const durationMs = (endTime - startTime) * 1000; // Convert seconds to milliseconds
    const dur = dayjs.duration(durationMs);
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

  // Fetch maintenance notice from API
  const fetchMaintenanceNotice = async () => {
    try {
      const response = await axios.get<ApiResponse>(`${BASE_API_URL}/v1/nearintents/notice`);

      if (response.data.code === 200 && response.data.data !== null) {
        const data = response.data.data;
        setMaintenanceData(data);

        // Check if current time is within maintenance window
        // const now = dayjs();
        // const startTime = dayjs.unix(data.start_time);
        // const endTime = dayjs.unix(data.end_time);
        // const inMaintenanceWindow = dayjs(now).isAfter(startTime) && (dayjs(now).isBefore(endTime) || dayjs(now).isSame(endTime));
        setIsVisible(true);
      } else {
        // No maintenance notice or invalid response
        setMaintenanceData(null);
        setIsVisible(false);
      }
    } catch (error) {
      console.error("Failed to fetch maintenance notice:", error);
      // On error, hide the banner
      setMaintenanceData(null);
      setIsVisible(false);
    }
  };

  // Start polling
  const startPolling = () => {
    // Clear existing interval if any
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Fetch immediately
    fetchMaintenanceNotice();

    // Set up interval for polling
    intervalRef.current = setInterval(() => {
      fetchMaintenanceNotice();
    }, POLLING_INTERVAL);
  };

  // Stop polling
  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Handle page visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      const isVisible = !document.hidden;

      if (isVisible) {
        // Page became visible, resume polling
        startPolling();
        return;
      }

      // Page became hidden, pause polling
      stopPolling();
    };

    // Add event listener
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Start polling initially
    startPolling();

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      stopPolling();
    };
  }, []);

  const [startTime, endTime] = useMemo(() => {
    const _result: (dayjs.Dayjs | null)[] = [null, null];
    if (!maintenanceData) {
      return _result;
    }
    if (maintenanceData.start_time) {
      _result[0] = dayjs.unix(maintenanceData.start_time);
    }
    if (maintenanceData.end_time) {
      _result[1] = dayjs.unix(maintenanceData.end_time);
    }
    return _result;
  }, [maintenanceData]);

  return (
    <AnimatePresence>
      {
        (!isVisible || !maintenanceData) ? null : (
          <motion.div
            className="relative top-0 left-0 right-0 z-[1] bg-gradient-to-r from-[#FF6B35] to-[#F7931E] text-white shadow-lg"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.15 }}
          >
            <div className="max-w-[1200px] mx-auto px-[15px] py-[8px]">
              <div className="flex items-center justify-center gap-[12px] text-[13px] md:text-[14px]">
                <span className="text-center">
                  {
                    maintenanceData.content ?? "1Click Services will undergo scheduled maintenance"
                  }
                  {
                    (
                      (!startTime && !endTime) ||
                      (startTime && endTime && startTime.isAfter(endTime))
                    ) ? null : (
                      <>
                        &nbsp;on&nbsp;
                        {
                          startTime ? (
                            <strong>{startTime.format("YYYY-MM-DD HH:mm")}</strong>
                          ) : null
                        }
                        {
                          startTime && endTime ? " - " : null
                        }
                        {
                          endTime ? (
                            <strong>{endTime.format("YYYY-MM-DD HH:mm")}</strong>
                          ) : null
                        }
                        {
                          startTime && endTime ? (
                            <>
                              &nbsp;|&nbsp;Duration:&nbsp;<strong>{formatDuration(maintenanceData.start_time, maintenanceData.end_time)}</strong>
                            </>
                          ) : null
                        }
                      </>
                    )
                  }
                </span>

                <a
                  href="https://status.near-intents.org/posts/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 inline-flex items-center gap-[4px] bg-white text-[#FF6B35] px-[12px] py-[4px] rounded-[6px] font-[600] text-[12px] hover:bg-opacity-90 transition-all duration-300 whitespace-nowrap"
                >
                  <span>Track Status</span>
                  <span>→</span>
                </a>
              </div>
            </div>
          </motion.div>
        )
      }
    </AnimatePresence>
  );
}
