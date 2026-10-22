'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, Sparkles, Building2, Calendar, Ticket, ExternalLink, Compass } from 'lucide-react';
import { EventItem } from '@/lib/types';

interface EventLocationMapProps {
  events: EventItem[];
  currentCity?: string;
}

// Preset center coordinates and info for major Indian tech hubs
const CITY_COORDINATES: Record<string, { lat: number; lng: number; label: string; state: string; zoom: number }> = {
  all: { lat: 20.5937, lng: 78.9629, label: 'All India', state: 'India', zoom: 5 },
  mumbai: { lat: 19.0760, lng: 72.8777, label: 'Mumbai', state: 'Maharashtra', zoom: 12 },
  bengaluru: { lat: 12.9716, lng: 77.5946, label: 'Bengaluru', state: 'Karnataka', zoom: 12 },
  delhi: { lat: 28.6139, lng: 77.2090, label: 'New Delhi', state: 'Delhi NCR', zoom: 12 },
  hyderabad: { lat: 17.3850, lng: 78.4867, label: 'Hyderabad', state: 'Telangana', zoom: 12 },
  pune: { lat: 18.5204, lng: 73.8567, label: 'Pune', state: 'Maharashtra', zoom: 12 },
  chennai: { lat: 13.0827, lng: 80.2707, label: 'Chennai', state: 'Tamil Nadu', zoom: 12 },
};

function normalizeCityKey(city?: string): { key: string; displayName: string } {
  if (!city) return { key: 'other', displayName: 'Other' };
  const lower = city.toLowerCase().trim();
  if (lower.includes('bengaluru') || lower.includes('bangalore')) {
    return { key: 'bengaluru', displayName: 'Bengaluru' };
  }
  if (lower.includes('mumbai') || lower.includes('bombay')) {
    return { key: 'mumbai', displayName: 'Mumbai' };
  }
  if (lower.includes('delhi')) {
    return { key: 'delhi', displayName: 'New Delhi' };
  }
  if (lower.includes('hyderabad')) {
    return { key: 'hyderabad', displayName: 'Hyderabad' };
  }
  if (lower.includes('pune')) {
    return { key: 'pune', displayName: 'Pune' };
  }
  if (lower.includes('chennai')) {
    return { key: 'chennai', displayName: 'Chennai' };
  }
  return { key: lower, displayName: city };
}

export function EventLocationMap({ events, currentCity = 'all' }: EventLocationMapProps) {
  // Aggregate events per normalized city
  const cityCounts: Record<string, { count: number; name: string; sampleEvents: EventItem[] }> = {};

  events.forEach((evt) => {
    const { key, displayName } = normalizeCityKey(evt.venue?.city);
    if (!cityCounts[key]) {
      cityCounts[key] = { count: 0, name: displayName, sampleEvents: [] };
    }
    cityCounts[key].count += 1;
    cityCounts[key].sampleEvents.push(evt);
  });

  const cityList = Object.entries(cityCounts).sort((a, b) => b[1].count - a[1].count);

  const initialCityKey = currentCity && currentCity !== 'all' ? normalizeCityKey(currentCity).key : 'all';
  const [selectedCity, setSelectedCity] = useState<string>(initialCityKey);
  const [activePinEvent, setActivePinEvent] = useState<EventItem | null>(null);

  const activeCoord = CITY_COORDINATES[selectedCity] || (
    cityCounts[selectedCity]?.sampleEvents[0]?.venue?.latitude
      ? {
          lat: cityCounts[selectedCity].sampleEvents[0].venue.latitude!,
          lng: cityCounts[selectedCity].sampleEvents[0].venue.longitude!,
          label: cityCounts[selectedCity].name,
          state: 'India',
          zoom: 12,
        }
      : CITY_COORDINATES['all']
  );

  // Filter events displayed on current city selection
  const visibleEvents = selectedCity === 'all'
    ? events
    : events.filter(e => e.venue?.city?.toLowerCase() === selectedCity);

  // Generate google maps embed query URL
  const mapEmbedUrl = selectedCity === 'all'
    ? `https://maps.google.com/maps?q=India&t=&z=5&ie=UTF8&iwloc=&output=embed`
    : `https://maps.google.com/maps?q=${encodeURIComponent(
        activeCoord.label + ', India'
      )}&t=&z=${activeCoord.zoom}&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-8">
      {/* Header Bar */}
      <div className="p-6 sm:p-7 border-b border-slate-100 bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 text-white space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black tracking-widest uppercase bg-teal-500/20 text-teal-300 border border-teal-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Compass className="h-3 w-3 animate-spin text-teal-400" style={{ animationDuration: '6s' }} />
                GEOLOCATION RADAR
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {events.length} active conclaves & summits mapped
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1.5 tracking-tight">
              Explore Events by <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-emerald-300 to-[#F97316]">City & Venue</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Select your metro hub below to view venue clusters, check starting pass pricing, and launch turn-by-turn navigation.
            </p>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-xs bg-white/5 border border-white/10 px-3.5 py-2 rounded-2xl shrink-0 self-start">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-300 font-medium">Current View: <strong className="text-white">{activeCoord.label}</strong></span>
          </div>
        </div>

        {/* City Filter Pills */}
        <div className="pt-2 border-t border-white/10 flex items-center gap-2 flex-wrap">
          <button
            onClick={() => { setSelectedCity('all'); setActivePinEvent(null); }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              selectedCity === 'all'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20 ring-2 ring-amber-300'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <span>All Hubs</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/20 font-black">{events.length}</span>
          </button>

          {cityList.map(([key, data]) => {
            const isSelected = selectedCity === key;
            return (
              <button
                key={key}
                onClick={() => { setSelectedCity(key); setActivePinEvent(null); }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-teal-400 text-slate-950 shadow-md shadow-teal-400/30 ring-2 ring-teal-200'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span>{data.name}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${isSelected ? 'bg-black/20' : 'bg-black/20 text-slate-300'}`}>
                  {data.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Map + Venue Carousel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[460px]">
        {/* Left Interactive Google Map (8 cols) */}
        <div className="lg:col-span-7 xl:col-span-8 relative bg-slate-100 min-h-[360px] lg:min-h-full">
          <iframe
            key={selectedCity}
            title={`Interactive Event Map for ${activeCoord.label}`}
            width="100%"
            height="100%"
            className="w-full h-full min-h-[380px] border-0"
            style={{ filter: 'contrast(1.03) saturate(1.05)' }}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            src={mapEmbedUrl}
          ></iframe>

          {/* Map Overlay Badge */}
          <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-lg border border-slate-200 flex items-center gap-2 pointer-events-none">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            <div>
              <div className="text-[11px] font-black text-slate-900 leading-tight">
                {activeCoord.label} Metro Zone
              </div>
              <div className="text-[10px] text-slate-500">
                {visibleEvents.length} active conferences & gatherings
              </div>
            </div>
          </div>

          {/* Quick Direction action */}
          <div className="absolute bottom-4 right-4">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activeCoord.label + ' venues')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-slate-900/90 hover:bg-slate-900 backdrop-blur-md text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-lg border border-white/20 flex items-center gap-1.5 transition"
            >
              <Navigation className="h-3.5 w-3.5 text-teal-400" />
              <span>Full Google Maps</span>
              <ExternalLink className="h-3 w-3 text-slate-400" />
            </a>
          </div>
        </div>

        {/* Right Venue List & Event Cards (4 cols) */}
        <div className="lg:col-span-5 xl:col-span-4 bg-slate-50 border-t lg:border-t-0 lg:border-l border-slate-200 p-4 sm:p-5 flex flex-col justify-between max-h-[520px] overflow-y-auto">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-teal-600" />
                <span>Venues in {activeCoord.label}</span>
              </span>
              <span className="text-[11px] font-bold text-slate-500">
                {visibleEvents.length} {visibleEvents.length === 1 ? 'Event' : 'Events'}
              </span>
            </div>

            <div className="space-y-3">
              {visibleEvents.slice(0, 4).map((evt) => {
                const isSelected = activePinEvent?.id === evt.id;
                const startingPrice = evt.ticketTypes && evt.ticketTypes.length > 0 
                  ? Math.min(...evt.ticketTypes.map(t => t.price)) 
                  : 0;

                return (
                  <motion.div
                    key={evt.id}
                    whileHover={{ y: -2 }}
                    onClick={() => setActivePinEvent(evt)}
                    className={`p-3.5 rounded-2xl border transition cursor-pointer ${
                      isSelected
                        ? 'bg-teal-50 border-teal-500 shadow-md ring-2 ring-teal-200'
                        : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className="inline-block text-[10px] font-bold text-teal-700 bg-teal-100/70 px-2 py-0.5 rounded-md mb-1 uppercase tracking-wider">
                          {evt.venue.city || 'Online'}
                        </span>
                        <h4 className="text-xs font-extrabold text-slate-900 truncate leading-snug hover:text-teal-700 transition">
                          {evt.title}
                        </h4>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-1 truncate">
                          <MapPin className="h-3 w-3 text-amber-500 shrink-0" />
                          <span className="truncate">{evt.venue.name}</span>
                        </div>
                      </div>
                      
                      <div className="text-right shrink-0">
                        <div className="text-xs font-black text-slate-900">
                          {startingPrice === 0 ? 'FREE' : `₹${startingPrice.toLocaleString('en-IN')}`}
                        </div>
                        <span className="text-[9px] text-slate-400 block font-medium">starting</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 mt-2.5 text-[11px]">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        <span>{evt.date || 'Upcoming'}</span>
                      </span>

                      <Link
                        href={`/events/${evt.slug || evt.id}`}
                        className="font-bold text-teal-700 hover:text-teal-900 flex items-center gap-0.5 group"
                      >
                        <span>Details</span>
                        <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Quick city jump footer */}
          <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-500 text-[11px]">Looking for another hub?</span>
            <Link
              href={`/events?location=${selectedCity !== 'all' ? selectedCity : ''}`}
              className="font-bold text-teal-700 hover:underline flex items-center gap-1 text-[11px]"
            >
              <span>Apply &quot;{activeCoord.label}&quot; filter</span>
              <Ticket className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

