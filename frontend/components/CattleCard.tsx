'use client';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Cattle } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { toggleFavorite } from '@/lib/api';
import {
  Tractor, MapPin, Scale, Clock, ShieldCheck, Heart,
  MessageCircle, Phone, BadgeCheck, CheckCircle
} from 'lucide-react';

interface Props {
  cattle: Cattle;
  onView?: (cattle: Cattle) => void;
  viewMode?: 'grid' | 'list';
  initialFavorite?: boolean;
}

export default function CattleCard({ cattle, onView, viewMode = 'grid', initialFavorite = false }: Props) {
  const { token, user } = useAuth();
  const router = useRouter();
  const [imgError, setImgError] = useState(false);
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const [loading, setLoading] = useState(false);

  const seller = typeof cattle.sellerId === 'object' ? cattle.sellerId : null;
  const img = cattle.images?.[0];

  const handleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user || !token) {
      router.push('/login');
      return;
    }
    setLoading(true);
    try {
      const res = await toggleFavorite(cattle._id, token);
      setIsFavorite(res.isFavorite);
    } catch {
      alert('Error updating favorites');
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!seller?.phone) return;
    const txt = `Hi, I'm interested in your ${cattle.breed} ${cattle.category} (PKR ${cattle.price.toLocaleString()}) on AgriTradeX.`;
    const phone = seller.phone.replace(/\D/g, '');
    window.open(`https://wa.me/${phone.startsWith('92') ? phone : '92' + phone}?text=${encodeURIComponent(txt)}`, '_blank');
  };

  const getStatusBadge = () => {
    switch (cattle.status) {
      case 'sold':
        return <span className="badge bg-blue-100 text-blue-700">Sold</span>;
      case 'reserved':
        return <span className="badge bg-amber-100 text-amber-700">Reserved</span>;
      case 'available':
      default:
        return <span className="badge bg-green-100 text-green-700">Available</span>;
    }
  };

  const getVerificationBadge = () => {
    if (cattle.verification?.status === 'verified') {
      return (
        <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
          <BadgeCheck className="w-3 h-3" /> Vet Verified
        </span>
      );
    }
    return null;
  };

  // List View
  if (viewMode === 'list') {
    return (
      <div
        className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-100 dark:border-slate-700 flex gap-4 cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => onView?.(cattle)}
      >
        <div className="w-32 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
          {img && !imgError ? (
            <Image
              src={img}
              alt={cattle.name}
              width={128}
              height={96}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Tractor className="w-8 h-8 text-gray-400" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900 dark:text-white">{cattle.name}</h3>
                {getVerificationBadge()}
              </div>
              <p className="text-sm text-gray-500">{cattle.breed} • {cattle.category}</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-primary-600">₨{cattle.price.toLocaleString()}</p>
              {getStatusBadge()}
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" /> {cattle.district || cattle.location}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" /> {cattle.age}
            </span>
            <span className="flex items-center gap-1">
              <Scale className="w-4 h-4" /> {cattle.weight}
            </span>
          </div>

          {seller && (
            <div className="flex items-center gap-2 mt-2">
              <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-xs font-bold text-primary">
                {seller.name?.[0]}
              </div>
              <span className="text-sm">{seller.name}</span>
              {seller.verificationStatus === 'verified' && (
                <BadgeCheck className="w-4 h-4 text-green-500" />
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Grid View (default)
  return (
    <div
      className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden border border-gray-100 dark:border-slate-700 cursor-pointer hover:shadow-lg transition-shadow group"
      onClick={() => onView?.(cattle)}
    >
      {/* Image */}
      <div className="relative h-48 bg-gray-100">
        <button
          onClick={handleFavorite}
          disabled={loading}
          className="absolute top-3 right-3 z-10 p-2 bg-white/90 backdrop-blur rounded-full shadow-sm hover:bg-white transition-colors"
        >
          <Heart
            className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
          />
        </button>

        {img && !imgError ? (
          <Image
            src={img}
            alt={cattle.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Tractor className="w-12 h-12 text-gray-400" />
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          {getStatusBadge()}
        </div>

        {/* Verification Badge */}
        {cattle.verification?.status === 'verified' && (
          <div className="absolute bottom-3 left-3">
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500 text-white text-xs rounded-full">
              <CheckCircle className="w-3 h-3" /> Verified
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">{cattle.name}</h3>
            <p className="text-sm text-gray-500">{cattle.breed} • {cattle.category}</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-primary-600">₨{cattle.price.toLocaleString()}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-3">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" /> {cattle.age}
          </span>
          <span className="flex items-center gap-1">
            <Scale className="w-3 h-3" /> {cattle.weight}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" /> {cattle.district || cattle.location}
          </span>
        </div>

        {seller && (
          <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-slate-700"
003e
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-primary/20 rounded-full flex items-center justify-center text-xs font-bold text-primary">
                {seller.name?.[0]}
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-300">{seller.name}</span>
            </div>

            <button
              onClick={handleWhatsApp}
              className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              title="Contact on WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
