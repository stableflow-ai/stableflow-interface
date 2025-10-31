import { QRCodeSVG } from "qrcode.react";
import clsx from "clsx";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useCopy from "@/hooks/use-copy";
import usePayment from "./hooks/use-payment";
import BackButton from "@/components/back-button";
import Loading from "@/components/loading/icon";
import Confetti from "react-confetti";

export default function ScanPayment() {
  const { onCopy } = useCopy();
  const {
    depositAddress,
    quoteData,
    isLoadingStatus,
    deadlineTime,
    paymentUri,
    sourceChain,
    destinationChain,
    recipientAddress,
    formatTimeEstimate,
    countdownInfo,
    progressSteps,
    transferStatus,
    updateStatusOnDone,
    isUpdatingStatus,
    navigate,
  } = usePayment();

  const [showConfetti, setShowConfetti] = useState(false);
  const confettiTriggeredRef = useRef(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  // Set window size for confetti
  useEffect(() => {
    const updateSize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Trigger confetti when status becomes SUCCESS (only once)
  useEffect(() => {
    if (transferStatus === "SUCCESS" && !confettiTriggeredRef.current) {
      confettiTriggeredRef.current = true;
      setShowConfetti(true);
      
      // Hide confetti after 5 seconds (4s display + 1s fade out)
      const hideTimer = setTimeout(() => {
        setShowConfetti(false);
      }, 5000);
      
      return () => {
        clearTimeout(hideTimer);
      };
    }
  }, [transferStatus]);

  const copyLink = () => {
    // Copy the QR code URI (paymentUri) instead of the page link
    if (paymentUri) {
      onCopy(paymentUri);
    } else {
      // Fallback to deposit address if paymentUri is not ready
      onCopy(depositAddress || "");
    }
  };

  // Circular countdown component
  const CircularCountdown = ({ percentage, displayTime }: { percentage: number; displayTime: string }) => {
    const size = 340;
    const strokeWidth = 8;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#7083ee"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-linear"
          />
        </svg>
        {/* Time display */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-[24px] md:text-[28px] font-medium text-[#7083ee]">
              {displayTime}
            </div>
            <div className="text-[12px] text-[#9FA7BA] mt-[4px]">
              Time remaining
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!quoteData || !depositAddress) {
    return null;
  }

  return (
    <div className="w-full min-h-dvh pt-[80px] pb-[100px] flex flex-col items-center overflow-y-auto overflow-x-hidden">
      <AnimatePresence>
        {showConfetti && windowSize.width > 0 && windowSize.height > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 1,
              ease: "easeOut"
            }}
            style={{
              pointerEvents: "none",
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              zIndex: 9999,
            }}
          >
            <Confetti
              width={windowSize.width}
              height={windowSize.height}
              recycle={false}
              numberOfPieces={500}
              gravity={0.3}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <div className="w-full max-w-[1200px] mx-auto px-[20px] md:px-[40px] relative">
        <BackButton
          className="static z-10"
          onClick={() => navigate("/scan")}
        />
      </div>
      <div className="w-full max-w-[1200px] mx-auto pt-[10px] md:pt-[20px] px-[20px] md:px-[40px] relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[24px] md:gap-[40px]">
          {/* Left Section - QR Code */}
          <div className="bg-white rounded-[16px] shadow-[0_2px_6px_0_rgba(0,0,0,0.10)] p-[24px] md:p-[32px]">
            <div className="flex flex-col items-center">
              {/* QR Code with Countdown */}
              <div className="relative mb-[24px]">
                <div className="relative w-[340px] h-[340px] flex items-center justify-center">
                  {/* Circular countdown (behind QR code) */}
                  {deadlineTime > 0 && (
                    <CircularCountdown
                      percentage={countdownInfo.percentage}
                      displayTime={countdownInfo.displayTime}
                    />
                  )}
                  {/* QR Code (in front) */}
                  <div className="relative z-10 w-[240px] h-[240px] md:w-[260px] md:h-[260px] bg-white p-[16px] rounded-[12px] border-2 border-[#E5E7EB]">
                    <QRCodeSVG
                      value={paymentUri}
                      size={208}
                      level="H"
                      includeMargin={false}
                      className="w-full h-full"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-[12px] w-full max-w-[320px] mb-[16px]">
                <button
                  onClick={() => onCopy(depositAddress)}
                  className="button flex-1 h-[44px] rounded-[12px] border border-[#E5E7EB] bg-white hover:bg-[#FAFBFF] transition-colors flex items-center justify-center gap-[8px] text-[14px] font-medium text-[#2B3337]"
                >
                  <img src="/icon-copy.svg" alt="Copy" className="w-[16px] h-[16px] object-contain object-center shrink-0" />
                  Copy Address
                </button>
                <button
                  onClick={copyLink}
                  className="button flex-1 h-[44px] rounded-[12px] border border-[#E5E7EB] bg-white hover:bg-[#FAFBFF] transition-colors flex items-center justify-center gap-[8px] text-[14px] font-medium text-[#2B3337]"
                >
                  <img src="/icon-copy.svg" alt="Copy" className="w-[16px] h-[16px] object-contain object-center shrink-0" />
                  Copy Link
                </button>
              </div>

              {/* Instructional Text */}
              <p className="text-[12px] text-[#9FA7BA] text-center max-w-[320px]">
                This QR code is valid for the current order only. The system will automatically bridge to your target address. Expires and refreshes automatically.
              </p>
            </div>
          </div>

          {/* Right Section - Transaction Details */}
          <div className="space-y-[24px]">
            {/* Transit Address */}
            <div className="bg-white rounded-[16px] shadow-[0_2px_6px_0_rgba(0,0,0,0.10)] p-[24px]">
              <label className="block text-[14px] font-medium text-[#2B3337] mb-[8px]">
                Transit Address ({sourceChain?.chainName} / USDT-{sourceChain?.chainName === "Tron" ? "TRC20" : "ERC20"})
              </label>
              <div className="flex items-center gap-[8px]">
                <input
                  type="text"
                  value={depositAddress}
                  readOnly
                  className="flex-1 h-[44px] px-[12px] rounded-[8px] border border-[#E5E7EB] bg-[#FAFBFF] text-[14px] text-[#2B3337] font-mono"
                />
                <button
                  onClick={() => onCopy(depositAddress)}
                  className="w-[44px] h-[44px] rounded-[8px] border border-[#E5E7EB] bg-white hover:bg-[#FAFBFF] transition-colors flex items-center justify-center"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M5.33333 5.33333H4C3.26362 5.33333 2.66667 5.93029 2.66667 6.66667V12C2.66667 12.7364 3.26362 13.3333 4 13.3333H9.33333C10.0697 13.3333 10.6667 12.7364 10.6667 12V10.6667M10.6667 2.66667H12C12.7364 2.66667 13.3333 3.26362 13.3333 4V9.33333C13.3333 10.0697 12.7364 10.6667 12 10.6667H7.33333C6.59695 10.6667 6 10.0697 6 9.33333V4C6 3.26362 6.59695 2.66667 7.33333 2.66667H8.66667"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Final Destination Address */}
            <div className="bg-white rounded-[16px] shadow-[0_2px_6px_0_rgba(0,0,0,0.10)] p-[24px]">
              <label className="block text-[14px] font-medium text-[#2B3337] mb-[8px]">
                Final Destination Address ({destinationChain?.chainName.toLowerCase() || "ethereum"})
              </label>
              <div className="flex items-center gap-[8px]">
                <div className="flex-1 h-[44px] px-[12px] rounded-[8px] border border-[#E5E7EB] bg-[#FAFBFF] flex items-center text-[14px] text-[#2B3337] font-mono">
                  {recipientAddress ? recipientAddress : ""}
                </div>
                <div className="w-[44px] h-[44px] rounded-[8px] border border-green-500 bg-green-50 flex items-center justify-center">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M13.3333 4L6 11.3333L2.66667 8"
                      stroke="#10B981"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <button
                  onClick={() => onCopy(recipientAddress)}
                  className="w-[44px] h-[44px] rounded-[8px] border border-[#E5E7EB] bg-white hover:bg-[#FAFBFF] transition-colors flex items-center justify-center"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M5.33333 5.33333H4C3.26362 5.33333 2.66667 5.93029 2.66667 6.66667V12C2.66667 12.7364 3.26362 13.3333 4 13.3333H9.33333C10.0697 13.3333 10.6667 12.7364 10.6667 12V10.6667M10.6667 2.66667H12C12.7364 2.66667 13.3333 3.26362 13.3333 4V9.33333C13.3333 10.0697 12.7364 10.6667 12 10.6667H7.33333C6.59695 10.6667 6 10.0697 6 9.33333V4C6 3.26362 6.59695 2.66667 7.33333 2.66667H8.66667"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Estimated Arrival Time */}
            <div className="bg-[#E6F2FF] rounded-[12px] p-[16px]">
              <div className="flex items-start gap-[12px]">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="mt-[2px] shrink-0"
                >
                  <path
                    d="M10 18.3333C14.6024 18.3333 18.3333 14.6024 18.3333 10C18.3333 5.39763 14.6024 1.66667 10 1.66667C5.39763 1.66667 1.66667 5.39763 1.66667 10C1.66667 14.6024 5.39763 18.3333 10 18.3333Z"
                    stroke="#3B82F6"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M10 5V10L13.3333 11.6667"
                    stroke="#3B82F6"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div>
                  <div className="text-[14px] font-medium text-[#2B3337] mb-[4px]">
                    Estimated Arrival Time
                  </div>
                  <div className="text-[13px] text-[#6B7280]">
                    {isLoadingStatus ? (
                      "Loading..."
                    ) : (
                      <>
                        {formatTimeEstimate !== "-" && `≈ ${formatTimeEstimate}`}
                        {formatTimeEstimate === "-" && formatTimeEstimate}
                        {formatTimeEstimate !== "-" && " (may take longer for large amounts or network congestion)"}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Warning Message */}
            <div className="bg-[#FEF3C7] rounded-[12px] p-[16px]">
              <div className="flex items-start gap-[12px]">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="mt-[2px] shrink-0"
                >
                  <path
                    d="M10 6.66667V10M10 13.3333H10.0083M18.3333 10C18.3333 14.6024 14.6024 18.3333 10 18.3333C5.39763 18.3333 1.66667 14.6024 1.66667 10C1.66667 5.39763 5.39763 1.66667 10 1.66667C14.6024 1.66667 18.3333 5.39763 18.3333 10Z"
                    stroke="#F59E0B"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="text-[13px] text-[#92400E]">
                  Only {sourceChain?.chainName} USDT ({sourceChain?.chainName === "Tron" ? "TRC20" : "ERC20"}) is supported. Sending other assets may result in failure or delays.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Tracker and Button */}
        <div className="mt-[40px]">
          {/* Progress Steps */}
          <div className="bg-white rounded-[16px] shadow-[0_2px_6px_0_rgba(0,0,0,0.10)] p-[24px] md:p-[32px] mb-[24px]">
            <div className="flex items-center justify-center">
            {progressSteps.map((step, index) => {
              const isCompleted = step.completed;
              const isActive = step.active;
              const isFailed = step.failed;
              const isSuccess = transferStatus === "SUCCESS" && step.index === 3;

              return (
                <div key={index} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={clsx(
                        "w-[48px] h-[48px] rounded-full flex items-center justify-center transition-all",
                        isSuccess
                          ? "bg-[#4DCF5E] border-2 border-[#4DCF5E]"
                          : isFailed
                          ? "bg-[#FF6A19] border-2 border-[#FF6A19]"
                          : isActive
                          ? "bg-[#7083ee] border-2 border-[#7083ee]"
                          : isCompleted
                          ? "bg-[#4DCF5E] border-2 border-[#4DCF5E]"
                          : "bg-white border-2 border-[#E5E7EB]"
                      )}
                    >
                      {isSuccess ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="white"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      ) : isFailed ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="white"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      ) : isCompleted ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="white"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      ) : isActive ? (
                        <div className="w-[24px] h-[24px] border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <div className="w-[8px] h-[8px] rounded-full bg-[#E5E7EB]" />
                      )}
                    </div>
                    <span
                      className={clsx(
                        "mt-[8px] text-[12px] font-medium w-[120px] text-center",
                        isSuccess
                          ? "text-[#4DCF5E]"
                          : isFailed
                          ? "text-[#FF6A19]"
                          : isActive
                          ? "text-[#7083ee]"
                          : isCompleted
                          ? "text-[#4DCF5E]"
                          : "text-[#9FA7BA]"
                      )}
                    >
                      {isSuccess ? "Completed" : isFailed ? "Failed" : step.label}
                    </span>
                  </div>
                  {index < 3 && (
                    <div
                      className={clsx(
                        "w-[32px] md:w-[64px] h-[2px] mx-[8px] md:mx-[16px] -mt-[24px]",
                        isCompleted || (isActive && !isFailed) || isSuccess
                          ? "bg-[#7083ee]"
                          : "bg-[#E5E7EB]"
                      )}
                    />
                  )}
                </div>
              );
            })}
            </div>
          </div>

          {/* I'm Done Button */}
          <div className="flex justify-center">
            <button
              onClick={async () => {
                if (transferStatus === "SUCCESS") {
                  navigate("/history");
                } else {
                  await updateStatusOnDone();
                }
              }}
              disabled={isUpdatingStatus}
              className={clsx(
                "px-[32px] h-[44px] rounded-[12px] font-medium transition-colors flex items-center justify-center gap-[8px]",
                isUpdatingStatus
                  ? "bg-[#E5E7EB] text-[#9FA7BA] cursor-not-allowed"
                  : "bg-[#7083ee] text-white hover:bg-[#5a6bd8] cursor-pointer"
              )}
            >
              {isUpdatingStatus && <Loading size={16} />}
              {isUpdatingStatus
                ? "Updating..."
                : transferStatus === "SUCCESS"
                ? "View History"
                : "I'm Done"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

