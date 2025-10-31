interface StatsCardProps {
  title: string;
  count: number;
  pending: number;
}

const StatsCard = ({ title, count, pending }: StatsCardProps) => {
  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-gray-700 shadow-lg transition-transform hover:scale-105">
      <h3 className="text-sm font-medium text-gray-400 mb-3">{title}</h3>
      <div className="flex justify-between items-end">
        <div>
          <p className="text-4xl font-bold text-white">{count}</p>
          <p className="text-sm text-gray-500">Verified</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-semibold text-gray-300">{pending}</p>
          <p className="text-sm text-gray-500">Pending</p>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
