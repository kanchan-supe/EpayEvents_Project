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

export default async function EventsPage({ searchParams }: SearchParamsProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const query = resolvedParams.query || '';
  const category = resolvedParams.category || 'all';
  const location = resolvedParams.location || 'all';
  const eventType = resolvedParams.eventType || 'all';
  const price = resolvedParams.price || 'all';

  const events = await getEvents({ query, category, location, eventType, price });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <div className="bg-slate-900 text-white py-12 border-b border-slate-800">
        <div className="container mx-auto px-4 md:px-8">
          <h1 className="text-3xl font-extrabold">Discover Events</h1>
          <p className="text-slate-400 text-sm mt-2">Explore workshops, tech summits, and live concerts</p>
        </div>
      </div>

      <main className="container mx-auto px-4 md:px-8 py-10 flex-1">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="w-full lg:w-64 space-y-6 bg-white p-6 rounded-xl border border-slate-200 h-fit">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Filter className="h-4 w-4 text-blue-600" />
                <span>Filters</span>
              </div>
              <Link href="/events" className="text-xs text-blue-600 hover:underline">Reset</Link>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Category</label>
              <div className="space-y-2">
                <Link
                  href={`/events?category=all&query=${query}&price=${price}`}
                  className={`block text-sm px-3 py-1.5 rounded-lg font-medium transition ${category === 'all' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  All Categories
                </Link>
                {mockCategories.map(cat => (
                  <Link
                    key={cat.id}
                    href={`/events?category=${cat.slug}&query=${query}&price=${price}`}
                    className={`block text-sm px-3 py-1.5 rounded-lg font-medium transition ${category === cat.slug ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Event Type Filter */}
            <div className="border-t border-slate-100 pt-5">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Format</label>
              <div className="space-y-2">
                {['all', 'physical', 'online', 'hybrid'].map(type => (
                  <Link
                    key={type}
                    href={`/events?eventType=${type}&category=${category}&query=${query}`}
                    className={`block text-sm px-3 py-1.5 rounded-lg font-medium capitalize transition ${eventType === type ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    {type === 'all' ? 'All Formats' : type}
                  </Link>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="border-t border-slate-100 pt-5">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Price</label>
              <div className="space-y-2">
                {[
                  { label: 'All Prices', val: 'all' },
                  { label: 'Free Only', val: 'free' },
                  { label: 'Paid Only', val: 'paid' },
                ].map(p => (
                  <Link
                    key={p.val}
                    href={`/events?price=${p.val}&category=${category}&query=${query}`}
                    className={`block text-sm px-3 py-1.5 rounded-lg font-medium transition ${price === p.val ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    {p.label}
                  </Link>
                ))}
              </div>
            </div>
          </aside>

          {/* Listing Grid */}
          <div className="flex-1 space-y-6">
            <form action="/events" method="GET" className="bg-white p-3 rounded-xl border border-slate-200 flex gap-3 shadow-sm">
              <div className="flex-1 flex items-center gap-2 px-3">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  name="query"
                  defaultValue={query}
                  placeholder="Filter by keywords, name, city..."
                  className="w-full text-sm bg-transparent focus:outline-none"
                />
              </div>
              <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                Search
              </button>
            </form>

            <div className="flex items-center justify-between text-sm text-slate-500">
              <span>Showing <strong className="text-slate-900">{events.length}</strong> events</span>
            </div>

            {events.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
                <p className="text-slate-500">No events matched your search criteria.</p>
                <Link href="/events" className="mt-4 inline-block text-sm font-semibold text-blue-600 hover:underline">
                  Clear search filters
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {events.map(evt => (
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

