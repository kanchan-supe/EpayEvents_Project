'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, MapPin, ArrowRight, Eye, Ticket, Clock, User, Sparkles, Users } from 'lucide-react';
import { EventItem } from '@/lib/types';

export function EventCard({ event }: { event: EventItem }) {
  const isEnded = event.status === 'ended';
  const isFeatured = event.featured;
  const minPrice = Math.min(...event.ticketTypes.map(t => t.price));
  const isFree = minPrice === 0;

  // Calculate total available remaining seats across ticket tiers
  const totalAvailableSeats = event.ticketTypes.reduce(
    (acc, tier) => acc + (tier.remainingQuantity ?? tier.quantity),
    0
  );

  const [dateInfo, setDateInfo] = useState({ date: '', time: '' });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setDateInfo({
        date: new Date(event.startDate).toLocaleDateString('en-US', {
          month: 'short',
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={`group rounded-2xl border bg-white shadow-sm hover:shadow-lg transition-all flex flex-col justify-between overflow-hidden h-full ${
        isEnded ? 'border-[#E7E5E4]' : 'border-[#E7E5E4] hover:border-[#0F766E]/40'
      }`}
    >
      <div>
        {/* 1. Event Image + Badges Container */}
        <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={event.bannerUrl}
            alt={event.title}
            className={`h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 ${
              isEnded ? 'grayscale opacity-75' : ''
            }`}
          />

          {/* Top Left Badges: Featured & Online/Offline */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
            {isFeatured && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#F97316] text-white px-2.5 py-0.5 text-[10px] font-bold shadow">
                <Sparkles className="h-3 w-3" />
                Featured
              </span>
            )}
            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow text-white ${
              event.eventType === 'online' ? 'bg-purple-600' : 'bg-[#0F766E]'
            }`}>
              {event.eventType === 'online' ? 'Online' : event.eventType === 'hybrid' ? 'Hybrid' : 'Offline'}
            </span>
          </div>

          {/* Top Right Badge: Registration Status */}
          <div className="absolute top-3 right-3 z-10">
            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow text-white ${
              isEnded ? 'bg-slate-800' : totalAvailableSeats <= 0 ? 'bg-rose-600' : 'bg-emerald-600'
            }`}>
              {isEnded ? 'Ended' : totalAvailableSeats <= 0 ? 'Sold Out' : 'Open'}
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 space-y-3">
          {/* Category & Seats */}
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#0F766E] bg-[#CCFBF1]/40 px-2 py-0.5 rounded-md">
              {event.category.name}
            </span>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-[#78716C]">
              <Users className="h-3 w-3 text-slate-400" />
              <span>{totalAvailableSeats > 0 ? `${totalAvailableSeats} Seats Left` : 'No Seats Left'}</span>
            </div>
          </div>

          {/* Event Name / Title */}
          <Link href={`/events/${event.slug}`} className="block">
            <h3 className="font-bold text-[#1C1917] text-base group-hover:text-[#0F766E] transition-colors line-clamp-1">
              {event.title}
            </h3>
          </Link>

          {/* Organizer */}
          <div className="flex items-center gap-1.5 text-xs text-[#78716C]">
            <User className="h-3.5 w-3.5 text-[#0F766E] shrink-0" />
            <span className="line-clamp-1 font-medium text-slate-700">By {event.organization.name}</span>
          </div>

          {/* Date & Time */}
          <div className="flex items-center gap-3 text-xs text-[#78716C]">
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span>{dateInfo.date || 'Loading...'}</span>
            </div>
            {dateInfo.time && (
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span>{dateInfo.time}</span>
              </div>
            )}
          </div>

          {/* Location */}
          <div className="flex items-center gap-1.5 text-xs text-[#78716C]">
            <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="line-clamp-1">{event.venue.name}, {event.venue.city}</span>
          </div>

          {/* Starting Ticket Price */}
          <div className="text-xs pt-1 border-t border-[#E7E5E4]/60 flex items-center justify-between">
            <span className="text-[#78716C] font-medium">Starting Price</span>
            <span className="font-extrabold text-[#1C1917] text-sm">
              {isFree ? 'FREE' : `₹${minPrice.toLocaleString()}`}
            </span>
          </div>
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="p-5 pt-0 flex items-center justify-between gap-3 mt-2">
        <Link
          href={`/events/${event.slug}`}
          className="flex-1 rounded-xl border border-[#E7E5E4] py-2 px-3 text-xs font-bold text-[#1C1917] hover:bg-[#FAFAF9] hover:border-[#0F766E] text-center transition flex items-center justify-center gap-1.5"
        >
          <Eye className="h-3.5 w-3.5 text-[#0F766E]" />
          <span>View Details</span>
        </Link>

        {isEnded ? (
          <Link
            href={`/events/${event.slug}`}
            className="flex-1 rounded-xl bg-slate-100 py-2 px-3 text-xs font-bold text-[#1C1917] hover:bg-slate-200 text-center transition flex items-center justify-center gap-1.5"
          >
            <span>View Recap</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        ) : (
          <Link
            href={`/checkout/${event.slug}`}
            className="flex-1 rounded-xl bg-[#F97316] py-2 px-3 text-xs font-bold text-white hover:bg-[#ea580c] text-center transition flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Ticket className="h-3.5 w-3.5" />
            <span>Book Now</span>
          </Link>
        )}
      </div>
    </motion.div>
  );
}
