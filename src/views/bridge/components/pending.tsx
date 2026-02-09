import { BASE_API_URL } from "@/config/api";
import chains from "@/config/chains";
import { stablecoinLogoMap } from "@/config/tokens";
import { TradeProject, TradeStatus } from "@/config/trade";
import { useHistoryStore } from "@/stores/use-history";
import { formatAddress } from "@/utils/format/address";
import { formatNumber } from "@/utils/format/number";
import { useRequest } from "ahooks";
import axios from "axios";
import Big from "big.js";
import clsx from "clsx";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import usdt0Service from "@/services/usdt0";
import { LzScanDestinationStatus, LzScanLzComposeStatus, LzScanSourceStatus, LzScanStatus, USDT0_CONFIG } from "@/services/usdt0/config";
import Loading from "@/components/loading/icon";

const PendingTransfer = (props: any) => {
  const { className } = props;

  const {
    history,
    status,
    latestHistories,
    closeLatestHistory,
    updateStatus,
  } = useHistoryStore();
  const [currentIndex, setCurrentIndex] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const { runAsync: getTradeStatus, data: tradeStatus } = useRequest(async () => {
    if (!latestHistories || !latestHistories.length) {
      return;
    }
    const deposit_address = latestHistories[0];
    try {
      const response = await axios({
        url: `${BASE_API_URL}/v1/trade`,
        method: "GET",
        params: {
          deposit_address: deposit_address,
        },
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status !== 200) {
        return;
      }

      if (response.data.code !== 200) {
        return;
      }

      const result = response.data.data;

      if (!result || result.status === TradeStatus.Continue) {
        return;
      }

      result.token_icon = stablecoinLogoMap[result.symbol];
      result.to_token_icon = stablecoinLogoMap[result.to_symbol];

      const currentFromChain = Object.values(chains).find((chain) => chain.blockchain === result.from_chain) ?? {};
      const currentToChain = Object.values(chains).find((chain) => chain.blockchain === result.to_chain) ?? {};

      result.source_chain = currentFromChain;
      result.destination_chain = currentToChain;

      result.time = new Date(result.create_time).getTime();
      result.timeEstimate = history[deposit_address]?.timeEstimate ?? Math.floor(Math.random() * 29) + 21;

      // USDT0 status
      try {
        if (result.project === TradeProject.USDT0) {
          const layerzeroData = await usdt0Service.getLayerzeroData({
            tx_hash: result.tx_hash,
            from_chain: result.from_chain,
          });
          const isMultiHop = !!layerzeroData.destination?.lzCompose?.status && layerzeroData.destination?.lzCompose?.status !== "N/A";
          const isPending = [LzScanStatus.InFlight, LzScanStatus.Confirming].includes(layerzeroData.status?.name);
          const isConfirmed = [LzScanStatus.Delivered].includes(layerzeroData.status?.name);

          const isSourcePending = [LzScanSourceStatus.Waiting, LzScanSourceStatus.ValidatingTx, LzScanSourceStatus.WaitingForHashDelivered].includes(layerzeroData.source?.status);
          const isSourceSuccess = [LzScanSourceStatus.Succeeded].includes(layerzeroData.source?.status);
          const isDestinationPending = [LzScanDestinationStatus.Waiting, LzScanDestinationStatus.ValidatingTx].includes(layerzeroData.destination?.status);
          const isDestinationSuccess = [LzScanSourceStatus.Succeeded].includes(layerzeroData.destination?.status);
          const isLzComponsePending = [LzScanLzComposeStatus.Waiting, LzScanLzComposeStatus.ValidatingTx, LzScanLzComposeStatus.WaitingForComposeSentEvent].includes(layerzeroData.destination?.lzCompose?.status);
          const isLzComponseSuccess = [LzScanLzComposeStatus.Succeeded].includes(layerzeroData.destination?.lzCompose?.status);

          const multiHopComposer = USDT0_CONFIG["Arbitrum"].oftMultiHopComposer;

          result.isMultiHop = isMultiHop;
          result.hops = [
            {
              from_chain: result.from_chain,
              to_chain: isMultiHop ? "arb" : result.to_chain,
              address: result.address,
              receive_address: isMultiHop ? multiHopComposer : result.receive_address,
              status: isSourcePending ? TradeStatus.Pending : (isSourceSuccess ? TradeStatus.Success : TradeStatus.Failed),
              tx_hash: layerzeroData?.source?.tx?.txHash,
              // to_tx_hash: layerzeroData?.destination?.tx?.txHash,
              source_chain: currentFromChain,
              destination_chain: isMultiHop ? chains.arb : currentToChain,
            }
          ];
          if (isMultiHop) {
            result.hops.push({
              from_chain: "arb",
              to_chain: result.to_chain,
              address: multiHopComposer,
              receive_address: result.receive_address,
              status: isLzComponsePending ? TradeStatus.Pending : (isLzComponseSuccess ? TradeStatus.Success : TradeStatus.Failed),
              tx_hash: layerzeroData?.destination?.tx?.txHash,
              // to_tx_hash: layerzeroData?.destination?.lzCompose?.txs?.[0]?.txHash,
              source_chain: chains.arb,
              destination_chain: currentToChain,
            });
          }

          if (isPending || isSourcePending || isDestinationPending || isLzComponsePending) {
            result.status = TradeStatus.Pending;
            return result;
          }
          if (!isConfirmed) {
            result.status = TradeStatus.Failed;

            updateStatus(deposit_address, "FAILED");
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            return result;
          }
          let isSuccess = layerzeroData.source?.status === "SUCCEEDED" && layerzeroData.destination?.status === "SUCCEEDED";
          // multi hop shuold check source and destination lzcompose status
          if (isMultiHop) {
            isSuccess = isSuccess && layerzeroData.destination?.lzCompose?.status === "SUCCEEDED";
          }
          result.status = isSuccess ? TradeStatus.Success : TradeStatus.Failed;

          updateStatus(deposit_address, isSuccess ? "SUCCESS" : "FAILED");
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          return result;
        }
      } catch (error) {
        console.error("get USDT0 status failed: %o", error);
      }

      if ([TradeStatus.Failed, TradeStatus.Success].includes(result.status) && timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;

        updateStatus(deposit_address, result.status === TradeStatus.Success ? "SUCCESS" : "FAILED");
      }

      return result;
    } catch (error) {
      console.error("get pending transaction status failed: %o", error);
    }
  }, {
    manual: true,
  });

  useEffect(() => {
    if (!latestHistories || !latestHistories.length) {
      return;
    }
    getTradeStatus();

    timerRef.current = setInterval(getTradeStatus, 5000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [latestHistories]);

  useEffect(() => {
    if (
      !latestHistories
      || !latestHistories.length
      || ["PENDING_DEPOSIT", "PROCESSING"].includes(status[latestHistories[0]])
    ) {
      return;
    }
    closeLatestHistory();
  }, []);

  if (!latestHistories || !latestHistories.length || !tradeStatus) return null;

  return (
    <div className={clsx("w-full md:w-[calc(100%_+_10px)] pl-[10px] pr-[10px] md:pl-[5px] md:pr-[5px] pb-[5px] pt-0 md:pt-[20px] md:translate-x-[-5px] rounded-[12px] overflow-hidden", className)}>
      <Swiper
        style={{
          width: "100%",
          overflow: "visible",
        }}
        spaceBetween={10}
        // slidesPerView={latestHistories.length > 1 ? 1.1 : 1}
        slidesPerView={1}
        onSlideChange={(slide) => {
          setCurrentIndex(slide.activeIndex);
        }}
        loop={false}
        breakpoints={{
          // 640: {
          //   slidesPerView: latestHistories.length > 1 ? 1.2 : 1,
          // },
        }}
      >
        {
          !!tradeStatus && (
            <SwiperSlide className="!w-full" style={{ width: "100%", maxWidth: "100dvw" }}>
              <PendingItem
                key={latestHistories[0]}
                className=""
                data={tradeStatus}
                close={closeLatestHistory}
                isCurrent={true}
                isLastSlide={true}
              />
            </SwiperSlide>
          )
        }
      </Swiper>
    </div>
  );
};

export default PendingTransfer;

const PendingItem = (props: any) => {
  const { className, data, close } = props;

  const isPending = [TradeStatus.Pending, TradeStatus.Confirming].includes(data.status);
  const isSuccess = [TradeStatus.Success].includes(data.status);
  const MaxPendingProgress = 90;
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isPending) {
      setProgress(100);
      return;
    }

    let timer: any;
    const calcProgress = () => {
      const now = Date.now();
      const timeEstimate = data.timeEstimate || 1;
      let _progress = Big(now).minus(data.time || now).div(Big(timeEstimate).times(1000)).times(100);
      if (_progress.gt(MaxPendingProgress)) {
        _progress = Big(MaxPendingProgress);
        clearInterval(timer);
      }
      setProgress(+_progress.toFixed(2));
    };
    calcProgress();

    timer = setInterval(calcProgress, 2000);

    return () => {
      clearInterval(timer);
    };
  }, [data]);

  return (
    <div className={clsx(
      "relative w-full flex flex-col justify-center items-stretch gap-[10px] px-[10px] md:px-[16px] bg-white rounded-[12px] border border-[#F2F2F2] shadow-[0_2px_6px_0_rgba(0,_0,_0,_0.10)] text-[16px] text-black font-[500] leading-[100%] transition-all duration-300",
      data.isMultiHop ? "h-[90px]" : "h-[70px]",
      className
    )}>
      <div className="flex justify-between items-center">
        {
          data.isMultiHop ? (
            <div className="flex flex-col gap-1">
              {
                data.hops.map((hop: any, idx: number) => (
                  <BridgeRoute
                    key={idx}
                    project={data.project}
                    source_chain={hop.source_chain}
                    destination_chain={hop.destination_chain}
                    tx_hash={hop.tx_hash}
                    to_tx_hash={hop.to_tx_hash}
                    address={hop.address}
                    receive_address={hop.receive_address}
                    status={hop.status}
                  />
                ))
              }
            </div>
          ) : (
            <BridgeRoute
              project={data.project}
              source_chain={data.source_chain}
              destination_chain={data.destination_chain}
              tx_hash={data.tx_hash}
              to_tx_hash={data.to_tx_hash}
              address={data.address}
              receive_address={data.receive_address}
            />
          )
        }
        {
          !isPending && (
            <button
              type="button"
              className="w-[12px] h-[11px] shrink-0 button"
              onClick={() => {
                close();
              }}
            >
              <svg className="w-[12px] h-[11px] shrink-0" width="12" height="11" viewBox="0 0 12 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                <line x1="10.2324" y1="1.41421" x2="1.9498" y2="9.69684" stroke="#A1A699" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M5.6867 5.15155L1.99707 1.46191M7.80788 7.27273L10.5351 9.99996" stroke="#A1A699" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
          )
        }
      </div>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-[7px]">
          <img
            src={data.token_icon}
            alt=""
            className="w-[28px] h-[28px] rounded-full object-center object-contain shrink-0"
          />
          <div className="flex items-center gap-[5px]">
            <div className="text-black text-[16px] font-[700] leading-[100%]">
              {formatNumber(data.token_in_amount, 2, true)}
            </div>
            <div className="text-[#444C59] text-[12px] font-[500] leading-[100%]">
              {data.symbol}
            </div>
          </div>
        </div>
        <div
          className={clsx(
            "text-[14px] font-[400] leading-[100%] flex items-center gap-[5px] justify-end",
            isPending ? "text-[#6284F5]" : (isSuccess ? "text-[#2EA97C]" : "text-[#FF6A19]")
          )}
        >
          {
            (!isPending && isSuccess) && (
              <svg
                className="w-[14px] h-[10px] shrink-0"
                width="14"
                height="10"
                viewBox="0 0 14 10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M1.5 4L5.82143 8.49986L12.5 1" stroke="#2EA97C" stroke-width="1.5" />
              </svg>
            )
          }
          <div className="">
            {isPending ? "Pending" : (isSuccess ? "Complete" : "Failed")}
          </div>
        </div>
      </div>
      <div className="w-full h-[3px] absolute bottom-[1px] left-0 px-[12px]">
        <div className="w-full h-full overflow-hidden rounded-[2px]">
          <motion.div
            className={clsx(
              "w-full h-full rounded-[2px] ml-[-100%]",
              (isSuccess || isPending) ? "bg-[#2EA97C]" : "bg-[#FF6A19]"
            )}
            animate={{
              x: `${progress}%`,
            }}
            transition={{
              ease: "linear",
              duration: 2,
            }}
          />
        </div>
      </div>
    </div>
  );
};

const StatusIcon = ({ status }: { status?: TradeStatus }) => {
  if (status === TradeStatus.Pending || status === TradeStatus.Confirming) {
    return <Loading size={12} />;
  }
  if (status === TradeStatus.Success) {
    return (
      <svg className="w-[12px] h-[12px] shrink-0" width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="6" cy="6" r="6" fill="#2EA97C" />
        <path d="M3.5 6L5.25 7.75L8.5 4.25" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (status === TradeStatus.Failed) {
    return (
      <svg className="w-[12px] h-[12px] shrink-0" width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="6" cy="6" r="6" fill="#FF4D4F" />
        <path d="M4 4L8 8M8 4L4 8" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return null;
};

const BridgeRoute = (props: any) => {
  const {
    project,
    source_chain,
    destination_chain,
    tx_hash,
    to_tx_hash,
    address,
    receive_address,
    status,
  } = props;

  const txExplorerUrl = (chain: any) => {
    if (project === TradeProject.USDT0) {
      return "https://layerzeroscan.com/tx";
    }
    return chain?.blockExplorerUrl;
  };

  return (
    <div className="flex items-center gap-[5px]">
      {status !== void 0 && <StatusIcon status={status} />}
      {
        tx_hash && (
          <a
            className="w-[11px] h-[11px] shrink-0 button"
            target="_blank"
            href={`${txExplorerUrl(source_chain)}/${tx_hash}`}
            rel="noreferrer noopener nofollow"
          >
            <svg className="w-[11px] h-[11px] shrink-0" width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 2H1V10H9V6" stroke="#9FA7BA" />
              <path d="M4 7L10 1M10 1H6.5M10 1V4" stroke="#9FA7BA" />
            </svg>
          </a>
        )
      }
      <div className="text-[#9FA7BA] text-[12px] font-[500] leading-[100%]">
        {source_chain?.chainName}
      </div>
      <div className="text-[#444C59] text-[12px] font-[400] leading-[100%]">
        {formatAddress(address, 5, 4)}
      </div>
      <svg className="w-[5px] h-[8px] shrink-0" width="5" height="8" viewBox="0 0 5 8" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1 1L4 4.10345L1 7" stroke="#9FA7BA" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      {
        !!to_tx_hash && (
          <a
            className="w-[11px] h-[11px] shrink-0 button"
            target="_blank"
            href={`${txExplorerUrl(destination_chain)}/${to_tx_hash}`}
            rel="noreferrer noopener nofollow"
          >
            <svg className="w-[11px] h-[11px] shrink-0" width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 2H1V10H9V6" stroke="#9FA7BA" />
              <path d="M4 7L10 1M10 1H6.5M10 1V4" stroke="#9FA7BA" />
            </svg>
          </a>
        )
      }
      <div className="text-[#9FA7BA] text-[12px] font-[500] leading-[100%]">
        {destination_chain?.chainName}
      </div>
      <div className="text-[#444C59] text-[12px] font-[400] leading-[100%]">
        {formatAddress(receive_address, 5, 4)}
      </div>
    </div>
  );
};
