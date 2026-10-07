'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, MapPin, Sparkles, Cpu, Briefcase, Music, BookOpen, HeartPulse, Palette, ArrowRight, 
  ChevronLeft, ChevronRight, Calendar, CheckCircle2, ShieldCheck, Zap, BarChart2, Star, Quote, 
  ChevronDown, HelpCircle, User, Globe, Laptop, Award, Video
} from 'lucide-react';
import { Navbar, Footer } from '@/components/NavbarFooter';
import { EventCard } from '@/components/EventCard';
import { mockCategories, mockEvents } from '@/lib/data';

const heroBackgroundImages = [
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1600&q=80',
];

const categoryIconMap: Record<string, React.ReactNode> = {
  Cpu: <Cpu className="h-6 w-6 text-blue-600" />,
  Briefcase: <Briefcase className="h-6 w-6 text-indigo-600" />,
  Music: <Music className="h-6 w-6 text-pink-600" />,
  BookOpen: <BookOpen className="h-6 w-6 text-emerald-600" />,
  HeartPulse: <HeartPulse className="h-6 w-6 text-red-600" />,
  Palette: <Palette className="h-6 w-6 text-amber-600" />,
};

const homeFaqs = [
  { question: 'How do I create and host an event on ePayEvents?', answer: 'Just click "Host an Event" in the top bar. Our 7-step wizard helps you set up event details, ticket prices, custom registration forms, and start selling passes in under 5 minutes.' },
  { question: 'How does QR ticket scanning work for check-in?', answer: 'Attendees get an instant PDF ticket with a unique QR code on screen and via email. Gate staff can scan tickets using our web scanner on any smartphone or tablet.' },
  { question: 'When do event organizers receive ticket payouts?', answer: 'Ticket revenue payouts are settled directly into your linked bank account automatically post event completion, minus transparent gateway fees.' },
  { question: 'Can I offer free tickets or early-bird discounts?', answer: 'Yes! You can configure free passes, early-bird tiers, VIP packages, and custom promo coupon codes anytime.' },
];

export default function HomePage() {
  const [currentBg, setCurrentBg] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBg(prev => (prev + 1) % heroBackgroundImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const upcomingEvents = mockEvents.slice(0, 3);
  const featuredEvents = mockEvents.filter(e => e.featured);
  const nearYouEvents = mockEvents.filter(e => e.venue.city.toLowerCase() === 'mumbai' || e.venue.city.toLowerCase() === 'bengaluru');
  const onlineEvents = mockEvents.filter(e => e.eventType === 'online' || e.eventType === 'hybrid');
  const corporateEvents = mockEvents.filter(e => e.category.slug === 'business-fintech');
  const workshopsEvents = mockEvents.filter(e => e.category.slug === 'workshops' || e.category.slug === 'tech-ai');
  const conferencesEvents = mockEvents.filter(e => e.title.toLowerCase().includes('summit') || e.title.toLowerCase().includes('con'));
  const exhibitionsEvents = mockEvents.filter(e => e.title.toLowerCase().includes('expo') || e.category.slug === 'arts-culture');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-900 via-slate-900 to-slate-950 text-white py-20 lg:py-28">
        {heroBackgroundImages.map((img, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === currentBg ? 'opacity-25' : 'opacity-0'
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img} alt="Hero slide" className="w-full h-full object-cover" />
          </div>
        ))}

        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]"></div>

        <div className="container mx-auto px-4 md:px-8 relative z-10 text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 border border-blue-400/20 px-4 py-1.5 text-xs font-semibold text-blue-300 mb-6 backdrop-blur-sm">
            <Sparkles className="h-4 w-4" />
            <span>AI-Powered Event Discovery & Smart QR Ticketing</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            Discover & Host Unforgettable <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">Events & Conferences</span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            From tech hackathons and fintech summits to acoustic music nights. Instant seat reservation, secure payments, and QR check-ins.
          </p>

          {/* 2. SEARCH EVENTS */}
          <form action="/events" method="GET" className="mt-10 max-w-3xl mx-auto bg-white p-2.5 rounded-2xl shadow-xl flex flex-col sm:flex-row gap-2">
            <div className="flex-1 flex items-center gap-3 px-3 py-2 border-b sm:border-b-0 sm:border-r border-slate-200">
              <Search className="h-5 w-5 text-slate-400" />
              <input
                type="text"
                name="query"
                placeholder="Search event name, topic, or keyword..."
                className="w-full bg-transparent text-slate-900 placeholder-slate-400 text-sm focus:outline-none"
              />
            </div>

            <div className="flex-1 flex items-center gap-3 px-3 py-2">
              <MapPin className="h-5 w-5 text-slate-400" />
              <input
                type="text"
                name="location"
                placeholder="City or location..."
                className="w-full bg-transparent text-slate-900 placeholder-slate-400 text-sm focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition shadow"
            >
              Search Events
            </button>
          </form>

          <div className="flex justify-center gap-2 mt-6">
            {heroBackgroundImages.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentBg(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === currentBg ? 'w-8 bg-blue-500' : 'w-2 bg-white/30'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 3. UPCOMING EVENTS */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Upcoming Events</h2>
              <p className="text-xs text-slate-500">Happening over the next few weeks</p>
            </div>
            <Link href="/events" className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map(evt => (
              <EventCard key={evt.id} event={evt} />
            ))}
          </div>
        </div>
      </section>

      {/* 4. FEATURED EVENTS */}
      <section className="py-16">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Featured Events</h2>
              <p className="text-sm text-slate-500">Handpicked top conferences & hackathons</p>
            </div>
            <Link href="/events" className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              Browse All ({mockEvents.length}) <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredEvents.map(evt => (
              <EventCard key={evt.id} event={evt} />
            ))}
          </div>
        </div>
      </section>

      {/* 5. POPULAR CATEGORIES */}
      <section className="py-16 bg-white border-y border-slate-200">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Popular Categories</h2>
              <p className="text-xs text-slate-500">Explore events tailored to your area of interest</p>
            </div>
            <Link href="/events" className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              All Categories <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {mockCategories.map(cat => (
              <Link
                key={cat.id}
                href={`/events?category=${cat.slug}`}
                className="group flex flex-col items-center text-center p-5 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-blue-200 hover:shadow-md transition-all"
              >
                <div className="p-3 rounded-full bg-white shadow-sm mb-3 group-hover:scale-110 transition-transform">
                  {categoryIconMap[cat.icon] || <Cpu className="h-6 w-6 text-blue-600" />}
                </div>
                <h3 className="font-semibold text-slate-900 text-sm">{cat.name}</h3>
                <span className="text-xs text-slate-400 mt-1">{cat.count} Events</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 6. EVENTS NEAR YOU */}
      <section className="py-16">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Events Near You</h2>
              <p className="text-xs text-slate-500">Top in-person gatherings in Mumbai & Bengaluru</p>
            </div>
            <Link href="/events" className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              Explore Cities <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {nearYouEvents.map(evt => (
              <EventCard key={evt.id} event={evt} />
            ))}
          </div>
        </div>
      </section>

      {/* 7. ONLINE EVENTS */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold">Virtual Attendee Track</span>
              <h2 className="text-2xl font-bold text-white mt-1">Online & Hybrid Events</h2>
            </div>
            <Link href="/events?eventType=online" className="text-sm font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1">
              View All Virtual <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {onlineEvents.map(evt => (
              <EventCard key={evt.id} event={evt} />
            ))}
          </div>
        </div>
      </section>

      {/* 8. CORPORATE EVENTS */}
      <section className="py-16">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Corporate & FinTech Summits</h2>
              <p className="text-xs text-slate-500">Executive keynotes, investor pitch sessions, and business expos</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {corporateEvents.map(evt => (
              <EventCard key={evt.id} event={evt} />
            ))}
          </div>
        </div>
      </section>

      {/* 9. TRAINING & WORKSHOPS */}
      <section className="py-16 bg-white border-t border-slate-200">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Training & Hands-on Workshops</h2>
              <p className="text-xs text-slate-500">Masterclasses led by senior architects and instructors</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workshopsEvents.map(evt => (
              <EventCard key={evt.id} event={evt} />
            ))}
          </div>
        </div>
      </section>

      {/* 10. CONFERENCES */}
      <section className="py-16">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Tech & Industry Conferences</h2>
              <p className="text-xs text-slate-500">Multi-day technology summits and developer tracks</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {conferencesEvents.map(evt => (
              <EventCard key={evt.id} event={evt} />
            ))}
          </div>
        </div>
      </section>

      {/* 11. EXHIBITIONS */}
      <section className="py-16 bg-slate-100 border-t border-slate-200">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Exhibitions & Hackathons</h2>
              <p className="text-xs text-slate-500">Product showcases, hackathon demos, and art expos</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exhibitionsEvents.map(evt => (
              <EventCard key={evt.id} event={evt} />
            ))}
          </div>
        </div>
      </section>

      {/* 12. EVENT ORGANIZER CTA */}
      <section className="py-16 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-950 text-white">
        <div className="container mx-auto px-4 md:px-8 text-center max-w-3xl">
          <h2 className="text-3xl font-bold">Hosting an Event or Conference?</h2>
          <p className="mt-4 text-slate-300 text-base leading-relaxed">
            Create tickets, manage registration forms, generate instant QR tickets, and get real-time revenue analytics with ePayEvents.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/create-event"
              className="rounded-xl bg-white px-6 py-3 font-semibold text-slate-900 hover:bg-slate-100 transition shadow"
            >
              Start Hosting Free
            </Link>
          </div>
        </div>
      </section>

      {/* 13. WHY EPAYEVENTS */}
      <section className="py-16 bg-white border-t border-slate-200">
        <div className="container mx-auto px-4 md:px-8 text-center max-w-4xl">
          <h2 className="text-3xl font-extrabold text-slate-900">Why Organizers Choose ePayEvents</h2>
          <p className="mt-3 text-slate-500 text-sm">Everything you need to host successful events without technical overhead</p>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-8 text-left">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">5-Minute Setup</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Create event pages, set ticket pricing, build custom form questions, and go live in minutes.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Instant QR Check-in</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Attendees receive digital QR passes instantly. Gate staff can scan tickets with any smartphone.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                <BarChart2 className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Automatic Payouts</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Track revenue, registration stats, and receive automated settlement payouts right to your bank account.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 14. AI-POWERED FEATURES */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="container mx-auto px-4 md:px-8 max-w-4xl text-center space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 border border-blue-400/20 px-3.5 py-1 text-xs font-semibold text-blue-300">
            <Sparkles className="h-4 w-4 text-blue-400" /> Powered by Antigravity AI Engine
          </div>
          <h2 className="text-3xl font-extrabold text-white">Smart AI Features Built for Event Creators</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/70 space-y-2">
              <h3 className="font-bold text-blue-400 text-base">AI Event Assistant</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Automatically generates compelling event titles, summaries, and agendas based on your topic.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/70 space-y-2">
              <h3 className="font-bold text-emerald-400 text-base">Smart Attendee Matchmaking</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Connects attendees with relevant speakers, workshops, and networking lounge sessions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 15. TESTIMONIALS */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 md:px-8 max-w-4xl text-center">
          <h2 className="text-3xl font-extrabold text-slate-900">What Attendees Say</h2>
          
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <Quote className="h-6 w-6 text-blue-600 opacity-60" />
              <p className="text-xs text-slate-700 italic leading-relaxed">
                &quot;Checking into the FinTech summit took literally 3 seconds. Showed my phone QR code at the gate and walked in. Super smooth!&quot;
              </p>
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900">Rohan Verma</span>
                <span className="text-slate-400">Software Engineer</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <Quote className="h-6 w-6 text-indigo-600 opacity-60" />
              <p className="text-xs text-slate-700 italic leading-relaxed">
                &quot;The ticket purchase was seamless. Got my PDF pass immediately and the event agenda was clean and easy to follow.&quot;
              </p>
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900">Ananya Iyer</span>
                <span className="text-slate-400">Product Manager</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 16. ORGANIZER SUCCESS STORIES */}
      <section className="py-16 bg-slate-50 border-t border-slate-200">
        <div className="container mx-auto px-4 md:px-8 max-w-4xl text-center">
          <h2 className="text-3xl font-extrabold text-slate-900">Organizer Success Stories</h2>
          
          <div className="mt-10 p-8 rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-950 text-white text-left flex flex-col sm:flex-row items-center gap-8">
            <div className="space-y-3 flex-1">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Featured Organizer Case Study</span>
              <h3 className="text-xl font-bold text-white">AI Builders Club: Hosted 2,000+ Hackathon Attendees</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                &quot;We used ePayEvents to manage registrations, custom team submission questions, and gate check-in for our 36-hour hackathon. We saved dozens of hours of manual work.&quot;
              </p>
            </div>
            <div className="bg-white/10 p-4 rounded-xl border border-white/20 text-center shrink-0">
              <div className="text-2xl font-extrabold text-white">2,000+</div>
              <div className="text-xs text-slate-300">Tickets Sold</div>
            </div>
          </div>
        </div>
      </section>

      {/* 17. BLOG / RESOURCES */}
      <section className="py-16 bg-white border-t border-slate-200">
        <div className="container mx-auto px-4 md:px-8 max-w-5xl">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Event Management Resources & Guides</h2>
              <p className="text-xs text-slate-500">Tips on hosting, ticket pricing, and attendee engagement</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { title: 'How to Price Event Tickets for Maximum Sales', date: 'Oct 2026', readTime: '4 min read' },
              { title: 'Guide to Contactless Gate Check-in with QR Codes', date: 'Sep 2026', readTime: '3 min read' },
              { title: '10 Ways to Promote Your Tech Summit on Social Media', date: 'Aug 2026', readTime: '5 min read' },
            ].map((blog, idx) => (
              <div key={idx} className="p-6 rounded-2xl border border-slate-200 hover:border-blue-300 bg-slate-50/60 hover:bg-white transition space-y-3">
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">{blog.readTime}</span>
                <h3 className="font-bold text-slate-900 text-sm">{blog.title}</h3>
                <span className="text-[11px] text-slate-400 block">{blog.date}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 18. FAQ */}
      <section className="py-16 bg-slate-50 border-t border-slate-200">
        <div className="container mx-auto px-4 md:px-8 max-w-3xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-slate-900">Frequently Asked Questions</h2>
            <p className="text-xs text-slate-500 mt-2">Everything you need to know about ePayEvents</p>
          </div>

          <div className="space-y-4">
            {homeFaqs.map((faq, idx) => (
              <div key={idx} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full text-left p-4 font-bold text-sm text-slate-900 flex justify-between items-center"
                >
                  <span>{faq.question}</span>
                  <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === idx && (
                  <div className="px-4 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 19. FOOTER */}
      <Footer />
    </div>
  );
}
