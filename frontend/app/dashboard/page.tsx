'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  getDashboard,
  getMyListings,
  getCattleStats,
  deleteCattle,
  updateCattle,
  markCattleAsSold,
  markCattleAsAvailable,
  getFavorites,
  verifyCattle,
  rejectCattle,
  getPendingCattleVerifications,
  getAdminStats,
} from '@/lib/api';
import { Cattle, Inquiry } from '@/types';
import FarmerDashboard from '@/components/FarmerDashboard';
import BuyerDashboard from '@/components/BuyerDashboard';
import VetDashboard from '@/components/VetDashboard';
import AddCattleModal from '@/components/AddCattleModal';
import EditCattleModal from '@/components/EditCattleModal';
import { ShieldCheck, Loader2, AlertCircle } from 'lucide-react';

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
  notifications?: any[];
  unreadNotifications?: number;
}

export default function DashboardPage() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCattle, setEditingCattle] = useState<Cattle | null>(null);
  const [showSoldModal, setShowSoldModal] = useState(false);
  const [markingSold, setMarkingSold] = useState<Cattle | null>(null);
  const [soldPrice, setSoldPrice] = useState('');
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (user && token) {
      fetchDashboardData();
    }
  }, [user, authLoading, token]);

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

  const handleEdit = (cattle: Cattle) => {
    setEditingCattle(cattle);
    setShowEditModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!token || !confirm('Are you sure you want to delete this listing?')) return;
    try {
      await deleteCattle(id, token);
      setToast('Listing deleted successfully');
      fetchDashboardData();
      setTimeout(() => setToast(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to delete listing');
    }
  };

  const handleMarkSold = (cattle: Cattle) => {
    setMarkingSold(cattle);
    setSoldPrice(cattle.price.toString());
    setShowSoldModal(true);
  };

  const confirmMarkSold = async () => {
    if (!token || !markingSold) return;
    try {
      await markCattleAsSold(markingSold._id, Number(soldPrice), token);
      setToast('Marked as sold!');
      setShowSoldModal(false);
      fetchDashboardData();
      setTimeout(() => setToast(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to mark as sold');
    }
  };

  const handleMarkAvailable = async (id: string) => {
    if (!token) return;
    try {
      await markCattleAsAvailable(id, token);
      setToast('Marked as available!');
      fetchDashboardData();
      setTimeout(() => setToast(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to mark as available');
    }
  };

  // Vet verification handlers
  const handleVerifyCattle = async (cattleId: string, healthScore: number, notes: string) => {
    if (!token) return;
    try {
      await verifyCattle(cattleId, healthScore, notes, token);
      setToast('Cattle verified successfully!');
      fetchDashboardData();
      setTimeout(() => setToast(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to verify cattle');
    }
  };

  const handleRejectCattle = async (cattleId: string, reason: string) => {
    if (!token) return;
    try {
      await rejectCattle(cattleId, reason, token);
      setToast('Cattle verification rejected');
      fetchDashboardData();
      setTimeout(() => setToast(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to reject cattle');
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'farmer': return 'Farmer Dashboard';
      case 'buyer': return 'Buyer Dashboard';
      case 'trader': return 'Trader Dashboard';
      case 'vet': return 'Veterinarian Dashboard';
      case 'admin': return 'Admin Dashboard';
      default: return 'Dashboard';
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Toast */}
        {toast && (
          <div className="fixed top-20 right-4 z-50 bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg animate-slide-down">
            {toast}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
            <button onClick={() => setError('')} className="ml-auto text-red-700 hover:text-red-900">&times;</button>
          </div>
        )}

        {/* Role Badge */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {getRoleDisplayName(user.role)}
            </h1>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              user.verificationStatus === 'verified'
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : user.verificationStatus === 'pending'
                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
            }`}>
              <ShieldCheck className="w-4 h-4 inline mr-1" />
              {user.verificationStatus === 'verified' ? 'Verified Account'
                : user.verificationStatus === 'pending' ? 'Verification Pending'
                : 'Unverified Account'}
            </span>
          </div>
          <p className="text-gray-500 mt-1">Welcome back, {user.name}!</p>
        </div>

        {/* Dashboard Content */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {user.role === 'farmer' && (
              <FarmerDashboard
                listings={dashboardData?.listings || []}
                stats={dashboardData?.stats || {}}
                pendingInquiries={dashboardData?.pendingInquiries || []}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onMarkSold={handleMarkSold}
                onMarkAvailable={handleMarkAvailable}
                onAddNew={() => setShowAddModal(true)}
              />
            )}

            {user.role === 'buyer' && (
              <BuyerDashboard
                purchases={dashboardData?.purchases || []}
                inquiries={dashboardData?.inquiries || []}
                favorites={dashboardData?.favorites || []}
                stats={dashboardData?.stats || {}}
              />
            )}

            {(user.role === 'vet' || user.role === 'admin') && (
              <VetDashboard
                pendingVerifications={dashboardData?.pendingVerifications || []}
                myVerifications={dashboardData?.myVerifications || []}
                stats={dashboardData?.stats || {}}
                onVerify={handleVerifyCattle}
                onReject={handleRejectCattle}
              />
            )}

            {user.role === 'trader' && (
              <FarmerDashboard
                listings={dashboardData?.listings || []}
                stats={dashboardData?.stats || {}}
                pendingInquiries={dashboardData?.pendingInquiries || []}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onMarkSold={handleMarkSold}
                onMarkAvailable={handleMarkAvailable}
                onAddNew={() => setShowAddModal(true)}
              />
            )}
          </>
        )}

        {/* Modals */}
        {showAddModal && (
          <AddCattleModal
            onClose={() => setShowAddModal(false)}
            onSuccess={() => {
              fetchDashboardData();
              setToast('Cattle added successfully!');
              setTimeout(() => setToast(''), 3000);
            }}
          />
        )}

        {showEditModal && editingCattle && (
          <EditCattleModal
            cattle={editingCattle}
            onClose={() => {
              setShowEditModal(false);
              setEditingCattle(null);
            }}
            onSuccess={() => {
              fetchDashboardData();
              setToast('Cattle updated successfully!');
              setTimeout(() => setToast(''), 3000);
            }}
          />
        )}

        {/* Mark Sold Modal */}
        {showSoldModal && markingSold && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Mark as Sold
              </h3>
              <p className="text-gray-600 mb-4">
                {markingSold.name} - Listed at ₨{markingSold.price.toLocaleString()}
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Sold Price (PKR)</label>
                <input
                  type="number"
                  value={soldPrice}
                  onChange={(e) => setSoldPrice(e.target.value)}
                  className="input-field"
                  placeholder="Enter sold price"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSoldModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmMarkSold}
                  className="btn-primary flex-1"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
