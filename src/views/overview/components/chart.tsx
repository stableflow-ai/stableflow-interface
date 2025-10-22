import { useMemo, useEffect, useRef } from "react";
import * as d3 from "d3";
import dayjs from "@/libs/dayjs";
import Loading from "@/components/loading/icon";
import { formatNumber } from "@/utils/format/number";

// Helper function to format x-axis labels based on selected period
const formatXAxisLabel = (date: dayjs.Dayjs, selectedPeriod: "day" | "week" | "month"): string => {
  switch (selectedPeriod) {
    case "day":
      return date.format('MM/DD');
    case "week":
      const startDate = date;
      const endDate = date.add(6, 'days');
      return `${startDate.format('MM/DD')} - ${endDate.format('MM/DD')}`;
    case "month":
      return date.format('MMM');
    default:
      return date.format('MM/DD');
  }
};

// Helper function to format tooltip dates based on selected period
const formatTooltipDate = (date: dayjs.Dayjs, selectedPeriod: "day" | "week" | "month"): string => {
  switch (selectedPeriod) {
    case "day":
      return date.format('YYYY-MM-DD');
    case "week":
      const startDate = date;
      const endDate = date.add(6, 'days');
      return `${startDate.format('YYYY-MM-DD')} - ${endDate.format('YYYY-MM-DD')}`;
    case "month":
      return date.format('YYYY-MM');
    default:
      return date.format('YYYY-MM-DD');
  }
};

// Helper function to get tooltip date label based on selected period
const getTooltipDateLabel = (selectedPeriod: "day" | "week" | "month"): string => {
  switch (selectedPeriod) {
    case "month":
      return "Month";
    default:
      return "Date";
  }
};

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
  selectedPeriod: "day" | "week" | "month";
  onPeriodChange: (period: "day" | "week" | "month") => void;
}

// Volume Chart Component
const VolumeChart = ({ data, selectedPeriod }: { data: ChartData[], selectedPeriod: "day" | "week" | "month" }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  const drawChart = () => {
    if (!data || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Remove existing tooltip
    d3.selectAll(".volume-tooltip").remove();

    const margin = { top: 20, right: 20, bottom: 40, left: 50 };
    const containerWidth = svgRef.current?.parentElement?.clientWidth || 400;
    const width = containerWidth - margin.left - margin.right;
    const height = 240 - margin.top - margin.bottom;

    const g = svg
      .attr("width", containerWidth)
      .attr("height", 240)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Process data
    const processedData = data.map(d => ({
      ...d,
      volume: parseFloat(d.volume),
      date: dayjs.unix(d.stat_time).utc()
    }));

    // Set up scales
    const xScale = d3.scaleBand()
      .domain(processedData.map(d => formatXAxisLabel(d.date, selectedPeriod)))
      .range([0, width])
      .padding(0.1);

    const maxVolume = d3.max(processedData, d => d.volume) || 0;
    const yScale = d3.scaleLinear()
      .domain([0, Math.max(maxVolume, maxVolume * 0.1)])
      .range([height, 0]);

    // Create tooltip
    const tooltip = d3.select("body")
      .append("div")
      .attr("class", "volume-tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background", "rgba(0, 0, 0, 0.8)")
      .style("color", "white")
      .style("padding", "8px 12px")
      .style("border-radius", "6px")
      .style("font-size", "12px")
      .style("z-index", "1000")
      .style("pointer-events", "none");

    // Draw bars
    g.selectAll(".bar")
      .data(processedData)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", d => xScale(formatXAxisLabel(d.date, selectedPeriod)) || 0)
      .attr("y", d => yScale(d.volume))
      .attr("width", xScale.bandwidth())
      .attr("height", d => height - yScale(d.volume))
      .attr("fill", "#6284F5")
      .attr("rx", 2)
      .on("mouseover", function (_, d) {
        tooltip
          .style("visibility", "visible")
          .html(`
            <div><strong>${getTooltipDateLabel(selectedPeriod)}:</strong> ${formatTooltipDate(d.date, selectedPeriod)}</div>
            <div><strong>Volume:</strong> ${formatNumber(d.volume, 2, true, { prefix: "$" })}</div>
            <div><strong>Users:</strong> ${formatNumber(d.users, 0, true)}</div>
          `);
      })
      .on("mousemove", function (event) {
        tooltip
          .style("top", (event.pageY - 10) + "px")
          .style("left", (event.pageX + 10) + "px");
      })
      .on("mouseout", function () {
        tooltip.style("visibility", "hidden");
      });

    // Add X axis
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .style("font-size", "10px")
      .style("fill", "#9FA7BA");

    // Add Y axis
    g.append("g")
      .call(d3.axisLeft(yScale)
        .tickFormat(d3.format(".0s"))
        .ticks(5)
      )
      .selectAll("text")
      .style("font-size", "10px")
      .style("fill", "#9FA7BA");

    // Remove axis lines
    g.selectAll(".domain").remove();
    g.selectAll(".tick line").remove();
  };

  useEffect(() => {
    drawChart();

    // Add resize listener
    const handleResize = () => {
      drawChart();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [data, selectedPeriod]);

  return <svg ref={svgRef} className="w-full h-full" />;
};

// Transactions Chart Component
const TransactionsChart = ({ data, selectedPeriod }: { data: ChartData[], selectedPeriod: "day" | "week" | "month" }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  const drawChart = () => {
    if (!data || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Remove existing tooltip
    d3.selectAll(".transactions-tooltip").remove();

    const margin = { top: 20, right: 20, bottom: 40, left: 50 };
    const containerWidth = svgRef.current?.parentElement?.clientWidth || 400;
    const width = containerWidth - margin.left - margin.right;
    const height = 240 - margin.top - margin.bottom;

    const g = svg
      .attr("width", containerWidth)
      .attr("height", 240)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Process data
    const processedData = data.map(d => ({
      ...d,
      date: dayjs.unix(d.stat_time).utc()
    }));

    // Set up scales
    const xScale = d3.scaleBand()
      .domain(processedData.map(d => formatXAxisLabel(d.date, selectedPeriod)))
      .range([0, width])
      .padding(0.1);

    const maxTransactions = d3.max(processedData, d => d.transactions) || 0;
    const yScale = d3.scaleLinear()
      .domain([0, Math.max(maxTransactions, maxTransactions * 0.1)])
      .range([height, 0]);

    // Create tooltip
    const tooltip = d3.select("body")
      .append("div")
      .attr("class", "transactions-tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background", "rgba(0, 0, 0, 0.8)")
      .style("color", "white")
      .style("padding", "8px 12px")
      .style("border-radius", "6px")
      .style("font-size", "12px")
      .style("z-index", "1000")
      .style("pointer-events", "none");

    // Draw bars
    g.selectAll(".bar")
      .data(processedData)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", d => xScale(formatXAxisLabel(d.date, selectedPeriod)) || 0)
      .attr("y", d => yScale(d.transactions))
      .attr("width", xScale.bandwidth())
      .attr("height", d => height - yScale(d.transactions))
      .attr("fill", "#56DEAD")
      .attr("rx", 2)
      .on("mouseover", function (_, d) {
        tooltip
          .style("visibility", "visible")
          .html(`
            <div><strong>${getTooltipDateLabel(selectedPeriod)}:</strong> ${formatTooltipDate(d.date, selectedPeriod)}</div>
            <div><strong>Transactions:</strong> ${d3.format(".2s")(d.transactions)}</div>
            <div><strong>Users:</strong> ${formatNumber(d.users, 0, true)}</div>
          `);
      })
      .on("mousemove", function (event) {
        tooltip
          .style("top", (event.pageY - 10) + "px")
          .style("left", (event.pageX + 10) + "px");
      })
      .on("mouseout", function () {
        tooltip.style("visibility", "hidden");
      });

    // Add X axis
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .style("font-size", "10px")
      .style("fill", "#9FA7BA");

    // Add Y axis
    g.append("g")
      .call(d3.axisLeft(yScale)
        .ticks(5)
      )
      .selectAll("text")
      .style("font-size", "10px")
      .style("fill", "#9FA7BA");

    // Remove axis lines
    g.selectAll(".domain").remove();
    g.selectAll(".tick line").remove();
  };

  useEffect(() => {
    drawChart();

    // Add resize listener
    const handleResize = () => {
      drawChart();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [data, selectedPeriod]);

  return <svg ref={svgRef} className="w-full h-full" />;
};

export default function Chart({ data, loading, selectedPeriod, onPeriodChange }: ChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return null;

    return data;
  }, [data, selectedPeriod]);

  const periods = [
    { value: "day", label: "30 Days", description: "D" },
    { value: "week", label: "15 Weeks", description: "W" },
    { value: "month", label: "12 Months", description: "M" },
  ] as const;

  if (loading) {
    return (
      <div className="w-full">
        <Header
          periods={periods}
          onPeriodChange={onPeriodChange}
          selectedPeriod={selectedPeriod}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
          <div className="bg-white rounded-[12px] border border-[#F2F2F2] shadow-[0_2px_6px_0_rgba(0,0,0,0.10)] p-[20px] pb-0">
            <div className="flex items-center gap-[6px] mb-[16px]">
              <div className="w-[12px] h-[12px] bg-[#6284F5] rounded-[2px]"></div>
              <span className="text-[14px] font-[500] text-[#2B3337]">Volume</span>
            </div>
            <div className="flex items-center justify-center h-[240px]">
              <div className="flex flex-col items-center gap-[8px]">
                <Loading size={24} />
                <span className="text-[12px] text-[#9FA7BA]">Loading volume data...</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-[12px] border border-[#F2F2F2] shadow-[0_2px_6px_0_rgba(0,0,0,0.10)] p-[20px] pb-0">
            <div className="flex items-center gap-[6px] mb-[16px]">
              <div className="w-[12px] h-[12px] bg-[#56DEAD] rounded-[2px]"></div>
              <span className="text-[14px] font-[500] text-[#2B3337]">Transactions</span>
            </div>
            <div className="flex items-center justify-center h-[240px]">
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
        <Header
          periods={periods}
          onPeriodChange={onPeriodChange}
          selectedPeriod={selectedPeriod}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
          <div className="bg-white rounded-[12px] border border-[#F2F2F2] shadow-[0_2px_6px_0_rgba(0,0,0,0.10)] p-[20px] pb-0">
            <div className="flex items-center gap-[6px] mb-[16px]">
              <div className="w-[12px] h-[12px] bg-[#6284F5] rounded-[2px]"></div>
              <span className="text-[14px] font-[500] text-[#2B3337]">Volume</span>
            </div>
            <div className="flex items-center justify-center h-[220px] text-[#9FA7BA] text-[14px]">
              📊 No volume data available
            </div>
          </div>
          <div className="bg-white rounded-[12px] border border-[#F2F2F2] shadow-[0_2px_6px_0_rgba(0,0,0,0.10)] p-[20px] pb-0">
            <div className="flex items-center gap-[6px] mb-[16px]">
              <div className="w-[12px] h-[12px] bg-[#56DEAD] rounded-[2px]"></div>
              <span className="text-[14px] font-[500] text-[#2B3337]">Transactions</span>
            </div>
            <div className="flex items-center justify-center h-[220px] text-[#9FA7BA] text-[14px]">
              📈 No transaction data available
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Header
        periods={periods}
        onPeriodChange={onPeriodChange}
        selectedPeriod={selectedPeriod}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
        {/* Volume Chart */}
        <div className="bg-white rounded-[12px] border border-[#F2F2F2] shadow-[0_2px_6px_0_rgba(0,0,0,0.10)] p-[20px] pb-0">
          <div className="flex items-center gap-[6px] mb-[16px]">
            <div className="w-[12px] h-[12px] bg-[#6284F5] rounded-[2px]"></div>
            <span className="text-[14px] font-[500] text-[#2B3337]">Volume</span>
          </div>
          <div className="h-[240px]">
            <VolumeChart data={chartData} selectedPeriod={selectedPeriod} />
          </div>
        </div>

        {/* Transactions Chart */}
        <div className="bg-white rounded-[12px] border border-[#F2F2F2] shadow-[0_2px_6px_0_rgba(0,0,0,0.10)] p-[20px] pb-0">
          <div className="flex items-center gap-[6px] mb-[16px]">
            <div className="w-[12px] h-[12px] bg-[#56DEAD] rounded-[2px]"></div>
            <span className="text-[14px] font-[500] text-[#2B3337]">Transactions</span>
          </div>
          <div className="h-[240px]">
            <TransactionsChart data={chartData} selectedPeriod={selectedPeriod} />
          </div>
        </div>
      </div>
    </div>
  );
}

const Header = (props: any) => {
  const { periods, onPeriodChange, selectedPeriod } = props;

  return (
    <div className="flex items-center justify-between mb-[12px]">
      <div className="text-[16px] font-[500] text-[#0E3616]">
        Analytics Chart
      </div>
      <div className="bg-white rounded-[8px] border border-[#F2F2F2] p-[4px]">
        <div className="flex">
          {periods.map((period: any) => (
            <button
              key={period.value}
              onClick={() => onPeriodChange(period.value)}
              className={`px-[12px] py-[6px] rounded-[6px] text-[12px] font-[500] transition-all duration-300 ${selectedPeriod === period.value
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
  );
};
