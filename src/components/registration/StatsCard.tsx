interface StatsCardProps {
  title: string;
  count: number;
  pending: number;
}

const StatsCard = ({ title, count, pending }: StatsCardProps) => {
  return (
    <div className="bg-white rounded-xl p-5 shadow-lg border border-gray-200 flex flex-col justify-between hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
      <h3 className="text-lg font-semibold text-gray-700 mb-3 text-center">{title}</h3>
      <div className="flex justify-around items-center">
        <div className="text-center">
          <p className="text-3xl font-bold text-green-600">{count}</p>
          <p className="text-sm text-gray-500 mt-1">Verified</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-yellow-600">{pending}</p>
          <p className="text-sm text-gray-500 mt-1">Pending</p>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
