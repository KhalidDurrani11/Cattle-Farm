'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  LogOut, ShieldCheck, CheckCircle2, XCircle, Search, Users, Activity,
  ListChecks, RefreshCw, ShoppingBag, CreditCard, MessageSquare, Send, Upload, Eye, Check, X, Building2, Copy
} from 'lucide-react';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'cnic' | 'listings' | 'bookings' | 'bank_config'>('bookings');

  const [verifications, setVerifications] = useState<any[]>([]);
  const [listings, setListings] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [bankConfig, setBankConfig] = useState<any>({
    bankName: 'Meezan Bank',
    accountTitle: 'AgriTradeX Livestock Marketplace',
    accountNumber: '0102-0102030405',
    iban: 'PK36MEZN0001020304050607',
    easypaisaNumber: '0300-1234567',
    jazzcashNumber: '0300-7654321',
    instructions: 'Please transfer payment/advance fee to book this animal. Upload screenshot receipt below for instant Admin verification.'
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string>('');

  // Selected Booking for Admin Chat Drawer / Modal
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [replyText, setReplyText] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [savingConfig, setSavingConfig] = useState(false);

  const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;

  const fetchData = useCallback(async () => {
    const token = getToken();
    if (!token) { router.push('/admin'); return; }
    setLoading(true);
    setError('');
    try {
      const [verRes, listRes, bookRes, configRes] = await Promise.all([
        fetch(`${API}/api/admin/pending-verifications`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API}/api/admin/pending-listings`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API}/api/bookings/admin/all`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API}/api/bookings/config`),
      ]);

      if (verRes.status === 401 || listRes.status === 401 || bookRes.status === 401) {
        localStorage.removeItem('adminToken');
        router.push('/admin');
        return;
      }

      const verData = verRes.ok ? await verRes.json() : [];
      const listData = listRes.ok ? await listRes.json() : [];
      const bookData = bookRes.ok ? await bookRes.json() : [];
      const confData = configRes.ok ? await configRes.json() : {};

      setVerifications(Array.isArray(verData) ? verData : []);
      setListings(Array.isArray(listData) ? listData : []);
      setBookings(Array.isArray(bookData) ? bookData : []);
      if (confData && confData.bankName) setBankConfig(confData);
    } catch (e: any) {
      setError('Failed to load data. Check your backend connection.');
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

  // Booking Actions
  const handleApproveBooking = async (bookingId: string) => {
    const token = getToken();
    setActionLoading(bookingId + '-approve');
    try {
      const res = await fetch(`${API}/api/bookings/admin/${bookingId}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ adminNotes: 'Payment verified and approved by admin.' }),
      });
      if (res.ok) {
        const data = await res.json();
        setBookings(prev => prev.map(b => b._id === bookingId ? data.booking : b));
        if (selectedBooking?._id === bookingId) setSelectedBooking(data.booking);
      } else {
        const d = await res.json();
        setError(d.message || 'Failed to approve booking payment.');
      }
    } catch {
      setError('Network error approving booking payment.');
    } finally {
      setActionLoading('');
    }
  };

  const handleRejectBooking = async (bookingId: string) => {
    const token = getToken();
    setActionLoading(bookingId + '-reject');
    try {
      const res = await fetch(`${API}/api/bookings/admin/${bookingId}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reason: rejectReason || 'Invalid payment receipt' }),
      });
      if (res.ok) {
        const data = await res.json();
        setBookings(prev => prev.map(b => b._id === bookingId ? data.booking : b));
        if (selectedBooking?._id === bookingId) setSelectedBooking(data.booking);
        setShowRejectModal(null);
        setRejectReason('');
      } else {
        const d = await res.json();
        setError(d.message || 'Failed to reject booking payment.');
      }
    } catch {
      setError('Network error rejecting payment.');
    } finally {
      setActionLoading('');
    }
  };

  const handleSendAdminMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedBooking?._id) return;
    const token = getToken();
    try {
      const res = await fetch(`${API}/api/bookings/${selectedBooking._id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text: replyText.trim() }),
      });
      if (res.ok) {
        const updated = await res.json();
        setSelectedBooking(updated);
        setBookings(prev => prev.map(b => b._id === updated._id ? updated : b));
        setReplyText('');
      }
    } catch {
      setError('Error sending message.');
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getToken();
    setSavingConfig(true);
    try {
      const res = await fetch(`${API}/api/bookings/admin/config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(bankConfig),
      });
      if (res.ok) {
        alert('Bank Account details updated successfully!');
      } else {
        const d = await res.json();
        setError(d.message || 'Failed to save config.');
      }
    } catch {
      setError('Network error updating bank config.');
    } finally {
      setSavingConfig(false);
    }
  };

  const pendingPaymentsCount = bookings.filter(b => b.status === 'payment_submitted').length;

  if (!admin) return <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-white/20 border-t-white rounded-full" /></div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {/* Nav */}
      <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-7 h-7 text-emerald-400" />
            <div>
              <span className="font-bold text-white text-lg">Admin Management Portal</span>
              <p className="text-slate-400 text-xs">Cattle Farm Trading</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchData} className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white" title="Refresh">
              <RefreshCw className="w-5 h-5" />
            </button>
            <span className="hidden md:block text-slate-400 text-sm font-mono">{admin?.email}</span>
            <button onClick={handleLogout} className="flex items-center gap-2 text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-3 py-2 rounded-lg text-sm font-medium transition-colors">
              <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Error */}
        {error && (
          <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-sm flex justify-between items-center">
            {error}
            <button onClick={() => setError('')} className="text-red-300 hover:text-red-200 font-bold text-lg leading-none">&times;</button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Payment Approvals</p>
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                {pendingPaymentsCount}
                {pendingPaymentsCount > 0 && <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-ping" />}
              </h3>
            </div>
          </div>

          <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#1E4620]/40 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Total Bookings</p>
              <h3 className="text-2xl font-bold text-white">{bookings.length}</h3>
            </div>
          </div>

          <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 text-yellow-400 flex items-center justify-center flex-shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Pending CNICs</p>
              <h3 className="text-2xl font-bold text-white">{verifications.length}</h3>
            </div>
          </div>

          <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center flex-shrink-0">
              <ListChecks className="w-6 h-6" />
            </div>
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Pending Listings</p>
              <h3 className="text-2xl font-bold text-white">{listings.length}</h3>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-slate-900 p-1.5 rounded-xl mb-6 flex-wrap">
          {[
            { id: 'bookings', label: `💳 Bookings & Payments (${pendingPaymentsCount} Pending)` },
            { id: 'cnic', label: `CNIC Verifications (${verifications.length})` },
            { id: 'listings', label: `Listing Approvals (${listings.length})` },
            { id: 'bank_config', label: `🏦 Admin Bank Details` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-[#1E4620] text-white shadow-lg shadow-green-950 border border-green-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin w-10 h-10 border-4 border-slate-700 border-t-emerald-400 rounded-full" />
          </div>
        ) : activeTab === 'bookings' ? (
          /* BOOKINGS & PAYMENTS TAB */
          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-400" /> Buyer Booking Requests & Payment Verification
                </h2>
                <p className="text-slate-400 text-xs mt-1">Review buyer payment receipts, chat with buyers, and approve bookings.</p>
              </div>
            </div>

            {bookings.length === 0 ? (
              <div className="p-16 text-center text-slate-500">
                <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No booking requests found yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800">
                {bookings.map((b: any) => {
                  const cattle = b.cattleId || {};
                  const buyer = b.buyerId || {};

                  return (
                    <div key={b._id} className="p-5 hover:bg-slate-800/30 transition-colors">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                        
                        {/* Animal & Buyer Info */}
                        <div className="flex gap-4 flex-1">
                          {cattle.images?.[0] ? (
                            <img src={cattle.images[0]} alt="" className="w-20 h-20 rounded-xl object-cover border border-slate-700 flex-shrink-0 bg-slate-950" />
                          ) : (
                            <div className="w-20 h-20 bg-slate-800 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                              🐄
                            </div>
                          )}

                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-bold text-white text-base">{cattle.name || 'Cattle Item'}</h3>
                              <span className="text-xs bg-slate-800 border border-slate-700 text-slate-300 px-2 py-0.5 rounded font-mono">
                                {cattle.breed}
                              </span>
                              
                              {b.status === 'approved' && (
                                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold px-2.5 py-0.5 rounded-full">
                                  ✅ Approved & Booked
                                </span>
                              )}
                              {b.status === 'payment_submitted' && (
                                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold px-2.5 py-0.5 rounded-full animate-pulse">
                                  📸 Payment Submitted (Action Required)
                                </span>
                              )}
                              {b.status === 'rejected' && (
                                <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold px-2.5 py-0.5 rounded-full">
                                  ❌ Payment Rejected
                                </span>
                              )}
                              {b.status === 'pending' && (
                                <span className="bg-slate-800 text-slate-400 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                  Chat Active (No Payment Proof)
                                </span>
                              )}
                            </div>

                            <p className="text-emerald-400 font-bold text-sm mt-1">
                              Price: ₨{cattle.price?.toLocaleString()} • {cattle.district || cattle.location || 'Pakistan'}
                            </p>

                            <div className="text-slate-400 text-xs mt-2 flex flex-wrap gap-x-4 gap-y-1">
                              <span>Buyer: <strong className="text-white">{buyer.name || 'Unknown'}</strong> ({buyer.phone || buyer.email || ''})</span>
                              <span>Date: {new Date(b.updatedAt || b.createdAt).toLocaleDateString()}</span>
                            </div>

                            {b.paymentRef && (
                              <p className="text-amber-300 text-xs font-mono mt-1">Ref ID: {b.paymentRef}</p>
                            )}
                          </div>
                        </div>

                        {/* Payment Screenshot Thumbnail & Actions */}
                        <div className="flex items-center gap-4 flex-wrap flex-shrink-0">
                          {b.paymentScreenshot && (
                            <div
                              onClick={() => setPreviewImage(b.paymentScreenshot)}
                              className="relative cursor-pointer group"
                              title="Click to zoom screenshot"
                            >
                              <img
                                src={b.paymentScreenshot}
                                alt="Payment Receipt"
                                className="w-16 h-16 object-cover rounded-xl border-2 border-emerald-500/50 group-hover:scale-105 transition-transform"
                              />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                                <Eye className="w-5 h-5 text-white" />
                              </div>
                            </div>
                          )}

                          <div className="flex gap-2">
                            <button
                              onClick={() => setSelectedBooking(b)}
                              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-700 transition-all"
                            >
                              <MessageSquare className="w-4 h-4 text-emerald-400" /> View Chat
                            </button>

                            {b.status === 'payment_submitted' && (
                              <>
                                <button
                                  onClick={() => handleApproveBooking(b._id)}
                                  disabled={!!actionLoading}
                                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-lg transition-all active:scale-95 disabled:opacity-50"
                                >
                                  <Check className="w-4 h-4" /> Approve Payment
                                </button>
                                <button
                                  onClick={() => setShowRejectModal(b._id)}
                                  disabled={!!actionLoading}
                                  className="flex items-center gap-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 px-3.5 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                                >
                                  <X className="w-4 h-4" /> Reject
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : activeTab === 'bank_config' ? (
          /* BANK CONFIG TAB */
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-2xl max-w-3xl">
            <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-400" /> Admin Bank Account Settings
            </h2>
            <p className="text-slate-400 text-xs mb-6">
              These account details are shown directly to buyers in the booking conversation window to transfer payments.
            </p>

            <form onSubmit={handleSaveConfig} className="space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Bank Name</label>
                  <input
                    type="text"
                    value={bankConfig.bankName || ''}
                    onChange={(e) => setBankConfig({ ...bankConfig, bankName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Account Title</label>
                  <input
                    type="text"
                    value={bankConfig.accountTitle || ''}
                    onChange={(e) => setBankConfig({ ...bankConfig, accountTitle: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Account Number</label>
                  <input
                    type="text"
                    value={bankConfig.accountNumber || ''}
                    onChange={(e) => setBankConfig({ ...bankConfig, accountNumber: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">IBAN Number</label>
                  <input
                    type="text"
                    value={bankConfig.iban || ''}
                    onChange={(e) => setBankConfig({ ...bankConfig, iban: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">EasyPaisa Number</label>
                  <input
                    type="text"
                    value={bankConfig.easypaisaNumber || ''}
                    onChange={(e) => setBankConfig({ ...bankConfig, easypaisaNumber: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">JazzCash Number</label>
                  <input
                    type="text"
                    value={bankConfig.jazzcashNumber || ''}
                    onChange={(e) => setBankConfig({ ...bankConfig, jazzcashNumber: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Payment Instructions for Buyers</label>
                <textarea
                  rows={3}
                  value={bankConfig.instructions || ''}
                  onChange={(e) => setBankConfig({ ...bankConfig, instructions: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none text-xs leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={savingConfig}
                className="bg-[#1E4620] hover:bg-green-700 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-lg active:scale-95 text-sm"
              >
                {savingConfig ? 'Saving...' : 'Save Bank Details'}
              </button>
            </form>
          </div>
        ) : activeTab === 'cnic' ? (
          /* CNIC VERIFICATIONS TAB */
          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
            <div className="p-5 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white">Pending CNIC Verifications</h2>
              <p className="text-slate-400 text-sm mt-1">Review and approve or reject user identity verifications</p>
            </div>
            {verifications.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <ShieldCheck className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>No pending CNIC verifications</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800">
                {verifications.map(user => (
                  <div key={user._id} className="p-4 md:p-5 flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-white">{user.name}</p>
                          <span className="bg-slate-800 text-slate-300 text-xs px-2 py-0.5 rounded capitalize">{user.role}</span>
                        </div>
                        <p className="text-slate-400 text-sm mt-0.5">{user.email}</p>
                        {user.cnic && (
                          <p className="text-slate-300 text-sm mt-1 font-mono bg-slate-950 inline-block px-2 py-1 rounded border border-slate-800">CNIC: {user.cnic}</p>
                        )}
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
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* LISTING APPROVALS TAB */
          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
            <div className="p-5 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white">Pending Listing Approvals</h2>
              <p className="text-slate-400 text-sm mt-1">Review and approve or reject new cattle listings</p>
            </div>
            {listings.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <ListChecks className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>No pending listings</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800">
                {listings.map(listing => (
                  <div key={listing._id} className="p-4 md:p-5 flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-white">{listing.name}</p>
                          <span className="bg-slate-800 text-slate-300 text-xs px-2 py-0.5 rounded">{listing.category}</span>
                        </div>
                        <p className="text-slate-400 text-sm mt-1">
                          {listing.breed} • {listing.age} yrs • ₨{listing.price?.toLocaleString()}
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
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ADMIN CHAT & VERIFICATION DRAWER */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 w-full max-w-xl h-full shadow-2xl border-l border-slate-800 flex flex-col justify-between">
            {/* Drawer Header */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-base">
                  Booking Chat: {selectedBooking.cattleId?.name}
                </h3>
                <p className="text-xs text-slate-400">
                  Buyer: <strong className="text-emerald-400">{selectedBooking.buyerId?.name}</strong> ({selectedBooking.buyerId?.phone || selectedBooking.buyerId?.email})
                </p>
              </div>
              <button onClick={() => setSelectedBooking(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Payment Proof Banner if submitted */}
            {selectedBooking.paymentScreenshot && (
              <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedBooking.paymentScreenshot}
                    alt="Receipt"
                    onClick={() => setPreviewImage(selectedBooking.paymentScreenshot)}
                    className="w-14 h-14 object-cover rounded-lg border border-emerald-500/50 cursor-pointer hover:scale-105 transition-transform"
                  />
                  <div>
                    <p className="text-xs text-slate-300 font-semibold">Submitted Payment Proof</p>
                    <p className="text-[11px] text-emerald-400 font-mono">Status: {selectedBooking.status}</p>
                  </div>
                </div>

                {selectedBooking.status === 'payment_submitted' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApproveBooking(selectedBooking._id)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-2 rounded-lg"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => setShowRejectModal(selectedBooking._id)}
                      className="bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold px-3 py-2 rounded-lg"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-900/50">
              {selectedBooking.messages?.map((msg: any, idx: number) => {
                const isAdmin = msg.sender === 'admin';
                const isSystem = msg.sender === 'system';

                if (isSystem) {
                  return (
                    <div key={idx} className="my-2 text-center text-xs text-amber-300 bg-amber-950/40 p-2.5 rounded-xl border border-amber-900/50">
                      {msg.text}
                    </div>
                  );
                }

                return (
                  <div key={idx} className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}>
                    <span className="text-[10px] text-slate-500 mb-0.5">{msg.senderName}</span>
                    <div className={`max-w-[85%] p-3 rounded-xl text-xs leading-relaxed ${
                      isAdmin ? 'bg-emerald-700 text-white' : 'bg-slate-800 text-slate-100 border border-slate-700'
                    }`}>
                      {msg.text && <p>{msg.text}</p>}
                      {msg.image && (
                        <img src={msg.image} alt="" className="mt-2 rounded-lg max-h-48 object-contain cursor-pointer" onClick={() => setPreviewImage(msg.image)} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Admin Message Input */}
            <form onSubmit={handleSendAdminMessage} className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Reply to buyer..."
                className="flex-1 bg-slate-900 text-white text-xs px-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500"
              />
              <button type="submit" className="bg-[#1E4620] hover:bg-green-700 text-white p-2.5 rounded-xl">
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 shadow-2xl">
            <h3 className="font-bold text-white text-base mb-2">Reject Payment Proof</h3>
            <p className="text-xs text-slate-400 mb-4">Specify the reason for rejecting this payment proof.</p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Unreadable receipt screenshot / Incorrect transaction amount"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white mb-4 focus:outline-none focus:border-red-500"
            />
            <div className="flex gap-3">
              <button onClick={() => setShowRejectModal(null)} className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold">
                Cancel
              </button>
              <button onClick={() => handleRejectBooking(showRejectModal)} className="flex-1 py-2 rounded-xl bg-red-600 text-white text-xs font-bold">
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULLSCREEN IMAGE PREVIEW */}
      {previewImage && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setPreviewImage(null)}>
          <img src={previewImage} alt="Enlarged preview" className="max-w-full max-h-full object-contain rounded-xl shadow-2xl" />
          <button className="absolute top-4 right-4 text-white text-3xl font-bold">&times;</button>
        </div>
      )}
    </div>
  );
}
