import { useEffect, useState } from "react";
import { useLoader } from "../contexts/LoaderContext";
import { useToast } from "../contexts/ToastContext";
import { getUsers, registerDepartmentUser } from "../api/api";
import StatsCard from "../components/registration/StatsCard";
import RegistrationForm from "../components/registration/RegistrationForm";

const Registration = () => {
  const [stats, setStats] = useState({
    notary: { verified: 0, pending: 0 },
    surveyor: { verified: 0, pending: 0 },
    ivsl: { verified: 0, pending: 0 },
  });

  const { showLoader, hideLoader } = useLoader();
  const { showToast } = useToast();

  const fetchUserStats = async () => {
    showLoader();
    try {
      const users = await getUsers();
      const notaryUsers = users.filter((u) => u.role === "notary");
      const surveyorUsers = users.filter((u) => u.role === "surveyor");
      const ivslUsers = users.filter((u) => u.role === "IVSL");

      setStats({
        notary: {
          verified: notaryUsers.filter((u) => u.kycStatus === "verified").length,
          pending: notaryUsers.filter((u) => u.kycStatus === "pending").length,
        },
        surveyor: {
          verified: surveyorUsers.filter((u) => u.kycStatus === "verified").length,
          pending: surveyorUsers.filter((u) => u.kycStatus === "pending").length,
        },
        ivsl: {
          verified: ivslUsers.filter((u) => u.kycStatus === "verified").length,
          pending: ivslUsers.filter((u) => u.kycStatus === "pending").length,
        },
      });
    } catch {
      showToast("Failed to load user data", "error");
    } finally {
      hideLoader();
    }
  };

  const handleRegistrationSubmit = async (formData: {
    username: string;
    email: string;
    nic: string;
    walletAddress: string;
    role: "notary" | "surveyor" | "IVSL";
  }) => {
    showLoader();
    try {
      await registerDepartmentUser(
        formData.username,
        formData.email,
        formData.nic,
        formData.walletAddress.toLowerCase(),
        formData.role
      );
      showToast("User registered successfully!", "success");
      await fetchUserStats();
      return true;
    } catch {
      showToast("Failed to register user. Please try again.", "error");
      return false;
    } finally {
      hideLoader();
    }
  };

  useEffect(() => {
    fetchUserStats();
  }, []);

  return (
    <div className="w-full min-h-screen bg-black text-white flex flex-col items-center px-4 py-0">
      <div className="w-full max-w-6xl space-y-10">
        <h1 className="text-3xl md:text-4xl font-bold text-center tracking-wide">
          Department User Management
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <StatsCard title="Notaries" count={stats.notary.verified} pending={stats.notary.pending} />
          <StatsCard title="Surveyors" count={stats.surveyor.verified} pending={stats.surveyor.pending} />
          <StatsCard title="IVSL" count={stats.ivsl.verified} pending={stats.ivsl.pending} />
        </div>

        <RegistrationForm onSubmit={handleRegistrationSubmit} />
      </div>
    </div>
  );
};

export default Registration;
