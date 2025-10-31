import { useState, useMemo, useEffect } from "react";
import Modal from "@/components/modal";
import { useAddressBookStore, type AddressBookItem } from "@/stores/use-address-book";
import chains from "@/config/chains";
import { formatAddress } from "@/utils/format/address";
import Pagination from "@/components/pagination";
import Big from "big.js";

interface AddressBookModalProps {
  open: boolean;
  onClose: () => void;
  onSelect?: (address: string, chain: string) => void;
  currentChain?: string;
}

export default function AddressBookModal({
  open,
  onClose,
  onSelect,
  currentChain,
}: AddressBookModalProps) {
  const addressBookStore = useAddressBookStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAlias, setEditAlias] = useState<string>("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  // Filter addresses by current chain if provided
  const filteredAddresses = useMemo(() => {
    if (currentChain) {
      return addressBookStore.getAddressesByChain(currentChain);
    }
    return addressBookStore.addresses.sort((a, b) => b.lastUsedAt - a.lastUsedAt);
  }, [addressBookStore.addresses, currentChain, addressBookStore]);

  // Reset page when filtered addresses change
  useEffect(() => {
    setPage(1);
  }, [currentChain, addressBookStore.addresses.length]);

  const totalPage = useMemo(() => {
    if (filteredAddresses.length === 0) return 0;
    return +Big(filteredAddresses.length).div(pageSize).toFixed(0, Big.roundUp);
  }, [filteredAddresses.length, pageSize]);

  const paginatedAddresses = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return filteredAddresses.slice(start, end);
  }, [filteredAddresses, page, pageSize]);

  const handleEditAlias = (item: AddressBookItem) => {
    setEditingId(item.id);
    setEditAlias(item.alias || "");
  };

  const handleSaveAlias = (id: string) => {
    addressBookStore.updateAddressAlias(id, editAlias);
    setEditingId(null);
    setEditAlias("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditAlias("");
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this address?")) {
      addressBookStore.removeAddress(id);
    }
  };

  const handleSelectAddress = (item: AddressBookItem) => {
    if (onSelect) {
      onSelect(item.address, item.chain);
    }
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div
        className="bg-white rounded-t-[20px] md:rounded-[16px] w-full md:w-[600px] max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-[24px] border-b border-[#E5E7EB]">
          <h2 className="text-[20px] font-medium text-[#2B3337]">Address Book</h2>
          <button
            onClick={onClose}
            className="w-[32px] h-[32px] flex items-center justify-center rounded-[8px] hover:bg-[#F5F5F5] transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
            >
              <path
                d="M15 5L5 15M5 5L15 15"
                stroke="#9FA7BA"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-[24px]">
          {paginatedAddresses.length === 0 ? (
            <div className="text-center py-[40px] text-[#9FA7BA]">
              No saved addresses
            </div>
          ) : (
            <div className="space-y-[12px]">
              {paginatedAddresses.map((item) => {
                const chainInfo = chains[item.chain as keyof typeof chains];
                const isEditing = editingId === item.id;

                return (
                  <div
                    key={item.id}
                    className="bg-[#F5F5F5] rounded-[12px] p-[16px] hover:bg-[#EDF0F7] transition-colors"
                  >
                    <div className="flex items-start justify-between gap-[12px]">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-[8px] mb-[8px]">
                          {chainInfo && (
                            <img
                              src={chainInfo.chainIcon}
                              alt={chainInfo.chainName}
                              className="w-[24px] h-[24px] shrink-0"
                            />
                          )}
                          <span className="text-[14px] font-medium text-[#2B3337]">
                            {chainInfo?.chainName || item.chain}
                          </span>
                        </div>
                        {isEditing ? (
                          <div className="flex items-center gap-[8px]">
                            <input
                              type="text"
                              value={editAlias}
                              onChange={(e) => setEditAlias(e.target.value)}
                              placeholder="Enter alias"
                              className="flex-1 h-[32px] px-[8px] rounded-[6px] border border-[#E5E7EB] text-[14px] focus:outline-none focus:border-[#7083ee]"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  handleSaveAlias(item.id);
                                } else if (e.key === "Escape") {
                                  handleCancelEdit();
                                }
                              }}
                            />
                            <button
                              onClick={() => handleSaveAlias(item.id)}
                              className="px-[12px] h-[32px] rounded-[6px] bg-[#7083ee] text-white text-[12px] font-medium hover:bg-[#5a6bd8] transition-colors"
                            >
                              Save
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="px-[12px] h-[32px] rounded-[6px] bg-[#E5E7EB] text-[#9FA7BA] text-[12px] font-medium hover:bg-[#D1D5DB] transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="mb-[8px]">
                            {item.alias ? (
                              <div className="text-[14px] font-medium text-[#2B3337] mb-[4px]">
                                {item.alias}
                              </div>
                            ) : null}
                            <div className="text-[12px] text-[#9FA7BA] font-mono">
                              {formatAddress(item.address, 8, 8)}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-[8px] shrink-0">
                        {!isEditing && (
                          <>
                            <button
                              onClick={() => handleSelectAddress(item)}
                              className="px-[12px] h-[32px] rounded-[6px] bg-[#7083ee] text-white text-[12px] font-medium hover:bg-[#5a6bd8] transition-colors"
                            >
                              Select
                            </button>
                            <button
                              onClick={() => handleEditAlias(item)}
                              className="w-[32px] h-[32px] flex items-center justify-center rounded-[6px] bg-[#E5E7EB] text-[#9FA7BA] hover:bg-[#D1D5DB] transition-colors"
                              title="Edit alias"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="14"
                                height="14"
                                viewBox="0 0 14 14"
                                fill="none"
                              >
                                <path
                                  d="M8.75 2.625L11.375 5.25M9.625 1.875L2.625 8.875V11.5H5.25L12.25 4.5L9.625 1.875Z"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="w-[32px] h-[32px] flex items-center justify-center rounded-[6px] bg-[#E5E7EB] text-[#9FA7BA] hover:bg-[#FFE5EB] hover:text-[#FF6A8E] transition-colors"
                              title="Delete"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="14"
                                height="14"
                                viewBox="0 0 14 14"
                                fill="none"
                              >
                                <path
                                  d="M3.5 3.5L10.5 10.5M10.5 3.5L3.5 10.5"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer - Pagination */}
        {totalPage > 1 && (
          <div className="border-t border-[#E5E7EB] p-[24px]">
            <Pagination
              className="justify-center"
              totalPage={totalPage}
              page={page}
              pageSize={pageSize}
              onPageChange={(newPage: number) => {
                setPage(newPage);
              }}
            />
          </div>
        )}
      </div>
    </Modal>
  );
}
