import DeedCard from "../components/analaticcards/DeedCard";
import UsersCard from "../components/analaticcards/UsersCard";

const AnalaticsDashboard = () => {
  return(
    <div className="w-full space-y-6">
      {/* Header Section */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
        <p className="text-white/60">Comprehensive insights into users and deeds</p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <UsersCard/>
        <DeedCard/>
      </div>
    </div>
  );
}

export default AnalaticsDashboard;