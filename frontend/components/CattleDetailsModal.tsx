'use client';
import Image from 'next/image';
import { useState } from 'react';
import { Cattle } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { ShieldCheck, BadgeCheck, Calendar, MapPin, User, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

const CATEGORY_EMOJI: Record<string, string> = {
  Bull: '🐂', Cow: '🐄', Calf: '🐮', Buffalo: '🦬', Goat: '🐐', Sheep: '🐑', Other: '🐾',
};

interface Props {
  cattle: Cattle;
  onClose: () => void;
}

export default function CattleDetailsModal({ cattle, onClose }: Props) {
  const { user } = useAuth();
  const [imgIdx, setImgIdx] = useState(0);
  const seller = typeof cattle.sellerId === 'object' ? cattle.sellerId : null;

  const isVerified = cattle.verification?.status === 'verified';
  const healthScore = cattle.verification?.healthScore;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 w-full sm:max-w-2xl sm:rounded-2xl rounded-t-2xl max-h-[95vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{cattle.name}</h2>
            {isVerified && <BadgeCheck className="w-5 h-5 text-green-500" />}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
        </div>

        <div className="p-6">
          {/* Images */}
          <div className="relative h-64 bg-gradient-to-br from-green-50 to-amber-50 rounded-xl overflow-hidden mb-4">
            {cattle.images?.[imgIdx] ? (
              <Image
                src={cattle.images[imgIdx]}
                alt={cattle.name}
                fill
                sizes="(max-width: 640px) 100vw, 600px"
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-8xl">
                {CATEGORY_EMOJI[cattle.category] || '🐾'}
              </div>
            )}

            {/* Status Badge */}
            <div className="absolute top-3 left-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                cattle.status === 'sold' ? 'bg-blue-500 text-white' :
                cattle.status === 'reserved' ? 'bg-amber-500 text-white' :
                'bg-green-500 text-white'
              }`}>
                {cattle.status.charAt(0).toUpperCase() + cattle.status.slice(1)}
              </span>
            </div>
          </div>

          {/* Thumbnail Gallery */}
          {cattle.images?.length > 1 && (
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              {cattle.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setImgIdx(i)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                    imgIdx === i ? 'border-primary-600' : 'border-gray-200'
                  }`}
                >
                  <Image src={img} alt="" width={64} height={64} className="object-cover w-full h-full" />
                </button>
              ))}
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-2xl font-bold text-primary-600">₨{cattle.price.toLocaleString()}</span>
            {cattle.originalPrice && cattle.originalPrice > cattle.price && (
              <span className="text-lg text-gray-400 line-through">₨{cattle.originalPrice.toLocaleString()}</span>
            )}
          </div>

          {/* Verification Badge */}
          {isVerified && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-green-800 dark:text-green-400">Veterinarian Verified</p>
                  {healthScore && (
                    <p className="text-sm text-green-600">Health Score: {healthScore}/100</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
            {[
              { label: 'Breed', val: cattle.breed, icon: null },
              { label: 'Category', val: cattle.category, icon: null },
              { label: 'Age', val: cattle.age, icon: Calendar },
              { label: 'Weight', val: cattle.weight, icon: null },
              { label: 'Gender', val: cattle.gender, icon: null },
              { label: 'Location', val: cattle.district || cattle.location, icon: MapPin },
            ].map(({ label, val, icon: Icon }) => (
              <div key={label} className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-3">
                <div className="flex items-center gap-2">
                  {Icon && <Icon className="w-3.5 h-3.5 text-gray-400" />}
                  <p className="text-xs text-gray-500 uppercase">{label}</p>
                </div>
                <p className="font-semibold text-gray-800 dark:text-white mt-0.5">{val}</p>
              </div>
            ))}
          </div>

          {/* Tags */}
          {cattle.tags && cattle.tags.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {cattle.tags.map((tag, i) => (
                  <span key={i} className="px-2 py-1 bg-gray-100 dark:bg-slate-700 text-xs rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {cattle.description && (
            <div className="mb-4">
              <h4 className="font-semibold text-gray-800 dark:text-white mb-2">Description</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">{cattle.description}</p>
            </div>
          )}

          {/* Health Notes */}
          {cattle.healthNotes && (
            <div className="mb-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4">
              <h4 className="font-semibold text-amber-800 dark:text-amber-400 mb-1 flex items-center gap-2">
                🩺 Health Information
              </h4>
              <p className="text-sm text-amber-700 dark:text-amber-300">{cattle.healthNotes}</p>
            </div>
          )}

          {/* Vaccination Records */}
          {cattle.verification?.vaccinationRecords?.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold text-gray-800 dark:text-white mb-2">Vaccination Records</h4>
              <div className="space-y-2">
                {cattle.verification.vaccinationRecords.map((record, i) => (
                  <div key={i} className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{record.name}</span>
                      <span className="text-sm text-gray-500">{new Date(record.date).toLocaleDateString()}</span>
                    </div>
                    {record.nextDue && (
                      <p className="text-xs text-gray-500 mt-1">Next due: {new Date(record.nextDue).toLocaleDateString()}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Seller Card */}
          {seller && (
            <div className="border border-gray-200 dark:border-slate-700 rounded-xl p-4 mb-4">
              <h4 className="font-semibold text-gray-800 dark:text-white mb-3">Seller Information</h4>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold text-lg">
                  {seller.name[0]}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    {seller.name}
                    {seller.verificationStatus === 'verified' && (
                      <BadgeCheck className="w-4 h-4 text-green-500" />
                    )}
                  </p>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {seller.location}
                  </p>
                </div>
              </div>

              {/* Seller Stats */}
              <div className="grid grid-cols-3 gap-2 text-center text-sm">
                <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-2">
                  <p className="font-semibold">{seller.rating?.toFixed(1) || '0.0'}</p>
                  <p className="text-xs text-gray-500">Rating</p>
                </div>
                <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-2">
                  <p className="font-semibold">{seller.totalSales || 0}</p>
                  <p className="text-xs text-gray-500">Sales</p>
                </div>
                <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-2">
                  <p className="font-semibold">{new Date(seller.joinedAt || '').getFullYear()}</p>
                  <p className="text-xs text-gray-500">Joined</p>
                </div>
              </div>

              <Link
                href={`/seller/${seller._id || seller.id}`}
                className="mt-3 block text-center text-sm text-primary-600 hover:underline"
              >
                View Seller Profile →
              </Link>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {cattle.status === 'available' ? (
              <>
                <button
                  onClick={() => {
                    const phone = seller?.phone?.replace(/\D/g, '');
                    if (phone) {
                      window.open(`https://wa.me/${phone.startsWith('92') ? phone : '92' + phone}?text=Hi, I'm interested in your ${cattle.name}`, '_blank');
                    }
                  }}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  📱 Contact on WhatsApp
                </button>

                {user?.role === 'buyer' && (
                  <Link
                    href={`/dashboard?inquiry=${cattle._id}`}
                    className="flex-1 bg-primary hover:bg-primary-700 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
                  >
                    Send Inquiry
                  </Link>
                )}
              </>
            ) : (
              <button
                disabled
                className="w-full bg-gray-200 text-gray-500 font-medium py-3 rounded-xl cursor-not-allowed"
              >
                {cattle.status === 'sold' ? 'Sold Out' : 'Reserved'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
