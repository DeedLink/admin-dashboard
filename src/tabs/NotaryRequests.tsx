import { useState, useEffect } from "react";
import { addSigner, getRolesOf } from "../web3.0/contractService";
import type { User } from "../types/types";
import { getUsers } from "../api/api";
import { Mail, Wallet, User as UserIcon, Calendar, UserCircle } from "lucide-react";
import { useAlert } from "../contexts/AlertContext";

const ipfs_microservice_url = import.meta.env.VITE_IPFS_MICROSERVICE_URL;

const NotaryRequests = () => {
  const { showAlert } = useAlert();
  const [notaries, setNotaries] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingAddress, setProcessingAddress] = useState<string | null>(null);
  const [rolesMap, setRolesMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchNotaries();
  }, []);

  async function fetchNotaries() {
    try {
      setLoading(true);
      setError(null);

      const users = await getUsers();
      const notaryUsers = users.filter(user => user.role?.toUpperCase() === "NOTARY");
      setNotaries(notaryUsers);

      const roles: Record<string, boolean> = {};
      await Promise.all(notaryUsers.map(async (u) => {
        if (u.walletAddress) {
          const walletRoles = await getRolesOf(u.walletAddress);
          roles[u.walletAddress] = walletRoles.notary;
        }
      }));
      setRolesMap(roles);

    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load notaries");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddSigner(address: string) {
    try {
      setProcessingAddress(address);
      const tx = await addSigner("NOTARY", address);
      console.log("Signer added:", tx);
      await fetchNotaries();
      showAlert(`Successfully added notary signer: ${address}`, 'success');
    } catch (err) {
      showAlert(`Failed to add signer: ${err instanceof Error ? err.message : "Unknown error"}`, 'error');
    } finally {
      setProcessingAddress(null);
    }
  }

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-pulse text-gray-600 text-lg">Loading notaries...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-4">
        <div className="text-red-600 font-semibold text-lg">Error: {error}</div>
        <button
          onClick={fetchNotaries}
          className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-2 rounded-lg font-medium shadow-md hover:shadow-lg transition-all"
        >
          Retry
        </button>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="w-full h-full p-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-white mb-8">Notary Requests</h2>
        {notaries.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-10 text-center text-gray-500 text-lg">
            No notary requests found
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notaries.map((notary) => {
              const wallet = notary.walletAddress || '';
              const alreadyRole = rolesMap[wallet] || false;
              const profileImage = notary.profilePicture
                ? notary.profilePicture.startsWith("http")
                  ? notary.profilePicture
                  : `${ipfs_microservice_url}/file/${notary.profilePicture}`
                : "";

              return (
                <div
                  key={notary._id || wallet}
                  className="bg-white rounded-xl shadow-md overflow-hidden transform transition-all hover:scale-[1.02] hover:shadow-xl"
                >
                  {/* Display Picture Section */}
                  <div className="relative bg-gradient-to-br from-purple-500 to-indigo-600 h-32 flex items-center justify-center">
                    {profileImage ? (
                      <img 
                        src={profileImage} 
                        alt={notary.name || "Notary"} 
                        className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center border-4 border-white shadow-lg">
                        <UserCircle className="w-16 h-16 text-white" />
                      </div>
                    )}
                    {notary.kycStatus && (
                      <div className={`absolute top-3 right-3 px-3 py-1 text-xs font-medium rounded-full ${
                        notary.kycStatus === "verified"
                          ? "bg-green-500 text-white"
                          : notary.kycStatus === "pending"
                          ? "bg-yellow-500 text-white"
                          : "bg-red-500 text-white"
                      }`}>
                        {notary.kycStatus.toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Details Section */}
                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{notary.name || "Unknown Notary"}</h3>
                      <p className="text-sm text-gray-500 capitalize">{notary.role || "Notary"}</p>
                    </div>

                    <div className="space-y-3 bg-gray-50 rounded-lg p-4 border border-gray-100">
                      {notary.email && (
                        <div className="flex items-start gap-3">
                          <Mail className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500 uppercase font-medium">Email</p>
                            <p className="text-sm text-gray-900 truncate">{notary.email}</p>
                          </div>
                        </div>
                      )}
                      
                      {wallet && (
                        <div className="flex items-start gap-3">
                          <Wallet className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500 uppercase font-medium">Wallet Address</p>
                            <p className="text-xs text-gray-900 font-mono break-all">{wallet}</p>
                          </div>
                        </div>
                      )}

                      {notary.nic && (
                        <div className="flex items-start gap-3">
                          <UserIcon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500 uppercase font-medium">NIC</p>
                            <p className="text-sm text-gray-900">{notary.nic}</p>
                          </div>
                        </div>
                      )}

                      {notary.createdAt && (
                        <div className="flex items-start gap-3">
                          <Calendar className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500 uppercase font-medium">Created At</p>
                            <p className="text-sm text-gray-900">{formatDate(notary.createdAt)}</p>
                          </div>
                        </div>
                      )}

                      {notary.updatedAt && notary.updatedAt !== notary.createdAt && (
                        <div className="flex items-start gap-3">
                          <Calendar className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500 uppercase font-medium">Updated At</p>
                            <p className="text-sm text-gray-900">{formatDate(notary.updatedAt)}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => handleAddSigner(wallet)}
                      disabled={processingAddress === wallet || alreadyRole || notary.kycStatus != "verified"}
                      className={`w-full px-6 py-3 rounded-lg font-medium text-white transition-all shadow-md ${
                        processingAddress === wallet || alreadyRole || notary.kycStatus != "verified"
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
                      }`}
                    >
                      { alreadyRole
                        ? "Already Added"
                        : processingAddress === wallet
                        ? "Processing..."
                        : "Add Signer"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotaryRequests;
