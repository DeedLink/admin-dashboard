import { useEffect, useMemo, useState } from "react";
import { Gavel, MapPinned, ShieldCheck } from "lucide-react";
import { useLoader } from "../contexts/LoaderContext";
import { useToast } from "../contexts/ToastContext";
import { getUsers, registerDepartmentUser } from "../api/api";
import StatsCard from "../components/registration/StatsCard";
import RegistrationForm from "../components/registration/RegistrationForm";
import type { User } from "../types/types";

const Registration = () => {
  const [stats, setStats] = useState({
    notary: { verified: 0, pending: 0 },
    surveyor: { verified: 0, pending: 0 },
    ivsl: { verified: 0, pending: 0 },
  });
  const [departmentUsers, setDepartmentUsers] = useState<User[]>([]);

  const { showLoader, hideLoader } = useLoader();
  const { showToast } = useToast();

  const fetchUserStats = async () => {
    showLoader();
    try {
      const users = await getUsers();
      const department = users.filter((u) => ["notary", "surveyor", "IVSL"].includes(u.role));
      const notaryUsers = department.filter((u) => u.role === "notary");
      const surveyorUsers = department.filter((u) => u.role === "surveyor");
      const ivslUsers = department.filter((u) => u.role === "IVSL");

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
      setDepartmentUsers(department);
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

  const recentInvites = useMemo(
    () =>
      departmentUsers
        .slice()
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 6),
    [departmentUsers]
  );

  const roleCards = [
    {
      title: "Notaries",
      data: stats.notary,
      icon: <Gavel size={22} />,
      accent: "bg-gradient-to-br from-purple-500/20 to-purple-900/30 border-purple-400/20",
    },
    {
      title: "Surveyors",
      data: stats.surveyor,
      icon: <MapPinned size={22} />,
      accent: "bg-gradient-to-br from-sky-500/20 to-sky-900/30 border-sky-400/20",
    },
    {
      title: "IVSL",
      data: stats.ivsl,
      icon: <ShieldCheck size={22} />,
      accent: "bg-gradient-to-br from-emerald-500/20 to-emerald-900/30 border-emerald-400/20",
    },
  ];

  return (
    <div className="w-full min-h-screen bg-[#020a06] text-white flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-6xl space-y-10">

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {roleCards.map((role) => (
            <StatsCard
              key={role.title}
              title={role.title}
              verified={role.data.verified}
              pending={role.data.pending}
              icon={role.icon}
              accent={role.accent}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8">
          <RegistrationForm onSubmit={handleRegistrationSubmit} />
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/60">Recent Invites</p>
                <h3 className="text-xl font-semibold text-white">Last onboarded staff</h3>
              </div>
              <span className="text-xs text-white/60">{recentInvites.length} listed</span>
            </div>
            {recentInvites.length === 0 ? (
              <p className="text-sm text-white/60">No department registrations yet.</p>
            ) : (
              <div className="space-y-4 max-h-[420px] overflow-auto pr-1">
                {recentInvites.map((user) => (
                  <div key={user._id} className="rounded-2xl border border-white/10 bg-black/30 p-4 flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <p className="text-base font-semibold">{user.name}</p>
                      <span
                        className={`text-xs rounded-full px-3 py-1 ${
                          user.kycStatus === "verified"
                            ? "bg-emerald-500/20 text-emerald-300"
                            : "bg-amber-500/20 text-amber-200"
                        }`}
                      >
                        {user.kycStatus}
                      </span>
                    </div>
                    <p className="text-xs uppercase tracking-[0.3em] text-white/40">
                      {user.role === "IVSL" ? "IVSL Analyst" : user.role}
                    </p>
                    <p className="text-sm text-white/60 break-all">{user.walletAddress}</p>
                    <p className="text-xs text-white/40">{formatDate(user.createdAt)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const formatDate = (date?: string) => {
  if (!date) return "—";
  return new Date(date).toLocaleString();
};

export default Registration;
