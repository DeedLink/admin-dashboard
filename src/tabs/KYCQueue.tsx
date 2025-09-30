import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Search, Eye, Download, FileText, User as UserIcon, Mail, Wallet, X, Loader2, AlertCircle, Filter } from "lucide-react";
import { listPendingKYC, verifyKYC } from '../api/api';
import type { User, VerifyKYCRequest } from '../types/types';

const KYCQueue = () => {
  const [kycRequests, setKycRequests] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [userToReject, setUserToReject] = useState<User | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('pending');

  useEffect(() => {
    fetchKYCRequests();
  }, []);

  async function fetchKYCRequests() {
    try {
      setLoading(true);
      setError(null);
      const data = await listPendingKYC();
      setKycRequests(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load KYC requests');
      console.error("Error fetching KYC requests:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(userId: string) {
    try {
      setProcessingId(userId);
      const data: VerifyKYCRequest = { status: 'verified' };
      await verifyKYC(userId, data);
      await fetchKYCRequests();
      setSelectedUser(null);
      alert('KYC verified successfully!');
    } catch (err) {
      console.error("Error verifying KYC:", err);
      alert(`Failed to verify KYC: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setProcessingId(null);
    }
  }

  async function handleReject(userId: string) {
    try {
      setProcessingId(userId);
      const data: VerifyKYCRequest = { 
        status: 'rejected'
      };
      await verifyKYC(userId, data);
      await fetchKYCRequests();
      setSelectedUser(null);
      setShowRejectModal(false);
      setRejectionReason('');
      alert('KYC rejected successfully!');
    } catch (err) {
      console.error("Error rejecting KYC:", err);
      alert(`Failed to reject KYC: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setProcessingId(null);
    }
  }

  const filteredRequests = kycRequests.filter(user => {
    const matchesSearch = !searchQuery || 
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.walletAddress?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filter === 'all' || user.kycStatus === filter;
    
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500/50 rounded-2xl p-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-400 mb-4">{error}</p>
        <button 
          onClick={fetchKYCRequests}
          className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-xl transition-all"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">KYC Verification Queue</h2>
          <p className="text-gray-400">Review and approve user identity documents</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-xl">
            <span className="text-purple-400 font-semibold">{filteredRequests.length} Requests</span>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name, email or wallet address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-900/50 border border-gray-700 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* KYC Requests Grid */}
      {filteredRequests.length === 0 ? (
        <div className="bg-gray-800/30 rounded-2xl border border-gray-700/50 p-12 text-center">
          <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No KYC requests found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredRequests.map((user) => (
            <div
              key={user._id}
              className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 hover:border-purple-500/50 transition-all p-6 space-y-4"
            >
              {/* User Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <UserIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-lg">{user.name || 'Unknown'}</h3>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                      user.kycStatus === 'verified' ? 'bg-green-500/10 text-green-400' :
                      user.kycStatus === 'rejected' ? 'bg-red-500/10 text-red-400' :
                      'bg-yellow-500/10 text-yellow-400'
                    }`}>
                      {user.kycStatus || 'pending'}
                    </span>
                  </div>
                </div>
              </div>

              {/* User Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Mail size={16} />
                  <span className="truncate">{user.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Wallet size={16} />
                  <span className="font-mono text-xs truncate">{user.walletAddress}</span>
                </div>
                {user.role && (
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <UserIcon size={16} />
                    <span className="capitalize">{user.role}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => setSelectedUser(user)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/50 rounded-xl text-purple-400 hover:text-purple-300 transition-all font-medium"
                >
                  <Eye size={18} />
                  <span>Review</span>
                </button>
                {user.kycStatus === 'pending' && (
                  <>
                    <button
                      onClick={() => handleVerify(user._id!)}
                      disabled={processingId === user._id}
                      className="p-2.5 bg-green-600/20 hover:bg-green-600/30 border border-green-500/50 rounded-xl text-green-400 hover:text-green-300 transition-all disabled:opacity-50"
                    >
                      {processingId === user._id ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                    </button>
                    <button
                      onClick={() => {
                        setUserToReject(user);
                        setShowRejectModal(true);
                      }}
                      disabled={processingId === user._id}
                      className="p-2.5 bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 rounded-xl text-red-400 hover:text-red-300 transition-all disabled:opacity-50"
                    >
                      <XCircle size={18} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Document Review Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-6 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-white">KYC Document Review</h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-2 hover:bg-gray-800 rounded-xl transition-all"
              >
                <X size={24} className="text-gray-400" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* User Information */}
              <div className="bg-gray-800/50 rounded-xl p-6 space-y-4">
                <h4 className="text-lg font-semibold text-white mb-4">User Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-400">Full Name</label>
                    <p className="text-white font-medium">{selectedUser.name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Email</label>
                    <p className="text-white font-medium">{selectedUser.email}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Wallet Address</label>
                    <p className="text-white font-mono text-sm">{selectedUser.walletAddress}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Role</label>
                    <p className="text-white font-medium capitalize">{selectedUser.role}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">KYC Status</label>
                    <p className={`font-medium capitalize ${
                      selectedUser.kycStatus === 'verified' ? 'text-green-400' :
                      selectedUser.kycStatus === 'rejected' ? 'text-red-400' :
                      'text-yellow-400'
                    }`}>
                      {selectedUser.kycStatus || 'pending'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Document Display */}
              <div className="bg-gray-800/50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-white mb-4">KYC Documents</h4>
                {selectedUser.kycDocumentHash ? (
                  <div className="space-y-4">
                    <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-gray-400">Document URI</span>
                        <a
                          href={selectedUser.kycDocumentHash}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/50 rounded-lg text-blue-400 text-sm transition-all"
                        >
                          <Download size={16} />
                          Download
                        </a>
                      </div>
                      <p className="text-white font-mono text-sm break-all">{selectedUser.kycDocumentHash}</p>
                    </div>
                    
                    {/* Document Preview (if image) */}
                    {selectedUser.kycDocumentHash.match(/\.(jpg|jpeg|png|gif|webp)$/i) && (
                      <img
                        src={selectedUser.kycDocumentHash}
                        alt="KYC Document"
                        className="w-full rounded-xl border border-gray-700"
                      />
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No documents uploaded</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              {selectedUser.kycStatus === 'pending' && (
                <div className="flex gap-4">
                  <button
                    onClick={() => handleVerify(selectedUser._id!)}
                    disabled={processingId === selectedUser._id}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 rounded-xl text-white font-semibold transition-all disabled:opacity-50"
                  >
                    {processingId === selectedUser._id ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <>
                        <CheckCircle size={20} />
                        <span>Approve KYC</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setUserToReject(selectedUser);
                      setShowRejectModal(true);
                      setSelectedUser(null);
                    }}
                    disabled={processingId === selectedUser._id}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 rounded-xl text-white font-semibold transition-all disabled:opacity-50"
                  >
                    <XCircle size={20} />
                    <span>Reject KYC</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && userToReject && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-md w-full p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Reject KYC</h3>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                }}
                className="p-2 hover:bg-gray-800 rounded-xl transition-all"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">Rejection Reason</label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Please provide a reason for rejection..."
                className="w-full bg-gray-800/50 border border-gray-700 rounded-xl p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all min-h-[120px]"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                }}
                className="flex-1 px-4 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-xl text-white transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(userToReject._id!)}
                disabled={!rejectionReason.trim() || processingId === userToReject._id}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 rounded-xl text-white font-semibold transition-all disabled:opacity-50"
              >
                {processingId === userToReject._id ? (
                  <Loader2 size={20} className="animate-spin mx-auto" />
                ) : (
                  'Reject KYC'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KYCQueue;