'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Tractor, Loader2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send OTP.');
      setSuccess(data.message || 'OTP sent to your email.');
      setStep(2);
    } catch (err: any) {
      setError(err.message || 'Error sending OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to reset password.');
      setSuccess(data.message || 'Password reset successful!');
      setTimeout(() => router.push('/login'), 2000);
    } catch (err: any) {
      setError(err.message || 'Error resetting password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 py-24">
      <div className="w-full max-w-md relative z-10 animate-fade-in-up">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary border border-primary/20">
             <Tractor className="w-10 h-10" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-foreground mt-4">Reset Password</h1>
        </div>

        <div className="glass-card rounded-2xl p-8 shadow-xl bg-white/95 border border-line">
          {error && <div className="bg-red-500/10 text-red-600 p-3 rounded-xl text-sm mb-4">{error}</div>}
          {success && <div className="bg-green-500/10 text-green-600 p-3 rounded-xl text-sm mb-4">{success}</div>}

          {step === 1 ? (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Email Address *</label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  required className="input-field ltr-only" placeholder="you@example.com"
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
                {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : 'Send Reset Code'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Verification Code (OTP) *</label>
                <input
                  type="text" value={otp} onChange={e => setOtp(e.target.value)}
                  required className="input-field text-center tracking-widest text-lg font-bold" maxLength={6}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">New Password *</label>
                <input
                  type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                  required minLength={6} className="input-field" placeholder="••••••••"
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
                {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : 'Confirm Password Reset'}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link href="/login" className="text-sm text-primary hover:underline font-medium">Back to Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
