import { useState, useEffect } from "react";
import axios from "axios";
import MainTitle from "@/components/main-title";
import Loading from "@/components/loading/icon";
import GridTable from "@/components/grid-table";
import Pagination from "@/components/pagination";
import { formatNumber } from "@/utils/format/number";
import { formatAddress } from "@/utils/format/address";
import { formatTimeAgo } from "@/utils/format/time";
import { BASE_API_URL } from "@/config/api";
import useToast from "@/hooks/use-toast";

interface DashboardData {
  transactions: number;
  users: number;
  amount: string;
}

interface TransferData {
  address: string;
  amount: string;
  tx_hash: string;
  send_time: string;
}

interface DashboardResponse {
  code: number;
  data: DashboardData;
}

interface TransfersResponse {
  code: number;
  data: {
    list: TransferData[];
    total: number;
    total_page: number;
  };
}

export default function Hyperliquid() {
  const toast = useToast();

  // Dashboard data state
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);

  // Transfers data state
  const [transfers, setTransfers] = useState<TransferData[]>([]);
  const [transfersLoading, setTransfersLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [addressFilter, setAddressFilter] = useState("");

  // Fetch dashboard data
  const fetchDashboard = async () => {
    setDashboardLoading(true);
    try {
      const response = await axios.get<DashboardResponse>(
        `${BASE_API_URL}/v1/deposit/dashboard`
      );
      if (response.data.code === 200) {
        setDashboardData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching dashboard:", error);
    } finally {
      setDashboardLoading(false);
    }
  };

  // Fetch transfers data
  const fetchTransfers = async (page: number = 1) => {
    setTransfersLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
      });

      if (addressFilter.trim()) {
        params.append("address", addressFilter.trim());
      }

      const response = await axios.get<TransfersResponse>(
        `${BASE_API_URL}/v1/deposit/dashboard/trades?${params.toString()}`
      );

      if (response.data.code === 200) {
        setTransfers(response.data.data.list || []);
        setTotalPages(response.data.data.total_page);
      }
    } catch (error) {
      console.error("Error fetching transfers:", error);
    } finally {
      setTransfersLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  useEffect(() => {
    fetchTransfers(currentPage);
  }, [currentPage, pageSize]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchTransfers(1);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const stats = [
    {
      label: "Total Amount",
      value: formatNumber(dashboardData?.amount, 2, true, {
        isShort: true,
        isShortUppercase: true,
        prefix: "$",
      }),
    },
    {
      label: "Total Transactions",
      value: formatNumber(dashboardData?.transactions, 0, true, {
        isShort: true,
        isShortUppercase: true,
      }),
    },
    {
      label: "Total Users",
      value: formatNumber(dashboardData?.users, 0, true, {
        isShort: true,
        isShortUppercase: true,
      }),
    },
  ];

  const columns: any = [
    {
      title: "Address",
      dataIndex: "address",
      width: 200,
      render: (transfer: TransferData) => {
        return (
          <div className="flex items-center gap-[8px]">
            <span className="text-[12px] font-[500] text-[#2B3337]">
              {formatAddress(transfer.address, 6, 4)}
            </span>
            <button
              type="button"
              className="button w-[16px] h-[16px] shrink-0 bg-[url('/icon-copy.svg')] bg-center bg-no-repeat bg-[length:10px_10px]"
              onClick={() => {
                navigator.clipboard.writeText(transfer.address);
                toast.success({
                  title: "Copied to clipboard",
                });
              }}
            />
          </div>
        );
      },
    },
    {
      title: "Amount",
      dataIndex: "amount",
      width: 150,
      render: (transfer: TransferData) => {
        return (
          <span className="text-[12px] font-[500] text-[#2B3337]">
            {formatNumber(transfer.amount, 2, true)}
          </span>
        );
      },
    },
    {
      title: "Transaction Hash",
      dataIndex: "tx_hash",
      render: (transfer: TransferData) => {
        return (
          <div className="flex items-center gap-[8px]">
            <span className="text-[12px] text-[#2B3337]">
              {formatAddress(transfer.tx_hash, 10, 8)}
            </span>
            <button
              type="button"
              className="button w-[16px] h-[16px] shrink-0 bg-[url('/icon-copy.svg')] bg-center bg-no-repeat bg-[length:10px_10px]"
              onClick={() => {
                navigator.clipboard.writeText(transfer.tx_hash);
                toast.success({
                  title: "Copied to clipboard",
                });
              }}
            />
          </div>
        );
      },
    },
    {
      title: "Time",
      dataIndex: "send_time",
      width: 150,
      align: "right",
      render: (transfer: TransferData) => {
        return (
          <span className="text-[12px] text-[#9FA7BA]">
            {formatTimeAgo(transfer.send_time)}
          </span>
        );
      },
    },
  ];

  return (
    <div className="w-full min-h-[100dvh] flex flex-col items-center mb-[100px]">
      <div className="md:w-[1100px] w-full mx-auto pt-[60px] md:pt-[60px] shrink-0 relative">
        <MainTitle
          className="!hidden md:!flex"
          logo="/logo-hyperliquid.svg"
        />
        <div className="text-[16px] text-center w-full hidden md:block mb-[30px]">
          Hyperliquid Deposits
        </div>

        {/* Overview Statistics */}
        <div className="px-[10px] md:px-0 mb-[20px]">
          <div className="text-[16px] font-[500] text-[#0E3616] mb-[12px]">
            Overview Statistics
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-[15px]">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white rounded-[12px] border border-[#F2F2F2] shadow-[0_2px_6px_0_rgba(0,0,0,0.10)] p-[16px]"
              >
                <div className="flex items-center justify-between mb-[8px]">
                  <span className="text-[12px] text-[#9FA7BA] font-[500]">
                    {stat.label}
                  </span>
                </div>
                <div className="flex items-center">
                  {dashboardLoading ? (
                    <Loading size={16} />
                  ) : (
                    <span className="text-[20px] font-[500] text-[#2B3337]">
                      {stat.value}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Transfers */}
        <div className="px-[10px] md:px-0">
          <div className="text-[16px] font-[500] text-[#0E3616] mb-[12px]">
            Transfers
          </div>

          {/* Filter */}
          <div className="bg-white rounded-[12px] border border-[#F2F2F2] shadow-[0_2px_6px_0_rgba(0,0,0,0.10)] p-[20px] mb-[16px]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-[12px]">
              <div>
                <label className="text-[12px] text-[#9FA7BA] mb-[4px] block">
                  Address:
                </label>
                <div className="flex gap-[8px]">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={addressFilter}
                      onChange={(e) => setAddressFilter(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Enter address to filter"
                      className="w-full px-[8px] py-[6px] pr-[28px] border border-[#F2F2F2] rounded-[6px] text-[12px] outline-none focus:border-[#0E3616]"
                    />
                    {addressFilter && (
                      <button
                        type="button"
                        onClick={() => {
                          setAddressFilter("");
                          setCurrentPage(1);
                          fetchTransfers(1);
                        }}
                        className="button absolute right-[8px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] flex items-center justify-center text-[#9FA7BA] hover:text-[#2B3337] transition-colors"
                        aria-label="Clear"
                      >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9 3L3 9M3 3L9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleSearch}
                    className="button px-[12px] py-[6px] bg-[#6284F5] text-white rounded-[6px] text-[12px] hover:opacity-80 transition-opacity"
                  >
                    Search
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[12px] text-[#9FA7BA] mb-[4px] block">
                  Page Size:
                </label>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="button w-full px-[8px] py-[6px] border border-[#F2F2F2] rounded-[6px] text-[12px]"
                >
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </div>
            </div>
          </div>

          {/* Transfers List */}
          <div className="bg-white rounded-[12px] border border-[#F2F2F2] shadow-[0_2px_6px_0_rgba(0,0,0,0.10)] overflow-x-auto">
            <GridTable
              columns={columns}
              data={transfers}
              loading={transfersLoading}
              bodyClassName="max-h-[1700px] overflow-y-auto"
              rowClassName="!px-5"
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="py-2 flex justify-end items-center">
                <Pagination
                  className=""
                  totalPage={totalPages}
                  page={currentPage}
                  pageSize={pageSize}
                  onPageChange={(page: number) => setCurrentPage(page)}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
