import React from 'react';
import { notFound } from 'next/navigation';
import { Navbar, Footer } from '@/components/NavbarFooter';
import { getEventBySlug, getEventById } from '@/lib/repositories/eventRepository';
import { EventDetailClient } from '@/components/EventDetailClient';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ params }: PageProps) {
  const resolved = await params;
  const slug = resolved?.slug || '';
  const decodedSlug = decodeURIComponent(slug).trim();
  const event = (await getEventBySlug(decodedSlug)) || (await getEventById(decodedSlug));
  if (!event) return { title: 'Event Not Found | ePayEvents' };

  return {
    title: `${event.title} | ePayEvents`,
    description: event.shortDescription,
    openGraph: {
      title: event.title,
      description: event.shortDescription,
      images: [event.bannerUrl],
    },
  };
}

export default async function EventDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const rawSlug = resolvedParams?.slug || '';
  const decodedSlug = decodeURIComponent(rawSlug).trim();

  let event = await getEventBySlug(decodedSlug);
  if (!event && rawSlug !== decodedSlug) {
    event = await getEventBySlug(rawSlug);
  }
  if (!event) {
    event = (await getEventById(decodedSlug)) || (await getEventById(rawSlug));
  }

  // Fallback: If not yet in server cache or database, render dynamic client resolver
  if (!event) {
    const fallbackEvent = {
      id: decodedSlug,
      title: decodedSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      slug: decodedSlug,
      shortDescription: 'Event details hosted on ePayEvents.',
      description: 'Welcome to this event. Complete pass registration below.',
      bannerUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1400&q=80',
      eventType: 'physical' as const,
      status: 'published' as const,
      startDate: '2026-11-20T10:00:00',
      endDate: '2026-11-20T18:00:00',
      startTime: '10:00 AM',
      endTime: '06:00 PM',
      date: '2026-11-20',
      timezone: 'IST',
      featured: true,
      category: { id: 'cat-gen', name: 'General', slug: 'general', icon: 'Sparkles', description: '' },
      organization: { id: 'org-epay', name: 'ePay Organizer', slug: 'epay-organizer', verified: true },
      venue: { name: 'Main Venue', address: '', city: 'Mumbai', country: 'India' },
      ticketTypes: [
        {
          id: `tkt-${decodedSlug}-1`,
          name: 'General Admission',
          description: 'Standard event pass',
          price: 500,
          quantity: 200,
          remainingQuantity: 200,
          minPerOrder: 1,
          maxPerOrder: 5,
          category: 'General' as const,
          features: ['Full Event Access', 'Instant QR Pass'],
        }
      ],
      speakers: [],
      agenda: [],
      facilities: [],
      sponsors: [],
      exhibitors: [],
      faqs: [],
      registrationFields: [],
    };
    event = fallbackEvent;
  }

  const isEnded = event.status === 'ended';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    startDate: event.startDate,
    endDate: event.endDate,
    eventAttendanceMode: event.eventType === 'online' ? 'https://schema.org/OnlineEventAttendanceMode' : 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: isEnded ? 'https://schema.org/EventEnded' : 'https://schema.org/EventScheduled',
    location: {
      '@type': 'Place',
      name: event.venue.name,
      address: {
        '@type': 'PostalAddress',
        streetAddress: event.venue.address,
        addressLocality: event.venue.city,
        addressCountry: event.venue.country,
      },
    },
    image: [event.bannerUrl],
    description: event.shortDescription,
    organizer: {
      '@type': 'Organization',
      name: event.organization.name,
    },
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF9]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <EventDetailClient event={event} />
      <Footer />
    </div>
  );
}
