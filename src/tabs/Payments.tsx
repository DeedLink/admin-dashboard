import { useEffect, useMemo, useState, useRef } from "react";
import { getDeeds, getTransactionsByDeedId } from "../api/api";
import type { IDeed } from "../types/responseDeed";
import type { ITransaction } from "../types/transaction";
import { 
  GOVERNMENT_FEE, 
  IVSL_FEE, 
  SURVEY_FEE, 
  NOTARY_FEE, 
  TOTAL_REGISTRATION_FEE 
} from "../constants/registrationFees";
import { getStampPercentage } from "../constants/stampfee";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from "recharts";
import { Coins, TrendingUp, DollarSign, FileText } from "lucide-react";

const COLORS = ["#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#6366F1", "#8B5CF6"];

const Payments = () => {
  const [deeds, setDeeds] = useState<IDeed[]>([]);
  const [transactions, setTransactions] = useState<ITransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    
    const fetchData = async () => {
      setLoading(true);
      try {
        const deedsData = await getDeeds();
        setDeeds(deedsData || []);

        const allTransactions: ITransaction[] = [];
        const transactionPromises = (deedsData || [])
          .filter((deed) => deed._id)
          .map((deed) => getTransactionsByDeedId(deed._id!));

        const transactionResults = await Promise.allSettled(transactionPromises);
        transactionResults.forEach((result) => {
          if (result.status === "fulfilled") {
            allTransactions.push(...result.value);
          }
        });
        setTransactions(allTransactions);
        hasFetched.current = true;
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate stamp fee for a transaction
  const calculateStampFee = (tx: ITransaction) => {
    if (!tx.amount || tx.amount <= 0) return null;
    const percent = getStampPercentage(tx.amount, tx.type);
    const value = (tx.amount * percent) / 100;
    return { percent, value };
  };

  // Infer stamp type from transaction type
  const inferStampType = (type: ITransaction["type"]) => {
    if (!type) return undefined;
    const upper = type.toUpperCase();
    if (["SALE", "GIFT", "TRANSFER", "EXCHANGE", "LEASE", "MORTGAGE"].includes(upper)) {
      return upper;
    }
    return undefined;
  };

  // Calculate payment statistics
  const paymentStats = useMemo(() => {
    const totalDeeds = deeds.length;
    const totalRegistrationFees = totalDeeds * TOTAL_REGISTRATION_FEE;
    const governmentFees = totalDeeds * GOVERNMENT_FEE;
    const ivslFees = totalDeeds * IVSL_FEE;
    const surveyFees = totalDeeds * SURVEY_FEE;
    const notaryFees = totalDeeds * NOTARY_FEE;

    // Calculate stamp fees from transactions
    const stampFees = transactions
      .map((tx) => {
        const fee = calculateStampFee(tx);
        return fee?.value ?? 0;
      })
      .reduce((acc, val) => acc + val, 0);

    const totalPayments = totalRegistrationFees + stampFees;

    // Group stamp fees by type
    const stampFeesByType = transactions.reduce((acc, tx) => {
      const fee = calculateStampFee(tx);
      if (fee) {
        const type = inferStampType(tx.type) || "Other";
        acc[type] = (acc[type] || 0) + fee.value;
      }
      return acc;
    }, {} as Record<string, number>);

    // Registration fees by date
    const registrationByDate = deeds.reduce((acc, deed) => {
      if (deed.registrationDate) {
        const date = new Date(deed.registrationDate).toISOString().split("T")[0];
        acc[date] = (acc[date] || 0) + TOTAL_REGISTRATION_FEE;
      }
      return acc;
    }, {} as Record<string, number>);

    // Stamp fees by date
    const stampFeesByDate = transactions.reduce((acc, tx) => {
      const fee = calculateStampFee(tx);
      if (fee) {
        const dateStr = tx.date || tx.createdAt;
        if (dateStr) {
          const date = new Date(dateStr).toISOString().split("T")[0];
          acc[date] = (acc[date] || 0) + fee.value;
        }
      }
      return acc;
    }, {} as Record<string, number>);

    return {
      totalDeeds,
      totalRegistrationFees,
      governmentFees,
      ivslFees,
      surveyFees,
      notaryFees,
      stampFees,
      totalPayments,
      stampFeesByType,
      registrationByDate,
      stampFeesByDate,
    };
  }, [deeds, transactions]);

  // Format date helper
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // Prepare chart data
  const registrationFeeBreakdown = [
    { name: "Government", value: paymentStats.governmentFees, color: "#4F46E5" },
    { name: "IVSL", value: paymentStats.ivslFees, color: "#10B981" },
    { name: "Survey", value: paymentStats.surveyFees, color: "#F59E0B" },
    { name: "Notary", value: paymentStats.notaryFees, color: "#EF4444" },
  ];

  const stampFeesData = Object.entries(paymentStats.stampFeesByType).map(([name, value]) => ({
    name,
    value,
  }));

  const registrationTrendData = Object.entries(paymentStats.registrationByDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-7)
    .map(([date, value]) => ({ date: formatDate(date), value }));

  const stampTrendData = Object.entries(paymentStats.stampFeesByDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-7)
    .map(([date, value]) => ({ date: formatDate(date), value }));

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-black text-white p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-white/10 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-white/10 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-black text-white p-6 space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Payment Dashboard</h1>
        <p className="text-white/60">Track registration fees and stamp fees</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={<DollarSign className="text-emerald-400" size={24} />}
          title="Total Payments"
          value={`${paymentStats.totalPayments.toFixed(4)} ETH`}
          subtitle="All fees combined"
        />
        <MetricCard
          icon={<FileText className="text-blue-400" size={24} />}
          title="Registration Fees"
          value={`${paymentStats.totalRegistrationFees.toFixed(4)} ETH`}
          subtitle={`${paymentStats.totalDeeds} registrations`}
        />
        <MetricCard
          icon={<Coins className="text-yellow-400" size={24} />}
          title="Stamp Fees"
          value={`${paymentStats.stampFees.toFixed(4)} ETH`}
          subtitle={`${transactions.length} transactions`}
        />
        <MetricCard
          icon={<TrendingUp className="text-purple-400" size={24} />}
          title="Avg per Registration"
          value={`${(paymentStats.totalRegistrationFees / Math.max(paymentStats.totalDeeds, 1)).toFixed(4)} ETH`}
          subtitle="Per deed"
        />
      </div>

      {/* Registration Fee Breakdown */}
      <div className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 border border-white/20 rounded-2xl p-6 shadow-xl">
        <h2 className="text-xl font-bold text-white mb-4">Registration Fee Breakdown</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-white mb-4">Fee Distribution</h3>
            {registrationFeeBreakdown.length > 0 ? (
              <div className="w-full h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={registrationFeeBreakdown}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={40}
                      dataKey="value"
                      label={(entry: any) => {
                        const name = entry.name || '';
                        const value = typeof entry.value === 'number' ? entry.value : 0;
                        return `${name}: ${value.toFixed(4)} ETH`;
                      }}
                    >
                      {registrationFeeBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(0, 0, 0, 0.95)",
                        border: "1px solid rgba(255, 255, 255, 0.3)",
                        borderRadius: "8px",
                        color: "#ffffff",
                        padding: "8px 12px",
                      }}
                      itemStyle={{ color: "#ffffff", fontSize: "13px", fontWeight: "500" }}
                      formatter={(value: number) => [`${value.toFixed(4)} ETH`, "Amount"]}
                    />
                    <Legend
                      formatter={(value: string, entry: any) =>
                        `${value}: ${entry.payload.value.toFixed(4)} ETH`
                      }
                      wrapperStyle={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.8)" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-white/40 text-sm text-center py-8">No registration data</p>
            )}
          </div>

          <div className="space-y-3">
            <FeeRow label="Government Fee" value={paymentStats.governmentFees.toFixed(4)} unit="ETH" />
            <FeeRow label="IVSL Fee" value={paymentStats.ivslFees.toFixed(4)} unit="ETH" />
            <FeeRow label="Survey Fee" value={paymentStats.surveyFees.toFixed(4)} unit="ETH" />
            <FeeRow label="Notary Fee" value={paymentStats.notaryFees.toFixed(4)} unit="ETH" />
            <div className="pt-3 border-t border-white/10">
              <FeeRow
                label="Total Registration Fees" 
                value={paymentStats.totalRegistrationFees.toFixed(4)} 
                unit="ETH"
                highlight
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stamp Fees Section */}
      {paymentStats.stampFees > 0 && (
        <div className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 border border-white/20 rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-4">Stamp Fees by Transaction Type</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {stampFeesData.length > 0 ? (
              <>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-white mb-4">Distribution</h3>
                  <div className="w-full h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stampFeesData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          innerRadius={40}
                          dataKey="value"
                          label={(entry: any) => {
                        const name = entry.name || '';
                        const value = typeof entry.value === 'number' ? entry.value : 0;
                        return `${name}: ${value.toFixed(4)} ETH`;
                      }}
                        >
                          {stampFeesData.map((_entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "rgba(0, 0, 0, 0.95)",
                            border: "1px solid rgba(255, 255, 255, 0.3)",
                            borderRadius: "8px",
                            color: "#ffffff",
                            padding: "8px 12px",
                          }}
                          itemStyle={{ color: "#ffffff", fontSize: "13px", fontWeight: "500" }}
                          formatter={(value: number) => [`${value.toFixed(4)} ETH`, "Amount"]}
                        />
                        <Legend
                          formatter={(value: string, entry: any) =>
                            `${value}: ${entry.payload.value.toFixed(4)} ETH`
                          }
                          wrapperStyle={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.8)" }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="space-y-3">
                  {stampFeesData.map((item) => (
                    <FeeRow
                      key={item.name}
                      label={item.name}
                      value={item.value.toFixed(4)}
                      unit="ETH"
                    />
                  ))}
                  <div className="pt-3 border-t border-white/10">
                    <FeeRow
                      label="Total Stamp Fees"
                      value={paymentStats.stampFees.toFixed(4)}
                      unit="ETH"
                      highlight
                    />
                  </div>
                </div>
              </>
            ) : (
              <p className="text-white/40 text-sm text-center py-8">No stamp fee data</p>
            )}
          </div>
        </div>
      )}

      {/* Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Registration Fees Trend */}
        <div className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 border border-white/20 rounded-2xl p-6 shadow-xl">
          <h3 className="text-lg font-semibold text-white mb-4">Registration Fees Trend (Last 7 Days)</h3>
          {registrationTrendData.length > 0 ? (
            <div className="w-full h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={registrationTrendData}>
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "rgba(255, 255, 255, 0.6)" }}
                    stroke="rgba(255, 255, 255, 0.2)"
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "rgba(255, 255, 255, 0.6)" }}
                    stroke="rgba(255, 255, 255, 0.2)"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(0, 0, 0, 0.95)",
                      border: "1px solid rgba(255, 255, 255, 0.3)",
                      borderRadius: "8px",
                      color: "#ffffff",
                      padding: "8px 12px",
                    }}
                    itemStyle={{ color: "#ffffff", fontSize: "13px", fontWeight: "500" }}
                    formatter={(value: number) => [`${value.toFixed(4)} ETH`, "Registration Fees"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#4F46E5"
                    strokeWidth={2}
                    dot={{ fill: "#4F46E5", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-white/40 text-sm text-center py-8">No recent registration data</p>
          )}
        </div>

        {/* Stamp Fees Trend */}
        {stampTrendData.length > 0 && (
          <div className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 border border-white/20 rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-white mb-4">Stamp Fees Trend (Last 7 Days)</h3>
            <div className="w-full h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stampTrendData}>
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "rgba(255, 255, 255, 0.6)" }}
                    stroke="rgba(255, 255, 255, 0.2)"
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "rgba(255, 255, 255, 0.6)" }}
                    stroke="rgba(255, 255, 255, 0.2)"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(0, 0, 0, 0.95)",
                      border: "1px solid rgba(255, 255, 255, 0.3)",
                      borderRadius: "8px",
                      color: "#ffffff",
                      padding: "8px 12px",
                    }}
                    itemStyle={{ color: "#ffffff", fontSize: "13px", fontWeight: "500" }}
                    formatter={(value: number) => [`${value.toFixed(4)} ETH`, "Stamp Fees"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#10B981"
                    strokeWidth={2}
                    dot={{ fill: "#10B981", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const MetricCard = ({
  icon,
  title,
  value,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle?: string;
}) => (
  <div className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 border border-white/20 rounded-xl p-4">
    <div className="flex items-center gap-3 mb-3">
      {icon}
      <p className="text-white/70 text-sm font-medium">{title}</p>
    </div>
    <p className="text-2xl font-bold text-white mb-1">{value}</p>
    {subtitle && <p className="text-xs text-white/50">{subtitle}</p>}
  </div>
);

const FeeRow = ({
  label,
  value,
  unit,
  highlight = false,
}: {
  label: string;
  value: string;
  unit: string;
  highlight?: boolean;
}) => (
  <div
    className={`flex items-center justify-between p-3 rounded-lg ${
      highlight ? "bg-white/10 border border-white/20" : "bg-white/5"
    }`}
  >
    <span className={`text-sm ${highlight ? "font-semibold text-white" : "text-white/80"}`}>
      {label}
    </span>
    <span className={`text-sm font-bold ${highlight ? "text-white" : "text-white/90"}`}>
      {value} {unit}
    </span>
  </div>
);

export default Payments;

