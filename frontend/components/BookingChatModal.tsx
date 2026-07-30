'use client';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Cattle } from '@/types';
import { useAuth } from '@/context/AuthContext';
import {
  getBookingConfig, getBookingById, sendBookingMessage, submitBookingPayment, createOrGetBooking
} from '@/lib/api';
import {
  X, Send, Upload, Building2, Smartphone, CheckCircle, Clock, AlertCircle, Copy, Check, MessageSquare
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  cattle: Cattle;
  existingBookingId?: string;
  onBookingUpdated?: () => void;
}

export default function BookingChatModal({ isOpen, onClose, cattle, existingBookingId, onBookingUpdated }: Props) {
  const { token, user } = useAuth();
  const [booking, setBooking] = useState<any>(null);
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [text, setText] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Payment upload state
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [paymentRef, setPaymentRef] = useState('');
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!isOpen || !token) return;

    let isMounted = true;

    const init = async () => {
      setLoading(true);
      try {
        const conf = await getBookingConfig();
        if (isMounted) setConfig(conf);

        let bData;
        if (existingBookingId) {
          bData = await getBookingById(existingBookingId, token);
        } else {
          bData = await createOrGetBooking(cattle._id, token);
        }

        if (isMounted) {
          setBooking(bData);
          setLoading(false);
          setTimeout(scrollToBottom, 100);
        }
      } catch (err) {
        console.error('Failed to load booking chat:', err);
        if (isMounted) setLoading(false);
      }
    };

    init();

    // Poll for new messages every 4s
    const interval = setInterval(async () => {
      if (!booking?._id || !token) return;
      try {
        const refreshed = await getBookingById(booking._id, token);
        if (isMounted && refreshed) {
          setBooking(refreshed);
          if (refreshed.status !== booking.status && onBookingUpdated) {
            onBookingUpdated();
          }
        }
      } catch (e) {
        // silent error on poll
      }
    }, 4000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isOpen, token, cattle._id, existingBookingId]);

  useEffect(() => {
    scrollToBottom();
  }, [booking?.messages]);

  if (!isOpen) return null;

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!text.trim() || sending || !booking?._id || !token) return;

    setSending(true);
    try {
      const updated = await sendBookingMessage(booking._id, text.trim(), token);
      setBooking(updated);
      setText('');
      setTimeout(scrollToBottom, 100);
    } catch (err: any) {
      alert(err.message || 'Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Use FormData to upload image via /api/upload
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        setScreenshotUrl(data.url);
      } else {
        // Fallback convert to base64 data URL if upload route fails
        const reader = new FileReader();
        reader.onloadend = () => {
          setScreenshotUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      // Fallback base64
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!screenshotUrl || !booking?._id || !token) {
      alert('Please upload or select a payment screenshot.');
      return;
    }

    setSending(true);
    try {
      const res = await submitBookingPayment(booking._id, screenshotUrl, token, paymentRef);
      setBooking(res.booking);
      setShowUploadModal(false);
      setScreenshotUrl('');
      setPaymentRef('');
      if (onBookingUpdated) onBookingUpdated();
      setTimeout(scrollToBottom, 100);
    } catch (err: any) {
      alert(err.message || 'Failed to submit payment proof.');
    } finally {
      setSending(false);
    }
  };

  const copyToClipboard = (textToCopy: string, label: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopiedAccount(label);
    setTimeout(() => setCopiedAccount(null), 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 font-semibold text-xs rounded-full">
            <CheckCircle className="w-4 h-4" /> Booked & Approved
          </span>
        );
      case 'payment_submitted':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 font-semibold text-xs rounded-full">
            <Clock className="w-4 h-4" /> Payment Under Verification
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 font-semibold text-xs rounded-full">
            <AlertCircle className="w-4 h-4" /> Payment Proof Rejected
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-semibold text-xs rounded-full">
            <MessageSquare className="w-4 h-4" /> Booking Conversation Active
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#181b18] w-full max-w-3xl rounded-2xl shadow-2xl border border-gray-200 dark:border-[#292e29] flex flex-col h-[92vh] max-h-[850px] overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#1E4620] text-white px-5 py-4 flex items-center justify-between shadow-md flex-shrink-0">
          <div className="flex items-center gap-3">
            {cattle.images?.[0] ? (
              <Image
                src={cattle.images[0]}
                alt={cattle.name}
                width={48}
                height={48}
                className="w-12 h-12 rounded-xl object-cover border-2 border-white/20"
              />
            ) : (
              <div className="w-12 h-12 bg-green-700 rounded-xl flex items-center justify-center font-bold text-xl">
                🐄
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base sm:text-lg">{cattle.name}</h2>
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-medium">{cattle.breed}</span>
              </div>
              <p className="text-xs text-green-200">
                Price: <span className="font-bold text-white">₨{cattle.price.toLocaleString()}</span> • {cattle.district || cattle.location}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Status Bar */}
        <div className="bg-gray-50 dark:bg-[#121412] px-5 py-2.5 border-b border-gray-200 dark:border-[#292e29] flex items-center justify-between flex-shrink-0 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium">Status:</span>
            {getStatusBadge(booking?.status || 'pending')}
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-[#1E4620] hover:bg-green-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
          >
            <Upload className="w-3.5 h-3.5" /> Upload Payment Receipt
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-gray-50/50 dark:bg-[#141614]">

          {/* Commission Breakdown & COD Policy Note */}
          {(() => {
            const commissionRate = booking?.commissionRate ?? (config?.commissionRate ?? 3);
            const animalPrice = booking?.animalPrice ?? cattle.price;
            const commissionAmount = booking?.commissionAmount ?? Math.ceil((animalPrice * commissionRate) / 100);
            const remainingAmount = animalPrice - commissionAmount;
            return (
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/30 border-2 border-amber-300 dark:border-amber-700/60 rounded-2xl p-4 shadow-md">
                <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-amber-200 dark:border-amber-800/50">
                  <span className="text-xl">📋</span>
                  <h3 className="font-extrabold text-amber-900 dark:text-amber-300 text-sm sm:text-base tracking-tight">
                    Booking Terms — How It Works
                  </h3>
                </div>

                {/* Commission Calculation */}
                <div className="bg-white/70 dark:bg-amber-950/40 rounded-xl p-3.5 mb-3 border border-amber-200 dark:border-amber-800/40">
                  <div className="flex items-center justify-between text-xs text-gray-600 dark:text-amber-300/80 mb-2 font-semibold uppercase tracking-wide">
                    <span>Payment Breakdown</span>
                    <span className="bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-300 px-2 py-0.5 rounded font-bold text-[10px]">
                      {commissionRate}% Commission Only
                    </span>
                  </div>

                  <div className="space-y-1.5 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Animal Price</span>
                      <span className="font-bold text-gray-900 dark:text-white">₨{animalPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between bg-amber-100 dark:bg-amber-900/40 rounded-lg px-3 py-2 border border-amber-300 dark:border-amber-700">
                      <span className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                        <span className="text-base">💳</span> Pay Now ({commissionRate}% Commission)
                      </span>
                      <span className="font-black text-lg text-amber-700 dark:text-amber-300">₨{commissionAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                        <span className="text-base">🚚</span> Cash on Delivery (remaining)
                      </span>
                      <span className="font-bold text-gray-700 dark:text-gray-300">₨{remainingAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* COD Note Steps */}
                <div className="space-y-1.5 text-xs text-amber-900 dark:text-amber-300 font-medium">
                  <div className="flex items-start gap-2">
                    <span className="text-base leading-none mt-0.5">1️⃣</span>
                    <p>Pay <strong className="text-amber-800 dark:text-amber-200">₨{commissionAmount.toLocaleString()}</strong> ({commissionRate}% platform commission) to the Admin account below.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-base leading-none mt-0.5">2️⃣</span>
                    <p>Upload your <strong>payment screenshot</strong> in this chat — your booking will be confirmed within minutes.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-base leading-none mt-0.5">3️⃣</span>
                    <p>The animal will be <strong>delivered to you</strong> and you pay the remaining <strong>₨{remainingAmount.toLocaleString()}</strong> in <strong>Cash on Delivery (COD)</strong>.</p>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Admin Bank Details Box */}
          <div className="bg-gradient-to-r from-emerald-900/90 to-green-950 text-white rounded-2xl p-4 sm:p-5 shadow-lg border border-emerald-500/20">
            <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
              <h3 className="font-bold text-sm sm:text-base flex items-center gap-2 text-emerald-300">
                <Building2 className="w-5 h-5 text-emerald-400" /> Admin Payment Account Details
              </h3>
              <span className="text-[11px] bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full font-mono border border-emerald-400/30">
                Official Booking
              </span>
            </div>

            <p className="text-xs text-emerald-100/90 mb-4 leading-relaxed">
              {config?.instructions || 'Transfer payment to book this animal. Upload screenshot receipt below for instant Admin verification.'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Bank Transfer */}
              <div className="bg-black/30 backdrop-blur rounded-xl p-3 border border-white/10 relative group">
                <div className="flex items-center justify-between font-semibold text-emerald-200 mb-1">
                  <span>🏦 {config?.bankName || 'Meezan Bank'}</span>
                  <button
                    onClick={() => copyToClipboard(config?.accountNumber || '0102030405', 'account')}
                    className="hover:text-white transition-colors"
                    title="Copy Account Number"
                  >
                    {copiedAccount === 'account' ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-white font-medium truncate">{config?.accountTitle || 'AgriTradeX Livestock'}</p>
                <p className="font-mono text-emerald-300 tracking-wide mt-0.5">Acc: {config?.accountNumber || '0102030405'}</p>
                {config?.iban && <p className="font-mono text-[10px] text-gray-300 truncate mt-0.5">IBAN: {config.iban}</p>}
              </div>

              {/* Mobile Wallets */}
              <div className="bg-black/30 backdrop-blur rounded-xl p-3 border border-white/10 relative group">
                <div className="flex items-center justify-between font-semibold text-emerald-200 mb-1">
                  <span>📱 EasyPaisa / JazzCash</span>
                  <button
                    onClick={() => copyToClipboard(config?.easypaisaNumber || '03001234567', 'wallet')}
                    className="hover:text-white transition-colors"
                    title="Copy Mobile Number"
                  >
                    {copiedAccount === 'wallet' ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-white font-medium truncate">EasyPaisa: <span className="font-mono text-emerald-300">{config?.easypaisaNumber || '0300-1234567'}</span></p>
                <p className="text-white font-medium truncate mt-0.5">JazzCash: <span className="font-mono text-emerald-300">{config?.jazzcashNumber || '0300-7654321'}</span></p>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          {loading ? (
            <div className="py-12 text-center text-gray-400 text-sm">
              Loading conversation...
            </div>
          ) : (
            <div className="space-y-3.5">
              {booking?.messages?.map((msg: any, index: number) => {
                const isBuyer = msg.sender === 'buyer';
                const isSystem = msg.sender === 'system';

                if (isSystem) {
                  return (
                    <div key={index} className="my-3 flex justify-center">
                      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-300 text-xs px-4 py-2.5 rounded-2xl max-w-lg text-center shadow-sm font-medium leading-relaxed">
                        {msg.text}
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={index}
                    className={`flex flex-col ${isBuyer ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] text-gray-400 font-medium">
                      <span>{msg.senderName || (isBuyer ? 'You' : 'Admin')}</span>
                      <span>•</span>
                      <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    <div
                      className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3.5 shadow-sm text-sm ${
                        isBuyer
                          ? 'bg-[#1E4620] text-white rounded-tr-none'
                          : 'bg-white dark:bg-[#202420] text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-[#2f352f] rounded-tl-none'
                      }`}
                    >
                      {msg.text && <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>}

                      {msg.image && (
                        <div className="mt-2 relative rounded-xl overflow-hidden border border-black/10">
                          <a href={msg.image} target="_blank" rel="noopener noreferrer">
                            <Image
                              src={msg.image}
                              alt="Attachment"
                              width={300}
                              height={200}
                              className="object-cover max-h-60 w-full hover:scale-105 transition-transform cursor-pointer"
                            />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="p-3 bg-white dark:bg-[#181b18] border-t border-gray-200 dark:border-[#292e29] flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={() => setShowUploadModal(true)}
            className="p-2.5 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
            title="Upload Payment Proof"
          >
            <Upload className="w-5 h-5" />
          </button>

          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your message to Admin..."
            className="flex-1 bg-gray-100 dark:bg-[#101210] text-gray-900 dark:text-white text-sm px-4 py-2.5 rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-[#1E4620]"
          />

          <button
            type="submit"
            disabled={sending || !text.trim()}
            className="bg-[#1E4620] hover:bg-green-700 disabled:opacity-50 text-white p-2.5 rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>

      {/* Payment Screenshot Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-white dark:bg-[#1a1e1a] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 dark:border-[#292e29]">
            <div className="flex items-center justify-between mb-4 border-b border-gray-100 dark:border-gray-800 pb-3">
              <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-base">
                <Upload className="w-5 h-5 text-primary" /> Upload Payment Screenshot
              </h3>
              <button onClick={() => setShowUploadModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Payment Receipt Image *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#1E4620] file:text-white hover:file:bg-green-700"
                />
              </div>

              {uploadingImage && (
                <p className="text-xs text-amber-500 animate-pulse">Uploading image preview...</p>
              )}

              {screenshotUrl && (
                <div className="relative h-40 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                  <Image src={screenshotUrl} alt="Preview" fill className="object-contain bg-gray-900" />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Transaction ID / Note (Optional)
                </label>
                <input
                  type="text"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  placeholder="e.g. TRX-987654321"
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sending || !screenshotUrl}
                  className="flex-1 py-2.5 rounded-xl bg-[#1E4620] hover:bg-green-700 disabled:opacity-50 text-white text-sm font-bold shadow-md transition-all"
                >
                  {sending ? 'Submitting...' : 'Submit Proof'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
