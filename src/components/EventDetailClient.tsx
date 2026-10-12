'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { 
  Calendar, MapPin, Ticket, ShieldCheck, Share2, Clock, Globe, ArrowLeft, CheckCircle2, 
  Building2, Mail, Wifi, Utensils, QrCode, Video, Car, Coffee, Award, Music, Sun, Sparkles, 
  AlertCircle, ChevronDown, Copy, Check, Send, ExternalLink, HelpCircle, FileText, UserCheck, Tag, MessageSquare
} from 'lucide-react';
import { EventItem } from '@/lib/types';
import { ContactOrganizerButton } from '@/components/ContactOrganizerButton';

interface EventDetailClientProps {
  event: EventItem;
}

const facilityIconMap: Record<string, React.ReactNode> = {
  Wifi: <Wifi className="h-5 w-5 text-[#0F766E]" />,
  Utensils: <Utensils className="h-5 w-5 text-[#F97316]" />,
  QrCode: <QrCode className="h-5 w-5 text-[#059669]" />,
  Video: <Video className="h-5 w-5 text-purple-600" />,
  Parking: <Car className="h-5 w-5 text-amber-600" />,
  ShieldCheck: <ShieldCheck className="h-5 w-5 text-[#059669]" />,
  Coffee: <Coffee className="h-5 w-5 text-amber-700" />,
  Award: <Award className="h-5 w-5 text-yellow-600" />,
  Music: <Music className="h-5 w-5 text-pink-600" />,
  Sun: <Sun className="h-5 w-5 text-amber-500" />,
};

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

export function EventDetailClient({ event }: EventDetailClientProps) {
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [selectedTicketId, setSelectedTicketId] = useState<string>(event.ticketTypes[0]?.id || '');
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountPercent: number } | null>(null);
  const [couponError, setCouponError] = useState('');
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [formattedDate, setFormattedDate] = useState({ date: '', time: '' });

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setShareUrl(window.location.href);
      setFormattedDate({
        date: new Date(event.startDate).toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        }),
        time: new Date(event.startDate).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      });
    }
  }, [event.startDate]);

  const isEnded = event.status === 'ended';
  const startDateFormatted = formattedDate.date || event.startDate;
  const startTimeFormatted = formattedDate.time || '';

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

  return (
    <div className="relative pb-24 lg:pb-12">
      
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
                    <span className="font-bold">{startDateFormatted} • {startTimeFormatted}</span>
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
                  <p className="text-sm font-bold text-[#1C1917] mt-1">{startDateFormatted}</p>
                  <p className="text-xs text-[#78716C]">{startTimeFormatted} {event.timezone}</p>
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
              className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E7E5E4] shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-extrabold text-[#F97316] uppercase tracking-widest bg-[#F97316]/10 px-3 py-1 rounded-full border border-[#F97316]/20">
                    DIRECTIONS & VENUE
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-[#1C1917] tracking-tight mt-2">
                    Venue <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F97316] to-amber-500">Location Map</span>
                  </h2>
                </div>
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(`${event.venue.name}, ${event.venue.address}, ${event.venue.city}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-[#0F766E] hover:underline flex items-center gap-1 bg-[#0F766E]/10 px-3.5 py-2 rounded-xl"
                >
                  <span>Open in Google Maps</span> <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>

              <p className="text-xs sm:text-sm text-[#78716C]">
                <strong>{event.venue.name}</strong> — {event.venue.address}, {event.venue.city}, {event.venue.state || ''} {event.venue.country}
              </p>

              {/* Embedded Google Map Iframe */}
              <div className="w-full h-72 rounded-2xl overflow-hidden border border-[#E7E5E4] shadow-inner relative bg-slate-100">
                <iframe
                  title="Venue Google Maps Location"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3771.5!2d${event.venue.longitude || 72.8687}!3d${event.venue.latitude || 19.0657}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTTCsDAzJzU2LjUiTiA3MsKwNTInMDcuMyJF!5e0!3m2!1sen!2sin!4v1680000000000!5m2!1sen!2sin`}
                ></iframe>
              </div>
            </motion.section>

            {/* 5. ORGANIZER INFORMATION */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E7E5E4] shadow-sm space-y-6"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-[#059669] uppercase tracking-widest bg-[#059669]/10 px-3 py-1 rounded-full border border-[#059669]/20">
                  EVENT HOST
                </span>
              </div>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-6 rounded-2xl bg-[#FAFAF9] border border-[#E7E5E4]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={event.organization.avatar || '/team/rahul.jpg'}
                  alt={event.organization.name}
                  className="w-20 h-20 rounded-full object-cover ring-4 ring-[#FFEDD5] shadow-md shrink-0"
                />
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-[#1C1917]">{event.organization.name}</h3>
                    {event.organization.verified && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#059669]/10 text-[#059669] text-xs font-bold">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Verified Host
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#78716C] leading-relaxed">
                    {event.organization.bio || 'Official verified event organizer hosting summits, conferences and masterclasses on ePayEvents platform.'}
                  </p>
                  <div className="pt-2 flex items-center gap-4 text-xs font-medium text-[#78716C]">
                    <span className="flex items-center gap-1.5"><Mail className="h-4 w-4 text-[#0F766E]" /> {event.organization.contactEmail || 'contact@organizer.com'}</span>
                  </div>
                </div>
                <ContactOrganizerButton orgName={event.organization.name} email={event.organization.contactEmail} />
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

            {/* 12. TERMS & REFUND POLICY */}
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
                <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
                  <CheckCircle2 className="h-8 w-8 text-[#059669] mx-auto" />
                  <h4 className="font-bold text-emerald-900 text-sm">Message Sent to Organizer!</h4>
                  <p className="text-xs text-emerald-700">The event team will get back to your email within 24 business hours.</p>
                </div>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); setContactSubmitted(true); }} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      required
                      placeholder="Your Full Name"
                      className="p-3 text-xs border border-[#E7E5E4] rounded-xl focus:outline-none focus:border-[#0F766E]"
                    />
                    <input
                      type="email"
                      required
                      placeholder="Your Email Address"
                      className="p-3 text-xs border border-[#E7E5E4] rounded-xl focus:outline-none focus:border-[#0F766E]"
                    />
                  </div>
                  <textarea
                    required
                    rows={4}
                    placeholder="Write your question or message for the event team..."
                    className="w-full p-3 text-xs border border-[#E7E5E4] rounded-xl focus:outline-none focus:border-[#0F766E]"
                  ></textarea>
                  <button
                    type="submit"
                    className="rounded-xl bg-[#F97316] px-6 py-3 text-xs font-bold text-white hover:bg-[#ea580c] transition shadow-md flex items-center gap-2"
                  >
                    <Send className="h-4 w-4" /> Send Message to Organizer
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

                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out ${event.title}: ${shareUrl}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-xl transition"
                  aria-label="Share on WhatsApp"
                >
                  <Send className="h-4 w-4" />
                </a>

                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(event.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-sky-50 text-sky-700 hover:bg-sky-600 hover:text-white rounded-xl transition flex items-center gap-1 text-xs font-bold"
                  aria-label="Share on X"
                >
                  <Globe className="h-4 w-4" />
                  <span>X / Twitter</span>
                </a>

                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white rounded-xl transition flex items-center gap-1 text-xs font-bold"
                  aria-label="Share on LinkedIn"
                >
                  <Share2 className="h-4 w-4" />
                  <span>LinkedIn</span>
                </a>
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
                      href={`/checkout/${event.slug}?ticketId=${selectedTicketId}${appliedCoupon ? `&coupon=${appliedCoupon.code}` : ''}`}
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

