import useBridgeStore from "@/stores/use-bridge";
import { useCallback, useEffect, useRef, useState } from "react";
import { EnergyAmounts, energyPeriod, TRON_RENTAL_FEE, TRON_RENTAL_RECEIVING_ADDRESS, TronBandwidthTransderTRX, TronBandwidthTransferToken, TronTransferStepStatus } from "@/config/tron";
import axios from "axios";
import Big from "big.js";
import { v4 as uuidv4 } from "uuid";
import energyService, { type EnergyAmount, type EnergyPeriod } from "@/libs/energy";
import usePricesStore from "@/stores/use-prices";
import { numberRemoveEndZero } from "@/utils/format/number";
import { csl } from "@/utils/log";

export function useTronEnergy(props?: any) {
  const { } = props ?? {};

  const bridgeStore = useBridgeStore();
  const prices = usePricesStore((state) => state.prices);

  const { tronTransferQuoteData, setTronTransferStep } = bridgeStore;

  const getEstimateNeedsEnergy = async (params: { wallet: any; account: string; }) => {
    const accountResources = await params.wallet.getAccountResources({ account: params.account });
    let accountTRXBalance: any;

    try {
      accountTRXBalance = await params.wallet.getBalance({ symbol: "TRX" }, params.account);
      accountTRXBalance = numberRemoveEndZero(Big(accountTRXBalance || 0).div(10 ** 6).toFixed(6));
    } catch (error) { }

    if (!accountResources.success) {
      console.warn("Failed to get account resources:", accountResources.error);
    }

    const estimatedEnergy = EnergyAmounts.New;
    const availableEnergy = accountResources.energy;
    const availableBandwidth = accountResources.bandwidth;

    csl("useTronEnergy getEstimateNeedsEnergy", "teal-500", "Estimated energy: %s, available energy: %s", estimatedEnergy, availableEnergy);
    csl("useTronEnergy getEstimateNeedsEnergy", "teal-500", "accountTRXBalance: %o", accountTRXBalance);

    const needsEnergy = availableEnergy < estimatedEnergy;
    let estimatedBandwidth = TronBandwidthTransferToken;
    // needEnergy, TronBandwidthTransderTRX + TronBandwidthTransferToken
    if (needsEnergy) {
      estimatedBandwidth = TronBandwidthTransderTRX + TronBandwidthTransferToken;
    }

    let needsBandwidthAmount = 0;
    if (availableBandwidth < TronBandwidthTransderTRX) {
      needsBandwidthAmount = TronBandwidthTransderTRX + (needsEnergy ? TronBandwidthTransferToken : 0);
    } else if (needsEnergy && availableBandwidth < TronBandwidthTransderTRX + TronBandwidthTransferToken) {
      needsBandwidthAmount = TronBandwidthTransferToken;
    }

    const needsBandwidth = estimatedBandwidth > availableBandwidth;
    const insufficientBandwidth = needsBandwidth && Big(accountTRXBalance || 0).lt(Big(estimatedBandwidth).times(10 ** 3).div(10 ** 6));

    csl("useTronEnergy getEstimateNeedsEnergy", "teal-500", "Estimated bandwidth: %s, available bandwidth: %s", estimatedBandwidth, availableBandwidth);
    csl("useTronEnergy getEstimateNeedsEnergy", "teal-500", "bandwidth payment required: %s TRX", Big(needsBandwidthAmount).times(10 ** 3).div(10 ** 6).toString());

    return {
      estimatedEnergy,
      availableEnergy,
      availableBandwidth,
      needsEnergy,
      needsEnergyTRX: needsEnergy ? TRON_RENTAL_FEE.Normal : 0,
      needsBandwidth: insufficientBandwidth,
      needsBandwidthAmount,
      needsBandwidthTRX: numberRemoveEndZero(Big(needsBandwidthAmount).times(10 ** 3).div(10 ** 6).toFixed(6)),
    };
  }

  const checkTransactionTimer = useRef<NodeJS.Timeout | null>(null);
  const checkTransactionStatusFromScan = useCallback(
    async (txHash: string, options?: {
      maxPolls?: number;
      pollInterval?: number
    }): Promise<any> => {
      const { maxPolls = 60, pollInterval = 2000 } = options || {};
      let pollCount = 0;

      return new Promise((resolve) => {
        const poll = async () => {
          checkTransactionTimer.current && clearTimeout(checkTransactionTimer.current);
          pollCount++;
          csl("useTronEnergy checkTransactionStatusFromScan", "teal-500", "Polling transaction status from TronScan (%s), attempt %s", txHash, pollCount);

          try {
            const response = await axios.get(
              `https://apilist.tronscanapi.com/api/transaction-info?hash=${txHash}`
            );

            const data = response.data;

            // Check if empty object or no data is returned
            if (!data || Object.keys(data).length === 0) {
              csl("useTronEnergy checkTransactionStatusFromScan", "teal-500", "Transaction not confirmed (%s), empty object, continue polling...", txHash);
            } else if (data.confirmed === undefined || data.confirmed === null) {
              // No confirmed field, transaction may not yet be on chain
              csl("useTronEnergy checkTransactionStatusFromScan", "teal-500", "Transaction not confirmed (%s), missing confirmed field, continue polling...", txHash);
            } else if (data.confirmed === true) {
              // Transaction confirmed, check if successful
              const isSuccess =
                data.contractRet === "SUCCESS" &&
                data.revert === false;

              if (isSuccess) {
                csl("useTronEnergy checkTransactionStatusFromScan", "teal-500", "Transaction successful (%s)", txHash);
                resolve({
                  success: true,
                  confirmed: true,
                  contractRet: data.contractRet || "",
                  revert: data.revert || false,
                  contractData: data.contractData || undefined,
                });
                return;
              } else {
                // Transaction confirmed but failed
                csl("useTronEnergy checkTransactionStatusFromScan", "teal-500", "Transaction failed (%s), contractRet: %s, revert: %s", txHash, data.contractRet, data.revert);
                resolve({
                  success: false,
                  confirmed: true,
                  contractRet: data.contractRet || "",
                  revert: data.revert || false,
                  contractData: data.contractData || undefined,
                  error: `Transaction failed: contractRet=${data.contractRet}, revert=${data.revert}`,
                });
                return;
              }
            } else {
              // confirmed === false, transaction not confirmed, continue polling
              csl("useTronEnergy checkTransactionStatusFromScan", "teal-500", "Transaction not confirmed (%s), confirmed=false, continue polling...", txHash);
            }
          } catch (error: any) {
            // If transaction does not exist (still in the process of being packaged), continue polling
            const errorMessage = error?.message || String(error);
            const statusCode = error?.response?.status;

            // 404 or similar errors indicate transaction not yet on chain
            if (statusCode === 404 ||
              errorMessage.includes("not found") ||
              errorMessage.includes("does not exist")) {
              csl("useTronEnergy checkTransactionStatusFromScan", "teal-500", "Transaction not yet on chain (%s), continue polling...", txHash);
            } else {
              // Other errors, log and continue polling
              csl("useTronEnergy checkTransactionStatusFromScan", "red-500", "Error querying transaction status from TronScan (%s): %s", txHash, errorMessage);
            }
          }

          // Check if maximum polling attempts have been reached
          if (pollCount >= maxPolls) {
            csl("useTronEnergy checkTransactionStatusFromScan", "red-500", "Polling timed out (%s), maximum polling attempts reached: %s", txHash, maxPolls);
            resolve({
              success: false,
              confirmed: false,
              contractRet: "",
              revert: false,
              error: `Polling timed out, maximum polling attempts reached: ${maxPolls}`,
            });
            return;
          }

          // Continue polling
          checkTransactionTimer.current = setTimeout(poll, pollInterval);
        };

        // Start polling
        poll();
      });
    },
    []
  );

  // Poll the energy rental result
  const pollingTimer = useRef<NodeJS.Timeout | null>(null);
  const [pollCount, setPollCount] = useState(0);
  const pollEnergyResult = async (orderId: string): Promise<any> => {
    return new Promise((resolve) => {
      let currentPollCount = 0;
      const maxPolls = 120;

      const poll = async () => {
        pollingTimer.current && clearTimeout(pollingTimer.current);
        currentPollCount++;
        setPollCount(currentPollCount);
        csl("useTronEnergy pollEnergyResult", "teal-500", "Polling energy result for order: %s, count: %d", orderId, currentPollCount);

        try {
          const result = await energyService.getEnergyStatus({ orderId });

          if (result.data.errno !== 0) {
            setPollCount(0);
            // @ts-ignore
            resolve({ success: false, error: result.data.message });
            return;
          }

          const status = result.data.data.status;

          if (status === "delegated") {
            setPollCount(0);
            resolve({ success: true });
            return;
          }

          // If not completed yet, continue polling
          if (currentPollCount >= maxPolls) {
            setPollCount(0);
            resolve({ success: false, error: "Polling timed out, please try again later" });
            return;
          }

          // Continue polling after 1 second
          pollingTimer.current = setTimeout(poll, 1000);
        } catch (error: any) {
          setPollCount(0);
          resolve({ success: false, error: error.message });
        }
      };

      // Start polling
      poll();
    });
  };

  const getEnergy = async (params: { wallet: any; account: string; }, options?: { report?: any; }) => {
    const { report } = options ?? {};

    const rentalFee = TRON_RENTAL_FEE.Normal;

    // 1. First, pay the energy rental fee
    csl("useTronEnergy getEnergy", "teal-500", "1. Start paying energy rental fee... %o", rentalFee);

    if (rentalFee > 0) {
      const transferResult = await params.wallet.transfer({
        originAsset: "TRX",
        depositAddress: TRON_RENTAL_RECEIVING_ADDRESS,
        amount: rentalFee.toString(),
      });
      // const transferResult = "3343cf067ed0f06eaf2a34b701ad6a24582bca4e14da970d762c7fb3340a72b8";
      csl("useTronEnergy getEnergy", "teal-500", "Energy rental fee transfer sent, TXID: %o", transferResult);

      if (!transferResult) {
        throw new Error("Failed to pay rental fee, please try again later");
      }
      report?.();

      // 2. Poll for transfer result
      csl("useTronEnergy getEnergy", "teal-500", "2. Start polling for transfer result...");

      setTronTransferStep(TronTransferStepStatus.EnergyPaying);
      const transferTRXResult = await checkTransactionStatusFromScan(transferResult, {
        maxPolls: 120,
        pollInterval: 3000,
      });

      if (!transferTRXResult.success || !transferTRXResult.contractData) {
        throw new Error("Energy rental fee payment timed out or failed, please try again later");
      }

      if (Big(transferTRXResult.contractData.amount || 0).div(10 ** (tronTransferQuoteData?.data?.quoteParam?.fromToken?.nativeToken?.decimals || 6)).lt(rentalFee)) {
        throw new Error(`Energy rental fee payment is insufficient, please try again later: ${rentalFee} TRX`);
      }
    }

    csl("useTronEnergy getEnergy", "green-500", "Energy rental fee payment successful");

    // 3. After completion, place an order for rental energy
    setTronTransferStep(TronTransferStepStatus.EnergyRequest);

    const outTradeNo = uuidv4();

    const energyResponse = await energyService.getEnergy({
      receiveAddress: params.account,
      energyAmount: Number(EnergyAmounts.New),
      period: energyPeriod,
      outTradeNo,
      autoActivate: false,
    });

    if (!energyResponse.data || energyResponse.data.errno !== 0) {
      // @ts-ignore
      const errorMsg = energyResponse.data.message;
      throw new Error(errorMsg);
    }

    const orderId = energyResponse.data.data.orderId;

    // 4. Polling the rental result
    const pollingRes = await pollEnergyResult(orderId);
    if (!pollingRes.success) {
      throw new Error(pollingRes.error || "Energy rental failed, please try again later");
    }

    // 5. Energy rental successful
    setTronTransferStep(TronTransferStepStatus.EnergyReady);
  };

  // Get the actual amount of TRX required to rent energy
  const getEnergyPrice = async (params?: { energyPeriod?: EnergyPeriod; energyAmount?: EnergyAmount; }) => {
    const response = await energyService.getPrice({
      period: params?.energyPeriod ?? energyPeriod,
      energyAmount: params?.energyAmount ?? BigInt(EnergyAmounts.New) as EnergyAmount,
    });

    if (response.status !== 200 || response.data.errno !== 0) {
      return {};
    }

    const { total_price } = response.data.data ?? {};
    // TRX decimals is 6
    const totalPrice = Big(total_price || 0).div(10 ** 6);
    const totalPriceUsd = Big(totalPrice).times(prices["TRX"] || 1);

    return {
      amount: numberRemoveEndZero(Big(totalPrice).toFixed(6)),
      sun: total_price + "",
      usd: numberRemoveEndZero(Big(totalPriceUsd).toFixed(20)),
    };
  };

  useEffect(() => {
    return () => {
      if (checkTransactionTimer.current) {
        clearTimeout(checkTransactionTimer.current);
        checkTransactionTimer.current = null;
      }
      if (pollingTimer.current) {
        clearTimeout(pollingTimer.current);
        pollingTimer.current = null;
      }
    };
  }, []);

  return {
    getEstimateNeedsEnergy,
    getEnergy,
    getEnergyPrice,
  };
}
