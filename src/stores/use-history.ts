import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface HistoryState {
  history: any[];
  status: Record<string, any>;
  addHistory: (item: string) => void;
  updateStatus: (address: string, status: any) => void;
}

export const useHistoryStore = create(
  persist<HistoryState>(
    (set, get) => ({
      history: [],
      status: {},
      addHistory: (item: any) => {
        const _history = get().history;
        _history.push(item);
        set({ history: _history });
      },
      updateStatus: (address: string, status: any) => {
        const _status = get().status;
        _status[address] = status;
        set({ status: _status });
      }
    }),
    {
      name: "_history",
      version: 0.1,
      storage: createJSONStorage(() => localStorage)
    }
  )
);
