'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { registerUser } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useLang } from '@/context/LanguageContext';
import { Tractor, Eye, EyeOff } from 'lucide-react';
import { PROVINCES, CITIES_BY_PROVINCE } from '@/lib/cities';

export default function RegisterPage() {
  const { user } = useAuth();
  const { t } = useLang();
  const router = useRouter();
  
  const [countryType, setCountryType] = useState('Pakistan');
  const [form, setForm] = useState({ 
    name: '', email: '', phone: '', password: '', role: 'farmer', 
    location: '', province: '', district: '' 
  });
  const [error, setError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setCountryType(val);
    if (val === 'International') {
      setForm(p => ({ ...p, province: '', district: '', location: '' }));
    } else {
      setForm(p => ({ ...p, province: '', district: '', location: '' }));
    }
  };

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setForm(p => ({ ...p, province: e.target.value, district: '', location: '' }));
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setForm(p => ({ ...p, district: e.target.value, location: e.target.value }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (e.target.name === 'phone') {
      let val = e.target.value.replace(/[^\d+]/g, '');
      if (val.startsWith('03')) {
        val = val.substring(0, 11);
      } else if (val.startsWith('+923')) {
        val = val.substring(0, 13);
      } else if (val.startsWith('92')) {
        val = val.substring(0, 12);
      } else if (countryType === 'Pakistan' && !val.startsWith('+') && !val.startsWith('0')) {
        val = val.substring(0, 11);
      }
      setForm(p => ({ ...p, phone: val }));
      setPhoneError('');
    } else {
      setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setPhoneError('');

    // Strict Phone Validation for Pakistan
    if (countryType === 'Pakistan') {
      const isLocalFormat = form.phone.startsWith('03') && form.phone.length === 11;
      const isPlusFormat = form.phone.startsWith('+923') && form.phone.length === 13;
      const isCountryCodeFormat = form.phone.startsWith('923') && form.phone.length === 12;

      if (!isLocalFormat && !isPlusFormat && !isCountryCodeFormat) {
        setPhoneError('Please enter a valid 11-digit Pakistani number starting with 03 or +923');
        setLoading(false);
        return;
      }
    } else {
      if (!form.phone.startsWith('+')) {
        setPhoneError('International numbers must start with + followed by country code');
        setLoading(false);
        return;
      }
      if (form.phone.length < 8) {
        setPhoneError('Phone number is too short');
        setLoading(false);
        return;
      }
    }

    try {
      await registerUser(form);
      // Redirect to login explicitly instead of auto-login
      router.push('/login?registered=true');
    } catch (err: any) {
      setError(err.message || t('error'));
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

        <div className="glass-card rounded-2xl p-8 shadow-xl bg-white/95 dark:bg-[#181b18]/95 border border-line">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 p-3 rounded-xl text-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{t('reg_name')} *</label>
              <input name="name" value={form.name} onChange={handleChange} required className="input-field animate-fade-in" placeholder="Muhammad Ali" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{t('reg_email')} *</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} required className="input-field ltr-only" placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Phone Number (WhatsApp) *</label>
              <input 
                name="phone" 
                value={form.phone} 
                onChange={handleChange} 
                required
                className={`input-field ltr-only ${phoneError ? 'border-red-500 bg-red-500/5' : ''}`} 
                placeholder="03001234567 or +923001234567" 
                maxLength={15}
              />
              {phoneError && <p className="text-red-500 text-xs mt-1 font-medium">{phoneError}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{t('reg_pass')} *</label>
              <div className="relative">
                <input name="password" type={showPassword ? "text" : "password"} value={form.password} onChange={handleChange} required className="input-field ltr-only w-full pr-10" placeholder="••••••••" minLength={6} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-earth-500 hover:text-foreground">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
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
                <label className="block text-sm font-medium text-foreground mb-1">Country</label>
                <select value={countryType} onChange={handleCountryChange} className="input-field cursor-pointer">
                  <option value="Pakistan">Pakistan</option>
                  <option value="International">International</option>
                </select>
              </div>
            </div>

            {countryType === 'Pakistan' ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Province *</label>
                  <select name="province" value={form.province} onChange={handleProvinceChange} required className="input-field cursor-pointer">
                    <option value="">Select Province</option>
                    {PROVINCES.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">City/District *</label>
                  <select name="district" value={form.district} onChange={handleCityChange} className="input-field cursor-pointer" required disabled={!form.province}>
                    <option value="" disabled>Select City</option>
                    {form.province && CITIES_BY_PROVINCE[form.province as keyof typeof CITIES_BY_PROVINCE]?.map((c: string) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Country Name *</label>
                <input name="location" value={form.location} onChange={handleChange} required className="input-field" placeholder="United Arab Emirates" />
              </div>
            )}
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 text-base mt-4 shadow-lg hover:shadow-xl transition-all font-semibold">
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
