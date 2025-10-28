import Loading from "@/components/loading/icon";
import { formatNumber } from "@/utils/format/number";

interface DashboardData {
  symbol: string;
  users: number;
  volume: string;
  transactions: number;
}

interface OverviewStatsProps {
  data: DashboardData | null;
  loading: boolean;
}

export default function OverviewStats({ data, loading }: OverviewStatsProps) {
  const stats = [
    // {
    //   label: "Total Users",
    //   value: data?.users || 0,
    //   icon: "👥"
    // },
    {
      label: "Total Volume", 
      value: formatNumber(data?.volume, 2, true, { isShort: true, isShortUppercase: true, prefix: "$" }),
      icon: "💰"
    },
    {
      label: "Total Transactions",
      value: formatNumber(data?.transactions, 2, true, { isShort: true, isShortUppercase: true }),
      icon: "📊"
    }
  ];

  return (
    <div className="w-full">
      <div className="text-[16px] font-[500] text-[#0E3616] mb-[12px]">
        Overview Statistics
      </div>
      <div className="grid grid-cols-2 md:grid-cols-2 gap-[12px]">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-[12px] border border-[#F2F2F2] shadow-[0_2px_6px_0_rgba(0,0,0,0.10)] p-[16px]"
          >
            <div className="flex items-center justify-between mb-[8px]">
              <span className="text-[12px] text-[#9FA7BA] font-[500]">
                {stat.label}
              </span>
              <span className="text-[16px]">{stat.icon}</span>
            </div>
            <div className="flex items-center">
              {loading ? (
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
  );
}
