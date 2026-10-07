import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { 
  Calendar, MapPin, Ticket, ShieldCheck, Share2, Clock, Globe, ArrowLeft, CheckCircle2, 
  Building2, Mail, Wifi, Utensils, QrCode, Video, Car, Coffee, Award, Music, Sun, Sparkles
} from 'lucide-react';
import { Navbar, Footer } from '@/components/NavbarFooter';
import { ContactOrganizerButton } from '@/components/ContactOrganizerButton';
import { getEventBySlug } from '@/lib/data';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

const facilityIconMap: Record<string, React.ReactNode> = {
  Wifi: <Wifi className="h-5 w-5 text-blue-600" />,
  Utensils: <Utensils className="h-5 w-5 text-indigo-600" />,
  QrCode: <QrCode className="h-5 w-5 text-emerald-600" />,
  Video: <Video className="h-5 w-5 text-purple-600" />,
  Parking: <Car className="h-5 w-5 text-amber-600" />,
  ShieldCheck: <ShieldCheck className="h-5 w-5 text-emerald-600" />,
  Coffee: <Coffee className="h-5 w-5 text-amber-700" />,
  Award: <Award className="h-5 w-5 text-yellow-600" />,
  Music: <Music className="h-5 w-5 text-pink-600" />,
  Sun: <Sun className="h-5 w-5 text-amber-500" />,
};

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

  const startDateFormatted = new Date(event.startDate).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const startTimeFormatted = new Date(event.startDate).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    startDate: event.startDate,
    endDate: event.endDate,
    eventAttendanceMode: event.eventType === 'online' ? 'https://schema.org/OnlineEventAttendanceMode' : 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
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
    <div className="min-h-screen flex flex-col bg-slate-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      {/* Navigation Breadcrumb Bar */}
      <div className="bg-white border-b border-slate-200 py-3">
        <div className="container mx-auto px-4 md:px-8 flex justify-between items-center">
          <Link href="/events" className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 hover:underline">
            <ArrowLeft className="h-4 w-4" /> Back to all events
          </Link>

          <span className="text-xs text-slate-400 font-medium">Event ID: {event.id}</span>
        </div>
      </div>

      {/* Hero Banner with Standardized Aspect Ratio */}
      <div className="relative w-full bg-slate-950 overflow-hidden border-b border-slate-800">
        <div className="container mx-auto px-4 md:px-8 py-8 lg:py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-7 rounded-2xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-900 aspect-video relative group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={event.bannerUrl}
              alt={event.title}
              className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute top-4 left-4 flex gap-2">
              <span className="rounded-full bg-blue-600/90 backdrop-blur-md px-3 py-1 text-xs font-bold text-white shadow">
                {event.category.name}
              </span>
              <span className="rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-xs font-bold text-white uppercase tracking-wider shadow">
                {event.eventType}
              </span>
            </div>
          </div>

          <div className="lg:col-span-5 text-white space-y-4">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 px-3 py-1 text-xs font-semibold text-blue-300">
              <Sparkles className="h-3.5 w-3.5" /> Official Event Showcase
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-tight tracking-tight text-white">
              {event.title}
            </h1>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              {event.shortDescription}
            </p>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white text-sm ring-2 ring-blue-400/30">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Hosted By</span>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-bold text-white">{event.organization.name}</span>
                    {event.organization.verified && (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 md:px-8 py-10 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Date & Schedule</h4>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{startDateFormatted}</p>
                  <p className="text-xs text-slate-500">{startTimeFormatted} ({event.timezone})</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Venue Location</h4>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{event.venue.name}</p>
                  <p className="text-xs text-slate-500">{event.venue.address}, {event.venue.city}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-4">About This Event</h2>
              <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed whitespace-pre-line text-sm sm:text-base">
                {event.description}
              </div>
            </div>

            {event.facilities && event.facilities.length > 0 && (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-6">Facilities & Event Amenities Provided</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {event.facilities.map((fac, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-slate-100 bg-slate-50/80 flex items-start gap-3">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        {facilityIconMap[fac.icon] || <CheckCircle2 className="h-5 w-5 text-blue-600" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{fac.title}</h4>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{fac.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {event.speakers && event.speakers.length > 0 && (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-6">Keynote Speakers & Key Presenters</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {event.speakers.map((sp, idx) => (
                    <div key={idx} className="flex flex-col items-center text-center p-5 border border-slate-100 rounded-2xl bg-slate-50/60 hover:bg-white hover:shadow-md transition">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={sp.avatar}
                        alt={sp.name}
                        className="h-20 w-20 rounded-full object-cover mb-3 ring-4 ring-blue-100 shadow-sm"
                      />
                      <h3 className="font-bold text-slate-900 text-base">{sp.name}</h3>
                      <p className="text-xs font-semibold text-blue-600 mt-0.5">{sp.role}</p>
                      <p className="text-xs text-slate-400 font-medium">{sp.company}</p>
                      
                      {sp.bio && (
                        <p className="text-xs text-slate-500 mt-3 pt-3 border-t border-slate-200/60 leading-relaxed text-center">
                          &quot;{sp.bio}&quot;
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {event.agenda && event.agenda.length > 0 && (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-6">Event Schedule Timeline</h2>
                <div className="space-y-4">
                  {event.agenda.map((item, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="sm:w-44 text-xs font-bold text-blue-600 flex items-center gap-1.5 shrink-0">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{item.time}</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
                        <p className="text-xs text-slate-600 mt-1">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Separated Client Component for Contact Button */}
            <ContactOrganizerButton orgName={event.organization.name} email={event.organization.contactEmail} />
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md sticky top-24">
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4 mb-4 flex items-center gap-2">
                <Ticket className="h-5 w-5 text-blue-600" /> Select Tickets
              </h3>

              <div className="space-y-4">
                {event.ticketTypes.map(tkt => (
                  <div key={tkt.id} className="p-4 border rounded-xl border-slate-200 hover:border-blue-400 bg-slate-50/80 hover:bg-white transition shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{tkt.name}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">{tkt.description}</p>
                      </div>
                      <span className="font-extrabold text-slate-900 text-base">
                        {tkt.price === 0 ? 'FREE' : `₹${tkt.price.toLocaleString()}`}
                      </span>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                      <span className="text-xs text-slate-400">
                        {tkt.remainingQuantity} passes remaining
                      </span>

                      <Link
                        href={`/checkout/${event.slug}?ticketId=${tkt.id}`}
                        className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition"
                      >
                        Select Pass
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center gap-2 text-xs text-emerald-600 font-semibold">
                  <CheckCircle2 className="h-4 w-4" /> Instant QR Code Ticket PDF Delivery
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <ShieldCheck className="h-4 w-4 text-slate-400" /> Encrypted Payment Gateway processing
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
