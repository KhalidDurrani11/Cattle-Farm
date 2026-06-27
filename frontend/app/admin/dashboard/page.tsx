'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, ShieldCheck, CheckCircle2, XCircle, Search, Users, Activity, ListChecks, RefreshCw } from 'lucide-react';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL;

export default function AdminDashboardPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'cnic' | 'listings'>('cnic');
  const [verifications, setVerifications] = useState<any[]>([]);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string>('');

  const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;

  const fetchData = useCallback(async () => {
    const token = getToken();
    if (!token) { router.push('/admin'); return; }
    setLoading(true);
    setError('');
    try {
      const [verRes, listRes] = await Promise.all([
        fetch(`${API}/api/admin/pending-verifications`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API}/api/admin/pending-listings`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (verRes.status === 401 || listRes.status === 401) {
        localStorage.removeItem('adminToken');
        router.push('/admin');
        return;
      }
      const verData = verRes.ok ? await verRes.json() : [];
      const listData = listRes.ok ? await listRes.json() : [];
      setVerifications(Array.isArray(verData) ? verData : []);
      setListings(Array.isArray(listData) ? listData : []);
    } catch (e: any) {
      setError('Failed to load data. Check your connection.');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const token = getToken();
    const adminData = typeof window !== 'undefined' ? localStorage.getItem('adminData') : null;
    if (!token || !adminData) { router.push('/admin'); return; }
    setAdmin(JSON.parse(adminData));
    fetchData();
  }, [fetchData, router]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    router.push('/admin');
  };

  const handleApproveUser = async (userId: string) => {
    const token = getToken();
    setActionLoading(userId);
    try {
      const res = await fetch(`${API}/api/admin/users/${userId}/verify`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ documentType: 'cnic' }),
      });
      if (res.ok) setVerifications(prev => prev.filter(u => u._id !== userId));
      else { const d = await res.json(); setError(d.message || 'Failed to approve.'); }
    } catch { setError('Network error.'); } finally { setActionLoading(''); }
  };

  const handleRejectUser = async (userId: string) => {
    const token = getToken();
    setActionLoading(userId + '-reject');
    try {
      const res = await fetch(`${API}/api/admin/users/${userId}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reason: 'Rejected by admin', documentType: 'cnic' }),
      });
      if (res.ok) setVerifications(prev => prev.filter(u => u._id !== userId));
      else { const d = await res.json(); setError(d.message || 'Failed to reject.'); }
    } catch { setError('Network error.'); } finally { setActionLoading(''); }
  };

  const handleApproveListing = async (listingId: string) => {
    const token = getToken();
    setActionLoading(listingId);
    try {
      const res = await fetch(`${API}/api/admin/listings/${listingId}/approve`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setListings(prev => prev.filter(l => l._id !== listingId));
      else { const d = await res.json(); setError(d.message || 'Failed to approve.'); }
    } catch { setError('Network error.'); } finally { setActionLoading(''); }
  };

  const handleRejectListing = async (listingId: string) => {
    const token = getToken();
    setActionLoading(listingId + '-reject');
    try {
      const res = await fetch(`${API}/api/admin/listings/${listingId}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reason: 'Rejected by admin' }),
      });
      if (res.ok) setListings(prev => prev.filter(l => l._id !== listingId));
      else { const d = await res.json(); setError(d.message || 'Failed to reject.'); }
    } catch { setError('Network error.'); } finally { setActionLoading(''); }
  };

  if (!admin) return <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-white/20 border-t-white rounded-full" /></div>;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200">
      {/* Nav */}
      <nav className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-7 h-7 text-green-400" />
            <div>
              <span className="font-bold text-white text-lg">Admin Dashboard</span>
              <p className="text-slate-400 text-xs">Cattle Farm Trading</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchData} className="p-2 hover:bg-slate-700 rounded-lg transition-colors" title="Refresh">
              <RefreshCw className="w-5 h-5 text-slate-400" />
            </button>
            <span className="hidden md:block text-slate-400 text-sm">{admin?.email}</span>
            <button onClick={handleLogout} className="flex items-center gap-2 text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-3 py-2 rounded-lg text-sm font-medium transition-colors">
              <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Error */}
        {error && <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-sm flex justify-between items-center">{error}<button onClick={() => setError('')} className="text-red-300 hover:text-red-200 font-bold text-lg leading-none">&times;</button></div>}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-yellow-500/10 text-yellow-400 flex items-center justify-center flex-shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Pending CNICs</p>
              <h3 className="text-2xl font-bold text-white">{verifications.length}</h3>
            </div>
          </div>
          <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center flex-shrink-0">
              <ListChecks className="w-6 h-6" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Pending Listings</p>
              <h3 className="text-2xl font-bold text-white">{listings.length}</h3>
            </div>
          </div>
          <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-500/10 text-green-400 flex items-center justify-center flex-shrink-0">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">System Status</p>
              <h3 className="text-lg font-bold text-green-400">Online</h3>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-800 p-1 rounded-xl mb-6 w-full md:w-auto inline-flex">
          {[{ id: 'cnic', label: `CNIC Verifications (${verifications.length})` }, { id: 'listings', label: `Listing Approvals (${listings.length})` }].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 md:flex-none px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin w-10 h-10 border-4 border-slate-600 border-t-green-400 rounded-full" />
          </div>
        ) : activeTab === 'cnic' ? (
          <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
            <div className="p-5 border-b border-slate-700">
              <h2 className="text-lg font-bold text-white">Pending CNIC Verifications</h2>
              <p className="text-slate-400 text-sm mt-1">Review and approve or reject user identity verifications</p>
            </div>
            {verifications.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <ShieldCheck className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>No pending CNIC verifications</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-700/50">
                {verifications.map(user => (
                  <div key={user._id} className="p-4 md:p-5 flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-white">{user.name}</p>
                          <span className="bg-slate-700 text-slate-300 text-xs px-2 py-0.5 rounded capitalize">{user.role}</span>
                        </div>
                        <p className="text-slate-400 text-sm mt-0.5">{user.email}</p>
                        {user.cnic && (
                          <p className="text-slate-300 text-sm mt-1 font-mono bg-slate-800/50 inline-block px-2 py-1 rounded border border-slate-700">CNIC: {user.cnic}</p>
                        )}
                        <p className="text-slate-500 text-xs mt-2">
                          Submitted: {user.verificationSubmittedAt ? new Date(user.verificationSubmittedAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}
                        </p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button onClick={() => handleApproveUser(user._id)} disabled={!!actionLoading}
                          className="flex items-center gap-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                          <CheckCircle2 className="w-4 h-4" /> Approve
                        </button>
                        <button onClick={() => handleRejectUser(user._id)} disabled={!!actionLoading}
                          className="flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                          <XCircle className="w-4 h-4" /> Reject
                        </button>
                      </div>
                    </div>
                    {user.verificationDocuments?.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                        {user.verificationDocuments.map((doc: any, i: number) => (
                          <div key={i} className="bg-slate-900 rounded-lg p-3 border border-slate-700">
                            <p className="text-xs text-slate-400 mb-2 font-medium uppercase tracking-wider">{doc.type.replace('_', ' ')}</p>
                            <a href={doc.url} target="_blank" rel="noopener noreferrer" className="block">
                              <img src={doc.url} alt={`Document ${i + 1}`} className="w-full h-48 object-contain bg-black/50 rounded-md hover:opacity-80 transition-opacity" />
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
            <div className="p-5 border-b border-slate-700">
              <h2 className="text-lg font-bold text-white">Pending Listing Approvals</h2>
              <p className="text-slate-400 text-sm mt-1">Review and approve or reject new cattle listings</p>
            </div>
            {listings.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <ListChecks className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>No pending listings</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-700/50">
                {listings.map(listing => (
                  <div key={listing._id} className="p-4 md:p-5 flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-white">{listing.name}</p>
                          <span className="bg-slate-700 text-slate-300 text-xs px-2 py-0.5 rounded">{listing.category}</span>
                        </div>
                        <p className="text-slate-400 text-sm mt-1">
                          {listing.breed} • {listing.age} yrs • {listing.weight ? `${listing.weight} kg • ` : ''}₨{listing.price?.toLocaleString()}
                        </p>
                        <p className="text-slate-400 text-sm mt-1 line-clamp-2">{listing.description}</p>
                        <p className="text-slate-500 text-xs mt-2">
                          Location: {listing.location || 'Unknown'} {listing.district ? `(${listing.district})` : ''}
                        </p>
                        <p className="text-slate-500 text-xs mt-1">
                          By: <span className="font-medium text-slate-300">{listing.sellerId?.name || 'Unknown'}</span> — {listing.sellerId?.phone || ''}
                        </p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button onClick={() => handleApproveListing(listing._id)} disabled={!!actionLoading}
                          className="flex items-center gap-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                          <CheckCircle2 className="w-4 h-4" /> Approve
                        </button>
                        <button onClick={() => handleRejectListing(listing._id)} disabled={!!actionLoading}
                          className="flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                          <XCircle className="w-4 h-4" /> Reject
                        </button>
                      </div>
                    </div>
                    {listing.images?.length > 0 && (
                      <div className="flex gap-3 overflow-x-auto pb-2 mt-2">
                        {listing.images.map((img: string, i: number) => (
                          <a key={i} href={img} target="_blank" rel="noopener noreferrer" className="block flex-shrink-0">
                            <img src={img} alt={`Listing ${i + 1}`} className="w-32 h-32 object-cover rounded-lg border border-slate-700 hover:border-green-500/50 transition-colors bg-slate-900" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link href="/" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">← Return to Main Website</Link>
        </div>
      </div>
    </div>
  );
}
