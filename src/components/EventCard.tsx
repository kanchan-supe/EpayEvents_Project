'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Eye, Ticket, Clock, User, Sparkles, Globe } from 'lucide-react';
import { EventItem } from '@/lib/types';

export interface EventCardProps {
  id?: string;
  title?: string;
  slug?: string;
  coverImage?: string;
  date?: string;
  startTime?: string;
  venue?: string;
  city?: string;
  isOnline?: boolean;
  startingPrice?: number;
  availableSeats?: number;
  category?: string;
  organizerName?: string;
  // Backward compatibility with direct event object
  event?: EventItem;
  className?: string;
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

  // Date and Time parsing
  let displayDate = props.date ?? '';
  let displayTime = props.startTime ?? '';

  if (eventObj?.startDate) {
    try {
      const parsed = new Date(eventObj.startDate);
      if (!isNaN(parsed.getTime())) {
        displayDate = parsed.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
        if (!displayTime) {
          displayTime = parsed.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          });
        }
      }
    } catch {
      // Keep fallbacks
    }
  }

  const isEnded = eventObj?.status === 'ended';
  const isFeatured = eventObj?.featured;
  const isFree = startingPrice === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={`group font-sans rounded-2xl border border-[#E7E5E4] bg-white shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden h-full ${
        props.className || ''
      }`}
    >
      <div>
        {/* Event Cover Image on Top */}
        <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
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

          {/* Top Right: Status / Seats Badge */}
          <div className="absolute top-3 right-3 z-10">
            <span
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow text-white ${
                isEnded
                  ? 'bg-slate-800'
                  : availableSeats <= 0
                  ? 'bg-rose-600'
                  : 'bg-emerald-600'
              }`}
            >
              {isEnded ? 'Ended' : availableSeats <= 0 ? 'Sold Out' : `${availableSeats} Seats`}
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 space-y-3">
          {/* Category Badge (optional/displayed nicely) */}
          {category && (
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#0F766E] bg-[#CCFBF1]/50 px-2.5 py-0.5 rounded-md border border-[#0F766E]/20">
                {category}
              </span>
              {availableSeats > 0 && !isEnded && (
                <span className="text-[11px] font-medium text-slate-500">
                  {availableSeats} seats available
                </span>
              )}
            </div>
          )}

          {/* Event Title (max 2 lines) */}
          <Link href={`/events/${slug}`} className="block">
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
            {displayDate && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span>{displayDate}</span>
              </div>
            )}
            {displayTime && (
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span>{displayTime}</span>
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
          href={`/events/${slug}`}
          className="flex-1 rounded-xl border border-[#0F766E] text-[#0F766E] bg-white hover:bg-[#0F766E]/5 py-2.5 px-3 text-xs font-bold text-center transition-colors flex items-center justify-center gap-1.5"
        >
          <Eye className="h-3.5 w-3.5" />
          <span>View Details</span>
        </Link>

        {isEnded ? (
          <Link
            href={`/events/${slug}`}
            className="flex-1 rounded-xl bg-slate-100 py-2.5 px-3 text-xs font-bold text-[#1C1917] hover:bg-slate-200 text-center transition-colors flex items-center justify-center gap-1.5"
          >
            <span>View Details</span>
          </Link>
        ) : (
          <Link
            href={`/events/${slug}`}
            className="flex-1 rounded-xl bg-[#F97316] hover:bg-[#ea580c] text-white py-2.5 px-3 text-xs font-bold text-center transition-colors flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Ticket className="h-3.5 w-3.5" />
            <span>Book Now</span>
          </Link>
        )}
      </div>
    </motion.div>
  );
}
export default EventCard;
