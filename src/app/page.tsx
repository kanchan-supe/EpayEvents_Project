'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, useInView, AnimatePresence, Variants } from 'framer-motion';
import { 
  Search, MapPin, Sparkles, Cpu, Briefcase, Music, BookOpen, HeartPulse, Palette, ArrowRight, 
  ChevronLeft, ChevronRight, Calendar, CheckCircle2, ShieldCheck, Zap, BarChart2, Star, Quote, 
  ChevronDown, HelpCircle, User, Globe, Laptop, Award, Video, Ticket, CreditCard, QrCode, Clock, ExternalLink, Mail, Bell, Percent, FileSpreadsheet, Lock, Activity
} from 'lucide-react';
import { Navbar, Footer } from '@/components/NavbarFooter';
import { EventCard } from '@/components/EventCard';
import { Logo } from '@/components/Logo';
import { mockCategories, mockEvents } from '@/lib/data';

const heroBackgroundImages = [
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1600&q=80',
];

const categoryIconMap: Record<string, React.ReactNode> = {
  Cpu: <Cpu className="h-6 w-6 text-[#0F766E]" />,
  Briefcase: <Briefcase className="h-6 w-6 text-[#F97316]" />,
  Music: <Music className="h-6 w-6 text-pink-600" />,
  BookOpen: <BookOpen className="h-6 w-6 text-[#059669]" />,
  HeartPulse: <HeartPulse className="h-6 w-6 text-red-500" />,
  Palette: <Palette className="h-6 w-6 text-amber-600" />,
};

const homeFaqs = [
  { question: 'How do I create and host an event on ePayEvents?', answer: 'Just click "Host an Event" in the top bar. Our step wizard helps you set up event details, ticket prices, custom registration forms, and start selling passes in under 5 minutes.' },
  { question: 'How does QR ticket scanning work for check-in?', answer: 'Attendees get an instant PDF ticket with a unique QR code on screen and via email. Gate staff can scan tickets using our web scanner on any smartphone or tablet.' },
  { question: 'When do event organizers receive ticket payouts?', answer: 'Ticket revenue payouts are settled directly into your linked bank account automatically post event completion, minus transparent gateway fees.' },
  { question: 'Can I offer free tickets or early-bird discounts?', answer: 'Yes! You can configure free passes, early-bird tiers, VIP packages, and custom promo coupon codes anytime.' },
];

// Helper Animated Counter Component
function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const duration = 2000;
      const increment = value / (duration / 16);
      const timer = setInterval(() => {
        start += increment;
        if (start >= value) {
          setCount(value);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);
      return () => clearInterval(timer);
    }
  }, [isInView, value]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}{suffix}
    </span>
  );
}

// Stagger Container & Item Variants
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
    transition: { duration: 0.5 },
  },
};

export default function HomePage() {
  const [currentBg, setCurrentBg] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activeStep, setActiveStep] = useState(4);

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroParallaxY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBg(prev => (prev + 1) % heroBackgroundImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const liveEvents = mockEvents.filter(e => e.status === 'published');
  const mainLiveEvent = liveEvents[0] || mockEvents[0];
  // Expanded to include 2 extra upcoming live event cards (total 6 grid cards now)
  const gridLiveEvents = liveEvents.slice(1, 7);

  const upcomingEvents = mockEvents.filter(e => e.status === 'published').slice(0, 6);
  const pastEvents = mockEvents.filter(e => e.status === 'ended');

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF9] overflow-x-hidden">
      <Navbar />

      {/* 1. HERO SECTION WITH QR CHECK-IN ILLUSTRATION CARD & PARALLAX */}
      <section ref={heroRef} className="relative overflow-hidden bg-gradient-to-b from-[#1E293B] via-[#0F172A] to-[#1E293B] text-white py-20 lg:py-28">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#0F766E]/20 rounded-full blur-3xl pointer-events-none"></div>

        <motion.div style={{ y: heroParallaxY }} className="absolute inset-0 pointer-events-none">
          {heroBackgroundImages.map((img, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                idx === currentBg ? 'opacity-15' : 'opacity-0'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img} alt="Hero slide" className="w-full h-full object-cover" />
            </div>
          ))}
        </motion.div>

        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#0F766E_1px,transparent_1px)] [background-size:20px_20px]"></div>

        <div className="container mx-auto px-4 md:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Hero Content */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="lg:col-span-7 space-y-6 text-left"
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="inline-flex items-center gap-2 rounded-full bg-[#0F766E]/20 border border-[#0F766E]/40 px-4 py-1.5 text-xs font-semibold text-[#FFEDD5] backdrop-blur-md shadow-sm"
              >
                <Sparkles className="h-4 w-4 text-[#F97316]" />
                <span>AI-Powered Event Discovery & Smart QR Ticketing</span>
              </motion.div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-white">
                Discover & Host Events That <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F97316] via-amber-300 to-orange-400">People Actually Remember</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed">
                Whether it’s a small workshop or a big conference, ePayEvents helps you handle registrations, tickets, payments and check-ins without the usual mess of forms and spreadsheets.
              </p>

              {/* SEARCH EVENTS BAR */}
              <form action="/events" method="GET" className="bg-white p-2.5 rounded-2xl shadow-2xl flex flex-col sm:flex-row gap-2 border border-[#E7E5E4]">
                <div className="flex-1 flex items-center gap-3 px-3 py-2 border-b sm:border-b-0 sm:border-r border-[#E7E5E4]">
                  <Search className="h-5 w-5 text-[#0F766E]" />
                  <input
                    type="text"
                    name="query"
                    placeholder="Search event name, topic, or keyword..."
                    className="w-full bg-transparent text-[#1C1917] placeholder-[#78716C] text-sm focus:outline-none"
                  />
                </div>

                <div className="flex-1 flex items-center gap-3 px-3 py-2">
                  <MapPin className="h-5 w-5 text-[#0F766E]" />
                  <input
                    type="text"
                    name="location"
                    placeholder="City or location..."
                    className="w-full bg-transparent text-[#1C1917] placeholder-[#78716C] text-sm focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="rounded-xl bg-[#0F766E] px-6 py-3 text-sm font-semibold text-white hover:bg-[#115E59] transition shadow-md"
                >
                  Search Events
                </button>
              </form>

              <div className="flex gap-2">
                {heroBackgroundImages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentBg(idx)}
                    className={`h-2 rounded-full transition-all ${
                      idx === currentBg ? 'w-8 bg-[#F97316]' : 'w-2 bg-white/30'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </motion.div>

            {/* Right Hero Visual Element: Animated Floating QR Check-in & Security Badge */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:col-span-5 relative"
            >
              <motion.div 
                animate={{ y: [-8, 8, -8] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="relative mx-auto max-w-sm rounded-3xl bg-[#1E293B]/90 backdrop-blur-2xl border border-[#0F766E]/40 p-6 shadow-2xl text-white space-y-5"
              >
                {/* Visual Header Badge */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2">
                    <Logo variant="white" size="sm" showWordmark={false} />
                    <div>
                      <h4 className="font-bold text-sm text-white">Smart Gate Ticket</h4>
                      <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Instant Scanner Active
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-[#F97316]/20 border border-[#F97316]/40 text-[10px] font-bold text-[#FFEDD5] uppercase tracking-wider">
                    VERIFIED
                  </span>
                </div>

                {/* QR Code Illustration Display */}
                <div className="p-5 rounded-2xl bg-[#0F172A] border border-[#0F766E]/50 text-white flex flex-col items-center justify-center space-y-3 shadow-inner relative overflow-hidden group">
                  <div className="p-3 bg-white/5 rounded-xl border border-[#0F766E]/40 relative">
                    <QrCode className="h-32 w-32 text-cyan-300 drop-shadow-[0_0_12px_rgba(6,182,212,0.6)]" />
                    <div className="absolute inset-0 bg-[#0F766E]/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-xs">
                      <ShieldCheck className="h-10 w-10 text-[#F97316]" />
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-300">TKT-2026-EPAY-8842</span>
                </div>

                {/* Secure Security Indicator */}
                <div className="flex items-center justify-between text-xs text-slate-300 pt-1">
                  <div className="flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5 text-[#F97316]" />
                    <span>256-Bit Encrypted Pass</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Activity className="h-3.5 w-3.5 text-[#059669]" />
                    <span>0.5s Scanner Entry</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* 2. LIVE EVENTS SECTION (WITH 4-COLUMN CARDS MATCHING REFERENCE IMAGE DESIGN) */}
      <motion.section 
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6 }}
        className="py-16 bg-transparent"
      >
        <div className="container mx-auto px-4 md:px-8 space-y-8">
          
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs uppercase tracking-widest text-[#059669] font-extrabold flex items-center gap-1.5 bg-[#059669]/10 px-3 py-1 rounded-full w-fit mb-1.5 border border-[#059669]/20">
                <span className="h-2.5 w-2.5 rounded-full bg-[#059669] animate-pulse"></span> LIVE NOW
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-[#1C1917] tracking-tight flex items-center gap-2">
                Live Events <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0F766E] to-teal-500">Showcase</span>
              </h2>
              <p className="text-xs text-[#78716C] mt-1">Featured live events taking place right now across top cities</p>
            </div>
            <Link href="/events" className="text-sm font-bold text-[#0F766E] hover:text-[#115E59] flex items-center gap-1.5 bg-[#0F766E]/10 hover:bg-[#0F766E]/20 px-4 py-2 rounded-xl transition">
              View All Live <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* TOP BIG FULL-WIDTH HERO BANNER CARD */}
          <motion.div 
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.3 }}
            className="relative w-full rounded-3xl overflow-hidden shadow-xl border border-slate-700 bg-slate-900 text-white group min-h-[380px] flex flex-col justify-end"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={mainLiveEvent.bannerUrl}
              alt={mainLiveEvent.title}
              className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1E293B] via-[#1E293B]/60 to-transparent"></div>

            <div className="relative z-10 p-8 sm:p-10 space-y-4 max-w-3xl">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-[#059669] px-3.5 py-1 text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 shadow">
                  <span className="h-2 w-2 rounded-full bg-white animate-pulse"></span> LIVE EVENT
                </span>
                <span className="rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-xs font-semibold text-white uppercase tracking-wider">
                  {mainLiveEvent.category.name}
                </span>
              </div>

              <h3 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight tracking-tight drop-shadow-md">
                {mainLiveEvent.title}
              </h3>

              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-200">
                <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-[#F97316]" /> {mainLiveEvent.venue.name}, {mainLiveEvent.venue.city}</span>
                <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4 text-[#F97316]" /> {new Date(mainLiveEvent.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>

              <div className="pt-2">
                <Link
                  href={`/events/${mainLiveEvent.slug}`}
                  className="rounded-xl bg-[#F97316] px-6 py-3 text-xs sm:text-sm font-extrabold text-white hover:bg-[#ea580c] transition shadow-lg inline-flex items-center gap-2"
                >
                  <span>Book Now</span> <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </motion.div>

          {/* BOTTOM GRID ROW: 4-COLUMN CARDS MATCHING REFERENCE IMAGE STYLE (Dark card + bright top image + green LIVE pill badge + title & location) */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2"
          >
            {gridLiveEvents.map(evt => (
              <motion.div key={evt.id} variants={itemVariants}>
                <Link
                  href={`/events/${evt.slug}`}
                  className="group rounded-2xl border border-slate-800 bg-[#1C1917] overflow-hidden hover:border-[#0F766E] hover:shadow-xl transition-all flex flex-col justify-between h-full"
                >
                  <div>
                    {/* Top Image Container with Top-Left Green LIVE Pill */}
                    <div className="relative h-48 w-full overflow-hidden bg-slate-900">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={evt.bannerUrl}
                        alt={evt.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-[#059669] px-3 py-1 text-[11px] font-extrabold text-white uppercase shadow-md">
                        <span className="h-2 w-2 rounded-full bg-white animate-pulse"></span> LIVE
                      </div>
                    </div>

                    {/* Card Content: Title & Location */}
                    <div className="p-4 space-y-2">
                      <h4 className="font-bold text-white text-base group-hover:text-cyan-400 transition-colors line-clamp-1">
                        {evt.title}
                      </h4>
                      <p className="text-xs text-slate-400 flex items-center gap-1.5 line-clamp-1">
                        <MapPin className="h-3.5 w-3.5 text-slate-500 shrink-0" /> {evt.venue.name}, {evt.venue.city}
                      </p>
                    </div>
                  </div>

                  {/* Card Footer: Starting Price & Quick Link */}
                  <div className="p-4 pt-0 flex items-center justify-between text-xs text-slate-400 mt-2 border-t border-slate-800/80 pt-3">
                    <span className="font-extrabold text-white text-xs">
                      Starting ₹{Math.min(...evt.ticketTypes.map(t => t.price)).toLocaleString()}
                    </span>
                    <span className="text-[#F97316] font-bold text-[11px] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Book Now <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>

        </div>
      </motion.section>

      {/* 3. UPCOMING EVENTS */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-xs font-extrabold text-[#F97316] uppercase tracking-widest bg-[#F97316]/10 px-3 py-1 rounded-full border border-[#F97316]/20 inline-block mb-1.5">
                HANDPICKED SELECTIONS
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-[#1C1917] tracking-tight">
                Upcoming <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F97316] to-amber-500">Events</span>
              </h2>
              <p className="text-xs text-[#78716C] mt-1">Happening over the next few weeks across conferences, masterclasses & summits</p>
            </div>
            <Link href="/events" className="text-sm font-bold text-[#0F766E] hover:text-[#115E59] flex items-center gap-1.5 bg-[#0F766E]/10 hover:bg-[#0F766E]/20 px-4 py-2 rounded-xl transition">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {upcomingEvents.map(evt => (
              <motion.div key={evt.id} variants={itemVariants}>
                <EventCard event={evt} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 4. PAST EVENTS SECTION */}
      <section className="py-16 bg-[#FAFAF9]">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-xs font-extrabold text-[#78716C] uppercase tracking-widest bg-[#E7E5E4] px-3 py-1 rounded-full inline-flex items-center gap-1.5 mb-1.5">
                <Clock className="h-3.5 w-3.5 text-[#78716C]" /> ARCHIVED CONCLAVES
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-[#1C1917] tracking-tight">
                Past <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-700 to-slate-900">Events Archive</span>
              </h2>
              <p className="text-xs text-[#78716C] mt-1">Review concluded events and past schedules</p>
            </div>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {pastEvents.map(evt => (
              <motion.div key={evt.id} variants={itemVariants}>
                <EventCard event={evt} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 5. POPULAR CATEGORIES */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-xs font-extrabold text-[#059669] uppercase tracking-widest bg-[#059669]/10 px-3 py-1 rounded-full border border-[#059669]/20 inline-block mb-1.5">
                DISCOVER BY INTEREST
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-[#1C1917] tracking-tight">
                Popular <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#059669] to-emerald-600">Categories</span>
              </h2>
              <p className="text-xs text-[#78716C] mt-1">Explore events tailored to your specific area of interest</p>
            </div>
            <Link href="/events" className="text-sm font-bold text-[#0F766E] hover:text-[#115E59] flex items-center gap-1.5 bg-[#0F766E]/10 hover:bg-[#0F766E]/20 px-4 py-2 rounded-xl transition">
              All Categories <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4"
          >
            {mockCategories.map(cat => (
              <motion.div key={cat.id} variants={itemVariants} whileHover={{ scale: 1.04 }}>
                <Link
                  href={`/events?category=${cat.slug}`}
                  className="group flex flex-col items-center text-center p-5 rounded-2xl border border-[#E7E5E4] bg-[#FAFAF9] hover:border-[#0F766E] hover:shadow-md transition-all h-full"
                >
                  <div className="p-3 rounded-xl bg-white shadow-xs mb-3 group-hover:scale-110 transition-transform">
                    {categoryIconMap[cat.icon] || <Cpu className="h-6 w-6 text-[#0F766E]" />}
                  </div>
                  <h3 className="font-bold text-[#1C1917] text-sm">{cat.name}</h3>
                  <span className="text-xs text-[#78716C] mt-1">
                    <AnimatedCounter value={cat.count || 0} /> Events
                  </span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 6. REDESIGNED MODERN GAMING-STYLE END-TO-END WORKFLOW SECTION */}
      <section className="py-20 bg-[#0F172A] text-white border-y border-slate-800 relative overflow-hidden">
        {/* Futuristic Glowing Background Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#F97316]/15 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute inset-0 bg-[radial-gradient(#0F766E_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none"></div>

        <div className="container mx-auto px-4 md:px-8 max-w-6xl relative z-10 space-y-12">
          {/* Gaming Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 border border-cyan-400/40 px-4 py-1.5 text-xs font-bold text-cyan-300 uppercase tracking-widest backdrop-blur-md shadow-[0_0_15px_rgba(6,182,212,0.25)]">
              <Sparkles className="h-4 w-4 text-cyan-400 animate-spin" /> Quest Progression Map
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Everything You Need to Run an Event — <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-[#F97316] to-emerald-400">In One Place</span>
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              From creating the event to checking people in and downloading reports. No more switching between tools.
            </p>
          </div>

          {/* Interactive Gaming Step Progress Bar (With Glowing Progress Line) */}
          <div className="relative max-w-4xl mx-auto hidden md:block py-4">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-800 -translate-y-1/2 rounded-full"></div>
            <div 
              className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-cyan-500 via-[#F97316] to-emerald-500 -translate-y-1/2 rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(6,182,212,0.8)]"
              style={{ width: `${((activeStep - 1) / 5) * 100}%` }}
            ></div>

            <div className="relative z-10 flex justify-between">
              {[1, 2, 3, 4, 5, 6].map(num => (
                <button
                  key={num}
                  onClick={() => setActiveStep(num)}
                  className={`w-10 h-10 rounded-full font-black text-xs transition-all flex items-center justify-center ${
                    activeStep === num
                      ? 'bg-gradient-to-r from-cyan-400 to-[#F97316] text-slate-950 scale-125 ring-4 ring-cyan-400/40 shadow-[0_0_20px_rgba(6,182,212,0.8)]'
                      : activeStep > num
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
                  }`}
                >
                  0{num}
                </button>
              ))}
            </div>
          </div>

          {/* Gaming-Style Step Cards (Futuristic Glowing Cards) */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {/* Step 01 */}
            <motion.div 
              variants={itemVariants}
              onClick={() => setActiveStep(1)}
              className={`p-6 rounded-2xl border transition-all cursor-pointer relative overflow-hidden backdrop-blur-md ${
                activeStep === 1
                  ? 'bg-gradient-to-b from-slate-900/90 to-cyan-950/80 border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.3)] ring-1 ring-cyan-400'
                  : 'bg-slate-900/70 border-slate-800 hover:border-cyan-500/50'
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className={`text-2xl font-black transition ${activeStep === 1 ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]' : 'text-slate-600'}`}>01</span>
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">STEP 01</span>
              </div>
              <h3 className="text-xl font-extrabold text-white">Create</h3>
              <p className="text-xs text-slate-300 leading-relaxed mt-2">
                Add event details, banner, date and venue in a few minutes.
              </p>
            </motion.div>

            {/* Step 02 */}
            <motion.div 
              variants={itemVariants}
              onClick={() => setActiveStep(2)}
              className={`p-6 rounded-2xl border transition-all cursor-pointer relative overflow-hidden backdrop-blur-md ${
                activeStep === 2
                  ? 'bg-gradient-to-b from-slate-900/90 to-cyan-950/80 border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.3)] ring-1 ring-cyan-400'
                  : 'bg-slate-900/70 border-slate-800 hover:border-cyan-500/50'
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className={`text-2xl font-black transition ${activeStep === 2 ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]' : 'text-slate-600'}`}>02</span>
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">STEP 02</span>
              </div>
              <h3 className="text-xl font-extrabold text-white">Register</h3>
              <p className="text-xs text-slate-300 leading-relaxed mt-2">
                Open registrations with custom form fields. Collect the exact information you need.
              </p>
            </motion.div>

            {/* Step 03 */}
            <motion.div 
              variants={itemVariants}
              onClick={() => setActiveStep(3)}
              className={`p-6 rounded-2xl border transition-all cursor-pointer relative overflow-hidden backdrop-blur-md ${
                activeStep === 3
                  ? 'bg-gradient-to-b from-slate-900/90 to-cyan-950/80 border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.3)] ring-1 ring-cyan-400'
                  : 'bg-slate-900/70 border-slate-800 hover:border-cyan-500/50'
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className={`text-2xl font-black transition ${activeStep === 3 ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]' : 'text-slate-600'}`}>03</span>
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">STEP 03</span>
              </div>
              <h3 className="text-xl font-extrabold text-white">Ticket</h3>
              <p className="text-xs text-slate-300 leading-relaxed mt-2">
                Set up free or paid tickets, early-bird prices, coupons and limits.
              </p>
            </motion.div>

            {/* Step 04 - FEATURED HIGHLIGHT STEP */}
            <motion.div 
              variants={itemVariants}
              onClick={() => setActiveStep(4)}
              className={`p-6 rounded-2xl border transition-all cursor-pointer relative overflow-hidden backdrop-blur-md ${
                activeStep === 4
                  ? 'bg-gradient-to-b from-slate-900 via-slate-900 to-[#F97316]/20 border-[#F97316] shadow-[0_0_30px_rgba(249,115,22,0.4)] ring-2 ring-[#F97316] scale-[1.03]'
                  : 'bg-slate-900/90 border-[#F97316]/60 hover:border-[#F97316]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-black text-[#F97316] drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]">04</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-[#F97316] text-slate-950 shadow-[0_0_10px_rgba(249,115,22,0.8)]">
                  RECOMMENDED HIGHLIGHT
                </span>
              </div>
              <h3 className="text-xl font-extrabold text-white flex items-center gap-2 mt-2">
                <QrCode className="h-5 w-5 text-[#F97316] animate-pulse" /> Check-in
              </h3>
              <p className="text-xs text-slate-200 leading-relaxed mt-2">
                Scan tickets at the gate for quick, organized entry. No long queues. Live count of people inside.
              </p>
              <div className="pt-3">
                <Link
                  href="/organizer/scanner"
                  className="text-xs font-extrabold text-[#F97316] hover:text-white flex items-center gap-1.5 transition group"
                >
                  <span>See how check-in works</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>

            {/* Step 05 */}
            <motion.div 
              variants={itemVariants}
              onClick={() => setActiveStep(5)}
              className={`p-6 rounded-2xl border transition-all cursor-pointer relative overflow-hidden backdrop-blur-md ${
                activeStep === 5
                  ? 'bg-gradient-to-b from-slate-900/90 to-cyan-950/80 border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.3)] ring-1 ring-cyan-400'
                  : 'bg-slate-900/70 border-slate-800 hover:border-cyan-500/50'
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className={`text-2xl font-black transition ${activeStep === 5 ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]' : 'text-slate-600'}`}>05</span>
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">STEP 05</span>
              </div>
              <h3 className="text-xl font-extrabold text-white">Track</h3>
              <p className="text-xs text-slate-300 leading-relaxed mt-2">
                See registrations, revenue and check-ins in real time on your dashboard.
              </p>
            </motion.div>

            {/* Step 06 */}
            <motion.div 
              variants={itemVariants}
              onClick={() => setActiveStep(6)}
              className={`p-6 rounded-2xl border transition-all cursor-pointer relative overflow-hidden backdrop-blur-md ${
                activeStep === 6
                  ? 'bg-gradient-to-b from-slate-900/90 to-cyan-950/80 border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.3)] ring-1 ring-cyan-400'
                  : 'bg-slate-900/70 border-slate-800 hover:border-cyan-500/50'
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className={`text-2xl font-black transition ${activeStep === 6 ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]' : 'text-slate-600'}`}>06</span>
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">STEP 06</span>
              </div>
              <h3 className="text-xl font-extrabold text-white">Export</h3>
              <p className="text-xs text-slate-300 leading-relaxed mt-2">
                Download attendee lists, payment reports and attendance data whenever you need.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 7. SMART FEATURES THAT ACTUALLY HELP EVENT CREATORS */}
      <section className="py-16 bg-[#1E293B] text-white">
        <div className="container mx-auto px-4 md:px-8 max-w-5xl space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <span className="text-xs font-extrabold text-cyan-300 uppercase tracking-widest bg-cyan-500/10 px-3.5 py-1.5 rounded-full border border-cyan-400/30 inline-block mb-1">
              PROVEN ENGINE
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Smart Features That <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-[#F97316]">Actually Help Event Creators</span>
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Tools designed to save time and reduce manual work — not just look fancy.
            </p>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left pt-4"
          >
            {/* Feature 1 */}
            <motion.div variants={itemVariants} whileHover={{ scale: 1.03 }} className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/70 space-y-2.5">
              <div className="p-2 w-fit bg-[#0F766E]/20 text-[#0F766E] rounded-lg">
                <Zap className="h-5 w-5 text-[#0F766E]" />
              </div>
              <h3 className="font-bold text-white text-base">Quick Event Creation</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Fill basic details and the system helps you structure tickets, registration form and pricing. Publish faster.
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div variants={itemVariants} whileHover={{ scale: 1.03 }} className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/70 space-y-2.5">
              <div className="p-2 w-fit bg-[#F97316]/20 text-[#F97316] rounded-lg">
                <Mail className="h-5 w-5 text-[#F97316]" />
              </div>
              <h3 className="font-bold text-white text-base">Automated Reminders</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Send registration confirmation, payment success and event reminder emails/SMS automatically. Less follow-up work for you.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div variants={itemVariants} whileHover={{ scale: 1.03 }} className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/70 space-y-2.5">
              <div className="p-2 w-fit bg-[#059669]/20 text-[#059669] rounded-lg">
                <Percent className="h-5 w-5 text-[#059669]" />
              </div>
              <h3 className="font-bold text-white text-base">Coupon & Offer Engine</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Create discount codes, early-bird pricing and group offers in a few clicks. Control usage limits easily.
              </p>
            </motion.div>

            {/* Feature 4 */}
            <motion.div variants={itemVariants} whileHover={{ scale: 1.03 }} className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/70 space-y-2.5">
              <div className="p-2 w-fit bg-[#0F766E]/20 text-[#0F766E] rounded-lg">
                <QrCode className="h-5 w-5 text-[#0F766E]" />
              </div>
              <h3 className="font-bold text-white text-base">Real-time Check-in</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Live count of how many people have entered. Useful for both small workshops and large conferences.
              </p>
            </motion.div>

            {/* Feature 5 */}
            <motion.div variants={itemVariants} whileHover={{ scale: 1.03 }} className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/70 space-y-2.5 sm:col-span-2 lg:col-span-1">
              <div className="p-2 w-fit bg-[#F97316]/20 text-[#F97316] rounded-lg">
                <FileSpreadsheet className="h-5 w-5 text-[#F97316]" />
              </div>
              <h3 className="font-bold text-white text-base">Basic Reports</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                See total registrations, revenue collected, attendance percentage and no-show rate without opening Excel.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 8. WHY EVENT ORGANIZERS PREFER EPAYEVENTS */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 md:px-8 max-w-6xl">
          <div className="text-center max-w-3xl mx-auto space-y-2 mb-12">
            <span className="text-xs font-extrabold text-[#0F766E] uppercase tracking-widest bg-[#0F766E]/10 px-3.5 py-1.5 rounded-full border border-[#0F766E]/20 inline-block mb-1">
              BUILT FOR REAL HOSTS
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#1C1917] tracking-tight">
              Why Event Organizers <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0F766E] to-[#F97316]">Prefer ePayEvents</span>
            </h2>
            <p className="text-sm text-[#78716C] leading-relaxed">
              Built for real organizers who are tired of juggling Google Forms, Excel sheets, payment screenshots and WhatsApp groups.
            </p>
          </div>

          {/* Organizer Workspace Banner Image */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6 }}
            className="mb-12 rounded-3xl overflow-hidden shadow-xl border border-[#E7E5E4] max-h-[360px] relative"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/organizers/organizer_workspace.jpg" 
              alt="Indian Event Organizer Dashboard Workspace" 
              className="w-full h-full object-cover object-center max-h-[360px]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-6">
              <p className="text-white font-semibold text-sm sm:text-base">
                Empowering event creators across India with real-time analytics & automated check-ins.
              </p>
            </div>
          </motion.div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left"
          >
            {/* Card 1 */}
            <motion.div variants={itemVariants} className="p-6 rounded-2xl bg-[#FAFAF9] border border-[#E7E5E4] space-y-3 hover:border-[#0F766E] transition">
              <div className="w-10 h-10 rounded-xl bg-[#0F766E]/10 text-[#0F766E] flex items-center justify-center font-bold">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-[#1C1917] text-base">Simple Event Setup</h3>
              <p className="text-xs text-[#78716C] leading-relaxed">
                Create your event in under 10 minutes. Add tickets, set prices, upload banner and publish. No technical knowledge needed.
              </p>
            </motion.div>

            {/* Card 2 - Smart Ticketing Engine */}
            <motion.div variants={itemVariants} className="p-6 rounded-2xl bg-[#FAFAF9] border-2 border-[#0F766E]/40 space-y-3 hover:border-[#0F766E] transition relative overflow-hidden shadow-sm">
              <span className="absolute top-3 right-3 text-[9px] font-black uppercase tracking-wider bg-[#0F766E] text-white px-2 py-0.5 rounded-full">
                CORE MODULE
              </span>
              <div className="w-10 h-10 rounded-xl bg-[#F97316]/10 text-[#F97316] flex items-center justify-center font-bold">
                <CreditCard className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-[#1C1917] text-base">Smart Ticketing Engine</h3>
              <p className="text-xs text-[#78716C] leading-relaxed">
                Complete ticketing matrix: early-bird tiers, dynamic pricing, group bulk discounts, promo codes, hidden passcode passes, waitlists, complimentary passes, ticket transfers & automated refund workflows.
              </p>
            </motion.div>

            {/* Card 3 */}
            <motion.div variants={itemVariants} className="p-6 rounded-2xl bg-[#FAFAF9] border border-[#E7E5E4] space-y-3 hover:border-[#0F766E] transition">
              <div className="w-10 h-10 rounded-xl bg-[#059669]/10 text-[#059669] flex items-center justify-center font-bold">
                <QrCode className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-[#1C1917] text-base">QR Check-in System</h3>
              <p className="text-xs text-[#78716C] leading-relaxed">
                Generate unique QR tickets for every attendee. Scan at the entrance in seconds. Works smoothly even with average internet.
              </p>
            </motion.div>

            {/* Card 4 */}
            <motion.div variants={itemVariants} className="p-6 rounded-2xl bg-[#FAFAF9] border border-[#E7E5E4] space-y-3 hover:border-[#0F766E] transition">
              <div className="w-10 h-10 rounded-xl bg-[#0F766E]/10 text-[#0F766E] flex items-center justify-center font-bold">
                <BarChart2 className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-[#1C1917] text-base">Live Dashboard</h3>
              <p className="text-xs text-[#78716C] leading-relaxed">
                Track registrations, revenue, check-ins and attendance in real time. Export reports whenever you need them.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 9. ORGANIZERS GROWING WITH EPAYEVENTS */}
      <section className="py-20 bg-[#FAFAF9]">
        <div className="container mx-auto px-4 md:px-8 max-w-6xl">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
            <span className="text-xs font-extrabold text-[#0F766E] uppercase tracking-widest bg-[#0F766E]/10 px-3.5 py-1.5 rounded-full border border-[#0F766E]/20 inline-block">
              Organizer Success Stories
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#1C1917] tracking-tight">
              Organizers Growing with <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0F766E] to-[#F97316]">ePayEvents</span>
            </h2>
            <p className="text-sm text-[#78716C] leading-relaxed">
              Real metrics and feedback from community hosts, tech summits, and cultural festival organizers across India.
            </p>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Story 1 */}
            <motion.div variants={itemVariants} className="rounded-3xl border border-[#E7E5E4] bg-white p-6 sm:p-8 flex flex-col justify-between hover:shadow-xl transition-all group">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#E7E5E4] pb-4">
                  <div>
                    <h3 className="font-extrabold text-[#1C1917] text-base">AI Builders Club</h3>
                    <span className="text-[11px] text-[#78716C]">Tech & Hackathons</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#FFEDD5] text-[#F97316]">Bengaluru</span>
                </div>

                <div className="grid grid-cols-2 gap-3 py-2">
                  <div className="bg-[#FAFAF9] p-3 rounded-xl border border-[#E7E5E4]">
                    <span className="text-[10px] text-[#78716C] block font-medium">Tickets Sold</span>
                    <span className="text-xl font-black text-[#1C1917]">
                      <AnimatedCounter value={2450} suffix="+" />
                    </span>
                  </div>
                  <div className="bg-[#FAFAF9] p-3 rounded-xl border border-[#E7E5E4]">
                    <span className="text-[10px] text-[#78716C] block font-medium">Check-in Speed</span>
                    <span className="text-xl font-black text-[#059669]">2.1 s</span>
                  </div>
                </div>

                <p className="text-xs text-[#78716C] leading-relaxed italic">
                  &quot;We managed custom team submission questions and scanned 2,000+ hackers at gate entry seamlessly. ePayEvents eliminated zero-day queue chaos.&quot;
                </p>
              </div>

              <div className="pt-6 border-t border-[#E7E5E4] flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/speakers/speaker4.jpg" alt="Karan Sharma" className="h-10 w-10 rounded-full object-cover ring-2 ring-[#0F766E]/20" />
                <div>
                  <h4 className="font-bold text-[#1C1917] text-xs">Karan Sharma</h4>
                  <span className="text-[10px] text-[#78716C]">Lead Organizer, AI Builders</span>
                </div>
              </div>
            </motion.div>

            {/* Story 2 */}
            <motion.div variants={itemVariants} className="rounded-3xl border border-[#E7E5E4] bg-white p-6 sm:p-8 flex flex-col justify-between hover:shadow-xl transition-all group">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#E7E5E4] pb-4">
                  <div>
                    <h3 className="font-extrabold text-[#1C1917] text-base">FinTech Next Summit</h3>
                    <span className="text-[11px] text-[#78716C]">Corporate Conference</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#FFEDD5] text-[#F97316]">Mumbai</span>
                </div>

                <div className="grid grid-cols-2 gap-3 py-2">
                  <div className="bg-[#FAFAF9] p-3 rounded-xl border border-[#E7E5E4]">
                    <span className="text-[10px] text-[#78716C] block font-medium">Revenue Settled</span>
                    <span className="text-xl font-black text-[#1C1917]">₹14.8 L</span>
                  </div>
                  <div className="bg-[#FAFAF9] p-3 rounded-xl border border-[#E7E5E4]">
                    <span className="text-[10px] text-[#78716C] block font-medium">Show-up Rate</span>
                    <span className="text-xl font-black text-[#059669]">
                      <AnimatedCounter value={94} suffix="%" />
                    </span>
                  </div>
                </div>

                <p className="text-xs text-[#78716C] leading-relaxed italic">
                  &quot;Automated WhatsApp and email reminders reduced our no-show rates drastically. Instant UPI settlements gave us immediate cash flow.&quot;
                </p>
              </div>

              <div className="pt-6 border-t border-[#E7E5E4] flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/speakers/speaker3.jpg" alt="Rajesh Kulkarni" className="h-10 w-10 rounded-full object-cover ring-2 ring-[#0F766E]/20" />
                <div>
                  <h4 className="font-bold text-[#1C1917] text-xs">Rajesh Kulkarni</h4>
                  <span className="text-[10px] text-[#78716C]">Head of Events, FinTech Next</span>
                </div>
              </div>
            </motion.div>

            {/* Story 3 */}
            <motion.div variants={itemVariants} className="rounded-3xl border border-[#E7E5E4] bg-white p-6 sm:p-8 flex flex-col justify-between hover:shadow-xl transition-all group">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#E7E5E4] pb-4">
                  <div>
                    <h3 className="font-extrabold text-[#1C1917] text-base">Pune Indie Music Fest</h3>
                    <span className="text-[11px] text-[#78716C]">Live Concert</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#FFEDD5] text-[#F97316]">Pune</span>
                </div>

                <div className="grid grid-cols-2 gap-3 py-2">
                  <div className="bg-[#FAFAF9] p-3 rounded-xl border border-[#E7E5E4]">
                    <span className="text-[10px] text-[#78716C] block font-medium">Attended Count</span>
                    <span className="text-xl font-black text-[#1C1917]">
                      <AnimatedCounter value={4120} />
                    </span>
                  </div>
                  <div className="bg-[#FAFAF9] p-3 rounded-xl border border-[#E7E5E4]">
                    <span className="text-[10px] text-[#78716C] block font-medium">Coupon Redemption</span>
                    <span className="text-xl font-black text-[#059669]">
                      <AnimatedCounter value={38} suffix="%" />
                    </span>
                  </div>
                </div>

                <p className="text-xs text-[#78716C] leading-relaxed italic">
                  &quot;Early bird discounts and group ticketing tools boosted our first-week sales by 250%. Scanning with mobile phones was effortlessly fast.&quot;
                </p>
              </div>

              <div className="pt-6 border-t border-[#E7E5E4] flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/organizers/event_manager_qr.jpg" alt="Priya Deshmukh" className="h-10 w-10 rounded-full object-cover ring-2 ring-[#0F766E]/20" />
                <div>
                  <h4 className="font-bold text-[#1C1917] text-xs">Priya Deshmukh</h4>
                  <span className="text-[10px] text-[#78716C]">Festival Curator, Indie Pulse</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 10. WHAT ATTENDEES ARE SAYING (MOVED AFTER ORGANIZERS GROWING WITH EPAYEVENTS) */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 md:px-8 max-w-4xl text-center">
          <span className="text-xs font-extrabold text-[#F97316] uppercase tracking-widest bg-[#F97316]/10 px-3.5 py-1.5 rounded-full border border-[#F97316]/20 inline-block mb-2">
            ATTENDEE REVIEWS
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#1C1917] tracking-tight">
            What Attendees <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F97316] to-amber-500">Are Saying</span>
          </h2>
          <p className="text-xs text-[#78716C] mt-2">Real feedback from people who used ePayEvents to book and attend events.</p>
          
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6 }}
              className="p-6 rounded-2xl bg-[#FAFAF9] border border-[#E7E5E4] space-y-4 shadow-sm"
            >
              <Quote className="h-6 w-6 text-[#0F766E] opacity-60" />
              <p className="text-xs text-[#1C1917] italic leading-relaxed">
                &quot;Checking into the FinTech summit took literally 3 seconds. Showed my phone QR code at the gate and walked in. Super smooth!&quot;
              </p>
              <div className="pt-3 border-t border-[#E7E5E4] flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/speakers/speaker1.jpg" alt="Rohan Verma" className="h-10 w-10 rounded-full object-cover ring-2 ring-[#FFEDD5]" />
                <div>
                  <h4 className="font-bold text-[#1C1917] text-xs">Rohan Verma</h4>
                  <span className="text-[10px] text-[#78716C]">Software Engineer, Mumbai</span>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6 }}
              className="p-6 rounded-2xl bg-[#FAFAF9] border border-[#E7E5E4] space-y-4 shadow-sm"
            >
              <Quote className="h-6 w-6 text-[#0F766E] opacity-60" />
              <p className="text-xs text-[#1C1917] italic leading-relaxed">
                &quot;The ticket purchase was seamless. Got my PDF pass immediately and the event agenda was clean and easy to follow.&quot;
              </p>
              <div className="pt-3 border-t border-[#E7E5E4] flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/speakers/speaker2.jpg" alt="Ananya Iyer" className="h-10 w-10 rounded-full object-cover ring-2 ring-[#FFEDD5]" />
                <div>
                  <h4 className="font-bold text-[#1C1917] text-xs">Ananya Iyer</h4>
                  <span className="text-[10px] text-[#78716C]">Product Manager, Bengaluru</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 11. FAQ */}
      <section className="py-16 bg-[#FAFAF9]">
        <div className="container mx-auto px-4 md:px-8 max-w-3xl">
          <div className="text-center mb-10">
            <span className="text-xs font-extrabold text-[#0F766E] uppercase tracking-widest bg-[#0F766E]/10 px-3.5 py-1.5 rounded-full border border-[#0F766E]/20 inline-block mb-2">
              HELP & HELPDESK
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#1C1917] tracking-tight">
              Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0F766E] to-teal-500">Questions</span>
            </h2>
            <p className="text-xs text-[#78716C] mt-2">Everything you need to know about ePayEvents platform & ticketing</p>
          </div>

          <div className="space-y-4">
            {homeFaqs.map((faq, idx) => (
              <div key={idx} className="bg-white rounded-xl border border-[#E7E5E4] overflow-hidden shadow-sm">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full text-left p-4 font-bold text-sm text-[#1C1917] flex justify-between items-center"
                >
                  <span>{faq.question}</span>
                  <ChevronDown className={`h-4 w-4 text-[#78716C] transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === idx && (
                  <div className="px-4 pb-4 text-xs text-[#78716C] leading-relaxed border-t border-[#E7E5E4] pt-3">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 12. FOOTER */}
      <Footer />
    </div>
  );
}
