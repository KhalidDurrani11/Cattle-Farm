'use client';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, MapPin, Search, ArrowRight, Leaf, Users, Shield } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="bg-[#FAF8F5] dark:bg-[#1C1917] text-foreground min-h-screen transition-colors duration-300">
      
      {/* Cinematic Hero */}
      <section className="relative h-[95vh] flex flex-col items-center justify-center overflow-hidden pt-32">
        <div className="absolute inset-0 z-0 bg-[#3E2723]">
          <Image
            alt="Pakistani Cattle"
            className="object-cover opacity-60 mix-blend-overlay hover:scale-105 transition-transform duration-[3000ms]"
            src="https://images.unsplash.com/photo-1546445317-29f4545e9d53?q=80&w=2000&auto=format&fit=crop"
            fill
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#FAF8F5] dark:from-[#1C1917] via-transparent to-transparent z-10"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-transparent z-10"></div>
        </div>
        
        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto animate-fade-in-up mt-12 md:mt-0">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#8B5A2B]/80 text-white font-medium text-sm mb-6 shadow-md border border-white/20">
            <Leaf className="w-4 h-4 text-[#8FBC8F]" /> The Premier Livestock Marketplace
          </span>
          <h1 className="font-serif text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight text-white drop-shadow-lg">
            Empowering Pakistan's <br/>
            <span className="text-[#87CEEB] font-serif italic drop-shadow-md">Agricultural Heritage.</span>
          </h1>
          <p className="font-sans text-lg md:text-xl text-[#F5F5DC] max-w-2xl mx-auto mb-10 leading-relaxed font-medium drop-shadow-md">
            Connect directly with verified farmers, access pristine livestock genetics, and secure your transactions across all provinces with pure transparency.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/marketplace" className="w-full sm:w-auto bg-[#8B5A2B] hover:bg-[#6B4423] shadow-lg text-white px-8 py-3.5 text-lg font-semibold rounded-xl flex items-center justify-center gap-2 group transition-all">
              Browse Listings <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/register" className="w-full sm:w-auto px-8 py-3.5 text-lg font-semibold text-white border-2 border-white/40 hover:bg-white/20 rounded-xl backdrop-blur-md transition-all text-center drop-shadow-md">
              Register as Seller
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="py-24 px-6 md:px-12 bg-[#FAF8F5] dark:bg-[#1C1917] relative z-20 -mt-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-[#292524] p-8 rounded-2xl animate-fade-in-up border border-[#8B5A2B]/10 shadow-[0_4px_20px_-4px_rgba(139,90,43,0.1)]" style={{ animationDelay: '100ms' }}>
              <div className="w-14 h-14 bg-[#8B5A2B]/10 rounded-2xl flex items-center justify-center mb-6 text-[#8B5A2B]">
                <MapPin className="w-7 h-7" />
              </div>
              <h3 className="font-serif text-2xl font-bold mb-3 text-[#3E2723] dark:text-[#EFEBE9]">Nationwide Network</h3>
              <p className="text-[#5D4037] dark:text-[#D7CCC8] leading-relaxed">Source the healthiest cattle directly from Punjab, Sindh, KPK, and Balochistan. Pure transparency in origin and lineage.</p>
            </div>
            
            <div className="bg-white dark:bg-[#292524] p-8 rounded-2xl animate-fade-in-up border border-[#8B5A2B]/10 shadow-[0_4px_20px_-4px_rgba(139,90,43,0.1)]" style={{ animationDelay: '200ms' }}>
              <div className="w-14 h-14 bg-[#87CEEB]/20 rounded-2xl flex items-center justify-center mb-6 text-[#0284C7] dark:text-[#38BDF8]">
                <Shield className="w-7 h-7" />
              </div>
              <h3 className="font-serif text-2xl font-bold mb-3 text-[#3E2723] dark:text-[#EFEBE9]">Verified Farmers</h3>
              <p className="text-[#5D4037] dark:text-[#D7CCC8] leading-relaxed">Every seller undergoes a stringent verification process. Review agricultural track records, ratings, and health certificates openly.</p>
            </div>
            
            <div className="bg-white dark:bg-[#292524] p-8 rounded-2xl animate-fade-in-up border border-[#8B5A2B]/10 shadow-[0_4px_20px_-4px_rgba(139,90,43,0.1)]" style={{ animationDelay: '300ms' }}>
              <div className="w-14 h-14 bg-[#8FBC8F]/30 rounded-2xl flex items-center justify-center mb-6 text-[#2E8B57] dark:text-[#8FBC8F]">
                <Users className="w-7 h-7" />
              </div>
              <h3 className="font-serif text-2xl font-bold mb-3 text-[#3E2723] dark:text-[#EFEBE9]">Community Trust</h3>
              <p className="text-[#5D4037] dark:text-[#D7CCC8] leading-relaxed">Built for the people. Negotiate directly with livestock owners without aggressive middlemen manipulating market thresholds.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories / Stats */}
      <section className="py-24 bg-[#F2ECE4] dark:bg-[#292524] border-y border-[#8B5A2B]/20">
        <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
           <h2 className="font-serif text-4xl font-bold mb-4 text-[#3E2723] dark:text-[#EFEBE9]">Livestock Categories</h2>
           <p className="text-[#5D4037] dark:text-[#D7CCC8] max-w-2xl mx-auto mb-16">Find exactly what you need quickly with our standardized classification system.</p>
           
           <div className="flex flex-wrap justify-center gap-4">
              {['Bulls', 'Cows', 'Calves', 'Buffaloes', 'Goats', 'Sheep'].map((cat, i) => (
                <Link href={`/marketplace?category=${cat.replace('es', '')}`} key={cat} className={`px-8 py-4 rounded-xl border border-[#8B5A2B]/20 bg-white dark:bg-[#1C1917] hover:border-[#8B5A2B] hover:shadow-md transition-all duration-300 animate-fade-in-up`} style={{ animationDelay: `${i * 100}ms` }}>
                  <span className="font-semibold text-[#8B5A2B] dark:text-[#D7CCC8] tracking-wide">{cat}</span>
                </Link>
              ))}
           </div>
        </div>
      </section>

      {/* Verification Flow Section */}
      <section className="py-24 bg-[#FAF8F5] dark:bg-[#1C1917]">
        <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
          <span className="inline-block px-3 py-1 rounded-full bg-[#8FBC8F]/20 text-[#2E8B57] dark:text-[#8FBC8F] font-semibold text-sm mb-4">Official Verification</span>
          <h2 className="font-serif text-4xl font-bold mb-4 text-[#3E2723] dark:text-[#EFEBE9]">How to Get Verified</h2>
          <p className="text-[#5D4037] dark:text-[#D7CCC8] max-w-2xl mx-auto mb-16">Build instant trust with buyers across Pakistan by verifying your identity and farm details in three simple steps.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto relative">
            <div className="hidden md:block absolute top-1/2 left-[16%] right-[16%] h-0.5 bg-[#8B5A2B]/20 -translate-y-1/2 z-0"></div>
            
            <div className="bg-white dark:bg-[#292524] p-8 rounded-2xl relative z-10 border border-[#8B5A2B]/10 shadow-sm flex flex-col items-center">
              <div className="w-16 h-16 bg-[#F2ECE4] dark:bg-[#3E2723] text-[#8B5A2B] rounded-full flex items-center justify-center font-serif text-2xl font-bold mb-6 border-4 border-[#FAF8F5] dark:border-[#1C1917]">1</div>
              <h3 className="font-bold text-xl mb-3 text-[#3E2723] dark:text-[#EFEBE9]">Create Account</h3>
              <p className="text-center text-[#5D4037] dark:text-[#D7CCC8]">Register as a Seller and complete your basic profile setup.</p>
            </div>

            <div className="bg-white dark:bg-[#292524] p-8 rounded-2xl relative z-10 border border-[#8B5A2B]/10 shadow-sm flex flex-col items-center">
              <div className="w-16 h-16 bg-[#F2ECE4] dark:bg-[#3E2723] text-[#8B5A2B] rounded-full flex items-center justify-center font-serif text-2xl font-bold mb-6 border-4 border-[#FAF8F5] dark:border-[#1C1917]">2</div>
              <h3 className="font-bold text-xl mb-3 text-[#3E2723] dark:text-[#EFEBE9]">Submit Details</h3>
              <p className="text-center text-[#5D4037] dark:text-[#D7CCC8]">Navigate to your Dashboard &rarr; Verification Tab. Upload your CNIC and farm specifics.</p>
            </div>

            <div className="bg-white dark:bg-[#292524] p-8 rounded-2xl relative z-10 border border-[#8B5A2B]/10 shadow-sm flex flex-col items-center">
              <div className="w-16 h-16 bg-[#F2ECE4] dark:bg-[#3E2723] text-[#8B5A2B] rounded-full flex items-center justify-center font-serif text-2xl font-bold mb-6 border-4 border-[#FAF8F5] dark:border-[#1C1917]">3</div>
              <h3 className="font-bold text-xl mb-3 text-[#3E2723] dark:text-[#EFEBE9]">Earn Badge</h3>
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
      <section className="py-32 px-6 md:px-12 relative overflow-hidden bg-[#3E2723]">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1596733430284-f74370602260?q=80&w=2000&auto=format&fit=crop"
            alt="Farming"
            fill
            sizes="100vw"
            className="object-cover opacity-20 dark:opacity-10 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-[#8B5A2B]/20 mix-blend-multiply"></div>
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10 bg-white/10 dark:bg-black/20 backdrop-blur-md p-12 md:p-20 rounded-[2rem] border border-white/20 shadow-2xl">
          <ShieldCheck className="w-20 h-20 text-[#8FBC8F] mx-auto mb-8 drop-shadow-md" />
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6 text-white drop-shadow-lg">Secure Your Livestock Today</h2>
          <p className="font-sans text-lg text-[#F5F5DC] mb-10 max-w-2xl mx-auto drop-shadow">
            Join thousands of registered buyers and sellers shaping the future of Pakistan's digital agricultural economy. 
          </p>
          <Link href="/register" className="bg-[#8B5A2B] hover:bg-[#6B4423] text-white text-lg px-12 py-4 rounded-xl font-bold shadow-xl transition-all">
            Create Free Account
          </Link>
        </div>
      </section>
    </div>
  );
}
