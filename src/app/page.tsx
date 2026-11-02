'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, useInView, Variants, AnimatePresence } from 'framer-motion';
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
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1920&q=80', // Vibrant festival crowd with warm confetti & lights
  'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=1920&q=80', // Live concert with stage spotlights
  'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1920&q=80', // Modern conference auditorium
  'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1920&q=80', // Evening festival arena
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1920&q=80', // Colorful party & stage lights
];

const rotatingHeroPhrases = [
  'People Actually Remember',
  'Sell Out in Minutes',
  'Check-In in 0.5 Seconds',
  'Bring People Together',
];

const categoryIconMap: Record<string, React.ReactNode> = {
  Cpu: <Cpu className="h-6 w-6 text-[#059669]" />,
  Briefcase: <Briefcase className="h-6 w-6 text-[#F59E0B]" />,
  Music: <Music className="h-6 w-6 text-pink-600" />,
  BookOpen: <BookOpen className="h-6 w-6 text-[#059669]" />,
  HeartPulse: <HeartPulse className="h-6 w-6 text-red-500" />,
  Palette: <Palette className="h-6 w-6 text-amber-600" />,
  Users: <Users className="h-6 w-6 text-emerald-700" />,
  PartyPopper: <PartyPopper className="h-6 w-6 text-purple-600" />,
  Sparkles: <Sparkles className="h-6 w-6 text-fuchsia-600" />,
  Heart: <Heart className="h-6 w-6 text-rose-500" />,
  Mic2: <Mic2 className="h-6 w-6 text-amber-500" />,
  Sun: <Sun className="h-6 w-6 text-orange-500" />,
  Trophy: <Trophy className="h-6 w-6 text-yellow-600" />,
  UtensilsCrossed: <UtensilsCrossed className="h-6 w-6 text-emerald-600" />,
  HandHeart: <HandHeart className="h-6 w-6 text-teal-600" />,
  ShoppingBag: <ShoppingBag className="h-6 w-6 text-emerald-700" />,
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
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    const phraseTimer = setInterval(() => {
      setPhraseIndex(prev => (prev + 1) % rotatingHeroPhrases.length);
    }, 3200);
    return () => clearInterval(phraseTimer);
  }, []);
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
    }, 4800);
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
    <div className="min-h-screen flex flex-col bg-[#F9FAFB] overflow-x-hidden">
      <Navbar />

      {/* 1. HERO SECTION - CLEAN & MODERN WITH VIVID AUTO-SWITCHING BACKGROUND IMAGES */}
      <section ref={heroRef} className="relative overflow-hidden bg-white text-slate-800 pt-16 pb-16 lg:pt-20 lg:pb-20 border-b border-[#E5E7EB]">
        
        {/* AUTOMATIC CROSS-FADING BACKGROUND IMAGES (RICH & CINEMATIC) */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
          <AnimatePresence mode="sync">
            <motion.div
              key={currentBg}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.4, ease: 'easeInOut' }}
              className="absolute inset-0"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={heroBackgroundImages[currentBg]}
                alt="Live Event Atmosphere"
                className="w-full h-full object-cover object-center brightness-[0.62] contrast-[1.15]"
              />
            </motion.div>
          </AnimatePresence>

          {/* Darkening Tint & Smooth Contrast Veil */}
          <div className="absolute inset-0 bg-slate-950/45 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-white/78 via-white/30 to-black/40 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/15 via-transparent to-[#F9FAFB] pointer-events-none" />
        </div>

        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-emerald-200/20 via-amber-100/15 to-transparent blur-3xl pointer-events-none z-1" />

        <div className="container mx-auto px-4 md:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Hero Content */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="lg:col-span-7 space-y-5 text-left"
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="inline-flex items-center gap-2 rounded-full bg-white/90 backdrop-blur-xs border border-emerald-300/80 px-4 py-1.5 text-xs font-bold text-emerald-800 shadow-xs"
              >
                <Sparkles className="h-3.5 w-3.5 text-[#F59E0B]" />
                <span>Smart QR Ticketing & Instant Gate Entry</span>
              </motion.div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.14] text-[#111827]">
                Discover & Host Events That{' '}
                <span className="inline-block relative min-h-[1.25em] align-top">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={phraseIndex}
                      initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
                      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                      exit={{ opacity: 0, y: -16, filter: 'blur(4px)' }}
                      transition={{ duration: 0.4, ease: 'easeOut' }}
                      className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-[#059669] via-emerald-600 to-[#F59E0B]"
                    >
                      {rotatingHeroPhrases[phraseIndex]}
                    </motion.span>
                  </AnimatePresence>
                </span>
              </h1>

              <p className="text-base sm:text-lg text-[#374151] max-w-xl leading-relaxed font-normal">
                Whether it&apos;s a small workshop or a big conference, ePayEvents helps you handle registrations, passes, payments, and gate check-ins without the usual mess of forms and spreadsheets.
              </p>

              {/* SEARCH EVENTS BAR */}
              <form action="/events" method="GET" suppressHydrationWarning className="bg-white/95 backdrop-blur-md p-2.5 rounded-2xl shadow-xl shadow-slate-900/10 flex flex-col sm:flex-row gap-2 border border-[#E5E7EB]">
                <div className="flex-1 flex items-center gap-3 px-3 py-2 border-b sm:border-b-0 sm:border-r border-[#E5E7EB]">
                  <Search className="h-5 w-5 text-[#059669]" />
                  <input
                    type="text"
                    name="query"
                    suppressHydrationWarning
                    placeholder="Search event name, topic, or keyword..."
                    className="w-full bg-transparent text-[#111827] placeholder-[#9CA3AF] text-sm focus:outline-none"
                  />
                </div>

                <div className="flex-1 flex items-center gap-3 px-3 py-2">
                  <MapPin className="h-5 w-5 text-[#059669]" />
                  <input
                    type="text"
                    name="location"
                    suppressHydrationWarning
                    placeholder="City or location (e.g. Mumbai, Pune)..."
                    className="w-full bg-transparent text-[#111827] placeholder-[#9CA3AF] text-sm focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  suppressHydrationWarning
                  className="rounded-xl bg-[#059669] hover:bg-[#047857] px-7 py-3.5 text-sm font-bold text-white transition shadow-md shadow-emerald-600/20 active:scale-98 cursor-pointer shrink-0"
                >
                  Search Events
                </button>
              </form>

              {/* Quick Tags Under Search */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-[#6B7280]">
                <span className="font-semibold text-slate-600">Popular:</span>
                {['Tech Summits', 'Music Concerts', 'AI Workshops', 'Campus Fests'].map((tag, idx) => (
                  <Link
                    key={idx}
                    href={'/events?query=' + encodeURIComponent(tag)}
                    className="px-3 py-1 rounded-lg bg-white/90 backdrop-blur-xs border border-[#E5E7EB] hover:border-emerald-300 hover:text-emerald-700 text-[#374151] transition shadow-2xs font-medium"
                  >
                    {tag}
                  </Link>
                ))}
              </div>

              {/* Slide Scene Indicators */}
              <div className="flex items-center gap-2.5 pt-2">
                <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">Live Scenes:</span>
                <div className="flex items-center gap-1.5">
                  {heroBackgroundImages.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCurrentBg(idx)}
                      aria-label={'Switch to event scene ' + (idx + 1)}
                      className={'h-1.5 transition-all duration-300 rounded-full cursor-pointer ' + (
                        currentBg === idx ? 'w-6 bg-[#059669]' : 'w-2 bg-slate-300 hover:bg-slate-400'
                      )}
                    />
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Right Hero Visual Element: Modern Handheld Smartphone Gate Scanner Mockup */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:col-span-5 relative flex items-center justify-center py-4"
            >
              {/* Floating Live Metric Pill 1 (Top-Right) */}
              <motion.div
                animate={{ y: [-4, 4, -4] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-1 -right-2 sm:right-2 z-20 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-emerald-200 shadow-lg shadow-emerald-900/10 flex items-center gap-2 text-xs font-bold text-slate-800"
              >
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="text-[#059669]">0.4s</span> Fast Gate Entry
              </motion.div>

              {/* Floating Live Metric Pill 2 (Bottom-Left) */}
              <motion.div
                animate={{ y: [4, -4, 4] }}
                transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
                className="absolute -bottom-2 -left-2 sm:left-2 z-20 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-amber-200 shadow-lg shadow-amber-900/10 flex items-center gap-2 text-xs font-bold text-slate-800"
              >
                <ShieldCheck className="h-4 w-4 text-amber-500" />
                <span>Anti-Duplicate Lock</span>
              </motion.div>

              {/* Sleek Smartphone Hardware Body (Natural Titanium / Silver Medium-Tone) */}
              <motion.div 
                animate={{ y: [-6, 6, -6] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
                className="relative w-[295px] sm:w-[320px] rounded-[42px] bg-gradient-to-b from-slate-200 via-slate-300 to-slate-200 p-2.5 shadow-2xl shadow-slate-900/15 border-4 border-slate-300 ring-1 ring-slate-400/50"
              >
                {/* Screen Glass */}
                <div className="rounded-[34px] overflow-hidden bg-slate-100 text-slate-800 flex flex-col relative border border-slate-300/80 shadow-inner">
                  
                  {/* Dynamic Island Notch Status Bar */}
                  <div className="pt-2.5 pb-1.5 flex items-center justify-between px-6 bg-slate-200/90 text-[11px] font-semibold text-slate-600 border-b border-slate-300/60">
                    <span>09:41</span>
                    <div className="w-20 h-4 bg-slate-800 rounded-full flex items-center justify-end px-2 gap-1.5 shadow-xs">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-600" />
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700">5G</span>
                  </div>

                  {/* App Scanner Header */}
                  <div className="px-4 py-2 bg-white/95 border-b border-slate-200/90 flex items-center justify-between shadow-2xs">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-lg bg-emerald-50 border border-emerald-200/80">
                        <Logo size="sm" showWordmark={false} variant="teal-coral" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-900 leading-tight">Gate Scanner</div>
                        <div className="text-[10px] text-[#059669] font-semibold flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#059669] animate-pulse" /> Live Auto-Focus
                        </div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[9px] font-mono font-bold text-emerald-800">
                      GATE 04
                    </span>
                  </div>

                  {/* Camera Viewfinder Viewport (Medium-Tone Balanced Contrast) */}
                  <div className="relative p-4 bg-gradient-to-b from-slate-200/70 via-slate-100 to-slate-200/70 flex flex-col items-center justify-center min-h-[260px] overflow-hidden">
                    
                    {/* Viewfinder Grid Overlay */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#94a3b825_1px,transparent_1px),linear-gradient(to_bottom,#94a3b825_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

                    {/* QR Code Presentation on Crisp Ticket Card */}
                    <div className="relative p-3.5 bg-white rounded-2xl shadow-md border border-slate-200/90 group flex items-center justify-center">
                      
                      {/* High-Precision Viewfinder Targeting Brackets */}
                      <div className="absolute top-1.5 left-1.5 w-4 h-4 border-t-2 border-l-2 border-[#059669] rounded-tl-sm pointer-events-none" />
                      <div className="absolute top-1.5 right-1.5 w-4 h-4 border-t-2 border-r-2 border-[#059669] rounded-tr-sm pointer-events-none" />
                      <div className="absolute bottom-1.5 left-1.5 w-4 h-4 border-b-2 border-l-2 border-[#F59E0B] rounded-bl-sm pointer-events-none" />
                      <div className="absolute bottom-1.5 right-1.5 w-4 h-4 border-b-2 border-r-2 border-[#F59E0B] rounded-br-sm pointer-events-none" />

                      {/* Sharp QR Code Matrix */}
                      <QrCode className="h-24 w-24 text-slate-800" />

                      {/* Continuous Laser Sweep */}
                      <motion.div
                        animate={{ y: [-4, 100, -4] }}
                        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                        className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#059669] to-transparent shadow-[0_0_8px_rgba(5,150,105,0.7)] pointer-events-none z-10"
                      />

                      {/* Laser Glow Light Trail */}
                      <motion.div
                        animate={{ y: [-24, 80, -24], opacity: [0.15, 0.35, 0.15] }}
                        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                        className="absolute left-0 right-0 h-6 bg-gradient-to-b from-emerald-500/20 to-transparent blur-xs pointer-events-none z-0"
                      />
                    </div>

                    {/* Instant Gate Approval Floating Toast Banner */}
                    <motion.div
                      initial={{ scale: 0.95 }}
                      animate={{ scale: [0.97, 1.02, 0.97] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                      className="mt-3.5 w-full bg-gradient-to-r from-[#059669] to-emerald-700 rounded-xl p-2.5 shadow-md shadow-emerald-800/20 border border-emerald-500/40 text-center"
                    >
                      <div className="flex items-center justify-center gap-1.5 text-xs font-black tracking-wide text-white">
                        <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                        ENTRY APPROVED
                      </div>
                      <div className="text-[11px] text-emerald-100 font-semibold mt-0.5">
                        Abhay Gond · Early Bird VIP
                      </div>
                    </motion.div>
                  </div>

                  {/* Bottom Camera App Bar */}
                  <div className="px-4 py-2.5 bg-white/95 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-600">
                    <div className="flex items-center gap-1.5 font-mono">
                      <span className="text-slate-900 font-bold">1,420</span> passes passed
                    </div>
                    <div className="w-7 h-7 rounded-full bg-emerald-50 border-2 border-[#059669] flex items-center justify-center">
                      <div className="w-3.5 h-3.5 rounded-full bg-[#059669]" />
                    </div>
                    <div className="text-amber-700 font-bold font-mono text-[10px]">
                      READY
                    </div>
                  </div>

                  {/* Home Bar Indicator */}
                  <div className="py-1 bg-slate-100 flex justify-center">
                    <div className="w-24 h-1 bg-slate-400 rounded-full" />
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
              <h2 className="text-2xl sm:text-4xl font-black text-[#111827] tracking-tight flex items-center gap-2">
                Live Events <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#059669] to-teal-500">Showcase</span>
              </h2>
              <p className="text-xs text-[#64748B] mt-1">Featured live events taking place right now across top cities</p>
            </div>
            <Link href="/events" className="text-sm font-bold text-[#059669] hover:text-[#047857] flex items-center gap-1.5 bg-[#059669]/10 hover:bg-emerald-500/10 px-4 py-2 rounded-xl transition">
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
                <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-[#F59E0B]" /> {mainLiveEvent.venue.name}, {mainLiveEvent.venue.city}</span>
                <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4 text-[#F59E0B]" /> {new Date(mainLiveEvent.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>

              <div className="pt-2">
                <Link
                  href={user ? `/events/${mainLiveEvent.slug}` : `/login?redirect=${encodeURIComponent(`/events/${mainLiveEvent.slug}`)}`}
                  className="rounded-xl bg-[#F59E0B] px-6 py-3 text-xs sm:text-sm font-extrabold text-white hover:bg-[#D97706] transition shadow-lg inline-flex items-center gap-2"
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
                  className="group rounded-2xl border border-slate-800 bg-[#111827] overflow-hidden hover:border-[#059669] hover:shadow-xl transition-all flex flex-col justify-between h-full"
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
                    <span className="text-[#F59E0B] font-bold text-[11px] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
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
              <span className="text-xs font-extrabold text-[#F59E0B] uppercase tracking-widest bg-[#F59E0B]/10 px-3 py-1 rounded-full border border-[#F59E0B]/20 inline-block mb-3.5">
                HANDPICKED SELECTIONS
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-[#111827] tracking-tight">
                Upcoming <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F59E0B] to-amber-500">Events</span>
              </h2>
              <p className="text-xs text-[#64748B] mt-1">Featured upcoming conferences, masterclasses & summits</p>
            </div>
            <Link href="/events" className="text-sm font-bold text-[#059669] hover:text-[#047857] flex items-center gap-1.5 bg-[#059669]/10 hover:bg-emerald-500/10 px-4 py-2 rounded-xl transition">
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
      <section className="py-16 bg-[#F9FAFB]">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-xs font-extrabold text-[#64748B] uppercase tracking-widest bg-[#E2E8F0] px-3 py-1 rounded-full inline-flex items-center gap-1.5 mb-3.5">
                <Clock className="h-3.5 w-3.5 text-[#64748B]" /> ARCHIVED CONCLAVES
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-[#111827] tracking-tight">
                Past <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-700 to-slate-900">Events Archive</span>
              </h2>
              <p className="text-xs text-[#64748B] mt-1">Review concluded events, past schedules & proceedings</p>
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
      <section className="py-16 bg-[#F9FAFB] border-y border-stone-200/70 overflow-hidden relative">
        <div className="container mx-auto px-4 md:px-8 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-extrabold text-[#059669] uppercase tracking-widest bg-[#059669]/10 px-3 py-1 rounded-full border border-[#059669]/20 inline-block mb-3.5">
                DISCOVER BY INTEREST
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-[#111827] tracking-tight">
                Popular <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#059669] to-emerald-600">Categories</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#64748B] mt-1">
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
                    <Pause className="h-3.5 w-3.5 text-[#F59E0B]" />
                    <span>Pause</span>
                  </>
                )}
              </button>

              <Link
                href="/events"
                className="text-xs sm:text-sm font-bold text-[#059669] hover:text-[#047857] flex items-center gap-1.5 bg-white hover:bg-stone-50 border border-stone-200 px-4 py-2 rounded-xl transition shadow-2xs group"
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
          <div className="absolute top-0 bottom-0 left-0 w-16 sm:w-28 bg-gradient-to-r from-[#F9FAFB] to-transparent z-10 pointer-events-none" />

          {/* Right Gradient Edge Vignette */}
          <div className="absolute top-0 bottom-0 right-0 w-16 sm:w-28 bg-gradient-to-l from-[#F9FAFB] to-transparent z-10 pointer-events-none" />

          <div className={`animate-marquee py-2 ${isCategoriesMarqueePaused ? 'animate-marquee-paused' : ''}`}>
            {/* Render 2 identical loops of the categories for seamless, non-stop circular loop */}
            {[...mockCategories, ...mockCategories].map((cat, idx) => (
              <div
                key={`${cat.id}-${idx}`}
                className="shrink-0 w-[190px] sm:w-[210px] mx-2"
              >
                <Link
                  href={`/events?category=${cat.slug}`}
                  className="group flex flex-col items-center text-center p-5 rounded-2xl border border-stone-200/90 bg-white hover:border-[#059669] hover:shadow-xl transition-all duration-300 h-full relative overflow-hidden"
                >
                  {/* Glowing Top Accent on Hover */}
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#059669] to-[#F59E0B] opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-100 shadow-2xs mb-3.5 group-hover:scale-110 group-hover:bg-[#059669]/10 transition-all duration-300">
                    {categoryIconMap[cat.icon] || <Cpu className="h-6 w-6 text-[#059669]" />}
                  </div>

                  <h3 className="font-bold text-[#111827] text-xs sm:text-sm group-hover:text-[#059669] transition line-clamp-1">
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

      {/* 6. REDESIGNED CLEAN END-TO-END WORKFLOW ROADMAP (LIGHT PALETTE) */}
      <section className="py-16 sm:py-20 bg-gradient-to-b from-[#F9FAFB] via-[#F0FDF4]/30 to-[#F9FAFB] text-slate-800 border-y border-[#E5E7EB] relative overflow-hidden">
        {/* Soft Ambient Glow Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-200/25 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-200/20 blur-[120px] rounded-full pointer-events-none" />

        <div className="container mx-auto px-4 md:px-8 max-w-5xl relative z-10 space-y-9">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200/90 px-4 py-1.5 text-xs font-bold text-emerald-800 uppercase tracking-widest shadow-2xs mb-2">
              <Sparkles className="h-4 w-4 text-[#F59E0B]" /> Workflow Progression Map
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#111827] tracking-tight leading-tight">
              Everything You Need to Run an Event — <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#059669] via-emerald-600 to-[#F59E0B]">In One Place</span>
            </h2>
            <p className="text-[#64748B] text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto">
              From creating the event to checking people in and downloading reports. No more switching between tools.
            </p>
          </div>

          {/* Interactive Step Progress Bar */}
          <div className="relative max-w-4xl mx-auto hidden md:block py-4">
            <div className="absolute top-1/2 left-0 right-0 h-1.5 bg-[#E5E7EB] -translate-y-1/2 rounded-full"></div>
            <div 
              className="absolute top-1/2 left-0 h-1.5 bg-gradient-to-r from-[#059669] via-emerald-500 to-[#F59E0B] -translate-y-1/2 rounded-full transition-all duration-500 shadow-sm shadow-emerald-500/20"
              style={{ width: `${((activeStep - 1) / 5) * 100}%` }}
            ></div>

            <div className="relative z-10 flex justify-between">
              {[1, 2, 3, 4, 5, 6].map(num => (
                <button
                  key={num}
                  type="button"
                  suppressHydrationWarning
                  onClick={() => setActiveStep(num)}
                  className={`w-8 h-8 rounded-full font-black text-[11px] transition-all flex items-center justify-center cursor-pointer ${
                    activeStep === num
                      ? 'bg-gradient-to-r from-[#059669] to-[#F59E0B] text-white scale-125 ring-4 ring-emerald-200 shadow-md shadow-emerald-600/30 font-bold'
                      : activeStep > num
                      ? 'bg-emerald-600 text-white font-bold'
                      : 'bg-white text-[#64748B] border border-[#E5E7EB] hover:border-emerald-300 hover:text-emerald-700 shadow-2xs'
                  }`}
                >
                  0{num}
                </button>
              ))}
            </div>
          </div>

          {/* Clean Step Cards (Light Cards with Crisp Typography) */}
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
              className={`p-6 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                activeStep === 1
                  ? 'bg-white border-2 border-[#059669] shadow-xl shadow-emerald-950/5 ring-1 ring-emerald-300'
                  : 'bg-white/80 hover:bg-white border-[#E5E7EB] hover:border-emerald-300 hover:shadow-md'
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className={`text-2xl font-black transition ${activeStep === 1 ? 'text-[#059669]' : 'text-slate-400'}`}>01</span>
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">STEP 01</span>
              </div>
              <h3 className="text-xl font-extrabold text-[#111827]">Create</h3>
              <p className="text-xs text-[#64748B] leading-relaxed mt-2 font-normal">
                Add event details, banner, date and venue in a few minutes.
              </p>
            </motion.div>

            {/* Step 02 */}
            <motion.div 
              variants={itemVariants}
              onClick={() => setActiveStep(2)}
              className={`p-6 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                activeStep === 2
                  ? 'bg-white border-2 border-[#059669] shadow-xl shadow-emerald-950/5 ring-1 ring-emerald-300'
                  : 'bg-white/80 hover:bg-white border-[#E5E7EB] hover:border-emerald-300 hover:shadow-md'
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className={`text-2xl font-black transition ${activeStep === 2 ? 'text-[#059669]' : 'text-slate-400'}`}>02</span>
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">STEP 02</span>
              </div>
              <h3 className="text-xl font-extrabold text-[#111827]">Register</h3>
              <p className="text-xs text-[#64748B] leading-relaxed mt-2 font-normal">
                Open registrations with custom form fields. Collect the exact information you need.
              </p>
            </motion.div>

            {/* Step 03 */}
            <motion.div 
              variants={itemVariants}
              onClick={() => setActiveStep(3)}
              className={`p-6 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                activeStep === 3
                  ? 'bg-white border-2 border-[#059669] shadow-xl shadow-emerald-950/5 ring-1 ring-emerald-300'
                  : 'bg-white/80 hover:bg-white border-[#E5E7EB] hover:border-emerald-300 hover:shadow-md'
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className={`text-2xl font-black transition ${activeStep === 3 ? 'text-[#059669]' : 'text-slate-400'}`}>03</span>
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">STEP 03</span>
              </div>
              <h3 className="text-xl font-extrabold text-[#111827]">Ticket</h3>
              <p className="text-xs text-[#64748B] leading-relaxed mt-2 font-normal">
                Set up free or paid tickets, early-bird prices, coupons and limits.
              </p>
            </motion.div>

            {/* Step 04 - FEATURED HIGHLIGHT STEP */}
            <motion.div 
              variants={itemVariants}
              onClick={() => setActiveStep(4)}
              className={`p-6 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                activeStep === 4
                  ? 'bg-gradient-to-b from-white via-amber-50/50 to-white border-2 border-[#F59E0B] shadow-xl shadow-amber-500/10 ring-2 ring-amber-300/60 scale-[1.03]'
                  : 'bg-white border-[#F59E0B]/60 hover:border-[#F59E0B] shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-black text-[#F59E0B]">04</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 text-amber-800 border border-amber-300/80 shadow-2xs">
                  RECOMMENDED HIGHLIGHT
                </span>
              </div>
              <h3 className="text-xl font-extrabold text-[#111827] flex items-center gap-2 mt-2">
                <QrCode className="h-5 w-5 text-[#F59E0B]" /> Check-in
              </h3>
              <p className="text-xs text-[#4B5563] leading-relaxed mt-2 font-normal">
                Scan tickets at the gate for quick, organized entry. No long queues. Live count of people inside.
              </p>
              <div className="pt-3">
                <Link
                  href="/organizer/scanner"
                  className="text-xs font-extrabold text-[#F59E0B] hover:text-amber-700 flex items-center gap-1.5 transition group"
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
              className={`p-6 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                activeStep === 5
                  ? 'bg-white border-2 border-[#059669] shadow-xl shadow-emerald-950/5 ring-1 ring-emerald-300'
                  : 'bg-white/80 hover:bg-white border-[#E5E7EB] hover:border-emerald-300 hover:shadow-md'
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className={`text-2xl font-black transition ${activeStep === 5 ? 'text-[#059669]' : 'text-slate-400'}`}>05</span>
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">STEP 05</span>
              </div>
              <h3 className="text-xl font-extrabold text-[#111827]">Track</h3>
              <p className="text-xs text-[#64748B] leading-relaxed mt-2 font-normal">
                See registrations, revenue and check-ins in real time on your dashboard.
              </p>
            </motion.div>

            {/* Step 06 */}
            <motion.div 
              variants={itemVariants}
              onClick={() => setActiveStep(6)}
              className={`p-6 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                activeStep === 6
                  ? 'bg-white border-2 border-[#059669] shadow-xl shadow-emerald-950/5 ring-1 ring-emerald-300'
                  : 'bg-white/80 hover:bg-white border-[#E5E7EB] hover:border-emerald-300 hover:shadow-md'
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className={`text-2xl font-black transition ${activeStep === 6 ? 'text-[#059669]' : 'text-slate-400'}`}>06</span>
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">STEP 06</span>
              </div>
              <h3 className="text-xl font-extrabold text-[#111827]">Export</h3>
              <p className="text-xs text-[#64748B] leading-relaxed mt-2 font-normal">
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
            <span className="text-xs font-extrabold text-[#059669] uppercase tracking-widest bg-[#059669]/10 px-3.5 py-1.5 rounded-full border border-[#059669]/20 inline-block mb-3.5">
              PROVEN ENGINE
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#111827] tracking-tight">
              Smart Features That <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#059669] to-[#F59E0B]">Actually Help Event Creators</span>
            </h2>
            <p className="text-[#64748B] text-sm leading-relaxed">
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
            <motion.div variants={itemVariants} whileHover={{ y: -4, transition: { duration: 0.2 } }} className="p-6 rounded-3xl bg-[#F9FAFB] border border-[#E2E8F0] hover:border-[#059669]/50 hover:shadow-lg transition-all space-y-3">
              <div className="p-3 w-fit bg-[#059669]/10 text-[#059669] rounded-2xl">
                <Zap className="h-6 w-6 text-[#059669]" />
              </div>
              <h3 className="font-extrabold text-[#111827] text-base">Quick Event Creation</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Fill basic details and the system helps you structure tickets, registration form and pricing. Publish faster.
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div variants={itemVariants} whileHover={{ y: -4, transition: { duration: 0.2 } }} className="p-6 rounded-3xl bg-[#F9FAFB] border border-[#E2E8F0] hover:border-[#F59E0B]/50 hover:shadow-lg transition-all space-y-3">
              <div className="p-3 w-fit bg-[#F59E0B]/10 text-[#F59E0B] rounded-2xl">
                <Mail className="h-6 w-6 text-[#F59E0B]" />
              </div>
              <h3 className="font-extrabold text-[#111827] text-base">Automated Reminders</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Send registration confirmation, payment success and event reminder emails/SMS automatically. Less follow-up work for you.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div variants={itemVariants} whileHover={{ y: -4, transition: { duration: 0.2 } }} className="p-6 rounded-3xl bg-[#F9FAFB] border border-[#E2E8F0] hover:border-[#059669]/50 hover:shadow-lg transition-all space-y-3">
              <div className="p-3 w-fit bg-[#059669]/10 text-[#059669] rounded-2xl">
                <Percent className="h-6 w-6 text-[#059669]" />
              </div>
              <h3 className="font-extrabold text-[#111827] text-base">Coupon & Offer Engine</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Create discount codes, early-bird pricing and group offers in a few clicks. Control usage limits easily.
              </p>
            </motion.div>

            {/* Feature 4 */}
            <motion.div variants={itemVariants} whileHover={{ y: -4, transition: { duration: 0.2 } }} className="p-6 rounded-3xl bg-[#F9FAFB] border border-[#E2E8F0] hover:border-[#059669]/50 hover:shadow-lg transition-all space-y-3">
              <div className="p-3 w-fit bg-[#059669]/10 text-[#059669] rounded-2xl">
                <QrCode className="h-6 w-6 text-[#059669]" />
              </div>
              <h3 className="font-extrabold text-[#111827] text-base">Real-time Check-in</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Live count of how many people have entered. Useful for both small workshops and large conferences.
              </p>
            </motion.div>

            {/* Feature 5 */}
            <motion.div variants={itemVariants} whileHover={{ y: -4, transition: { duration: 0.2 } }} className="p-6 rounded-3xl bg-[#F9FAFB] border border-[#E2E8F0] hover:border-[#F59E0B]/50 hover:shadow-lg transition-all space-y-3 sm:col-span-2 lg:col-span-1">
              <div className="p-3 w-fit bg-[#F59E0B]/10 text-[#F59E0B] rounded-2xl">
                <FileSpreadsheet className="h-6 w-6 text-[#F59E0B]" />
              </div>
              <h3 className="font-extrabold text-[#111827] text-base">Basic Reports</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
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
            <span className="text-xs font-extrabold text-[#059669] uppercase tracking-widest bg-[#059669]/10 px-3.5 py-1.5 rounded-full border border-[#059669]/20 inline-block mb-3.5">
              BUILT FOR REAL HOSTS
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#111827] tracking-tight">
              Why Event Organizers <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#059669] to-[#F59E0B]">Prefer ePayEvents</span>
            </h2>
            <p className="text-sm text-[#64748B] leading-relaxed">
              Built for real organizers who are tired of juggling Google Forms, Excel sheets, payment screenshots and WhatsApp groups.
            </p>
          </div>

          {/* Organizer Workspace Banner Image */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6 }}
            className="mb-12 rounded-3xl overflow-hidden shadow-xl border border-[#E2E8F0] max-h-[360px] relative"
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
            <motion.div variants={itemVariants} className="p-6 rounded-2xl bg-[#F9FAFB] border border-[#E2E8F0] space-y-3 hover:border-[#059669] transition">
              <div className="w-10 h-10 rounded-xl bg-[#059669]/10 text-[#059669] flex items-center justify-center font-bold">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-[#111827] text-base">Simple Event Setup</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Create your event in under 10 minutes. Add tickets, set prices, upload banner and publish. No technical knowledge needed.
              </p>
            </motion.div>

            {/* Card 2 - Smart Ticketing Engine */}
            <motion.div variants={itemVariants} className="p-6 rounded-2xl bg-[#F9FAFB] border-2 border-emerald-200 space-y-3 hover:border-[#059669] transition relative overflow-hidden shadow-sm">
              <span className="absolute top-3 right-3 text-[9px] font-black uppercase tracking-wider bg-[#059669] text-white px-2 py-0.5 rounded-full">
                CORE MODULE
              </span>
              <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/10 text-[#F59E0B] flex items-center justify-center font-bold">
                <CreditCard className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-[#111827] text-base">Smart Ticketing Engine</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Complete ticketing matrix: early-bird tiers, dynamic pricing, group bulk discounts, promo codes, hidden passcode passes, waitlists, complimentary passes, ticket transfers & automated refund workflows.
              </p>
            </motion.div>

            {/* Card 3 */}
            <motion.div variants={itemVariants} className="p-6 rounded-2xl bg-[#F9FAFB] border border-[#E2E8F0] space-y-3 hover:border-[#059669] transition">
              <div className="w-10 h-10 rounded-xl bg-[#059669]/10 text-[#059669] flex items-center justify-center font-bold">
                <QrCode className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-[#111827] text-base">QR Check-in System</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Generate unique QR tickets for every attendee. Scan at the entrance in seconds. Works smoothly even with average internet.
              </p>
            </motion.div>

            {/* Card 4 */}
            <motion.div variants={itemVariants} className="p-6 rounded-2xl bg-[#F9FAFB] border border-[#E2E8F0] space-y-3 hover:border-[#059669] transition">
              <div className="w-10 h-10 rounded-xl bg-[#059669]/10 text-[#059669] flex items-center justify-center font-bold">
                <BarChart2 className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-[#111827] text-base">Live Dashboard</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Track registrations, revenue, check-ins and attendance in real time. Export reports whenever you need them.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 9. ORGANIZERS GROWING WITH EPAYEVENTS (CLEAN LIGHT PALETTE) */}
      <section className="py-16 sm:py-20 bg-[#F9FAFB] text-slate-800 border-t border-[#E5E7EB] relative overflow-hidden">
        {/* Subtle decorative mesh background */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-amber-100/40 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 md:px-8 max-w-5xl relative z-10 space-y-9">
          {/* Header & Growth Ribbon */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black uppercase tracking-widest mb-2 shadow-2xs">
                <TrendingUp className="h-3.5 w-3.5 text-[#059669]" />
                VERIFIED ORGANIZER BENCHMARKS
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#111827] tracking-tight">
                Organizers Growing with <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#059669] via-emerald-600 to-[#F59E0B]">ePayEvents</span>
              </h2>
              <p className="text-sm text-[#64748B] leading-relaxed">
                Real operational benchmarks and financial metrics from conference founders, community leads, and festival directors scaling on our infrastructure.
              </p>
            </div>

            {/* Quick Host CTA in Header */}
            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/create-event"
                className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#F59E0B] to-amber-600 hover:brightness-105 px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-md shadow-amber-500/20 transition-all cursor-pointer"
              >
                <span>Host Your Next Event</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Aggregate Growth Stats Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 p-4 sm:p-5 rounded-2xl bg-white border border-[#E5E7EB] shadow-lg shadow-slate-200/50">
            <div className="p-3">
              <span className="text-xs text-[#64748B] block font-semibold">Platform Pass Volume</span>
              <div className="text-2xl sm:text-3xl font-black text-[#111827] mt-1">
                <AnimatedCounter value={52000} suffix="+" />
              </div>
              <span className="text-[11px] text-[#059669] font-bold flex items-center gap-1 mt-0.5">
                <TrendingUp className="h-3 w-3" /> +142% year-on-year
              </span>
            </div>

            <div className="p-3 border-l border-[#E5E7EB]">
              <span className="text-xs text-[#64748B] block font-semibold">Average Gate Scan Speed</span>
              <div className="text-2xl sm:text-3xl font-black text-[#059669] mt-1">1.8s</div>
              <span className="text-[10px] text-[#64748B] font-medium mt-0.5 block">Zero turnstile queue lag</span>
            </div>

            <div className="p-3 border-l-0 lg:border-l border-[#E5E7EB]">
              <span className="text-xs text-[#64748B] block font-semibold">Revenue Disbursed</span>
              <div className="text-2xl sm:text-3xl font-black text-[#F59E0B] mt-1">₹4.8 Cr+</div>
              <span className="text-[11px] text-amber-700 font-bold mt-0.5 block">Same-day bank settlement</span>
            </div>

            <div className="p-3 border-l border-[#E5E7EB]">
              <span className="text-xs text-[#64748B] block font-semibold">Organizer Retention</span>
              <div className="text-2xl sm:text-3xl font-black text-emerald-700 mt-1">96.8%</div>
              <span className="text-[11px] text-[#059669] font-bold mt-0.5 block">Recurring multi-edition hosts</span>
            </div>
          </div>

          {/* 3 Executive Case Study Story Cards (Clean Light Cards) */}
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
              className="rounded-2xl border border-[#E5E7EB] bg-white p-4 sm:p-5 flex flex-col justify-between hover:border-emerald-400 hover:shadow-xl transition-all group relative overflow-hidden shadow-sm"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-[#F3F4F6] pb-2.5">
                  <div>
                    <span className="text-[10px] font-black tracking-wider text-emerald-800 uppercase bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                      HACKATHON & TECH
                    </span>
                    <h3 className="font-extrabold text-[#111827] text-base mt-1">AI Builders Club</h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#F9FAFB] text-[#4B5563] border border-[#E5E7EB]">
                    Bengaluru
                  </span>
                </div>

                {/* Metric Badges */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#F9FAFB] p-2.5 rounded-xl border border-[#E5E7EB]">
                    <span className="text-[10px] text-[#64748B] block font-semibold uppercase tracking-wider">Passes Sold</span>
                    <span className="text-lg sm:text-xl font-black text-[#111827] mt-0.5 block">
                      <AnimatedCounter value={2450} suffix="+" />
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold">100% Sold Out</span>
                  </div>

                  <div className="bg-[#F9FAFB] p-2.5 rounded-xl border border-[#E5E7EB]">
                    <span className="text-[10px] text-[#64748B] block font-semibold uppercase tracking-wider">Gate Scan Speed</span>
                    <span className="text-lg sm:text-xl font-black text-emerald-700 mt-0.5 block">2.1s</span>
                    <span className="text-[10px] text-emerald-600 font-bold">4 Turnstiles</span>
                  </div>
                </div>

                <div className="bg-[#F9FAFB] p-2.5 sm:p-3 rounded-xl border border-[#E5E7EB]">
                  <p className="text-[11px] text-[#4B5563] leading-relaxed italic">
                    &quot;We managed custom team submission questions and scanned 2,000+ hackers at gate entry seamlessly. ePayEvents eliminated zero-day queue chaos.&quot;
                  </p>
                </div>
              </div>

              {/* Organizer Profile Footer */}
              <div className="pt-3.5 border-t border-[#F3F4F6] mt-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/speakers/speaker4.jpg" alt="Karan Sharma" className="h-9 w-9 rounded-xl object-cover ring-2 ring-emerald-100 shadow-xs" />
                  <div>
                    <h4 className="font-bold text-[#111827] text-xs">Karan Sharma</h4>
                    <span className="text-[10px] text-[#64748B]">Lead Organizer, AI Builders</span>
                  </div>
                </div>
                <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
                  <Award className="h-4 w-4" />
                </div>
              </div>
            </motion.div>

            {/* Story 2: FinTech Next Summit */}
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="rounded-2xl border border-[#E5E7EB] bg-white p-4 sm:p-5 flex flex-col justify-between hover:border-amber-400 hover:shadow-xl transition-all group relative overflow-hidden shadow-sm"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-[#F3F4F6] pb-2.5">
                  <div>
                    <span className="text-[10px] font-black tracking-wider text-amber-800 uppercase bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                      EXECUTIVE SUMMIT
                    </span>
                    <h3 className="font-extrabold text-[#111827] text-base mt-1">FinTech Next Summit</h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#F9FAFB] text-[#4B5563] border border-[#E5E7EB]">
                    Mumbai
                  </span>
                </div>

                {/* Metric Badges */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#F9FAFB] p-2.5 rounded-xl border border-[#E5E7EB]">
                    <span className="text-[10px] text-[#64748B] block font-semibold uppercase tracking-wider">Revenue Settled</span>
                    <span className="text-lg sm:text-xl font-black text-amber-600 mt-0.5 block">₹14.8 L</span>
                    <span className="text-[10px] text-amber-700 font-bold">Same-Day Payout</span>
                  </div>

                  <div className="bg-[#F9FAFB] p-2.5 rounded-xl border border-[#E5E7EB]">
                    <span className="text-[10px] text-[#64748B] block font-semibold uppercase tracking-wider">Show-up Rate</span>
                    <span className="text-lg sm:text-xl font-black text-emerald-600 mt-0.5 block">
                      <AnimatedCounter value={94} suffix="%" />
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold">Automated SMS/Mail</span>
                  </div>
                </div>

                <div className="bg-[#F9FAFB] p-2.5 sm:p-3 rounded-xl border border-[#E5E7EB]">
                  <p className="text-[11px] text-[#4B5563] leading-relaxed italic">
                    &quot;Automated WhatsApp and email reminders reduced our no-show rates drastically. Instant UPI settlements gave us immediate cash flow.&quot;
                  </p>
                </div>
              </div>

              {/* Organizer Profile Footer */}
              <div className="pt-3.5 border-t border-[#F3F4F6] mt-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/speakers/speaker3.jpg" alt="Rajesh Kulkarni" className="h-9 w-9 rounded-xl object-cover ring-2 ring-amber-100 shadow-xs" />
                  <div>
                    <h4 className="font-bold text-[#111827] text-xs">Rajesh Kulkarni</h4>
                    <span className="text-[10px] text-[#64748B]">Head of Events, FinTech Next</span>
                  </div>
                </div>
                <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600 group-hover:scale-110 transition-transform">
                  <Award className="h-4 w-4" />
                </div>
              </div>
            </motion.div>

            {/* Story 3: Pune Indie Music Fest */}
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="rounded-2xl border border-[#E5E7EB] bg-white p-4 sm:p-5 flex flex-col justify-between hover:border-emerald-400 hover:shadow-xl transition-all group relative overflow-hidden shadow-sm"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-[#F3F4F6] pb-2.5">
                  <div>
                    <span className="text-[10px] font-black tracking-wider text-rose-800 uppercase bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
                      CONCERT & FESTIVAL
                    </span>
                    <h3 className="font-extrabold text-[#111827] text-base mt-1">Pune Indie Music Fest</h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#F9FAFB] text-[#4B5563] border border-[#E5E7EB]">
                    Pune
                  </span>
                </div>

                {/* Metric Badges */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#F9FAFB] p-2.5 rounded-xl border border-[#E5E7EB]">
                    <span className="text-[10px] text-[#64748B] block font-semibold uppercase tracking-wider">Crowd Checked-in</span>
                    <span className="text-lg sm:text-xl font-black text-[#111827] mt-0.5 block">
                      <AnimatedCounter value={4120} />
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold">Night Gate Operations</span>
                  </div>

                  <div className="bg-[#F9FAFB] p-2.5 rounded-xl border border-[#E5E7EB]">
                    <span className="text-[10px] text-[#64748B] block font-semibold uppercase tracking-wider">Promo Lift</span>
                    <span className="text-lg sm:text-xl font-black text-rose-600 mt-0.5 block">
                      <AnimatedCounter value={38} suffix="%" />
                    </span>
                    <span className="text-[10px] text-rose-600 font-bold">Group Pass Codes</span>
                  </div>
                </div>

                <div className="bg-[#F9FAFB] p-2.5 sm:p-3 rounded-xl border border-[#E5E7EB]">
                  <p className="text-[11px] text-[#4B5563] leading-relaxed italic">
                    &quot;Early bird discounts and group ticketing tools boosted our first-week sales by 250%. Scanning with mobile phones was effortlessly fast.&quot;
                  </p>
                </div>
              </div>

              {/* Organizer Profile Footer */}
              <div className="pt-3.5 border-t border-[#F3F4F6] mt-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/organizers/event_manager_qr.jpg" alt="Priya Deshmukh" className="h-9 w-9 rounded-xl object-cover ring-2 ring-emerald-100 shadow-xs" />
                  <div>
                    <h4 className="font-bold text-[#111827] text-xs">Priya Deshmukh</h4>
                    <span className="text-[10px] text-[#64748B]">Festival Curator, Indie Pulse</span>
                  </div>
                </div>
                <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
                  <Award className="h-4 w-4" />
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Organizer Quick Callout Bar */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-50/90 via-white to-amber-50/90 border border-emerald-200 shadow-md flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-800 border border-emerald-200">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-black text-[#111827]">Ready to host your own tech summit, workshop or conference?</h4>
                <p className="text-xs text-[#64748B] mt-0.5">Set up custom registration tickets, pricing tiers, and launch gate operations in minutes.</p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/organizer/dashboard"
                className="text-xs font-bold text-[#4B5563] hover:text-[#111827] transition px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-white hover:bg-slate-50 shadow-2xs"
              >
                View Demo Dashboard
              </Link>
              <Link
                href="/create-event"
                className="text-xs font-black text-white bg-[#059669] hover:bg-[#047857] transition px-5 py-2.5 rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer"
              >
                <span>Create Event Free</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 10. WHAT ATTENDEES ARE SAYING (REDESIGNED HIGH-IMPACT SOCIAL PROOF SHOWCASE) */}
      <section className="py-24 bg-gradient-to-b from-white via-slate-50/80 to-[#F9FAFB] relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 md:px-8 max-w-6xl relative z-10">
          {/* Header & Overall Rating Badge */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div className="space-y-3 max-w-xl">
              <div className="flex items-center gap-2 mb-3.5">
                <span className="text-xs font-black text-[#F59E0B] uppercase tracking-widest bg-[#F59E0B]/10 px-3.5 py-1.5 rounded-full border border-[#F59E0B]/20 inline-flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-[#F59E0B]" />
                  VERIFIED ATTENDEE REVIEWS
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-teal-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <CheckCircle2 className="h-3 w-3 text-teal-600" />
                  100% Genuine Pass Holders
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#111827] tracking-tight">
                What Attendees <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F59E0B] via-amber-500 to-teal-600">Are Saying</span>
              </h2>
              <p className="text-sm text-[#64748B] leading-relaxed">
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
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-teal-600 border border-emerald-200">
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
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-teal-600">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900">Verified Ticket Protection & Gate Entry Guarantee</h4>
                <p className="text-[11px] text-slate-500">Every review is tied to an encrypted ticket code scanned at the entrance gate.</p>
              </div>
            </div>

            <Link
              href="/events"
              className="text-xs font-extrabold text-[#059669] hover:text-[#047857] flex items-center gap-1.5 transition shrink-0 group"
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
            <span className="text-xs font-extrabold text-[#059669] uppercase tracking-widest bg-[#059669]/10 px-3.5 py-1.5 rounded-full border border-[#059669]/20 inline-block mb-3.5">
              HELP & HELPDESK
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#111827] tracking-tight">
              Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#059669] to-teal-500">Questions</span>
            </h2>
            <p className="text-xs text-[#64748B] mt-2">Everything you need to know about ePayEvents platform & ticketing</p>
          </div>

          <div className="space-y-4">
            {homeFaqs.map((faq, idx) => (
              <div key={idx} className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden shadow-sm">
                <button
                  type="button"
                  suppressHydrationWarning
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full text-left p-4 font-bold text-sm text-[#111827] flex justify-between items-center"
                >
                  <span>{faq.question}</span>
                  <ChevronDown className={`h-4 w-4 text-[#64748B] transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === idx && (
                  <div className="px-4 pb-4 text-xs text-[#64748B] leading-relaxed border-t border-[#E2E8F0] pt-3">
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
