'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { getCattle, getFeaturedCattle } from '@/lib/api';
import { Cattle } from '@/types';
import CattleCard from '@/components/CattleCard';
import CattleDetailsModal from '@/components/CattleDetailsModal';
import {
  Search, Filter, Grid3X3, List, CheckCircle, SlidersHorizontal,
  ChevronDown, MapPin, Tag
} from 'lucide-react';

const CATEGORIES = ['All', 'Bull', 'Cow', 'Calf', 'Buffalo', 'Goat', 'Sheep'];
const BREEDS = ['All', 'Sahiwal', 'Cholistani', 'Thari', 'Nili-Ravi', 'Murrah', 'Beetal', 'Friesian', 'Crossbreed'];
const PROVINCES = ['All', 'Punjab', 'Sindh', 'KPK', 'Balochistan'];
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'views', label: 'Most Viewed' },
];

function MarketplaceContent() {
  const searchParams = useSearchParams();
  const [cattle, setCattle] = useState<Cattle[]>([]);
  const [featured, setFeatured] = useState<Cattle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Cattle | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [breed, setBreed] = useState('All');
  const [province, setProvince] = useState('All');
  const [search, setSearch] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  useEffect(() => {
    fetchCattle();
    fetchFeatured();
  }, [category, breed, province, minPrice, maxPrice, sortBy, verifiedOnly]);

  const fetchCattle = async () => {
    const params: Record<string, string> = {};
    if (category !== 'All') params.category = category;
    if (breed !== 'All') params.breed = breed;
    if (province !== 'All') params.province = province;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    params.sortBy = sortBy;
    if (verifiedOnly) params.verificationStatus = 'verified';

    setLoading(true);
    try {
      const res = await getCattle(params);
      setCattle(res.data || []);
    } catch {
      setCattle([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeatured = async () => {
    try {
      const res = await getFeaturedCattle();
      setFeatured(res || []);
    } catch {
      setFeatured([]);
    }
  };

  const filteredCattle = cattle.filter(c =>
    !search ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.breed.toLowerCase().includes(search.toLowerCase()) ||
    c.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Browse Livestock
        </h1>
        <p className="text-gray-500">
          Find verified cattle directly from farmers across Pakistan
        </p>
      </div>

      {/* Featured Section */}
      {featured.length > 0 && (
        <div className="mb-10">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Verified Featured Listings
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featured.slice(0, 3).map(c => (
              <CattleCard key={c._id} cattle={c} onView={setSelected} />
            ))}
          </div>
        </div>
      )}

      {/* Search & Filters Bar */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 mb-6 shadow-sm border border-gray-100 dark:border-slate-700">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, breed, or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700"
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <select
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700"
            >
              {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                showFilters
                  ? 'bg-primary text-white border-primary'
                  : 'border-gray-200 dark:border-slate-600 hover:bg-gray-50'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>
          </div>

          {/* View Toggle */}
          <div className="flex gap-1 bg-gray-100 dark:bg-slate-700 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white dark:bg-slate-600 shadow' : ''}`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-white dark:bg-slate-600 shadow' : ''}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Breed</label>
              <select
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600"
              >
                {BREEDS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Min Price</label>
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Max Price</label>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Any"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600"
              >
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            <div className="md:col-span-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                  className="w-4 h-4 text-primary rounded"
                />
                <span className="text-sm">Show only verified cattle</span>
                <CheckCircle className="w-4 h-4 text-green-500" />
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="mb-4 text-sm text-gray-500">
        Showing {filteredCattle.length} {filteredCattle.length === 1 ? 'result' : 'results'}
        {(category !== 'All' || breed !== 'All' || province !== 'All' || search) && ' (filtered)'}
      </div>

      {/* Results Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="spinner" />
        </div>
      ) : filteredCattle.length > 0 ? (
        <div className={viewMode === 'grid'
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
          : 'space-y-4'
        }>
          {filteredCattle.map(c => (
            <CattleCard
              key={c._id}
              cattle={c}
              onView={setSelected}
              viewMode={viewMode}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No listings found</h3>
          <p className="text-gray-500">Try adjusting your filters or search terms</p>
        </div>
      )}

      {/* Details Modal */}
      {selected && (
        <CattleDetailsModal
          cattle={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}

export default function MarketplacePage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><div className="spinner" /></div>}>
      <MarketplaceContent />
    </Suspense>
  );
}
