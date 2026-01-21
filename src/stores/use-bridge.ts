import { create } from "zustand/index";
import { Service, type ServiceType } from "@/services";
import { TronTransferStepStatus } from "@/config/tron";

interface BridgeState {
  amount: string;
  recipientAddress: string;
  quoteDataService: ServiceType;
  quoteDataMap: Map<string, any>;
  quotingMap: Map<string, boolean>;
  transferring: boolean;
  errorTips: string;
  showFee: boolean;
  showRoutes: boolean;
  shouldAutoSelect: boolean;
  acceptPriceImpact: boolean;
  set: (params: any) => void;
  setQuoteData: (key: string, value: any) => void;
  modifyQuoteData: (key: string, value: any) => void;
  clearQuoteData: () => void;
  setQuoting: (key: string, value: boolean) => void;
  setAcceptPriceImpact: (value: boolean) => void;

  // tron energy rental
  tronTransferVisible: boolean;
  tronTransferQuoteData?: any;
  tronTransferStep: TronTransferStepStatus;
  setTronTransferVisible: (value: boolean, params?: { quoteData: any; }) => void;
  setTronTransferStep: (step: TronTransferStepStatus) => void;
}

const useBridgeStore = create<BridgeState>((set) => ({
  amount: "",
  recipientAddress: "",
  quoteDataService: Service.OneClick,
  quoteDataMap: new Map(),
  quotingMap: new Map(),
  transferring: false,
  errorTips: "",
  showFee: false,
  showRoutes: true,
  shouldAutoSelect: false,
  acceptPriceImpact: true,
  set: (params) => set(() => ({ ...params })),
  setQuoteData: (key, value) => {
    set((state) => {
      const _quoteDataMap = new Map(state.quoteDataMap);
      _quoteDataMap.set(key, value);
      return { ...state, quoteDataMap: _quoteDataMap };
    });
  },
  modifyQuoteData: (key, value) => {
    set((state) => {
      const _quoteDataMap = new Map(state.quoteDataMap);
      _quoteDataMap.set(key, {
        ..._quoteDataMap.get(key),
        ...value,
      });
      return { ...state, quoteDataMap: _quoteDataMap };
    });
  },
  clearQuoteData: () => {
    set((state) => {
      return {
        ...state,
        quoteDataMap: new Map(),
      };
    });
  },
  setQuoting: (key, value) => {
    set((state) => {
      const _quotingMap = new Map(state.quotingMap);
      _quotingMap.set(key, value);
      return { ...state, quotingMap: _quotingMap };
    });
  },
  setAcceptPriceImpact: (value) => {
    set((state) => {
      return { ...state, acceptPriceImpact: value };
    });
  },

  // tron energy rental
  tronTransferVisible: false,
  tronTransferQuoteData: null,
  tronTransferStep: TronTransferStepStatus.EnergyPayment,
  setTronTransferVisible: (visible, params) => {
    set((state) => {
      return {
        ...state,
        // reset step to initial
        tronTransferStep: TronTransferStepStatus.EnergyPayment,
        tronTransferVisible: visible,
        tronTransferQuoteData: params?.quoteData ?? null,
      };
    });
  },
  setTronTransferStep: (step) => {
    set((state) => {
      return {
        ...state,
        tronTransferStep: step,
      };
    });
  },
}));

export default useBridgeStore;


export interface QuoteData {
  type: ServiceType;
  errMsg?: string;
  data?: any;
}
