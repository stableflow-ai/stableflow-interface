import { create } from "zustand";

export interface MaintenanceNotice {
  content: string;
  end_time: number;
  start_time: number;
}

interface MaintenanceState {
  isVisible: boolean;
  maintenanceData: MaintenanceNotice | null;
  getBannerVisible: () => boolean;
  set: (params: Partial<Pick<MaintenanceState, "isVisible" | "maintenanceData">>) => void;
}

export const useMaintenanceStore = create<MaintenanceState>((set, get) => ({
  isVisible: false,
  maintenanceData: null,
  getBannerVisible: () => {
    const { isVisible, maintenanceData } = get();
    return isVisible && !!maintenanceData;
  },
  set: (params) => set((state) => ({ ...state, ...params })),
}));
