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
} from "recharts";

const COLORS = ["#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#6366F1"];

const UsersCard = () => {
  const [users, setUsers] = useState<any[]>([]);

  const fetchUsers = async () => {
    try {
      const res = await getUsers();
      const filtered = res.filter((u: any) => u.role !== "admin");
      setUsers(filtered);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const totalUsers = users.length;
  const verifiedUsers = users.filter((u) => u.kycStatus === "verified").length;
  const newUsers = users.filter((u) => {
    const diffDays = (Date.now() - new Date(u.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= 7;
  }).length;

  const roleCounts = users.reduce((acc: Record<string, number>, user: any) => {
    const role =
      user.role === "user"
        ? "General Public User"
        : user.role?.charAt(0).toUpperCase() + user.role.slice(1);
    acc[role] = (acc[role] || 0) + 1;
    return acc;
  }, {});

  const roleData = Object.entries(roleCounts).map(([name, value]) => ({ name, value }));

  const signupByDate = users.reduce((acc: Record<string, number>, user: any) => {
    const date = new Date(user.createdAt).toISOString().split("T")[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  const trendData = Object.entries(signupByDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-7)
    .map(([date, count]) => ({ date, count }));

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 shadow-sm">
      <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-4 text-center sm:text-left">
        User Analytics Dashboard
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 text-center">
        <div className="p-3 rounded-lg bg-indigo-50">
          <p className="text-xs sm:text-sm text-slate-600">Total Users</p>
          <p className="text-xl sm:text-2xl font-bold text-indigo-600">{totalUsers}</p>
        </div>
        <div className="p-3 rounded-lg bg-green-50">
          <p className="text-xs sm:text-sm text-slate-600">Verified Users</p>
          <p className="text-xl sm:text-2xl font-bold text-green-600">{verifiedUsers}</p>
        </div>
        <div className="p-3 rounded-lg bg-blue-50">
          <p className="text-xs sm:text-sm text-slate-600">New This Week</p>
          <p className="text-xl sm:text-2xl font-bold text-blue-600">{newUsers}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-slate-50 rounded-xl p-3 sm:p-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-2 text-center sm:text-left">
            Users by Role
          </h3>
          {roleData.length > 0 ? (
            <div className="w-full h-[180px] sm:h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={roleData}
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    dataKey="value"
                    label={({ name }) => name}
                  >
                    {roleData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-slate-400 text-sm text-center">No role data</p>
          )}
        </div>

        <div className="bg-slate-50 rounded-xl p-3 sm:p-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-2 text-center sm:text-left">
            New Signups (Last 7 Days)
          </h3>
          {trendData.length > 0 ? (
            <div className="w-full h-[180px] sm:h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData}>
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-slate-400 text-sm text-center">No recent signups</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UsersCard;
