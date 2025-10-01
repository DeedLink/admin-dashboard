import { useState, useEffect } from "react";
import { addSigner, getRolesOf } from "../web3.0/contractService";
import type { User } from "../types/types";
import { getUsers } from "../api/api";

const IVSLRequests = () => {
  const [ivslUsers, setIvslUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingAddress, setProcessingAddress] = useState<string | null>(null);
  const [rolesMap, setRolesMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchIVSLUsers();
  }, []);

  async function fetchIVSLUsers() {
    try {
      setLoading(true);
      setError(null);

      const users = await getUsers();
      const ivslFilteredUsers = users.filter(user => user.role?.toUpperCase() === "IVSL");
      setIvslUsers(ivslFilteredUsers);

      const roles: Record<string, boolean> = {};
      await Promise.all(ivslFilteredUsers.map(async (u) => {
        if (u.walletAddress) {
          const walletRoles = await getRolesOf(u.walletAddress);
          roles[u.walletAddress] = walletRoles.ivsl;
        }
      }));
      setRolesMap(roles);

    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load IVSL users");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddSigner(address: string) {
    try {
      setProcessingAddress(address);
      await addSigner("IVSL", address);
      await fetchIVSLUsers();
      alert(`Successfully added IVSL signer: ${address}`);
    } catch (err) {
      alert(`Failed to add signer: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setProcessingAddress(null);
    }
  }

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-pulse text-gray-600 text-lg">Loading IVSL users...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-4">
        <div className="text-red-600 font-semibold text-lg">Error: {error}</div>
        <button
          onClick={fetchIVSLUsers}
          className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-2 rounded-lg font-medium shadow-md hover:shadow-lg transition-all"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="w-full h-full p-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-white mb-8">IVSL Requests</h2>

        {ivslUsers.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-10 text-center text-gray-500 text-lg">
            No IVSL requests found
          </div>
        ) : (
          <div className="space-y-6">
            {ivslUsers.map((ivslUser) => {
              const wallet = ivslUser.walletAddress || "";
              const alreadyRole = rolesMap[wallet] || false;

              return (
                <div
                  key={ivslUser._id || wallet}
                  className="bg-white rounded-xl shadow-md p-6 flex items-center justify-between transform transition-all hover:scale-[1.02] hover:shadow-xl"
                >
                  <div className="flex-1">
                    <div className="text-lg font-semibold text-gray-900">{ivslUser.name || "Unknown IVSL User"}</div>
                    {ivslUser.email && <div className="text-sm text-gray-600 mt-1">{ivslUser.email}</div>}
                    <div className="text-xs text-gray-500 mt-2 font-mono truncate max-w-[280px]">{wallet}</div>
                    {ivslUser.kycStatus && (
                      <span className={`inline-block mt-3 px-3 py-1 text-xs font-medium rounded-full ${
                        ivslUser.kycStatus === "verified"
                          ? "bg-green-100 text-green-800"
                          : ivslUser.kycStatus === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}>
                        {ivslUser.kycStatus}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleAddSigner(wallet)}
                    disabled={processingAddress === wallet || alreadyRole}
                    className={`px-6 py-2 rounded-lg font-medium text-white transition-all shadow-md ${
                      processingAddress === wallet || alreadyRole
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                    }`}
                  >
                    {alreadyRole
                      ? "Already Added"
                      : processingAddress === wallet
                      ? "Processing..."
                      : "Add Signer"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default IVSLRequests;
