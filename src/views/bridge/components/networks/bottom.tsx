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
  const _quoteData = bridgeStore.quoteDataMap.get(bridgeStore.quoteDataService);

  const mergedBalance =
    balancesStore[`${token?.chainType}Balances` as keyof BalancesState]?.[
      token?.contractAddress
    ];

  const balance = useMemo(() => {
    if (!mergedBalance) return "0";
    if (mergedBalance === "-") return "0";
    return mergedBalance;
  }, [token?.contractAddress, mergedBalance]);

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

  const getAmountNumberFontSize = (_amount: string, offset: number = 0) => {
    if (!_amount) return "text-[16px]";
    let _amountString = _amount + "";
    _amountString = _amountString.replace(/[^\d]/g, "");
    const _amountStringLength = _amountString.length || 0;
    if (_amountStringLength >= 10 + offset) {
      return "text-[10px]";
    }
    if (_amountStringLength >= 8 + offset) {
      return "text-[12px]";
    }
    if (_amountStringLength >= 7 + offset) {
      return "text-[14px]";
    }
    return "text-[16px]";
  };

  return (
    <div className="h-[70px] px-[20px] pt-[24px] border-t border-[#EBF0F8] flex justify-between relative">
      <div
        className={clsx(
          "shrink-0 w-[100px] whitespace-nowrap overflow-hidden text-ellipsis pr-[18px]",
          getAmountNumberFontSize(
            formatNumber(bridgeStore.amount, 2, true, { isShort: false }),
            0
          )
        )}
      >
        {bridgeStore.quotingMap.get(bridgeStore.quoteDataService) ? (
          <Loading size={12} />
        ) : _quoteData?.outputAmount ? (
          <div
            className={clsx(
              "text-[#4DCF5E] whitespace-nowrap overflow-hidden text-ellipsis",
              getAmountNumberFontSize(
                formatNumber(
                  _quoteData.outputAmount,
                  2,
                  true,
                  { isShort: false }
                ),
                0
              )
            )}
          >
            +
            {formatNumber(
              _quoteData.outputAmount,
              2,
              true,
              { isShort: false }
            )}
          </div>
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
      <div className="shrink-0 w-[100px] flex justify-end">
        {bridgeStore.quotingMap.get(bridgeStore.quoteDataService) ? (
          <Loading size={12} />
        ) : !!bridgeStore.amount ? (
          // <Amount amount={bridgeStore.amount} />
          formatNumber(bridgeStore.amount, 2, true, { isShort: false })
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
  // Click/Touch on progress bar to jump to position
  const handleProgressBarClick = (e: React.MouseEvent) => {
    if (disabled || !progressBarRef.current) return;

    const rect = progressBarRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    onProgressChange(percentage);
  };

  const handleProgressBarTouch = (e: React.TouchEvent) => {
    if (disabled || !progressBarRef.current) return;

    const rect = progressBarRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    onProgressChange(percentage);
  };
  return (
    <div
      ref={progressBarRef}
      className="md:w-[269px] cursor-pointer flex-1 h-[12px] rounded-[6px] bg-[#EDF0F7] p-[2px] relative"
      onClick={handleProgressBarClick}
      onTouchStart={handleProgressBarTouch}
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
      <div className="absolute left-[0px] bottom-[-20px] w-full flex items-center text-[#9FA7BA] text-[10px]">
        {[25, 50, 75, 100].map((item) => (
          <div key={item} className="w-1/4 text-right">
            <span
              className="button"
              onClick={(e) => {
                e.stopPropagation();
                onProgressChange(item);
              }}
            >
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

  const handleTouchStart = (e: React.TouchEvent) => {
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

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDragging || !progressBarRef.current) return;

      const rect = progressBarRef.current.getBoundingClientRect();
      const touch = e.touches[0];
      const x = touch.clientX - rect.left;
      const percentage = (x / rect.width) * 100;
      onProgressChange(percentage);
    },
    [isDragging, progressBarRef, onProgressChange]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, [setIsDragging]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, [setIsDragging]);

  // Add global mouse and touch event listeners
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("touchmove", handleTouchMove, {
        passive: false
      });
      document.addEventListener("touchend", handleTouchEnd);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("touchend", handleTouchEnd);
      };
    }
  }, [
    isDragging,
    handleMouseMove,
    handleMouseUp,
    handleTouchMove,
    handleTouchEnd
  ]);

  return (
    <div
      className="w-[26px] h-[26px] absolute top-[-8px] right-[-6px] cursor-pointer select-none"
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onClick={(e) => {
        e.stopPropagation();
      }}
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
    </div>
  );
};
