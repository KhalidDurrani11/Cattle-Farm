'use client';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ShieldCheck, MapPin, ArrowRight, Leaf, Users, Shield, Award } from 'lucide-react';

export default function HomePage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 80, damping: 15 } },
  };

  const categories = [
    { name: 'Bulls', img: 'https://images.unsplash.com/photo-1549471013-3364d7220b75?w=500&q=80' },
    { name: 'Cows', img: 'https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?w=500&q=80' },
    { name: 'Calves', img: 'https://images.unsplash.com/photo-1545468800-85cc9bc6ecf7?w=500&q=80' },
    { name: 'Buffaloes', img: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=500&q=80' },
    { name: 'Goats', img: 'https://images.unsplash.com/photo-1524024973431-2ad916746881?w=500&q=80' },
    { name: 'Sheep', img: 'https://images.unsplash.com/photo-1484557985045-edf25e08da73?w=500&q=80' }
  ];

  return (
    <div className="bg-[#FAF8F5] dark:bg-[#111311] text-foreground min-h-screen transition-colors duration-500 overflow-x-hidden">
      
      {/* Cinematic Hero */}
      <section className="relative min-h-[95svh] flex flex-col items-center justify-center pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?q=80&w=2000&auto=format&fit=crop"
            alt="Hero background"
            fill
            priority
            className="object-cover object-[center_35%]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#FAF8F5] dark:from-[#111311] via-black/45 to-black/70 z-10" />
          <div className="absolute inset-0 bg-[#166534]/10 dark:bg-[#22c55e]/5 z-10 mix-blend-multiply" />
        </div>
        
        <div className="relative z-20 text-center max-w-4xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', duration: 1 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1E4620]/90 backdrop-blur-md text-white font-medium text-xs sm:text-sm mb-8 shadow-lg border border-white/20 animate-float">
              <Leaf className="w-4 h-4 text-[#8FBC8F]" /> Official Trade Platform
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 80 }}
            className="font-serif text-4xl sm:text-6xl md:text-8xl font-black tracking-tight mb-6 leading-[1.05] text-white drop-shadow-2xl"
          >
            Pakistan's Premier <br/>
            <span className="text-[#8FBC8F] font-serif italic drop-shadow-lg font-normal">Livestock Exchange.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="font-sans text-base sm:text-xl text-[#F5F5DC] max-w-2xl mx-auto mb-12 leading-relaxed drop-shadow-xl font-light"
          >
            A secure, direct-to-farm trading platform facilitating transaction security, authenticated seller documentation, and genetic lineage transparency nationwide.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, type: 'spring' }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-stretch sm:items-center w-full sm:w-auto px-4"
          >
            <Link href="/marketplace" className="w-full sm:w-auto bg-primary hover:bg-green-750 hover:scale-105 active:scale-95 text-white px-8 py-4 text-base sm:text-lg font-bold rounded-2xl flex items-center justify-center gap-2 shadow-[0_10px_25px_rgba(22,101,52,0.4)] transition-all duration-300">
              Browse Listings <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/register" className="w-full sm:w-auto px-8 py-4 text-base sm:text-lg font-bold text-white border-2 border-white/60 hover:bg-white/10 hover:border-white hover:scale-105 active:scale-95 rounded-2xl backdrop-blur-md transition-all duration-300 text-center">
              Register as Seller
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="py-28 px-4 sm:px-6 lg:px-8 relative z-20 -mt-8 bg-gradient-to-b from-transparent via-[#FAF8F5] to-[#FAF8F5] dark:via-[#111311] dark:to-[#111311]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-100px' }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              {
                icon: <MapPin className="w-7 h-7" />,
                bg: 'bg-primary/10 text-primary',
                title: 'Nationwide Network',
                desc: 'Source the healthiest cattle directly from Punjab, Sindh, KPK, and Balochistan. Pure transparency in origin and lineage.'
              },
              {
                icon: <Shield className="w-7 h-7" />,
                bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
                title: 'Verified Farmers',
                desc: 'Every seller undergoes a stringent verification process. Review agricultural track records, ratings, and health certificates openly.'
              },
              {
                icon: <Users className="w-7 h-7" />,
                bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
                title: 'Community Trust',
                desc: 'Built for the people. Negotiate directly with livestock owners without aggressive middlemen manipulating market thresholds.'
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="bg-white/70 dark:bg-[#181b18]/70 backdrop-blur-md p-8 rounded-3xl border border-[#1E4620]/10 dark:border-[#292e29] shadow-[0_10px_30px_-5px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(22,101,52,0.06)] dark:hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] hover:-translate-y-1.5 transition-all duration-500 group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full transition-all duration-500 group-hover:scale-150" />
                <div className={`w-14 h-14 ${feature.bg} rounded-2xl flex items-center justify-center mb-6`}>
                  {feature.icon}
                </div>
                <h3 className="font-serif text-2xl font-bold mb-3 text-gray-950 dark:text-white">{feature.title}</h3>
                <p className="text-gray-600 dark:text-[#a8a29e] leading-relaxed text-[15px]">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-28 bg-white dark:bg-[#181b18] border-y border-[#1E4620]/10 dark:border-[#292e29] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(22,101,52,0.03),transparent_40%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-serif text-4xl sm:text-5xl font-bold mb-4 text-gray-950 dark:text-white"
            >
              Livestock Categories
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-gray-500 dark:text-[#a8a29e]"
            >
              Find exactly what you need quickly with our standardized classification system.
            </motion.p>
          </div>
           
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6"
          >
            {categories.map((cat) => (
              <motion.div
                key={cat.name}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="group relative rounded-2xl overflow-hidden aspect-square border border-[#1E4620]/10 dark:border-[#292e29] shadow-md hover:shadow-xl hover:border-primary/50 transition-all duration-500 flex items-end"
              >
                <Link href={`/marketplace?category=${cat.name.replace('es', '')}`} className="absolute inset-0 z-0 w-full h-full">
                  <Image
                    src={cat.img}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 16vw"
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent z-10" />
                  <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 mix-blend-overlay" />
                  <div className="absolute bottom-4 left-0 right-0 z-20 text-center">
                    <span className="font-bold text-white text-lg tracking-wide group-hover:text-[#8FBC8F] transition-colors">{cat.name}</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Verification Flow Section */}
      <section className="py-28 bg-[#FAF8F5] dark:bg-[#111311] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary dark:text-[#8FBC8F] font-semibold text-xs mb-4 uppercase tracking-wider"
          >
            Trust & Security
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-serif text-4xl sm:text-5xl font-bold mb-4 text-gray-950 dark:text-white"
          >
            How to Get Verified
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-500 dark:text-[#a8a29e] max-w-2xl mx-auto mb-20"
          >
            Build instant trust with buyers across Pakistan by verifying your identity and farm details in three simple steps.
          </motion.p>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-100px' }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto relative mb-16"
          >
            <div className="hidden md:block absolute top-1/2 left-[15%] right-[15%] h-[2px] bg-primary/10 dark:bg-white/5 -translate-y-1/2 z-0" />
            
            {[
              { num: '1', title: 'Create Account', desc: 'Register as a Seller and complete your basic profile setup.' },
              { num: '2', title: 'Submit Details', desc: 'Navigate to your Dashboard → Verification Tab. Upload your CNIC and farm specifics.' },
              { num: '3', title: 'Earn Badge', desc: 'Our admin team validates your documents and grants the green Trust Badge.' }
            ].map((step, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="bg-white/80 dark:bg-[#181b18]/80 backdrop-blur-md p-8 rounded-3xl relative z-10 border border-[#1E4620]/10 dark:border-[#292e29] shadow-sm flex flex-col items-center hover:border-primary/20 transition-all duration-300"
              >
                <div className="w-16 h-16 bg-primary/10 dark:bg-primary/20 text-primary dark:text-[#8FBC8F] rounded-full flex items-center justify-center font-serif text-2xl font-bold mb-6 border-4 border-white dark:border-[#111311] shadow-md">
                  {step.num}
                </div>
                <h3 className="font-bold text-xl mb-3 text-gray-950 dark:text-white">{step.title}</h3>
                <p className="text-center text-gray-500 dark:text-[#a8a29e] text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
          >
            <Link href="/dashboard?tab=verification" className="inline-flex items-center gap-2 bg-primary hover:bg-green-700 text-white px-8 py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300">
              <ShieldCheck className="w-5 h-5" /> Start Verification Now
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-[#111311]">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1596733430284-f74370602260?q=80&w=2000&auto=format&fit=crop"
            alt="Farming"
            fill
            className="object-cover opacity-20 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-[#166534]/20 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111311] via-transparent to-[#FAF8F5]/10 dark:to-[#111311]/10" />
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10 bg-black/40 backdrop-blur-xl p-10 md:p-20 rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent" />
          <Award className="relative w-20 h-20 text-[#8FBC8F] mx-auto mb-8 drop-shadow-[0_0_15px_rgba(143,188,143,0.4)] animate-float" />
          <h2 className="relative font-serif text-4xl md:text-5xl font-bold mb-6 text-white drop-shadow-xl">Secure Your Livestock Today</h2>
          <p className="relative font-sans text-base sm:text-lg text-[#D7CCC8] mb-10 max-w-2xl mx-auto font-light">
            Join thousands of registered buyers and sellers shaping the future of Pakistan's digital agricultural economy. 
          </p>
          <Link href="/register" className="relative inline-flex bg-primary hover:bg-green-700 text-white text-lg px-12 py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300">
            Create Free Account
          </Link>
        </div>
      </section>
    </div>
  );
}
