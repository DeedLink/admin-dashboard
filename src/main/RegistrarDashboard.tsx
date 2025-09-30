import { useState } from "react";
import Header from "../components/Header";
import KYCQueue from "../tabs/KYCQueue";
import Sidebar from "../components/Sidebar";
import SurveyorRequests from "../tabs/SurveyorRequests";
import IVSLRequests from "../tabs/IVSLRequests";
import NotaryRequests from "../tabs/NotaryRequests";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("users");

  return (
    <div className="flex h-screen bg-gray-950">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto p-8 space-y-6">
          {activeTab === "kyc" && <KYCQueue />}
          {activeTab === "surveyor" && <SurveyorRequests/>}
          {activeTab === "ivsl" && <IVSLRequests/>}
          {activeTab === "notary" && <NotaryRequests/>}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
