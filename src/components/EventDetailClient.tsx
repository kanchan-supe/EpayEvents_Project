'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { 
  Calendar, MapPin, Ticket, ShieldCheck, Share2, Clock, Globe, CheckCircle2, 
  Building2, Mail, Sparkles, QrCode, 
  ChevronDown, Copy, Check, Send, ExternalLink, FileText, Tag, Edit
} from 'lucide-react';
import { EventItem } from '@/lib/types';
import { EventReviewsSection } from '@/components/EventReviewsSection';
import { useAuth } from '@/context/AuthContext';

interface EventDetailClientProps {
  event: EventItem;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
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

function formatTime12h(timeStr?: string): string {
  if (!timeStr) return '';
  const trimmed = timeStr.trim();
  if (/(AM|PM)$/i.test(trimmed)) {
    return trimmed.toUpperCase();
  }
  const parts = trimmed.split(':');
  if (parts.length >= 2) {
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    if (!isNaN(hours) && !isNaN(minutes)) {
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 === 0 ? 12 : hours % 12;
      const displayMinutes = minutes.toString().padStart(2, '0');
      return `${displayHours.toString().padStart(2, '0')}:${displayMinutes} ${period}`;
    }
  }
  return trimmed;
}

function formatDetailDate(
  startDateStr: string,
  endDateStr?: string,
  explicitStartTime?: string,
  explicitEndTime?: string
) {
  // 1. Start Date formatting (prevent timezone shift)
  let startDateFormatted = '';
  try {
    const datePart = startDateStr ? startDateStr.split('T')[0] : '';
    if (datePart && /^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
      const [y, m, d] = datePart.split('-').map(Number);
      const localDate = new Date(y, m - 1, d);
      startDateFormatted = localDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } else {
      const parsed = new Date(startDateStr);
      if (!isNaN(parsed.getTime())) {
        startDateFormatted = parsed.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      }
    }
  } catch {
    startDateFormatted = startDateStr;
  }

  // 2. End Date formatting
  let endDateFormatted = '';
  if (endDateStr) {
    try {
      const datePart = endDateStr ? endDateStr.split('T')[0] : '';
      if (datePart && /^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
        const [y, m, d] = datePart.split('-').map(Number);
        const localDate = new Date(y, m - 1, d);
        endDateFormatted = localDate.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      } else {
        const parsed = new Date(endDateStr);
        if (!isNaN(parsed.getTime())) {
          endDateFormatted = parsed.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          });
        }
      }
    } catch {}
  }

  const isMultiDay = Boolean(endDateFormatted && endDateFormatted !== startDateFormatted);
  const dateRangeFormatted = isMultiDay
    ? `${startDateFormatted} - ${endDateFormatted}`
    : startDateFormatted || 'Upcoming';

  // 3. Start Time formatting
  let startTimeFormatted = '';
  if (explicitStartTime) {
    startTimeFormatted = formatTime12h(explicitStartTime);
  } else if (startDateStr && startDateStr.includes('T')) {
    const match = startDateStr.match(/T(\d{2}):(\d{2})/);
    if (match && (match[1] !== '00' || match[2] !== '00')) {
      startTimeFormatted = formatTime12h(`${match[1]}:${match[2]}`);
    }
  }
  if (!startTimeFormatted) {
    startTimeFormatted = '10:00 AM';
  }

  // 4. End Time formatting
  let endTimeFormatted = '';
  if (explicitEndTime) {
    endTimeFormatted = formatTime12h(explicitEndTime);
  } else if (endDateStr && endDateStr.includes('T')) {
    const match = endDateStr.match(/T(\d{2}):(\d{2})/);
    if (match && (match[1] !== '00' || match[2] !== '00')) {
      endTimeFormatted = formatTime12h(`${match[1]}:${match[2]}`);
    }
  }
  if (!endTimeFormatted) {
    endTimeFormatted = '06:00 PM';
  }

  const timeRangeFormatted = endTimeFormatted && endTimeFormatted !== startTimeFormatted
    ? `${startTimeFormatted} - ${endTimeFormatted}`
    : startTimeFormatted;

  return {
    startDateFormatted: startDateFormatted || startDateStr,
    endDateFormatted: endDateFormatted || startDateFormatted || startDateStr,
    dateRange: dateRangeFormatted,
    startTimeFormatted,
    endTimeFormatted,
    timeRange: timeRangeFormatted,
    isMultiDay,
  };
}

export function EventDetailClient({ event: initialEvent }: EventDetailClientProps) {
  const [event, setEvent] = useState<EventItem>(initialEvent);
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [selectedTicketId, setSelectedTicketId] = useState<string>(initialEvent.ticketTypes[0]?.id || '');
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountPercent: number } | null>(null);
  const [couponError, setCouponError] = useState('');
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryEmail, setInquiryEmail] = useState('');
  const [inquiryPhone, setInquiryPhone] = useState('');
  const [inquirySubject, setInquirySubject] = useState('');
  const [inquiryMessage, setInquiryMessage] = useState('');

  // Synchronize with latest edits from props or localStorage
  React.useEffect(() => {
    let active = initialEvent;
    try {
      const stored = localStorage.getItem('epay_persisted_events');
      if (stored) {
        const parsed = JSON.parse(stored);
        let edited: any = null;
        if (typeof parsed === 'object' && parsed !== null) {
          edited = parsed[initialEvent.id] || parsed[initialEvent.slug];
        }
        if (edited) {
          active = { ...initialEvent, ...edited };
        }
      }
    } catch (e) {
      console.warn('[EventDetailClient] Error reading localStorage:', e);
    }
    setEvent(active);
  }, [initialEvent]);

  // Keep selectedTicketId valid if tickets change
  React.useEffect(() => {
    if (!event.ticketTypes.some(t => t.id === selectedTicketId) && event.ticketTypes.length > 0) {
      setSelectedTicketId(event.ticketTypes[0].id);
    }
  }, [event.ticketTypes, selectedTicketId]);

  const formattedDates = formatDetailDate(event.startDate, event.endDate, event.startTime, event.endTime);

  const isEnded = event.status === 'ended';
  const startDateFormatted = formattedDates.startDateFormatted;
  const endDateFormatted = formattedDates.endDateFormatted;
  const dateRangeFormatted = formattedDates.dateRange;
  const startTimeFormatted = formattedDates.startTimeFormatted;
  const endTimeFormatted = formattedDates.endTimeFormatted;
  const displayTimeRange = formattedDates.timeRange;

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    if (!couponInput.trim()) return;

    const matched = event.couponCodes?.find(
      c => c.code.toUpperCase() === couponInput.trim().toUpperCase()
    );

    if (matched) {
      setAppliedCoupon({ code: matched.code, discountPercent: matched.discountPercent });
    } else {
      setCouponError('Invalid coupon code. Try EPAY20 or EARLYDEV');
    }
  };

  const currentTicket = event.ticketTypes.find(t => t.id === selectedTicketId) || event.ticketTypes[0];
  const finalPrice = appliedCoupon && currentTicket
    ? Math.max(0, Math.round(currentTicket.price * (1 - appliedCoupon.discountPercent / 100)))
    : currentTicket?.price || 0;

  const { user, role } = useAuth();
  const checkoutTarget = `/checkout/${event.slug}?ticketId=${selectedTicketId}${appliedCoupon ? `&coupon=${appliedCoupon.code}` : ''}`;
  const bookHref = user ? checkoutTarget : `/login?redirect=${encodeURIComponent(checkoutTarget)}`;

  return (
    <div className="relative pb-24 lg:pb-12">
      {/* Organizer Quick Actions Bar */}
      {user && (role === 'organizer' || role === 'admin') && (
        <div className="bg-slate-900 border-b border-white/10 text-white px-4 md:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs shadow-inner">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-300">
              Host Preview: You have <strong>{role === 'admin' ? 'Platform Admin' : 'Organizer'}</strong> permissions for this event
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <Link
              href={`/organizer/scanner`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold transition border border-white/15"
            >
              <QrCode className="h-3.5 w-3.5 text-[#0F766E]" />
              <span>Gate Scanner</span>
            </Link>
            <Link
              href={`/create-event?edit=${event.slug}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F97316] hover:bg-[#ea580c] text-white font-bold transition shadow-sm"
            >
              <Edit className="h-3.5 w-3.5" />
              <span>Edit Event Details</span>
            </Link>
          </div>
        </div>
      )}
      
      {/* 1. FULL SCREEN HERO BANNER WITH FRAMER MOTION ANIMATIONS & GLASSMORPHISM OVERLAY */}
      <div className="relative w-full min-h-[85vh] lg:min-h-[90vh] bg-gradient-to-b from-[#0F172A] via-[#1E293B] to-[#0F172A] text-white overflow-hidden flex items-center justify-center">
        {/* Full-width Background Image Display with Gradient Overlays */}
        <motion.div 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.35 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="absolute inset-0 pointer-events-none"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={event.bannerUrl}
            alt={event.title}
            className={`w-full h-full object-cover object-center ${isEnded ? 'grayscale' : ''}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/75 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A]/90 via-[#0F172A]/60 to-[#0F172A]/90"></div>
        </motion.div>

        {/* Ambient Glowing Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#0F766E]/20 blur-[130px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#F97316]/15 blur-[130px] rounded-full pointer-events-none"></div>
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#0F766E_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"></div>

        <div className="container mx-auto px-4 md:px-8 py-16 lg:py-24 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Side: Animated Title & Key Information */}
            <motion.div 
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="lg:col-span-7 space-y-6 text-left"
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="inline-flex items-center gap-2 rounded-full bg-[#0F766E]/30 border border-[#0F766E]/50 px-4 py-1.5 text-xs font-bold text-[#FFEDD5] backdrop-blur-md shadow-lg"
              >
                <Sparkles className="h-4 w-4 text-[#F97316]" /> 
                <span>{isEnded ? 'Concluded Event Archive' : 'Official Verified Event Showcase'}</span>
              </motion.div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight text-white drop-shadow-lg">
                {event.title}
              </h1>

              <p className="text-slate-200 text-sm sm:text-base leading-relaxed max-w-2xl font-normal drop-shadow">
                {event.shortDescription}
              </p>

              {/* Date, Time & Location Quick Chips */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center gap-3 text-xs sm:text-sm text-white bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 shadow-md"
                >
                  <div className="p-2 rounded-xl bg-[#F97316] text-white shrink-0 shadow">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider block">Date & Time</span>
                    <span className="font-bold">{dateRangeFormatted} • {displayTimeRange}</span>
                  </div>
                </motion.div>

                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center gap-3 text-xs sm:text-sm text-white bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 shadow-md"
                >
                  <div className="p-2 rounded-xl bg-[#0F766E] text-white shrink-0 shadow">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider block">Venue</span>
                    <span className="font-bold line-clamp-1">{event.venue.name}, {event.venue.city}</span>
                  </div>
                </motion.div>
              </div>

              {/* Action Buttons & Organizer Tag */}
              <div className="pt-4 flex flex-wrap items-center gap-4">
                <a
                  href="#ticket-section"
                  className="rounded-2xl bg-[#F97316] px-8 py-4 text-sm font-extrabold text-white hover:bg-[#ea580c] transition-all shadow-xl hover:shadow-[#F97316]/30 flex items-center gap-2 group"
                >
                  <Ticket className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  <span>{isEnded ? 'View Event Details' : 'Book Tickets Now'}</span>
                </a>

                <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10">
                  <div className="w-9 h-9 rounded-full bg-[#0F766E] flex items-center justify-center font-bold text-white text-xs shadow ring-2 ring-[#0F766E]/40">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Hosted By</span>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-white">{event.organization.name}</span>
                      {event.organization.verified && (
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#059669]" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Side: Animated Hero Card Stack Visual */}
            <motion.div 
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
              className="lg:col-span-5 relative"
            >
              <motion.div 
                whileHover={{ y: -6 }}
                transition={{ duration: 0.3 }}
                className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/20 bg-slate-900/90 backdrop-blur-xl aspect-video sm:aspect-4/3 group"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={event.bannerUrl}
                  alt={event.title}
                  className={`h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ${isEnded ? 'grayscale opacity-75' : ''}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent"></div>

                {/* Floating Top Badges */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
                  <span className="rounded-full bg-[#0F766E]/90 backdrop-blur-md px-3.5 py-1.5 text-xs font-extrabold text-white shadow-lg border border-white/20">
                    {event.category.name}
                  </span>
                  <span className={`rounded-full px-3.5 py-1.5 text-xs font-extrabold text-white uppercase tracking-wider shadow-lg backdrop-blur-md border border-white/20 ${
                    event.eventType === 'physical' ? 'bg-[#059669]' : event.eventType === 'hybrid' ? 'bg-[#F97316]' : 'bg-blue-600'
                  }`}>
                    {event.eventType}
                  </span>
                </div>

                {/* Floating Bottom Info Pill */}
                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <QrCode className="h-5 w-5 text-cyan-400" />
                    <div>
                      <h4 className="font-extrabold text-xs text-white">Instant Gate Check-in</h4>
                      <span className="text-[10px] text-emerald-400 font-semibold">Verified QR Ticket Entry</span>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-[#F97316] bg-[#F97316]/20 px-2.5 py-1 rounded-lg border border-[#F97316]/40">
                    {isEnded ? 'CLOSED' : 'LIVE'}
                  </span>
                </div>
              </motion.div>
            </motion.div>

          </div>
        </div>
      </div>

      {/* MAIN LAYOUT WITH 2-COLUMN STRUCTURE */}
      <main className="container mx-auto px-4 md:px-8 py-12 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* LEFT CONTENT COLUMN (8 COLUMNS) */}
          <div className="lg:col-span-8 space-y-12">

            {/* 2. EVENT TITLE & QUICK OVERVIEW SUMMARY CARD */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E7E5E4] shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-6"
            >
              <div className="flex items-start gap-3">
                <div className="p-3 bg-[#0F766E]/10 rounded-2xl text-[#0F766E] shrink-0">
                  <Calendar className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#78716C] uppercase tracking-wider">Date & Time</h4>
                  <p className="text-sm font-bold text-[#1C1917] mt-1">{dateRangeFormatted}</p>
                  <p className="text-xs text-[#78716C]">{displayTimeRange} {event.timezone ? `(${event.timezone})` : ''}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-3 bg-[#FFEDD5] rounded-2xl text-[#F97316] shrink-0">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#78716C] uppercase tracking-wider">Location & Venue</h4>
                  <p className="text-sm font-bold text-[#1C1917] mt-1">{event.venue.name}</p>
                  <p className="text-xs text-[#78716C]">{event.venue.address}, {event.venue.city}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-3 bg-[#059669]/10 rounded-2xl text-[#059669] shrink-0">
                  <Globe className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#78716C] uppercase tracking-wider">Event Mode</h4>
                  <p className="text-sm font-bold text-[#1C1917] mt-1 capitalize">{event.eventType} Event</p>
                  <span className="text-xs text-[#059669] font-semibold flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Verified Gate Access
                  </span>
                </div>
              </div>
            </motion.div>

            {/* 3. ABOUT THE EVENT */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E7E5E4] shadow-sm space-y-4"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-[#0F766E] uppercase tracking-widest bg-[#0F766E]/10 px-3 py-1 rounded-full border border-[#0F766E]/20">
                  OVERVIEW
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#1C1917] tracking-tight">
                About <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0F766E] to-teal-600">This Event</span>
              </h2>
              <div className="prose max-w-none text-[#78716C] leading-relaxed whitespace-pre-line text-sm sm:text-base space-y-3">
                {event.description}
              </div>
            </motion.section>

            {/* 4. GOOGLE MAPS VENUE LOCATION */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E7E5E4] shadow-sm space-y-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-[#F97316] uppercase tracking-widest bg-[#F97316]/10 px-3 py-1 rounded-full border border-[#F97316]/20">
                      DIRECTIONS & VENUE
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                      <span className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-pulse"></span>
                      Live Coordinates Verified
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-[#1C1917] tracking-tight mt-2">
                    Venue <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F97316] to-amber-500">Location Map</span>
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${event.venue.name}, ${event.venue.address}, ${event.venue.city}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-white bg-gradient-to-r from-[#0F766E] to-teal-700 hover:brightness-110 flex items-center gap-1.5 px-4 py-2.5 rounded-xl shadow-sm transition"
                  >
                    <span>Get Turn-by-Turn Directions</span> <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>

              {/* Venue details callout */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-[#FAFAF9] p-4 rounded-2xl border border-slate-200">
                <div className="flex items-start gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 mt-0.5">
                    <MapPin className="h-4 w-4 shrink-0" />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-[#1C1917]">{event.venue.name}</div>
                    <div className="text-xs text-slate-500 leading-snug mt-0.5">{event.venue.address}, {event.venue.city}</div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 mt-0.5">
                    <Building2 className="h-4 w-4 shrink-0" />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-[#1C1917]">City & State</div>
                    <div className="text-xs text-slate-500 leading-snug mt-0.5">{event.venue.city}, {event.venue.state || 'India'}</div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 mt-0.5">
                    <Globe className="h-4 w-4 shrink-0" />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-[#1C1917]">Attendance Mode</div>
                    <div className="text-xs text-slate-500 capitalize leading-snug mt-0.5">
                      {event.eventType === 'hybrid' ? 'In-Person & Online Stream' : event.eventType === 'online' ? '100% Online Webcast' : 'In-Person Physical Summit'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Embedded Google Map Iframe with fallbacks */}
              <div className="w-full h-80 rounded-2xl overflow-hidden border border-[#E7E5E4] shadow-sm relative bg-slate-100 group">
                <iframe
                  title={`Google Maps Location for ${event.venue.name}`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(
                    event.venue.latitude && event.venue.longitude
                      ? `${event.venue.latitude},${event.venue.longitude}`
                      : `${event.venue.name}, ${event.venue.address}, ${event.venue.city}`
                  )}&hl=en&z=15&output=embed`}
                ></iframe>

                <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200 shadow-md text-[11px] font-semibold text-slate-700 flex items-center gap-1.5 pointer-events-none">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
                  <span>Interactive Map · Pinch to Zoom & Pan</span>
                </div>
              </div>
            </motion.section>

            {/* 5. EVENT HOST / ORGANIZER PROFILE */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E7E5E4] shadow-sm space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-extrabold text-[#059669] uppercase tracking-widest bg-[#059669]/10 px-3 py-1 rounded-full border border-[#059669]/20">
                    EVENT HOST
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-[#1C1917] tracking-tight mt-2">
                    Hosted by <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-700">{event.organization.name}</span>
                  </h2>
                </div>

                {event.organization.verified && (
                  <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-extrabold shadow-sm">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Verified Host Profile
                  </span>
                )}
              </div>
              
              <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 p-6 sm:p-7 text-white shadow-md relative overflow-hidden">
                {/* Subtle decorative glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={event.organization.avatar || '/team/rahul.jpg'}
                    alt={event.organization.name}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover ring-4 ring-emerald-500/30 shadow-xl shrink-0"
                  />

                  <div className="space-y-3 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                        {event.organization.name}
                      </h3>
                      {event.organization.verified && (
                        <span className="inline-flex sm:hidden items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold">
                          <CheckCircle2 className="h-3 w-3" /> Verified
                        </span>
                      )}
                      <span className="text-[11px] font-bold bg-white/10 text-slate-300 px-2.5 py-0.5 rounded-full border border-white/10">
                        Official Partner
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
                      {event.organization.bio || 'Official verified event organizer hosting summits, conferences, and masterclasses with guaranteed gate entry.'}
                    </p>

                    {/* Host Trust Metrics */}
                    <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-6 text-xs text-slate-300">
                      <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
                        <Mail className="h-3.5 w-3.5 text-teal-400" />
                        <span className="font-medium text-slate-200">{event.organization.contactEmail || 'contact@organizer.com'}</span>
                      </div>

                      <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="text-slate-200 font-medium">100% Verified Organizer</span>
                      </div>

                      <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
                        <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                        <span className="text-slate-200 font-medium">Fast Gate QR Check-in</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* 6. KEYNOTE SPEAKERS GRID */}
            {event.speakers && event.speakers.length > 0 && (
              <motion.section 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E7E5E4] shadow-sm space-y-6"
              >
                <div>
                  <span className="text-xs font-extrabold text-[#0F766E] uppercase tracking-widest bg-[#0F766E]/10 px-3 py-1 rounded-full border border-[#0F766E]/20">
                    FEATURED EXPERTS
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-[#1C1917] tracking-tight mt-2">
                    Keynote <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0F766E] to-teal-600">Speakers</span>
                  </h2>
                </div>

                <motion.div 
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                  {event.speakers.map((sp, idx) => (
                    <motion.div 
                      key={idx} 
                      variants={itemVariants} 
                      whileHover={{ y: -6 }}
                      className="flex flex-col items-center text-center p-5 rounded-2xl bg-[#FAFAF9] border border-[#E7E5E4] hover:bg-white hover:shadow-lg hover:border-[#0F766E] transition-all group"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={sp.avatar}
                        alt={sp.name}
                        className="h-20 w-20 rounded-full object-cover mb-3 ring-4 ring-[#FFEDD5] shadow-sm group-hover:scale-105 transition-transform"
                      />
                      <h3 className="font-bold text-[#1C1917] text-base">{sp.name}</h3>
                      <p className="text-xs font-bold text-[#0F766E] mt-0.5">{sp.role}</p>
                      <p className="text-xs text-[#78716C] font-medium">{sp.company}</p>
                      
                      {sp.bio && (
                        <p className="text-[11px] text-[#78716C] mt-3 pt-3 border-t border-[#E7E5E4] leading-relaxed italic">
                          &quot;{sp.bio}&quot;
                        </p>
                      )}
                    </motion.div>
                  ))}
                </motion.div>
              </motion.section>
            )}

            {/* 7. AGENDA & TIMELINE */}
            {event.agenda && event.agenda.length > 0 && (
              <motion.section 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E7E5E4] shadow-sm space-y-6"
              >
                <div>
                  <span className="text-xs font-extrabold text-[#F97316] uppercase tracking-widest bg-[#F97316]/10 px-3 py-1 rounded-full border border-[#F97316]/20">
                    EVENT TIMELINE
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-[#1C1917] tracking-tight mt-2">
                    Agenda & <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F97316] to-amber-500">Session Schedule</span>
                  </h2>
                </div>

                <div className="space-y-4">
                  {event.agenda.map((item, idx) => (
                    <motion.div 
                      key={idx}
                      whileHover={{ x: 4 }}
                      className="flex flex-col sm:flex-row gap-4 p-5 rounded-2xl bg-[#FAFAF9] border border-[#E7E5E4] hover:border-[#F97316] transition"
                    >
                      <div className="sm:w-48 text-xs font-bold text-[#F97316] flex items-center gap-2 shrink-0 bg-white p-2.5 rounded-xl border border-[#E7E5E4] h-fit">
                        <Clock className="h-4 w-4 text-[#F97316]" />
                        <span>{item.time}</span>
                      </div>
                      <div className="space-y-1 flex-1">
                        <h4 className="font-bold text-[#1C1917] text-base">{item.title}</h4>
                        <p className="text-xs text-[#78716C] leading-relaxed">{item.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            )}

            {/* 8. TICKET TYPES & PRICING SELECTION */}
            <motion.section 
              id="ticket-section"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E7E5E4] shadow-sm space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-extrabold text-[#059669] uppercase tracking-widest bg-[#059669]/10 px-3 py-1 rounded-full border border-[#059669]/20">
                    PASS REGISTRATION
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-[#1C1917] tracking-tight mt-2">
                    Ticket Types & <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#059669] to-emerald-600">Pricing Tiers</span>
                  </h2>
                </div>

                {/* Offer Coupon Form */}
                <form onSubmit={handleApplyCoupon} className="flex items-center gap-2">
                  <div className="relative">
                    <Tag className="h-4 w-4 text-[#78716C] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Promo Coupon Code"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="pl-9 pr-3 py-2 text-xs border border-[#E7E5E4] rounded-xl focus:outline-none focus:border-[#0F766E] uppercase font-mono font-bold"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-3.5 py-2 bg-[#0F766E] text-white text-xs font-bold rounded-xl hover:bg-[#115E59] transition"
                  >
                    Apply
                  </button>
                </form>
              </div>

              {couponError && <p className="text-xs text-red-500 font-medium">{couponError}</p>}
              {appliedCoupon && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center justify-between">
                  <span>Coupon {appliedCoupon.code} Applied! ({appliedCoupon.discountPercent}% Discount)</span>
                  <button onClick={() => setAppliedCoupon(null)} className="text-emerald-900 underline text-[11px]">Remove</button>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                {event.ticketTypes.map(tkt => {
                  const isSelected = selectedTicketId === tkt.id;
                  const tierPrice = appliedCoupon
                    ? Math.max(0, Math.round(tkt.price * (1 - appliedCoupon.discountPercent / 100)))
                    : tkt.price;

                  return (
                    <motion.div
                      key={tkt.id}
                      whileHover={{ y: -6 }}
                      onClick={() => setSelectedTicketId(tkt.id)}
                      className={`p-6 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-4 relative ${
                        isSelected
                          ? 'border-[#0F766E] bg-[#FAFAF9] shadow-xl ring-2 ring-[#0F766E]/20'
                          : 'border-[#E7E5E4] bg-white hover:border-slate-300'
                      }`}
                    >
                      {tkt.isPopular && (
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#F97316] text-white text-[10px] font-extrabold uppercase tracking-wider shadow">
                          MOST POPULAR
                        </span>
                      )}

                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-1">
                          <h3 className="font-extrabold text-[#1C1917] text-lg">{tkt.name}</h3>
                          {isSelected && <CheckCircle2 className="h-5 w-5 text-[#0F766E]" />}
                        </div>

                        {/* Smart Feature Badges */}
                        <div className="flex flex-wrap gap-1.5">
                          {tkt.category && (
                            <span className="bg-slate-100 text-[#0F766E] border border-[#0F766E]/20 text-[10px] font-bold px-2 py-0.5 rounded-md">
                              {tkt.category}
                            </span>
                          )}
                          {tkt.isEarlyBird && (
                            <span className="bg-[#F97316] text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                              <Sparkles className="h-3 w-3" /> Early Bird Pass
                            </span>
                          )}
                          {tkt.isGroupDiscount && (
                            <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              15% Off (4+ Group)
                            </span>
                          )}
                          {tkt.isComplimentary && (
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              Complimentary
                            </span>
                          )}
                          {tkt.isWaitlist && (
                            <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              Waitlist Open
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-[#78716C] leading-relaxed">{tkt.description}</p>

                        <div className="pt-2 flex items-baseline gap-2">
                          <span className="text-3xl font-black text-[#1C1917]">
                            {tierPrice === 0 ? 'FREE' : `₹${tierPrice.toLocaleString()}`}
                          </span>
                          {(tkt.originalPrice || (appliedCoupon && tkt.price > 0)) && (
                            <span className="text-xs text-[#78716C] line-through">
                              ₹{(tkt.originalPrice || tkt.price).toLocaleString()}
                            </span>
                          )}
                        </div>

                        {tkt.features && tkt.features.length > 0 && (
                          <div className="space-y-2 pt-3 border-t border-[#E7E5E4]">
                            {tkt.features.map((feat, fidx) => (
                              <div key={fidx} className="flex items-center gap-2 text-xs text-[#1C1917] font-medium">
                                <Check className="h-3.5 w-3.5 text-[#059669] shrink-0" />
                                <span>{feat}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="pt-4">
                        <Link
                          href={`/checkout/${event.slug}?ticketId=${tkt.id}${appliedCoupon ? `&coupon=${appliedCoupon.code}` : ''}`}
                          className={`w-full text-center block rounded-xl py-3 text-xs font-bold transition shadow-sm ${
                            isSelected
                              ? 'bg-[#F97316] text-white hover:bg-[#ea580c]'
                              : 'bg-[#0F766E] text-white hover:bg-[#115E59]'
                          }`}
                        >
                          {isEnded ? 'Pass Expired' : 'Select Pass'}
                        </Link>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.section>

            {/* 9. SPONSORS LOGO GRID */}
            {event.sponsors && event.sponsors.length > 0 && (
              <motion.section 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E7E5E4] shadow-sm space-y-6"
              >
                <div>
                  <span className="text-xs font-extrabold text-[#0F766E] uppercase tracking-widest bg-[#0F766E]/10 px-3 py-1 rounded-full border border-[#0F766E]/20">
                    EVENT SUPPORTERS
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-[#1C1917] tracking-tight mt-2">
                    Official <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0F766E] to-teal-600">Sponsors</span>
                  </h2>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                  {event.sponsors.map((sp, idx) => (
                    <a
                      key={idx}
                      href={sp.websiteUrl || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-5 rounded-2xl border border-[#E7E5E4] bg-[#FAFAF9] flex flex-col items-center justify-center text-center hover:border-[#0F766E] hover:shadow-md transition group"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={sp.logoUrl}
                        alt={sp.name}
                        className="h-12 w-auto object-contain mb-2 group-hover:scale-110 transition-transform"
                      />
                      <span className="font-bold text-[#1C1917] text-xs mt-1">{sp.name}</span>
                      <span className="text-[10px] text-[#78716C] font-semibold uppercase tracking-wider">{sp.tier} Sponsor</span>
                    </a>
                  ))}
                </div>
              </motion.section>
            )}

            {/* 10. EXHIBITORS CARDS */}
            {event.exhibitors && event.exhibitors.length > 0 && (
              <motion.section 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E7E5E4] shadow-sm space-y-6"
              >
                <div>
                  <span className="text-xs font-extrabold text-[#F97316] uppercase tracking-widest bg-[#F97316]/10 px-3 py-1 rounded-full border border-[#F97316]/20">
                    EXPO FLOOR
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-[#1C1917] tracking-tight mt-2">
                    Exhibitors & <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F97316] to-amber-500">Booths</span>
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {event.exhibitors.map((ex, idx) => (
                    <div key={idx} className="p-5 rounded-2xl border border-[#E7E5E4] bg-[#FAFAF9] space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase bg-[#0F766E]/10 text-[#0F766E] px-2.5 py-1 rounded-full">
                          {ex.boothNumber}
                        </span>
                        <span className="text-[11px] text-[#78716C] font-semibold">{ex.category}</span>
                      </div>
                      <h4 className="font-extrabold text-[#1C1917] text-base">{ex.name}</h4>
                      <p className="text-xs text-[#78716C] leading-relaxed">{ex.description}</p>
                    </div>
                  ))}
                </div>
              </motion.section>
            )}

            {/* 11. FAQS ACCORDION */}
            {event.faqs && event.faqs.length > 0 && (
              <motion.section 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E7E5E4] shadow-sm space-y-6"
              >
                <div>
                  <span className="text-xs font-extrabold text-[#0F766E] uppercase tracking-widest bg-[#0F766E]/10 px-3 py-1 rounded-full border border-[#0F766E]/20">
                    ATTENDEE HELPDESK
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-[#1C1917] tracking-tight mt-2">
                    Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0F766E] to-teal-600">Questions</span>
                  </h2>
                </div>

                <div className="space-y-4">
                  {event.faqs.map((faq, idx) => (
                    <div key={idx} className="border border-[#E7E5E4] rounded-2xl overflow-hidden bg-[#FAFAF9]">
                      <button
                        onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                        className="w-full text-left p-5 font-bold text-sm text-[#1C1917] flex justify-between items-center"
                      >
                        <span>{faq.question}</span>
                        <ChevronDown className={`h-4 w-4 text-[#78716C] transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
                      </button>
                      {openFaq === idx && (
                        <div className="px-5 pb-5 text-xs sm:text-sm text-[#78716C] leading-relaxed border-t border-[#E7E5E4] pt-3 bg-white">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.section>
            )}

            {/* 12. ATTENDEE REVIEWS & RATINGS */}
            <EventReviewsSection
              eventId={event.slug || event.id}
              eventTitle={event.title}
              organizerName={event.organization.name}
            />

            {/* 13. TERMS & REFUND POLICY */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E7E5E4] shadow-sm space-y-4"
            >
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#0F766E]" />
                <h3 className="font-bold text-[#1C1917] text-lg">Terms & Refund Policy</h3>
              </div>
              <div className="space-y-2 text-xs text-[#78716C] leading-relaxed">
                {(event.termsAndPolicy || [
                  'Tickets are non-refundable within 7 days of the event start date.',
                  'Pass transfer to colleagues is allowed free of charge up to 24 hours before gate entry.',
                  'Attendees must present their digital QR pass on mobile or printed PDF at entrance gate.',
                ]).map((term, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#0F766E] mt-1.5 shrink-0"></span>
                    <span>{term}</span>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* 13. CONTACT ORGANIZER INQUIRY FORM */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E7E5E4] shadow-sm space-y-6"
            >
              <div>
                <span className="text-xs font-extrabold text-[#F97316] uppercase tracking-widest bg-[#F97316]/10 px-3 py-1 rounded-full border border-[#F97316]/20">
                  DIRECT ASSISTANCE
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#1C1917] tracking-tight mt-2">
                  Contact <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F97316] to-amber-500">Organizer</span>
                </h2>
                <p className="text-xs text-[#78716C] mt-1">Have a specific question about passes, speaking opportunities, or sponsorships?</p>
              </div>

              {contactSubmitted ? (
                <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3">
                  <CheckCircle2 className="h-9 w-9 text-[#059669] mx-auto" />
                  <h4 className="font-bold text-emerald-900 text-sm">Query Dispatched to {event.organization.name}!</h4>
                  <p className="text-xs text-emerald-700 max-w-md mx-auto">
                    Your inquiry has been logged in the organizer&apos;s Command Center inbox. A direct response will be routed to <strong>{inquiryEmail}</strong> within 24 business hours.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setContactSubmitted(false);
                      setInquiryMessage('');
                      setInquirySubject('');
                    }}
                    className="text-xs font-bold text-emerald-800 hover:underline pt-2 block mx-auto"
                  >
                    Send another query
                  </button>
                </div>
              ) : (
                <form 
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setContactSubmitting(true);
                    try {
                      await fetch('/api/inquiries', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          eventId: event.id,
                          eventTitle: event.title,
                          organizerEmail: event.organization.contactEmail || 'contact@organizer.com',
                          senderName: inquiryName,
                          senderEmail: inquiryEmail,
                          senderPhone: inquiryPhone,
                          subject: inquirySubject || 'General Attendee Query',
                          message: inquiryMessage,
                        }),
                      });
                      setContactSubmitted(true);
                    } catch (err) {
                      console.warn('Inquiry submit error:', err);
                      setContactSubmitted(true);
                    } finally {
                      setContactSubmitting(false);
                    }
                  }} 
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Your Full Name *</label>
                      <input
                        type="text"
                        required
                        value={inquiryName}
                        onChange={(e) => setInquiryName(e.target.value)}
                        placeholder="e.g. Rahul Sharma"
                        className="w-full p-3 text-xs border border-[#E7E5E4] rounded-xl focus:outline-none focus:border-[#0F766E]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Your Email Address *</label>
                      <input
                        type="email"
                        required
                        value={inquiryEmail}
                        onChange={(e) => setInquiryEmail(e.target.value)}
                        placeholder="name@company.com"
                        className="w-full p-3 text-xs border border-[#E7E5E4] rounded-xl focus:outline-none focus:border-[#0F766E]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Contact Phone (Optional)</label>
                      <input
                        type="tel"
                        value={inquiryPhone}
                        onChange={(e) => setInquiryPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full p-3 text-xs border border-[#E7E5E4] rounded-xl focus:outline-none focus:border-[#0F766E]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Subject / Topic</label>
                      <input
                        type="text"
                        value={inquirySubject}
                        onChange={(e) => setInquirySubject(e.target.value)}
                        placeholder="e.g. Group Pass / Speaking / Sponsorship"
                        className="w-full p-3 text-xs border border-[#E7E5E4] rounded-xl focus:outline-none focus:border-[#0F766E]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Your Message or Question *</label>
                    <textarea
                      required
                      rows={4}
                      value={inquiryMessage}
                      onChange={(e) => setInquiryMessage(e.target.value)}
                      placeholder="Write your question or request for the event management team..."
                      className="w-full p-3 text-xs border border-[#E7E5E4] rounded-xl focus:outline-none focus:border-[#0F766E]"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={contactSubmitting}
                    className="rounded-xl bg-gradient-to-r from-[#F97316] to-amber-500 hover:brightness-110 px-6 py-3 text-xs font-bold text-white transition shadow-md flex items-center gap-2 disabled:opacity-50"
                  >
                    {contactSubmitting ? (
                      <span className="flex items-center gap-2">
                        <span className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span>Routing Message to Organizer...</span>
                      </span>
                    ) : (
                      <>
                        <Send className="h-4 w-4" /> Send Message to Organizer
                      </>
                    )}
                  </button>
                </form>
              )}
            </motion.section>

            {/* 14. SOCIAL SHARE BUTTONS */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E7E5E4] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4"
            >
              <div>
                <h3 className="font-extrabold text-[#1C1917] text-base">Share Event With Friends & Colleagues</h3>
                <p className="text-xs text-[#78716C]">Spread the word about this summit on social networks</p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleCopyLink}
                  className="p-3 bg-[#FAFAF9] border border-[#E7E5E4] hover:bg-[#0F766E] hover:text-white rounded-xl text-[#1C1917] transition flex items-center gap-1.5 text-xs font-bold"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                  <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
                    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out ${event.title}: ${currentUrl}`)}`, '_blank');
                  }}
                  className="p-3 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-xl transition"
                  aria-label="Share on WhatsApp"
                >
                  <Send className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
                    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(event.title)}&url=${encodeURIComponent(currentUrl)}`, '_blank');
                  }}
                  className="p-3 bg-sky-50 text-sky-700 hover:bg-sky-600 hover:text-white rounded-xl transition flex items-center gap-1 text-xs font-bold"
                  aria-label="Share on X"
                >
                  <Globe className="h-4 w-4" />
                  <span>X / Twitter</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
                    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`, '_blank');
                  }}
                  className="p-3 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white rounded-xl transition flex items-center gap-1 text-xs font-bold"
                  aria-label="Share on LinkedIn"
                >
                  <Share2 className="h-4 w-4" />
                  <span>LinkedIn</span>
                </button>
              </div>
            </motion.section>

          </div>

          {/* RIGHT SIDEBAR TICKET SELECTION & CHECKOUT BOX (4 COLUMNS) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E7E5E4] shadow-xl sticky top-24 space-y-6">
              <div className="flex items-center justify-between border-b border-[#E7E5E4] pb-4">
                <div>
                  <span className="text-[10px] font-bold text-[#0F766E] uppercase tracking-wider block">PASS SELECTION</span>
                  <h3 className="text-xl font-black text-[#1C1917]">Select Passes</h3>
                </div>
                <Ticket className="h-6 w-6 text-[#F97316]" />
              </div>

              {isEnded ? (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-2 text-center">
                  <span className="font-bold text-amber-900 text-sm block">Ticket Sales Closed</span>
                  <p className="text-xs text-amber-700">This event has already taken place. Pass purchasing is unavailable.</p>
                  <Link href="/events" className="mt-2 inline-block rounded-xl bg-amber-600 text-white px-4 py-2 text-xs font-bold hover:bg-amber-700">
                    Browse Upcoming Events
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {event.ticketTypes.map(tkt => (
                    <div 
                      key={tkt.id} 
                      onClick={() => setSelectedTicketId(tkt.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        selectedTicketId === tkt.id
                          ? 'border-[#0F766E] bg-[#FAFAF9] ring-2 ring-[#0F766E]/20 shadow-sm'
                          : 'border-[#E7E5E4] bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-[#1C1917] text-sm">{tkt.name}</h4>
                          <p className="text-[11px] text-[#78716C] mt-0.5 line-clamp-1">{tkt.description}</p>
                        </div>
                        <span className="font-black text-[#1C1917] text-base shrink-0 ml-2">
                          {tkt.price === 0 ? 'FREE' : `₹${tkt.price.toLocaleString()}`}
                        </span>
                      </div>
                    </div>
                  ))}

                  <div className="pt-2">
                    <Link
                      href={bookHref}
                      className="w-full text-center block rounded-2xl bg-[#F97316] py-3.5 text-sm font-extrabold text-white hover:bg-[#ea580c] transition shadow-lg"
                    >
                      Book Ticket (₹{finalPrice.toLocaleString()})
                    </Link>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-[#E7E5E4] space-y-3">
                <div className="flex items-center gap-2 text-xs text-[#059669] font-bold">
                  <CheckCircle2 className="h-4 w-4" /> Instant PDF Ticket with QR Code
                </div>
                <div className="flex items-center gap-2 text-xs text-[#78716C]">
                  <ShieldCheck className="h-4 w-4 text-[#78716C]" /> Encrypted UPI & Card Payment Gateway
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* 15. STICKY "REGISTER NOW" BOTTOM BAR FOR MOBILE & QUICK ACCESS */}
      {!isEnded && (
        <motion.div 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-[#E7E5E4] p-4 shadow-2xl lg:hidden flex items-center justify-between"
        >
          <div>
            <span className="text-[10px] text-[#78716C] font-semibold block uppercase tracking-wider">Pass starting from</span>
            <span className="text-xl font-black text-[#1C1917]">
              ₹{Math.min(...event.ticketTypes.map(t => t.price)).toLocaleString()}
            </span>
          </div>

          <a
            href="#ticket-section"
            className="rounded-xl bg-[#F97316] px-6 py-3 text-xs font-extrabold text-white hover:bg-[#ea580c] transition shadow-md flex items-center gap-2"
          >
            <Ticket className="h-4 w-4" /> Select Tickets
          </a>
        </motion.div>
      )}

    </div>
  );
}

