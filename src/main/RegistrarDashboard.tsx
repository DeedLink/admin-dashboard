import { useState } from "react";
import Header from "../components/Header";
import UserTable from "../tabs/UserTable";
import KYCQueue from "../tabs/KYCQueue";
import Sidebar from "../components/Sidebar";
import NFTRequests from "../tabs/NFTRequests";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("users");

  return (
    <div className="flex h-screen bg-gray-950">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto p-8 space-y-6">
          {activeTab === "users" && <UserTable />}
          {activeTab === "kyc" && <KYCQueue />}
          {activeTab === "nftRequests" && <NFTRequests />} {/* New tab content */}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
