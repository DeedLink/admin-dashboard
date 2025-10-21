import { useState, useEffect } from 'react';
import { addSigner, getRolesOf } from "../web3.0/contractService";
import type { User } from "../types/types";
import { getUsers } from '../api/api';

const SurveyorRequests = () => {
  const [surveyors, setSurveyors] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingAddress, setProcessingAddress] = useState<string | null>(null);
  const [rolesMap, setRolesMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchSurveyors();
  }, []);

  async function fetchSurveyors() {
    try {
      setLoading(true);
      setError(null);
      const users = await getUsers();
      const surveyorUsers = users.filter(user => user.role?.toUpperCase() === 'SURVEYOR');
      setSurveyors(surveyorUsers);

      const roles: Record<string, boolean> = {};
      await Promise.all(surveyorUsers.map(async (u) => {
        if (u.walletAddress) {
          const walletRoles = await getRolesOf(u.walletAddress);
          roles[u.walletAddress] = walletRoles.surveyor;
        }
      }));
      setRolesMap(roles);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load surveyors');
    } finally {
      setLoading(false);
    }
  }

  async function handleAddSigner(address: string) {
    try {
      setProcessingAddress(address);
      const tx = await addSigner("SURVEYOR", address);
      console.log("Signer added:", tx);
      await fetchSurveyors();
      alert(`Successfully added surveyor signer: ${address}`);
    } catch (err) {
      alert(`Failed to add signer: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setProcessingAddress(null);
    }
  }

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-gray-600">Loading surveyors...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-4">
        <div className="text-red-600">Error: {error}</div>
        <button
          onClick={fetchSurveyors}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="w-full h-full p-6">
      <div className="max-w-7xl mx-auto">

        <div className="flex flex-row justify-between items-center">
          <h2 className="text-2xl font-bold text-white mb-6">Surveyor Requests</h2>
          <button
            className="text-xl font-semibold text-white mb-6 px-5 py-2 rounded-xl 
             bg-gradient-to-r from-blue-700 to-indigo-600 border border-black
             transition-all duration-300 ease-in-out 
             hover:from-indigo-600 hover:to-blue-700 
             hover:shadow-[0_0_20px_rgba(99,102,241,0.8)] 
             hover:scale-105 hover:-translate-y-1 hover:animate-pulse">
            Pending Requests
          </button>
        </div>
        
        {surveyors.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            No surveyor requests found
          </div>
        ) : (
          <div className="space-y-4">
            {surveyors.map((surveyor) => {
              const wallet = surveyor.walletAddress || '';
              const alreadyRole = rolesMap[wallet] || false;

              return (
                <div
                  key={surveyor._id || wallet}
                  className="bg-white rounded-lg shadow-md p-6 flex items-center justify-between hover:shadow-lg transition-shadow"
                >
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800">{surveyor.name || 'Unknown Surveyor'}</div>
                    {surveyor.email && (
                      <div className="text-sm text-gray-600 mt-1">{surveyor.email}</div>
                    )}
                    <div className="text-xs text-gray-500 mt-2 font-mono">{wallet}</div>
                    {surveyor.kycStatus && (
                      <span className={`inline-block mt-2 px-3 py-1 text-xs rounded-full ${surveyor.kycStatus === "verified"
                          ? 'bg-green-100 text-green-800'
                          : surveyor.kycStatus === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                        {surveyor.kycStatus}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleAddSigner(wallet)}
                    disabled={processingAddress === wallet || alreadyRole}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${processingAddress === wallet || alreadyRole
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-green-500 hover:bg-green-600 cursor-pointer'
                      } text-white`}
                  >
                    {alreadyRole
                      ? 'Already Added'
                      : processingAddress === wallet
                        ? 'Processing...'
                        : 'Add Signer'}
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

export default SurveyorRequests;
