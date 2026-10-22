'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Ticket, Calendar, MapPin, Clock, QrCode, Download, 
  Search, ShieldCheck, CheckCircle2, AlertCircle, Copy, Check,
  ExternalLink, ArrowRight, X, Printer, UserCheck, Sparkles, Filter, Star,
  MessageSquare, Mail, CornerDownRight, Send
} from 'lucide-react';
import { Navbar, Footer } from '@/components/NavbarFooter';
import { useAuth } from '@/context/AuthContext';
import { mockEvents } from '@/lib/data';
import { OrganizerInquiry } from '@/lib/repositories/inquiryRepository';
import { QRCodeImage } from '@/components/QRCodeImage';

interface AttendeeTicketItem {
  id: string;
  orderId: string;
  ticketCode: string;
  eventId: string;
  eventTitle: string;
  eventSlug?: string;
  bannerUrl?: string;
  category?: string;
  venueName?: string;
  venueCity?: string;
  eventDate?: string;
  eventTime?: string;
  attendeeName: string;
  attendeeEmail: string;
  ticketTierName: string;
  pricePaid: number;
  status: 'valid' | 'checked_in' | 'cancelled' | 'refunded' | 'pending_approval';
  qrPayload: string;
  checkedInAt?: string;
  createdAt?: string;
}

export default function MyTicketsPage() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();

  const [tickets, setTickets] = useState<AttendeeTicketItem[]>([]);
  const [inquiries, setInquiries] = useState<OrganizerInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'past' | 'inquiries'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State for viewing scannable QR Ticket
  const [selectedTicket, setSelectedTicket] = useState<AttendeeTicketItem | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Cancellation & Refund Modal State
  const [cancellingTicket, setCancellingTicket] = useState<AttendeeTicketItem | null>(null);
  const [cancelReason, setCancelReason] = useState('Change of personal schedule');
  const [isCancelling, setIsCancelling] = useState(false);
  const [actionAlert, setActionAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Redirect unauthenticated visitors to login
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/my-tickets');
    }
  }, [authLoading, user, router]);

  // Fetch attendee's tickets from backend API and local fallback
  useEffect(() => {
    if (!user) return;

    async function loadAttendeeTickets() {
      setLoading(true);
      try {
        const userEmail = (user?.email || '').toLowerCase().trim();
        const userId = user?.id;

        // 1. Fetch from /api/orders, /api/events, and /api/inquiries in parallel
        const [ordersRes, eventsRes, inqsRes] = await Promise.all([
          fetch(`/api/orders?email=${encodeURIComponent(userEmail)}&userId=${encodeURIComponent(userId || '')}`),
          fetch('/api/events'),
          fetch(`/api/inquiries?senderEmail=${encodeURIComponent(userEmail)}`),
        ]);

        const json = await ordersRes.json();
        let fetchedEventsList: any[] = [];
        try {
          const eventsJson = await eventsRes.json();
          if (eventsJson.success && Array.isArray(eventsJson.data)) {
            fetchedEventsList = eventsJson.data;
          }
        } catch {}

        try {
          const inqsJson = await inqsRes.json();
          if (inqsJson.success && Array.isArray(inqsJson.data)) {
            setInquiries(inqsJson.data);
          }
        } catch {}

        const fetchedRegistrations: any[] = (json.success && json.data?.registrations) ? json.data.registrations : [];
        const fetchedOrders: any[] = (json.success && json.data?.orders) ? json.data.orders : [];

        // 2. Read fallback tickets from browser localStorage (ONLY for this user's email)
        let localRegistrations: any[] = [];
        try {
          const rawRegs = localStorage.getItem('epay_persisted_registrations');
          if (rawRegs) {
            const parsed = JSON.parse(rawRegs);
            if (Array.isArray(parsed)) {
              localRegistrations = parsed.filter((r: any) => 
                r.attendeeEmail && r.attendeeEmail.toLowerCase().trim() === userEmail
              );
            }
          }
        } catch (e) {
          console.warn('[MyTickets] Error reading local registrations:', e);
        }

        // Merge all tickets without duplicates
        const ticketMap: Record<string, AttendeeTicketItem> = {};
        const allKnownEvents = [...fetchedEventsList, ...mockEvents];

        const allRaw = [...fetchedRegistrations, ...localRegistrations];

        allRaw.forEach((reg: any) => {
          if (!reg.ticketCode && !reg.id) return;
          const matchedOrder = fetchedOrders.find(o => o.id === reg.orderId);
          // Security check: Match registrations by email or by matched order belonging to this user
          const isEmailMatch = reg.attendeeEmail && reg.attendeeEmail.toLowerCase().trim() === userEmail;
          const isOrderMatch = matchedOrder && (
            (matchedOrder.userId && matchedOrder.userId === userId) ||
            (matchedOrder.buyerEmail && matchedOrder.buyerEmail.toLowerCase().trim() === userEmail)
          );
          if (!isEmailMatch && !isOrderMatch) {
            return;
          }
          const code = reg.ticketCode || reg.id;

          // Match with event in allKnownEvents (live Supabase events + mockEvents)
          const matchedEvent = allKnownEvents.find(e => 
            e.id === reg.eventId || 
            e.slug === reg.eventId || 
            (e.title && reg.eventTitle && e.title.toLowerCase() === reg.eventTitle.toLowerCase())
          );

          const eventTitle = reg.eventTitle || matchedEvent?.title || 'ePay Event';
          const eventSlug = matchedEvent?.slug || reg.eventId;
          const bannerUrl = matchedEvent?.bannerUrl || matchedEvent?.cover_image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1400&q=80';
          const category = (typeof matchedEvent?.category === 'object' ? matchedEvent?.category?.name : matchedEvent?.category) || 'Technology';
          const venueName = (typeof matchedEvent?.venue === 'object' ? matchedEvent?.venue?.name : matchedEvent?.venue) || 'Main Event Convention Center';
          const venueCity = (typeof matchedEvent?.venue === 'object' ? matchedEvent?.venue?.city : matchedEvent?.city) || 'Mumbai';
          const eventDate = matchedEvent?.date || matchedEvent?.startDate?.split('T')[0] || reg.createdAt?.split('T')[0] || '2026-11-15';
          const eventTime = matchedEvent?.startTime || '10:00 AM';

          ticketMap[code] = {
            id: reg.id || code,
            orderId: reg.orderId || matchedOrder?.id || 'ORD-849204',
            ticketCode: code,
            eventId: reg.eventId,
            eventTitle,
            eventSlug,
            bannerUrl,
            category,
            venueName,
            venueCity,
            eventDate,
            eventTime,
            attendeeName: reg.attendeeName || user?.user_metadata?.full_name || 'Attendee',
            attendeeEmail: reg.attendeeEmail || userEmail,
            ticketTierName: reg.ticketTierName || reg.ticketName || 'General Admission',
            pricePaid: Number(reg.pricePaid || reg.price || matchedOrder?.total || 0),
            status: reg.status || 'valid',
            qrPayload: reg.qrPayload || JSON.stringify({ tkt: code, ord: reg.orderId, name: reg.attendeeName, title: eventTitle }),
            checkedInAt: reg.checkedInAt,
            createdAt: reg.createdAt || matchedOrder?.createdAt,
          };
        });

        // Set the tickets (if user hasn't booked any tickets, ticketList will be empty)
        const ticketList = Object.values(ticketMap);
        setTickets(ticketList);
      } catch (err) {
        console.error('[MyTickets] Error loading tickets:', err);
      } finally {
        setLoading(false);
      }
    }

    loadAttendeeTickets();
  }, [user, profile]);

  // Filter tickets by Tab and Search query
  const filteredTickets = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];

    return tickets.filter(t => {
      // Search matching
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        t.eventTitle.toLowerCase().includes(q) ||
        t.ticketCode.toLowerCase().includes(q) ||
        t.ticketTierName.toLowerCase().includes(q) ||
        (t.venueCity && t.venueCity.toLowerCase().includes(q)) ||
        (t.orderId && t.orderId.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      // Tab filtering
      if (activeTab === 'upcoming') {
        const isUpcomingDate = t.eventDate ? t.eventDate >= todayStr : true;
        return isUpcomingDate && t.status !== 'cancelled' && t.status !== 'refunded';
      }

      if (activeTab === 'past') {
        const isPastDate = t.eventDate ? t.eventDate < todayStr : false;
        return isPastDate || t.status === 'checked_in' || t.status === 'cancelled';
      }

      return true;
    });
  }, [tickets, activeTab, searchQuery]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handlePrintTicket = (ticket: AttendeeTicketItem) => {
    setSelectedTicket(ticket);
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.print();
      }
    }, 300);
  };

  const handleConfirmCancellation = async () => {
    if (!cancellingTicket) return;
    setIsCancelling(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'cancel',
          ticketCode: cancellingTicket.ticketCode,
          orderId: cancellingTicket.orderId,
          reason: cancelReason,
          attendeeName: cancellingTicket.attendeeName,
          attendeeEmail: cancellingTicket.attendeeEmail || user?.email,
          eventId: cancellingTicket.eventId,
          eventTitle: cancellingTicket.eventTitle,
        }),
      });

      const json = await res.json();
      if (json.success) {
        // Update local ticket status
        setTickets(prev =>
          prev.map(t =>
            t.ticketCode === cancellingTicket.ticketCode ? { ...t, status: 'cancelled' } : t
          )
        );

        setActionAlert({
          type: 'success',
          message: 'Your pass has been cancelled and a refund request has been logged with the organizer.',
        });

        setCancellingTicket(null);
      } else {
        setActionAlert({
          type: 'error',
          message: json.error || 'Failed to cancel pass. Please contact support.',
        });
      }
    } catch (err: any) {
      setActionAlert({
        type: 'error',
        message: err.message || 'An error occurred processing the cancellation.',
      });
    } finally {
      setIsCancelling(false);
      setTimeout(() => setActionAlert(null), 6000);
    }
  };

  if (authLoading || (!user && loading)) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAFAF9]">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl border border-[#E7E5E4] shadow-sm p-8 text-center max-w-sm w-full space-y-4">
            <div className="h-8 w-8 border-3 border-[#0F766E] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-[#1C1917]">Loading Your Passes...</p>
            <p className="text-[11px] text-[#78716C]">Retrieving confirmed gate tickets and QR codes</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF9]">
      <Navbar />

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0F172A] via-[#0F766E] to-[#0F172A] text-white py-10 shadow-md">
        <div className="container mx-auto px-4 md:px-8 max-w-6xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F97316] text-white text-xs font-bold rounded-full mb-2 shadow-sm">
                <Ticket className="h-3.5 w-3.5" />
                <span>Attendee Ticket Vault</span>
              </span>
              <h1 className="text-3xl font-black tracking-tight">My Tickets & Passes</h1>
              <p className="text-slate-200 text-xs sm:text-sm mt-1 max-w-2xl">
                Access your registered event passes, view instant gate scanner QR codes, and download printable badges.
              </p>
            </div>

            <Link
              href="/events"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white text-[#0F766E] hover:bg-slate-100 text-xs font-extrabold shadow-md transition shrink-0"
            >
              <span>Explore More Events</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 md:px-8 py-8 flex-1 max-w-6xl space-y-6">
        {/* Action Alert Banner */}
        {actionAlert && (
          <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between gap-3 shadow-sm ${
            actionAlert.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center gap-2">
              {actionAlert.type === 'success' ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
              )}
              <span>{actionAlert.message}</span>
            </div>
            <button
              onClick={() => setActionAlert(null)}
              className="text-xs font-bold hover:underline opacity-80"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Controls: Tabs & Search Filter */}
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-white p-4 rounded-2xl border border-[#E7E5E4] shadow-sm">
          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'all'
                  ? 'bg-white text-[#0F766E] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>All Tickets</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700">
                {tickets.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'upcoming'
                  ? 'bg-white text-[#0F766E] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Upcoming</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-bold">
                {tickets.filter(t => t.status !== 'cancelled' && t.status !== 'refunded').length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('past')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'past'
                  ? 'bg-white text-[#0F766E] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Past / Attended</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700">
                {tickets.filter(t => t.status === 'checked_in').length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('inquiries')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'inquiries'
                  ? 'bg-white text-[#0F766E] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>My Inquiries & Replies</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                inquiries.some(i => i.status === 'replied')
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-slate-200 text-slate-700'
              }`}>
                {inquiries.length}
              </span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[280px]">
            <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by event title, ticket code, or city..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0F766E] bg-[#FAFAF9]"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Content View: Inquiries Tab OR Tickets Grid */}
        {activeTab === 'inquiries' ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900">Your Submitted Inquiries & Support Messages</h3>
                <p className="text-xs text-slate-500 mt-0.5">Track questions you have sent to event organizers and view their answers.</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-[#0F766E] border border-teal-200">
                {inquiries.length} Total Queries
              </span>
            </div>

            {inquiries.length > 0 ? (
              <div className="space-y-4">
                {inquiries.map((inq) => {
                  const isReplied = inq.status === 'replied' || Boolean(inq.replyContent);

                  return (
                    <motion.div
                      key={inq.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-6 rounded-3xl border shadow-sm transition ${
                        isReplied 
                          ? 'bg-white border-emerald-200 ring-1 ring-emerald-100' 
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      {/* Inquiry Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-extrabold text-[#0F766E] flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5 text-[#F97316]" /> {inq.eventTitle}
                            </span>
                            {isReplied ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Answered
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                                <Clock className="h-3 w-3 text-amber-600" /> Awaiting Response
                              </span>
                            )}
                          </div>
                          {inq.subject && (
                            <h4 className="text-sm font-black text-slate-900 mt-1">{inq.subject}</h4>
                          )}
                        </div>

                        <span className="text-[11px] text-slate-400 font-medium">
                          Submitted on {new Date(inq.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>

                      {/* Attendee Question */}
                      <div className="mt-3.5 space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Your Question</span>
                        <p className="text-xs text-slate-700 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 leading-relaxed">
                          {inq.message}
                        </p>
                      </div>

                      {/* Organizer Answer / Reply */}
                      {isReplied ? (
                        <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-teal-50/90 to-emerald-50/70 border border-teal-200/80 space-y-2">
                          <div className="flex items-center justify-between text-xs font-bold text-[#0F766E]">
                            <div className="flex items-center gap-2">
                              <CornerDownRight className="h-4 w-4 text-emerald-600 shrink-0" />
                              <span>Organizer / Support Reply:</span>
                            </div>
                            {inq.repliedAt && (
                              <span className="text-[10px] text-teal-600/80 font-normal">
                                {new Date(inq.repliedAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-800 pl-6 font-medium leading-relaxed">
                            {inq.replyContent || 'Your inquiry was reviewed by the organizing team.'}
                          </p>
                        </div>
                      ) : (
                        <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400">
                          <Clock className="h-3.5 w-3.5 text-amber-500" />
                          <span>The host team typically responds within 2 to 6 business hours. The answer will appear here.</span>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-[#E7E5E4] p-12 text-center max-w-lg mx-auto space-y-4 shadow-sm">
                <div className="w-16 h-16 bg-teal-50 text-[#0F766E] rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <MessageSquare className="h-8 w-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-slate-900">No Inquiries Submitted Yet</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Have questions about an event schedule, seating, or passes? You can contact the organizer directly from any event details page or via the Contact Us form.
                  </p>
                </div>
                <div className="pt-2">
                  <Link
                    href="/events"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white px-6 py-2.5 text-xs font-bold shadow-md transition"
                  >
                    <span>Browse Events</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        ) : filteredTickets.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredTickets.map((tkt) => {
              const isCheckedIn = tkt.status === 'checked_in';
              const isCancelled = tkt.status === 'cancelled' || tkt.status === 'refunded';

              return (
                <motion.div
                  key={tkt.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-3xl border border-[#E7E5E4] shadow-sm hover:shadow-md transition overflow-hidden flex flex-col justify-between"
                >
                  {/* Top Header: Banner Image & Category */}
                  <div className="relative h-44 w-full overflow-hidden bg-slate-900">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={tkt.bannerUrl}
                      alt={tkt.eventTitle}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />

                    {/* Category & Status Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-[11px] font-bold uppercase tracking-wider border border-white/20">
                        {tkt.category}
                      </span>

                      {isCheckedIn ? (
                        <span className="px-3 py-1 rounded-full bg-blue-600 text-white text-[11px] font-extrabold flex items-center gap-1 shadow">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Checked In
                        </span>
                      ) : isCancelled ? (
                        <span className="px-3 py-1 rounded-full bg-red-600 text-white text-[11px] font-extrabold shadow">
                          Cancelled
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-extrabold flex items-center gap-1 shadow">
                          <span className="h-2 w-2 rounded-full bg-white animate-pulse" /> Valid Pass
                        </span>
                      )}
                    </div>

                    {/* Title overlay */}
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="text-white font-extrabold text-lg line-clamp-1 drop-shadow-md">
                        {tkt.eventTitle}
                      </h3>
                      <p className="text-slate-300 text-xs flex items-center gap-1.5 mt-0.5">
                        <MapPin className="h-3 w-3 text-[#F97316] shrink-0" />
                        <span className="truncate">{tkt.venueName}, {tkt.venueCity}</span>
                      </p>
                    </div>
                  </div>

                  {/* Middle Ticket Details */}
                  <div className="p-5 space-y-4">
                    <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                      <div>
                        <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider">Date & Time</span>
                        <div className="flex items-center gap-1.5 font-bold text-slate-800 mt-0.5">
                          <Calendar className="h-3.5 w-3.5 text-[#0F766E] shrink-0" />
                          <span>{tkt.eventDate}</span>
                        </div>
                        <span className="text-[11px] text-slate-500 block pl-5">{tkt.eventTime}</span>
                      </div>

                      <div>
                        <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider">Pass Tier</span>
                        <div className="flex items-center gap-1.5 font-bold text-slate-800 mt-0.5">
                          <Ticket className="h-3.5 w-3.5 text-[#F97316] shrink-0" />
                          <span className="truncate">{tkt.ticketTierName}</span>
                        </div>
                        <span className="text-[11px] font-black text-[#0F766E] block pl-5">
                          {tkt.pricePaid > 0 ? `₹${tkt.pricePaid.toLocaleString()}` : 'Free Pass'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Attendee</span>
                        <span className="font-bold text-slate-800">{tkt.attendeeName}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">Ticket Code</span>
                        <span className="font-mono text-xs font-bold text-[#0F766E]">{tkt.ticketCode}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="p-4 pt-0 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedTicket(tkt)}
                      className="flex-1 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white py-2.5 px-3 text-xs font-bold shadow-sm transition flex items-center justify-center gap-2"
                    >
                      <QrCode className="h-4 w-4" />
                      <span>View Gate QR Pass</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handlePrintTicket(tkt)}
                      className="rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 py-2.5 px-3 text-xs font-bold transition flex items-center justify-center gap-1.5"
                      title="Print or Save as PDF"
                    >
                      <Printer className="h-4 w-4 text-slate-500" />
                      <span className="hidden sm:inline">Print Pass</span>
                    </button>

                    {/* Cancel & Refund Button (Only for valid passes) */}
                    {!isCancelled && !isCheckedIn && (
                      <button
                        type="button"
                        onClick={() => setCancellingTicket(tkt)}
                        className="rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 py-2.5 px-3 text-xs font-bold transition flex items-center justify-center gap-1.5"
                        title="Cancel this ticket pass and request refund"
                      >
                        <X className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Cancel & Refund</span>
                      </button>
                    )}

                    {tkt.eventSlug && (
                      <Link
                        href={`/events/${tkt.eventSlug}#reviews-section`}
                        className="rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100/80 text-amber-800 py-2.5 px-3 text-xs font-bold transition flex items-center justify-center gap-1.5"
                        title="Rate & Review this Event"
                      >
                        <Star className="h-3.5 w-3.5 fill-[#F97316] text-[#F97316]" />
                        <span className="hidden sm:inline">Review</span>
                      </Link>
                    )}

                    {tkt.eventSlug && (
                      <Link
                        href={`/events/${tkt.eventSlug}`}
                        className="rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 py-2.5 px-3 text-xs font-bold transition flex items-center justify-center"
                        title="View Event Details"
                      >
                        <ExternalLink className="h-4 w-4 text-slate-500" />
                      </Link>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-[#E7E5E4] p-12 text-center max-w-lg mx-auto space-y-5 shadow-sm">
            <div className="w-16 h-16 bg-teal-50 text-[#0F766E] rounded-full flex items-center justify-center mx-auto shadow-inner">
              <Ticket className="h-8 w-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-900">No Tickets Found</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {searchQuery
                  ? `No event passes matched your search "${searchQuery}". Try a different keyword.`
                  : activeTab === 'upcoming'
                  ? 'You do not have any upcoming event passes. Explore conferences and summits to book passes!'
                  : 'You have not booked any event passes yet. Browse top events on ePayEvents!'}
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/events"
                className="inline-flex items-center gap-2 rounded-xl bg-[#F97316] hover:bg-[#ea580c] text-white px-6 py-3 text-xs font-bold shadow-md transition"
              >
                <span>Browse & Book Events</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* QR Code & Printable Pass Modal */}
      <AnimatePresence>
        {selectedTicket && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden text-slate-900"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-[#0F172A] to-[#0F766E] p-4 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-400" />
                  <div>
                    <h4 className="font-extrabold text-sm">Official Gate Pass</h4>
                    <span className="text-[10px] text-emerald-300">Instant Check-in Ready</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 text-center space-y-4">
                <h3 className="text-base font-black text-slate-900 leading-snug">
                  {selectedTicket.eventTitle}
                </h3>
                
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                  <Ticket className="h-3 w-3 text-[#F97316]" />
                  <span>{selectedTicket.ticketTierName}</span>
                </div>

                {/* Scannable QR Code */}
                <div className="p-4 bg-white rounded-2xl border-2 border-dashed border-teal-500/40 inline-block shadow-inner">
                  <QRCodeImage
                    value={selectedTicket.qrPayload || selectedTicket.ticketCode}
                    size={192}
                    className="mx-auto"
                    alt="Official Ticket Gate QR"
                  />
                </div>

                {/* Ticket Code Box */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                  <span className="font-mono font-bold text-[#0F766E]">{selectedTicket.ticketCode}</span>
                  <button
                    type="button"
                    onClick={() => handleCopyCode(selectedTicket.ticketCode)}
                    className="flex items-center gap-1 text-[11px] font-bold text-slate-600 hover:text-[#0F766E] transition"
                  >
                    {copiedCode ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-600" />
                        <span className="text-emerald-600">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Attendee Details */}
                <div className="text-left text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1.5">
                  <p><strong>Attendee:</strong> {selectedTicket.attendeeName} ({selectedTicket.attendeeEmail})</p>
                  <p><strong>Date & Time:</strong> {selectedTicket.eventDate} at {selectedTicket.eventTime}</p>
                  <p><strong>Venue:</strong> {selectedTicket.venueName}, {selectedTicket.venueCity}</p>
                </div>

                <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  <span>256-Bit Encrypted Gate Pass • Verified Check-in</span>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (typeof window !== 'undefined') window.print();
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 font-bold text-xs text-slate-800 transition flex items-center justify-center gap-1.5"
                >
                  <Printer className="h-4 w-4" />
                  <span>Print / Save PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="flex-1 py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#115E59] font-bold text-xs text-white transition shadow-sm"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Cancellation & Refund Request Modal */}
      <AnimatePresence>
        {cancellingTicket && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden text-slate-900"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-rose-900 to-rose-700 p-4 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-rose-300" />
                  <div>
                    <h4 className="font-extrabold text-sm">Cancel Pass & Request Refund</h4>
                    <span className="text-[10px] text-rose-200">Official Cancellation Request</span>
                  </div>
                </div>
                <button
                  onClick={() => setCancellingTicket(null)}
                  className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4 text-xs">
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    {cancellingTicket.eventTitle}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-slate-500">
                    <span>Ticket: <strong>{cancellingTicket.ticketCode}</strong></span>
                    <span>•</span>
                    <span>Tier: <strong>{cancellingTicket.ticketTierName}</strong></span>
                  </div>
                </div>

                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-900 space-y-1">
                  <span className="font-bold block text-[11px] text-rose-800">Refund Policy Notice</span>
                  <p className="text-[11px] leading-relaxed">
                    Cancelling this ticket will void your Gate QR pass immediately. The event organizer will receive your refund request and process credit of ₹{cancellingTicket.pricePaid.toLocaleString()} back to your original payment method.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Reason for Cancellation
                  </label>
                  <select
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium focus:outline-none focus:border-[#0F766E]"
                  >
                    <option value="Change of personal schedule">Change of personal schedule</option>
                    <option value="Accidental / duplicate purchase">Accidental / duplicate purchase</option>
                    <option value="Travel or transport issue">Travel or transport issue</option>
                    <option value="Medical / emergency reason">Medical / emergency reason</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {cancelReason === 'Other' && (
                  <input
                    type="text"
                    placeholder="Please specify reason..."
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0F766E]"
                  />
                )}
              </div>

              {/* Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCancellingTicket(null)}
                  disabled={isCancelling}
                  className="flex-1 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 font-bold text-xs text-slate-800 transition"
                >
                  Keep My Pass
                </button>

                <button
                  type="button"
                  onClick={handleConfirmCancellation}
                  disabled={isCancelling}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 font-bold text-xs text-white transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {isCancelling ? 'Processing...' : 'Confirm Cancellation'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}

