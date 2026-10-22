'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { 
  BarChart3, Calendar, Users, DollarSign, QrCode, PlusCircle, Download, 
  CheckCircle2, Search, ArrowUpRight, TrendingUp, Wallet, 
  Sparkles, Activity, ShieldCheck, Clock,
  ChevronRight, RefreshCw, Layers, Ticket, AlertCircle, Share2, Edit, Check,
  MessageSquare, Mail, Reply, Send, CornerDownRight
} from 'lucide-react';
import { Navbar, Footer } from '@/components/NavbarFooter';
import { getAllEvents } from '@/lib/data';
import { useAuth } from '@/context/AuthContext';

interface RegistrationRecord {
  id: string;
  name: string;
  email: string;
  ticket: string;
  status: 'Checked In' | 'Transferred' | 'Approved' | 'Waitlist' | 'Refunded';
  checkinTime: string;
  price: number;
  date: string;
  isLive?: boolean;
}

const mockRegistrations: RegistrationRecord[] = [
  { id: 'TKT-EPAY-849201', name: 'Alex Morgan', email: 'alex@example.com', ticket: 'Early Bird Pass (General)', status: 'Checked In', checkinTime: '10:14 AM', price: 1499, date: '2026-10-07' },
  { id: 'TKT-EPAY-849202', name: 'Rohini Deshmukh', email: 'rohini@tech.in', ticket: 'VIP Masterclass (Transferred)', status: 'Transferred', checkinTime: '-', price: 5999, date: '2026-10-07' },
  { id: 'TKT-EPAY-849203', name: 'Aarav Sharma', email: 'aarav@finpulse.io', ticket: 'General Admission (Group 4+)', status: 'Checked In', checkinTime: '09:45 AM', price: 2124, date: '2026-10-07' },
  { id: 'TKT-EPAY-849204', name: 'Priya Nambiar', email: 'priya@neural.ai', ticket: 'Founder Grant (Complimentary)', status: 'Approved', checkinTime: '-', price: 0, date: '2026-10-06' },
  { id: 'TKT-EPAY-849205', name: 'David Miller', email: 'david@cloud.com', ticket: 'AI Workshop Lab (Waitlisted)', status: 'Waitlist', checkinTime: '-', price: 3499, date: '2026-10-06' },
  { id: 'TKT-EPAY-849206', name: 'Vikram Joshi', email: 'vikram@media.in', ticket: 'General Pass (Cancelled)', status: 'Refunded', checkinTime: '-', price: 2499, date: '2026-10-06' },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45 },
  },
};

export default function OrganizerDashboardPage() {
  const router = useRouter();
  const { user, role, loading: authLoading, upgradeToOrganizer } = useAuth();
  const [upgradingRole, setUpgradingRole] = useState(false);

  // Helper: check if an event ID or slug belongs to the static dummy mock catalog
  const isMockEvent = (item: any) => {
    if (!item) return false;
    const staticIds = new Set([
      'evt_9f3k2', 'evt-101', 'evt-102', 'evt-104', 'evt-105', 'evt-106',
      'evt-107', 'evt-108', 'evt-109', 'evt-110', 'evt-small-local-01',
      'evt-party-01', 'evt-fashion-01', 'evt-matrimony-01', 'evt-comedy-01',
      'evt-spiritual-01', 'evt-sports-01', 'evt-food-01', 'evt-charity-01',
      'evt-shopping-01', 'evt-family-01', 'evt-wedding-01', 'evt-past-1',
      'evt-past-2', 'evt-past-3'
    ]);
    return staticIds.has(item.id) || staticIds.has(item.slug);
  };

  const [publishedEvents, setPublishedEvents] = useState<any[]>(() => {
    // Only load events created by organizer from local persistence on initial client mount
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('epay_persisted_events');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (typeof parsed === 'object' && parsed !== null) {
            const list: any[] = [];
            const seen = new Set<string>();
            Object.values(parsed).forEach((ev: any) => {
              if (ev && (ev.status === 'published' || !ev.status)) {
                const key = ev.id || ev.slug;
                if (!seen.has(key) && !isMockEvent(ev)) {
                  seen.add(key);
                  list.push(ev);
                }
              }
            });
            return list;
          }
        }
      } catch (e) {
        console.warn('[OrganizerDashboard] Initial localStorage check notice:', e);
      }
    }
    return [];
  });

  const [liveOrders, setLiveOrders] = useState<any[]>([]);
  const [liveRegistrations, setLiveRegistrations] = useState<any[]>([]);
  const [isFetchingMetrics, setIsFetchingMetrics] = useState(false);
  const [activeTab, setActiveTab] = useState<'attendees' | 'inquiries'>('attendees');
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [inquirySearch, setInquirySearch] = useState('');
  const [inquiryStatusFilter, setInquiryStatusFilter] = useState('all');
  const [replyingInquiryId, setReplyingInquiryId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  const fetchLiveMetrics = React.useCallback(async () => {
    setIsFetchingMetrics(true);
    try {
      const res = await fetch('/api/orders');
      const json = await res.json();
      if (json.success && json.data) {
        setLiveOrders(json.data.orders || []);
        setLiveRegistrations(json.data.registrations || []);
      }
    } catch (err) {
      console.warn('[OrganizerDashboard] Could not fetch live orders:', err);
    } finally {
      setIsFetchingMetrics(false);
    }
  }, []);

  const fetchInquiries = React.useCallback(async () => {
    try {
      const res = await fetch('/api/inquiries');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setInquiries(json.data);
      }
    } catch (err) {
      console.warn('[OrganizerDashboard] Could not fetch inquiries:', err);
    }
  }, []);

  const handleSendReply = async (inquiryId: string) => {
    if (!replyText.trim()) return;
    setIsSubmittingReply(true);
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reply',
          inquiryId,
          replyContent: replyText,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setReplyText('');
        setReplyingInquiryId(null);
        await fetchInquiries();
      }
    } catch (err) {
      console.error('Error sending reply:', err);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  React.useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/organizer/dashboard');
    }
  }, [authLoading, user, router]);

  React.useEffect(() => {
    async function fetchLivePublishedEvents() {
      try {
        const res = await fetch('/api/events');
        const json = await res.json();
        let apiEvents: any[] = [];
        if (json.success && Array.isArray(json.data)) {
          // Filter out dummy static mock events from the backend list
          apiEvents = json.data.filter((ev: any) => !isMockEvent(ev));
        }

        // Merge and overlay locally created or edited events from localStorage
        const mergedMap = new Map<string, any>();
        
        // 1. Add valid backend events
        apiEvents.forEach(ev => {
          const key = ev.id || ev.slug;
          if (key) mergedMap.set(key, ev);
        });

        // 2. Add and overlay organizer-created events from localStorage
        try {
          const stored = localStorage.getItem('epay_persisted_events');
          if (stored) {
            const parsed = JSON.parse(stored);
            if (typeof parsed === 'object' && parsed !== null) {
              Object.values(parsed).forEach((localEv: any) => {
                if (localEv && (localEv.status === 'published' || !localEv.status) && !isMockEvent(localEv)) {
                  const key = localEv.id || localEv.slug;
                  if (key) {
                    const existing = mergedMap.get(key);
                    mergedMap.set(key, existing ? { ...existing, ...localEv } : localEv);
                  }
                }
              });
            }
          }
        } catch (storageErr) {
          console.warn('[OrganizerDashboard] Error overlaying localStorage events:', storageErr);
        }

        setPublishedEvents(Array.from(mergedMap.values()));
      } catch (err) {
        console.warn('[OrganizerDashboard] Could not fetch live events:', err);
      }
    }
    fetchLivePublishedEvents();
    fetchLiveMetrics();
    fetchInquiries();

    // Listen to real-time order creation events
    const handleNewOrder = () => {
      fetchLiveMetrics();
      fetchInquiries();
    };
    window.addEventListener('epay_order_created', handleNewOrder);
    return () => {
      window.removeEventListener('epay_order_created', handleNewOrder);
    };
  }, [fetchLiveMetrics, fetchInquiries]);

  const totalEvents = publishedEvents.length;
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'30d' | '90d' | 'year'>('30d');

  // Dynamic metrics calculation from real orders and registrations
  const realRevenue = liveOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const realRegistrationsCount = liveRegistrations.length;
  const realCheckedInCount = liveRegistrations.filter(r => r.status === 'checked_in' || r.status === 'Checked In').length;

  const baseRevenue = 1845000;
  const totalRevenue = baseRevenue + realRevenue;
  const totalRegistrations = 1248 + realRegistrationsCount;
  const checkedInCount = 742 + realCheckedInCount;
  const checkinRate = totalRegistrations > 0 ? Math.round((checkedInCount / totalRegistrations) * 100) : 0;

  // Format live registrations to prepend to the attendee feed
  const formattedLiveRegistrations: RegistrationRecord[] = liveRegistrations.map(r => ({
    id: r.ticketCode || r.id,
    name: r.attendeeName,
    email: r.attendeeEmail,
    ticket: `${r.ticketTierName} (${r.eventTitle})`,
    status: (r.status === 'checked_in' ? 'Checked In' : 'Approved') as RegistrationRecord['status'],
    checkinTime: r.checkedInAt || 'Scan Ready',
    price: Number(r.pricePaid) || 0,
    date: (r.createdAt || new Date().toISOString()).split('T')[0],
    isLive: true,
  }));

  const allRegistrations = [...formattedLiveRegistrations, ...mockRegistrations];

  // Filter registrations
  const filteredRegistrations = allRegistrations.filter(reg => {
    const matchesSearch = reg.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          reg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          reg.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          reg.ticket.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || reg.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: RegistrationRecord['status']) => {
    switch (status) {
      case 'Checked In':
        return 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20';
      case 'Transferred':
        return 'bg-blue-500/10 text-blue-600 border border-blue-500/20';
      case 'Approved':
        return 'bg-teal-500/10 text-teal-600 border border-teal-500/20';
      case 'Waitlist':
        return 'bg-amber-500/10 text-amber-600 border border-amber-500/20';
      case 'Refunded':
        return 'bg-rose-500/10 text-rose-600 border border-rose-500/20';
      default:
        return 'bg-slate-100 text-slate-700 border border-slate-200';
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center max-w-sm w-full space-y-4">
            <div className="h-8 w-8 border-3 border-[#F97316] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-700">Loading Organizer Command Center...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (user && role === 'attendee') {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 sm:p-10 text-center max-w-md w-full space-y-5">
            <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900">Organizer Access Required</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-2">
                Your account is currently registered as an Attendee ({user.email}). Upgrade your account to Organizer to access the dashboard and host events.
              </p>
            </div>
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={async () => {
                  setUpgradingRole(true);
                  await upgradeToOrganizer();
                  setUpgradingRole(false);
                }}
                disabled={upgradingRole}
                className="flex-1 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white py-3 px-4 text-xs font-bold transition shadow disabled:opacity-60"
              >
                {upgradingRole ? 'Upgrading...' : 'Upgrade to Organizer'}
              </button>
              <Link
                href="/events"
                className="flex-1 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 py-3 px-4 text-xs font-bold transition flex items-center justify-center"
              >
                Browse Events
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      {/* Hero Header with Glow Orbs & Framer Motion */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[#0B0F19] via-[#0F172A] to-[#0B0F19] text-white py-12 md:py-16">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#0F766E]/20 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#F97316]/15 rounded-full blur-[130px] pointer-events-none" />

        <div className="container mx-auto px-4 md:px-8 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
          >
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-bold text-[#FFEDD5] uppercase tracking-wider mb-2">
                <Sparkles className="h-3.5 w-3.5 text-[#F97316]" /> Organizer Command Center
              </div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
                Dashboard & <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-300 to-[#F97316]">Event Intelligence</span>
              </h1>
              <p className="text-slate-400 text-sm mt-1 max-w-xl">
                Real-time gate scan operations, revenue tracking, ticketing tiers, and attendee validation.
              </p>
            </div>

            {/* Quick Action Buttons */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="flex flex-wrap items-center gap-3"
            >
              <Link
                href="/organizer/scanner"
                className="group relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#0F766E] to-emerald-600 px-5 py-3 text-xs md:text-sm font-bold text-white shadow-lg hover:shadow-emerald-500/25 transition-all overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <QrCode className="h-4 w-4 relative z-10" />
                <span className="relative z-10">Launch QR Gate Scanner</span>
              </Link>
              <Link
                href="/create-event"
                className="group relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#F97316] to-amber-500 px-5 py-3 text-xs md:text-sm font-bold text-white shadow-lg hover:shadow-orange-500/25 transition-all overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <PlusCircle className="h-4 w-4 relative z-10" />
                <span className="relative z-10">Host New Event</span>
              </Link>
            </motion.div>
          </motion.div>

          {/* Timeframe pill tabs */}
          <div className="flex items-center gap-2 mt-8 border-t border-white/10 pt-4 text-xs font-semibold text-slate-300">
            <span className="text-slate-400">Timeframe:</span>
            {(['30d', '90d', 'year'] as const).map(tf => (
              <button
                key={tf}
                onClick={() => setSelectedTimeframe(tf)}
                className={`px-3 py-1 rounded-lg transition-all ${
                  selectedTimeframe === tf 
                    ? 'bg-[#0F766E] text-white shadow-sm font-bold' 
                    : 'bg-white/5 hover:bg-white/10 text-slate-300'
                }`}
              >
                {tf === '30d' ? 'Last 30 Days' : tf === '90d' ? 'Last Quarter' : 'All Time (Year)'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 md:px-8 py-10 flex-1 space-y-10 max-w-7xl">
        {/* KPI Performance Cards with Framer Motion Stagger */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {/* 1. Total Hosted Events */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="group relative bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-[#0F766E]/40 transition-all flex flex-col justify-between overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-teal-500/10 to-transparent rounded-bl-full pointer-events-none" />
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Hosted Events</span>
              <div className="p-3 bg-[#CCFBF1]/60 text-[#0F766E] rounded-2xl group-hover:scale-110 transition-transform">
                <Calendar className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">{totalEvents}</h3>
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold mt-1">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>{publishedEvents.length} Active / Published</span>
              </div>
            </div>
          </motion.div>

          {/* 2. Total Registrations */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="group relative bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-400/40 transition-all flex flex-col justify-between overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-indigo-500/10 to-transparent rounded-bl-full pointer-events-none" />
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Attendees</span>
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:scale-110 transition-transform">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">{totalRegistrations.toLocaleString()}</h3>
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold mt-1">
                <ArrowUpRight className="h-3.5 w-3.5" />
                <span>
                  {realRegistrationsCount > 0
                    ? `+${realRegistrationsCount} recent online passes`
                    : '+18.4% from last month'}
                </span>
              </div>
            </div>
          </motion.div>

          {/* 3. Gross Revenue */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="group relative bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-[#F97316]/40 transition-all flex flex-col justify-between overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-orange-500/10 to-transparent rounded-bl-full pointer-events-none" />
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Gross Revenue</span>
              <div className="p-3 bg-[#FFEDD5] text-[#F97316] rounded-2xl group-hover:scale-110 transition-transform">
                <Wallet className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">₹{(totalRevenue / 100000).toFixed(2)} Lakhs</h3>
              <div className="flex items-center gap-1.5 text-xs text-[#0F766E] font-bold mt-1">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>
                  {realRevenue > 0
                    ? `+₹${realRevenue.toLocaleString()} new ticket sales`
                    : 'Settlement Guaranteed'}
                </span>
              </div>
            </div>
          </motion.div>

          {/* 4. Live Check-in Rate */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="group relative bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-amber-400/40 transition-all flex flex-col justify-between overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-bl-full pointer-events-none" />
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gate Check-in Rate</span>
              <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl group-hover:scale-110 transition-transform">
                <Activity className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-baseline justify-between">
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">{checkinRate}%</h3>
                <span className="text-xs font-semibold text-slate-500">{checkedInCount} / {totalRegistrations}</span>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${checkinRate}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="bg-gradient-to-r from-amber-500 to-emerald-500 h-2 rounded-full"
                />
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Live Event Operations & Hosted Events List */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0F766E] uppercase tracking-wider bg-[#CCFBF1]/40 px-2.5 py-0.5 rounded-full mb-1">
                <Layers className="h-3 w-3" /> Event Catalog
              </div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-black text-slate-900">Your Active & Published Events</h2>
                <span className="text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200 px-2.5 py-0.5 rounded-full">
                  {publishedEvents.length} Total
                </span>
              </div>
              <p className="text-xs text-slate-500">Manage ticketing status, view live attendees, and test QR verification</p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/create-event"
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#0F766E] text-white px-4 py-2 text-xs font-bold hover:bg-[#115E59] transition shadow-sm"
              >
                <PlusCircle className="h-3.5 w-3.5" /> New Event
              </Link>
            </div>
          </div>

          {publishedEvents.length === 0 ? (
            <div className="py-16 px-6 text-center bg-slate-50/70 rounded-2xl border-2 border-dashed border-slate-200 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-teal-50 text-[#0F766E] border border-teal-100 flex items-center justify-center mx-auto shadow-sm">
                <Calendar className="h-8 w-8 text-[#0F766E]" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-base font-black text-slate-900">No Events Created Yet</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  You haven&apos;t published any events yet. Create your first event now to configure custom registration forms, set ticket tiers, and track ticket sales in real-time.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/create-event"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#F97316] hover:bg-[#ea580c] text-white px-5 py-2.5 text-xs font-bold transition shadow-md"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Create Your First Event</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {publishedEvents.map((evt, idx) => {
                const banner = evt.bannerUrl || evt.coverImage || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1400&q=80';
                const catName = typeof evt.category === 'object' ? (evt.category?.name || 'General') : (evt.category || 'General');
                const minPrice = evt.startingPrice !== undefined 
                  ? evt.startingPrice 
                  : (evt.ticketTypes?.length ? Math.min(...evt.ticketTypes.map((t: any) => t.price)) : 0);
                // Clean parsing of all 4 fields (Start Date, End Date, Start Time, End Time)
                const rawStart = evt.startDate || evt.date || '';
                const rawEnd = evt.endDate || rawStart;
                const startTime = evt.startTime || '10:00 AM';
                const endTime = evt.endTime || '06:00 PM';

                let formattedStart = '';
                if (rawStart) {
                  const dPart = rawStart.split('T')[0];
                  if (/^\d{4}-\d{2}-\d{2}$/.test(dPart)) {
                    const [y, m, d] = dPart.split('-').map(Number);
                    formattedStart = new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                  } else {
                    const parsed = new Date(rawStart);
                    formattedStart = !isNaN(parsed.getTime()) ? parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : rawStart;
                  }
                }

                let formattedEnd = '';
                if (rawEnd && rawEnd !== rawStart) {
                  const dPart = rawEnd.split('T')[0];
                  if (/^\d{4}-\d{2}-\d{2}$/.test(dPart)) {
                    const [y, m, d] = dPart.split('-').map(Number);
                    formattedEnd = new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                  }
                }

                const dateRangeDisplay = formattedEnd && formattedEnd !== formattedStart
                  ? `${formattedStart} - ${formattedEnd}`
                  : formattedStart || 'Upcoming';

                const timeRangeDisplay = endTime && endTime !== startTime
                  ? `${startTime} - ${endTime}`
                  : startTime;

                return (
                  <motion.div
                    key={evt.id || idx}
                    whileHover={{ y: -4 }}
                    className="rounded-2xl border border-slate-200 bg-[#FAFAF9] p-4 flex flex-col justify-between hover:border-[#0F766E]/40 hover:shadow-md transition-all group"
                  >
                    <div className="space-y-3">
                      <div className="relative h-32 w-full rounded-xl overflow-hidden bg-slate-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={banner}
                          alt={evt.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute top-2 left-2 rounded-full bg-[#059669] text-white px-2 py-0.5 text-[10px] font-bold shadow">
                          Live Active
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-[#0F766E] uppercase tracking-wider">
                          {catName}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm line-clamp-1 group-hover:text-[#0F766E] transition-colors">
                          {evt.title}
                        </h4>
                        <div className="space-y-1 mt-2 text-xs">
                          <p className="flex items-center gap-1.5 font-medium text-slate-700">
                            <Calendar className="h-3.5 w-3.5 text-[#0F766E] shrink-0" />
                            <span>{dateRangeDisplay}</span>
                          </p>
                          <p className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                            <Clock className="h-3 w-3 text-slate-400 shrink-0" />
                            <span>{timeRangeDisplay}</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-200/80 mt-3 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Price onwards</span>
                        <span className="font-black text-slate-900">₹{minPrice.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/create-event?edit=${evt.slug || evt.id}`}
                          className="inline-flex items-center gap-1 font-bold text-[#0F766E] hover:text-[#115E59] bg-[#CCFBF1]/50 hover:bg-[#CCFBF1] transition text-xs px-2.5 py-1.5 rounded-lg border border-[#0F766E]/20"
                        >
                          <Edit className="h-3 w-3" />
                          <span>Edit</span>
                        </Link>
                        <Link
                          href={`/events/${evt.slug}`}
                          className="inline-flex items-center gap-1 font-bold text-[#F97316] hover:text-[#ea580c] transition text-xs"
                        >
                          <span>Manage</span>
                          <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Live Registrations Table & Settlement Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Feed Card: Attendee Feed & Inquiries Inbox with Tab Switcher */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-2 bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6"
          >
            {/* Header with Tab switcher */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <button
                    onClick={() => setActiveTab('attendees')}
                    className={`text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                      activeTab === 'attendees'
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Users className="h-3.5 w-3.5" />
                    <span>Attendee Feed ({filteredRegistrations.length})</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('inquiries')}
                    className={`text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                      activeTab === 'inquiries'
                        ? 'bg-[#F97316] text-white shadow-sm'
                        : 'bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200'
                    }`}
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>Attendee Queries ({inquiries.length})</span>
                    {inquiries.some(i => i.status === 'unread') && (
                      <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse"></span>
                    )}
                  </button>
                </div>
                <h3 className="text-lg font-black text-slate-900 mt-2">
                  {activeTab === 'attendees' ? 'Live Attendee Feed & Gate Logs' : 'Attendee Inquiries & Messages Inbox'}
                </h3>
                <p className="text-xs text-slate-500">
                  {activeTab === 'attendees'
                    ? 'Real-time check-ins, transfers, and approval statuses'
                    : 'Questions received from the event detail page contact form'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/organizer/analytics"
                  className="rounded-xl border border-teal-200 bg-teal-50/70 hover:bg-teal-50 px-3.5 py-2 text-xs font-bold text-[#0F766E] flex items-center gap-1.5 shadow-sm transition"
                >
                  <BarChart3 className="h-3.5 w-3.5 text-[#0F766E]" />
                  <span>Deep Analytics</span>
                </Link>
                <Link
                  href="/organizer/analytics"
                  className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 shadow-sm transition"
                >
                  <Download className="h-3.5 w-3.5 text-[#0F766E]" />
                  <span>Export CSV</span>
                </Link>
              </div>
            </div>

            {/* TAB 1: ATTENDEE FEED */}
            {activeTab === 'attendees' && (
              <>
                {/* Filter and Search Bar */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Filter attendees by name, email, or pass ID..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0F766E]"
                    />
                  </div>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-700 bg-white focus:outline-none focus:border-[#0F766E]"
                  >
                    <option value="all">All Statuses</option>
                    <option value="checked in">Checked In</option>
                    <option value="transferred">Transferred</option>
                    <option value="approved">Approved</option>
                    <option value="waitlist">Waitlist</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>

                {/* Attendees Table */}
                <div className="overflow-x-auto rounded-2xl border border-slate-100">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-[#FAFAF9] text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="p-3.5">Ticket ID</th>
                        <th className="p-3.5">Attendee</th>
                        <th className="p-3.5">Pass Category</th>
                        <th className="p-3.5">Gate Status</th>
                        <th className="p-3.5 text-right">Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <AnimatePresence>
                        {filteredRegistrations.map((reg) => (
                          <motion.tr 
                            key={reg.id} 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="hover:bg-slate-50/80 transition"
                          >
                            <td className="p-3.5 font-mono font-bold text-[#0F766E] text-[11px]">
                              <div className="flex items-center gap-1.5">
                                <span>{reg.id}</span>
                                {reg.isLive && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-100 text-emerald-800 font-extrabold uppercase tracking-wider border border-emerald-300">
                                    Realtime
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="p-3.5">
                              <div className="font-bold text-slate-900">{reg.name}</div>
                              <div className="text-[10px] text-slate-400">{reg.email}</div>
                            </td>
                            <td className="p-3.5 font-medium text-slate-700">{reg.ticket}</td>
                            <td className="p-3.5">
                              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${getStatusBadge(reg.status)}`}>
                                {reg.status === 'Checked In' && <CheckCircle2 className="h-3 w-3" />}
                                {reg.status} {reg.checkinTime !== '-' && `(${reg.checkinTime})`}
                              </span>
                            </td>
                            <td className="p-3.5 font-extrabold text-slate-900 text-right">
                              {reg.price === 0 ? 'FREE' : `₹${reg.price.toLocaleString()}`}
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* TAB 2: INQUIRIES & MESSAGES INBOX */}
            {activeTab === 'inquiries' && (
              <div className="space-y-4">
                {/* Search & Status */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={inquirySearch}
                      onChange={(e) => setInquirySearch(e.target.value)}
                      placeholder="Search inquiries by attendee name, email, subject, or message..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#F97316]"
                    />
                  </div>

                  <select
                    value={inquiryStatusFilter}
                    onChange={(e) => setInquiryStatusFilter(e.target.value)}
                    className="rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-700 bg-white focus:outline-none focus:border-[#F97316]"
                  >
                    <option value="all">All Queries ({inquiries.length})</option>
                    <option value="unread">Unread Only</option>
                    <option value="replied">Replied</option>
                  </select>
                </div>

                {/* Inquiry Cards List */}
                <div className="space-y-3">
                  {inquiries
                    .filter((inq) => {
                      const matches = 
                        inq.senderName.toLowerCase().includes(inquirySearch.toLowerCase()) ||
                        inq.senderEmail.toLowerCase().includes(inquirySearch.toLowerCase()) ||
                        (inq.subject && inq.subject.toLowerCase().includes(inquirySearch.toLowerCase())) ||
                        inq.message.toLowerCase().includes(inquirySearch.toLowerCase()) ||
                        inq.eventTitle.toLowerCase().includes(inquirySearch.toLowerCase());
                      const matchesStatus = inquiryStatusFilter === 'all' || inq.status === inquiryStatusFilter;
                      return matches && matchesStatus;
                    })
                    .map((inq) => (
                      <div
                        key={inq.id}
                        className={`p-4 sm:p-5 rounded-2xl border transition ${
                          inq.status === 'unread'
                            ? 'bg-amber-50/50 border-amber-300 ring-1 ring-amber-200'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-slate-900">{inq.senderName}</span>
                              <span className="text-[11px] text-slate-500 font-mono">({inq.senderEmail})</span>
                              {inq.status === 'unread' ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-700 border border-rose-200">
                                  New Query
                                </span>
                              ) : inq.status === 'replied' ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-700 border border-emerald-200">
                                  Replied
                                </span>
                              ) : null}
                            </div>
                            <div className="text-[11px] text-[#0F766E] font-semibold mt-0.5 flex items-center gap-1.5">
                              <span>Event: {inq.eventTitle}</span>
                              {inq.senderPhone && (
                                <span className="text-slate-400">· Tel: {inq.senderPhone}</span>
                              )}
                            </div>
                          </div>

                          <div className="text-[11px] text-slate-400 font-medium shrink-0">
                            {new Date(inq.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>

                        {/* Query Content */}
                        <div className="mt-3 space-y-1.5">
                          {inq.subject && (
                            <h5 className="text-xs font-bold text-slate-900">
                              Subject: {inq.subject}
                            </h5>
                          )}
                          <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                            {inq.message}
                          </p>
                        </div>

                        {/* Previous reply if exists */}
                        {inq.replyContent && (
                          <div className="mt-3 p-3 bg-teal-50 border border-teal-200 rounded-xl space-y-1">
                            <div className="text-[11px] font-bold text-teal-800 flex items-center gap-1.5">
                              <CornerDownRight className="h-3.5 w-3.5 text-teal-600" />
                              <span>Your Reply (Sent to {inq.senderEmail})</span>
                              {inq.repliedAt && (
                                <span className="text-[10px] text-teal-600 font-normal">
                                  · {new Date(inq.repliedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-teal-900 pl-5 leading-relaxed">{inq.replyContent}</p>
                          </div>
                        )}

                        {/* Reply Action */}
                        <div className="mt-3 pt-2.5 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => {
                              if (replyingInquiryId === inq.id) {
                                setReplyingInquiryId(null);
                              } else {
                                setReplyingInquiryId(inq.id);
                                setReplyText('');
                              }
                            }}
                            className="text-xs font-bold text-[#F97316] hover:text-[#ea580c] flex items-center gap-1.5 transition"
                          >
                            <Reply className="h-3.5 w-3.5" />
                            <span>{replyingInquiryId === inq.id ? 'Cancel Reply' : inq.replyContent ? 'Send Another Reply' : 'Reply to Attendee'}</span>
                          </button>

                          <a
                            href={`mailto:${inq.senderEmail}?subject=Re: ${encodeURIComponent(inq.subject || inq.eventTitle)}`}
                            className="text-[11px] font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1"
                          >
                            <Mail className="h-3 w-3" />
                            <span>Open in Mail App</span>
                          </a>
                        </div>

                        {/* Inline Reply Box */}
                        {replyingInquiryId === inq.id && (
                          <div className="mt-3 pt-3 border-t border-slate-200 space-y-2">
                            <textarea
                              rows={3}
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder={`Type your response to ${inq.senderName}...`}
                              className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-[#F97316]"
                            ></textarea>
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setReplyingInquiryId(null)}
                                className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 rounded-lg"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                disabled={isSubmittingReply || !replyText.trim()}
                                onClick={() => handleSendReply(inq.id)}
                                className="px-4 py-1.5 text-xs font-bold bg-[#F97316] hover:bg-[#ea580c] text-white rounded-lg shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                              >
                                {isSubmittingReply ? (
                                  <span>Sending...</span>
                                ) : (
                                  <>
                                    <Send className="h-3.5 w-3.5" />
                                    <span>Send Response</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                  {inquiries.length === 0 && (
                    <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-2xl border border-slate-200">
                      <MessageSquare className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                      <p className="text-xs font-medium">No attendee inquiries received yet.</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">When attendees submit questions from your event pages, they will appear here in real time.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>

          {/* Settlement & Payout Summary Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="space-y-6"
          >
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-[#0F766E]" />
                  <span>Settlement & Payouts</span>
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200 uppercase">
                  Verified
                </span>
              </div>

              <div className="space-y-3.5 text-xs text-slate-600">
                <div className="flex justify-between items-center">
                  <span>Gross Ticket Sales</span>
                  <span className="font-black text-slate-900 text-sm">₹18,45,000</span>
                </div>
                <div className="flex justify-between items-center text-slate-500">
                  <span>Platform Processing (3.5%)</span>
                  <span>-₹64,575</span>
                </div>
                <div className="flex justify-between items-center text-slate-500">
                  <span>GST Retained (18%)</span>
                  <span>-₹3,32,100</span>
                </div>
                <div className="pt-4 border-t border-slate-200 flex justify-between items-center text-sm font-black text-slate-900">
                  <span>Net Payout Ready</span>
                  <span className="text-[#0F766E] text-lg font-black">₹14,48,325</span>
                </div>
              </div>

              {/* Direct bank settlement card */}
              <div className="rounded-2xl bg-gradient-to-br from-[#0F766E]/10 via-[#0F766E]/5 to-transparent p-4 border border-[#0F766E]/20 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#0F766E]">
                  <Check className="h-4 w-4" />
                  <span>Instant UPI / NEFT Payout Active</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Next scheduled batch settlement executes automatically to your linked HDFC Bank Account ending in <strong>*4892</strong>.
                </p>
              </div>

              {/* Action scanner shortcut */}
              <Link
                href="/organizer/scanner"
                className="w-full rounded-2xl bg-[#0F172A] hover:bg-slate-800 text-white p-4 font-bold text-xs flex items-center justify-between transition shadow-md group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-white/10 group-hover:scale-110 transition-transform">
                    <QrCode className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <h5 className="text-white text-xs font-bold">Fast Gate Scanner</h5>
                    <span className="text-[10px] text-slate-400">Scan tickets with camera</span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
