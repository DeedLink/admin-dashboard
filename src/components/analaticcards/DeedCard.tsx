import { useEffect, useState } from "react";
import { getDeeds } from "../../api/api";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip
} from "recharts";
import type { IDeed } from "../../types/responseDeed";

const DeedCard = () => {
  const [deeds, setDeeds] = useState<IDeed[]>([]);

  const fetchDeeds = async () => {
    try {
      const res = await getDeeds();
      setDeeds(res);
    } catch (err) {
      console.error("Failed to fetch deeds:", err);
    }
  };

  useEffect(() => {
    fetchDeeds();
  }, []);

  const totalDeeds = deeds.length;
  const recentDeeds = deeds.filter((d) => {
    const diffDays = (Date.now() - new Date(d.createdAt ?? 0).getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= 7;
  }).length;

  const landTypeCounts = deeds.reduce((acc: Record<string, number>, deed) => {
    const type = deed.landType || "Unknown";
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const registrationByDate = deeds.reduce((acc: Record<string, number>, deed) => {
    const date = new Date(deed.registrationDate).toISOString().split("T")[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  const trendData = Object.entries(registrationByDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-7)
    .map(([date, count]) => ({ date, count }));

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 shadow-sm">
      <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-4 text-center sm:text-left">
        Deed Analytics
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 text-center">
        <div className="p-3 rounded-lg bg-indigo-50">
          <p className="text-xs sm:text-sm text-slate-600">Total Deeds</p>
          <p className="text-xl sm:text-2xl font-bold text-indigo-600">{totalDeeds}</p>
        </div>
        <div className="p-3 rounded-lg bg-green-50">
          <p className="text-xs sm:text-sm text-slate-600">New This Week</p>
          <p className="text-xl sm:text-2xl font-bold text-green-600">{recentDeeds}</p>
        </div>
        <div className="p-3 rounded-lg bg-yellow-50">
          <p className="text-xs sm:text-sm text-slate-600">Unique Land Types</p>
          <p className="text-xl sm:text-2xl font-bold text-yellow-600">
            {Object.keys(landTypeCounts).length}
          </p>
        </div>
      </div>

      <div className="mt-6 bg-slate-50 rounded-xl p-3 sm:p-4">
        <h3 className="text-sm font-semibold text-slate-700 mb-2 text-center sm:text-left">
          Registrations (Last 7 Days)
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
          <p className="text-slate-400 text-sm text-center">No recent registrations</p>
        )}
      </div>
    </div>
  );
};

export default DeedCard;
