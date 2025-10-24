const UsersCard = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900 mb-4">Users Overview</h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Total Users</p>
            <p className="text-2xl font-bold text-slate-900">1,234</p>
          </div>
          <div className="text-green-500 font-semibold">+5.4%</div>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Active Users</p>
            <p className="text-2xl font-bold text-slate-900">987</p>
          </div>
          <div className="text-green-500 font-semibold">+3.2%</div>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">New Signups</p>
            <p className="text-2xl font-bold text-slate-900">123</p>
          </div>
          <div className="text-red-500 font-semibold">-1.1%</div>
        </div>
      </div>
    </div>
  );
};

export default UsersCard;