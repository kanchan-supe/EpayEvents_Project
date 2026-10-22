'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, useInView, Variants } from 'framer-motion';
import { 
  Search, MapPin, Sparkles, Cpu, Briefcase, Music, BookOpen, HeartPulse, Palette, ArrowRight, 
  Calendar, ShieldCheck, Zap, BarChart2, Quote, 
  ChevronDown, CreditCard, QrCode, Clock, Mail, Percent, FileSpreadsheet, Lock, Activity,
  Star, CheckCircle2, ThumbsUp, TrendingUp, Users, DollarSign, Award, ChevronRight, ChevronLeft,
  PartyPopper, Heart, Mic2, Sun, Trophy, UtensilsCrossed, HandHeart, ShoppingBag, Smile, Gem,
  Pause, Play
} from 'lucide-react';
import { Navbar, Footer } from '@/components/NavbarFooter';
import { EventCard } from '@/components/EventCard';
import { Logo } from '@/components/Logo';
import { mockCategories, mockEvents } from '@/lib/data';
import { useAuth } from '@/context/AuthContext';

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
  Users: <Users className="h-6 w-6 text-indigo-600" />,
  PartyPopper: <PartyPopper className="h-6 w-6 text-purple-600" />,
  Sparkles: <Sparkles className="h-6 w-6 text-fuchsia-600" />,
  Heart: <Heart className="h-6 w-6 text-rose-500" />,
  Mic2: <Mic2 className="h-6 w-6 text-amber-500" />,
  Sun: <Sun className="h-6 w-6 text-orange-500" />,
  Trophy: <Trophy className="h-6 w-6 text-yellow-600" />,
  UtensilsCrossed: <UtensilsCrossed className="h-6 w-6 text-emerald-600" />,
  HandHeart: <HandHeart className="h-6 w-6 text-teal-600" />,
  ShoppingBag: <ShoppingBag className="h-6 w-6 text-blue-600" />,
  Smile: <Smile className="h-6 w-6 text-cyan-600" />,
  Gem: <Gem className="h-6 w-6 text-pink-500" />,
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
  const { user } = useAuth();
  const [currentBg, setCurrentBg] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activeStep, setActiveStep] = useState(4);

  const heroRef = useRef<HTMLDivElement>(null);
  const categoriesScrollRef = useRef<HTMLDivElement>(null);
  const [isCategoriesMarqueePaused, setIsCategoriesMarqueePaused] = useState(false);

  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoriesScrollRef.current) {
      const scrollAmount = direction === 'left' ? -380 : 380;
      categoriesScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

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

  // Helper function to calculate automatic event status: live | upcoming | past
  const checkEventStatus = (dateStr?: string): 'live' | 'upcoming' | 'past' => {
    if (!dateStr) return 'upcoming';
    const match = String(dateStr).match(/^(\d{4}-\d{2}-\d{2})/);
    const dateOnly = match ? match[1] : dateStr.split('T')[0];
    if (!dateOnly || !/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) return 'upcoming';

    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const today = `${y}-${m}-${d}`;

    if (dateOnly === today) return 'live';
    if (dateOnly > today) return 'upcoming';
    return 'past';
  };

  const [eventsList] = useState(mockEvents);
  const [apiEvents, setApiEvents] = useState<any[]>([]);
  const [apiPastEvents, setApiPastEvents] = useState<any[]>([]);

  useEffect(() => {
    // Fetch live published events from API, sort into Live+Upcoming and Past
    async function fetchPublishedEvents() {
      try {
        const res = await fetch('/api/events');
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          // Live and Upcoming events
          const liveAndUpcoming = json.data.filter((e: any) => {
            const rawDate = e.date || e.startDate || '';
            const status = e.eventStatus || checkEventStatus(rawDate);
            return status === 'live' || status === 'upcoming';
          });
          setApiEvents(liveAndUpcoming.slice(0, 6));

          // Past events from backend
          const past = json.data.filter((e: any) => {
            const rawDate = e.date || e.startDate || '';
            const status = e.eventStatus || checkEventStatus(rawDate);
            return status === 'past';
          });
          setApiPastEvents(past.slice(0, 6));
        }
      } catch (err) {
        console.error('[HomePage] Failed fetching /api/events:', err);
      }
    }
    fetchPublishedEvents();
  }, []);

  // Filter fallback mock events to only Live + Upcoming, sorted nearest first
  const activeEvents = eventsList
    .filter(e => {
      const status = checkEventStatus(e.date || e.startDate);
      return (status === 'live' || status === 'upcoming') && e.status !== 'cancelled';
    })
    .sort((a, b) => {
      const dateA = (a.date || a.startDate || '').split('T')[0];
      const dateB = (b.date || b.startDate || '').split('T')[0];
      return dateA.localeCompare(dateB);
    });

  // Filter fallback mock events for past events
  const fallbackPastEvents = eventsList
    .filter(e => {
      const status = checkEventStatus(e.date || e.startDate);
      return status === 'past' || e.status === 'ended';
    })
    .sort((a, b) => {
      const dateA = (a.date || a.startDate || '').split('T')[0];
      const dateB = (b.date || b.startDate || '').split('T')[0];
      return dateB.localeCompare(dateA); // most recent past event first
    });

  const mainLiveEvent = activeEvents[0] || eventsList[0];
  const gridLiveEvents = activeEvents.slice(1, 5);
  const upcomingEvents = activeEvents.slice(0, 6);
  const pastEvents = apiPastEvents.length > 0 ? apiPastEvents : fallbackPastEvents.slice(0, 6);

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
              <form action="/events" method="GET" suppressHydrationWarning className="bg-white p-2.5 rounded-2xl shadow-2xl flex flex-col sm:flex-row gap-2 border border-[#E7E5E4]">
                <div className="flex-1 flex items-center gap-3 px-3 py-2 border-b sm:border-b-0 sm:border-r border-[#E7E5E4]">
                  <Search className="h-5 w-5 text-[#0F766E]" />
                  <input
                    type="text"
                    name="query"
                    suppressHydrationWarning
                    placeholder="Search event name, topic, or keyword..."
                    className="w-full bg-transparent text-[#1C1917] placeholder-[#78716C] text-sm focus:outline-none"
                  />
                </div>

                <div className="flex-1 flex items-center gap-3 px-3 py-2">
                  <MapPin className="h-5 w-5 text-[#0F766E]" />
                  <input
                    type="text"
                    name="location"
                    suppressHydrationWarning
                    placeholder="City or location..."
                    className="w-full bg-transparent text-[#1C1917] placeholder-[#78716C] text-sm focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  suppressHydrationWarning
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
              <span className="text-xs uppercase tracking-widest text-[#059669] font-extrabold flex items-center gap-1.5 bg-[#059669]/10 px-3 py-1 rounded-full w-fit mb-3.5 border border-[#059669]/20">
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
                  href={user ? `/events/${mainLiveEvent.slug}` : `/login?redirect=${encodeURIComponent(`/events/${mainLiveEvent.slug}`)}`}
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
                  href={user ? `/events/${evt.slug}` : `/login?redirect=${encodeURIComponent(`/events/${evt.slug}`)}`}
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


      {/* 3. UPCOMING EVENTS (Curated 6 Events on Homepage) */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-xs font-extrabold text-[#F97316] uppercase tracking-widest bg-[#F97316]/10 px-3 py-1 rounded-full border border-[#F97316]/20 inline-block mb-3.5">
                HANDPICKED SELECTIONS
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-[#1C1917] tracking-tight">
                Upcoming <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F97316] to-amber-500">Events</span>
              </h2>
              <p className="text-xs text-[#78716C] mt-1">Featured upcoming conferences, masterclasses & summits</p>
            </div>
            <Link href="/events" className="text-sm font-bold text-[#0F766E] hover:text-[#115E59] flex items-center gap-1.5 bg-[#0F766E]/10 hover:bg-[#0F766E]/20 px-4 py-2 rounded-xl transition">
              View All Events <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {apiEvents.length > 0 ? (
              apiEvents.slice(0, 6).map((evt: any) => (
                <motion.div key={evt.id} variants={itemVariants}>
                  <EventCard
                    id={evt.id}
                    title={evt.title}
                    slug={evt.slug}
                    coverImage={evt.coverImage}
                    date={evt.date}
                    startDate={evt.startDate}
                    endDate={evt.endDate}
                    startTime={evt.startTime}
                    endTime={evt.endTime}
                    venue={evt.venue}
                    city={evt.city}
                    isOnline={evt.isOnline}
                    startingPrice={evt.startingPrice}
                    availableSeats={evt.availableSeats}
                    category={evt.category}
                    organizerName={evt.organizer?.name}
                  />
                </motion.div>
              ))
            ) : (
              upcomingEvents.slice(0, 6).map(evt => (
                <motion.div key={evt.id} variants={itemVariants}>
                  <EventCard event={evt} />
                </motion.div>
              ))
            )}
          </motion.div>
        </div>
      </section>

      {/* 4. PAST EVENTS SECTION (CONCLUDED CONCLAVES ARCHIVE) */}
      <section className="py-16 bg-[#FAFAF9]">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-xs font-extrabold text-[#78716C] uppercase tracking-widest bg-[#E7E5E4] px-3 py-1 rounded-full inline-flex items-center gap-1.5 mb-3.5">
                <Clock className="h-3.5 w-3.5 text-[#78716C]" /> ARCHIVED CONCLAVES
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-[#1C1917] tracking-tight">
                Past <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-700 to-slate-900">Events Archive</span>
              </h2>
              <p className="text-xs text-[#78716C] mt-1">Review concluded events, past schedules & proceedings</p>
            </div>
            <Link href="/events?tab=past" className="text-sm font-bold text-slate-700 hover:text-slate-900 flex items-center gap-1.5 bg-slate-200/70 hover:bg-slate-200 px-4 py-2 rounded-xl transition">
              View All Past Events <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {pastEvents.map((evt: any) => (
              <motion.div key={evt.id} variants={itemVariants}>
                {evt.coverImage ? (
                  <EventCard
                    id={evt.id}
                    title={evt.title}
                    slug={evt.slug}
                    coverImage={evt.coverImage}
                    date={evt.date}
                    startDate={evt.startDate}
                    endDate={evt.endDate}
                    startTime={evt.startTime}
                    endTime={evt.endTime}
                    venue={evt.venue}
                    city={evt.city}
                    isOnline={evt.isOnline}
                    startingPrice={evt.startingPrice}
                    availableSeats={evt.availableSeats}
                    category={evt.category}
                    organizerName={evt.organizer?.name}
                    eventStatus="past"
                  />
                ) : (
                  <EventCard event={evt} eventStatus="past" />
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 5. POPULAR CATEGORIES (CONTINUOUS AUTO-MOVING TICKER MARQUEE) */}
      <section className="py-16 bg-[#FAFAF9] border-y border-stone-200/70 overflow-hidden relative">
        <div className="container mx-auto px-4 md:px-8 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-extrabold text-[#059669] uppercase tracking-widest bg-[#059669]/10 px-3 py-1 rounded-full border border-[#059669]/20 inline-block mb-3.5">
                DISCOVER BY INTEREST
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-[#1C1917] tracking-tight">
                Popular <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#059669] to-emerald-600">Categories</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#78716C] mt-1">
                Explore handpicked events, summits, workshops & parties across 18 unique domains
              </p>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
              {/* Play / Pause Toggle Button */}
              <button
                type="button"
                onClick={() => setIsCategoriesMarqueePaused(prev => !prev)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-xs font-bold text-stone-700 shadow-2xs transition active:scale-95"
                title={isCategoriesMarqueePaused ? 'Resume auto-movement' : 'Pause auto-movement'}
              >
                {isCategoriesMarqueePaused ? (
                  <>
                    <Play className="h-3.5 w-3.5 text-emerald-600 fill-emerald-600" />
                    <span>Play Motion</span>
                  </>
                ) : (
                  <>
                    <Pause className="h-3.5 w-3.5 text-[#F97316]" />
                    <span>Pause</span>
                  </>
                )}
              </button>

              <Link
                href="/events"
                className="text-xs sm:text-sm font-bold text-[#0F766E] hover:text-[#115E59] flex items-center gap-1.5 bg-white hover:bg-stone-50 border border-stone-200 px-4 py-2 rounded-xl transition shadow-2xs group"
              >
                <span>All {mockCategories.length} Categories</span>
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        {/* Continuous Infinite Moving Marquee with Left & Right Gradient Fade */}
        <div className="relative w-full">
          {/* Left Gradient Edge Vignette */}
          <div className="absolute top-0 bottom-0 left-0 w-16 sm:w-28 bg-gradient-to-r from-[#FAFAF9] to-transparent z-10 pointer-events-none" />

          {/* Right Gradient Edge Vignette */}
          <div className="absolute top-0 bottom-0 right-0 w-16 sm:w-28 bg-gradient-to-l from-[#FAFAF9] to-transparent z-10 pointer-events-none" />

          <div className={`animate-marquee py-2 ${isCategoriesMarqueePaused ? 'animate-marquee-paused' : ''}`}>
            {/* Render 2 identical loops of the categories for seamless, non-stop circular loop */}
            {[...mockCategories, ...mockCategories].map((cat, idx) => (
              <div
                key={`${cat.id}-${idx}`}
                className="shrink-0 w-[190px] sm:w-[210px] mx-2"
              >
                <Link
                  href={`/events?category=${cat.slug}`}
                  className="group flex flex-col items-center text-center p-5 rounded-2xl border border-stone-200/90 bg-white hover:border-[#0F766E] hover:shadow-xl transition-all duration-300 h-full relative overflow-hidden"
                >
                  {/* Glowing Top Accent on Hover */}
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#0F766E] to-[#F97316] opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-100 shadow-2xs mb-3.5 group-hover:scale-110 group-hover:bg-[#0F766E]/10 transition-all duration-300">
                    {categoryIconMap[cat.icon] || <Cpu className="h-6 w-6 text-[#0F766E]" />}
                  </div>

                  <h3 className="font-bold text-[#1C1917] text-xs sm:text-sm group-hover:text-[#0F766E] transition line-clamp-1">
                    {cat.name}
                  </h3>

                  <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-stone-100 text-[11px] font-semibold text-stone-600 group-hover:bg-emerald-50 group-hover:text-emerald-700 transition">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span><AnimatedCounter value={cat.count || 0} /> Events</span>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. REDESIGNED MODERN GAMING-STYLE END-TO-END WORKFLOW SECTION */}
      <section className="py-14 sm:py-16 bg-[#0F172A] text-white border-y border-slate-800 relative overflow-hidden">
        {/* Futuristic Glowing Background Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#F97316]/15 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute inset-0 bg-[radial-gradient(#0F766E_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none"></div>

        <div className="container mx-auto px-4 md:px-8 max-w-5xl relative z-10 space-y-8">
          {/* Gaming Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 border border-cyan-400/40 px-4 py-1.5 text-xs font-bold text-cyan-300 uppercase tracking-widest backdrop-blur-md shadow-[0_0_15px_rgba(6,182,212,0.25)] mb-3.5">
              <Sparkles className="h-4 w-4 text-cyan-400 animate-spin" /> Quest Progression Map
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
              Everything You Need to Run an Event — <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-[#F97316] to-emerald-400">In One Place</span>
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
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
                  type="button"
                  suppressHydrationWarning
                  onClick={() => setActiveStep(num)}
                  className={`w-8 h-8 rounded-full font-black text-[11px] transition-all flex items-center justify-center ${
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
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-8 max-w-6xl space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-2.5">
            <span className="text-xs font-extrabold text-[#0F766E] uppercase tracking-widest bg-[#0F766E]/10 px-3.5 py-1.5 rounded-full border border-[#0F766E]/20 inline-block mb-3.5">
              PROVEN ENGINE
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#1C1917] tracking-tight">
              Smart Features That <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0F766E] to-[#F97316]">Actually Help Event Creators</span>
            </h2>
            <p className="text-[#78716C] text-sm leading-relaxed">
              Tools designed to save time and reduce manual work — not just look fancy.
            </p>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left pt-2"
          >
            {/* Feature 1 */}
            <motion.div variants={itemVariants} whileHover={{ y: -4, transition: { duration: 0.2 } }} className="p-6 rounded-3xl bg-[#FAFAF9] border border-[#E7E5E4] hover:border-[#0F766E]/50 hover:shadow-lg transition-all space-y-3">
              <div className="p-3 w-fit bg-[#0F766E]/10 text-[#0F766E] rounded-2xl">
                <Zap className="h-6 w-6 text-[#0F766E]" />
              </div>
              <h3 className="font-extrabold text-[#1C1917] text-base">Quick Event Creation</h3>
              <p className="text-xs text-[#78716C] leading-relaxed">
                Fill basic details and the system helps you structure tickets, registration form and pricing. Publish faster.
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div variants={itemVariants} whileHover={{ y: -4, transition: { duration: 0.2 } }} className="p-6 rounded-3xl bg-[#FAFAF9] border border-[#E7E5E4] hover:border-[#F97316]/50 hover:shadow-lg transition-all space-y-3">
              <div className="p-3 w-fit bg-[#F97316]/10 text-[#F97316] rounded-2xl">
                <Mail className="h-6 w-6 text-[#F97316]" />
              </div>
              <h3 className="font-extrabold text-[#1C1917] text-base">Automated Reminders</h3>
              <p className="text-xs text-[#78716C] leading-relaxed">
                Send registration confirmation, payment success and event reminder emails/SMS automatically. Less follow-up work for you.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div variants={itemVariants} whileHover={{ y: -4, transition: { duration: 0.2 } }} className="p-6 rounded-3xl bg-[#FAFAF9] border border-[#E7E5E4] hover:border-[#059669]/50 hover:shadow-lg transition-all space-y-3">
              <div className="p-3 w-fit bg-[#059669]/10 text-[#059669] rounded-2xl">
                <Percent className="h-6 w-6 text-[#059669]" />
              </div>
              <h3 className="font-extrabold text-[#1C1917] text-base">Coupon & Offer Engine</h3>
              <p className="text-xs text-[#78716C] leading-relaxed">
                Create discount codes, early-bird pricing and group offers in a few clicks. Control usage limits easily.
              </p>
            </motion.div>

            {/* Feature 4 */}
            <motion.div variants={itemVariants} whileHover={{ y: -4, transition: { duration: 0.2 } }} className="p-6 rounded-3xl bg-[#FAFAF9] border border-[#E7E5E4] hover:border-[#0F766E]/50 hover:shadow-lg transition-all space-y-3">
              <div className="p-3 w-fit bg-[#0F766E]/10 text-[#0F766E] rounded-2xl">
                <QrCode className="h-6 w-6 text-[#0F766E]" />
              </div>
              <h3 className="font-extrabold text-[#1C1917] text-base">Real-time Check-in</h3>
              <p className="text-xs text-[#78716C] leading-relaxed">
                Live count of how many people have entered. Useful for both small workshops and large conferences.
              </p>
            </motion.div>

            {/* Feature 5 */}
            <motion.div variants={itemVariants} whileHover={{ y: -4, transition: { duration: 0.2 } }} className="p-6 rounded-3xl bg-[#FAFAF9] border border-[#E7E5E4] hover:border-[#F97316]/50 hover:shadow-lg transition-all space-y-3 sm:col-span-2 lg:col-span-1">
              <div className="p-3 w-fit bg-[#F97316]/10 text-[#F97316] rounded-2xl">
                <FileSpreadsheet className="h-6 w-6 text-[#F97316]" />
              </div>
              <h3 className="font-extrabold text-[#1C1917] text-base">Basic Reports</h3>
              <p className="text-xs text-[#78716C] leading-relaxed">
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
            <span className="text-xs font-extrabold text-[#0F766E] uppercase tracking-widest bg-[#0F766E]/10 px-3.5 py-1.5 rounded-full border border-[#0F766E]/20 inline-block mb-3.5">
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

      {/* 9. ORGANIZERS GROWING WITH EPAYEVENTS (REDESIGNED HIGH-IMPACT GROWTH ENGINE) */}
      <section className="py-14 sm:py-16 bg-gradient-to-b from-[#0F172A] via-[#1E293B] to-[#0F172A] text-white relative overflow-hidden">
        {/* Subtle decorative mesh background */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 md:px-8 max-w-5xl relative z-10 space-y-8">
          {/* Header & Growth Ribbon */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-300 text-xs font-black uppercase tracking-widest mb-3.5">
                <TrendingUp className="h-3.5 w-3.5 text-teal-400" />
                VERIFIED ORGANIZER BENCHMARKS
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                Organizers Growing with <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-300 to-[#F97316]">ePayEvents</span>
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Real operational benchmarks and financial metrics from conference founders, community leads, and festival directors scaling on our infrastructure.
              </p>
            </div>

            {/* Quick Host CTA in Header */}
            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/create-event"
                className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#F97316] to-amber-500 hover:brightness-110 px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-xl shadow-orange-500/20 transition-all"
              >
                <span>Host Your Next Event</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Aggregate Growth Stats Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-700/80 backdrop-blur-md shadow-2xl">
            <div className="p-3">
              <span className="text-xs text-slate-400 block font-medium">Platform Pass Volume</span>
              <div className="text-2xl sm:text-3xl font-black text-white mt-1">
                <AnimatedCounter value={52000} suffix="+" />
              </div>
              <span className="text-[11px] text-teal-400 font-bold flex items-center gap-1 mt-0.5">
                <TrendingUp className="h-3 w-3" /> +142% year-on-year
              </span>
            </div>

            <div className="p-3 border-l border-slate-800">
              <span className="text-xs text-slate-400 block font-medium">Average Gate Scan Speed</span>
              <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1">1.8s</div>
              <span className="text-[10px] text-slate-400 font-medium mt-0.5 block">Zero turnstile queue lag</span>
            </div>

            <div className="p-3 border-l-0 lg:border-l border-slate-800">
              <span className="text-xs text-slate-400 block font-medium">Revenue Disbursed</span>
              <div className="text-2xl sm:text-3xl font-black text-amber-400 mt-1">₹4.8 Cr+</div>
              <span className="text-[11px] text-amber-300 font-bold mt-0.5 block">Same-day bank settlement</span>
            </div>

            <div className="p-3 border-l border-slate-800">
              <span className="text-xs text-slate-400 block font-medium">Organizer Retention</span>
              <div className="text-2xl sm:text-3xl font-black text-teal-300 mt-1">96.8%</div>
              <span className="text-[11px] text-emerald-400 font-bold mt-0.5 block">Recurring multi-edition hosts</span>
            </div>
          </div>

          {/* 3 Executive Case Study Story Cards */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-5"
          >
            {/* Story 1: AI Builders Club */}
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 sm:p-5 flex flex-col justify-between hover:border-teal-500/50 hover:shadow-2xl hover:shadow-teal-500/10 transition-all group relative overflow-hidden"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <div>
                    <span className="text-[10px] font-black tracking-wider text-teal-400 uppercase bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 rounded-md">
                      HACKATHON & TECH
                    </span>
                    <h3 className="font-extrabold text-white text-base mt-1">AI Builders Club</h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/10 text-slate-300 border border-white/10">
                    Bengaluru
                  </span>
                </div>

                {/* Metric Badges */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
                    <span className="text-[10px] text-slate-400 block font-medium uppercase tracking-wider">Passes Sold</span>
                    <span className="text-lg sm:text-xl font-black text-white mt-0.5 block">
                      <AnimatedCounter value={2450} suffix="+" />
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold">100% Sold Out</span>
                  </div>

                  <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
                    <span className="text-[10px] text-slate-400 block font-medium uppercase tracking-wider">Gate Scan Speed</span>
                    <span className="text-lg sm:text-xl font-black text-teal-300 mt-0.5 block">2.1s</span>
                    <span className="text-[10px] text-teal-400 font-bold">4 Turnstiles</span>
                  </div>
                </div>

                <div className="bg-slate-800/40 p-2.5 sm:p-3 rounded-xl border border-slate-800/80">
                  <p className="text-[11px] text-slate-300 leading-relaxed italic">
                    &quot;We managed custom team submission questions and scanned 2,000+ hackers at gate entry seamlessly. ePayEvents eliminated zero-day queue chaos.&quot;
                  </p>
                </div>
              </div>

              {/* Organizer Profile Footer */}
              <div className="pt-3.5 border-t border-slate-800 mt-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/speakers/speaker4.jpg" alt="Karan Sharma" className="h-9 w-9 rounded-xl object-cover ring-2 ring-teal-500/30 shadow-md" />
                  <div>
                    <h4 className="font-bold text-white text-xs">Karan Sharma</h4>
                    <span className="text-[10px] text-slate-400">Lead Organizer, AI Builders</span>
                  </div>
                </div>
                <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400 group-hover:scale-110 transition-transform">
                  <Award className="h-4 w-4" />
                </div>
              </div>
            </motion.div>

            {/* Story 2: FinTech Next Summit */}
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 sm:p-5 flex flex-col justify-between hover:border-orange-500/50 hover:shadow-2xl hover:shadow-orange-500/10 transition-all group relative overflow-hidden"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <div>
                    <span className="text-[10px] font-black tracking-wider text-orange-400 uppercase bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-md">
                      EXECUTIVE SUMMIT
                    </span>
                    <h3 className="font-extrabold text-white text-base mt-1">FinTech Next Summit</h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/10 text-slate-300 border border-white/10">
                    Mumbai
                  </span>
                </div>

                {/* Metric Badges */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
                    <span className="text-[10px] text-slate-400 block font-medium uppercase tracking-wider">Revenue Settled</span>
                    <span className="text-lg sm:text-xl font-black text-amber-400 mt-0.5 block">₹14.8 L</span>
                    <span className="text-[10px] text-amber-300 font-bold">Same-Day Payout</span>
                  </div>

                  <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
                    <span className="text-[10px] text-slate-400 block font-medium uppercase tracking-wider">Show-up Rate</span>
                    <span className="text-lg sm:text-xl font-black text-emerald-400 mt-0.5 block">
                      <AnimatedCounter value={94} suffix="%" />
                    </span>
                    <span className="text-[10px] text-emerald-300 font-bold">Automated SMS/Mail</span>
                  </div>
                </div>

                <div className="bg-slate-800/40 p-2.5 sm:p-3 rounded-xl border border-slate-800/80">
                  <p className="text-[11px] text-slate-300 leading-relaxed italic">
                    &quot;Automated WhatsApp and email reminders reduced our no-show rates drastically. Instant UPI settlements gave us immediate cash flow.&quot;
                  </p>
                </div>
              </div>

              {/* Organizer Profile Footer */}
              <div className="pt-3.5 border-t border-slate-800 mt-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/speakers/speaker3.jpg" alt="Rajesh Kulkarni" className="h-9 w-9 rounded-xl object-cover ring-2 ring-orange-500/30 shadow-md" />
                  <div>
                    <h4 className="font-bold text-white text-xs">Rajesh Kulkarni</h4>
                    <span className="text-[10px] text-slate-400">Head of Events, FinTech Next</span>
                  </div>
                </div>
                <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-400 group-hover:scale-110 transition-transform">
                  <Award className="h-4 w-4" />
                </div>
              </div>
            </motion.div>

            {/* Story 3: Pune Indie Music Fest */}
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 sm:p-5 flex flex-col justify-between hover:border-pink-500/50 hover:shadow-2xl hover:shadow-pink-500/10 transition-all group relative overflow-hidden"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <div>
                    <span className="text-[10px] font-black tracking-wider text-pink-400 uppercase bg-pink-500/10 border border-pink-500/20 px-2 py-0.5 rounded-md">
                      CONCERT & FESTIVAL
                    </span>
                    <h3 className="font-extrabold text-white text-base mt-1">Pune Indie Music Fest</h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/10 text-slate-300 border border-white/10">
                    Pune
                  </span>
                </div>

                {/* Metric Badges */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
                    <span className="text-[10px] text-slate-400 block font-medium uppercase tracking-wider">Crowd Checked-in</span>
                    <span className="text-lg sm:text-xl font-black text-white mt-0.5 block">
                      <AnimatedCounter value={4120} />
                    </span>
                    <span className="text-[10px] text-pink-400 font-bold">Night Gate Operations</span>
                  </div>

                  <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
                    <span className="text-[10px] text-slate-400 block font-medium uppercase tracking-wider">Promo Lift</span>
                    <span className="text-lg sm:text-xl font-black text-pink-300 mt-0.5 block">
                      <AnimatedCounter value={38} suffix="%" />
                    </span>
                    <span className="text-[10px] text-pink-300 font-bold">Group Pass Codes</span>
                  </div>
                </div>

                <div className="bg-slate-800/40 p-2.5 sm:p-3 rounded-xl border border-slate-800/80">
                  <p className="text-[11px] text-slate-300 leading-relaxed italic">
                    &quot;Early bird discounts and group ticketing tools boosted our first-week sales by 250%. Scanning with mobile phones was effortlessly fast.&quot;
                  </p>
                </div>
              </div>

              {/* Organizer Profile Footer */}
              <div className="pt-3.5 border-t border-slate-800 mt-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/organizers/event_manager_qr.jpg" alt="Priya Deshmukh" className="h-9 w-9 rounded-xl object-cover ring-2 ring-pink-500/30 shadow-md" />
                  <div>
                    <h4 className="font-bold text-white text-xs">Priya Deshmukh</h4>
                    <span className="text-[10px] text-slate-400">Festival Curator, Indie Pulse</span>
                  </div>
                </div>
                <div className="p-1.5 rounded-lg bg-pink-500/10 text-pink-400 group-hover:scale-110 transition-transform">
                  <Award className="h-4 w-4" />
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Organizer Quick Callout Bar */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-teal-900/60 via-slate-900 to-amber-950/60 border border-slate-700/80 flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-2xl bg-teal-500/20 text-teal-300 border border-teal-500/30">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-black text-white">Ready to host your own tech summit, workshop or conference?</h4>
                <p className="text-xs text-slate-300">Set up custom registration tickets, pricing tiers, and launch gate operations in minutes.</p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/organizer/dashboard"
                className="text-xs font-bold text-slate-300 hover:text-white transition px-4 py-2.5 rounded-xl border border-white/10 hover:bg-white/5"
              >
                View Demo Dashboard
              </Link>
              <Link
                href="/create-event"
                className="text-xs font-black text-slate-950 bg-amber-400 hover:bg-amber-300 transition px-5 py-2.5 rounded-xl shadow-lg flex items-center gap-1.5"
              >
                <span>Create Event Free</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 10. WHAT ATTENDEES ARE SAYING (REDESIGNED HIGH-IMPACT SOCIAL PROOF SHOWCASE) */}
      <section className="py-24 bg-gradient-to-b from-white via-slate-50/80 to-[#FAFAF9] relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 md:px-8 max-w-6xl relative z-10">
          {/* Header & Overall Rating Badge */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div className="space-y-3 max-w-xl">
              <div className="flex items-center gap-2 mb-3.5">
                <span className="text-xs font-black text-[#F97316] uppercase tracking-widest bg-[#F97316]/10 px-3.5 py-1.5 rounded-full border border-[#F97316]/20 inline-flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-[#F97316]" />
                  VERIFIED ATTENDEE REVIEWS
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
                  <CheckCircle2 className="h-3 w-3 text-teal-600" />
                  100% Genuine Pass Holders
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#1C1917] tracking-tight">
                What Attendees <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F97316] via-amber-500 to-teal-600">Are Saying</span>
              </h2>
              <p className="text-sm text-[#78716C] leading-relaxed">
                Direct testimonials from engineers, founders, designers, and students who booked tickets and checked in with ePayEvents.
              </p>
            </div>

            {/* Social Proof Metric Card */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5 shrink-0 self-start md:self-auto">
              <div className="flex flex-col">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-black text-slate-900 tracking-tight">4.92</span>
                  <span className="text-xs text-slate-400 font-bold">/ 5.0</span>
                </div>
                <div className="flex items-center gap-1 text-amber-400 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400" />
                  ))}
                </div>
              </div>
              <div className="h-10 w-px bg-slate-200" />
              <div>
                <span className="text-xs font-black text-slate-900 block">12,400+ Verified Passes</span>
                <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-0.5">
                  <ThumbsUp className="h-3 w-3" /> 98.4% Would Attend Again
                </span>
              </div>
            </div>
          </div>

          {/* Testimonial Cards Grid (4 Diverse Attendee Stories) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Review 1 */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.05 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-teal-500/40 transition-all flex flex-col justify-between group relative"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 border border-teal-200">
                    AI Tech Track
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  &quot;Checking into the AI summit took literally <span className="font-bold text-slate-900 bg-amber-100/60 px-1 py-0.5 rounded">3 seconds</span>. Held my phone QR up to the organizer scanner and walked right in without queue frustration.&quot;
                </p>

                <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">Attended AI Business Summit 2026</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-5 flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/speakers/speaker1.jpg"
                  alt="Rohan Verma"
                  className="h-11 w-11 rounded-2xl object-cover ring-2 ring-teal-500/20 shadow-sm shrink-0"
                />
                <div className="min-w-0">
                  <h4 className="font-extrabold text-slate-900 text-xs truncate">Rohan Verma</h4>
                  <p className="text-[11px] text-slate-500 truncate">Senior Software Architect</p>
                  <span className="text-[10px] text-teal-600 font-semibold block">Mumbai · Verified Attendee</span>
                </div>
              </div>
            </motion.div>

            {/* Review 2 */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-orange-500/40 transition-all flex flex-col justify-between group relative"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-orange-50 text-orange-700 border border-orange-200">
                    FinTech Pass
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  &quot;Instant PDF pass with full schedule breakdown. I transferred one extra pass to my teammate 24 hours prior with zero fees. Exceptional platform UI.&quot;
                </p>

                <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">Attended FinTech & Payments Summit</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-5 flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/speakers/speaker2.jpg"
                  alt="Ananya Iyer"
                  className="h-11 w-11 rounded-2xl object-cover ring-2 ring-orange-500/20 shadow-sm shrink-0"
                />
                <div className="min-w-0">
                  <h4 className="font-extrabold text-slate-900 text-xs truncate">Ananya Iyer</h4>
                  <p className="text-[11px] text-slate-500 truncate">VP of Product, FinPulse</p>
                  <span className="text-[10px] text-orange-600 font-semibold block">Bengaluru · Verified Attendee</span>
                </div>
              </div>
            </motion.div>

            {/* Review 3 */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.25 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-emerald-500/40 transition-all flex flex-col justify-between group relative"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Design Track
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  &quot;The interactive location map helped me find parking right next to the convention hall. Venue directions were 100% accurate. 10/10 event experience.&quot;
                </p>

                <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">Attended UX & Design Conclave</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-5 flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/speakers/speaker3.jpg"
                  alt="Vikram Malhotra"
                  className="h-11 w-11 rounded-2xl object-cover ring-2 ring-emerald-500/20 shadow-sm shrink-0"
                />
                <div className="min-w-0">
                  <h4 className="font-extrabold text-slate-900 text-xs truncate">Vikram Malhotra</h4>
                  <p className="text-[11px] text-slate-500 truncate">Lead UX Specialist</p>
                  <span className="text-[10px] text-emerald-600 font-semibold block">Hyderabad · Verified Attendee</span>
                </div>
              </div>
            </motion.div>

            {/* Review 4 */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.35 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-pink-500/40 transition-all flex flex-col justify-between group relative"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-pink-50 text-pink-700 border border-pink-200">
                    Concert Pass
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  &quot;Got a 15% group discount when booking passes for my college squad. Zero hidden convenience fees. Mobile gate scanner accepted dark-mode screens cleanly.&quot;
                </p>

                <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">Attended Indie Acoustic Sunset</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-5 flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/speakers/speaker4.jpg"
                  alt="Kavita Nair"
                  className="h-11 w-11 rounded-2xl object-cover ring-2 ring-pink-500/20 shadow-sm shrink-0"
                />
                <div className="min-w-0">
                  <h4 className="font-extrabold text-slate-900 text-xs truncate">Kavita Nair</h4>
                  <p className="text-[11px] text-slate-500 truncate">Independent Community Curator</p>
                  <span className="text-[10px] text-pink-600 font-semibold block">Pune · Verified Attendee</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Social Proof Footer Ribbon */}
          <div className="mt-12 p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-700">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900">Verified Ticket Protection & Gate Entry Guarantee</h4>
                <p className="text-[11px] text-slate-500">Every review is tied to an encrypted ticket code scanned at the entrance gate.</p>
              </div>
            </div>

            <Link
              href="/events"
              className="text-xs font-extrabold text-[#0F766E] hover:text-[#115E59] flex items-center gap-1.5 transition shrink-0 group"
            >
              <span>Explore Top-Rated Summits</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* 11. FAQ */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-8 max-w-3xl">
          <div className="text-center mb-10">
            <span className="text-xs font-extrabold text-[#0F766E] uppercase tracking-widest bg-[#0F766E]/10 px-3.5 py-1.5 rounded-full border border-[#0F766E]/20 inline-block mb-3.5">
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
                  type="button"
                  suppressHydrationWarning
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
