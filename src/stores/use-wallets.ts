import { create } from "zustand/index";

interface WalletsState {
  near: {
    account: string | null;
    wallet: any;
    connect: () => void;
    disconnect: () => void;
  };
  sol: {
    account: string | null;
    wallet: any;
    connect: () => void;
    disconnect: () => void;
  };
  evm: {
    account: string | null;
    wallet: any;
    chainId: number | null;
    connect: () => void;
    disconnect: () => void;
  };
  set: (params: any) => void;
}

const useWalletsStore = create<WalletsState>((set) => ({
  near: {
    account: null,
    wallet: null,
    connect: () => {},
    disconnect: () => {}
  },
  sol: {
    account: null,
    wallet: null,
    connect: () => {},
    disconnect: () => {}
  },
  evm: {
    account: null,
    wallet: null,
    chainId: null,
    connect: () => {},
    disconnect: () => {}
  },
  set: (params) => set(() => ({ ...params }))
}));

export default useWalletsStore;
