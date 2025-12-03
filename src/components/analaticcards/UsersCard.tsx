import { useEffect, useState } from "react";
import { getUsers } from "../../api/api";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from "recharts";

const COLORS = ["#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#6366F1", "#8B5CF6"];

const UsersCard = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getUsers();
      const filtered = res.filter((u: any) => u.role !== "admin");
      setUsers(filtered);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setError("Failed to load user data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Format date helper
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const totalUsers = users.length;
  const verifiedUsers = users.filter((u) => u.kycStatus === "verified").length;
  const pendingUsers = users.filter((u) => u.kycStatus === "pending").length;
  const rejectedUsers = users.filter((u) => u.kycStatus === "rejected").length;
  const verificationRate = totalUsers > 0 ? ((verifiedUsers / totalUsers) * 100).toFixed(1) : 0;
  
  const newUsers = users.filter((u) => {
    const diffDays = (Date.now() - new Date(u.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= 7;
  }).length;

  const newUsersThisMonth = users.filter((u) => {
    const diffDays = (Date.now() - new Date(u.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= 30;
  }).length;

  const roleCounts = users.reduce((acc: Record<string, number>, user: any) => {
    const role =
      user.role === "user"
        ? "Public User"
        : user.role?.charAt(0).toUpperCase() + user.role.slice(1);
    acc[role] = (acc[role] || 0) + 1;
    return acc;
  }, {});

  const roleData = Object.entries(roleCounts).map(([name, value]) => ({ name, value }));

  const kycStatusData = [
    { name: "Verified", value: verifiedUsers, color: "#10B981" },
    { name: "Pending", value: pendingUsers, color: "#F59E0B" },
    { name: "Rejected", value: rejectedUsers, color: "#EF4444" },
  ].filter(item => item.value > 0);

  const signupByDate = users.reduce((acc: Record<string, number>, user: any) => {
    const date = new Date(user.createdAt).toISOString().split("T")[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  const trendData = Object.entries(signupByDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-7)
    .map(([date, count]) => ({ date: formatDate(date), count }));

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
          <div className="grid grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-64 bg-white/10 rounded-lg"></div>
            ))}
          </div>
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
            onClick={fetchUsers}
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">User Analytics</h2>
          <p className="text-white/60 text-sm">Comprehensive user insights</p>
        </div>
        <button
          onClick={fetchUsers}
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
        <div className="bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 border border-indigo-500/30 rounded-xl p-4">
          <p className="text-white/70 text-xs font-medium mb-1">Total Users</p>
          <p className="text-2xl font-bold text-white">{totalUsers}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl p-4">
          <p className="text-white/70 text-xs font-medium mb-1">Verified</p>
          <p className="text-2xl font-bold text-white">{verifiedUsers}</p>
          <p className="text-xs text-white/60 mt-1">{verificationRate}% rate</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-xl p-4">
          <p className="text-white/70 text-xs font-medium mb-1">New This Week</p>
          <p className="text-2xl font-bold text-white">{newUsers}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-xl p-4">
          <p className="text-white/70 text-xs font-medium mb-1">This Month</p>
          <p className="text-2xl font-bold text-white">{newUsersThisMonth}</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* KYC Status Chart */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-white mb-4">KYC Status</h3>
          {kycStatusData.length > 0 ? (
            <div className="w-full h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={kycStatusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    innerRadius={30}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {kycStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-white/40 text-sm text-center py-8">No KYC data available</p>
          )}
        </div>

        {/* Users by Role */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-white mb-4">Users by Role</h3>
          {roleData.length > 0 ? (
            <div className="w-full h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={roleData}
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    innerRadius={30}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {roleData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-white/40 text-sm text-center py-8">No role data</p>
          )}
        </div>
      </div>

      {/* Signup Trend */}
      <div className="mt-6 bg-white/5 border border-white/10 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-white mb-4">Signup Trend (Last 7 Days)</h3>
        {trendData.length > 0 ? (
          <div className="w-full h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 11, fill: 'rgba(255, 255, 255, 0.6)' }}
                  stroke="rgba(255, 255, 255, 0.2)"
                />
                <YAxis 
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: 'rgba(255, 255, 255, 0.6)' }}
                  stroke="rgba(255, 255, 255, 0.2)"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#4F46E5" 
                  strokeWidth={2}
                  dot={{ fill: '#4F46E5', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-white/40 text-sm text-center py-8">No recent signups</p>
        )}
      </div>
    </div>
  );
};

export default UsersCard;
