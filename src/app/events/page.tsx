import React from 'react';
import Link from 'next/link';
import { Search, Filter, X } from 'lucide-react';
import { Navbar, Footer } from '@/components/NavbarFooter';
import { EventCard } from '@/components/EventCard';
import { getEvents, mockCategories } from '@/lib/data';

interface SearchParamsProps {
  searchParams?: Promise<{
    query?: string;
    category?: string;
    location?: string;
    eventType?: string;
    price?: string;
  }>;
}

export const metadata = {
  title: 'Event Discovery & Listings | ePayEvents',
  description: 'Search and filter tech conferences, hackathons, workshops, and concerts.',
};

export const dynamic = 'force-dynamic';

export default async function EventsPage({ searchParams }: SearchParamsProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const query = resolvedParams.query || '';
  const category = resolvedParams.category || 'all';
  const location = resolvedParams.location || 'all';
  const eventType = resolvedParams.eventType || 'all';
  const price = resolvedParams.price || 'all';

  const events = await getEvents({ query, category, location, eventType, price });
  // Ensure only events with status = 'published' are displayed
  const publishedEvents = events.filter(e => e.status === 'published');

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF9]">
      <Navbar />

      <div className="bg-[#1E293B] text-white py-12">
        <div className="container mx-auto px-4 md:px-8">
          <h1 className="text-3xl font-extrabold text-white">Discover Events</h1>
          <p className="text-slate-400 text-sm mt-2">Explore workshops, tech summits, and live concerts</p>
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

            {/* Category Filter */}
            <div>
              <label className="block text-xs font-semibold text-[#78716C] uppercase tracking-wider mb-3">Category</label>
              <div className="space-y-2">
                <Link
                  href={`/events?category=all&query=${query}&price=${price}`}
                  className={`block text-sm px-3 py-1.5 rounded-lg font-medium transition ${category === 'all' ? 'bg-[#FFEDD5] text-[#F97316] font-semibold' : 'text-[#78716C] hover:bg-[#FAFAF9] hover:text-[#1C1917]'}`}
                >
                  All Categories
                </Link>
                {mockCategories.map(cat => (
                  <Link
                    key={cat.id}
                    href={`/events?category=${cat.slug}&query=${query}&price=${price}`}
                    className={`block text-sm px-3 py-1.5 rounded-lg font-medium transition ${category === cat.slug ? 'bg-[#FFEDD5] text-[#F97316] font-semibold' : 'text-[#78716C] hover:bg-[#FAFAF9] hover:text-[#1C1917]'}`}
                  >
                    {cat.name}
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
                    href={`/events?eventType=${type}&category=${category}&query=${query}`}
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
                    href={`/events?price=${p.val}&category=${category}&query=${query}`}
                    className={`block text-sm px-3 py-1.5 rounded-lg font-medium transition ${price === p.val ? 'bg-[#FFEDD5] text-[#F97316] font-semibold' : 'text-[#78716C] hover:bg-[#FAFAF9] hover:text-[#1C1917]'}`}
                  >
                    {p.label}
                  </Link>
                ))}
              </div>
            </div>
          </aside>

          {/* Listing Grid */}
          <div className="flex-1 space-y-6">
            <form action="/events" method="GET" className="bg-white p-3 rounded-xl border border-[#E7E5E4] flex gap-3 shadow-sm">
              <div className="flex-1 flex items-center gap-2 px-3">
                <Search className="h-4 w-4 text-[#78716C]" />
                <input
                  type="text"
                  name="query"
                  defaultValue={query}
                  placeholder="Filter by keywords, name, city..."
                  className="w-full text-sm bg-transparent focus:outline-none text-[#1C1917]"
                />
              </div>
              <button type="submit" className="rounded-lg bg-[#0F766E] px-4 py-2 text-sm font-semibold text-white hover:bg-[#115E59] transition">
                Search
              </button>
            </form>

            <div className="flex items-center justify-between text-sm text-[#78716C]">
              <span>Showing <strong className="text-[#1C1917]">{publishedEvents.length}</strong> published events</span>
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
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
