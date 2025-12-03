import { useEffect, useState } from "react";
import { getDeeds } from "../../api/api";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import type { IDeed } from "../../types/responseDeed";

const COLORS = ["#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#6366F1", "#8B5CF6"];

const DeedCard = () => {
  const [deeds, setDeeds] = useState<IDeed[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [activeLandTypeIndex, setActiveLandTypeIndex] = useState<number | null>(null);
  const [activeBarIndex, setActiveBarIndex] = useState<number | null>(null);

  const fetchDeeds = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getDeeds();
      setDeeds(res);
    } catch (err) {
      console.error("Failed to fetch deeds:", err);
      setError("Failed to load deed data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeeds();
  }, []);

  // Format date helper
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const totalDeeds = deeds.length;
  const recentDeeds = deeds.filter((d) => {
    const diffDays = (Date.now() - new Date(d.createdAt ?? 0).getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= 7;
  }).length;

  const recentDeedsThisMonth = deeds.filter((d) => {
    const diffDays = (Date.now() - new Date(d.createdAt ?? 0).getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= 30;
  }).length;

  const landTypeCounts = deeds.reduce((acc: Record<string, number>, deed) => {
    const type = deed.landType || "Unknown";
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const landTypeData = Object.entries(landTypeCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  const registrationByDate = deeds.reduce((acc: Record<string, number>, deed) => {
    if (deed.registrationDate) {
      const date = new Date(deed.registrationDate).toISOString().split("T")[0];
      acc[date] = (acc[date] || 0) + 1;
    }
    return acc;
  }, {});

  const trendData = Object.entries(registrationByDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-7)
    .map(([date, count]) => ({ date: formatDate(date), count }));

  // Calculate average area if available
  const deedsWithArea = deeds.filter(d => d.area);
  const averageArea = deedsWithArea.length > 0
    ? (deedsWithArea.reduce((sum, d) => sum + (d.area || 0), 0) / deedsWithArea.length).toFixed(2)
    : 0;

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 border border-white/20 rounded-2xl p-6 shadow-xl">
        <div className="animate-pulse">
          <div className="h-6 bg-white/10 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-white/10 rounded-lg"></div>
            ))}
          </div>
          <div className="h-64 bg-white/10 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 border border-red-500/30 rounded-2xl p-6 shadow-xl">
        <div className="text-center py-8">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchDeeds}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 border border-white/20 rounded-2xl p-6 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between mb-6 min-w-0">
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-bold text-white mb-1 truncate">Deed Analytics</h2>
          <p className="text-white/60 text-sm truncate">Comprehensive deed insights</p>
        </div>
        <button
          onClick={fetchDeeds}
          className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          title="Refresh data"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 border border-indigo-500/30 rounded-xl p-4 min-w-0">
          <p className="text-white/70 text-xs font-medium mb-1 truncate">Total Deeds</p>
          <p className="text-2xl font-bold text-white truncate">{totalDeeds}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl p-4 min-w-0">
          <p className="text-white/70 text-xs font-medium mb-1 truncate">New This Week</p>
          <p className="text-2xl font-bold text-white truncate">{recentDeeds}</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-xl p-4 min-w-0">
          <p className="text-white/70 text-xs font-medium mb-1 truncate">This Month</p>
          <p className="text-2xl font-bold text-white truncate">{recentDeedsThisMonth}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-xl p-4 min-w-0">
          <p className="text-white/70 text-xs font-medium mb-1 truncate">Land Types</p>
          <p className="text-2xl font-bold text-white truncate">{Object.keys(landTypeCounts).length}</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Land Types Distribution */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 min-w-0">
          <h3 className="text-sm font-semibold text-white mb-4 truncate">Land Types Distribution</h3>
          {landTypeData.length > 0 ? (
            <div className="w-full h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={landTypeData}
                    cx="50%"
                    cy="50%"
                    outerRadius={activeLandTypeIndex === null ? 50 : 55}
                    innerRadius={25}
                    dataKey="value"
                    activeIndex={activeLandTypeIndex ?? undefined}
                    onMouseEnter={(_, index) => setActiveLandTypeIndex(index)}
                    onMouseLeave={() => setActiveLandTypeIndex(null)}
                  >
                    {landTypeData.map((_entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]}
                        style={{
                          filter: activeLandTypeIndex === index ? 'brightness(1.3) drop-shadow(0 0 8px rgba(255,255,255,0.3))' : 'none',
                          transition: 'all 0.3s ease',
                          cursor: 'pointer'
                        }}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0, 0, 0, 0.95)', 
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      padding: '8px 12px'
                    }}
                    itemStyle={{ color: '#ffffff', fontSize: '13px', fontWeight: '500' }}
                    labelStyle={{ color: '#ffffff', fontSize: '12px', fontWeight: '600' }}
                    formatter={(value: number, name: string) => [`${value}`, name]}
                  />
                  <Legend 
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value: string, entry: any) => `${value}: ${entry.payload.value}`}
                    wrapperStyle={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.8)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-white/40 text-sm text-center py-8">No land type data</p>
          )}
        </div>

        {/* Top Land Types Bar Chart */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 min-w-0">
          <h3 className="text-sm font-semibold text-white mb-4 truncate">Top Land Types</h3>
          {landTypeData.length > 0 ? (
            <div className="w-full h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={landTypeData} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 11, fill: 'rgba(255, 255, 255, 0.6)' }} stroke="rgba(255, 255, 255, 0.2)" />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    tick={{ fontSize: 10, fill: 'rgba(255, 255, 255, 0.6)' }}
                    stroke="rgba(255, 255, 255, 0.2)"
                    width={100}
                    tickFormatter={(value) => {
                      return value.length > 12 ? value.substring(0, 10) + '..' : value;
                    }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0, 0, 0, 0.95)', 
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      padding: '8px 12px'
                    }}
                    itemStyle={{ color: '#ffffff', fontSize: '13px', fontWeight: '500' }}
                    labelStyle={{ color: '#ffffff', fontSize: '12px', fontWeight: '600' }}
                  />
                  <Bar 
                    dataKey="value" 
                    fill="#4F46E5" 
                    radius={[0, 4, 4, 0]}
                    style={{ cursor: 'pointer' }}
                  >
                    {landTypeData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                        style={{ 
                          cursor: 'pointer',
                          filter: activeBarIndex === index ? 'brightness(1.3) drop-shadow(0 0 6px rgba(255,255,255,0.4))' : 'none',
                          transition: 'all 0.2s ease',
                          opacity: activeBarIndex !== null && activeBarIndex !== index ? 0.6 : 1
                        }}
                        onMouseEnter={() => setActiveBarIndex(index)}
                        onMouseLeave={() => setActiveBarIndex(null)}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-white/40 text-sm text-center py-8">No land type data</p>
          )}
        </div>
      </div>

      {/* Registration Trend */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 min-w-0">
        <h3 className="text-sm font-semibold text-white mb-4 truncate">Registration Trend (Last 7 Days)</h3>
        {trendData.length > 0 ? (
          <div className="w-full h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 11, fill: 'rgba(255, 255, 255, 0.6)' }}
                  stroke="rgba(255, 255, 255, 0.2)"
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: 'rgba(255, 255, 255, 0.6)' }}
                  stroke="rgba(255, 255, 255, 0.2)"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0, 0, 0, 0.95)', 
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    padding: '8px 12px'
                  }}
                  itemStyle={{ color: '#ffffff', fontSize: '13px', fontWeight: '500' }}
                  labelStyle={{ color: '#ffffff', fontSize: '12px', fontWeight: '600' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  dot={{ fill: '#10B981', r: 4, style: { cursor: 'pointer' } }}
                  activeDot={{ r: 8, fill: '#34D399', stroke: '#fff', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-white/40 text-sm text-center py-8">No recent registrations</p>
        )}
      </div>
    </div>
  );
};

export default DeedCard;
