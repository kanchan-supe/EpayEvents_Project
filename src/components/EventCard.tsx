'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Calendar, MapPin, Eye, Ticket, Clock, User, Sparkles, Globe, Star } from 'lucide-react';
import { EventItem } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';

export interface EventCardProps {
  id?: string;
  title?: string;
  slug?: string;
  coverImage?: string;
  date?: string;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  venue?: string;
  city?: string;
  isOnline?: boolean;
  startingPrice?: number;
  availableSeats?: number;
  category?: string;
  organizerName?: string;
  eventStatus?: 'live' | 'upcoming' | 'past';
  // Backward compatibility with direct event object
  event?: EventItem;
  className?: string;
}

function formatCardTime(timeStr?: string): string {
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

export function EventCard(props: EventCardProps) {
  // If `event` object is provided, resolve properties from it; otherwise use explicit props
  const eventObj = props.event;

  const id = props.id ?? eventObj?.id ?? '';
  const title = props.title ?? eventObj?.title ?? 'Untitled Event';
  const slug = props.slug ?? eventObj?.slug ?? '';
  const coverImage = props.coverImage ?? eventObj?.bannerUrl ?? 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=80';
  
  // Starting price
  let startingPrice = props.startingPrice;
  if (startingPrice === undefined && eventObj?.ticketTypes && eventObj.ticketTypes.length > 0) {
    startingPrice = Math.min(...eventObj.ticketTypes.map(t => t.price));
  } else if (startingPrice === undefined) {
    startingPrice = 0;
  }

  // Available seats
  let availableSeats = props.availableSeats;
  if (availableSeats === undefined && eventObj?.ticketTypes && eventObj.ticketTypes.length > 0) {
    availableSeats = eventObj.ticketTypes.reduce(
      (acc, tier) => acc + (tier.remainingQuantity ?? tier.quantity),
      0
    );
  } else if (availableSeats === undefined) {
    availableSeats = 0;
  }

  // Category
  const category = props.category ?? eventObj?.category?.name ?? 'Conference';

  // Organizer Name
  const organizerName = props.organizerName ?? eventObj?.organization?.name ?? 'ePayEvents Organizer';

  // isOnline
  const isOnline = props.isOnline !== undefined
    ? props.isOnline
    : eventObj?.eventType === 'online';

  // Venue & City
  const venue = props.venue ?? eventObj?.venue?.name ?? (isOnline ? 'Online Event' : 'Main Venue');
  const city = props.city ?? eventObj?.venue?.city ?? (isOnline ? 'Virtual' : 'India');

  // Date and Time parsing for all 4 fields (Start Date, End Date, Start Time, End Time)
  const rawStartDate = props.startDate || props.date || eventObj?.startDate || eventObj?.date || '';
  const rawEndDate = props.endDate || eventObj?.endDate || rawStartDate;
  const rawStartTime = props.startTime || eventObj?.startTime || '';
  const rawEndTime = props.endTime || eventObj?.endTime || '';

  // Format Start Date
  let displayStartDate = '';
  if (rawStartDate) {
    try {
      const datePart = rawStartDate.split('T')[0];
      if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
        const [y, m, d] = datePart.split('-').map(Number);
        displayStartDate = new Date(y, m - 1, d).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      } else {
        const parsed = new Date(rawStartDate);
        if (!isNaN(parsed.getTime())) {
          displayStartDate = parsed.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          });
        }
      }
    } catch {
      displayStartDate = rawStartDate;
    }
  }

  // Format End Date
  let displayEndDate = '';
  if (rawEndDate && rawEndDate !== rawStartDate) {
    try {
      const datePart = rawEndDate.split('T')[0];
      if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
        const [y, m, d] = datePart.split('-').map(Number);
        displayEndDate = new Date(y, m - 1, d).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      }
    } catch {}
  }

  const finalDisplayDate = displayEndDate && displayEndDate !== displayStartDate
    ? `${displayStartDate} - ${displayEndDate}`
    : displayStartDate || 'Upcoming';

  // Format Start Time
  let displayStartTime = rawStartTime ? formatCardTime(rawStartTime) : '';
  if (!displayStartTime && rawStartDate.includes('T')) {
    const match = rawStartDate.match(/T(\d{2}):(\d{2})/);
    if (match && (match[1] !== '00' || match[2] !== '00')) {
      displayStartTime = formatCardTime(`${match[1]}:${match[2]}`);
    }
  }
  if (!displayStartTime) displayStartTime = '10:00 AM';

  // Format End Time
  let displayEndTime = rawEndTime ? formatCardTime(rawEndTime) : '';
  if (!displayEndTime && rawEndDate.includes('T')) {
    const match = rawEndDate.match(/T(\d{2}):(\d{2})/);
    if (match && (match[1] !== '00' || match[2] !== '00')) {
      displayEndTime = formatCardTime(`${match[1]}:${match[2]}`);
    }
  }

  const finalDisplayTime = displayEndTime && displayEndTime !== displayStartTime
    ? `${displayStartTime} - ${displayEndTime}`
    : displayStartTime;

  // Calculate automatic event status: Live | Upcoming | Past
  const calculateAutoStatus = (dateStr?: string): 'live' | 'upcoming' | 'past' => {
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

  const autoStatus: 'live' | 'upcoming' | 'past' = props.eventStatus || calculateAutoStatus(rawStartDate);
  const isEnded = autoStatus === 'past' || eventObj?.status === 'ended';
  const isFeatured = eventObj?.featured;
  const isFree = startingPrice === 0;

  const { user } = useAuth();
  const eventLink = user ? `/events/${slug}` : `/login?redirect=${encodeURIComponent(`/events/${slug}`)}`;

  // 3D Tilt & Metallic Shimmer physics
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Mouse coordinate offsets normalized from -0.5 to 0.5
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Spring physics for buttery-smooth dampening
  const springConfig = { damping: 20, stiffness: 220, mass: 0.6 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  // 3D rotation angles (-7deg to +7deg)
  const rotateX = useTransform(smoothMouseY, [-0.5, 0.5], [6, -6]);
  const rotateY = useTransform(smoothMouseX, [-0.5, 0.5], [-6, 6]);

  // Dynamic metallic glare center position in percentage
  const glareX = useTransform(smoothMouseX, [-0.5, 0.5], [0, 100]);
  const glareY = useTransform(smoothMouseY, [-0.5, 0.5], [0, 100]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div style={{ perspective: 1100 }} className="h-full">
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className={`group font-sans rounded-2xl border border-[#E7E5E4] bg-white shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col justify-between overflow-hidden h-full relative ${
          props.className || ''
        }`}
      >
        {/* Metallic Shimmer & Holographic Sheen Overlay */}
        <motion.div
          className="pointer-events-none absolute inset-0 z-30 transition-opacity duration-300"
          style={{
            opacity: isHovered ? 0.35 : 0,
            background: `radial-gradient(circle 380px at ${glareX.get()}% ${glareY.get()}%, rgba(255, 255, 255, 0.85), rgba(15, 118, 110, 0.15) 30%, rgba(249, 115, 22, 0.12) 60%, transparent 80%)`,
          }}
        />

        {/* Diagonal light sweep animation across card on hover */}
        <div 
          className="pointer-events-none absolute -inset-full top-0 z-20 block h-[200%] w-[50%] -rotate-45 bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 group-hover:translate-x-[400%] group-hover:duration-1000 ease-in-out" 
        />

        <div>
          {/* Event Cover Image on Top */}
          <Link href={eventLink} className="block relative h-48 w-full bg-slate-100 overflow-hidden cursor-pointer">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverImage}
              alt={title}
              className={`h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 ${
                isEnded ? 'grayscale opacity-75' : ''
              }`}
            />

          {/* Badges: Category & Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
            {isFeatured && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#F97316] text-white px-2.5 py-0.5 text-[10px] font-bold shadow-sm">
                <Sparkles className="h-3 w-3" />
                Featured
              </span>
            )}
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm ${
                isOnline ? 'bg-purple-600' : 'bg-[#0F766E]'
              }`}
            >
              {isOnline ? (
                <>
                  <Globe className="h-3 w-3" /> Online Event
                </>
              ) : (
                'Offline'
              )}
            </span>
          </div>

          {/* Top Right: Status Badge (Live: Green, Upcoming: Teal, Past: Gray) & Seats */}
          <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
            <span
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow text-white flex items-center gap-1 ${
                autoStatus === 'live'
                  ? 'bg-emerald-600'
                  : autoStatus === 'upcoming'
                  ? 'bg-[#0F766E]'
                  : 'bg-slate-600'
              }`}
            >
              {autoStatus === 'live' && <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse"></span>}
              {autoStatus === 'live' ? 'Live' : autoStatus === 'upcoming' ? 'Upcoming' : 'Past'}
            </span>

            {availableSeats > 0 && autoStatus !== 'past' && (
              <span className="hidden sm:inline-flex rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider shadow bg-black/60 backdrop-blur-md text-white">
                {availableSeats} Seats
              </span>
            )}
            {availableSeats <= 0 && autoStatus !== 'past' && (
              <span className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider shadow bg-rose-600 text-white">
                Sold Out
              </span>
            )}
          </div>
        </Link>

        {/* Card Body */}
        <div className="p-5 space-y-3">
          {/* Category Badge & Review Rating */}
          <div className="flex items-center justify-between text-xs">
            {category ? (
              <span className="font-bold text-[#0F766E] bg-[#CCFBF1]/50 px-2.5 py-0.5 rounded-md border border-[#0F766E]/20">
                {category}
              </span>
            ) : <span />}

            {/* Social Proof Rating */}
            <div className="flex items-center gap-1 font-bold text-slate-800 text-[11px] bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
              <Star className="h-3.5 w-3.5 fill-[#F97316] text-[#F97316]" />
              <span>4.9</span>
              <span className="text-slate-400 font-normal text-[10px]">(verified)</span>
            </div>
          </div>

          {/* Event Title (max 2 lines) */}
          <Link href={eventLink} className="block">
            <h3 className="font-bold text-[#1C1917] text-base group-hover:text-[#0F766E] transition-colors line-clamp-2 leading-snug">
              {title}
            </h3>
          </Link>

          {/* Organizer Name */}
          <div className="flex items-center gap-1.5 text-xs text-[#78716C]">
            <User className="h-3.5 w-3.5 text-[#0F766E] shrink-0" />
            <span className="line-clamp-1 font-medium text-slate-700">
              By {organizerName}
            </span>
          </div>

          {/* Date and Time */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-[#78716C]">
            {finalDisplayDate && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span>{finalDisplayDate}</span>
              </div>
            )}
            {finalDisplayTime && (
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span>{finalDisplayTime}</span>
              </div>
            )}
          </div>

          {/* Venue + City (or "Online Event") */}
          <div className="flex items-center gap-1.5 text-xs text-[#78716C]">
            {isOnline ? (
              <>
                <Globe className="h-3.5 w-3.5 text-purple-600 shrink-0" />
                <span className="font-semibold text-purple-700">Online Event</span>
              </>
            ) : (
              <>
                <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span className="line-clamp-1">
                  {venue}{city ? `, ${city}` : ''}
                </span>
              </>
            )}
          </div>

          {/* Starting Price (e.g. ₹1499 onwards) */}
          <div className="text-xs pt-2 border-t border-[#E7E5E4] flex items-center justify-between">
            <span className="text-[#78716C] font-medium">Starting Price</span>
            <span className="font-black text-[#1C1917] text-sm">
              {isFree ? 'FREE' : `₹${startingPrice.toLocaleString()} onwards`}
            </span>
          </div>
        </div>
      </div>

      {/* Footer Actions: Two Buttons ("View Details" and "Book Now") */}
      <div className="p-5 pt-0 flex items-center justify-between gap-3 mt-2">
        <Link
          href={eventLink}
          className="flex-1 rounded-xl border border-[#0F766E] text-[#0F766E] bg-white hover:bg-[#0F766E]/5 py-2.5 px-3 text-xs font-bold text-center transition-colors flex items-center justify-center gap-1.5"
        >
          <Eye className="h-3.5 w-3.5" />
          <span>View Details</span>
        </Link>

        {isEnded ? (
          <Link
            href={eventLink}
            className="flex-1 rounded-xl bg-slate-100 py-2.5 px-3 text-xs font-bold text-[#1C1917] hover:bg-slate-200 text-center transition-colors flex items-center justify-center gap-1.5"
          >
            <span>View Details</span>
          </Link>
        ) : (
          <Link
            href={eventLink}
            className="flex-1 rounded-xl bg-[#F97316] hover:bg-[#ea580c] text-white py-2.5 px-3 text-xs font-bold text-center transition-colors flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Ticket className="h-3.5 w-3.5" />
            <span>Book Now</span>
          </Link>
        )}
        </div>
      </motion.div>
    </div>
  );
}
export default EventCard;
