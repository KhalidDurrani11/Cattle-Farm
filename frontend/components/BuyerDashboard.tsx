'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Cattle, Inquiry } from '@/types';
import {
  ShoppingBag, Heart, MessageCircle, Clock, MapPin, Phone,
  ArrowRight, Package, TrendingUp
} from 'lucide-react';

interface Props {
  purchases: any[];
  inquiries: Inquiry[];
  favorites: Cattle[];
  stats: {
    totalPurchases: number;
    totalSpent: number;
    pendingInquiries: number;
  };
}

export default function BuyerDashboard({ purchases, inquiries, favorites, stats }: Props) {
  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Buyer Dashboard</h2>
            <p className="text-blue-100 mt-1">Find and purchase quality livestock directly from farmers</p>
          </div>
          <Link href="/marketplace" className="btn-primary bg-white text-blue-600 hover:bg-blue-50">
            Browse Marketplace
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Purchases</p>
              <p className="text-2xl font-bold">{stats.totalPurchases}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="glass-card p-5 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Spent</p>
              <p className="text-2xl font-bold text-green-600">₨{(stats.totalSpent || 0).toLocaleString()}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="glass-card p-5 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Saved Items</p>
              <p className="text-2xl font-bold">{favorites.length}</p>
            </div>
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-red-600" />
            </div>
          </div>
        </div>

        <div className="glass-card p-5 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending Inquiries</p>
              <p className="text-2xl font-bold text-amber-600">{stats.pendingInquiries}</p>
            </div>
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Inquiries */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Recent Inquiries</h3>
            {inquiries.length > 0 && (
              <Link href="#" className="text-sm text-primary-600 hover:underline">View All</Link>
            )}
          </div>

          {inquiries.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No inquiries yet</p>
              <Link href="/marketplace" className="text-primary-600 text-sm hover:underline">
                Browse cattle
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {inquiries.slice(0, 5).map((inquiry) => (
                <div
                  key={inquiry._id}
                  className="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-sm text-gray-900 dark:text-white">
                        {(inquiry.cattleId as any)?.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Seller: {(inquiry.sellerId as any)?.name}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      inquiry.status === 'responded'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {inquiry.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Saved Listings */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Saved Listings</h3>
            {favorites.length > 0 && (
              <Link href="/marketplace" className="text-sm text-primary-600 hover:underline">Browse More</Link>
            )}
          </div>

          {favorites.length === 0 ? (
            <div className="text-center py-8">
              <Heart className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No saved listings</p>
              <Link href="/marketplace" className="text-primary-600 text-sm hover:underline">
                Start browsing
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {favorites.slice(0, 3).map((cattle) => (
                <Link
                  key={cattle._id}
                  href={`/marketplace?selected=${cattle._id}`}
                  className="flex gap-3 p-2 hover:bg-gray-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors"
                >
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {cattle.images?.[0] ? (
                      <Image
                        src={cattle.images[0]}
                        alt={cattle.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-gray-900 dark:text-white">{cattle.name}</p>
                    <p className="text-xs text-gray-500">{cattle.breed}</p>
                    <p className="text-sm font-semibold text-primary-600 mt-1">
                      ₨{cattle.price.toLocaleString()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
