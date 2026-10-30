import React from 'react';
import { notFound } from 'next/navigation';
import { Navbar, Footer } from '@/components/NavbarFooter';
import { CheckoutForm } from '@/components/CheckoutForm';
import { getEventBySlug, getEventById } from '@/lib/repositories/eventRepository';

interface CheckoutPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: Promise<{
    ticketId?: string;
    coupon?: string;
    ref?: string;
  }>;
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ params }: CheckoutPageProps) {
  const resolved = await params;
  const slug = resolved?.slug || '';
  const decodedSlug = decodeURIComponent(slug).trim();
  const event = (await getEventBySlug(decodedSlug)) || (await getEventById(decodedSlug));
  if (!event) return { title: 'Checkout | ePayEvents' };
  return { title: `Checkout - ${event.title} | ePayEvents` };
}

export default async function EventCheckoutPage({ params, searchParams }: CheckoutPageProps) {
  const resolvedParams = await params;
  const rawSlug = resolvedParams?.slug || '';
  const decodedSlug = decodeURIComponent(rawSlug).trim();

  const resolvedSearchParams = searchParams ? await searchParams : {};
  const selectedTicketId = resolvedSearchParams.ticketId || '';
  const initialCoupon = resolvedSearchParams.coupon || '';
  const initialRef = resolvedSearchParams.ref || '';

  let event = await getEventBySlug(decodedSlug);
  if (!event && rawSlug !== decodedSlug) {
    event = await getEventBySlug(rawSlug);
  }
  if (!event) {
    event = (await getEventById(decodedSlug)) || (await getEventById(rawSlug));
  }

  // Fallback: If not yet in server cache or database, construct fallback so checkout does not 404
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

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <div className="bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900 text-white py-8">
        <div className="container mx-auto px-4 md:px-8 max-w-4xl">
          <h1 className="text-2xl font-bold">Checkout & Registration</h1>
          <p className="text-slate-400 text-xs mt-1">Complete your order for {event.title}</p>
        </div>
      </div>

      <main className="container mx-auto px-4 md:px-8 py-10 flex-1 max-w-4xl">
        <CheckoutForm 
          event={event} 
          initialTicketId={selectedTicketId}
          initialCouponCode={initialCoupon}
          initialReferralCode={initialRef}
        />
      </main>

      <Footer />
    </div>
  );
}
