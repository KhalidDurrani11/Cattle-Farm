'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { registerUser } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useLang } from '@/context/LanguageContext';
import { AuthResponse } from '@/types';
import { Leaf, Tractor } from 'lucide-react';

export default function RegisterPage() {
  const { login } = useAuth();
  const { t } = useLang();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', role: 'farmer', location: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await registerUser(form) as AuthResponse;
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
          <h1 className="font-serif text-3xl font-bold text-foreground mt-4">{t('reg_title')}</h1>
          <p className="font-sans text-earth-500 mt-2">Join thousands of Pakistani cattle farmers</p>
        </div>

        <div className="glass-card rounded-2xl p-8 shadow-xl">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 p-3 rounded-xl text-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{t('reg_name')} *</label>
              <input name="name" value={form.name} onChange={handleChange} required className="input-field" placeholder="Muhammad Ali" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{t('reg_email')} *</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} required className="input-field ltr-only" placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{t('reg_phone')}</label>
              <input name="phone" value={form.phone} onChange={handleChange} className="input-field ltr-only" placeholder="03001234567" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{t('reg_pass')} *</label>
              <input name="password" type="password" value={form.password} onChange={handleChange} required className="input-field ltr-only" placeholder="••••••••" minLength={6} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">{t('reg_role')}</label>
                <select name="role" value={form.role} onChange={handleChange} className="input-field cursor-pointer">
                  <option value="farmer">{t('role_farmer')}</option>
                  <option value="buyer">{t('role_buyer')}</option>
                  <option value="trader">{t('role_trader')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">{t('reg_location')}</label>
                <input name="location" value={form.location} onChange={handleChange} className="input-field" placeholder="Lahore" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 text-base mt-4 shadow-lg hover:shadow-xl transition-all">
              {loading ? t('loading') : t('reg_btn')}
            </button>
          </form>

          <p className="text-center font-sans text-sm text-earth-500 mt-6">
            {t('reg_have_acc')}{' '}
            <Link href="/login" className="text-primary font-semibold hover:underline">{t('reg_login')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
