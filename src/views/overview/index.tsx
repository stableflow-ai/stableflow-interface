import { useState } from "react";
import MainTitle from "@/components/main-title";
import TokenTabs from "./components/token-tabs";
import OverviewStats from "./components/overview-stats";
import Chart from "./components/chart";
import Transfers from "./components/transfers";
import useOverviewData from "./hooks/use-overview-data";
import BackButton from "@/components/back-button";
import Sankey from "./components/sankey";

export default function Overview() {
  const [selectedToken, setSelectedToken] = useState<"USDT" | "USDC" | "USD1">("USDT");
  const [timePeriod, setTimePeriod] = useState<"day" | "week" | "month">("day");

  const { dashboardData, chartData, loading, chartLoading } = useOverviewData(selectedToken, timePeriod);

  return (
    <div className="w-full min-h-[100dvh] flex flex-col items-center mb-[100px]">
      <div className="md:w-[680px] w-full mx-auto pt-[60px] md:pt-[60px] shrink-0 relative">
        <BackButton
          className="absolute translate-y-[10px]"
        />
        <MainTitle className="!hidden md:!flex" />
        <div className="text-[16px] text-center w-full hidden md:block mb-[30px]">
          Overview & Analytics
        </div>

        {/* Token Selection Tabs */}
        <div className="px-[10px] md:px-0 mb-[20px]">
          <TokenTabs
            selectedToken={selectedToken}
            onTokenChange={setSelectedToken}
          />
        </div>

        {/* Overview Stats */}
        <div className="px-[10px] md:px-0 mb-[20px]">
          <OverviewStats data={dashboardData} loading={loading} />
        </div>

        {/* Chart with Time Period */}
        <div className="px-[10px] md:px-0 mb-[20px]">
          <Chart
            data={chartData}
            loading={chartLoading}
            timePeriod={timePeriod}
            selectedPeriod={timePeriod}
            onPeriodChange={setTimePeriod}
          />
        </div>

        {/* Sankey Diagram */}
        <div className="px-[10px] md:px-0 mb-[20px]">
          <Sankey
          />
        </div>

        {/* Transfers */}
        <div className="px-[10px] md:px-0">
          <Transfers selectedToken={selectedToken} />
        </div>
      </div>
    </div>
  );
}
