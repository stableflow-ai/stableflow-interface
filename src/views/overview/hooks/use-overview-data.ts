import { useState, useEffect } from "react";
import axios from "axios";

interface DashboardData {
  symbol: string;
  users: number;
  volume: string;
  transactions: number;
}

interface ChartData {
  stat_time: number;
  symbol: string;
  users: number;
  volume: string;
  transactions: number;
}

interface ApiResponse<T> {
  code: number;
  data: T;
}

export default function useOverviewData(
  selectedToken: "USDT" | "USDC" | "USD1",
  timePeriod: "day" | "week" | "month"
) {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [chartData, setChartData] = useState<ChartData[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [chartLoading, setChartLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async (token: string) => {
    try {
      const response = await axios.get<ApiResponse<DashboardData>>(
        `https://api.db3.app/api/stableflow/dashboard?symbol=${token}`
      );
      
      if (response.data.code === 200) {
        setDashboardData(response.data.data);
      } else {
        throw new Error("Failed to fetch dashboard data");
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data");
    }
  };

  const fetchChartData = async (token: string, period: string) => {
    try {
      setChartLoading(true);
      const response = await axios.get<ApiResponse<ChartData[]>>(
        `https://api.db3.app/api/stableflow/dashboard/${period}?symbol=${token}`
      );
      
      if (response.data.code === 200) {
        setChartData(response.data.data);
      } else {
        throw new Error("Failed to fetch chart data");
      }
    } catch (err) {
      console.error("Error fetching chart data:", err);
      setError("Failed to load chart data");
    } finally {
      setChartLoading(false);
    }
  };

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      setError(null);
      
      try {
        await fetchDashboardData(selectedToken);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [selectedToken]);

  useEffect(() => {
    fetchChartData(selectedToken, timePeriod);
  }, [selectedToken, timePeriod]);

  return {
    dashboardData,
    chartData,
    loading,
    chartLoading,
    error
  };
}
