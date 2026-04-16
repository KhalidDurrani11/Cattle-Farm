'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Cattle } from '@/types';
import {
  ShieldCheck, ClipboardCheck, CheckCircle, XCircle, Calendar,
  MapPin, User, AlertCircle
} from 'lucide-react';

interface Props {
  pendingVerifications: Cattle[];
  myVerifications: Cattle[];
  stats: {
    pendingCount: number;
    verifiedCount: number;
  };
  onVerify: (cattleId: string, healthScore: number, notes: string) => void;
  onReject: (cattleId: string, reason: string) => void;
}

export default function VetDashboard({
  pendingVerifications, myVerifications, stats, onVerify, onReject
}: Props) {
  const [selectedCattle, setSelectedCattle] = useState<Cattle | null>(null);
  const [healthScore, setHealthScore] = useState(80);
  const [notes, setNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');

  const handleVerify = () => {
    if (selectedCattle) {
      onVerify(selectedCattle._id, healthScore, notes);
      setSelectedCattle(null);
      setHealthScore(80);
      setNotes('');
    }
  };

  const handleReject = () => {
    if (selectedCattle) {
      onReject(selectedCattle._id, rejectionReason);
      setSelectedCattle(null);
      setRejectionReason('');
      setShowRejectModal(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Veterinarian Dashboard</h2>
            <p className="text-emerald-100 mt-1">Verify cattle health and vaccination records</p>
          </div>
          <div className="flex gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold">{stats.pendingCount}</p>
              <p className="text-sm text-emerald-100">Pending</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">{stats.verifiedCount}</p>
              <p className="text-sm text-emerald-100">Verified</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-slate-800 p-1 rounded-xl">
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'pending'
              ? 'bg-white dark:bg-slate-700 shadow text-emerald-600'
              : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          <ClipboardCheck className="w-4 h-4" />
          Pending ({stats.pendingCount})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'completed'
              ? 'bg-white dark:bg-slate-700 shadow text-emerald-600'
              : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          Completed ({stats.verifiedCount})
        </button>
      </div>

      {/* Content */}
      {activeTab === 'pending' && (
        <>
          {pendingVerifications.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 dark:bg-slate-800/50 rounded-xl">
              <ShieldCheck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No pending verifications</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {pendingVerifications.map((cattle) => (
                <div
                  key={cattle._id}
                  className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-100 dark:border-slate-700 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setSelectedCattle(cattle)}
                >
                  <div className="flex gap-4">
                    <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {cattle.images?.[0] ? (
                        <Image
                          src={cattle.images[0]}
                          alt={cattle.name}
                          width={96}
                          height={96}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          No Image
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{cattle.name}</h3>
                      <p className="text-sm text-gray-500">{cattle.breed} • {cattle.category}</p>

                      <div className="mt-2 space-y-1 text-sm">
                        <p className="flex items-center gap-1 text-gray-500">
                          <User className="w-3.5 h-3.5" />
                          Seller: {(cattle.sellerId as any)?.name}
                        </p>
                        <p className="flex items-center gap-1 text-gray-500">
                          <MapPin className="w-3.5 h-3.5" />
                          {(cattle.sellerId as any)?.location}
                        </p>
                        <p className="flex items-center gap-1 text-gray-500">
                          <Calendar className="w-3.5 h-3.5" />
                          Submitted: {new Date(cattle.verification?.submittedAt || '').toLocaleDateString()}
                        </p>
                      </div>

                      {cattle.verification?.vaccinationRecords?.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                            Vaccination Records: {cattle.verification.vaccinationRecords.length}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'completed' && (
        <>
          {myVerifications.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 dark:bg-slate-800/50 rounded-xl">
              <ClipboardCheck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No completed verifications yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {myVerifications.map((cattle) => (
                <div
                  key={cattle._id}
                  className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-100 dark:border-slate-700"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                        {cattle.images?.[0] && (
                          <Image
                            src={cattle.images[0]}
                            alt={cattle.name}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{cattle.name}</h3>
                        <p className="text-sm text-gray-500">{(cattle.sellerId as any)?.name}</p>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-sm text-emerald-600">
                            ✓ Verified
                          </span>
                          {cattle.verification?.healthScore && (
                            <span className="text-sm text-gray-500">
                              Health Score: {cattle.verification.healthScore}/100
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <span className="text-sm text-gray-400">
                      {new Date(cattle.verification?.verifiedAt || '').toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Verification Modal */}
      {selectedCattle && !showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Verify Cattle
            </h3>

            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-lg">
                <p className="font-medium">{selectedCattle.name}</p>
                <p className="text-sm text-gray-500">{selectedCattle.breed}</p>
                <p className="text-sm text-gray-500 mt-2">
                  {selectedCattle.healthNotes}
                </p>
              </div>

              {selectedCattle.verification?.vaccinationRecords?.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Vaccination Records</h4>
                  <div className="space-y-2">
                    {selectedCattle.verification.vaccinationRecords.map((record, i) => (
                      <div key={i} className="text-sm bg-gray-50 p-2 rounded">
                        <p><strong>{record.name}</strong> - {new Date(record.date).toLocaleDateString()}</p>
                        {record.nextDue && <p className="text-xs text-gray-500">Next due: {new Date(record.nextDue).toLocaleDateString()}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Health Score</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={healthScore}
                  onChange={(e) => setHealthScore(Number(e.target.value))}
                  className="w-full"
                />
                <p className="text-center font-bold text-lg">{healthScore}/100</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="input-field"
                  rows={3}
                  placeholder="Add verification notes..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setSelectedCattle(null)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowRejectModal(true)}
                  className="flex-1 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                >
                  Reject
                </button>
                <button
                  onClick={handleVerify}
                  className="btn-primary flex-1"
                >
                  Verify
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectModal && selectedCattle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Reject Verification
            </h3>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  Please provide a reason for rejection
                </p>
              </div>

              <div>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="input-field"
                  rows={3}
                  placeholder="Reason for rejection..."
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={!rejectionReason.trim()}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
