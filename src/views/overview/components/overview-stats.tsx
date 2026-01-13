import { useState, useEffect } from "react";
import axios from "axios";
import Loading from "@/components/loading/icon";
import { formatNumber } from "@/utils/format/number";
import { BASE_API_URL } from "@/config/api";
import { ProjectMap, Project } from "@/services";
import LazyImage from "@/components/layz-image";

interface DashboardData {
  symbol: string;
  users: number;
  volume: string;
  transactions: number;
}

interface ProjectVolume {
  project: Project;
  total_volume: string;
}

interface ProjectVolumeResponse {
  code: number;
  data: ProjectVolume[];
}

interface OverviewStatsProps {
  data: DashboardData | null;
  loading: boolean;
  selectedToken: "USDT" | "USDC" | "USD1";
}

export default function OverviewStats({ data, loading, selectedToken }: OverviewStatsProps) {
  const [projectVolumes, setProjectVolumes] = useState<ProjectVolume[]>([]);
  const [projectVolumesLoading, setProjectVolumesLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const fetchProjectVolumes = async () => {
      setProjectVolumesLoading(true);
      try {
        const params = new URLSearchParams({
          symbol: selectedToken.toLowerCase()
        });
        const response = await axios.get<ProjectVolumeResponse>(
          `${BASE_API_URL}/v1/stats/project?${params.toString()}`
        );
        if (response.data.code === 200) {
          setProjectVolumes(response.data.data || []);
        }
      } catch (error) {
        console.error("Error fetching project volumes:", error);
      } finally {
        setProjectVolumesLoading(false);
      }
    };

    fetchProjectVolumes();
  }, [selectedToken]);

  const stats: Array<{
    label: string;
    value: string | number;
    showProjectVolumes?: boolean;
  }> = [
      // {
      //   label: "Total Users",
      //   value: data?.users || 0,
      // },
      {
        label: "Total Volume",
        value: formatNumber(data?.volume, 2, true, { isShort: true, isShortUppercase: true, prefix: "$" }),
        showProjectVolumes: true,
      },
      {
        label: "Total Transactions",
        value: formatNumber(data?.transactions, 2, true, { isShort: true, isShortUppercase: true }),
      }
    ];

  return (
    <div className="w-full">
      <div className="text-[16px] font-[500] text-[#0E3616] mb-[12px]">
        Overview Statistics
      </div>
      <div className="grid grid-cols-2 md:grid-cols-2 gap-[15px]">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-[12px] border border-[#F2F2F2] shadow-[0_2px_6px_0_rgba(0,0,0,0.10)] p-[16px]"
          >
            <div className="flex items-center justify-between mb-[8px]">
              <span className="text-[12px] text-[#9FA7BA] font-[500]">
                {stat.label}
              </span>
              {stat.showProjectVolumes && (
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="button flex items-center justify-center w-[20px] h-[20px] hover:opacity-70 transition-opacity"
                  aria-label={isExpanded ? "收起" : "展开"}
                >
                  <img
                    src="/icon-arrow-down.svg"
                    alt=""
                    className={`w-[12px] h-[12px] transition-transform duration-200 ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  />
                </button>
              )}
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
            {stat.showProjectVolumes && isExpanded && (
              <div className="mt-[12px] pt-[12px] border-t border-[#F2F2F2]">
                {projectVolumesLoading ? (
                  <div className="flex items-center justify-center py-2">
                    <Loading size={14} />
                  </div>
                ) : projectVolumes.length > 0 ? (
                  <div className="space-y-[8px]">
                    {projectVolumes
                      .filter((item) => {
                        const project = ProjectMap[item.project];
                        if (!project) return false;
                        return project.tokens.includes(selectedToken);
                      })
                      .map((item) => {
                        const project = ProjectMap[item.project];
                        if (!project) return null;
                        return (
                          <div
                            key={item.project}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center gap-[6px]">
                              <span className="text-[12px] text-[#9FA7BA]">
                                {project.name}
                              </span>
                              <LazyImage
                                src={project.logo}
                                width={52}
                                height={14}
                                alt=""
                                containerClassName="object-contain object-left shrink-0"
                              />
                            </div>
                            <span className="text-[12px] font-[500] text-[#2B3337]">
                              {formatNumber(item.total_volume, 2, true, {
                                isShort: true,
                                isShortUppercase: true,
                                prefix: "$",
                              })}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                ) : null}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
