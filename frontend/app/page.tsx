'use client';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, MapPin, Search, ArrowRight, Leaf, Users, Shield } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="bg-background text-foreground min-h-screen transition-colors duration-300">
      
      {/* Cinematic Hero */}
      <section className="relative h-[90vh] flex flex-col items-center justify-center overflow-hidden hero-gradient-dark pt-16">
        <div className="absolute inset-0 z-0 bg-earth-900">
          <Image
            alt="Pakistani Cattle"
            className="object-cover opacity-40 hover:opacity-50 mix-blend-overlay transition-all duration-[2000ms]"
            src="https://images.unsplash.com/photo-1546445317-29f4545e9d53?q=80&w=2000&auto=format&fit=crop"
            fill
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent z-10"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent z-10"></div>
        </div>
        
        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto animate-fade-in-up">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-medium text-sm mb-6">
            <Leaf className="w-4 h-4" /> The Premier Livestock Marketplace
          </span>
          <h1 className="font-serif text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight text-white drop-shadow-lg">
            Empowering Pakistan's <br/>
            <span className="text-primary-400 font-serif italic">Agricultural Heritage.</span>
          </h1>
          <p className="font-sans text-lg md:text-xl text-earth-100 max-w-2xl mx-auto mb-10 leading-relaxed font-medium drop-shadow-md">
            Connect directly with verified farmers, access pristine livestock genetics, and secure your transactions across all provinces with pure transparency.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/marketplace" className="w-full sm:w-auto btn-primary px-8 py-3.5 text-lg flex items-center justify-center gap-2 group">
              Browse Listings <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/register" className="w-full sm:w-auto px-8 py-3.5 text-lg font-medium text-white border border-white/20 hover:bg-white/10 rounded-lg backdrop-blur-sm transition-all text-center">
              Register as Seller
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="py-24 px-6 md:px-12 bg-background relative z-20 -mt-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-card p-8 rounded-2xl animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 text-primary">
                <MapPin className="w-7 h-7" />
              </div>
              <h3 className="font-serif text-2xl font-bold mb-3 text-foreground">Nationwide Network</h3>
              <p className="text-earth-600 dark:text-earth-300 leading-relaxed">Source the healthiest cattle directly from Punjab, Sindh, KPK, and Balochistan. Pure transparency in origin and lineage.</p>
            </div>
            
            <div className="glass-card p-8 rounded-2xl animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <div className="w-14 h-14 bg-earth-100 dark:bg-earth-800 rounded-2xl flex items-center justify-center mb-6 text-earth-700 dark:text-earth-300">
                <Shield className="w-7 h-7" />
              </div>
              <h3 className="font-serif text-2xl font-bold mb-3 text-foreground">Verified Farmers</h3>
              <p className="text-earth-600 dark:text-earth-300 leading-relaxed">Every seller undergoes a stringent verification process. Review agricultural track records, ratings, and health certificates openly.</p>
            </div>
            
            <div className="glass-card p-8 rounded-2xl animate-fade-in-up" style={{ animationDelay: '300ms' }}>
              <div className="w-14 h-14 bg-gold-500/10 rounded-2xl flex items-center justify-center mb-6 text-gold-600 dark:text-gold-500">
                <Users className="w-7 h-7" />
              </div>
              <h3 className="font-serif text-2xl font-bold mb-3 text-foreground">Community Trust</h3>
              <p className="text-earth-600 dark:text-earth-300 leading-relaxed">Built for the people. Negotiate directly with livestock owners without aggressive middlemen manipulating market thresholds.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories / Stats */}
      <section className="py-24 bg-surface border-y border-line">
        <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
           <h2 className="font-serif text-4xl font-bold mb-4 text-foreground">Livestock Categories</h2>
           <p className="text-earth-500 max-w-2xl mx-auto mb-16">Find exactly what you need quickly with our standardized classification system.</p>
           
           <div className="flex flex-wrap justify-center gap-4">
              {['Bulls', 'Cows', 'Calves', 'Buffaloes', 'Goats', 'Sheep'].map((cat, i) => (
                <Link href={`/marketplace?category=${cat.replace('es', '')}`} key={cat} className={`px-8 py-4 rounded-xl border border-line bg-background hover:border-primary hover:shadow-md transition-all duration-300 animate-fade-in-up`} style={{ animationDelay: `${i * 100}ms` }}>
                  <span className="font-semibold text-foreground tracking-wide">{cat}</span>
                </Link>
              ))}
           </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="py-32 px-6 md:px-12 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1596733430284-f74370602260?q=80&w=2000&auto=format&fit=crop"
            alt="Farming"
            fill
            sizes="100vw"
            className="object-cover opacity-10 dark:opacity-5 grayscale"
          />
          <div className="absolute inset-0 bg-primary/5"></div>
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10 glass-card p-12 md:p-20 rounded-[2rem]">
          <ShieldCheck className="w-16 h-16 text-primary mx-auto mb-6" />
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6 text-foreground">Secure Your Livestock Today</h2>
          <p className="font-sans text-lg text-earth-600 dark:text-earth-300 mb-10 max-w-2xl mx-auto">
            Join thousands of registered buyers and sellers shaping the future of Pakistan's digital agricultural economy. 
          </p>
          <Link href="/register" className="btn-primary text-lg px-12 py-4">
            Create Free Account
          </Link>
        </div>
      </section>
    </div>
  );
}
