'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { loginUser, verifyLoginOtp } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useLang } from '@/context/LanguageContext';
import { Tractor, Loader2, Eye, EyeOff, ShieldCheck, Mail, Lock, KeyRound } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const { login, user } = useAuth();
  const { t } = useLang();
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('registered') === 'true') {
        setSuccessMsg('Account created successfully! Please sign in using your credentials to continue.');
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const data = await loginUser(email, password);
      if (data.requiresOtp) {
        setSuccessMsg(data.message || 'OTP verification code sent to your email.');
        setStep(2);
      } else if (data.token && data.user) {
        login(data.token, data.user);
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || t('error'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await verifyLoginOtp(email, otp);
      login(data.token, data.user);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || t('error'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/social-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: credentialResponse.credential, provider: 'Google' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Google login failed');
      
      login(data.token, data.user);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Google login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#111311] flex items-center justify-center p-4 py-28 transition-colors duration-500 relative overflow-hidden">
      {/* Decorative floating blurred gradient blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#166534]/10 dark:bg-[#22c55e]/5 rounded-full blur-3xl pointer-events-none animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#ca8a04]/10 dark:bg-[#ca8a04]/5 rounded-full blur-3xl pointer-events-none animate-float" style={{ animationDelay: '2s' }} />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', duration: 0.8 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary border border-primary/20 shadow-md cursor-pointer"
          >
             <Tractor className="w-8 h-8" />
          </motion.div>
          <h1 className="font-serif text-3xl font-extrabold tracking-tight text-gray-950 dark:text-white">{t('login_title')}</h1>
          <p className="font-sans text-gray-500 mt-2 text-sm">Cattle Trading — Pakistan Cattle Marketplace</p>
        </div>

        <div className="bg-white/70 dark:bg-[#181b18]/70 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-[#1E4620]/10 dark:border-[#292e29] hover:border-primary/20 transition-all duration-300">
          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 p-3 rounded-xl text-sm mb-4"
            >
              {error}
            </motion.div>
          )}
          {successMsg && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 p-3 rounded-xl text-sm mb-4 font-medium"
            >
              {successMsg}
            </motion.div>
          )}

          {step === 1 ? (
            <div className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">{t('login_email')} *</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email" value={email} onChange={e => setEmail(e.target.value)}
                      required className="w-full bg-white dark:bg-[#111311] border border-[#1E4620]/15 dark:border-[#292e29] text-foreground rounded-2xl pl-11 pr-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all ltr-only" placeholder="you@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">{t('login_pass')} *</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                      required className="w-full bg-white dark:bg-[#111311] border border-[#1E4620]/15 dark:border-[#292e29] text-foreground rounded-2xl pl-11 pr-10 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all ltr-only" placeholder="••••••••"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-foreground">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <div className="text-right mt-1">
                    <Link href="/forgot-password" className="text-sm text-primary hover:underline font-medium">Forgot Password?</Link>
                  </div>
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base mt-2 shadow-[0_10px_20px_rgba(22,101,52,0.15)] hover:shadow-[0_15px_25px_rgba(22,101,52,0.25)] hover:scale-[1.01] active:scale-95 transition-all font-bold rounded-2xl flex items-center justify-center">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : t('login_btn')}
                </button>
              </form>

              <div className="relative flex items-center justify-center my-4">
                <div className="border-t border-[#1E4620]/10 dark:border-[#292e29] w-full"></div>
                <span className="absolute bg-white dark:bg-[#181b18] px-3 text-[10px] text-gray-400 tracking-wider font-semibold">OR CONTINUE WITH</span>
              </div>

              {/* Social Login Buttons */}
              <div className="flex justify-center mt-4 border border-[#1E4620]/10 dark:border-[#292e29] rounded-2xl p-2 bg-white/50 dark:bg-black/10">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError('Google login failed.')}
                  useOneTap
                  theme="filled_black"
                  shape="rectangular"
                  size="large"
                  text="signin_with"
                />
              </div>
            </div>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Enter Verification Code</label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text" value={otp} onChange={e => setOtp(e.target.value)}
                    required className="w-full bg-white dark:bg-[#111311] border border-[#1E4620]/15 dark:border-[#292e29] text-foreground rounded-2xl pl-11 pr-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all ltr-only text-center tracking-widest text-lg font-bold" placeholder="123456" maxLength={6}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center leading-relaxed">
                  We have sent a 6-digit verification code to <span className="font-semibold">{email}</span>. Please check your inbox and enter it above.
                </p>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base mt-2 shadow-[0_10px_20px_rgba(22,101,52,0.15)] hover:shadow-[0_15px_25px_rgba(22,101,52,0.25)] hover:scale-[1.01] active:scale-95 transition-all font-bold rounded-2xl flex items-center justify-center">
                {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : 'Verify & Continue'}
              </button>
              <button type="button" onClick={() => setStep(1)} className="w-full text-center text-sm text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors font-medium mt-2">
                ← Back to Login
              </button>
            </form>
          )}

          <div className="text-center mt-6 text-sm text-gray-500 dark:text-gray-400">
            {t('login_no_acc')}{' '}
            <Link href="/register" className="text-primary hover:underline font-bold">
              {t('login_reg')}
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
