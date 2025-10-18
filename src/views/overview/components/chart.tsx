import { useMemo } from "react";
import Loading from "@/components/loading/icon";

interface ChartData {
  stat_time: number;
  symbol: string;
  users: number;
  volume: string;
  transactions: number;
}

interface ChartProps {
  data: ChartData[] | null;
  loading: boolean;
  timePeriod: "day" | "week" | "month";
  selectedPeriod: "day" | "week" | "month";
  onPeriodChange: (period: "day" | "week" | "month") => void;
}

export default function Chart({ data, loading, timePeriod, selectedPeriod, onPeriodChange }: ChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return null;

    const volumes = data.map(d => parseFloat(d.volume));
    const transactions = data.map(d => d.transactions);
    
    const maxVolume = Math.max(...volumes);
    const maxTransactions = Math.max(...transactions);

    // 使用绝对高度计算，基于实际数值
    return data.map((item, index) => ({
      ...item,
      volumePercent: maxVolume > 0 
        ? Math.max((parseFloat(item.volume) / maxVolume) * 100, 5) 
        : 5,
      transactionsPercent: maxTransactions > 0 
        ? Math.max((item.transactions / maxTransactions) * 100, 5) 
        : 5,
      date: new Date(item.stat_time * 1000),
      index
    }));
  }, [data]);

  const formatDate = (date: Date, period: string) => {
    if (period === "day") {
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } else if (period === "week") {
      return `Week ${Math.ceil(date.getDate() / 7)}`;
    } else {
      return date.toLocaleDateString("en-US", { month: "short" });
    }
  };

  const periods = [
    { value: "day", label: "30 Days", description: "D" },
    { value: "week", label: "15 Weeks", description: "M" },
    { value: "month", label: "12 Months", description: "Y" },
  ] as const;

  if (loading) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-[12px]">
          <div className="text-[16px] font-[500] text-[#0E3616]">
            Analytics Chart
          </div>
          <div className="bg-white rounded-[8px] border border-[#F2F2F2] p-[4px]">
            <div className="flex">
              {periods.map((period) => (
                <button
                  key={period.value}
                  onClick={() => onPeriodChange(period.value)}
                  className={`px-[12px] py-[6px] rounded-[6px] text-[12px] font-[500] transition-all duration-300 ${
                    selectedPeriod === period.value
                      ? "bg-[#6284F5] text-white shadow-[0_2px_4px_0_rgba(98,132,245,0.30)]"
                      : "text-[#9FA7BA] hover:text-[#2B3337] hover:bg-[#FAFBFF]"
                  }`}
                >
                  {period.description}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-[16px]">
          <div className="bg-white rounded-[12px] border border-[#F2F2F2] shadow-[0_2px_6px_0_rgba(0,0,0,0.10)] p-[20px]">
            <div className="flex items-center gap-[6px] mb-[16px]">
              <div className="w-[12px] h-[12px] bg-[#6284F5] rounded-[2px]"></div>
              <span className="text-[14px] font-[500] text-[#2B3337]">Volume</span>
            </div>
            <div className="flex items-center justify-center h-[140px]">
              <div className="flex flex-col items-center gap-[8px]">
                <Loading size={24} />
                <span className="text-[12px] text-[#9FA7BA]">Loading volume data...</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-[12px] border border-[#F2F2F2] shadow-[0_2px_6px_0_rgba(0,0,0,0.10)] p-[20px]">
            <div className="flex items-center gap-[6px] mb-[16px]">
              <div className="w-[12px] h-[12px] bg-[#56DEAD] rounded-[2px]"></div>
              <span className="text-[14px] font-[500] text-[#2B3337]">Transactions</span>
            </div>
            <div className="flex items-center justify-center h-[140px]">
              <div className="flex flex-col items-center gap-[8px]">
                <Loading size={24} />
                <span className="text-[12px] text-[#9FA7BA]">Loading transaction data...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-[12px]">
          <div className="text-[16px] font-[500] text-[#0E3616]">
            Analytics Chart
          </div>
          <div className="bg-white rounded-[8px] border border-[#F2F2F2] p-[4px]">
            <div className="flex">
              {periods.map((period) => (
                <button
                  key={period.value}
                  onClick={() => onPeriodChange(period.value)}
                  className={`px-[12px] py-[6px] rounded-[6px] text-[12px] font-[500] transition-all duration-300 ${
                    selectedPeriod === period.value
                      ? "bg-[#6284F5] text-white shadow-[0_2px_4px_0_rgba(98,132,245,0.30)]"
                      : "text-[#9FA7BA] hover:text-[#2B3337] hover:bg-[#FAFBFF]"
                  }`}
                >
                  {period.description}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-[16px]">
          <div className="bg-white rounded-[12px] border border-[#F2F2F2] shadow-[0_2px_6px_0_rgba(0,0,0,0.10)] p-[20px]">
            <div className="flex items-center gap-[6px] mb-[16px]">
              <div className="w-[12px] h-[12px] bg-[#6284F5] rounded-[2px]"></div>
              <span className="text-[14px] font-[500] text-[#2B3337]">Volume</span>
            </div>
            <div className="flex items-center justify-center h-[120px] text-[#9FA7BA] text-[14px]">
              📊 No volume data available
            </div>
          </div>
          <div className="bg-white rounded-[12px] border border-[#F2F2F2] shadow-[0_2px_6px_0_rgba(0,0,0,0.10)] p-[20px]">
            <div className="flex items-center gap-[6px] mb-[16px]">
              <div className="w-[12px] h-[12px] bg-[#56DEAD] rounded-[2px]"></div>
              <span className="text-[14px] font-[500] text-[#2B3337]">Transactions</span>
            </div>
            <div className="flex items-center justify-center h-[120px] text-[#9FA7BA] text-[14px]">
              📈 No transaction data available
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-[12px]">
        <div className="text-[16px] font-[500] text-[#0E3616]">
          Analytics Chart
        </div>
        <div className="bg-white rounded-[8px] border border-[#F2F2F2] p-[4px]">
          <div className="flex">
            {periods.map((period) => (
              <button
                key={period.value}
                onClick={() => onPeriodChange(period.value)}
                className={`px-[12px] py-[6px] rounded-[6px] text-[12px] font-[500] transition-all duration-300 ${
                  selectedPeriod === period.value
                    ? "bg-[#6284F5] text-white shadow-[0_2px_4px_0_rgba(98,132,245,0.30)]"
                    : "text-[#9FA7BA] hover:text-[#2B3337] hover:bg-[#FAFBFF]"
                }`}
              >
                {period.description}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="flex flex-col gap-[16px]">
        {/* Volume Chart */}
        <div className="bg-white rounded-[12px] border border-[#F2F2F2] shadow-[0_2px_6px_0_rgba(0,0,0,0.10)] p-[20px]">
          <div className="flex items-center gap-[6px] mb-[16px]">
            <div className="w-[12px] h-[12px] bg-[#6284F5] rounded-[2px]"></div>
            <span className="text-[14px] font-[500] text-[#2B3337]">Volume</span>
          </div>
          
          <div className="flex items-end justify-between h-[140px] gap-[2px] relative">
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[10px] text-[#9FA7BA] pr-[8px]">
              <span>${Math.max(...chartData.map(d => parseFloat(d.volume))).toLocaleString()}</span>
              <span>${Math.round(Math.max(...chartData.map(d => parseFloat(d.volume))) * 0.75).toLocaleString()}</span>
              <span>${Math.round(Math.max(...chartData.map(d => parseFloat(d.volume))) * 0.5).toLocaleString()}</span>
              <span>${Math.round(Math.max(...chartData.map(d => parseFloat(d.volume))) * 0.25).toLocaleString()}</span>
              <span>${Math.min(...chartData.map(d => parseFloat(d.volume))).toLocaleString()}</span>
            </div>
            
            {/* Grid lines */}
            <div className="absolute left-[60px] top-0 w-full h-full">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-[#F2F2F2]"></div>
              <div className="absolute top-[25%] left-0 w-full h-[1px] bg-[#F2F2F2]"></div>
              <div className="absolute top-[50%] left-0 w-full h-[1px] bg-[#F2F2F2]"></div>
              <div className="absolute top-[75%] left-0 w-full h-[1px] bg-[#F2F2F2]"></div>
              <div className="absolute bottom-0 left-0 w-full h-[1px] bg-[#F2F2F2]"></div>
            </div>
            
            {/* Chart bars */}
            <div className="flex items-end justify-between w-full ml-[60px] gap-[2px]">
              {chartData.map((item, index) => (
                <div key={`${item.stat_time}-${index}`} className="flex-1 flex flex-col items-center relative group">
                  <div
                    className="w-full bg-[#6284F5] rounded-t-[2px] transition-all duration-500 ease-out hover:opacity-80 cursor-pointer relative"
                    style={{ 
                      height: `${item.volumePercent}%`,
                      minHeight: '12px',
                      animationDelay: `${index * 50}ms`
                    }}
                  />
                  
                  {/* Value tooltip on hover */}
                  <div className="absolute -top-[30px] left-1/2 transform -translate-x-1/2 bg-[#2B3337] text-white text-[10px] px-[6px] py-[2px] rounded-[4px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                    ${parseFloat(item.volume).toLocaleString()}
                  </div>
                  
                  <div className="text-[10px] text-[#9FA7BA] mt-[6px] text-center">
                    {formatDate(item.date, timePeriod)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Transactions Chart */}
        <div className="bg-white rounded-[12px] border border-[#F2F2F2] shadow-[0_2px_6px_0_rgba(0,0,0,0.10)] p-[20px]">
          <div className="flex items-center gap-[6px] mb-[16px]">
            <div className="w-[12px] h-[12px] bg-[#56DEAD] rounded-[2px]"></div>
            <span className="text-[14px] font-[500] text-[#2B3337]">Transactions</span>
          </div>
          
          <div className="flex items-end justify-between h-[140px] gap-[2px] relative">
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[10px] text-[#9FA7BA] pr-[8px]">
              <span>{Math.max(...chartData.map(d => d.transactions))}</span>
              <span>{Math.round(Math.max(...chartData.map(d => d.transactions)) * 0.75)}</span>
              <span>{Math.round(Math.max(...chartData.map(d => d.transactions)) * 0.5)}</span>
              <span>{Math.round(Math.max(...chartData.map(d => d.transactions)) * 0.25)}</span>
              <span>{Math.min(...chartData.map(d => d.transactions))}</span>
            </div>
            
            {/* Grid lines */}
            <div className="absolute left-[60px] top-0 w-full h-full">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-[#F2F2F2]"></div>
              <div className="absolute top-[25%] left-0 w-full h-[1px] bg-[#F2F2F2]"></div>
              <div className="absolute top-[50%] left-0 w-full h-[1px] bg-[#F2F2F2]"></div>
              <div className="absolute top-[75%] left-0 w-full h-[1px] bg-[#F2F2F2]"></div>
              <div className="absolute bottom-0 left-0 w-full h-[1px] bg-[#F2F2F2]"></div>
            </div>
            
            {/* Chart bars */}
            <div className="flex items-end justify-between w-full ml-[60px] gap-[2px]">
              {chartData.map((item, index) => (
                <div key={`${item.stat_time}-${index}`} className="flex-1 flex flex-col items-center relative group">
                  <div
                    className="w-full bg-[#56DEAD] rounded-t-[2px] transition-all duration-500 ease-out hover:opacity-80 cursor-pointer relative"
                    style={{ 
                      height: `${item.transactionsPercent}%`,
                      minHeight: '12px',
                      animationDelay: `${index * 50}ms`
                    }}
                  />
                  
                  {/* Value tooltip on hover */}
                  <div className="absolute -top-[30px] left-1/2 transform -translate-x-1/2 bg-[#2B3337] text-white text-[10px] px-[6px] py-[2px] rounded-[4px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                    {item.transactions}
                  </div>
                  
                  <div className="text-[10px] text-[#9FA7BA] mt-[6px] text-center">
                    {formatDate(item.date, timePeriod)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}