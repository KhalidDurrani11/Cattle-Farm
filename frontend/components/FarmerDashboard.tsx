'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Cattle, Inquiry } from '@/types';
import {
  Package, TrendingUp, Eye, MessageCircle, Plus, Edit, Trash2,
  CheckCircle, XCircle, Clock, MapPin, Phone, BadgeCheck, DollarSign
} from 'lucide-react';

interface Props {
  listings: Cattle[];
  stats: {
    totalListings: number;
    available: number;
    sold: number;
    reserved: number;
    totalViews: number;
    totalInquiries: number;
    totalRevenue: number;
  };
  pendingInquiries: Inquiry[];
  onEdit: (cattle: Cattle) => void;
  onDelete: (id: string) => void;
  onMarkSold: (cattle: Cattle) => void;
  onMarkAvailable: (id: string) => void;
  onAddNew: () => void;
}

const PROVINCES = ['Punjab', 'Sindh', 'KPK', 'Balochistan', 'Gilgit-Baltistan', 'Islamabad'];

export default function FarmerDashboard({
  listings, stats, pendingInquiries, onEdit, onDelete, onMarkSold, onMarkAvailable, onAddNew
}: Props) {
  const [activeTab, setActiveTab] = useState<'listings' | 'inquiries' | 'stats'>('listings');
  const [filterStatus, setFilterStatus] = useState<'all' | 'available' | 'sold' | 'reserved'>('all');

  const filteredListings = filterStatus === 'all'
    ? listings
    : listings.filter(c => c.status === filterStatus);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <span className="badge bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400">Available</span>;
      case 'sold':
        return <span className="badge bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400">Sold ✓</span>;
      case 'reserved':
        return <span className="badge bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">Reserved</span>;
      default:
        return <span className="badge bg-gray-100 text-gray-700">{status}</span>;
    }
  };

  const getVerificationBadge = (cattle: Cattle) => {
    if (cattle.verification?.status === 'verified') {
      return (
        <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
          <BadgeCheck className="w-3.5 h-3.5" /> Verified
        </span>
      );
    } else if (cattle.verification?.status === 'pending') {
      return (
        <span className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
          <Clock className="w-3.5 h-3.5" /> Pending
        </span>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary-800 to-primary-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Farmer Dashboard</h2>
            <p className="text-primary-100 mt-1">Manage your livestock listings and connect with buyers</p>
          </div>
          <button onClick={onAddNew} className="btn-amber flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add New Cattle
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Listings</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalListings}</p>
            </div>
            <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="glass-card p-5 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Sold</p>
              <p className="text-2xl font-bold text-blue-600">{stats.sold}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="glass-card p-5 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Views</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{(stats.totalViews || 0).toLocaleString()}</p>
            </div>
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <Eye className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="glass-card p-5 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Revenue</p>
              <p className="text-2xl font-bold text-green-600">₨{(stats.totalRevenue || 0).toLocaleString()}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-slate-800 p-1 rounded-xl">
        {[
          { id: 'listings', label: 'My Listings', icon: Package },
          { id: 'inquiries', label: `Inquiries (${pendingInquiries?.length || 0})`, icon: MessageCircle },
          { id: 'stats', label: 'Statistics', icon: TrendingUp },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === id
                ? 'bg-white dark:bg-slate-700 shadow text-primary-600 dark:text-primary-400'
                : 'text-gray-600 dark:text-gray-400 hover:bg-white/50'
            }`}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'listings' && (
        <div className="space-y-4">
          {/* Filter */}
          <div className="flex gap-2">
            {['all', 'available', 'sold', 'reserved'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === status
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                    : 'bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-gray-400 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>

          {/* Listings Grid */}
          {filteredListings.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 dark:bg-slate-800/50 rounded-xl">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No listings found. Add your first cattle!</p>
              <button onClick={onAddNew} className="btn-primary mt-4">
                <Plus className="w-4 h-4 inline mr-2" /> Add New Cattle
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredListings.map((cattle) => (
                <div
                  key={cattle._id}
                  className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-100 dark:border-slate-700 flex flex-col md:flex-row gap-4"
                >
                  {/* Image */}
                  <div className="w-full md:w-24 h-32 md:h-24 bg-gray-100 dark:bg-slate-700 rounded-lg overflow-hidden flex-shrink-0">
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
                        <Package className="w-8 h-8" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">{cattle.name}</h3>
                        <p className="text-sm text-gray-500">{cattle.breed} • {cattle.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary-600">₨{cattle.price.toLocaleString()}</p>
                        {getStatusBadge(cattle.status)}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> {cattle.district || cattle.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" /> {cattle.views} views
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-3.5 h-3.5" /> {cattle.inquiries} inquiries
                      </span>
                      {getVerificationBadge(cattle)}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex md:flex-col gap-2 justify-end">
                    <button
                      onClick={() => onEdit(cattle)}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    {cattle.status !== 'sold' ? (
                      <button
                        onClick={() => onMarkSold(cattle)}
                        className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                        title="Mark as Sold"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => onMarkAvailable(cattle._id)}
                        className="p-2 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
                        title="Mark as Available"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={() => onDelete(cattle._id)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'inquiries' && (
        <div className="space-y-4">
          {pendingInquiries?.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 dark:bg-slate-800/50 rounded-xl">
              <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No pending inquiries</p>
            </div>
          ) : (
            pendingInquiries?.map((inquiry) => (
              <div
                key={inquiry._id}
                className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-100 dark:border-slate-700"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      Inquiry about {(inquiry.cattleId as any)?.name}
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">
                      From: {(inquiry.buyerId as any)?.name} • {(inquiry.buyerId as any)?.phone}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 mt-2 bg-gray-50 dark:bg-slate-700/50 p-3 rounded-lg">
                      "{inquiry.message}"
                    </p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(inquiry.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'stats' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-100 dark:border-slate-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Monthly Sales</h3>
          <div className="h-64 flex items-end gap-2">
            {[1, 2, 3, 4, 5, 6].map((month) => (
              <div key={month} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-primary-200 dark:bg-primary-900/30 rounded-t-lg"
                  style={{ height: `${Math.random() * 150 + 50}px` }}
                />
                <span className="text-xs text-gray-500">{['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][month - 1]}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
