'use client';
import Link from 'next/link';
import { Heart, Mail, MapPin, Phone } from 'lucide-react';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="bg-[#111311] text-[#FAF8F5] border-t border-[#292e29] py-16 px-6 md:px-12 transition-colors duration-500">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        
        {/* Brand */}
        <div className="md:col-span-1">
          <div className="mb-6">
            <Logo showText={true} textClassName="text-xl font-bold tracking-tight text-white leading-tight" />
          </div>
          <p className="text-[#a8a29e] text-sm mb-6 leading-relaxed">
            Pakistan's premier digital marketplace for authentic, verified, and high-quality livestock. Bridging the gap between rural farmers and national buyers.
          </p>
          <div className="flex items-center gap-1 text-sm text-[#78716c] font-medium">
            Made with <Heart className="w-4 h-4 text-red-500 mx-1 animate-pulse" /> in Pakistan
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-sans font-bold text-white mb-6 uppercase tracking-wider text-sm">Platform</h4>
          <ul className="space-y-4 text-sm">
            <li><Link href="/" className="text-[#a8a29e] hover:text-[#8FBC8F] transition-colors">Home</Link></li>
            <li><Link href="/marketplace" className="text-[#a8a29e] hover:text-[#8FBC8F] transition-colors">Browse Cattle</Link></li>
            <li><Link href="/register" className="text-[#a8a29e] hover:text-[#8FBC8F] transition-colors">Become a Seller</Link></li>
            <li><Link href="/login" className="text-[#a8a29e] hover:text-[#8FBC8F] transition-colors">Login to Dashboard</Link></li>
          </ul>
        </div>

        {/* Categories */}
        <div>
          <h4 className="font-sans font-bold text-white mb-6 uppercase tracking-wider text-sm">Categories</h4>
          <ul className="space-y-4 text-sm">
            <li><Link href="/marketplace?category=Bull" className="text-[#a8a29e] hover:text-[#8FBC8F] transition-colors">Premium Bulls</Link></li>
            <li><Link href="/marketplace?category=Cow" className="text-[#a8a29e] hover:text-[#8FBC8F] transition-colors">Dairy Cows</Link></li>
            <li><Link href="/marketplace?category=Buffalo" className="text-[#a8a29e] hover:text-[#8FBC8F] transition-colors">Nili-Ravi Buffaloes</Link></li>
            <li><Link href="/marketplace?category=Goat" className="text-[#a8a29e] hover:text-[#8FBC8F] transition-colors">Goats & Sheep</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
           <h4 className="font-sans font-bold text-white mb-6 uppercase tracking-wider text-sm">Support</h4>
           <ul className="space-y-4 text-sm">
             <li className="flex items-center gap-3 text-[#a8a29e]">
               <Phone className="w-4 h-4 text-[#8FBC8F]" /> +92 300 000 0000
             </li>
             <li className="flex items-center gap-3 text-[#a8a29e]">
               <Mail className="w-4 h-4 text-[#8FBC8F]" /> support@cattletrading.pk
             </li>
             <li className="flex items-center gap-3 text-[#a8a29e]">
               <MapPin className="w-4 h-4 text-[#8FBC8F]" /> Lahore, Pakistan
             </li>
           </ul>
        </div>

      </div>

      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-[#292e29] flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-[#a8a29e] text-xs font-medium">© {new Date().getFullYear()} Cattle Farm Trading. All rights reserved.</p>
        <div className="flex items-center gap-6 text-xs text-[#a8a29e]">
          <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
        </div>
      </div>
    </footer>
  );
}
