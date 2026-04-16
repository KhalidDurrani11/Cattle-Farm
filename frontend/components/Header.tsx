'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from 'next-themes';
import {
  Tractor, Moon, Sun, Menu, X, LogOut, ChevronDown,
  ShieldCheck, Bell, User, Package
} from 'lucide-react';

export default function Header() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/');
    setMenuOpen(false);
  };

  const getRoleBadge = (role: string) => {
    const badges: Record<string, { color: string; label: string }> = {
      farmer: { color: 'bg-green-100 text-green-700', label: 'Farmer' },
      buyer: { color: 'bg-blue-100 text-blue-700', label: 'Buyer' },
      trader: { color: 'bg-purple-100 text-purple-700', label: 'Trader' },
      vet: { color: 'bg-emerald-100 text-emerald-700', label: 'Vet' },
      admin: { color: 'bg-red-100 text-red-700', label: 'Admin' },
    };
    return badges[role] || { color: 'bg-gray-100 text-gray-700', label: role };
  };

  const navLink = (href: string, label: string) => {
    const isActive = pathname === href;
    return (
      <Link
        href={href}
        onClick={() => setMenuOpen(false)}
        className={`font-medium transition-colors ${
          isActive
            ? 'text-primary font-semibold'
            : 'text-gray-600 dark:text-gray-300 hover:text-primary'
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md fixed top-0 w-full z-50 border-b border-gray-100 dark:border-slate-800">
      <nav className="flex justify-between items-center px-4 md:px-8 py-3 max-w-7xl mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-primary/10 p-2 rounded-lg text-primary">
            <Tractor className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            AgriTrade<span className="text-primary">X</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLink('/', 'Home')}
          {navLink('/marketplace', 'Marketplace')}
          {user && navLink('/dashboard', 'Dashboard')}
        </div>

        {/* Right Side */}
        <div className="hidden md:flex items-center gap-4">
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          )}

          {user ? (
            <div className="relative group">
              <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">
                  {user.name?.[0]?.toUpperCase()}
                </div>
                <div className="text-left hidden lg:block">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                  <div className="flex items-center gap-1">
                    <span className={`text-xs px-1.5 py-0.5 rounded ${getRoleBadge(user.role).color}`}>
                      {getRoleBadge(user.role).label}
                    </span>
                    {user.verificationStatus === 'verified' && (
                      <ShieldCheck className="w-3 h-3 text-green-500" />
                    )}
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>

              {/* Dropdown */}
              <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <div className="p-3 border-b border-gray-100 dark:border-slate-700">
                  <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
                <div className="p-2">
                  <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700">
                    <Package className="w-4 h-4" /> Dashboard
                  </Link>
                  <Link href="/dashboard?tab=profile" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700">
                    <User className="w-4 h-4" /> Profile
                  </Link>
                  {user.verificationStatus !== 'verified' && (
                    <Link href="/dashboard?tab=verification" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 text-amber-600">
                      <ShieldCheck className="w-4 h-4" /> Get Verified
                    </Link>
                  )}
                </div>
                <div className="p-2 border-t border-gray-100 dark:border-slate-700">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 w-full"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <Link href="/login" className="btn-primary">
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800">
          <div className="p-4 space-y-3">
            {user && (
              <div className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-slate-800">
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">
                  {user.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="font-medium">{user.name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded ${getRoleBadge(user.role).color}`}>
                    {getRoleBadge(user.role).label}
                  </span>
                </div>
              </div>
            )}
            <Link href="/" className="block py-2" onClick={() => setMenuOpen(false)}>Home</Link>
            <Link href="/marketplace" className="block py-2" onClick={() => setMenuOpen(false)}>Marketplace</Link>
            {user && (
              <Link href="/dashboard" className="block py-2" onClick={() => setMenuOpen(false)}>Dashboard</Link>
            )}
            {user ? (
              <button onClick={handleLogout} className="w-full btn-primary flex items-center justify-center gap-2">
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            ) : (
              <Link href="/login" className="block btn-primary text-center" onClick={() => setMenuOpen(false)}>
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
