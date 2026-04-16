'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getSellerProfile } from '@/lib/api';
import { getCattle } from '@/lib/api';
import { User, Cattle } from '@/types';
import { useLang } from '@/context/LanguageContext';
import CattleCard from '@/components/CattleCard';
import CattleDetailsModal from '@/components/CattleDetailsModal';

export default function SellerPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useLang();
  const [seller, setSeller] = useState<User | null>(null);
  const [cattle, setCattle] = useState<Cattle[]>([]);
  const [selected, setSelected] = useState<Cattle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getSellerProfile(id),
      getCattle(),
    ]).then(([sellerData, allCattle]) => {
      setSeller(sellerData as User);
      const all = allCattle as Cattle[];
      setCattle(all.filter(c => {
        const sid = typeof c.sellerId === 'object' ? (c.sellerId._id || c.sellerId.id) : c.sellerId;
        return sid === id;
      }));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex justify-center py-32"><div className="spinner" /></div>;
  if (!seller) return <div className="text-center py-20 text-gray-500">Seller not found.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Seller card */}
      <div className="bg-gradient-to-r from-primary-900 to-primary-700 rounded-2xl p-8 text-white mb-8">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-4xl font-bold">
            {seller.name?.[0] || '?'}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{seller.name}</h1>
            <p className="text-primary-200">{seller.role?.toUpperCase()} · {seller.location || 'Pakistan'}</p>
            {seller.verificationStatus === 'verified' && (
              <span className="inline-flex items-center gap-1 mt-2 bg-green-500/20 text-green-300 border border-green-400/30 px-3 py-1 rounded-full text-sm">
                ✓ {t('verified')}
              </span>
            )}
          </div>
          {seller.phone && (
            <a href={`https://wa.me/92${seller.phone.replace(/^0/, '')}`}
              target="_blank" rel="noreferrer"
              className="ml-auto btn-amber">
              📱 {t('contact_whatsapp')}
            </a>
          )}
        </div>
        <div className="grid grid-cols-3 gap-4 mt-6 text-center">
          <div>
            <p className="text-2xl font-bold">{cattle.length}</p>
            <p className="text-primary-300 text-sm">Listings</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{seller.rating?.toFixed(1) || '0'} ⭐</p>
            <p className="text-primary-300 text-sm">{t('seller_rating')}</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{seller.totalSales || 0}</p>
            <p className="text-primary-300 text-sm">Total Sales</p>
          </div>
        </div>
      </div>

      {/* Listings */}
      <h2 className="text-xl font-bold text-gray-900 mb-4">{t('seller_listings')}</h2>
      {cattle.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {cattle.map(c => <CattleCard key={c._id} cattle={c} onView={setSelected} />)}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-400">No active listings from this seller.</div>
      )}

      {selected && <CattleDetailsModal cattle={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
