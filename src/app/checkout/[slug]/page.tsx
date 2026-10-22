import React from 'react';
import { notFound } from 'next/navigation';
import { Navbar, Footer } from '@/components/NavbarFooter';
import { CheckoutForm } from '@/components/CheckoutForm';
import { getEventBySlug } from '@/lib/repositories/eventRepository';

interface CheckoutPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: Promise<{
    ticketId?: string;
  }>;
}

export async function generateMetadata({ params }: CheckoutPageProps) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) return { title: 'Checkout | ePayEvents' };
  return { title: `Checkout - ${event.title} | ePayEvents` };
}

export default async function EventCheckoutPage({ params, searchParams }: CheckoutPageProps) {
  const { slug } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const selectedTicketId = resolvedSearchParams.ticketId || '';

  const event = await getEventBySlug(slug);
  if (!event) {
    notFound();
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
        <CheckoutForm event={event} initialTicketId={selectedTicketId} />
      </main>

      <Footer />
    </div>
  );
}
