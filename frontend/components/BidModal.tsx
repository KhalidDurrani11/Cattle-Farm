'use client';

import React, { useState, useEffect } from 'react';
import { X, Gavel, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface BidModalProps {
  isOpen: boolean;
  onClose: () => void;
  cattleId: string;       // We pass cattle ID, modal fetches the real auction
  startingPrice: number;
  onBidSuccess: () => void;
}

export default function BidModal({ isOpen, onClose, cattleId, startingPrice, onBidSuccess }: BidModalProps) {
  const { token } = useAuth();
  const [bidAmount, setBidAmount] = useState<number | ''>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState('');
  const [auctionId, setAuctionId] = useState('');
  const [currentHighestBid, setCurrentHighestBid] = useState(0);

  const API = process.env.NEXT_PUBLIC_API_URL || 'https://cattle-farm-jmeo.onrender.com';
  const minBid = currentHighestBid > 0 ? currentHighestBid + 1000 : startingPrice;

  useEffect(() => {
    if (!isOpen || !cattleId) return;
    setIsFetching(true);
    setError('');
    fetch(`${API}/api/auctions/by-cattle/${cattleId}`)
      .then(res => res.json())
      .then(data => {
        if (data.auction) {
          setAuctionId(data.auction._id);
          setCurrentHighestBid(data.auction.currentHighestBid || 0);
        } else {
          setError('Could not load auction details. Please try again.');
        }
      })
      .catch(() => setError('Network error loading auction.'))
      .finally(() => setIsFetching(false));
  }, [isOpen, cattleId, API]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError('You must be logged in to place a bid.');
      return;
    }
    if (!auctionId) {
      setError('Auction not loaded. Please close and try again.');
      return;
    }
    if (!bidAmount || Number(bidAmount) < minBid) {
      setError(`Bid must be at least Rs. ${minBid.toLocaleString()}`);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch(`${API}/api/auctions/${auctionId}/bid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bidAmount: Number(bidAmount) }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to place bid');

      onBidSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-slate-700">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50">
          <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
            <Gavel className="w-5 h-5 text-purple-600" />
            Place a Bid
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 rounded-xl text-sm flex items-start gap-2 border border-red-100 dark:border-red-800">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              {error}
            </div>
          )}

          {isFetching ? (
            <div className="flex items-center justify-center py-6 gap-2 text-gray-500">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Loading auction details...</span>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-100 dark:border-purple-800">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Starting Price</p>
                  <p className="font-semibold text-gray-900 dark:text-white">Rs. {startingPrice.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Current Highest Bid</p>
                  <p className="text-lg font-bold text-purple-600">
                    {currentHighestBid > 0 ? `Rs. ${currentHighestBid.toLocaleString()}` : 'No bids yet'}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Your Bid Amount (Rs.)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm">Rs.</span>
                  <input
                    type="number"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder={minBid.toString()}
                    min={minBid}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white text-lg font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">Minimum bid: Rs. {minBid.toLocaleString()}</p>
              </div>
            </>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button
              type="submit"
              disabled={isLoading || isFetching || !auctionId}
              className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white font-semibold py-3 rounded-xl flex justify-center items-center gap-2 transition-colors shadow-lg shadow-purple-600/20"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Gavel className="w-4 h-4" /> Confirm Bid</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
