'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { loginUser } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useLang } from '@/context/LanguageContext';
import { AuthResponse } from '@/types';
import { Tractor } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const { t } = useLang();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await loginUser(email, password) as AuthResponse;
      login(data.token, data.user);
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('error'));
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
          <p className="font-sans text-earth-500 mt-2">AgriTradeX — Pakistan Cattle Marketplace</p>
        </div>

        <div className="glass-card rounded-2xl p-8 shadow-xl">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 p-3 rounded-xl text-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{t('login_email')}</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                required className="input-field ltr-only" placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{t('login_pass')}</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                required className="input-field ltr-only" placeholder="••••••••"
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 text-base mt-6 shadow-lg hover:shadow-xl transition-all">
              {loading ? t('loading') : t('login_btn')}
            </button>
          </form>

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
