import { useState, useEffect } from "react";
import axios from "axios";
import clsx from "clsx";
import chains from "@/config/chains";
import { formatNumber } from "@/utils/format/number";
import LazyImage from "@/components/layz-image";
import { TradeStatus, TradeStatusMap } from "@/config/trade";
import Pagination from "@/components/pagination";
import TokenLogo from "./token-logo";
import { formatAddress } from "@/utils/format/address";
import { formatTimeAgo } from "@/utils/format/time";
import useToast from "@/hooks/use-toast";
import { ProjectMap, type Project } from "@/services";
import GridTable from "@/components/grid-table";

interface TransferData {
  id: number;
  address: string;
  receive_address: string;
  deposit_address: string;
  from_chain: string;
  to_chain: string;
  token_in_amount: string;
  token_out_amount: string;
  volume: string;
  status: TradeStatus;
  trade_status: string;
  ip: string;
  symbol: string;
  to_symbol: string;
  asset_id: string;
  to_asset_id: string;
  create_time: string;
  project: Project;
}

interface ApiResponse {
  code: number;
  data: {
    list: TransferData[];
    total: number;
    total_page: number;
  };
}

interface TransfersProps {
  selectedToken: "USDT" | "USDC" | "USD1";
}

export default function Transfers({ selectedToken }: TransfersProps) {
  const toast = useToast();

  const [transfers, setTransfers] = useState<TransferData[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    fromChain: "",
    toChain: ""
  });
  const [pageSize, setPageSize] = useState(20);

  const fetchTransfers = async (page: number = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
        symbol: selectedToken.toLowerCase()
      });

      if (filters.fromChain) params.append("from_chain", filters.fromChain);
      if (filters.toChain) params.append("to_chain", filters.toChain);

      const response = await axios.get<ApiResponse>(
        `https://api.db3.app/api/stableflow/trade/list?${params.toString()}`
      );

      if (response.data.code === 200) {
        setTransfers(response.data.data.list || []);
        setTotalPages(response.data.data.total_page);
      }
    } catch (error) {
      console.error("Error fetching transfers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransfers(currentPage);
  }, [selectedToken, currentPage, filters, pageSize]);

  const getStatusColor = (status: TradeStatus) => {
    switch (status) {
      case TradeStatus.Success: return "text-green-600";
      case TradeStatus.Pending: return "text-yellow-600";
      case TradeStatus.Failed: return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const columns: any = [
    {
      title: "Network",
      dataIndex: "network",
      width: 250,
      render: (transfer: TransferData, idx: number) => {
        return (
          <div className="">
            <div className="flex items-center gap-2">
              {/* From Chain */}
              <div className="flex items-center gap-[6px]">
                <LazyImage
                  src={chains[transfer.from_chain]?.chainIcon}
                  width={16}
                  height={16}
                  alt=""
                  containerClassName="rounded-full shrink-0"
                />
                <span className="text-[12px] font-[500] text-[#2B3337]">
                  {chains[transfer.from_chain]?.chainName || transfer.from_chain}
                </span>
              </div>

              {/* Arrow */}
              <img
                src="/icon-arrow-right.svg"
                alt=""
                className="shrink-0 w-[5px] h-[8px] object-center object-contain"
              />

              {/* To Chain */}
              <div className="flex items-center gap-[6px]">
                <LazyImage
                  src={chains[transfer.to_chain]?.chainIcon}
                  width={16}
                  height={16}
                  alt=""
                  containerClassName="rounded-full shrink-0"
                />
                <span className="text-[12px] font-[500] text-[#2B3337]">
                  {chains[transfer.to_chain]?.chainName || transfer.to_chain}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-[8px] mt-2">
              <div className="text-[10px] text-[#9FA7BA] flex items-center gap-1">
                <div>
                  {formatAddress(transfer.address, 5, 4)}
                </div>
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
              <span className={clsx("text-[10px] font-[500]", getStatusColor(transfer.status))}>
                {TradeStatusMap[transfer.status as TradeStatus]?.name || "Unknown"}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      title: "Project",
      dataIndex: "project",
      width: 100,
      render: (transfer: TransferData, idx: number) => {
        return (
          <div
            className="text-[12px] font-[500] text-[#FFFFFF] px-2 py-0.5 rounded-sm"
            style={{
              backgroundColor: ProjectMap[transfer.project]?.color,
            }}
          >
            {ProjectMap[transfer.project]?.name}
          </div>
        );
      },
    },
    {
      title: "Assets",
      dataIndex: "assets",
      align: "right",
      render: (transfer: TransferData, idx: number) => {
        const isSwap = transfer.symbol !== transfer.to_symbol && transfer.from_chain === transfer.to_chain;
        return (
          <div className="">
            <div className="text-right">
              <div className="text-[14px] font-[400] text-[#2B3337] flex justify-end items-center gap-2">
                <div className="text-[12px] text-[#9FA7BA]">
                  {isSwap ? "Swap" : "Bridge"}
                </div>
                <div className="flex items-center gap-0.5">
                  <div className="">
                    {formatNumber(transfer.token_in_amount, 2, true)}
                  </div>
                  <TokenLogo
                    symbol={transfer.symbol}
                    chain={transfer.from_chain}
                    className="!w-[16px] !h-[16px] mr-1"
                  />
                  <div className="">
                    {transfer.symbol}
                  </div>
                </div>
                <img
                  src="/icon-arrow-right.svg"
                  alt=""
                  className="shrink-0 w-[5px] h-[8px] object-center object-contain"
                />
                <div className="flex items-center gap-0.5">
                  <div className="">
                    {formatNumber(transfer.token_out_amount, 2, true)}
                  </div>
                  <TokenLogo
                    symbol={transfer.to_symbol}
                    chain={transfer.to_chain}
                    className="!w-[16px] !h-[16px] mr-1"
                  />
                  <div className="">
                    {transfer.to_symbol}
                  </div>
                </div>
              </div>
              <div className="text-[12px] text-[#9FA7BA] mt-1">
                {formatNumber(transfer.volume, 2, true, { prefix: "$" })}
              </div>
            </div>
            <div className="text-[10px] text-[#9FA7BA] mt-1">
              {formatTimeAgo(transfer.create_time)}
            </div>
          </div>
        );
      },
    },
  ];

  return (
    <div className="w-full">
      <div className="text-[16px] font-[500] text-[#0E3616] mb-[12px]">
        Transfers
      </div>

      {/* Filters */}
      <div className="bg-white rounded-[12px] border border-[#F2F2F2] shadow-[0_2px_6px_0_rgba(0,0,0,0.10)] p-[20px] mb-[16px]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[12px]">
          <div>
            <label className="text-[12px] text-[#9FA7BA] mb-[4px] block">Source Network:</label>
            <select
              value={filters.fromChain}
              onChange={(e) => setFilters(prev => ({ ...prev, fromChain: e.target.value }))}
              className="w-full px-[8px] py-[6px] border border-[#F2F2F2] rounded-[6px] text-[12px]"
            >
              <option value="">All</option>
              {Object.entries(chains).map(([key, chain]) => (
                <option
                  key={key}
                  value={chain.blockchain}
                >
                  {chain.chainName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[12px] text-[#9FA7BA] mb-[4px] block">Destination Network:</label>
            <select
              value={filters.toChain}
              onChange={(e) => setFilters(prev => ({ ...prev, toChain: e.target.value }))}
              className="w-full px-[8px] py-[6px] border border-[#F2F2F2] rounded-[6px] text-[12px]"
            >
              <option value="">All</option>
              {Object.entries(chains).map(([key, chain]) => (
                <option
                  key={key}
                  value={chain.blockchain}
                >
                  {chain.chainName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[12px] text-[#9FA7BA] mb-[4px] block">Page Size:</label>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="w-full px-[8px] py-[6px] border border-[#F2F2F2] rounded-[6px] text-[12px]"
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
      <div className="bg-white rounded-[12px] border border-[#F2F2F2] shadow-[0_2px_6px_0_rgba(0,0,0,0.10)]">
        <GridTable
          columns={columns}
          data={transfers}
          loading={loading}
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
  );
}
