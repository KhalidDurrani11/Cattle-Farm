'use client';
import Link from 'next/link';
import { Tractor, Heart, Mail, MapPin, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-surface border-t border-line py-16 px-6 md:px-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        
        {/* Brand */}
        <div className="md:col-span-1">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="bg-primary/10 p-1.5 rounded-lg text-primary">
              <Tractor className="w-5 h-5" />
            </div>
            <span className="font-serif text-xl font-bold tracking-tight text-earth-900 dark:text-white">AgriTrade<span className="text-primary italic">X</span></span>
          </div>
          <p className="text-earth-600 dark:text-earth-400 text-sm mb-6 leading-relaxed">
            Pakistan's premier digital marketplace for authentic, verified, and high-quality livestock. Bridging the gap between rural farmers and national buyers.
          </p>
          <div className="flex items-center gap-1 text-sm text-earth-500 font-medium">
            Made with <Heart className="w-4 h-4 text-red-500 mx-1 animate-pulse" /> in Pakistan
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-sans font-bold text-foreground mb-6 uppercase tracking-wider text-sm">Platform</h4>
          <ul className="space-y-4 text-sm">
            <li><Link href="/" className="text-earth-600 dark:text-earth-400 hover:text-primary transition-colors">Home</Link></li>
            <li><Link href="/marketplace" className="text-earth-600 dark:text-earth-400 hover:text-primary transition-colors">Browse Cattle</Link></li>
            <li><Link href="/register" className="text-earth-600 dark:text-earth-400 hover:text-primary transition-colors">Become a Seller</Link></li>
            <li><Link href="/login" className="text-earth-600 dark:text-earth-400 hover:text-primary transition-colors">Login to Dashboard</Link></li>
          </ul>
        </div>

        {/* Categories */}
        <div>
          <h4 className="font-sans font-bold text-foreground mb-6 uppercase tracking-wider text-sm">Categories</h4>
          <ul className="space-y-4 text-sm">
            <li><Link href="/marketplace?category=Bull" className="text-earth-600 dark:text-earth-400 hover:text-primary transition-colors">Premium Bulls</Link></li>
            <li><Link href="/marketplace?category=Cow" className="text-earth-600 dark:text-earth-400 hover:text-primary transition-colors">Dairy Cows</Link></li>
            <li><Link href="/marketplace?category=Buffalo" className="text-earth-600 dark:text-earth-400 hover:text-primary transition-colors">Nili-Ravi Buffaloes</Link></li>
            <li><Link href="/marketplace?category=Goat" className="text-earth-600 dark:text-earth-400 hover:text-primary transition-colors">Goats & Sheep</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
           <h4 className="font-sans font-bold text-foreground mb-6 uppercase tracking-wider text-sm">Support</h4>
           <ul className="space-y-4 text-sm">
             <li className="flex items-center gap-3 text-earth-600 dark:text-earth-400">
               <Phone className="w-4 h-4 text-primary" /> +92 300 000 0000
             </li>
             <li className="flex items-center gap-3 text-earth-600 dark:text-earth-400">
               <Mail className="w-4 h-4 text-primary" /> support@agritradex.pk
             </li>
             <li className="flex items-center gap-3 text-earth-600 dark:text-earth-400">
               <MapPin className="w-4 h-4 text-primary" /> Lahore, Pakistan
             </li>
           </ul>
        </div>

      </div>

      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-line flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-earth-500 text-xs font-medium">© {new Date().getFullYear()} AgriTradeX. All rights reserved.</p>
        <div className="flex items-center gap-6 text-xs text-earth-500">
          <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
          <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
        </div>
      </div>
    </footer>
  );
}