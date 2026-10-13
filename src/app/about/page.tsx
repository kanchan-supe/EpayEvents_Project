'use client';

import React from 'react';
import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { 
  Calendar, Ticket, Headphones, Target, Users, Cpu, Briefcase, Music, BookOpen, HeartPulse, Palette, 
  ArrowRight, QrCode, LayoutDashboard, FileSpreadsheet, Zap, ShieldCheck, Eye,
  Gamepad2, Flame, Trophy, Crosshair, Shield
} from 'lucide-react';
import { Navbar, Footer } from '@/components/NavbarFooter';
import { mockCategories } from '@/lib/data';

const categoryIconMap: Record<string, React.ReactNode> = {
  Cpu: <Cpu className="h-5 w-5 text-cyan-400" />,
  Briefcase: <Briefcase className="h-5 w-5 text-amber-400" />,
  Music: <Music className="h-5 w-5 text-fuchsia-400" />,
  BookOpen: <BookOpen className="h-5 w-5 text-emerald-400" />,
  HeartPulse: <HeartPulse className="h-5 w-5 text-rose-400" />,
  Palette: <Palette className="h-5 w-5 text-orange-400" />,
};

// Framer Motion Animation Variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

export default function AboutUsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF9] text-[#1C1917] overflow-x-hidden font-sans">
      <Navbar />

      {/* 1. GAMING HERO SECTION - Matched to Event Details page size */}
      <section className="relative w-full min-h-[85vh] lg:min-h-[90vh] bg-gradient-to-b from-[#0B0F19] via-[#0F172A] to-[#0B0F19] text-white overflow-hidden flex items-center justify-center">
        
        {/* Gaming Grid Line Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

        {/* Ambient Glowing Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#0F766E]/20 blur-[130px] rounded-full pointer-events-none animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#F97316]/15 blur-[130px] rounded-full pointer-events-none animate-pulse" />

        <div className="container mx-auto px-4 md:px-8 py-16 lg:py-24 max-w-6xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content Side */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="lg:col-span-7 space-y-5 text-left"
            >
              {/* Futuristic Cyber Badge */}
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="inline-flex items-center gap-2 rounded-full bg-slate-900/90 border border-cyan-500/40 px-3.5 py-1 text-xs font-mono font-bold text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.25)] backdrop-blur-md"
              >
                <Gamepad2 className="h-3.5 w-3.5 text-[#F97316] animate-bounce" /> 
                <span>LEVEL UP YOUR EVENT ARCHITECTURE</span>
              </motion.div>

              <h1 className="text-3xl sm:text-5xl lg:text-5xl font-black leading-tight tracking-tight text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
                Game-Changing <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-[#0F766E] to-[#F97316]">
                  Live Events
                </span> Ecosystem
              </h1>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl font-normal drop-shadow">
                ePayEvents is India’s premier ticketing platform built for next-generation event creators and attendees. We combine lightning-fast QR ticketing, instant payouts, and immersive event discovery into one portal.
              </p>

              {/* Gaming HUD Stats Counters Row */}
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-3 gap-3 sm:gap-4 pt-4 border-t border-slate-800"
              >
                <motion.div variants={itemVariants} className="bg-slate-900/80 border border-cyan-500/30 p-3 rounded-xl shadow-[0_0_8px_rgba(6,182,212,0.15)]">
                  <h3 className="text-xl sm:text-2xl font-black text-cyan-400 font-mono">500+</h3>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mt-0.5">Events Hosted</p>
                </motion.div>
                <motion.div variants={itemVariants} className="bg-slate-900/80 border border-[#F97316]/30 p-4 rounded-xl shadow-[0_0_8px_rgba(249,115,22,0.15)]">
                  <h3 className="text-xl sm:text-2xl font-black text-[#F97316] font-mono">50K+</h3>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mt-0.5">Happy Attendees</p>
                </motion.div>
                <motion.div variants={itemVariants} className="bg-slate-900/80 border border-emerald-500/30 p-3 rounded-xl shadow-[0_0_8px_rgba(16,185,129,0.15)]">
                  <h3 className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">100%</h3>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mt-0.5">Instant Payouts</p>
                </motion.div>
              </motion.div>

              <div className="pt-1 flex flex-wrap gap-3">
                <Link
                  href="/events"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#F97316] to-orange-500 px-6 py-2.5 font-bold text-xs sm:text-sm text-white hover:opacity-95 transition shadow-[0_0_15px_rgba(249,115,22,0.3)]"
                >
                  <span>Explore Live Events</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/create-event"
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 border border-cyan-500/50 px-6 py-2.5 font-bold text-xs sm:text-sm text-cyan-300 hover:bg-cyan-950/40 transition shadow-[0_0_12px_rgba(6,182,212,0.15)]"
                >
                  <span>Host an Event</span>
                </Link>
              </div>
            </motion.div>

            {/* Right Highlights Gaming HUD Card Stack */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="lg:col-span-5 bg-slate-900/80 backdrop-blur-2xl border border-cyan-500/30 p-5 sm:p-6 rounded-2xl space-y-3 shadow-[0_0_25px_rgba(15,118,110,0.2)] relative overflow-hidden"
            >
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
                <span className="font-mono text-xs text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-2">
                  <Flame className="h-3.5 w-3.5 text-[#F97316]" /> SYSTEM ARCHITECTURE
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </div>

              <motion.div whileHover={{ scale: 1.01 }} className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-start gap-3.5 transition">
                <div className="p-2.5 rounded-lg bg-gradient-to-br from-[#0F766E] to-cyan-600 text-white shrink-0 shadow-md">
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Live Events Arena</h4>
                  <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                    Experience tech summits, workshops, and concerts across top cities.
                  </p>
                </div>
              </motion.div>

              <motion.div whileHover={{ scale: 1.01 }} className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-start gap-3.5 transition">
                <div className="p-2.5 rounded-lg bg-gradient-to-br from-[#F97316] to-amber-500 text-white shrink-0 shadow-md">
                  <Ticket className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Instant QR Pass</h4>
                  <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                    Zero wait time. Unlock event venue access instantly via WhatsApp & Email QR pass.
                  </p>
                </div>
              </motion.div>

              <motion.div whileHover={{ scale: 1.01 }} className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-start gap-3.5 transition">
                <div className="p-2.5 rounded-lg bg-gradient-to-br from-emerald-600 to-teal-500 text-white shrink-0 shadow-md">
                  <Trophy className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">24/7 Organizer Support</h4>
                  <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                    Dedicated support team ready to assist organizers and attendees any time.
                  </p>
                </div>
              </motion.div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* 2. OUR MISSION & CATEGORIES SECTION - Clean Light Background */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="container mx-auto px-4 md:px-8 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Left Side: Mission */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-7 space-y-6"
            >
              <div>
                <span className="text-xs font-bold text-[#0F766E] uppercase tracking-widest bg-[#0F766E]/10 px-3.5 py-1.5 rounded-full border border-[#0F766E]/20 inline-block mb-1">
                  OUR MISSION
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-[#1C1917] tracking-tight mt-1">
                  Empowering Memorable <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0F766E] to-[#F97316]">Live Experiences</span>
                </h2>
              </div>

              <div className="space-y-4 text-sm sm:text-base text-[#78716C] leading-relaxed">
                <p>
                  At ePayEvents, we believe that memorable live experiences bring people together. Our mission is to democratize event discovery and ticketing, making it easier than ever for people to find and attend events that inspire, educate, and entertain.
                </p>
                <p>
                  We are committed to supporting event organizers with powerful tools, automated payment settlements, and an intuitive platform that helps them reach their target audience effectively without administrative headache.
                </p>
              </div>

              {/* Mission Pillars Cards */}
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4"
              >
                <motion.div variants={itemVariants} whileHover={{ y: -4 }} className="p-5 rounded-2xl bg-[#FAFAF9] border border-[#E7E5E4] space-y-2 shadow-2xs">
                  <div className="w-9 h-9 rounded-xl bg-[#0F766E]/10 text-[#0F766E] flex items-center justify-center font-bold">
                    <Target className="h-5 w-5" />
                  </div>
                  <h4 className="font-bold text-[#1C1917] text-base">Targeted Discovery</h4>
                  <p className="text-xs text-[#78716C] leading-relaxed">
                    Find events that match your exact professional interests, tech stacks, and hobbies.
                  </p>
                </motion.div>

                <motion.div variants={itemVariants} whileHover={{ y: -4 }} className="p-5 rounded-2xl bg-[#FAFAF9] border border-[#E7E5E4] space-y-2 shadow-2xs">
                  <div className="w-9 h-9 rounded-xl bg-[#F97316]/10 text-[#F97316] flex items-center justify-center font-bold">
                    <Users className="h-5 w-5" />
                  </div>
                  <h4 className="font-bold text-[#1C1917] text-base">Community Building</h4>
                  <p className="text-xs text-[#78716C] leading-relaxed">
                    Connect with like-minded developers, creators, and professionals at every event.
                  </p>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Right Side: Event Categories */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-5 bg-[#FAFAF9] p-6 sm:p-8 rounded-3xl border border-[#E7E5E4] shadow-sm space-y-6"
            >
              <div>
                <h3 className="text-2xl font-extrabold text-[#1C1917]">What We Offer</h3>
                <p className="text-xs text-[#78716C] mt-1">Explore all categories available on ePayEvents</p>
              </div>

              <motion.div 
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="space-y-3"
              >
                {mockCategories.map((cat) => (
                  <motion.div 
                    key={cat.id}
                    variants={itemVariants}
                    whileHover={{ scale: 1.02, x: 4 }}
                    className="p-3.5 rounded-xl bg-white border border-[#E7E5E4] flex items-center justify-between hover:border-[#0F766E] transition shadow-2xs group"
                  >
                    <Link href={`/events?category=${cat.slug}`} className="flex items-center gap-3.5 flex-1">
                      <div className="p-2 rounded-lg bg-[#0F766E]/10 shrink-0">
                        {categoryIconMap[cat.icon] || <Calendar className="h-4 w-4 text-[#0F766E]" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-[#1C1917] text-sm group-hover:text-[#0F766E] transition">{cat.name}</h4>
                        <p className="text-[11px] text-[#78716C] line-clamp-1">{cat.description}</p>
                      </div>
                    </Link>
                    <span className="text-xs font-semibold bg-[#FAFAF9] text-[#0F766E] px-2.5 py-1 rounded-full border border-[#E7E5E4] shrink-0">
                      {cat.count} events
                    </span>
                  </motion.div>
                ))}
              </motion.div>

              <div className="pt-2 text-center">
                <Link 
                  href="/events" 
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0F766E] hover:underline"
                >
                  <span>Browse All Categories</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* 3. GAMING STYLE: COMPLETE EVENT MANAGEMENT SUITE - Clean Light Theme with Gaming Accent Cards */}
      <section className="py-16 sm:py-20 bg-[#FAFAF9]">
        <div className="container mx-auto px-4 md:px-8 max-w-6xl">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-2xl mx-auto mb-12"
          >
            <span className="text-xs font-mono font-extrabold text-[#059669] uppercase tracking-widest bg-[#059669]/10 px-3.5 py-1.5 rounded-full border border-[#059669]/20 inline-flex items-center gap-2 mb-2">
              <Crosshair className="h-3.5 w-3.5 text-[#F97316]" /> CREATOR BATTLEKIT
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-[#1C1917] tracking-tight">
              Complete Event <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#059669] to-emerald-600">Management Suite</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#78716C] mt-2">
              Powerful platform capabilities built to replace manual spreadsheets and WhatsApp groups.
            </p>
          </motion.div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* Gaming Card 1 */}
            <motion.div 
              variants={itemVariants} 
              whileHover={{ y: -6, scale: 1.02 }} 
              className="relative group p-6 rounded-2xl bg-white border border-teal-200/80 hover:border-[#0F766E] shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0F766E] to-teal-600 text-white flex items-center justify-center font-bold mb-4 shadow-md">
                <QrCode className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-[#1C1917] text-base mb-1.5 group-hover:text-[#0F766E] transition">QR Gate Scanner</h3>
              <p className="text-xs text-[#78716C] leading-relaxed">
                Scan attendee ticket badges at venue entrance gates in milliseconds with zero lag. Mobile-friendly scanner web app built for peak crowds.
              </p>
            </motion.div>

            {/* Gaming Card 2 */}
            <motion.div 
              variants={itemVariants} 
              whileHover={{ y: -6, scale: 1.02 }} 
              className="relative group p-6 rounded-2xl bg-white border border-orange-200/80 hover:border-[#F97316] shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#F97316] to-amber-500 text-white flex items-center justify-center font-bold mb-4 shadow-md">
                <LayoutDashboard className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-[#1C1917] text-base mb-1.5 group-hover:text-[#F97316] transition">Live Analytics Dashboard</h3>
              <p className="text-xs text-[#78716C] leading-relaxed">
                Monitor real-time ticket sales revenue, entry count telemetry, category breakdown, and seat availability from your organizer console HUD.
              </p>
            </motion.div>

            {/* Gaming Card 3 */}
            <motion.div 
              variants={itemVariants} 
              whileHover={{ y: -6, scale: 1.02 }} 
              className="relative group p-6 rounded-2xl bg-white border border-emerald-200/80 hover:border-emerald-600 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white flex items-center justify-center font-bold mb-4 shadow-md">
                <FileSpreadsheet className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-[#1C1917] text-base mb-1.5 group-hover:text-emerald-600 transition">Automated Payout Engine</h3>
              <p className="text-xs text-[#78716C] leading-relaxed">
                Automated bank settlement workflows with exportable CSV/Excel reports for attendee check-in logs and financial records.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 4. GAMING STYLE: WHAT WE STAND FOR - Clean Light Theme */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="container mx-auto px-4 md:px-8 max-w-5xl">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-2xl mx-auto mb-12"
          >
            <span className="text-xs font-mono font-extrabold text-[#F97316] uppercase tracking-widest bg-[#F97316]/10 px-3.5 py-1.5 rounded-full border border-[#F97316]/20 inline-flex items-center gap-2 mb-2">
              <Shield className="h-3.5 w-3.5 text-[#0F766E]" /> GUILD PRINCIPLES
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-[#1C1917] tracking-tight">
              What We <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F97316] to-amber-500">Stand For</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#78716C] mt-2">
              Our core values guiding every feature we build.
            </p>
          </motion.div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            <motion.div variants={itemVariants} whileHover={{ y: -4 }} className="bg-[#FAFAF9] p-6 rounded-2xl border border-[#E7E5E4] space-y-2 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-[#0F766E]/10 text-[#0F766E] flex items-center justify-center font-bold mb-3">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-[#1C1917] text-base">Pure Simplicity</h3>
              <p className="text-xs text-[#78716C] leading-relaxed">
                Clean software designed for non-technical event hosts to set up and manage events without complex training.
              </p>
            </motion.div>

            <motion.div variants={itemVariants} whileHover={{ y: -4 }} className="bg-[#FAFAF9] p-6 rounded-2xl border border-[#E7E5E4] space-y-2 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-[#059669]/10 text-[#059669] flex items-center justify-center font-bold mb-3">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-[#1C1917] text-base">Unshakable Reliability</h3>
              <p className="text-xs text-[#78716C] leading-relaxed">
                Fast payment processing and gate scanning systems that perform smoothly even during peak arrival hours.
              </p>
            </motion.div>

            <motion.div variants={itemVariants} whileHover={{ y: -4 }} className="bg-[#FAFAF9] p-6 rounded-2xl border border-[#E7E5E4] space-y-2 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-[#F97316]/10 text-[#F97316] flex items-center justify-center font-bold mb-3">
                <Eye className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-[#1C1917] text-base">100% Transparency</h3>
              <p className="text-xs text-[#78716C] leading-relaxed">
                No hidden pricing or surprise fees. Clear revenue reporting and automated bank account payouts for organizers.
              </p>
            </motion.div>

            <motion.div variants={itemVariants} whileHover={{ y: -4 }} className="bg-[#FAFAF9] p-6 rounded-2xl border border-[#E7E5E4] space-y-2 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold mb-3">
                <Headphones className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-[#1C1917] text-base">24/7 Creator Guild</h3>
              <p className="text-xs text-[#78716C] leading-relaxed">
                Dedicated customer assistance for event creators before, during, and after event execution.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 5. MEET OUR TEAM SECTION - Clean Light Theme */}
      <section className="py-16 sm:py-20 bg-[#FAFAF9]">
        <div className="container mx-auto px-4 md:px-8 max-w-5xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-2xl mx-auto mb-12"
          >
            <span className="text-xs font-bold text-[#0F766E] uppercase tracking-widest bg-[#0F766E]/10 px-3.5 py-1.5 rounded-full border border-[#0F766E]/20 inline-block mb-2">
              PEOPLE BEHIND EPAYEVENTS
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-[#1C1917] tracking-tight">
              Meet Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0F766E] to-teal-500">Team</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#78716C] mt-2">
              The team building and supporting ePayEvents every day.
            </p>
          </motion.div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            <motion.div variants={itemVariants} whileHover={{ y: -6 }} className="bg-white p-5 rounded-2xl border border-[#E7E5E4] text-center space-y-3 shadow-sm hover:shadow-md transition">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/team/rahul.jpg" 
                alt="Rahul Mehta" 
                className="w-24 h-24 rounded-full object-cover mx-auto ring-4 ring-[#FFEDD5] shadow-sm"
              />
              <div>
                <h3 className="font-bold text-[#1C1917] text-base">Rahul Mehta</h3>
                <span className="text-xs font-semibold text-[#0F766E] block mt-0.5">Founder & CEO</span>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} whileHover={{ y: -6 }} className="bg-white p-5 rounded-2xl border border-[#E7E5E4] text-center space-y-3 shadow-sm hover:shadow-md transition">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/team/priya.jpg" 
                alt="Priya Sharma" 
                className="w-24 h-24 rounded-full object-cover mx-auto ring-4 ring-[#FFEDD5] shadow-sm"
              />
              <div>
                <h3 className="font-bold text-[#1C1917] text-base">Priya Sharma</h3>
                <span className="text-xs font-semibold text-[#0F766E] block mt-0.5">Head of Product</span>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} whileHover={{ y: -6 }} className="bg-white p-5 rounded-2xl border border-[#E7E5E4] text-center space-y-3 shadow-sm hover:shadow-md transition">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/team/amit.jpg" 
                alt="Amit Patel" 
                className="w-24 h-24 rounded-full object-cover mx-auto ring-4 ring-[#FFEDD5] shadow-sm"
              />
              <div>
                <h3 className="font-bold text-[#1C1917] text-base">Amit Patel</h3>
                <span className="text-xs font-semibold text-[#0F766E] block mt-0.5">Lead Developer</span>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} whileHover={{ y: -6 }} className="bg-white p-5 rounded-2xl border border-[#E7E5E4] text-center space-y-3 shadow-sm hover:shadow-md transition">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/team/sneha.jpg" 
                alt="Sneha Reddy" 
                className="w-24 h-24 rounded-full object-cover mx-auto ring-4 ring-[#FFEDD5] shadow-sm"
              />
              <div>
                <h3 className="font-bold text-[#1C1917] text-base">Sneha Reddy</h3>
                <span className="text-xs font-semibold text-[#0F766E] block mt-0.5">Customer Success</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="py-14 bg-[#1E293B] text-white">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="container mx-auto px-4 md:px-8 text-center max-w-2xl space-y-4"
        >
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Ready to Host Your Next Event?</h2>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Create your event page in under 10 minutes and start collecting registrations today.
          </p>
          <div className="pt-2">
            <Link
              href="/create-event"
              className="inline-flex items-center gap-2 rounded-xl bg-[#F97316] px-6 py-3 font-semibold text-xs sm:text-sm text-white hover:bg-[#ea580c] transition shadow-md"
            >
              <span>Create Your Event</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
