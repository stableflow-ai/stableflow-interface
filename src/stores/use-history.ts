import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface HistoryState {
  history: Record<string, any>;
  pendingStatus: any[];
  completeStatus: any[];
  addHistory: (item: any) => void;
  updateStatus: (address: string, status: any) => void;
}

export const useHistoryStore = create(
  persist<HistoryState>(
    (set, get) => ({
      history: {},
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
        const _index = _pendingStatus.indexOf(address);

        if (status === "PENDING_DEPOSIT" || status === "PROCESSING") {
          if (_index === -1) _pendingStatus.push(address);
        } else {
          if (_index !== -1) {
            _pendingStatus.splice(_index, 1);
          }
          const _completeIndex = _completeStatus.indexOf(address);
          if (_completeIndex === -1) _completeStatus.push(address);
        }

        set({ pendingStatus: _pendingStatus, completeStatus: _completeStatus });
      }
    }),
    {
      name: "_history",
      version: 0.1,
      storage: createJSONStorage(() => localStorage)
    }
  )
);
