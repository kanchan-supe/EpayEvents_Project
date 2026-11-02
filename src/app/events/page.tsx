import React from 'react';
import Link from 'next/link';
import { Search, Filter, MapPin, LayoutGrid, Compass, Sparkles, X, Tag } from 'lucide-react';
import { Navbar, Footer } from '@/components/NavbarFooter';
import { EventCard } from '@/components/EventCard';
import { EventLocationMap } from '@/components/EventLocationMap';
import { getPublishedEvents, getEventStatus } from '@/lib/repositories/eventRepository';
import { mockCategories } from '@/lib/data';

interface SearchParamsProps {
  searchParams?: Promise<{
    query?: string;
    category?: string;
    location?: string;
    eventType?: string;
    price?: string;
    view?: string;
    tab?: 'all' | 'live' | 'upcoming' | 'past';
  }>;
}

export const metadata = {
  title: 'Event Discovery & Listings | ePayEvents',
  description: 'Search and filter tech conferences, hackathons, workshops, and concerts.',
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function EventsPage({ searchParams }: SearchParamsProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const query = resolvedParams.query || '';
  const category = resolvedParams.category || 'all';
  const location = resolvedParams.location || 'all';
  const eventType = resolvedParams.eventType || 'all';
  const price = resolvedParams.price || 'all';
  const view = resolvedParams.view || 'grid';
  const tab = resolvedParams.tab; // undefined | 'all' | 'live' | 'upcoming' | 'past'

  const allEvents = await getPublishedEvents();
  // Ensure only events with status = 'published' are displayed
  let publishedEvents = allEvents.filter(e => e.status === 'published');

  // Compute status for all events
  const eventsWithComputedStatus = publishedEvents.map(e => ({
    ...e,
    computedStatus: getEventStatus(e.date || e.startDate),
  }));

  // Tab Filtering:
  // - Default (no tab chosen or tab === 'all'): Live + Upcoming
  // - 'live': Live only
  // - 'upcoming': Upcoming only
  // - 'past': Past only
  // Note: If user selects 'all', we show all (or Live + Upcoming by default)
  let filteredByTab = eventsWithComputedStatus.filter(e => {
    if (!tab) {
      // Default view: Live + Upcoming
      return e.computedStatus === 'live' || e.computedStatus === 'upcoming';
    }
    if (tab === 'all') {
      return true;
    }
    return e.computedStatus === tab;
  });

  publishedEvents = filteredByTab;

  if (query) {
    const q = query.toLowerCase();
    publishedEvents = publishedEvents.filter(e => 
      e.title.toLowerCase().includes(q) || 
      (e.shortDescription && e.shortDescription.toLowerCase().includes(q)) || 
      (e.venue?.city && e.venue.city.toLowerCase().includes(q))
    );
  }

  if (category && category !== 'all') {
    publishedEvents = publishedEvents.filter(e => e.category?.slug === category);
  }

  if (location && location !== 'all') {
    const loc = location.toLowerCase();
    publishedEvents = publishedEvents.filter(e => e.venue?.city?.toLowerCase() === loc);
  }

  if (eventType && eventType !== 'all') {
    publishedEvents = publishedEvents.filter(e => e.eventType === eventType);
  }

  if (price && price !== 'all') {
    if (price === 'free') {
      publishedEvents = publishedEvents.filter(e => e.ticketTypes?.some(t => t.price === 0));
    } else if (price === 'paid') {
      publishedEvents = publishedEvents.filter(e => e.ticketTypes?.some(t => t.price > 0));
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF9]">
      <Navbar />

      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 text-white py-12 border-b border-slate-800 relative overflow-hidden">
        {/* Ambient subtle glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="container mx-auto px-4 md:px-8 relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-300 text-xs font-bold uppercase tracking-wider mb-2">
              <span className="h-2 w-2 rounded-full bg-teal-400 animate-pulse"></span>
              LIVE EVENT CATALOG
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Discover <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-300 to-[#F97316]">Upcoming Events</span>
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-xl">
              Search and explore tech summits, developer conferences, masterclasses, and music festivals across India.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="bg-white/5 border border-white/10 px-4 py-2.5 rounded-2xl backdrop-blur-md">
              <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Active Conclaves</span>
              <span className="text-lg font-black text-white">{publishedEvents.length} Events</span>
            </div>
            <div className="bg-white/5 border border-white/10 px-4 py-2.5 rounded-2xl backdrop-blur-md">
              <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Tech Hubs</span>
              <span className="text-lg font-black text-teal-300">6 Metro Cities</span>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 md:px-8 py-10 flex-1">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="w-full lg:w-64 space-y-6 bg-white p-6 rounded-xl border border-[#E7E5E4] h-fit shadow-sm">
            <div className="flex items-center justify-between border-b border-[#E7E5E4] pb-4">
              <div className="flex items-center gap-2 font-bold text-[#1C1917]">
                <Filter className="h-4 w-4 text-[#0F766E]" />
                <span>Filters</span>
              </div>
              <Link href="/events" className="text-xs text-[#0F766E] hover:underline font-semibold">Reset</Link>
            </div>

            {/* Category Filter - Compact with Quick Search & Scroll Box */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <label className="text-xs font-bold text-[#1C1917] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-[#F97316]" />
                  <span>Category</span>
                </label>
                <span className="text-[11px] font-bold text-[#0F766E] bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                  {mockCategories.length} Categories
                </span>
              </div>

              {/* All Categories Option */}
              <Link
                href={`/events?category=all&query=${query}&price=${price}&location=${location}&eventType=${eventType}&view=${view}${tab ? `&tab=${tab}` : ''}`}
                className={`flex items-center justify-between text-xs px-3 py-2 rounded-xl font-bold transition mb-2 ${
                  category === 'all'
                    ? 'bg-gradient-to-r from-[#0F766E] to-teal-700 text-white shadow-sm'
                    : 'bg-[#FAFAF9] text-[#78716C] hover:bg-slate-100 hover:text-[#1C1917] border border-[#E7E5E4]'
                }`}
              >
                <span>🌟 All Categories</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${category === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-600'}`}>
                  {allEvents.filter(e => e.status === 'published').length}
                </span>
              </Link>

              {/* Scrollable Compact Category List with Custom Scrollbar */}
              <div className="max-h-[220px] overflow-y-auto pr-1.5 space-y-1 rounded-xl border border-slate-200/70 p-1.5 bg-[#FAFAF9]/60 scrollbar-thin scrollbar-thumb-slate-300">
                {mockCategories.map(cat => {
                  const isSelected = category === cat.slug;
                  return (
                    <Link
                      key={cat.id}
                      href={`/events?category=${cat.slug}&query=${query}&price=${price}&location=${location}&eventType=${eventType}&view=${view}${tab ? `&tab=${tab}` : ''}`}
                      className={`flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg transition-all ${
                        isSelected
                          ? 'bg-[#FFEDD5] text-[#F97316] font-bold shadow-xs'
                          : 'text-[#57534E] hover:bg-white hover:text-[#1C1917]'
                      }`}
                    >
                      <span className="truncate pr-1">{cat.name}</span>
                      <span className={`text-[10px] shrink-0 font-medium ${isSelected ? 'text-[#F97316]' : 'text-slate-400'}`}>
                        {cat.count || 0}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* City / Location Filter */}
            <div className="border-t border-[#E7E5E4] pt-5">
              <label className="block text-xs font-semibold text-[#78716C] uppercase tracking-wider mb-3">City / Hub</label>
              <div className="space-y-1.5">
                {[
                  { name: 'All Cities', val: 'all' },
                  { name: 'Mumbai', val: 'mumbai' },
                  { name: 'Bengaluru', val: 'bengaluru' },
                  { name: 'New Delhi', val: 'new delhi' },
                  { name: 'Hyderabad', val: 'hyderabad' },
                  { name: 'Pune', val: 'pune' },
                ].map(c => (
                  <Link
                    key={c.val}
                    href={`/events?location=${c.val}&category=${category}&query=${query}&price=${price}&view=${view}${tab ? `&tab=${tab}` : ''}`}
                    className={`block text-sm px-3 py-1.5 rounded-lg font-medium transition ${
                      (location === c.val || (c.val === 'all' && (!location || location === 'all')))
                        ? 'bg-[#FFEDD5] text-[#F97316] font-semibold'
                        : 'text-[#78716C] hover:bg-[#FAFAF9] hover:text-[#1C1917]'
                    }`}
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Event Type Filter */}
            <div className="border-t border-[#E7E5E4] pt-5">
              <label className="block text-xs font-semibold text-[#78716C] uppercase tracking-wider mb-3">Format</label>
              <div className="space-y-2">
                {['all', 'physical', 'online', 'hybrid'].map(type => (
                  <Link
                    key={type}
                    href={`/events?eventType=${type}&category=${category}&location=${location}&query=${query}&view=${view}${tab ? `&tab=${tab}` : ''}`}
                    className={`block text-sm px-3 py-1.5 rounded-lg font-medium capitalize transition ${eventType === type ? 'bg-[#FFEDD5] text-[#F97316] font-semibold' : 'text-[#78716C] hover:bg-[#FAFAF9] hover:text-[#1C1917]'}`}
                  >
                    {type === 'all' ? 'All Formats' : type}
                  </Link>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="border-t border-[#E7E5E4] pt-5">
              <label className="block text-xs font-semibold text-[#78716C] uppercase tracking-wider mb-3">Price</label>
              <div className="space-y-2">
                {[
                  { label: 'All Prices', val: 'all' },
                  { label: 'Free Only', val: 'free' },
                  { label: 'Paid Only', val: 'paid' },
                ].map(p => (
                  <Link
                    key={p.val}
                    href={`/events?price=${p.val}&category=${category}&location=${location}&query=${query}&view=${view}${tab ? `&tab=${tab}` : ''}`}
                    className={`block text-sm px-3 py-1.5 rounded-lg font-medium transition ${price === p.val ? 'bg-[#FFEDD5] text-[#F97316] font-semibold' : 'text-[#78716C] hover:bg-[#FAFAF9] hover:text-[#1C1917]'}`}
                  >
                    {p.label}
                  </Link>
                ))}
              </div>
            </div>
          </aside>

          {/* Listing Section */}
          <div className="flex-1 space-y-6">
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              <form action="/events" method="GET" className="flex-1 bg-white p-2.5 rounded-xl border border-[#E7E5E4] flex gap-3 shadow-sm">
                <div className="flex-1 flex items-center gap-2 px-3">
                  <Search className="h-4 w-4 text-[#78716C]" />
                  <input
                    type="text"
                    name="query"
                    defaultValue={query}
                    placeholder="Filter by keywords, name, venue, city..."
                    className="w-full text-sm bg-transparent focus:outline-none text-[#1C1917]"
                  />
                  {location !== 'all' && <input type="hidden" name="location" value={location} />}
                  {category !== 'all' && <input type="hidden" name="category" value={category} />}
                  {tab && <input type="hidden" name="tab" value={tab} />}
                </div>
                <button type="submit" className="rounded-lg bg-[#0F766E] px-4 py-2 text-sm font-semibold text-white hover:bg-[#115E59] transition">
                  Search
                </button>
              </form>

              {/* View Toggle */}
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#E7E5E4] shadow-sm shrink-0">
                <Link
                  href={`/events?view=grid&location=${location}&category=${category}&query=${query}&price=${price}${tab ? `&tab=${tab}` : ''}`}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    view === 'grid' ? 'bg-[#0F766E] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                  <span>Grid Only</span>
                </Link>
                <Link
                  href={`/events?view=both&location=${location}&category=${category}&query=${query}&price=${price}${tab ? `&tab=${tab}` : ''}`}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    view === 'both' ? 'bg-[#0F766E] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <MapPin className="h-3.5 w-3.5" />
                  <span>Map + Grid</span>
                </Link>
                <Link
                  href={`/events?view=map&location=${location}&category=${category}&query=${query}&price=${price}${tab ? `&tab=${tab}` : ''}`}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    view === 'map' ? 'bg-[#0F766E] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Compass className="h-3.5 w-3.5" />
                  <span>Map Radar</span>
                </Link>
              </div>
            </div>

            {/* Event Status Tabs: All | Live | Upcoming | Past */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2.5 rounded-2xl border border-[#E7E5E4] shadow-sm">
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: 'all', label: 'All Active (Live + Upcoming)', queryVal: undefined, count: eventsWithComputedStatus.filter(e => e.computedStatus === 'live' || e.computedStatus === 'upcoming').length },
                  { id: 'live', label: 'Live Now', queryVal: 'live', count: eventsWithComputedStatus.filter(e => e.computedStatus === 'live').length, badgeColor: 'bg-emerald-500' },
                  { id: 'upcoming', label: 'Upcoming', queryVal: 'upcoming', count: eventsWithComputedStatus.filter(e => e.computedStatus === 'upcoming').length, badgeColor: 'bg-[#0F766E]' },
                  { id: 'past', label: 'Past Conclaves', queryVal: 'past', count: eventsWithComputedStatus.filter(e => e.computedStatus === 'past').length, badgeColor: 'bg-slate-500' },
                ].map(item => {
                  const isActive = (!tab && item.id === 'all') || (tab === item.id);
                  const targetHref = item.queryVal 
                    ? `/events?tab=${item.queryVal}&category=${category}&location=${location}&query=${query}&price=${price}&view=${view}&eventType=${eventType}`
                    : `/events?category=${category}&location=${location}&query=${query}&price=${price}&view=${view}&eventType=${eventType}`;

                  return (
                    <Link
                      key={item.id}
                      href={targetHref}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                        isActive
                          ? item.id === 'past'
                            ? 'bg-slate-800 text-white shadow-sm'
                            : item.id === 'live'
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-[#0F766E] text-white shadow-sm'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80'
                      }`}
                    >
                      {item.id === 'live' && (
                        <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                      )}
                      <span>{item.label}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {item.count}
                      </span>
                    </Link>
                  );
                })}
              </div>

              <div className="text-xs text-[#78716C] font-medium pr-2">
                <span>Sorted by nearest date</span>
              </div>
            </div>

            {/* Interactive Location-wise Map View */}
            {(view === 'both' || view === 'map') && (
              <EventLocationMap events={allEvents.filter(e => e.status === 'published')} currentCity={location} />
            )}

            {/* Results count */}
            {view !== 'map' && (
              <>
                <div className="flex items-center justify-between text-sm text-[#78716C]">
                  <span>Showing <strong className="text-[#1C1917]">{publishedEvents.length}</strong> published events</span>
                  {location !== 'all' && (
                    <span className="text-xs bg-teal-50 text-teal-700 font-semibold px-2.5 py-1 rounded-full border border-teal-200">
                      Filtered by city: {location}
                    </span>
                  )}
                </div>

                {publishedEvents.length === 0 ? (
                  <div className="bg-white border border-[#E7E5E4] rounded-xl p-12 text-center">
                    <p className="text-[#78716C]">No events matched your search criteria.</p>
                    <Link href="/events" className="mt-4 inline-block text-sm font-semibold text-[#0F766E] hover:underline">
                      Clear search filters
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {publishedEvents.map(evt => (
                      <EventCard key={evt.id} event={evt} />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
