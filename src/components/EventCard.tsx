import React from 'react';
import Link from 'next/link';
import { Calendar, MapPin, Tag, ArrowRight } from 'lucide-react';
import { EventItem } from '@/lib/types';

export function EventCard({ event }: { event: EventItem }) {
  const minPrice = Math.min(...event.ticketTypes.map(t => t.price));
  const isFree = minPrice === 0;

  const formattedDate = new Date(event.startDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="group rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden">
      <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={event.bannerUrl}
          alt={event.title}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="rounded-full bg-white/90 backdrop-blur-sm px-2.5 py-1 text-xs font-semibold text-slate-800 shadow">
            {event.category.name}
          </span>
          <span className="rounded-full bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white uppercase tracking-wider shadow">
            {event.eventType}
          </span>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-blue-600 mb-2">
            <Calendar className="h-3.5 w-3.5" />
            <span>{formattedDate}</span>
          </div>

          <Link href={`/events/${event.slug}`} className="block">
            <h3 className="font-bold text-slate-900 text-lg group-hover:text-blue-600 transition-colors line-clamp-2">
              {event.title}
            </h3>
          </Link>

          <p className="mt-2 text-sm text-slate-600 line-clamp-2 leading-relaxed">
            {event.shortDescription}
          </p>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <MapPin className="h-3.5 w-3.5 text-slate-400" />
            <span>{event.venue.city}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Starting from</span>
              <span className="font-bold text-slate-900 text-base">
                {isFree ? 'FREE' : `₹${minPrice.toLocaleString()}`}
              </span>
            </div>

            <Link
              href={`/events/${event.slug}`}
              className="rounded-lg bg-blue-50 p-2 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors"
            >
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

