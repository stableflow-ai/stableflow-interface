import useBridgeStore from "@/stores/use-bridge";
import oneClickService from "@/services/oneclick";
import useToast from "@/hooks/use-toast";
import { useRequest } from "ahooks";
import Loading from "@/components/loading/icon";
import { useTronEnergy } from "../bridge/hooks/use-tron";
import useWalletsStore from "@/stores/use-wallets";
import { tokens } from "@/config/tokens";
import usePricesStore from "@/stores/use-prices";
import { TRON_RENTAL_FEE, TronTransferStepStatus } from "@/config/tron";
import Big from "big.js";
import { ServiceMap } from "@/services";
import { Service } from "@/services/constants";
import { useHistoryStore } from "@/stores/use-history";
import axios from "axios";
import { BASE_API_URL } from "@/config/api";
import Modal from "@/components/modal";
import { useState } from "react";
import { formatNumber } from "@/utils/format/number";
import { formatAddress } from "@/utils/format/address";
import Skeleton from "@/components/skeleton";

const ContinueTransfer = (props: any) => {
  const { history, reload } = props;

  const toast = useToast();
  const bridgeStore = useBridgeStore();
  const { getEstimateNeedsEnergy, getEnergy } = useTronEnergy();
  const wallets = useWalletsStore();
  const prices = usePricesStore((state) => state.prices);
  const historyStore = useHistoryStore();

  const [continueVisible, setContinueVisible] = useState(false);
  const [transactionData, setTransactionData] = useState<any>();
  const [transactionDataLoading, setTransactionDataLoading] = useState<any>(false);

  const { runAsync: handleContinue, loading } = useRequest(async () => {
    try {
      // @ts-ignore
      const wallet = wallets["tron"];

      if (!wallet.account) {
        wallet.connect();
        return;
      }

      setContinueVisible(true);
      setTransactionDataLoading(true);

      let quoteResponse;
      try {
        const data = await oneClickService.getStatusData({
          depositAddress: history.deposit_address,
        });
        const {
          correlationId,
          status,
          swapDetails,
          updatedAt,
        } = data;
        if (!["PENDING_DEPOSIT", "INCOMPLETE_DEPOSIT"].includes(status)) {
          throw new Error(`This transaction cannot be continued, status code: ${status}`);
        }
        quoteResponse = data.quoteResponse;
      } catch (error: any) {
        throw new Error(`Get quote data failed: ${error.message}`);
      }

      const { needsEnergy } = await getEstimateNeedsEnergy({
        wallet: wallet.wallet,
        account: wallet.account || "",
      });

      const fromToken = tokens.find((token) => token.blockchain === history.from_chain && token.symbol === history.symbol);
      const toToken = tokens.find((token) => token.blockchain === history.to_chain && token.symbol === history.to_symbol);

      if (!quoteResponse || !fromToken || !toToken) {
        throw new Error(`Get quote data failed: no quote response or no from token or no to token`);
      }

      const { quoteRequest } = quoteResponse;

      const _quoteData = await oneClickService.formatQuoteData({
        data: quoteResponse,
        params: {
          amount: quoteRequest.amount,
          toToken: toToken,
          fromToken: fromToken,
          wallet: wallet.wallet,
          prices,
          refundTo: wallet.account || "",
          recipient: history.receive_address || "",
          refundType: "ORIGIN_CHAIN",
          originAsset: fromToken.assetId,
          destinationAsset: toToken.assetId,
        },
      });

      setTransactionData({
        ..._quoteData,
        needsEnergy,
        estimatedEnergy: TRON_RENTAL_FEE.Normal || 0,
        estimatedEnergyUsd: Big(TRON_RENTAL_FEE.Normal || 0).times(prices[fromToken.nativeToken.symbol] || 0).toFixed(2),
      });
      setTransactionDataLoading(false);

      const quoteData = {
        type: Service.OneClick,
        data: _quoteData,
      };

      // get TRX balance
      try {
        const estimateGas = Big(TRON_RENTAL_FEE.Normal).times(10 ** fromToken.nativeToken.decimals).toFixed(0);
        const nativeBalance = await wallet.wallet.getBalance({ symbol: "native" }, wallet.account);
        const nativeTokenName = fromToken.nativeToken.symbol;

        console.log(`estimate ${nativeTokenName} balance. Required: ${estimateGas} ${nativeTokenName}, Available: ${nativeBalance} ${nativeTokenName}`);

        if (Big(nativeBalance || 0).lt(estimateGas || 0)) {
          throw new Error(`Insufficient ${nativeTokenName} balance: You need at least ${TRON_RENTAL_FEE.Normal} ${nativeTokenName} to continue this transaction`);
        }
      } catch (error: any) {
        console.error("get TRX balance failed: %o", error);
      }

      const localHistoryData = {
        type: Service.OneClick,
        depositAddress: quoteData.data.quote.depositAddress,
        amount: bridgeStore.amount,
        fromToken: fromToken,
        toToken: toToken,
        fromAddress: wallet.account,
        toAddress: quoteData.data.quoteRequest.recipient,
        time: Date.now(),
        txHash: "",
        timeEstimate: quoteData.data.quote.timeEstimate,
      };
      const reportData = {
        project: "nearintents",
        address: wallet.account,
        amount: bridgeStore.amount,
        out_amount: quoteData.data.outputAmount,
        deposit_address: quoteData.data.quote.depositAddress,
        receive_address: quoteData.data.quoteRequest.recipient,
        from_chain: fromToken.blockchain,
        symbol: fromToken.symbol,
        to_chain: toToken.blockchain,
        to_symbol: toToken.symbol,
        tx_hash: "",
      };

      bridgeStore.setTronTransferVisible(true, { quoteData });

      if (needsEnergy) {
        await getEnergy({
          wallet: wallet.wallet,
          account: wallet.account || "",
        });
      } else {
        bridgeStore.setTronTransferStep(TronTransferStepStatus.EnergyReady);
      }

      bridgeStore.setTronTransferStep(TronTransferStepStatus.WalletPrompt);

      if (quoteData?.data?.sendParam?.param) {
        // proxyTransfer.recipient = depositAddress
        quoteData.data.sendParam.param[1] = quoteData.data.quote.depositAddress;
      }
      const hash = await ServiceMap[Service.OneClick].send({
        sendParam: quoteData?.data?.sendParam,
        wallet: wallet.wallet,
        fromToken: fromToken,
        depositAddress: quoteData.data.quote.depositAddress,
        amountWei: quoteRequest.amount,
      });

      localHistoryData.txHash = hash;
      localHistoryData.time = Date.now();

      historyStore.addHistory(localHistoryData);
      historyStore.updateStatus(quoteData.data.quote.depositAddress, "PENDING_DEPOSIT");

      reportData.tx_hash = hash;
      try {
        await axios.post(`${BASE_API_URL}/v1/trade/add`, {
          type: 0,
          ...reportData,
        });
      } catch (error) {
        console.log("report failed: %o", error);
      }

      toast.success({
        title: "Transfer submitted"
      });

      // reload history list
      await reload?.();
    } catch (error: any) {
      console.error("continue transfer failed: %o", error);
      toast.fail({
        title: "Continue transfer failed",
        text: error.message || error + "",
      });
    }

    setTransactionData(null);
    setContinueVisible(false);
    bridgeStore.setTronTransferVisible(false);

  }, {
    manual: true,
  });

  return (
    <>
      <button
        type="button"
        className="button flex justify-center items-center gap-1 text-[12px] font-[500] bg-[#6284F5] shadow-[0_2px_6px_0_rgba(0,0,0,0.10)] text-white px-2 py-1 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed duration-150"
        onClick={handleContinue}
        disabled={loading}
      >
        {loading && <Loading size={12} />} Continue
      </button>
      <Modal
        open={continueVisible}
        onClose={() => {
          setContinueVisible(false);
        }}
      >
        <div className="relative px-4 text-card-foreground flex flex-col gap-4 md:gap-6 py-4 md:py-6 w-full max-w-md bg-white border border-[#f2f2f2] rounded-b-none md:rounded-b-xl rounded-xl shadow-[0px_2px_6px_0px_rgba(0,0,0,0.1)]">
          {/* <button
            type="button"
            className="absolute top-4 right-4 cursor-pointer p-2 opacity-70 hover:opacity-100 transition-all"
            onClick={() => {
              setContinueVisible(false);
            }}
          >
            <img
              src="/icon-x.svg"
              className="w-3 h-3 shrink-0"
            />
          </button> */}
          {/* Title */}
          <div className="text-[16px] font-[500]">Continue Transaction</div>

          {/* Amount Display Box */}
          <div className="bg-[#F5F5F5] rounded-xl px-4 py-6 flex items-center justify-between">
            {
              transactionDataLoading ? (
                <Skeleton width={150} height={36} className="" />
              ) : (
                <div className="text-[24px] font-[500] text-[#444C59]">
                  {formatNumber(transactionData?.outputAmount, 6, true)} {transactionData?.quoteParam?.toToken?.symbol}
                </div>
              )
            }
            {
              transactionDataLoading ? (
                <Skeleton width={70} height={30} borderRadius={15} />
              ) : (
                <div className="px-3 py-1.5 bg-[#6284F5] rounded-full text-white text-[12px] font-[500] h-[30px] min-w-[50px]">
                  {transactionData?.quoteParam?.toToken?.chainName}
                </div>
              )
            }
          </div>

          {/* Transaction Details */}
          <div className="flex flex-col gap-3 text-[12px]">
            <div className="flex items-center justify-between">
              <div className="text-[#70788A] font-[400]">Send Amount</div>
              {
                transactionDataLoading ? (
                  <Skeleton variant="text" width={90} height={18} />
                ) : (
                  <div className="text-black font-[400]">
                    {formatNumber(transactionData?.quote?.amountInFormatted, 6, true)} {transactionData?.quoteParam?.fromToken?.symbol}
                  </div>
                )
              }
            </div>
            <div className="flex items-center justify-between">
              <div className="text-[#70788A] font-[400]">Estimated Receive</div>
              {
                transactionDataLoading ? (
                  <Skeleton variant="text" width={90} height={18} />
                ) : (
                  <div className="text-black font-[400]">
                    {formatNumber(transactionData?.outputAmount, 6, true)} {transactionData?.quoteParam?.toToken?.symbol}
                  </div>
                )
              }
            </div>
            {
              transactionData?.needsEnergy && (
                <div className="flex items-center justify-between">
                  <div className="text-[#70788A] font-[400]">Energy Fee</div>
                  {
                    transactionDataLoading ? (
                      <Skeleton variant="text" width={90} height={18} />
                    ) : (
                      <div className="flex items-center gap-1">
                        <div className="text-black font-[400]">
                          {formatNumber(transactionData.estimatedEnergyUsd, 2, true, { prefix: "$" })}
                        </div>
                        <img
                          src={transactionData?.quoteParam?.fromToken?.chainIcon}
                          alt=""
                          className="w-3 h-3"
                        />
                        <div className="text-[#70788A] font-[400]">
                          {transactionData?.quoteParam?.fromToken?.nativeToken?.symbol}
                        </div>
                      </div>
                    )
                  }
                </div>
              )
            }
            <div className="flex items-center justify-between">
              <div className="text-[#70788A] font-[400]">Net fee</div>
              {
                transactionDataLoading ? (
                  <Skeleton variant="text" width={90} height={18} />
                ) : (
                  <div className="flex items-center gap-1">
                    <div className="text-black font-[400]">
                      {formatNumber(transactionData?.totalFeesUsd, 2, true, { prefix: "$" })}
                    </div>
                    <img
                      src={transactionData?.quoteParam?.fromToken?.icon}
                      alt=""
                      className="w-3 h-3"
                    />
                    <div className="text-[#70788A] font-[400]">{transactionData?.quoteParam?.fromToken?.symbol}</div>
                  </div>
                )
              }
            </div>
            <div className="flex items-center justify-between">
              <div className="text-[#70788A] font-[400]">Receiving Address</div>
              {
                transactionDataLoading ? (
                  <Skeleton variant="text" width={90} height={18} />
                ) : (
                  <div className="text-black font-[400]">
                    {formatAddress(transactionData?.quoteParam?.recipient, 5, 4)}
                  </div>
                )
              }
            </div>
            <div className="flex items-center justify-between">
              <div className="text-[#70788A] font-[400]">Route</div>
              {
                transactionDataLoading ? (
                  <Skeleton variant="text" width={90} height={18} />
                ) : (
                  <div className="text-black font-[400]">
                    {transactionData?.quoteParam?.fromToken?.chainName} → {transactionData?.quoteParam?.toToken?.chainName}
                  </div>
                )
              }
            </div>
          </div>

          {/* Energy Fee Notice */}
          {
            transactionData?.needsEnergy && (
              <div className="text-[12px] text-[#6284F5] font-[500] text-center">
                The transaction will automatically pay approximately {formatNumber(TRON_RENTAL_FEE.Normal, 2, true)} TRX in energy fees
              </div>
            )
          }
        </div>
      </Modal>
    </>
  );
};

export default ContinueTransfer;
