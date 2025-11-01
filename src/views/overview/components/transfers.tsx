import { useState, useEffect } from "react";
import axios from "axios";
import Loading from "@/components/loading/icon";
import clsx from "clsx";

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
  status: number;
  trade_status: string;
  ip: string;
  symbol: string;
  to_symbol: string;
  asset_id: string;
  to_asset_id: string;
  create_time: string;
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

const chainNames: Record<string, string> = {
  eth: "Ethereum",
  arb: "Arbitrum", 
  pol: "Polygon",
  bsc: "BNB Chain",
  op: "Optimism",
  avax: "Avalanche",
  near: "Near",
  sol: "Solana",
  tron: "Tron",
  aptos: "Aptos",
};

const chainColors: Record<string, string> = {
  eth: "#627EEA",
  arb: "#2D374B",
  pol: "#8247E5", 
  bsc: "#F3BA2F",
  op: "#FF0420",
  avax: "#E84142",
  near: "#00C4B3",
  sol: "#9945FF",
  tron: "#FF060A",
  aptos: "#000000",
};

export default function Transfers({ selectedToken }: TransfersProps) {
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
        setTransfers(response.data.data.list);
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

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const transferTime = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - transferTime.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SUCCESS": return "text-green-600";
      case "PENDING": return "text-yellow-600";
      case "FAILED": return "text-red-600";
      default: return "text-gray-600";
    }
  };

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
              {Object.entries(chainNames).map(([key, name]) => (
                <option key={key} value={key}>{name}</option>
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
              {Object.entries(chainNames).map(([key, name]) => (
                <option key={key} value={key}>{name}</option>
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
        {loading ? (
          <div className="flex items-center justify-center h-[200px]">
            <div className="flex flex-col items-center gap-[8px]">
              <Loading size={24} />
              <span className="text-[12px] text-[#9FA7BA]">Loading transfers...</span>
            </div>
          </div>
        ) : transfers.length === 0 ? (
          <div className="flex items-center justify-center h-[200px] text-[#9FA7BA]">
            No transfers found
          </div>
        ) : (
          <div className="divide-y divide-[#F2F2F2]">
            {transfers.map((transfer) => (
              <div key={transfer.id} className="p-[16px] hover:bg-[#FAFBFF] transition-colors duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-[12px]">
                    {/* From Chain */}
                    <div className="flex items-center gap-[6px]">
                      <div 
                        className="w-[8px] h-[8px] rounded-full"
                        style={{ backgroundColor: chainColors[transfer.from_chain] || "#9FA7BA" }}
                      />
                      <span className="text-[12px] font-[500] text-[#2B3337]">
                        {chainNames[transfer.from_chain] || transfer.from_chain}
                      </span>
                    </div>
                    
                    {/* Arrow */}
                    <svg 
                      width="12" 
                      height="12" 
                      viewBox="0 0 12 12" 
                      fill="none" 
                      className="text-[#9FA7BA]"
                    >
                      <path 
                        d="M1 6H11M11 6L6 1M11 6L6 11" 
                        stroke="currentColor" 
                        strokeWidth="1.5" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      />
                    </svg>
                    
                    {/* To Chain */}
                    <div className="flex items-center gap-[6px]">
                      <div 
                        className="w-[8px] h-[8px] rounded-full"
                        style={{ backgroundColor: chainColors[transfer.to_chain] || "#9FA7BA" }}
                      />
                      <span className="text-[12px] font-[500] text-[#2B3337]">
                        {chainNames[transfer.to_chain] || transfer.to_chain}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-[14px] font-[500] text-[#2B3337]">
                      {parseFloat(transfer.token_in_amount).toLocaleString()} {transfer.symbol}
                    </div>
                    <div className="text-[12px] text-[#9FA7BA]">
                      ${parseFloat(transfer.volume).toLocaleString()}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-[8px]">
                  <div className="flex items-center gap-[8px]">
                    <span className="text-[10px] text-[#9FA7BA]">
                      {formatAddress(transfer.address)}
                    </span>
                    <span className={clsx("text-[10px] font-[500]", getStatusColor(transfer.trade_status))}>
                      {transfer.trade_status}
                    </span>
                  </div>
                  
                  <div className="text-[10px] text-[#9FA7BA]">
                    {formatTimeAgo(transfer.create_time)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-[16px] border-t border-[#F2F2F2]">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-[12px] py-[6px] text-[12px] border border-[#F2F2F2] rounded-[6px] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#FAFBFF]"
            >
              Previous
            </button>
            
            <span className="text-[12px] text-[#9FA7BA]">
              Page {currentPage} of {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-[12px] py-[6px] text-[12px] border border-[#F2F2F2] rounded-[6px] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#FAFBFF]"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
