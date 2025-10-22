import Loading from "@/components/loading/icon";

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
  const formatVolume = (volume: string) => {
    const num = parseFloat(volume);
    if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `$${(num / 1000).toFixed(1)}K`;
    }
    return `$${num.toFixed(2)}`;
  };

  const stats = [
    // {
    //   label: "Total Users",
    //   value: data?.users || 0,
    //   icon: "👥"
    // },
    {
      label: "Total Volume", 
      value: data ? formatVolume(data.volume) : "$0",
      icon: "💰"
    },
    {
      label: "Total Transactions",
      value: data?.transactions || 0,
      icon: "📊"
    }
  ];

  return (
    <div className="w-full">
      <div className="text-[16px] font-[500] text-[#0E3616] mb-[12px]">
        Overview Statistics
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[12px]">
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
