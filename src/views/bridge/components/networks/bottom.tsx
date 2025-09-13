import clsx from "clsx";
import { motion } from "framer-motion";
import React, { useState, useRef, useCallback, useMemo } from "react";
import Amount from "@/components/amount";
import useBridgeStore from "@/stores/use-bridge";
import useBalancesStore from "@/stores/use-balances";
import Loading from "@/components/loading/icon";
import Big from "big.js";

export default function Bottom({ token }: { token: any }) {
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const bridgeStore = useBridgeStore();
  const balancesStore = useBalancesStore();

  const balance = useMemo(() => {
    if (!token?.contractAddress) return "0";
    const _balance = balancesStore.balances[token.contractAddress];
    if (!_balance) return "0";
    if (_balance === "-") return "0";
    return _balance;
  }, [token.contractAddress]);

  const handleProgressChange = useCallback(
    (newProgress: number) => {
      const clampedProgress = Math.max(0, Math.min(100, newProgress));
      setProgress(clampedProgress);

      const _amount = Big(balance)
        .mul(clampedProgress / 100)
        .toString();
      bridgeStore.set({ amount: _amount });
    },
    [balance]
  );

  return (
    <div className="h-[56px] px-[20px] border-t border-[#EBF0F8] flex items-center">
      <div className="shrink-0 pr-[50px] w-[100px]">
        {!!bridgeStore.amount ? (
          <Amount amount={bridgeStore.amount} />
        ) : (
          <div className="w-[38px] h-[12px] rounded-[6px] bg-[#EDF0F7]" />
        )}
      </div>

      <Progress
        progress={progress}
        disabled={balance === "0"}
        token={token}
        onProgressChange={handleProgressChange}
        isDragging={isDragging}
        setIsDragging={setIsDragging}
        progressBarRef={progressBarRef}
      />
      <div className="shrink-0 pl-[50px] w-[100px]">
        {bridgeStore.quoting ? (
          <Loading size={12} />
        ) : bridgeStore.quoteData?.quote?.amountOutFormatted ? (
          <Amount amount={bridgeStore.quoteData.quote.amountOutFormatted} />
        ) : (
          <div className="w-[38px] h-[12px] rounded-[6px] bg-[#EDF0F7]" />
        )}
      </div>
    </div>
  );
}

const Progress = ({
  progress,
  disabled,
  token,
  onProgressChange,
  isDragging,
  setIsDragging,
  progressBarRef
}: {
  progress: number;
  disabled: boolean;
  token: any;
  onProgressChange: (progress: number) => void;
  isDragging: boolean;
  setIsDragging: (dragging: boolean) => void;
  progressBarRef: React.RefObject<HTMLDivElement | null>;
}) => {
  return (
    <div
      ref={progressBarRef}
      className="w-[269px] h-[12px] rounded-[6px] bg-[#EDF0F7] p-[2px] shrink-0"
    >
      <div
        className="h-[8px] rounded-[12px] bg-linear-to-r from-[#B7CCBA00] to-[#B7CCBA] relative"
        style={{ width: `${progress}%` }}
      >
        {token && (
          <Pointer
            disabled={disabled}
            token={token}
            progress={progress}
            onProgressChange={onProgressChange}
            isDragging={isDragging}
            setIsDragging={setIsDragging}
            progressBarRef={progressBarRef}
          />
        )}
      </div>
    </div>
  );
};

const Pointer = ({
  disabled,
  token,
  progress,
  onProgressChange,
  isDragging,
  setIsDragging,
  progressBarRef
}: {
  disabled: boolean;
  token: any;
  progress: number;
  onProgressChange: (progress: number) => void;
  isDragging: boolean;
  setIsDragging: (dragging: boolean) => void;
  progressBarRef: React.RefObject<HTMLDivElement | null>;
}) => {
  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return;
    e.preventDefault();
    setIsDragging(true);
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !progressBarRef.current) return;

      const rect = progressBarRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = (x / rect.width) * 100;
      onProgressChange(percentage);
    },
    [isDragging, progressBarRef, onProgressChange]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, [setIsDragging]);

  // Add global mouse event listeners
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Click on progress bar to jump to position
  const handleProgressBarClick = (e: React.MouseEvent) => {
    if (disabled || !progressBarRef.current) return;

    const rect = progressBarRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    onProgressChange(percentage);
  };

  return (
    <div
      className="w-[26px] h-[26px] absolute top-[-8px] right-[-6px] cursor-pointer select-none"
      onMouseDown={handleMouseDown}
      onClick={(e) => e.stopPropagation()}
    >
      {!disabled && (
        <>
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-[#39A883] opacity-30"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.1, 0.3]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-[#39A883] opacity-20"
            animate={{
              scale: [1, 1.8, 1],
              opacity: [0.2, 0.05, 0.2]
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5
            }}
          />
        </>
      )}

      <img
        src={token?.icon}
        className={clsx(
          "w-[26px] h-[26px] relative z-10",
          disabled ? "grayscale" : "cursor-pointer",
          progress > 0 && "rotate-90",
          isDragging && "scale-110"
        )}
        draggable={false}
      />

      {/* Clickable progress bar area */}
      <div
        className="absolute inset-0 w-full h-full cursor-pointer"
        onClick={handleProgressBarClick}
        style={{
          left: "-6px",
          top: "-8px",
          width: "calc(100% + 12px)",
          height: "calc(100% + 16px)"
        }}
      />
    </div>
  );
};
