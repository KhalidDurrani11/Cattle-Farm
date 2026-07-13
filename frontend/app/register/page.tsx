'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { registerUser } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useLang } from '@/context/LanguageContext';
import { Tractor, Eye, EyeOff, Loader2, User, Mail, Phone, Lock, Globe, MapPin } from 'lucide-react';
import { PROVINCES, CITIES_BY_PROVINCE } from '@/lib/cities';
import { motion } from 'framer-motion';

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
      router.push('/login?registered=true');
    } catch (err: any) {
      setError(err.message || t('error'));
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
            whileHover={{ scale: 1.05, rotate: -5 }}
            className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary border border-primary/20 shadow-md cursor-pointer"
          >
             <Tractor className="w-8 h-8" />
          </motion.div>
          <h1 className="font-serif text-3xl font-extrabold tracking-tight text-gray-950 dark:text-white">{t('reg_title')}</h1>
          <p className="font-sans text-gray-500 mt-2 text-sm">Join thousands of Pakistani cattle farmers</p>
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">{t('reg_name')} *</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input name="name" value={form.name} onChange={handleChange} required className="w-full bg-white dark:bg-[#111311] border border-[#1E4620]/15 dark:border-[#292e29] text-foreground rounded-2xl pl-11 pr-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" placeholder="Muhammad Ali" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">{t('reg_email')} *</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input name="email" type="email" value={form.email} onChange={handleChange} required className="w-full bg-white dark:bg-[#111311] border border-[#1E4620]/15 dark:border-[#292e29] text-foreground rounded-2xl pl-11 pr-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all ltr-only" placeholder="you@example.com" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Phone Number (WhatsApp) *</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  name="phone" 
                  value={form.phone} 
                  onChange={handleChange} 
                  required
                  className={`w-full bg-white dark:bg-[#111311] border border-[#1E4620]/15 dark:border-[#292e29] text-foreground rounded-2xl pl-11 pr-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all ltr-only ${phoneError ? 'border-red-500 bg-red-500/5' : ''}`} 
                  placeholder="03001234567 or +923001234567" 
                  maxLength={15}
                />
              </div>
              {phoneError && <p className="text-red-500 text-xs mt-1 font-medium">{phoneError}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">{t('reg_pass')} *</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input name="password" type={showPassword ? "text" : "password"} value={form.password} onChange={handleChange} required className="w-full bg-white dark:bg-[#111311] border border-[#1E4620]/15 dark:border-[#292e29] text-foreground rounded-2xl pl-11 pr-10 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all ltr-only" placeholder="••••••••" minLength={6} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-foreground">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">{t('reg_role')}</label>
                <select name="role" value={form.role} onChange={handleChange} className="w-full bg-white dark:bg-[#111311] border border-[#1E4620]/15 dark:border-[#292e29] text-foreground rounded-2xl px-3 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all cursor-pointer">
                  <option value="farmer">{t('role_farmer')}</option>
                  <option value="buyer">{t('role_buyer')}</option>
                  <option value="trader">{t('role_trader')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Country</label>
                <select value={countryType} onChange={handleCountryChange} className="w-full bg-white dark:bg-[#111311] border border-[#1E4620]/15 dark:border-[#292e29] text-foreground rounded-2xl px-3 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all cursor-pointer">
                  <option value="Pakistan">Pakistan</option>
                  <option value="International">International</option>
                </select>
              </div>
            </div>

            {countryType === 'Pakistan' ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Province *</label>
                  <select name="province" value={form.province} onChange={handleProvinceChange} required className="w-full bg-white dark:bg-[#111311] border border-[#1E4620]/15 dark:border-[#292e29] text-foreground rounded-2xl px-3 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all cursor-pointer">
                    <option value="">Province</option>
                    {PROVINCES.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">City/District *</label>
                  <select name="district" value={form.district} onChange={handleCityChange} className="w-full bg-white dark:bg-[#111311] border border-[#1E4620]/15 dark:border-[#292e29] text-foreground rounded-2xl px-3 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all cursor-pointer" required disabled={!form.province}>
                    <option value="" disabled>City</option>
                    {form.province && CITIES_BY_PROVINCE[form.province as keyof typeof CITIES_BY_PROVINCE]?.map((c: string) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Country Name *</label>
                <div className="relative">
                  <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input name="location" value={form.location} onChange={handleChange} required className="w-full bg-white dark:bg-[#111311] border border-[#1E4620]/15 dark:border-[#292e29] text-foreground rounded-2xl pl-11 pr-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" placeholder="United Arab Emirates" />
                </div>
              </div>
            )}
            
            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base mt-4 shadow-[0_10px_20px_rgba(22,101,52,0.15)] hover:shadow-[0_15px_25px_rgba(22,101,52,0.25)] hover:scale-[1.01] active:scale-95 transition-all font-bold rounded-2xl flex items-center justify-center">
              {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : t('reg_btn')}
            </button>
          </form>

          <p className="text-center font-sans text-sm text-gray-500 dark:text-gray-400 mt-6">
            {t('reg_have_acc')}{' '}
            <Link href="/login" className="text-primary font-bold hover:underline">{t('reg_login')}</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
