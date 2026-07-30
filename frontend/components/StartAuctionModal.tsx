'use client';
import { useState } from 'react';
import { Cattle } from '@/types';
import { X, Gavel, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface Props {
  cattle: Cattle;
  onClose: () => void;
  onSuccess: () => void;
}

export default function StartAuctionModal({ cattle, onClose, onSuccess }: Props) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [form, setForm] = useState({
    startingPrice: cattle.price,
    durationHours: 24, // default 24 hours
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setLoading(true);
    setError('');

    try {
      const startTime = new Date();
      const endTime = new Date(startTime.getTime() + form.durationHours * 60 * 60 * 1000);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auctions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          cattleId: cattle._id,
          startingPrice: form.startingPrice,
          startTime,
          endTime
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to start auction');

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
        <div className="flex justify-between items-center mb-4 border-b border-gray-100 dark:border-slate-700 pb-3">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Gavel className="w-5 h-5 text-purple-500" /> Start Auction
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700 p-2 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <p className="text-sm text-gray-500 mb-4">
          Put <strong>{cattle.name}</strong> up for auction. The highest bidder wins when the timer ends.
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Starting Price (PKR)</label>
            <input 
              type="number" 
              value={form.startingPrice} 
              onChange={e => setForm(p => ({ ...p, startingPrice: Number(e.target.value) }))}
              className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2 text-gray-900 dark:text-white"
              min={1000}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Duration (Hours)</label>
            <select 
              value={form.durationHours}
              onChange={e => setForm(p => ({ ...p, durationHours: Number(e.target.value) }))}
              className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2 text-gray-900 dark:text-white"
            >
              <option value={12}>12 Hours</option>
              <option value={24}>24 Hours</option>
              <option value={48}>48 Hours</option>
              <option value={72}>72 Hours</option>
            </select>
          </div>

          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-xl flex justify-center items-center font-medium shadow-md">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Start Auction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
