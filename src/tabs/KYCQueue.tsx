import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Search, Eye, Download, FileText, User as UserIcon, Mail, Wallet, X, Loader2, AlertCircle, Filter } from "lucide-react";
import { listPendingKYC, verifyKYC, getFileUrl } from '../api/api';
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
  const [fileUrls, setFileUrls] = useState<{ [key: string]: string }>({});

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
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(userId: string) {
    try {
      setProcessingId(userId);
      await verifyKYC(userId, { status: 'verified' });
      await fetchKYCRequests();
      setSelectedUser(null);
      alert('KYC verified successfully!');
    } catch (err) {
      alert(`Failed to verify KYC: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setProcessingId(null);
    }
  }

  async function handleReject(userId: string) {
    try {
      setProcessingId(userId);
      await verifyKYC(userId, { status: 'rejected' });
      await fetchKYCRequests();
      setSelectedUser(null);
      setShowRejectModal(false);
      setRejectionReason('');
      alert('KYC rejected successfully!');
    } catch (err) {
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
    return (filter === 'all' || user.kycStatus === filter) && matchesSearch;
  });

  const stats = {
    total: kycRequests.length,
    pending: kycRequests.filter(u => u.kycStatus === 'pending').length,
    verified: kycRequests.filter(u => u.kycStatus === 'verified').length,
    rejected: kycRequests.filter(u => u.kycStatus === 'rejected').length
  };

  useEffect(() => {
    if (selectedUser?.kycDocuments) {
      const loadUrls = async () => {
        const urls: { [key: string]: string } = {};
        for (const [key, filename] of Object.entries(selectedUser.kycDocuments || {})) {
          urls[key] = await getFileUrl(filename);
        }
        setFileUrls(urls);
      };
      loadUrls();
    } else {
      setFileUrls({});
    }
  }, [selectedUser]);

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center"><Loader2 className="w-10 h-10 text-slate-600 animate-spin mx-auto mb-3" /><p className="text-slate-600 text-sm font-medium">Loading requests...</p></div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white border border-red-200 rounded-xl p-8 text-center max-w-md shadow-sm">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-slate-900 mb-2">Error Loading Data</h3>
        <p className="text-slate-600 text-sm mb-6">{error}</p>
        <button onClick={fetchKYCRequests} className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-lg">Try Again</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div><h1 className="text-2xl font-semibold text-slate-900">KYC Verification Queue</h1><p className="text-sm text-slate-600 mt-1">Review and manage identity verification requests</p></div>
            <div className="text-right"><div className="text-3xl font-bold text-slate-900">{filteredRequests.length}</div><div className="text-xs text-slate-500 font-medium">Active</div></div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2"><span className="text-xs font-medium text-slate-600 uppercase">Total</span><FileText className="w-4 h-4 text-slate-400" /></div>
              <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2"><span className="text-xs font-medium text-amber-700 uppercase">Pending</span><AlertCircle className="w-4 h-4 text-amber-500" /></div>
              <p className="text-2xl font-bold text-amber-900">{stats.pending}</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2"><span className="text-xs font-medium text-green-700 uppercase">Verified</span><CheckCircle className="w-4 h-4 text-green-500" /></div>
              <p className="text-2xl font-bold text-green-900">{stats.verified}</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2"><span className="text-xs font-medium text-red-700 uppercase">Rejected</span><XCircle className="w-4 h-4 text-red-500" /></div>
              <p className="text-2xl font-bold text-red-900">{stats.rejected}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder="Search by name, email or wallet address..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent" />
            </div>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3">
              <Filter size={16} className="text-slate-500" />
              <select value={filter} onChange={(e) => setFilter(e.target.value as any)} className="bg-transparent text-sm font-medium text-slate-700 focus:outline-none">
                <option value="all">All</option><option value="pending">Pending</option><option value="verified">Verified</option><option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {filteredRequests.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-16 text-center shadow-sm">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-medium text-slate-900 mb-1">No requests found</h3>
            <p className="text-sm text-slate-500">Adjust your search or filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredRequests.map(user => (
              <div key={user._id} className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-5 shadow-sm">
                <div className="flex items-start gap-3 mb-4">
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center">
                      <UserIcon className="w-6 h-6 text-slate-600" />
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${user.kycStatus === 'verified' ? 'bg-green-500' : user.kycStatus === 'rejected' ? 'bg-red-500' : 'bg-amber-500'}`}></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 text-sm truncate">{user.name || 'Unknown'}</h3>
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium mt-1 ${user.kycStatus === 'verified' ? 'bg-green-100 text-green-700' : user.kycStatus === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                      {user.kycStatus || 'pending'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 mb-4 bg-slate-50 rounded-lg p-3 border border-slate-100">
                  <div className="flex items-center gap-2 text-xs"><Mail size={14} className="text-slate-400 flex-shrink-0" /><span className="text-slate-600 truncate">{user.email}</span></div>
                  <div className="flex items-center gap-2 text-xs"><Wallet size={14} className="text-slate-400 flex-shrink-0" /><span className="font-mono text-slate-600 truncate">{user.walletAddress}</span></div>
                  {user.role && <div className="flex items-center gap-2 text-xs"><UserIcon size={14} className="text-slate-400 flex-shrink-0" /><span className="text-slate-600 capitalize">{user.role}</span></div>}
                </div>

                <div className="flex gap-2">
                  <button onClick={() => setSelectedUser(user)} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg">
                    <Eye size={14} />Review
                  </button>
                  {user.kycStatus === 'pending' && (
                    <>
                      <button onClick={() => handleVerify(user._id)} disabled={processingId === user._id} className="p-2 bg-green-50 hover:bg-green-100 border border-green-200 text-green-600 rounded-lg disabled:opacity-50">
                        {processingId === user._id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                      </button>
                      <button onClick={() => { setUserToReject(user); setShowRejectModal(true); }} disabled={processingId === user._id} className="p-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded-lg disabled:opacity-50">
                        <XCircle size={14} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedUser && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-lg flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-xl">
              <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                <div><h3 className="text-lg font-semibold text-slate-900">Document Review</h3><p className="text-xs text-slate-500 mt-0.5">Verify identity credentials</p></div>
                <button onClick={() => setSelectedUser(null)} className="p-2 hover:bg-slate-100 rounded-lg"><X size={20} className="text-slate-500" /></button>
              </div>

              <div className="overflow-y-auto max-h-[calc(90vh-140px)] px-6 py-5 space-y-5">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-5">
                  <h4 className="text-sm font-semibold text-slate-900 mb-4">User Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-xs text-slate-500 font-medium uppercase">Full Name</label><p className="text-sm font-medium text-slate-900 mt-1">{selectedUser.name}</p></div>
                    <div><label className="text-xs text-slate-500 font-medium uppercase">Email</label><p className="text-sm font-medium text-slate-900 mt-1">{selectedUser.email}</p></div>
                    <div><label className="text-xs text-slate-500 font-medium uppercase">Wallet</label><p className="text-xs font-mono text-slate-900 mt-1 break-all">{selectedUser.walletAddress}</p></div>
                    <div><label className="text-xs text-slate-500 font-medium uppercase">Role</label><p className="text-sm font-medium text-slate-900 mt-1 capitalize">{selectedUser.role}</p></div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-slate-900 mb-3">Documents</h4>
                  {selectedUser.kycDocuments ? (
                    <div className="grid grid-cols-3 gap-4">
                      {Object.entries(selectedUser.kycDocuments).map(([key, filename]) => (
                        <div key={key} className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-medium text-slate-700 capitalize">{key}</span>
                            <a href={fileUrls[key]} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded">
                              <Download size={12} />Download
                            </a>
                          </div>
                          {filename.match(/\.(jpg|jpeg|png|gif|webp)$/i) && fileUrls[key] && (
                            <img src={fileUrls[key]} alt={key} className="w-full rounded border border-slate-200" />
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-slate-50 border border-slate-200 rounded-lg">
                      <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm text-slate-500">No documents</p>
                    </div>
                  )}
                </div>
              </div>

              {selectedUser.kycStatus === 'pending' && (
                <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 flex gap-3 justify-end">
                  <button onClick={() => handleVerify(selectedUser._id)} className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg flex items-center gap-2">
                    <CheckCircle size={16} />Approve
                  </button>
                  <button onClick={() => { setUserToReject(selectedUser); setShowRejectModal(true); }} className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg flex items-center gap-2">
                    <XCircle size={16} />Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {showRejectModal && userToReject && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center"><XCircle className="w-5 h-5 text-red-600" /></div>
                <div><h3 className="text-base font-semibold text-slate-900">Reject Request</h3><p className="text-xs text-slate-500">Provide reason for {userToReject.name}</p></div>
              </div>
              <textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} placeholder="Reason for rejection..." rows={3} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none mb-4" />
              <div className="flex gap-3 justify-end">
                <button onClick={() => { setShowRejectModal(false); setRejectionReason(''); }} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg">Cancel</button>
                <button onClick={() => handleReject(userToReject._id)} disabled={processingId === userToReject._id} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg flex items-center gap-2 disabled:opacity-50">
                  {processingId === userToReject._id ? <><Loader2 size={14} className="animate-spin" />Processing</> : <><XCircle size={14} />Confirm</>}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default KYCQueue;