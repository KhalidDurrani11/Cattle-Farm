'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { getCattle, getFeaturedCattle } from '@/lib/api';
import { Cattle } from '@/types';
import CattleCard from '@/components/CattleCard';
import CattleDetailsModal from '@/components/CattleDetailsModal';
import {
  Search, Grid3X3, List, CheckCircle, SlidersHorizontal, MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 15 },
    show: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100, damping: 15 } },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12 min-h-screen">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-950 dark:text-white mb-2 font-serif">
          Browse Livestock
        </h1>
        <p className="text-gray-500 dark:text-[#a8a29e]">
          Find verified cattle directly from farmers across Pakistan
        </p>
      </motion.div>

      {/* Featured Section */}
      {featured.length > 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-lg font-bold text-gray-950 dark:text-white mb-5 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Verified Featured Listings
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.slice(0, 3).map(c => (
              <CattleCard key={c._id} cattle={c} onView={setSelected} />
            ))}
          </div>
        </motion.div>
      )}

      {/* Search & Filters Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white/70 dark:bg-[#181b18]/70 backdrop-blur-xl rounded-2xl p-4 mb-6 shadow-sm border border-[#1E4620]/10 dark:border-[#292e29]"
      >
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, breed, or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#1E4620]/15 dark:border-[#292e29] bg-white dark:bg-[#111311] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-4 py-3 rounded-xl border border-[#1E4620]/15 dark:border-[#292e29] bg-white dark:bg-[#111311] text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 cursor-pointer"
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <select
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              className="px-4 py-3 rounded-xl border border-[#1E4620]/15 dark:border-[#292e29] bg-white dark:bg-[#111311] text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 cursor-pointer"
            >
              {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all text-sm font-semibold ${
                showFilters
                  ? 'bg-primary text-white border-primary shadow-md'
                  : 'border-[#1E4620]/15 dark:border-[#292e29] hover:bg-[#1E4620]/5 text-foreground'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>
          </div>

          {/* View Toggle */}
          <div className="flex gap-1 bg-[#1E4620]/5 dark:bg-white/5 p-1 rounded-xl items-center self-start md:self-auto">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-[#292e29] text-primary dark:text-white shadow' : 'text-gray-400'}`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-[#292e29] text-primary dark:text-white shadow' : 'text-gray-400'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Expanded Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-4 border-t border-[#1E4620]/10 dark:border-[#292e29] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase mb-1">Breed</label>
                  <select
                    value={breed}
                    onChange={(e) => setBreed(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#1E4620]/15 dark:border-[#292e29] bg-white dark:bg-[#111311] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/10 text-sm cursor-pointer"
                  >
                    {BREEDS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase mb-1">Min Price (Rs)</label>
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2.5 rounded-xl border border-[#1E4620]/15 dark:border-[#292e29] bg-white dark:bg-[#111311] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/10 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase mb-1">Max Price (Rs)</label>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="Any"
                    className="w-full px-3 py-2.5 rounded-xl border border-[#1E4620]/15 dark:border-[#292e29] bg-white dark:bg-[#111311] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/10 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase mb-1">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#1E4620]/15 dark:border-[#292e29] bg-white dark:bg-[#111311] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/10 text-sm cursor-pointer"
                  >
                    {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>

                <div className="sm:col-span-2 md:col-span-4 flex items-center mt-2">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={verifiedOnly}
                      onChange={(e) => setVerifiedOnly(e.target.checked)}
                      className="w-4 h-4 text-primary rounded border-[#1E4620]/15 dark:border-[#292e29] focus:ring-primary focus:ring-offset-0 focus:ring-1"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-300 font-medium group-hover:text-primary transition-colors">Show only verified cattle</span>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  </label>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Results Count */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mb-6 text-sm text-gray-500 dark:text-[#a8a29e]"
      >
        Showing <span className="font-bold text-gray-950 dark:text-white">{filteredCattle.length}</span> {filteredCattle.length === 1 ? 'livestock listing' : 'livestock listings'}
        {(category !== 'All' || breed !== 'All' || province !== 'All' || search) && ' (filtered)'}
      </motion.div>

      {/* Results Grid */}
      {loading ? (
        <div className="flex justify-center py-32">
          <div className="spinner animate-spin" />
        </div>
      ) : filteredCattle.length > 0 ? (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className={viewMode === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
          }
        >
          {filteredCattle.map(c => (
            <motion.div key={c._id} variants={itemVariants}>
              <CattleCard
                cattle={c}
                onView={setSelected}
                viewMode={viewMode}
              />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-24 bg-white/50 dark:bg-[#181b18]/50 backdrop-blur rounded-3xl border border-[#1E4620]/10 dark:border-[#292e29]"
        >
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/20">
            <Search className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-bold text-gray-950 dark:text-white mb-2">No listings found</h3>
          <p className="text-gray-500 dark:text-[#a8a29e] text-sm">Try adjusting your filters or search terms</p>
        </motion.div>
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
    <Suspense fallback={<div className="flex justify-center py-32"><div className="spinner animate-spin" /></div>}>
      <MarketplaceContent />
    </Suspense>
  );
}
