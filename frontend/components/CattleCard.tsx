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
    const txt = `Hi, I'm interested in your ${cattle.breed} ${cattle.category} (PKR ${cattle.price.toLocaleString()}) on Cattle Trading.`;
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
        className="bg-white/80 dark:bg-[#181b18]/80 backdrop-blur-md rounded-2xl p-4 border border-[#1E4620]/10 dark:border-[#292e29] flex gap-4 cursor-pointer hover:shadow-[0_20px_40px_-15px_rgba(30,70,32,0.15)] hover:border-primary/30 hover:-translate-y-0.5 transition-all duration-500 group"
        onClick={() => onView?.(cattle)}
      >
        <div className="w-32 h-24 bg-gray-100 dark:bg-slate-900 rounded-xl overflow-hidden flex-shrink-0 relative">
          {img && !imgError ? (
            <Image
              src={img}
              alt={cattle.name}
              width={128}
              height={96}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
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
                <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary dark:group-hover:text-[#8FBC8F] transition-colors">{cattle.name}</h3>
                {getVerificationBadge()}
              </div>
              <p className="text-sm text-gray-500">{cattle.breed} • {cattle.category}</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-[#1E4620] dark:text-[#8FBC8F]">₨{cattle.price.toLocaleString()}</p>
              {getStatusBadge()}
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4 text-primary" /> {cattle.district || cattle.location}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-[#CA8A04]" /> {cattle.age}
            </span>
            <span className="flex items-center gap-1">
              <Scale className="w-4 h-4 text-blue-500" /> {cattle.weight}
            </span>
          </div>

          {seller && (
            <div className="flex items-center gap-2 mt-2">
              <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-xs font-bold text-primary">
                {seller.name?.[0]}
              </div>
              <span className="text-sm font-medium">{seller.name}</span>
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
      className="bg-white/80 dark:bg-[#181b18]/80 backdrop-blur-md rounded-2xl overflow-hidden border border-[#1E4620]/10 dark:border-[#292e29] cursor-pointer hover:shadow-[0_20px_40px_-15px_rgba(30,70,32,0.15)] hover:border-primary/30 hover:-translate-y-1 transition-all duration-500 group flex flex-col justify-between"
      onClick={() => onView?.(cattle)}
    >
      {/* Image */}
      <div className="relative h-48 bg-gray-100 dark:bg-slate-900 overflow-hidden">
        <button
          onClick={handleFavorite}
          disabled={loading}
          className="absolute top-3 right-3 z-10 p-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur rounded-full shadow-sm hover:scale-110 active:scale-95 transition-all text-gray-600 dark:text-gray-300"
        >
          <Heart
            className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600 dark:text-gray-300'}`}
          />
        </button>

        {img && !imgError ? (
          <Image
            src={img}
            alt={cattle.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover group-hover:scale-110 transition-transform duration-700"
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
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-600/90 backdrop-blur text-white text-xs font-semibold rounded-full shadow-md">
              <CheckCircle className="w-3. h-3" /> Verified
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-grow flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-semibold text-gray-950 dark:text-white truncate group-hover:text-primary dark:group-hover:text-[#8FBC8F] transition-colors">{cattle.name}</h3>
              <p className="text-sm text-gray-500">{cattle.breed} • {cattle.category}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-[#1E4620] dark:text-[#8FBC8F]">₨{cattle.price.toLocaleString()}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-4">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#CA8A04]" /> {cattle.age}
            </span>
            <span className="flex items-center gap-1">
              <Scale className="w-3 h-3 text-blue-500" /> {cattle.weight}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-primary" /> {cattle.district || cattle.location}
            </span>
          </div>
        </div>

        {seller && (
          <div className="flex items-center justify-between pt-3 border-t border-[#1E4620]/10 dark:border-[#292e29]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-primary/20 rounded-full flex items-center justify-center text-xs font-bold text-primary">
                {seller.name?.[0]}
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">{seller.name}</span>
            </div>

            <button
              onClick={handleWhatsApp}
              className="p-2 bg-[#25D366] text-white rounded-xl hover:scale-110 active:scale-95 transition-all shadow-md"
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
