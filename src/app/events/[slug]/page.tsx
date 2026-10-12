import React from 'react';
import { notFound } from 'next/navigation';
import { Navbar, Footer } from '@/components/NavbarFooter';
import { getEventBySlug } from '@/lib/data';
import { EventDetailClient } from '@/components/EventDetailClient';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
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
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) {
    notFound();
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
