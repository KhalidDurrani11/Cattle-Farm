'use client';

import React, { useState } from 'react';
import { X, Gavel, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface BidModalProps {
  isOpen: boolean;
  onClose: () => void;
  auctionId: string;
  currentHighestBid: number;
  startingPrice: number;
  onBidSuccess: () => void;
}

export default function BidModal({ isOpen, onClose, auctionId, currentHighestBid, startingPrice, onBidSuccess }: BidModalProps) {
  const { user } = useAuth();
  const [bidAmount, setBidAmount] = useState<number | ''>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const minBid = currentHighestBid > 0 ? currentHighestBid + 1000 : startingPrice; // Minimum 1000 PKR increment

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('You must be logged in to place a bid.');
      return;
    }
    if (!bidAmount || bidAmount < minBid) {
      setError(`Bid must be at least Rs. ${minBid.toLocaleString()}`);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch(`http://localhost:5000/api/auctions/${auctionId}/bid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ bidAmount }),
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-slide-down border border-line">
        <div className="flex justify-between items-center p-6 border-b border-line bg-surface-hover">
          <h2 className="text-xl font-bold flex items-center">
            <Gavel className="w-5 h-5 mr-2 text-primary" />
            Place a Bid
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-earth-200 dark:hover:bg-earth-800 rounded-full transition-colors">
            <X className="w-5 h-5 text-muted" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 rounded-lg text-sm flex items-start">
              <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-surface-hover rounded-xl border border-line">
              <span className="text-muted text-sm">Current Highest Bid</span>
              <span className="text-lg font-bold text-primary">Rs. {currentHighestBid > 0 ? currentHighestBid.toLocaleString() : startingPrice.toLocaleString()}</span>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Your Bid Amount (Rs.)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted font-medium">Rs.</span>
                <input
                  type="number"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder={minBid.toString()}
                  min={minBid}
                  className="input-field pl-12 text-lg font-medium"
                  required
                />
              </div>
              <p className="text-xs text-muted mt-2">Minimum required bid is Rs. {minBid.toLocaleString()}</p>
            </div>
          </div>

          <div className="flex space-x-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={isLoading} className="btn-primary flex-1 flex justify-center items-center">
              {isLoading ? <div className="spinner w-5 h-5 border-2" /> : 'Confirm Bid'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
