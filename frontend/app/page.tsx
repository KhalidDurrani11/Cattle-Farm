'use client';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, MapPin, Search, ArrowRight, Leaf, Users, Shield } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="bg-[#FAF8F5] dark:bg-[#1C1917] text-foreground min-h-screen transition-colors duration-300">
      
      {/* Cinematic Hero */}
      <section 
        className="relative min-h-[90svh] flex flex-col items-center justify-center overflow-hidden pt-28 pb-16 bg-cover bg-[center_35%] bg-no-repeat transition-all"
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?q=80&w=2000&auto=format&fit=crop")' }}
      >
        <div className="absolute inset-0 z-0">
          {/* Subtle vignette/gradient to ensure text stands out over the image */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#FAF8F5] dark:from-[#1C1917] via-transparent to-transparent z-10"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-transparent z-10"></div>
          <div className="absolute inset-0 bg-[#5D4037]/10 z-10 mix-blend-multiply"></div>
        </div>
        
        <div className="relative z-20 text-center px-5 sm:px-8 max-w-4xl mx-auto mt-8 md:mt-0 w-full">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1E4620]/90 backdrop-blur-md text-white font-medium text-[13px] sm:text-sm mb-6 shadow-lg border border-white/20 animate-float">
            <Leaf className="w-4 h-4 text-[#8FBC8F]" /> The Premier Livestock Marketplace
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight mb-5 leading-[1.1] text-white drop-shadow-2xl animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            Empowering Pakistan's <br/>
            <span className="text-[#8FBC8F] font-serif italic drop-shadow-lg">Agricultural Heritage.</span>
          </h1>
          <p className="font-sans text-base sm:text-lg md:text-xl text-[#F5F5DC] max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed font-medium drop-shadow-xl animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            Connect directly with verified farmers, access pristine livestock genetics, and secure your transactions across all provinces with pure transparency.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center animate-fade-in-up w-full sm:w-auto" style={{ animationDelay: '600ms' }}>
            <Link href="/marketplace" className="w-full sm:w-auto bg-[#1E4620] hover:bg-[#153316] animate-pulse-glow shadow-xl text-white px-8 py-4 sm:py-3.5 text-base sm:text-lg font-bold rounded-xl flex items-center justify-center gap-2 group transition-all">
              Browse Listings <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/register" className="w-full sm:w-auto px-8 py-4 sm:py-3.5 text-base sm:text-lg font-bold text-white border-2 border-white/60 hover:bg-[#4A2712]/80 rounded-xl backdrop-blur-md transition-all text-center drop-shadow-lg flex items-center justify-center">
              Register as Seller
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="py-24 px-6 md:px-12 bg-[#FAF8F5] dark:bg-[#1C1917] relative z-20 -mt-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-[#292524] p-8 rounded-2xl animate-fade-in-up border border-[#4A2712]/10 shadow-[0_4px_20px_-4px_rgba(74,39,18,0.1)] hover:-translate-y-1 transition-transform" style={{ animationDelay: '100ms' }}>
              <div className="w-14 h-14 bg-[#4A2712]/10 rounded-2xl flex items-center justify-center mb-6 text-[#4A2712]">
                <MapPin className="w-7 h-7" />
              </div>
              <h3 className="font-serif text-2xl font-bold mb-3 text-[#4A2712] dark:text-[#EFEBE9]">Nationwide Network</h3>
              <p className="text-[#5D4037] dark:text-[#D7CCC8] leading-relaxed">Source the healthiest cattle directly from Punjab, Sindh, KPK, and Balochistan. Pure transparency in origin and lineage.</p>
            </div>
            
            <div className="bg-white dark:bg-[#292524] p-8 rounded-2xl animate-fade-in-up border border-[#4A2712]/10 shadow-[0_4px_20px_-4px_rgba(74,39,18,0.1)] hover:-translate-y-1 transition-transform" style={{ animationDelay: '200ms' }}>
              <div className="w-14 h-14 bg-[#1E4620]/10 rounded-2xl flex items-center justify-center mb-6 text-[#1E4620]">
                <Shield className="w-7 h-7" />
              </div>
              <h3 className="font-serif text-2xl font-bold mb-3 text-[#4A2712] dark:text-[#EFEBE9]">Verified Farmers</h3>
              <p className="text-[#5D4037] dark:text-[#D7CCC8] leading-relaxed">Every seller undergoes a stringent verification process. Review agricultural track records, ratings, and health certificates openly.</p>
            </div>
            
            <div className="bg-white dark:bg-[#292524] p-8 rounded-2xl animate-fade-in-up border border-[#4A2712]/10 shadow-[0_4px_20px_-4px_rgba(74,39,18,0.1)] hover:-translate-y-1 transition-transform" style={{ animationDelay: '300ms' }}>
              <div className="w-14 h-14 bg-[#4A2712]/10 rounded-2xl flex items-center justify-center mb-6 text-[#4A2712] dark:text-[#4A2712]">
                <Users className="w-7 h-7" />
              </div>
              <h3 className="font-serif text-2xl font-bold mb-3 text-[#4A2712] dark:text-[#EFEBE9]">Community Trust</h3>
              <p className="text-[#5D4037] dark:text-[#D7CCC8] leading-relaxed">Built for the people. Negotiate directly with livestock owners without aggressive middlemen manipulating market thresholds.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories / Stats */}
      <section className="py-24 bg-[#F2ECE4] dark:bg-[#292524] border-y border-[#5D4037]/20">
        <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
           <h2 className="font-serif text-4xl font-bold mb-4 text-[#5D4037] dark:text-[#EFEBE9]">Livestock Categories</h2>
           <p className="text-[#5D4037] dark:text-[#D7CCC8] max-w-2xl mx-auto mb-16">Find exactly what you need quickly with our standardized classification system.</p>
           
           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {[
                { name: 'Bulls', img: 'https://images.unsplash.com/photo-1549471013-3364d7220b75?w=500&q=80' },
                { name: 'Cows', img: 'https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?w=500&q=80' },
                { name: 'Calves', img: 'https://images.unsplash.com/photo-1545468800-85cc9bc6ecf7?w=500&q=80' },
                { name: 'Buffaloes', img: 'https://images.unsplash.com/photo-1528151833130-1c7c90b6fb89?w=500&q=80' },
                { name: 'Goats', img: 'https://images.unsplash.com/photo-1524024973431-2ad916746881?w=500&q=80' },
                { name: 'Sheep', img: 'https://images.unsplash.com/photo-1484557985045-edf25e08da73?w=500&q=80' }
              ].map((cat, i) => (
                <Link href={`/marketplace?category=${cat.name.replace('es', '')}`} key={cat.name} className={`group relative rounded-2xl overflow-hidden aspect-square border border-[#5D4037]/20 shadow-md hover:shadow-xl hover:border-[#5D4037] transition-all duration-500 animate-fade-in-up flex items-end`} style={{ animationDelay: `${i * 100}ms` }}>
                  <img src={cat.img} alt={cat.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 z-0" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#5D4037]/90 via-[#5D4037]/40 to-transparent z-10"></div>
                  <div className="relative z-20 w-full p-4 text-center">
                    <span className="font-bold text-white text-lg tracking-wide">{cat.name}</span>
                  </div>
                </Link>
              ))}
           </div>
        </div>
      </section>

      {/* Verification Flow Section */}
      <section className="py-24 bg-[#FAF8F5] dark:bg-[#1C1917]">
        <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
          <span className="inline-block px-3 py-1 rounded-full bg-[#8FBC8F]/20 text-[#2E8B57] dark:text-[#8FBC8F] font-semibold text-sm mb-4">Official Verification</span>
          <h2 className="font-serif text-4xl font-bold mb-4 text-[#4E342E] dark:text-[#EFEBE9]">How to Get Verified</h2>
          <p className="text-[#5D4037] dark:text-[#D7CCC8] max-w-2xl mx-auto mb-16">Build instant trust with buyers across Pakistan by verifying your identity and farm details in three simple steps.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto relative">
            <div className="hidden md:block absolute top-1/2 left-[16%] right-[16%] h-0.5 bg-[#795548]/20 -translate-y-1/2 z-0"></div>
            
            <div className="bg-white dark:bg-[#292524] p-8 rounded-2xl relative z-10 border border-[#795548]/10 shadow-sm flex flex-col items-center">
              <div className="w-16 h-16 bg-[#F2ECE4] dark:bg-[#4E342E] text-[#795548] rounded-full flex items-center justify-center font-serif text-2xl font-bold mb-6 border-4 border-[#FAF8F5] dark:border-[#1C1917]">1</div>
              <h3 className="font-bold text-xl mb-3 text-[#4E342E] dark:text-[#EFEBE9]">Create Account</h3>
              <p className="text-center text-[#5D4037] dark:text-[#D7CCC8]">Register as a Seller and complete your basic profile setup.</p>
            </div>

            <div className="bg-white dark:bg-[#292524] p-8 rounded-2xl relative z-10 border border-[#795548]/10 shadow-sm flex flex-col items-center">
              <div className="w-16 h-16 bg-[#F2ECE4] dark:bg-[#4E342E] text-[#795548] rounded-full flex items-center justify-center font-serif text-2xl font-bold mb-6 border-4 border-[#FAF8F5] dark:border-[#1C1917]">2</div>
              <h3 className="font-bold text-xl mb-3 text-[#4E342E] dark:text-[#EFEBE9]">Submit Details</h3>
              <p className="text-center text-[#5D4037] dark:text-[#D7CCC8]">Navigate to your Dashboard &rarr; Verification Tab. Upload your CNIC and farm specifics.</p>
            </div>

            <div className="bg-white dark:bg-[#292524] p-8 rounded-2xl relative z-10 border border-[#795548]/10 shadow-sm flex flex-col items-center">
              <div className="w-16 h-16 bg-[#F2ECE4] dark:bg-[#4E342E] text-[#795548] rounded-full flex items-center justify-center font-serif text-2xl font-bold mb-6 border-4 border-[#FAF8F5] dark:border-[#1C1917]">3</div>
              <h3 className="font-bold text-xl mb-3 text-[#4E342E] dark:text-[#EFEBE9]">Earn Badge</h3>
              <p className="text-center text-[#5D4037] dark:text-[#D7CCC8]">Our admin team validates your documents and grants the green Trust Badge.</p>
            </div>
          </div>
          
          <div className="mt-12">
            <Link href="/dashboard?tab=verification" className="inline-flex items-center gap-2 bg-[#2E8B57] hover:bg-[#1E6945] text-white px-8 py-3.5 rounded-xl font-semibold shadow-md transition-all">
              <ShieldCheck className="w-5 h-5" /> Start Verification Now
            </Link>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="py-32 px-6 md:px-12 relative overflow-hidden bg-[#1C1917]">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1596733430284-f74370602260?q=80&w=2000&auto=format&fit=crop"
            alt="Farming"
            fill
            sizes="100vw"
            className="object-cover opacity-30 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-[#1E4620]/30 mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#1C1917] via-transparent to-[#FAF8F5] dark:to-[#1C1917]"></div>
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10 bg-[#1C1917]/40 backdrop-blur-xl p-12 md:p-20 rounded-[2rem] border border-white/10 shadow-2xl animate-fade-in-up overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent"></div>
          <ShieldCheck className="relative w-20 h-20 text-[#8FBC8F] mx-auto mb-8 drop-shadow-[0_0_15px_rgba(143,188,143,0.5)] animate-float" />
          <h2 className="relative font-serif text-4xl md:text-5xl font-bold mb-6 text-white drop-shadow-xl">Secure Your Livestock Today</h2>
          <p className="relative font-sans text-lg text-[#D7CCC8] mb-10 max-w-2xl mx-auto drop-shadow-md">
            Join thousands of registered buyers and sellers shaping the future of Pakistan's digital agricultural economy. 
          </p>
          <Link href="/register" className="relative inline-flex bg-[#1E4620] hover:bg-[#153316] text-white text-lg px-12 py-4 rounded-xl font-bold shadow-[0_0_20px_rgba(30,70,32,0.4)] transition-all animate-pulse-glow">
            Create Free Account
          </Link>
        </div>
      </section>
    </div>
  );
}
