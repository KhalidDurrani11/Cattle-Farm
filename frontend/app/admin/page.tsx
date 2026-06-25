'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  getAdminStats,
  getPendingUserVerifications,
  verifyUser,
  rejectUser,
  getPendingListings,
  approveListing,
  rejectListing,
  getAllUsers,
  banUser,
  unbanUser,
  adminDeleteListing
} from '@/lib/api';
import { Cattle, User } from '@/types';
import {
  ShieldCheck, Loader2, AlertCircle, Users, Package, Eye,
  CheckCircle, XCircle, Trash2, ShieldAlert, Ban, Check, RefreshCw
} from 'lucide-react';
import Image from 'next/image';

interface AdminStats {
  users: { total: number; verified: number; pending: number; byRole: any[] };
  cattle: { total: number; available: number; sold: number; verified: number; pending: number; byCategory: any[] };
  recentUsers: User[];
}

export default function AdminPage() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'overview' | 'listings' | 'users' | 'sellers' | 'moderation'>('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [pendingListings, setPendingListings] = useState<Cattle[]>([]);
  const [pendingSellers, setPendingSellers] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allListings, setAllListings] = useState<Cattle[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  // Ban Modal state
  const [showBanModal, setShowBanModal] = useState(false);
  const [banningUserId, setBanningUserId] = useState<string | null>(null);
  const [banReason, setBanReason] = useState('');

  // Reject Listing Modal state
  const [showRejectListingModal, setShowRejectListingModal] = useState(false);
  const [rejectCattleId, setRejectCattleId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== 'admin') {
        router.push('/');
      } else {
        loadAdminData();
      }
    }
  }, [user, authLoading, router]);

  const loadAdminData = async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const [statsRes, pendingListingsRes, pendingSellersRes, usersRes] = await Promise.all([
        getAdminStats(token),
        getPendingListings(token),
        getPendingUserVerifications(token),
        getAllUsers(token)
      ]);

      setStats(statsRes);
      setPendingListings(pendingListingsRes);
      setPendingSellers(pendingSellersRes);
      setAllUsers(usersRes);

      // We can also load all active listings for moderation
      // We do this by calling getCattle which is public
      const { getCattle } = await import('@/lib/api');
      const activeCattleRes = await getCattle({ limit: '100' });
      setAllListings(activeCattleRes.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch admin data.');
    } finally {
      setLoading(false);
    }
  };

  const showToastMsg = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  // Listing Verification Handlers
  const handleApproveListing = async (id: string) => {
    if (!token) return;
    setActionLoading(`approve-${id}`);
    try {
      await approveListing(id, token);
      showToastMsg('Listing approved and published successfully.');
      loadAdminData();
    } catch (err: any) {
      setError(err.message || 'Failed to approve listing.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleOpenRejectListing = (id: string) => {
    setRejectCattleId(id);
    setRejectReason('');
    setShowRejectListingModal(true);
  };

  const handleConfirmRejectListing = async () => {
    if (!token || !rejectCattleId) return;
    setActionLoading(`reject-${rejectCattleId}`);
    try {
      await rejectListing(rejectCattleId, rejectReason, token);
      showToastMsg('Listing rejected.');
      setShowRejectListingModal(false);
      loadAdminData();
    } catch (err: any) {
      setError(err.message || 'Failed to reject listing.');
    } finally {
      setActionLoading(null);
    }
  };

  // Seller Verification Handlers
  const handleVerifySeller = async (userId: string, docType: string) => {
    if (!token) return;
    setActionLoading(`verify-user-${userId}`);
    try {
      await verifyUser(userId, docType, token);
      showToastMsg('Seller document verified successfully.');
      loadAdminData();
    } catch (err: any) {
      setError(err.message || 'Failed to verify user.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectSeller = async (userId: string, docType: string) => {
    if (!token) return;
    const reason = prompt('Please enter the reason for rejection:');
    if (reason === null) return;
    setActionLoading(`reject-user-${userId}`);
    try {
      await rejectUser(userId, reason || 'Incomplete details.', docType, token);
      showToastMsg('Seller verification rejected.');
      loadAdminData();
    } catch (err: any) {
      setError(err.message || 'Failed to reject verification.');
    } finally {
      setActionLoading(null);
    }
  };

  // User Banning Handlers
  const handleOpenBanModal = (userId: string) => {
    setBanningUserId(userId);
    setBanReason('');
    setShowBanModal(true);
  };

  const handleConfirmBan = async () => {
    if (!token || !banningUserId) return;
    setActionLoading(`ban-${banningUserId}`);
    try {
      await banUser(banningUserId, banReason, token);
      showToastMsg('User banned successfully.');
      setShowBanModal(false);
      loadAdminData();
    } catch (err: any) {
      setError(err.message || 'Failed to ban user.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnbanUser = async (userId: string) => {
    if (!token) return;
    setActionLoading(`unban-${userId}`);
    try {
      await unbanUser(userId, token);
      showToastMsg('User unbanned successfully.');
      loadAdminData();
    } catch (err: any) {
      setError(err.message || 'Failed to unban user.');
    } finally {
      setActionLoading(null);
    }
  };

  // Delete Listing Handler
  const handleDeleteListing = async (id: string) => {
    if (!token || !confirm('Are you sure you want to permanently delete this listing?')) return;
    setActionLoading(`delete-${id}`);
    try {
      await adminDeleteListing(id, token);
      showToastMsg('Listing deleted successfully.');
      loadAdminData();
    } catch (err: any) {
      setError(err.message || 'Failed to delete listing.');
    } finally {
      setActionLoading(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
          <p className="text-muted font-medium">Loading administrative console...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Toast Notification */}
        {toast && (
          <div className="fixed top-20 right-4 z-50 bg-green-600 text-white px-6 py-3.5 rounded-xl shadow-2xl font-semibold animate-slide-down">
            {toast}
          </div>
        )}

        {/* Error Notification */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-400 p-4 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="font-medium text-sm">{error}</p>
            <button onClick={() => setError('')} className="ml-auto text-red-700 hover:text-red-900 font-bold">&times;</button>
          </div>
        )}

        {/* Admin Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-line gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Admin Control Panel</h1>
              <span className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider">
                System Administrator
              </span>
            </div>
            <p className="text-muted mt-1">Manage listings approval, seller verifications, and user moderation.</p>
          </div>
          <button 
            onClick={loadAdminData}
            className="flex items-center justify-center gap-2 px-4 py-2 border border-line rounded-xl hover:bg-surface-hover transition-colors font-semibold text-sm"
          >
            <RefreshCw className="w-4 h-4" /> Refresh Data
          </button>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 bg-gray-100 dark:bg-slate-800 p-1.5 rounded-2xl w-fit">
          {[
            { id: 'overview', label: 'Overview Stats', icon: ShieldCheck },
            { id: 'listings', label: `Pending Listings (${pendingListings.length})`, icon: Package },
            { id: 'sellers', label: `Seller Documents (${pendingSellers.length})`, icon: ShieldCheck },
            { id: 'users', label: 'All Users & Moderation', icon: Users },
            { id: 'moderation', label: 'Active Listings Moderation', icon: ShieldAlert },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeTab === id
                  ? 'bg-white dark:bg-slate-700 shadow-md text-primary dark:text-primary'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              <Icon className="w-4.5 h-4.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Tab Contents */}

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-8 animate-fade-in">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="glass-card p-6 rounded-2xl border border-line">
                <p className="text-sm font-medium text-muted">Total Registered Users</p>
                <p className="text-3xl font-bold mt-1">{stats.users.total}</p>
                <div className="flex items-center gap-4 mt-3 text-xs text-muted">
                  <span className="text-green-600 dark:text-green-400 font-semibold">{stats.users.verified} Verified</span>
                  <span className="text-amber-600 dark:text-amber-400 font-semibold">{stats.users.pending} Pending</span>
                </div>
              </div>

              <div className="glass-card p-6 rounded-2xl border border-line">
                <p className="text-sm font-medium text-muted">Total Listed Cattle</p>
                <p className="text-3xl font-bold mt-1">{stats.cattle.total}</p>
                <div className="flex items-center gap-4 mt-3 text-xs text-muted">
                  <span className="text-green-600 dark:text-green-400 font-semibold">{stats.cattle.available} Live</span>
                  <span className="text-blue-600 dark:text-blue-400 font-semibold">{stats.cattle.sold} Sold</span>
                </div>
              </div>

              <div className="glass-card p-6 rounded-2xl border border-line">
                <p className="text-sm font-medium text-muted">Approval Queues</p>
                <p className="text-3xl font-bold mt-1 text-amber-600">{pendingListings.length}</p>
                <p className="text-xs text-muted mt-3">Cattle listings waiting for approval</p>
              </div>

              <div className="glass-card p-6 rounded-2xl border border-line">
                <p className="text-sm font-medium text-muted">Pending Verification</p>
                <p className="text-3xl font-bold mt-1 text-amber-600">{pendingSellers.length}</p>
                <p className="text-xs text-muted mt-3">Sellers waiting for CNIC verification</p>
              </div>
            </div>

            {/* Category breakdown & Recent users */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="glass-card p-6 rounded-2xl border border-line bg-white/95 dark:bg-[#181b18]/95">
                <h3 className="font-serif text-xl font-bold mb-4 text-[#4E342E] dark:text-[#EFEBE9]">Recent Platform Signups</h3>
                <div className="space-y-4">
                  {stats.recentUsers.slice(0, 5).map((u) => (
                    <div key={u._id} className="flex items-center justify-between border-b border-line pb-3 last:border-0 last:pb-0">
                      <div>
                        <p className="font-semibold text-sm">{u.name}</p>
                        <p className="text-xs text-muted">{u.email} • {u.role}</p>
                      </div>
                      <span className="text-xs text-muted">{new Date(u.joinedAt).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card p-6 rounded-2xl border border-line bg-white/95 dark:bg-[#181b18]/95">
                <h3 className="font-serif text-xl font-bold mb-4 text-[#4E342E] dark:text-[#EFEBE9]">Category Distribution</h3>
                <div className="space-y-3">
                  {stats.cattle.byCategory.map((cat) => (
                    <div key={cat._id} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-semibold">{cat._id || 'Unclassified'}</span>
                        <span className="text-muted font-medium">{cat.count} listings</span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-primary h-full rounded-full" 
                          style={{ width: `${stats.cattle.total > 0 ? (cat.count / stats.cattle.total) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Pending Listings Moderation */}
        {activeTab === 'listings' && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-xl font-bold mb-4">Cattle Listings Pending Approval ({pendingListings.length})</h2>
            {pendingListings.length === 0 ? (
              <div className="text-center py-20 bg-white/90 dark:bg-[#181b18]/90 rounded-2xl border border-line">
                <Package className="w-16 h-16 text-gray-300 dark:text-slate-700 mx-auto mb-4 animate-float" />
                <p className="text-muted font-semibold">No listings currently in the moderation queue.</p>
                <p className="text-xs text-muted mt-1">All user uploads are currently approved and active.</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {pendingListings.map((c) => (
                  <div key={c._id} className="bg-white dark:bg-slate-800 border border-line rounded-2xl p-6 shadow-sm flex flex-col lg:flex-row gap-6">
                    {/* Images */}
                    <div className="w-full lg:w-72 h-48 bg-gray-100 dark:bg-slate-700 rounded-xl overflow-hidden flex-shrink-0 relative">
                      {c.images && c.images.length > 0 ? (
                        <Image src={c.images[0]} alt={c.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted font-semibold text-sm">No Image Uploaded</div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-bold">{c.name}</h3>
                          <p className="text-sm text-primary font-semibold">{c.breed} • {c.category} • {c.gender}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-black text-primary">₨{c.price.toLocaleString()}</p>
                          <p className="text-xs text-muted">Weight: {c.weight} • Age: {c.age}</p>
                        </div>
                      </div>

                      <div className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-xl text-sm space-y-1">
                        <p><strong>Description:</strong> {c.description || 'No description provided.'}</p>
                        {c.healthNotes && <p><strong>Health Notes:</strong> {c.healthNotes}</p>}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-muted">
                        <div>
                          <p className="font-semibold text-foreground">Seller</p>
                          <p>{(c.sellerId as any)?.name || 'Unknown'}</p>
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">Contact</p>
                          <p>{(c.sellerId as any)?.phone || 'None'}</p>
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">Province</p>
                          <p>{c.province || 'Not specified'}</p>
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">City/Location</p>
                          <p>{c.location || 'Not specified'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex lg:flex-col justify-center gap-3 w-full lg:w-48">
                      <button
                        onClick={() => handleApproveListing(c._id)}
                        disabled={actionLoading === `approve-${c._id}`}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-green-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                      >
                        {actionLoading === `approve-${c._id}` ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                        Approve
                      </button>
                      <button
                        onClick={() => handleOpenRejectListing(c._id)}
                        disabled={actionLoading === `reject-${c._id}`}
                        className="flex-1 border border-red-200 dark:border-red-900/40 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-600 dark:text-red-400 font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-5 h-5" />
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Seller Verification */}
        {activeTab === 'sellers' && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-xl font-bold mb-4">Sellers Pending CNIC / Document Verification ({pendingSellers.length})</h2>
            {pendingSellers.length === 0 ? (
              <div className="text-center py-20 bg-white/90 dark:bg-[#181b18]/90 rounded-2xl border border-line">
                <ShieldCheck className="w-16 h-16 text-gray-300 dark:text-slate-700 mx-auto mb-4 animate-float" />
                <p className="text-muted font-semibold">No pending document verifications.</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {pendingSellers.map((s) => (
                  <div key={s._id} className="bg-white dark:bg-slate-800 border border-line rounded-2xl p-6 flex flex-col md:flex-row justify-between gap-6 shadow-sm">
                    <div className="space-y-3">
                      <div>
                        <h3 className="text-lg font-bold">{s.name}</h3>
                        <p className="text-xs text-muted">{s.email} • Phone: {s.phone}</p>
                        <p className="text-xs text-muted">Location: {s.district}, {s.province}</p>
                      </div>

                      {/* Document details */}
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm">Submitted Documents:</h4>
                        {s.verificationDocuments?.map((doc: any, idx: number) => (
                          <div key={idx} className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-xl space-y-2 border border-line">
                            <p className="text-xs">
                              <span className="font-bold uppercase text-primary">{doc.type}</span> - Status: <span className="font-bold text-amber-600 uppercase text-[10px]">{doc.status}</span>
                            </p>
                            {doc.url ? (
                              <div className="space-y-2">
                                <a 
                                  href={doc.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-xs text-primary font-bold hover:underline flex items-center gap-1.5"
                                >
                                  <Eye className="w-3.5 h-3.5" /> View Uploaded CNIC/Document
                                </a>
                                <div className="relative w-64 h-36 border border-line rounded-lg overflow-hidden bg-white">
                                  <img src={doc.url} alt="CNIC Document" className="w-full h-full object-contain" />
                                </div>
                              </div>
                            ) : (
                              <p className="text-xs text-red-500">No document image link available.</p>
                            )}

                            {doc.status === 'pending' && (
                              <div className="flex gap-2 pt-2">
                                <button
                                  onClick={() => handleVerifySeller(s._id, doc.type)}
                                  disabled={actionLoading === `verify-user-${s._id}`}
                                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-1.5 px-3 rounded-lg text-xs active:scale-[0.98] transition-all flex items-center gap-1"
                                >
                                  {actionLoading === `verify-user-${s._id}` ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                                  Verify / Approve
                                </button>
                                <button
                                  onClick={() => handleRejectSeller(s._id, doc.type)}
                                  disabled={actionLoading === `reject-user-${s._id}`}
                                  className="bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/40 hover:bg-red-600 hover:text-white font-bold py-1.5 px-3 rounded-lg text-xs transition-all flex items-center gap-1"
                                >
                                  Reject Document
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: All Users & Moderation */}
        {activeTab === 'users' && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-xl font-bold mb-4">Platform User Management ({allUsers.length})</h2>
            <div className="overflow-x-auto border border-line rounded-2xl bg-white/95 dark:bg-[#181b18]/95 shadow-sm">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-slate-800/50 border-b border-line font-bold text-[#4E342E] dark:text-[#EFEBE9]">
                    <th className="p-4">Name / Contact</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Verification</th>
                    <th className="p-4">Banned</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allUsers.map((u) => (
                    <tr key={u._id} className="border-b border-line last:border-0 hover:bg-surface-hover transition-colors">
                      <td className="p-4">
                        <p className="font-bold">{u.name}</p>
                        <p className="text-xs text-muted">{u.email} • {u.phone || 'No Phone'}</p>
                      </td>
                      <td className="p-4 font-semibold capitalize">{u.role}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold uppercase ${
                          u.verificationStatus === 'verified' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                          u.verificationStatus === 'pending' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' :
                          'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                        }`}>
                          {u.verificationStatus}
                        </span>
                      </td>
                      <td className="p-4">
                        {u.isBanned ? (
                          <span className="text-red-600 font-bold flex items-center gap-1">
                            <Ban className="w-3.5 h-3.5" /> Banned
                          </span>
                        ) : (
                          <span className="text-green-600 font-semibold">No</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {u.role !== 'admin' && (
                          u.isBanned ? (
                            <button
                              onClick={() => handleUnbanUser(u._id!)}
                              disabled={actionLoading === `unban-${u._id}`}
                              className="px-3.5 py-1.5 bg-green-600 text-white font-bold text-xs rounded-lg shadow shadow-green-600/25 active:scale-[0.98] transition-all"
                            >
                              Unban User
                            </button>
                          ) : (
                            <button
                              onClick={() => handleOpenBanModal(u._id!)}
                              disabled={actionLoading === `ban-${u._id}`}
                              className="px-3.5 py-1.5 bg-red-600 text-white font-bold text-xs rounded-lg shadow shadow-red-600/25 active:scale-[0.98] transition-all"
                            >
                              Ban User
                            </button>
                          )
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 5: Active Listings Moderation */}
        {activeTab === 'moderation' && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-xl font-bold mb-4">Active Marketplace Listings ({allListings.length})</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {allListings.map((c) => (
                <div key={c._id} className="bg-white dark:bg-slate-800 border border-line rounded-2xl p-4 flex gap-4 items-center justify-between shadow-sm">
                  <div className="flex gap-4 items-center min-w-0">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-slate-700 rounded-lg overflow-hidden flex-shrink-0 relative">
                      {c.images && c.images.length > 0 && (
                        <Image src={c.images[0]} alt={c.name} fill className="object-cover" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-foreground truncate">{c.name}</h4>
                      <p className="text-xs text-muted truncate">{c.breed} • ₨{c.price.toLocaleString()}</p>
                      <p className="text-xs text-muted truncate">Seller: {(c.sellerId as any)?.name || 'Unknown'}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteListing(c._id)}
                    className="p-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-colors border border-transparent hover:border-red-200 dark:hover:border-red-900/40"
                    title="Force Delete Listing"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* User Ban Reason Modal */}
      {showBanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-800 border border-line rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-[#4E342E] dark:text-[#EFEBE9] mb-3">
              Ban User Account
            </h3>
            <p className="text-sm text-muted mb-4">
              Please state the reason for banning this account. The user will be blocked from logging in immediately.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-1">Reason for Ban *</label>
              <textarea
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                required
                className="input-field"
                rows={3}
                placeholder="e.g. Uploading inappropriate images/content, spamming, etc."
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowBanModal(false)}
                className="btn-secondary flex-1 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmBan}
                disabled={!banReason.trim()}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                Confirm Ban
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Listing Reason Modal */}
      {showRejectListingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-800 border border-line rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-[#4E342E] dark:text-[#EFEBE9] mb-3">
              Reject Cattle Listing
            </h3>
            <p className="text-sm text-muted mb-4">
              Please explain why this listing is being rejected. This notification will be sent to the seller.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-1">Rejection Reason *</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                required
                className="input-field"
                rows={3}
                placeholder="e.g. Inappropriate content/images, unrealistic price, incorrect details."
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowRejectListingModal(false)}
                className="btn-secondary flex-1 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRejectListing}
                disabled={!rejectReason.trim()}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
