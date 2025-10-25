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
import Regitration from "../tabs/Registration";
import AnalaticsDashboard from "../tabs/AnalaticsDashboard";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("analatics");
  const { showLoader, hideLoader } = useLoader();
  const { user } = useLogin();

  const USER_API_URL = import.meta.env.VITE_USER_API_URL;
  const BACKEND_FILE_URL = import.meta.env.VITE_BACKEND_FILE_URL;

  useEffect(()=>{
    console.log("user: ",USER_API_URL);
    console.log("file: ",BACKEND_FILE_URL);
  },[]);


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
              {activeTab === "analatics" && <AnalaticsDashboard/>}
              {activeTab === "kyc" && <KYCQueue />}
              {activeTab === "Regitration"  && <Regitration/>}
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
