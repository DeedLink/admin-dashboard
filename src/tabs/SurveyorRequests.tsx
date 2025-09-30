import { useState, useEffect } from 'react';
import { addSigner } from "../web3.0/contractService";
import type { User } from "../types/types";
import { getUsers } from '../api/api';

const SurveyorRequests = () => {
  const [surveyors, setSurveyors] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingAddress, setProcessingAddress] = useState<string | null>(null);

  useEffect(() => {
    fetchSurveyors();
  }, []);

  async function fetchSurveyors() {
    try {
      setLoading(true);
      setError(null);
      
      const users = await getUsers();
      
      const surveyorUsers = users.filter(user => 
        user.role?.toUpperCase() === 'SURVEYOR'
      );
      
      setSurveyors(surveyorUsers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load surveyors');
      console.error("Error fetching surveyors:", err);
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
      console.error("Error adding signer:", err);
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
    <div className="w-full h-full p-6 bg-gradient-to-br from-green-50 to-green-100">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Surveyor Requests
        </h2>
        
        {surveyors.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            No surveyor requests found
          </div>
        ) : (
          <div className="space-y-4">
            {surveyors.map((surveyor) => (
              <div 
                key={surveyor._id || surveyor.walletAddress} 
                className="bg-white rounded-lg shadow-md p-6 flex items-center justify-between hover:shadow-lg transition-shadow"
              >
                <div className="flex-1">
                  <div className="font-semibold text-gray-800">
                    {surveyor.name || 'Unknown Surveyor'}
                  </div>
                  {surveyor.email && (
                    <div className="text-sm text-gray-600 mt-1">
                      {surveyor.email}
                    </div>
                  )}
                  <div className="text-xs text-gray-500 mt-2 font-mono">
                    {surveyor.walletAddress}
                  </div>
                  {surveyor.kycStatus && (
                    <span className={`inline-block mt-2 px-3 py-1 text-xs rounded-full ${
                      surveyor.kycStatus === "verified"
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
                  onClick={() => handleAddSigner(surveyor.walletAddress || "")}
                  disabled={processingAddress === surveyor.walletAddress}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    processingAddress === surveyor.walletAddress
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-green-500 hover:bg-green-600 cursor-pointer'
                  } text-white`}
                >
                  {processingAddress === surveyor.walletAddress ? 'Processing...' : 'Add Signer'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SurveyorRequests;