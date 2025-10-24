const DeedCard = () => {
    return (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Deed Overview</h2>
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-slate-500">Total Deeds</p>
                        <p className="text-2xl font-bold text-slate-900">567</p>
                    </div>
                    <div className="text-green-500 font-semibold">+4.8%</div>
                </div>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-slate-500">Verified Deeds</p>
                        <p className="text-2xl font-bold text-slate-900">432</p>
                    </div>
                    <div className="text-green-500 font-semibold">+2.5%</div>
                </div>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-slate-500">Pending Deeds</p>
                        <p className="text-2xl font-bold text-slate-900">78</p>
                    </div>
                    <div className="text-red-500 font-semibold">-0.9%</div>
                </div>
            </div>
        </div>
    );
};

export default DeedCard;
