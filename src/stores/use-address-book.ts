import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface AddressBookItem {
  id: string;
  address: string;
  chain: string;
  alias?: string;
  createdAt: number;
  lastUsedAt: number;
}

interface AddressBookState {
  addresses: AddressBookItem[];
  addAddress: (address: string, chain: string) => void;
  updateAddressAlias: (id: string, alias: string) => void;
  removeAddress: (id: string) => void;
  getAddressesByChain: (chain: string) => AddressBookItem[];
  searchAddresses: (query: string, chain?: string) => AddressBookItem[];
}

export const useAddressBookStore = create(
  persist<AddressBookState>(
    (set, get) => ({
      addresses: [],
      addAddress: (address: string, chain: string) => {
        const _addresses = get().addresses;
        // Check if address already exists for this chain
        const existingIndex = _addresses.findIndex(
          (item) => item.address.toLowerCase() === address.toLowerCase() && item.chain === chain
        );

        if (existingIndex !== -1) {
          // Update lastUsedAt if exists
          _addresses[existingIndex].lastUsedAt = Date.now();
          set({ addresses: _addresses });
        } else {
          // Add new address
          const newItem: AddressBookItem = {
            id: `${chain}_${address}_${Date.now()}`,
            address: address,
            chain: chain,
            createdAt: Date.now(),
            lastUsedAt: Date.now(),
          };
          set({ addresses: [newItem, ..._addresses] });
        }
      },
      updateAddressAlias: (id: string, alias: string) => {
        const _addresses = get().addresses;
        const index = _addresses.findIndex((item) => item.id === id);
        if (index !== -1) {
          _addresses[index].alias = alias.trim() || undefined;
          set({ addresses: _addresses });
        }
      },
      removeAddress: (id: string) => {
        const _addresses = get().addresses.filter((item) => item.id !== id);
        set({ addresses: _addresses });
      },
      getAddressesByChain: (chain: string) => {
        return get().addresses
          .filter((item) => item.chain === chain)
          .sort((a, b) => b.lastUsedAt - a.lastUsedAt);
      },
      searchAddresses: (query: string, chain?: string) => {
        const _addresses = get().addresses;
        const lowerQuery = query.toLowerCase().trim();
        
        return _addresses
          .filter((item) => {
            const matchesChain = !chain || item.chain === chain;
            const matchesQuery =
              item.address.toLowerCase().includes(lowerQuery) ||
              (item.alias && item.alias.toLowerCase().includes(lowerQuery));
            return matchesChain && matchesQuery;
          })
          .sort((a, b) => b.lastUsedAt - a.lastUsedAt);
      },
    }),
    {
      name: "_address_book",
      version: 0.1,
      storage: createJSONStorage(() => localStorage),
    }
  )
);
