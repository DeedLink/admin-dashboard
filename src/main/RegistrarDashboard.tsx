import { useEffect, useState } from "react";
import Header from "../components/Header";
import KYCQueue from "../tabs/KYCQueue";
import Sidebar from "../components/Sidebar";
import SurveyorRequests from "../tabs/SurveyorRequests";
import IVSLRequests from "../tabs/IVSLRequests";
import NotaryRequests from "../tabs/NotaryRequests";
import { useLoader } from "../contexts/LoaderContext";
import Logs from "../tabs/Logs";
import { useLogin } from "../contexts/LoginContext";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("kyc");
  const { showLoader, hideLoader } = useLoader();
  const { user } = useLogin();

  useEffect(()=>{
    showLoader();
    console.log(user);

    setTimeout(()=>{
      hideLoader();
    },500);
  },[activeTab]);

  return (
    <div className="flex h-screen bg-black font-spectral">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 flex flex-col">
        <Header />
        {
          user?.role === "admin" ? (
            <main className="flex-1 overflow-y-auto p-8 space-y-6">
              {activeTab === "kyc" && <KYCQueue />}
              {activeTab === "surveyor" && <SurveyorRequests/>}
              {activeTab === "ivsl" && <IVSLRequests/>}
              {activeTab === "notary" && <NotaryRequests/>}
              {activeTab === "logs" && <Logs/>}
            </main>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white">
              Please Activate The Pass To Continue!
            </div>
          )
        }
      </div>
    </div>
  );
};

export default AdminDashboard;
