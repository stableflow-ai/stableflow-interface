import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface HistoryState {
  history: Record<string, any>;
  status: Record<string, any>;
  pendingStatus: any[];
  completeStatus: any[];
  addHistory: (item: any) => void;
  updateStatus: (address: string, status: any) => void;
}

export const useHistoryStore = create(
  persist<HistoryState>(
    (set, get) => ({
      history: {},
      status: {},
      pendingStatus: [],
      completeStatus: [],
      addHistory: (item: any) => {
        const _history = get().history;
        _history[item.despoitAddress] = item;
        set({ history: _history });
      },
      updateStatus: (address: string, status: any) => {
        if (!address) return;
        const _pendingStatus = get().pendingStatus;
        const _completeStatus = get().completeStatus;
        const _status = get().status;
        const _index = _pendingStatus.indexOf(address);
        _status[address] = status;

        if (status === "PENDING_DEPOSIT" || status === "PROCESSING") {
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
      }
    }),
    {
      name: "_history",
      version: 0.1,
      storage: createJSONStorage(() => localStorage)
    }
  )
);
