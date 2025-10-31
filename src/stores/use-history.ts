import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface HistoryState {
  history: Record<string, any>;
  status: Record<string, any>;
  pendingStatus: any[];
  completeStatus: any[];
  latestHistories?: string[];
  openDrawer: boolean;
  setOpenDrawer: (open?: boolean) => void;
  addHistory: (item: any) => void;
  updateStatus: (address: string, status: any) => void;
  closeLatestHistory: (address?: string) => void;
  updateHistory: (address?: string, item?: any) => void;
  removeHistory: (address: string) => void;
}

export const isPendingStatus = (status: any) => {
  return !["SUCCESS", "REFUNDED", "FAILED"].includes(status);
};

export const useHistoryStore = create(
  persist<HistoryState>(
    (set, get) => ({
      history: {},
      // KNOWN_DEPOSIT_TX PENDING_DEPOSIT INCOMPLETE_DEPOSIT PROCESSING SUCCESS REFUNDED FAILED
      status: {},
      pendingStatus: [],
      completeStatus: [],
      addHistory: (item: any) => {
        const _history = get().history;
        _history[item.despoitAddress] = item;
        set({
          history: _history,
          latestHistories: [item.despoitAddress],
        });
      },
      updateStatus: (address: string, status: any) => {
        if (!address) return;
        const _pendingStatus = get().pendingStatus;
        const _completeStatus = get().completeStatus;
        const _status = get().status;
        const _index = _pendingStatus.indexOf(address);
        _status[address] = status;

        if (isPendingStatus(status)) {
          if (_index === -1) _pendingStatus.unshift(address);
        } else {
          if (_index !== -1) {
            _pendingStatus.splice(_index, 1);
          }
          const _completeIndex = _completeStatus.indexOf(address);
          if (_completeIndex === -1) _completeStatus.unshift(address);
        }

        set({
          pendingStatus: _pendingStatus,
          completeStatus: _completeStatus,
          status: _status
        });
      },
      openDrawer: false,
      setOpenDrawer: (open?: boolean) => {
        set({ openDrawer: open || false });
      },
      closeLatestHistory: (address) => {
        if (!address) {
          set({ latestHistories: [] });
          return;
        }
        const _latestHistories = get().latestHistories || [];
        const _index = _latestHistories?.indexOf(address) || -1;
        if (_index !== -1) {
          _latestHistories.splice(_index, 1);
        }
        set({ latestHistories: _latestHistories });
      },
      updateHistory: (address, item) => {
        if (!address || !item) return;
        const _history = get().history;
        if (!_history[address]) return;
        for (const key in item) {
          _history[address][key] = item[key];
        }
        set({ history: _history });
      },
      removeHistory: (address: string) => {
        if (!address) return;
        const _history = get().history;
        const _status = get().status;
        const _pendingStatus = get().pendingStatus;
        const _completeStatus = get().completeStatus;
        
        // Remove from history
        delete _history[address];
        
        // Remove from status
        delete _status[address];
        
        // Remove from pendingStatus
        const pendingIndex = _pendingStatus.indexOf(address);
        if (pendingIndex !== -1) {
          _pendingStatus.splice(pendingIndex, 1);
        }
        
        // Remove from completeStatus
        const completeIndex = _completeStatus.indexOf(address);
        if (completeIndex !== -1) {
          _completeStatus.splice(completeIndex, 1);
        }
        
        set({
          history: _history,
          status: _status,
          pendingStatus: _pendingStatus,
          completeStatus: _completeStatus
        });
      }
    }),
    {
      name: "_history",
      version: 0.1,
      storage: createJSONStorage(() => localStorage)
    }
  )
);
