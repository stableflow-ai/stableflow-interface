import clsx from "clsx";
import { motion } from "framer-motion";
import React, {
  useState,
  useRef,
  useCallback,
  useMemo,
  useEffect
} from "react";
import useBridgeStore from "@/stores/use-bridge";
import useBalancesStore, { type BalancesState } from "@/stores/use-balances";
import Loading from "@/components/loading/icon";
import Big from "big.js";
import { formatNumber } from "@/utils/format/number";

export default function Bottom({ token }: { token: any }) {
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const bridgeStore = useBridgeStore();
  const balancesStore = useBalancesStore();

  const balance = useMemo(() => {
    if (!token?.contractAddress) return "0";
    const _balance =
      balancesStore[`${token.chainType}Balances` as keyof BalancesState][
        token.contractAddress
      ];
    if (!_balance) return "0";
    if (_balance === "-") return "0";
    return _balance;
  }, [token?.contractAddress]);

  useEffect(() => {
    if (balance === "0") return;
    if (bridgeStore?.amount === "0") return;
    setProgress((Number(bridgeStore.amount) / balance) * 100);
  }, [balance, bridgeStore?.amount]);

  const handleProgressChange = useCallback(
    (newProgress: number) => {
      const clampedProgress = Math.max(0, Math.min(100, newProgress));
      setProgress(clampedProgress);

      const _amount = Big(balance)
        .mul(clampedProgress / 100)
        .toFixed(token.decimals);
      bridgeStore.set({ amount: _amount });
    },
    [balance, token?.decimals]
  );

  return (
    <div className="h-[60px] px-[20px] pb-[2px] border-t border-[#EBF0F8] flex items-center justify-between">
      <div className="shrink-0 w-[90px]">
        {!!bridgeStore.amount ? (
          // <Amount amount={bridgeStore.amount} />
          formatNumber(bridgeStore.amount, 2, true, { isShort: true })
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
      <div className="shrink-0 w-[90px] flex justify-end">
        {bridgeStore.quoting ? (
          <Loading size={12} />
        ) : bridgeStore.quoteData?.quote?.amountOutFormatted ? (
          <div className="text-[#4DCF5E]">
            +
            {/* <Amount
                amount={bridgeStore.quoteData.quote.amountOutFormatted}
                className="!text-[#4DCF5E]"
              /> */}
            {formatNumber(
              bridgeStore.quoteData.quote.amountOutFormatted,
              2,
              true,
              { isShort: true }
            )}
          </div>
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
      className="w-[269px] h-[12px] rounded-[6px] bg-[#EDF0F7] p-[2px] shrink-0 relative"
    >
      <div
        className="h-[8px] rounded-[12px] bg-linear-to-r from-[#B7CCBA00] to-[#B7CCBA] relative max-w-full"
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
      <div className="absolute top-[16px] left-0 w-full h-full flex items-center text-[#9FA7BA] text-[10px]">
        {[25, 50, 75, 100].map((item) => (
          <div key={item} className="w-1/4 text-right">
            <span className="button" onClick={() => onProgressChange(item)}>
              {item}%
            </span>
          </div>
        ))}
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
