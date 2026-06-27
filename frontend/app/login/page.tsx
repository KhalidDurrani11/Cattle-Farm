'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { loginUser, verifyLoginOtp } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useLang } from '@/context/LanguageContext';
import { Tractor, Loader2, Eye, EyeOff } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

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
      // Send the ID token to our backend for verification
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4 py-24 transition-colors duration-300">
      <div className="absolute inset-0 z-0 bg-primary/5 pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10 animate-fade-in-up">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary border border-primary/20">
             <Tractor className="w-10 h-10" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-foreground mt-4">{t('login_title')}</h1>
          <p className="font-sans text-earth-500 mt-2">Cattle Farm Trading — Pakistan Cattle Marketplace</p>
        </div>

        <div className="glass-card rounded-2xl p-8 shadow-xl bg-white/95 dark:bg-[#181b18]/95 border border-line">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 p-3 rounded-xl text-sm mb-4">
              {error}
            </div>
          )}
          {successMsg && (
            <div className="bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 p-3 rounded-xl text-sm mb-4 font-medium">
              {successMsg}
            </div>
          )}

          {step === 1 ? (
            <div className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">{t('login_email')} *</label>
                  <input
                    type="email" value={email} onChange={e => setEmail(e.target.value)}
                    required className="input-field ltr-only" placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">{t('login_pass')} *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                      required className="input-field ltr-only w-full pr-10" placeholder="••••••••"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-earth-500 hover:text-foreground">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <div className="text-right mt-1">
                    <Link href="/forgot-password" className="text-sm text-primary hover:underline font-medium">Forgot Password?</Link>
                  </div>
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 text-base mt-2 shadow-lg hover:shadow-xl transition-all font-semibold">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : t('login_btn')}
                </button>
              </form>

              <div className="relative flex items-center justify-center my-4">
                <div className="border-t border-line w-full"></div>
                <span className="absolute bg-white dark:bg-[#181b18] px-3 text-xs text-muted font-medium">OR CONTINUE WITH</span>
              </div>

              {/* Social Login Buttons */}
              <div className="flex justify-center mt-4">
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
                <label className="block text-sm font-medium text-foreground mb-1">Enter Verification Code</label>
                <input
                  type="text" value={otp} onChange={e => setOtp(e.target.value)}
                  required className="input-field ltr-only text-center tracking-widest text-lg font-bold" placeholder="123456" maxLength={6}
                />
                <p className="text-xs text-muted mt-2 text-center">We have sent a 6-digit code to {email}. If you are hosting locally, check your terminal logs for the code.</p>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 text-base mt-2 shadow-lg hover:shadow-xl transition-all font-semibold">
                {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : 'Verify & Login'}
              </button>
              <button type="button" onClick={() => setStep(1)} className="w-full text-center text-sm text-earth-500 mt-4 hover:text-primary transition-colors">
                Back to Login
              </button>
            </form>
          )}

          <p className="text-center font-sans text-sm text-earth-500 mt-6">
            {t('login_no_acc')}{' '}
            <Link href="/register" className="text-primary font-semibold hover:underline">
              {t('login_reg')}
            </Link>
          </p>
        </div>
      </div>

    </div>
  );
}
