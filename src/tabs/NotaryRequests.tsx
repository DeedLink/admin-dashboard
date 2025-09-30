import { useState, useEffect } from 'react';
import { addSigner } from "../web3.0/contractService";
import type { User } from "../types/types";
import { getUsers } from '../api/api';

const NotaryRequests = () => {
  const [notaries, setNotaries] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingAddress, setProcessingAddress] = useState<string | null>(null);

  useEffect(() => {
    fetchNotaries();
  }, []);

  async function fetchNotaries() {
    try {
      setLoading(true);
      setError(null);
      
      const users = await getUsers();
      
      const notaryUsers = users.filter(user => 
        user.role?.toUpperCase() === 'NOTARY'
      );
      
      setNotaries(notaryUsers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notaries');
      console.error("Error fetching notaries:", err);
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
      
      alert(`Successfully added notary signer: ${address}`);
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
        <div className="text-gray-600">Loading notaries...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-4">
        <div className="text-red-600">Error: {error}</div>
        <button 
          onClick={fetchNotaries}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="w-full h-full p-6 bg-gradient-to-br from-purple-50 to-purple-100">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Notary Requests
        </h2>
        
        {notaries.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            No notary requests found
          </div>
        ) : (
          <div className="space-y-4">
            {notaries.map((notary) => (
              <div 
                key={notary._id || notary.walletAddress} 
                className="bg-white rounded-lg shadow-md p-6 flex items-center justify-between hover:shadow-lg transition-shadow"
              >
                <div className="flex-1">
                  <div className="font-semibold text-gray-800">
                    {notary.name || 'Unknown Notary'}
                  </div>
                  {notary.email && (
                    <div className="text-sm text-gray-600 mt-1">
                      {notary.email}
                    </div>
                  )}
                  <div className="text-xs text-gray-500 mt-2 font-mono">
                    {notary.walletAddress}
                  </div>
                  {notary.kycStatus && (
                    <span className={`inline-block mt-2 px-3 py-1 text-xs rounded-full ${
                      notary.kycStatus === "verified"
                        ? 'bg-green-100 text-green-800' 
                        : notary.kycStatus === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {notary.kycStatus}
                    </span>
                  )}
                </div>
                
                <button 
                  onClick={() => handleAddSigner(notary.walletAddress || "")}
                  disabled={processingAddress === notary.walletAddress}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    processingAddress === notary.walletAddress
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-purple-500 hover:bg-purple-600 cursor-pointer'
                  } text-white`}
                >
                  {processingAddress === notary.walletAddress ? 'Processing...' : 'Add Signer'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotaryRequests;