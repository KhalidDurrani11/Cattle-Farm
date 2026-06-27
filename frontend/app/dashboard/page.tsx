'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  getDashboard, deleteCattle, markCattleAsSold, markCattleAsAvailable,
  verifyCattle, rejectCattle, uploadImage
} from '@/lib/api';
import { Cattle, Inquiry } from '@/types';
import FarmerDashboard from '@/components/FarmerDashboard';
import BuyerDashboard from '@/components/BuyerDashboard';
import VetDashboard from '@/components/VetDashboard';
import AddCattleModal from '@/components/AddCattleModal';
import EditCattleModal from '@/components/EditCattleModal';
import {
  ShieldCheck, Loader2, AlertCircle, User, Home, CheckCircle2,
  UploadCloud, FileText, Save
} from 'lucide-react';

interface DashboardData {
  user: any;
  listings?: Cattle[];
  stats?: any;
  pendingInquiries?: Inquiry[];
  purchases?: any[];
  inquiries?: any[];
  pendingVerifications?: Cattle[];
  myVerifications?: Cattle[];
  favorites?: Cattle[];
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'profile' | 'verify'>('overview');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCattle, setEditingCattle] = useState<Cattle | null>(null);
  const [showSoldModal, setShowSoldModal] = useState(false);
  const [markingSold, setMarkingSold] = useState<Cattle | null>(null);
  const [soldPrice, setSoldPrice] = useState('');
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');

  // Profile state
  const [profileForm, setProfileForm] = useState({ name: '', phone: '', location: '' });
  const [profileSaving, setProfileSaving] = useState(false);

  // CNIC verification state
  const [cnicNumber, setCnicNumber] = useState('');
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);
  const [cnicError, setCnicError] = useState('');
  const [cnicLoading, setCnicLoading] = useState(false);
  const [cnicSuccess, setCnicSuccess] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (user && token) {
      setProfileForm({ name: user.name || '', phone: user.phone || '', location: user.location || '' });
      fetchDashboardData();
    }
  }, [user, authLoading, token]);

  // Check for tab query param
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'verification' || tab === 'verify') setActiveTab('verify');
    else if (tab === 'profile') setActiveTab('profile');
    else setActiveTab('overview');
  }, [searchParams]);

  const fetchDashboardData = async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const data = await getDashboard(token);
      setDashboardData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleEdit = (cattle: Cattle) => { setEditingCattle(cattle); setShowEditModal(true); };
  const handleDelete = async (id: string) => {
    if (!token || !confirm('Delete this listing?')) return;
    try { await deleteCattle(id, token); showToast('Listing deleted'); fetchDashboardData(); }
    catch (err: any) { setError(err.message); }
  };
  const handleMarkSold = (cattle: Cattle) => { setMarkingSold(cattle); setSoldPrice(cattle.price.toString()); setShowSoldModal(true); };
  const confirmMarkSold = async () => {
    if (!token || !markingSold) return;
    try { await markCattleAsSold(markingSold._id, Number(soldPrice), token); showToast('Marked as sold!'); setShowSoldModal(false); fetchDashboardData(); }
    catch (err: any) { setError(err.message); }
  };
  const handleMarkAvailable = async (id: string) => {
    if (!token) return;
    try { await markCattleAsAvailable(id, token); showToast('Marked as available!'); fetchDashboardData(); }
    catch (err: any) { setError(err.message); }
  };
  const handleVerifyCattle = async (id: string, healthScore: number, notes: string) => {
    if (!token) return;
    try { await verifyCattle(id, healthScore, notes, token); showToast('Cattle verified!'); fetchDashboardData(); }
    catch (err: any) { setError(err.message); }
  };
  const handleRejectCattle = async (id: string, reason: string) => {
    if (!token) return;
    try { await rejectCattle(id, reason, token); showToast('Cattle rejected'); fetchDashboardData(); }
    catch (err: any) { setError(err.message); }
  };

  const handleSaveProfile = async () => {
    if (!token) return;
    setProfileSaving(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(profileForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save');
      showToast('Profile saved successfully!');
    } catch (err: any) { setError(err.message); } finally { setProfileSaving(false); }
  };

  const handleCnicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 13) val = val.substring(0, 13);
    let formatted = val;
    if (val.length > 5 && val.length <= 12) formatted = `${val.substring(0, 5)}-${val.substring(5)}`;
    else if (val.length > 12) formatted = `${val.substring(0, 5)}-${val.substring(5, 12)}-${val.substring(12)}`;
    setCnicNumber(formatted);
  };

  const handleCnicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCnicError('');
    const digits = cnicNumber.replace(/\D/g, '');
    if (digits.length !== 13) { setCnicError('CNIC must be exactly 13 digits'); return; }
    if (!frontImage || !backImage) { setCnicError('Please upload both front and back images of your CNIC'); return; }
    setCnicLoading(true);
    try {
      const frontRes = await uploadImage(frontImage, token!);
      const backRes = await uploadImage(backImage, token!);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          documents: [
            { type: 'cnic_front', url: frontRes.url },
            { type: 'cnic_back', url: backRes.url },
          ],
          cnic: digits,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to submit');
      setCnicSuccess(true);
    } catch (err: any) { setCnicError(err.message); } finally { setCnicLoading(false); }
  };

  if (authLoading || !user) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  const canVerify = user.verificationStatus === 'not_submitted' || user.verificationStatus === 'rejected';
  const tabs = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'profile', label: 'Profile', icon: User },
    ...(user.role !== 'admin' ? [{ id: 'verify', label: 'Verify Identity', icon: ShieldCheck }] : []),
  ];

  return (
    <div className="min-h-screen bg-background pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Toast */}
        {toast && <div className="fixed top-20 right-4 z-50 bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg animate-slide-down">{toast}</div>}
        {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2"><AlertCircle className="w-5 h-5 flex-shrink-0" /><span className="flex-1">{error}</span><button onClick={() => setError('')} className="ml-auto text-red-700 hover:text-red-900 font-bold text-xl leading-none">&times;</button></div>}

        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground capitalize">{user.role} Dashboard</h1>
            <p className="text-muted mt-1">Welcome back, <span className="font-semibold text-foreground">{user.name}</span></p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {user.verificationStatus === 'verified' && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-medium">
                <ShieldCheck className="w-4 h-4" /> Verified
              </span>
            )}
            {user.verificationStatus === 'pending' && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-sm font-medium">
                <Loader2 className="w-4 h-4 animate-spin" /> Pending Review
              </span>
            )}
            {canVerify && (
              <button onClick={() => setActiveTab('verify')} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors shadow-sm">
                <ShieldCheck className="w-4 h-4" /> Get Verified
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto gap-1 bg-gray-100 dark:bg-slate-800/80 p-1 rounded-xl mb-6 w-full">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                activeTab === id ? 'bg-white dark:bg-slate-700 shadow text-primary' : 'text-gray-600 dark:text-gray-400 hover:bg-white/60 dark:hover:bg-slate-700/50'
              }`}>
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          loading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : (
            <>
              {(user.role === 'farmer' || user.role === 'trader') && (
                <FarmerDashboard listings={dashboardData?.listings || []} stats={dashboardData?.stats || {}} pendingInquiries={dashboardData?.pendingInquiries || []} onEdit={handleEdit} onDelete={handleDelete} onMarkSold={handleMarkSold} onMarkAvailable={handleMarkAvailable} onAddNew={() => setShowAddModal(true)} />
              )}
              {user.role === 'buyer' && (
                <BuyerDashboard purchases={dashboardData?.purchases || []} inquiries={dashboardData?.inquiries || []} favorites={dashboardData?.favorites || []} stats={dashboardData?.stats || {}} />
              )}
              {(user.role === 'vet' || user.role === 'admin') && (
                <VetDashboard pendingVerifications={dashboardData?.pendingVerifications || []} myVerifications={dashboardData?.myVerifications || []} stats={dashboardData?.stats || {}} onVerify={handleVerifyCattle} onReject={handleRejectCattle} />
              )}
            </>
          )
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-2xl">
                  {user.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <h2 className="font-bold text-lg text-foreground">{user.name}</h2>
                  <p className="text-muted text-sm">{user.email}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Full Name</label>
                  <input value={profileForm.name} onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))} className="input-field" placeholder="Muhammad Ali" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Phone (WhatsApp)</label>
                  <input value={profileForm.phone} onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))} className="input-field ltr-only" placeholder="03001234567" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Location</label>
                  <input value={profileForm.location} onChange={e => setProfileForm(p => ({ ...p, location: e.target.value }))} className="input-field" placeholder="Lahore, Punjab" />
                </div>
                <div className="pt-2 border-t border-line">
                  <p className="text-sm text-muted">Email: <span className="font-medium text-foreground">{user.email}</span> (cannot be changed)</p>
                  <p className="text-sm text-muted mt-1">Role: <span className="font-medium text-foreground capitalize">{user.role}</span></p>
                </div>
                <button onClick={handleSaveProfile} disabled={profileSaving} className="btn-primary flex items-center gap-2 justify-center w-full sm:w-auto">
                  {profileSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Verify Identity Tab */}
        {activeTab === 'verify' && (
          <div className="max-w-2xl">
            {user.verificationStatus === 'verified' ? (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-8 text-center">
                <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="font-bold text-xl text-green-700 dark:text-green-400 mb-2">You are Verified!</h2>
                <p className="text-green-600 dark:text-green-500">Your identity has been verified. You now have full access to all platform features.</p>
              </div>
            ) : user.verificationStatus === 'pending' ? (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-8 text-center">
                <Loader2 className="w-16 h-16 text-amber-500 mx-auto mb-4 animate-spin" />
                <h2 className="font-bold text-xl text-amber-700 dark:text-amber-400 mb-2">Verification Pending</h2>
                <p className="text-amber-600 dark:text-amber-500">Your documents have been submitted and are under review. This usually takes 1-2 business days.</p>
              </div>
            ) : cnicSuccess ? (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-8 text-center">
                <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="font-bold text-xl text-green-700 dark:text-green-400 mb-2">Documents Submitted!</h2>
                <p className="text-green-600 dark:text-green-500">Your CNIC has been submitted for review. Our admin team will verify it within 1-2 business days.</p>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm">
                <h2 className="font-bold text-xl text-foreground mb-1">Identity Verification</h2>
                <p className="text-muted text-sm mb-6">Submit your CNIC to become a verified user on Cattle Farm Trading.</p>

                {cnicError && <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-xl mb-4 text-sm border border-red-100 dark:border-red-800">{cnicError}</div>}

                <form onSubmit={handleCnicSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">CNIC Number *</label>
                    <input type="text" value={cnicNumber} onChange={handleCnicChange}
                      className="input-field text-lg tracking-wider font-mono ltr-only"
                      placeholder="XXXXX-XXXXXXX-X" maxLength={15} required />
                    <p className="text-xs text-muted mt-1">Enter your 13-digit National Identity Card number</p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Front of CNIC *</label>
                      <label className="block border-2 border-dashed border-line rounded-xl p-5 text-center cursor-pointer hover:bg-primary/5 hover:border-primary/40 transition-all group">
                        <input type="file" accept="image/*" className="hidden" onChange={e => setFrontImage(e.target.files?.[0] || null)} required />
                        {frontImage ? (
                          <div className="text-primary flex flex-col items-center">
                            <FileText className="w-8 h-8 mb-2" />
                            <span className="text-xs font-medium truncate w-full">{frontImage.name}</span>
                          </div>
                        ) : (
                          <div className="text-muted group-hover:text-primary transition-colors flex flex-col items-center">
                            <UploadCloud className="w-8 h-8 mb-2" />
                            <span className="text-sm font-medium">Upload Front</span>
                            <span className="text-xs mt-1">JPG, PNG up to 5MB</span>
                          </div>
                        )}
                      </label>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Back of CNIC *</label>
                      <label className="block border-2 border-dashed border-line rounded-xl p-5 text-center cursor-pointer hover:bg-primary/5 hover:border-primary/40 transition-all group">
                        <input type="file" accept="image/*" className="hidden" onChange={e => setBackImage(e.target.files?.[0] || null)} required />
                        {backImage ? (
                          <div className="text-primary flex flex-col items-center">
                            <FileText className="w-8 h-8 mb-2" />
                            <span className="text-xs font-medium truncate w-full">{backImage.name}</span>
                          </div>
                        ) : (
                          <div className="text-muted group-hover:text-primary transition-colors flex flex-col items-center">
                            <UploadCloud className="w-8 h-8 mb-2" />
                            <span className="text-sm font-medium">Upload Back</span>
                            <span className="text-xs mt-1">JPG, PNG up to 5MB</span>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 p-4 rounded-xl text-sm border border-blue-100 dark:border-blue-800">
                    <strong>Important:</strong> Ensure images are clear and all text on the CNIC is readable. Processing takes 1-2 business days.
                  </div>

                  <button type="submit" disabled={cnicLoading} className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-base">
                    {cnicLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                    {cnicLoading ? 'Submitting...' : 'Submit for Verification'}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* Modals */}
        {showAddModal && <AddCattleModal onClose={() => setShowAddModal(false)} onSuccess={() => { fetchDashboardData(); showToast('Cattle added!'); }} />}
        {showEditModal && editingCattle && <EditCattleModal cattle={editingCattle} onClose={() => { setShowEditModal(false); setEditingCattle(null); }} onSuccess={() => { fetchDashboardData(); showToast('Cattle updated!'); }} />}
        {showSoldModal && markingSold && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
              <h3 className="text-xl font-bold text-foreground mb-2">Mark as Sold</h3>
              <p className="text-muted mb-4">{markingSold.name} — Listed at ₨{markingSold.price.toLocaleString()}</p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-foreground mb-1">Sold Price (PKR)</label>
                <input type="number" value={soldPrice} onChange={e => setSoldPrice(e.target.value)} className="input-field" placeholder="Enter sold price" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowSoldModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={confirmMarkSold} className="btn-primary flex-1">Confirm</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
