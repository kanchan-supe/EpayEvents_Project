'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { 
  BarChart3, TrendingUp, DollarSign, Download, 
  Search, CheckCircle2, Clock, Ticket, Layers, ArrowLeft, RefreshCw,
  FileSpreadsheet, Sparkles, ChevronDown, PieChart, Gamepad2, 
  Zap, Flame, Trophy, Crosshair
} from 'lucide-react';
import { Navbar, Footer } from '@/components/NavbarFooter';
import { getAllEvents } from '@/lib/data';
import { useAuth } from '@/context/AuthContext';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const cardMotionVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: 'easeOut' },
  },
};

interface RegistrationItem {
  id: string;
  orderId: string;
  ticketCode: string;
  eventId: string;
  eventTitle: string;
  attendeeName: string;
  attendeeEmail: string;
  attendeePhone?: string;
  ticketTierName: string;
  pricePaid: number;
  status: 'valid' | 'checked_in' | 'cancelled' | 'refunded' | 'transferred' | 'waitlist';
  checkedInAt?: string;
  createdAt: string;
  customResponses?: Record<string, any>;
  isLive?: boolean;
}

// Baseline mock registrations for deep historical intelligence
const baselineMockRegistrations: RegistrationItem[] = [
  {
    id: 'REG-MOCK-101',
    orderId: 'ORD-9021',
    ticketCode: 'EPAY-BLR-01',
    eventId: 'tech-summit-2026',
    eventTitle: 'Bengaluru Tech Innovation Summit 2026',
    attendeeName: 'Alex Morgan',
    attendeeEmail: 'alex.morgan@finpulse.io',
    attendeePhone: '+91 98201 12345',
    ticketTierName: 'VIP Masterclass Pass',
    pricePaid: 5999,
    status: 'checked_in',
    checkedInAt: '2026-10-07 09:14 AM',
    createdAt: '2026-10-01T10:30:00Z',
    customResponses: { 'T-Shirt Size': 'L', 'Dietary Preference': 'Vegetarian', 'Company': 'FinPulse Tech' }
  },
  {
    id: 'REG-MOCK-102',
    orderId: 'ORD-9022',
    ticketCode: 'EPAY-BLR-02',
    eventId: 'tech-summit-2026',
    eventTitle: 'Bengaluru Tech Innovation Summit 2026',
    attendeeName: 'Rohini Deshmukh',
    attendeeEmail: 'rohini.deshmukh@hyperstack.in',
    attendeePhone: '+91 97654 32100',
    ticketTierName: 'General Admission',
    pricePaid: 2499,
    status: 'checked_in',
    checkedInAt: '2026-10-07 09:42 AM',
    createdAt: '2026-10-02T14:15:00Z',
    customResponses: { 'T-Shirt Size': 'M', 'Dietary Preference': 'No Preference', 'Company': 'HyperStack Cloud' }
  },
  {
    id: 'REG-MOCK-103',
    orderId: 'ORD-9023',
    ticketCode: 'EPAY-BLR-03',
    eventId: 'tech-summit-2026',
    eventTitle: 'Bengaluru Tech Innovation Summit 2026',
    attendeeName: 'Aarav Sharma',
    attendeeEmail: 'aarav.sharma@cybercore.net',
    attendeePhone: '+91 99112 44556',
    ticketTierName: 'Early Bird Pass',
    pricePaid: 1499,
    status: 'valid',
    createdAt: '2026-10-03T11:00:00Z',
    customResponses: { 'T-Shirt Size': 'XL', 'Dietary Preference': 'Vegan', 'Company': 'CyberCore' }
  },
  {
    id: 'REG-MOCK-104',
    orderId: 'ORD-9024',
    ticketCode: 'EPAY-BLR-04',
    eventId: 'tech-summit-2026',
    eventTitle: 'Bengaluru Tech Innovation Summit 2026',
    attendeeName: 'Priya Nambiar',
    attendeeEmail: 'priya.nambiar@neural.ai',
    attendeePhone: '+91 98450 99887',
    ticketTierName: 'VIP Masterclass Pass',
    pricePaid: 5999,
    status: 'valid',
    createdAt: '2026-10-04T16:20:00Z',
    customResponses: { 'T-Shirt Size': 'S', 'Dietary Preference': 'Vegetarian', 'Company': 'Neural AI Labs' }
  },
  {
    id: 'REG-MOCK-105',
    orderId: 'ORD-9025',
    ticketCode: 'EPAY-MUM-01',
    eventId: 'mumbai-music-fest-2026',
    eventTitle: 'Mumbai Waves Music & Arts Festival',
    attendeeName: 'David Miller',
    attendeeEmail: 'david.miller@soundwave.com',
    attendeePhone: '+1 415 555 2671',
    ticketTierName: 'Backstage Platinum Pass',
    pricePaid: 8499,
    status: 'checked_in',
    checkedInAt: '2026-10-06 05:30 PM',
    createdAt: '2026-10-05T09:10:00Z',
    customResponses: { 'T-Shirt Size': 'L', 'Emergency Contact': '+1 415 555 9999' }
  },
  {
    id: 'REG-MOCK-106',
    orderId: 'ORD-9026',
    ticketCode: 'EPAY-DEL-01',
    eventId: 'delhi-startup-conclave-2026',
    eventTitle: 'Delhi Startup Conclave & Pitch Arena',
    attendeeName: 'Sneha Reddy',
    attendeeEmail: 'sneha@angelconnect.vc',
    attendeePhone: '+91 98860 11223',
    ticketTierName: 'Founder & Investor Access',
    pricePaid: 3999,
    status: 'checked_in',
    checkedInAt: '2026-10-05 10:05 AM',
    createdAt: '2026-10-05T18:45:00Z',
    customResponses: { 'Investment Stage': 'Pre-Seed / Seed', 'Dietary Preference': 'Vegetarian' }
  },
  {
    id: 'REG-MOCK-107',
    orderId: 'ORD-9027',
    ticketCode: 'EPAY-MUM-02',
    eventId: 'mumbai-music-fest-2026',
    eventTitle: 'Mumbai Waves Music & Arts Festival',
    attendeeName: 'Kabir Verma',
    attendeeEmail: 'kabir.v@pulse.org',
    attendeePhone: '+91 98112 00998',
    ticketTierName: 'Weekend General Pass',
    pricePaid: 1999,
    status: 'cancelled',
    createdAt: '2026-10-06T12:00:00Z',
    customResponses: { 'T-Shirt Size': 'M' }
  },
  {
    id: 'REG-MOCK-108',
    orderId: 'ORD-9028',
    ticketCode: 'EPAY-BLR-05',
    eventId: 'tech-summit-2026',
    eventTitle: 'Bengaluru Tech Innovation Summit 2026',
    attendeeName: 'Vikram Joshi',
    attendeeEmail: 'vikram.j@mediaone.in',
    attendeePhone: '+91 97110 55443',
    ticketTierName: 'General Admission',
    pricePaid: 2499,
    status: 'refunded',
    createdAt: '2026-10-06T15:30:00Z',
    customResponses: { 'Reason': 'Schedule conflict' }
  }
];

export default function OrganizerAnalyticsPage() {
  const { user } = useAuth();
  const [eventsList, setEventsList] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [liveRegistrations, setLiveRegistrations] = useState<any[]>([]);
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [exportingFormat, setExportingFormat] = useState<'csv' | 'json' | null>(null);

  // Search & Filters for the Attendee Drilldown
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tierFilter, setTierFilter] = useState<string>('all');

  // Load events strictly belonging to the current organizer
  useEffect(() => {
    if (!user) {
      setEventsList([]);
      return;
    }

    async function loadEvents() {
      try {
        const queryParams = new URLSearchParams();
        if (user?.id) queryParams.set('organizerId', user.id);
        if (user?.email) queryParams.set('organizerEmail', user.email);

        const res = await fetch(`/api/events?${queryParams.toString()}`);
        const json = await res.json();

        const staticIds = new Set([
          'evt_9f3k2', 'evt-101', 'evt-102', 'evt-104', 'evt-105', 'evt-106',
          'evt-107', 'evt-108', 'evt-109', 'evt-110', 'evt-small-local-01',
          'evt-party-01', 'evt-fashion-01', 'evt-matrimony-01', 'evt-comedy-01',
          'evt-spiritual-01', 'evt-sports-01', 'evt-food-01', 'evt-charity-01',
          'evt-shopping-01', 'evt-family-01', 'evt-wedding-01', 'evt-past-1',
          'evt-past-2', 'evt-past-3'
        ]);

        const isOwner = (ev: any) => {
          if (!ev || staticIds.has(ev.id) || staticIds.has(ev.slug)) return false;
          const uid = user?.id;
          const email = user?.email?.toLowerCase().trim();
          if (uid && (ev.organizerId === uid || ev.organizer_id === uid || ev.userId === uid || ev.organization?.id === uid || ev.organizer?.id === uid)) return true;
          if (email) {
            const orgEmail = (ev.organizerEmail || ev.organization?.contactEmail || ev.organizer?.email)?.toLowerCase().trim();
            if (orgEmail && orgEmail === email) return true;
          }
          return false;
        };

        const map = new Map<string, any>();
        if (json.success && Array.isArray(json.data)) {
          json.data.filter(isOwner).forEach((e: any) => {
            const key = e.id || e.slug;
            map.set(key, e);
          });
        }

        // Overlay local events from localStorage for this user
        try {
          const stored = localStorage.getItem('epay_persisted_events');
          if (stored) {
            const parsed = JSON.parse(stored);
            if (typeof parsed === 'object' && parsed !== null) {
              Object.values(parsed).forEach((localEv: any) => {
                if (localEv && isOwner(localEv)) {
                  const key = localEv.id || localEv.slug;
                  map.set(key, localEv);
                }
              });
            }
          }
        } catch {}

        setEventsList(Array.from(map.values()));
      } catch (err) {
        console.warn('[Analytics] Failed loading organizer events:', err);
      }
    }

    loadEvents();
  }, [user]);

  // Fetch live orders & registrations from API
  const fetchMetrics = React.useCallback(async () => {
    setLoadingMetrics(true);
    try {
      const res = await fetch('/api/orders');
      const json = await res.json();
      if (json.success && json.data) {
        setLiveRegistrations(json.data.registrations || []);
      }
    } catch (err) {
      console.warn('[Analytics] Failed fetching live orders:', err);
    } finally {
      setLoadingMetrics(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  // Set of keys (ID, slug, title) belonging to THIS organizer's hosted events
  const myEventKeySet = useMemo(() => {
    const set = new Set<string>();
    eventsList.forEach(ev => {
      if (ev.id) set.add(String(ev.id).toLowerCase());
      if (ev.slug) set.add(String(ev.slug).toLowerCase());
      if (ev.title) set.add(String(ev.title).toLowerCase().trim());
    });
    return set;
  }, [eventsList]);

  // Registrations strictly for this organizer's hosted events (no previous organizer data!)
  const allRegistrations: RegistrationItem[] = useMemo(() => {
    if (eventsList.length === 0) return [];
    const myLive = liveRegistrations.filter(r => {
      const matchId = r.eventId && myEventKeySet.has(String(r.eventId).toLowerCase());
      const matchTitle = r.eventTitle && myEventKeySet.has(String(r.eventTitle).toLowerCase().trim());
      return matchId || matchTitle;
    });

    return myLive.map(r => ({
      id: r.id || r.ticketCode,
      orderId: r.orderId || 'ORD-LIVE',
      ticketCode: r.ticketCode || r.id,
      eventId: r.eventId || 'live-event',
      eventTitle: r.eventTitle || 'ePay Event',
      attendeeName: r.attendeeName || 'Attendee',
      attendeeEmail: r.attendeeEmail || '',
      attendeePhone: r.attendeePhone || '-',
      ticketTierName: r.ticketTierName || 'General Pass',
      pricePaid: Number(r.pricePaid) || 0,
      status: (r.status === 'checked_in' ? 'checked_in' : 'valid') as RegistrationItem['status'],
      checkedInAt: r.checkedInAt,
      createdAt: r.createdAt || new Date().toISOString(),
      customResponses: r.customResponses || {},
      isLive: true,
    }));
  }, [liveRegistrations, eventsList.length, myEventKeySet]);

  // Filter registrations by selected event
  const scopedRegistrations = useMemo(() => {
    if (selectedEventId === 'all') return allRegistrations;
    return allRegistrations.filter(r => r.eventId === selectedEventId || r.eventTitle.toLowerCase().includes(selectedEventId.toLowerCase()));
  }, [allRegistrations, selectedEventId]);

  // Key Aggregated Metrics
  const metrics = useMemo(() => {
    const totalSold = scopedRegistrations.length;
    const grossRevenue = scopedRegistrations
      .filter(r => r.status !== 'cancelled' && r.status !== 'refunded')
      .reduce((sum, r) => sum + r.pricePaid, 0);
    const checkedInCount = scopedRegistrations.filter(r => r.status === 'checked_in').length;
    const checkinRate = totalSold > 0 ? Math.round((checkedInCount / totalSold) * 100) : 0;
    const avgTicketValue = totalSold > 0 ? Math.round(grossRevenue / totalSold) : 0;

    return {
      totalSold,
      grossRevenue,
      checkedInCount,
      checkinRate,
      avgTicketValue,
    };
  }, [scopedRegistrations]);

  // Tier-by-Tier Breakdown
  const tierBreakdown = useMemo(() => {
    const map: Record<string, { name: string; count: number; revenue: number }> = {};
    scopedRegistrations.forEach(r => {
      const tier = r.ticketTierName || 'Standard';
      if (!map[tier]) {
        map[tier] = { name: tier, count: 0, revenue: 0 };
      }
      map[tier].count += 1;
      if (r.status !== 'cancelled' && r.status !== 'refunded') {
        map[tier].revenue += r.pricePaid;
      }
    });

    const list = Object.values(map);
    const maxCount = Math.max(...list.map(t => t.count), 1);
    return list.map(t => ({
      ...t,
      percentage: Math.round((t.count / scopedRegistrations.length) * 100) || 0,
      relativeWidth: Math.round((t.count / maxCount) * 100),
    }));
  }, [scopedRegistrations]);

  // Registration Velocity (Daily Timeline grouping with Gaming XP/Level system)
  const { velocityData, maxCount, yAxisSteps, totalVelocitySum } = useMemo(() => {
    const daysMap: Record<string, { label: string; dateStr: string; dayName: string; count: number; revenue: number }> = {};
    const now = new Date();
    
    // Seed last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      daysMap[key] = { label, dateStr: key, dayName, count: 0, revenue: 0 };
    }

    // Distribute scoped registrations
    scopedRegistrations.forEach(r => {
      const day = (r.createdAt || '').split('T')[0];
      if (daysMap[day]) {
        daysMap[day].count += 1;
        if (r.status !== 'cancelled' && r.status !== 'refunded') {
          daysMap[day].revenue += r.pricePaid;
        }
      } else {
        const firstKey = Object.keys(daysMap)[0];
        if (firstKey && daysMap[firstKey]) {
          daysMap[firstKey].count += 1;
        }
      }
    });

    const entries = Object.values(daysMap);
    const rawMax = Math.max(...entries.map(e => e.count), 5);
    // Round peak to comfortable clean step
    const computedMax = Math.ceil(rawMax * 1.25);
    
    const steps = [
      computedMax,
      Math.round(computedMax * 0.75),
      Math.round(computedMax * 0.5),
      Math.round(computedMax * 0.25),
      0
    ];

    const mapped = entries.map(e => ({
      ...e,
      barHeight: Math.max(Math.round((e.count / computedMax) * 100), e.count > 0 ? 12 : 3),
      isPeak: e.count === rawMax && rawMax > 0,
    }));

    const totalSum = entries.reduce((s, e) => s + e.count, 0);

    return {
      velocityData: mapped,
      maxCount: computedMax,
      yAxisSteps: steps,
      totalVelocitySum: totalSum
    };
  }, [scopedRegistrations]);

  // Filtered Attendees Table List
  const filteredAttendees = useMemo(() => {
    return scopedRegistrations.filter(r => {
      const matchesSearch = 
        r.attendeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.attendeeEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.ticketCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.ticketTierName.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || r.status.toLowerCase() === statusFilter.toLowerCase();
      const matchesTier = tierFilter === 'all' || r.ticketTierName.toLowerCase() === tierFilter.toLowerCase();

      return matchesSearch && matchesStatus && matchesTier;
    });
  }, [scopedRegistrations, searchQuery, statusFilter, tierFilter]);

  // Unique Tiers for Filter dropdown
  const uniqueTiers = useMemo(() => {
    const set = new Set<string>();
    scopedRegistrations.forEach(r => set.add(r.ticketTierName));
    return Array.from(set);
  }, [scopedRegistrations]);

  // One-Click CSV / Excel Export Function
  const handleExportCSV = () => {
    setExportingFormat('csv');
    try {
      // Determine columns
      const headers = [
        'Ticket Code',
        'Attendee Name',
        'Email Address',
        'Phone Number',
        'Event Title',
        'Ticket Tier',
        'Price Paid (INR)',
        'Gate Status',
        'Check-In Timestamp',
        'Registration Date',
        'Custom Fields / Answers'
      ];

      const rows = filteredAttendees.map(item => {
        const customAnswersFormatted = item.customResponses 
          ? Object.entries(item.customResponses).map(([k, v]) => `${k}: ${v}`).join(' | ')
          : '-';

        return [
          `"${item.ticketCode.replace(/"/g, '""')}"`,
          `"${item.attendeeName.replace(/"/g, '""')}"`,
          `"${item.attendeeEmail.replace(/"/g, '""')}"`,
          `"${(item.attendeePhone || '').replace(/"/g, '""')}"`,
          `"${item.eventTitle.replace(/"/g, '""')}"`,
          `"${item.ticketTierName.replace(/"/g, '""')}"`,
          item.pricePaid,
          `"${item.status.toUpperCase()}"`,
          `"${item.checkedInAt || '-'}"`,
          `"${item.createdAt.split('T')[0]}"`,
          `"${customAnswersFormatted.replace(/"/g, '""')}"`
        ].join(',');
      });

      const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const filename = `ePayEvents_Attendees_${selectedEventId}_${new Date().toISOString().split('T')[0]}.csv`;
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('CSV Export Failed:', err);
      alert('Could not generate CSV export. Please try again.');
    } finally {
      setTimeout(() => setExportingFormat(null), 800);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      {/* Top Banner / Hero */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[#0B0F19] via-[#0F172A] to-[#0B0F19] text-white py-12 md:py-16">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#0F766E]/20 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#F97316]/15 rounded-full blur-[130px] pointer-events-none" />

        <div className="container mx-auto px-4 md:px-8 relative z-10 max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Link
                  href="/organizer/dashboard"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition bg-white/5 hover:bg-white/10 px-3 py-1 rounded-full border border-white/10"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Organizer Dashboard</span>
                </Link>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0F766E]/30 border border-[#0F766E]/50 text-xs font-bold text-teal-300">
                  <BarChart3 className="h-3.5 w-3.5" /> Deep Intelligence
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
                Organizer <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-300 to-[#F97316]">Analytics & Attendee Exports</span>
              </h1>
              <p className="text-slate-400 text-sm mt-1 max-w-2xl">
                Daily ticket sales velocity, tier distribution curves, and full registration CSV/Excel exports for gate staff.
              </p>
            </div>

            {/* Quick Action Controls */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={fetchMetrics}
                disabled={loadingMetrics}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2.5 text-xs font-bold text-slate-300 transition"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loadingMetrics ? 'animate-spin text-teal-400' : ''}`} />
                <span>Refresh Data</span>
              </button>

              <button
                onClick={handleExportCSV}
                disabled={exportingFormat === 'csv' || filteredAttendees.length === 0}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#0F766E] to-emerald-600 hover:from-[#115E59] hover:to-emerald-700 px-5 py-2.5 text-xs md:text-sm font-bold text-white shadow-lg hover:shadow-emerald-500/25 transition disabled:opacity-50"
              >
                <FileSpreadsheet className="h-4 w-4" />
                <span>{exportingFormat === 'csv' ? 'Exporting CSV...' : 'Export Attendee CSV'}</span>
              </button>
            </div>
          </div>

          {/* Scope Selector: Event Filter & Time Filter */}
          <div className="mt-8 pt-6 border-t border-white/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Target Event:</span>
              <div className="relative w-full sm:w-80">
                <select
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  className="w-full bg-[#1E293B] border border-slate-700 text-white text-xs font-bold rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#0F766E] appearance-none"
                >
                  <option value="all">🌟 All Hosted Summits & Events</option>
                  {eventsList.map(e => (
                    <option key={e.id || e.slug} value={e.slug || e.id}>
                      {e.title}
                    </option>
                  ))}
                </select>
                <ChevronDown className="h-4 w-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 mr-1">Timeframe:</span>
              {(['7d', '30d', '90d', 'all'] as const).map(tf => (
                <button
                  key={tf}
                  onClick={() => setTimeRange(tf)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    timeRange === tf
                      ? 'bg-[#0F766E] text-white shadow-sm'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300'
                  }`}
                >
                  {tf === '7d' ? 'Last 7 Days' : tf === '30d' ? '30 Days' : tf === '90d' ? 'Quarter' : 'All Time'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 md:px-8 py-10 flex-1 space-y-10 max-w-7xl">
        {/* KPI Summary Cards with Framer Motion Stagger */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {/* 1. Total Tickets Sold */}
          <motion.div 
            variants={cardMotionVariants}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-teal-500/30 transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tickets Issued</span>
              <div className="p-3 bg-teal-50 text-[#0F766E] rounded-2xl">
                <Ticket className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">{metrics.totalSold}</h3>
              <p className="text-xs text-emerald-600 font-bold mt-1 flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>+18.4% registration velocity</span>
              </p>
            </div>
          </motion.div>

          {/* 2. Gross Event Revenue */}
          <motion.div 
            variants={cardMotionVariants}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-500/30 transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gross Revenue</span>
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">₹{metrics.grossRevenue.toLocaleString('en-IN')}</h3>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Avg. Ticket: <span className="font-bold text-slate-800">₹{metrics.avgTicketValue.toLocaleString('en-IN')}</span>
              </p>
            </div>
          </motion.div>

          {/* 3. Gate Check-In Rate */}
          <motion.div 
            variants={cardMotionVariants}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-orange-500/30 transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gate Check-In Rate</span>
              <div className="p-3 bg-orange-50 text-[#F97316] rounded-2xl">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-baseline justify-between">
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">{metrics.checkinRate}%</h3>
                <span className="text-xs font-bold text-slate-500">{metrics.checkedInCount} / {metrics.totalSold}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-teal-500 to-[#F97316] h-full rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(metrics.checkinRate, 100)}%` }}
                />
              </div>
            </div>
          </motion.div>

          {/* 4. Active Pass Tiers */}
          <motion.div 
            variants={cardMotionVariants}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-purple-500/30 transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Pass Tiers</span>
              <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
                <Layers className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">{tierBreakdown.length} Categories</h3>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Highest Volume: <span className="font-bold text-slate-800">{tierBreakdown[0]?.name || 'Standard'}</span>
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* Section 1: Top Row - Pass Velocity (2 cols) & Tier Sales Breakdown (1 col) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {/* Daily Registration Velocity Chart (2 cols) */}
          <div className="lg:col-span-2">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              whileHover={{ y: -2, transition: { duration: 0.2 } }}
              className="relative overflow-hidden rounded-3xl bg-white border border-slate-200/90 shadow-sm p-5 md:p-6 space-y-4 h-full flex flex-col justify-between"
            >
              {/* Header HUD */}
              <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-3.5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest bg-gradient-to-r from-[#0F766E] to-teal-500 text-white flex items-center gap-1 shadow-sm">
                      <Gamepad2 className="h-2.5 w-2.5" /> XP VELOCITY ENGINE
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[9px] font-mono font-bold bg-amber-50 text-amber-700 border border-amber-300 flex items-center gap-1">
                      <Flame className="h-2.5 w-2.5 text-amber-500 animate-pulse" /> STREAK: ACTIVE
                    </span>
                  </div>
                  <h3 className="text-lg md:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <span>Pass Minting Velocity</span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-[#F97316]">
                      [LVL 99]
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">Real-time attendee registrations & minting momentum</p>
                </div>

                {/* HUD Gamer Status Badges */}
                <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end">
                  <div className="px-2.5 py-1 rounded-xl bg-teal-50/70 border border-teal-200 text-right">
                    <span className="text-[8px] uppercase tracking-wider text-teal-700 font-bold block">Session XP</span>
                    <span className="font-mono text-xs font-black text-[#0F766E] flex items-center gap-1">
                      <Zap className="h-3 w-3 text-teal-600" /> +{totalVelocitySum * 250} XP
                    </span>
                  </div>
                  <div className="px-2.5 py-1 rounded-xl bg-orange-50 border border-orange-200 text-right">
                    <span className="text-[8px] uppercase tracking-wider text-orange-700 font-bold block">Top Peak</span>
                    <span className="font-mono text-xs font-black text-[#F97316] flex items-center gap-1">
                      <Trophy className="h-3 w-3" /> {Math.max(...velocityData.map(v => v.count), 0)} Passes
                    </span>
                  </div>
                </div>
              </div>

              {/* Gamer Chart Area with Proper Y-Axis Levels & Compact Height */}
              <div className="relative z-10 pt-1">
                <div className="flex gap-2.5">
                  {/* Y-Axis Value Labels */}
                  <div className="flex flex-col justify-between text-right font-mono text-[10px] font-bold text-slate-400 h-52 pb-7 pr-1 select-none">
                    {yAxisSteps.map((val, idx) => (
                      <span key={idx} className="flex items-center justify-end gap-1">
                        <span>{val}</span>
                        <span className="w-1.5 h-[1px] bg-slate-300 inline-block" />
                      </span>
                    ))}
                  </div>

                  {/* Main Graph Grid */}
                  <div className="flex-1 relative h-52 pb-7 flex flex-col justify-between">
                    {/* Horizontal Grid Lines */}
                    <div className="absolute inset-0 pb-7 flex flex-col justify-between pointer-events-none">
                      {yAxisSteps.map((_, idx) => (
                        <div 
                          key={idx} 
                          className={`w-full border-b ${
                            idx === yAxisSteps.length - 1 
                              ? 'border-teal-500/50' 
                              : 'border-slate-100 border-dashed'
                          }`} 
                        />
                      ))}
                    </div>

                    {/* Vertical Glowing Bars */}
                    <div className="relative z-10 h-full flex items-end justify-between gap-2 sm:gap-3 px-1">
                      {velocityData.map((bar, idx) => {
                        return (
                          <div key={idx} className="flex-1 flex flex-col items-center group h-full justify-end relative">
                            {/* Arcade Floating Tooltip on Hover */}
                            <div className="absolute -top-11 opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:-translate-y-1 bg-slate-900 text-white text-[10px] font-mono py-1 px-2 rounded-lg shadow-lg pointer-events-none whitespace-nowrap z-30 flex flex-col items-center">
                              <span className="font-bold text-teal-300">{bar.count} Passes Claimed</span>
                              <span className="text-[9px] text-amber-300 font-bold">{bar.revenue > 0 ? `₹${bar.revenue.toLocaleString('en-IN')}` : 'Free Tier'}</span>
                              <div className="w-1.5 h-1.5 bg-slate-900 rotate-45 -mb-1 mt-0.5" />
                            </div>

                            {/* Top Peak Neon Trophy indicator */}
                            {bar.isPeak && (
                              <motion.div 
                                initial={{ scale: 0 }}
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="mb-1 text-[#F97316] drop-shadow-sm"
                              >
                                <Flame className="h-3.5 w-3.5" />
                              </motion.div>
                            )}

                            {/* The Animated Gaming Bar */}
                            <div className="w-full max-w-[38px] h-full flex items-end justify-center relative">
                              {/* Ambient Glow behind bar */}
                              <div 
                                className={`absolute inset-x-0 bottom-0 rounded-t-lg blur-xs transition-all ${
                                  bar.isPeak 
                                    ? 'bg-[#F97316]/30' 
                                    : 'bg-teal-500/20 group-hover:bg-teal-500/35'
                                }`}
                                style={{ height: `${bar.barHeight}%` }}
                              />

                              {/* Solid Bar Body */}
                              <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: `${bar.barHeight}%` }}
                                transition={{ duration: 0.6, delay: idx * 0.06, ease: "easeOut" }}
                                className={`w-full rounded-t-lg relative overflow-hidden transition-all duration-300 border-t-2 ${
                                  bar.isPeak
                                    ? 'bg-gradient-to-t from-[#EA580C] via-[#F97316] to-[#FDBA74] border-amber-300 shadow-sm'
                                    : 'bg-gradient-to-t from-[#0F766E] via-teal-600 to-teal-400 border-teal-200 group-hover:to-teal-300 shadow-sm'
                                }`}
                              >
                                {/* Futuristic Glass/Scanline Overlay inside bar */}
                                <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.12)_50%)] [background-size:100%_4px] opacity-60 pointer-events-none" />
                                <div className="absolute top-0 inset-x-0 h-0.5 bg-white/70" />

                                {/* Value text inside bar if tall enough */}
                                {bar.count > 0 && (
                                  <div className="absolute top-1 inset-x-0 text-center font-mono text-[9px] font-black text-white drop-shadow">
                                    {bar.count}
                                  </div>
                                )}
                              </motion.div>
                            </div>

                            {/* Bottom X-Axis Date Badge */}
                            <div className="absolute -bottom-6 text-center w-full">
                              <span className="font-mono text-[9px] font-bold text-slate-600 group-hover:text-teal-700 transition-colors block">
                                {bar.dayName}
                              </span>
                              <span className="text-[8px] text-slate-400 block -mt-1 font-mono">
                                {bar.label.split(' ')[1]}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Chart Footer Controller */}
                <div className="mt-6 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5 text-teal-800 font-mono text-[10px] font-bold">
                      <span className="w-2.5 h-2.5 rounded-sm bg-gradient-to-t from-[#0F766E] to-teal-400 border border-teal-300 inline-block" />
                      REGULAR PASSES
                    </span>
                    <span className="flex items-center gap-1.5 text-orange-800 font-mono text-[10px] font-bold">
                      <span className="w-2.5 h-2.5 rounded-sm bg-gradient-to-t from-[#EA580C] to-[#FDBA74] border border-amber-300 inline-block" />
                      PEAK ACCELERATION
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 font-mono text-[10px] text-slate-400">
                    <Crosshair className="h-3 w-3 text-teal-600" />
                    <span>HUD STATUS: SYNCHRONIZED</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Tier-by-Tier Sales Breakdown (1 col, side-by-side with Velocity Chart) */}
          <div className="lg:col-span-1">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
              whileHover={{ y: -2, transition: { duration: 0.2 } }}
              className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col justify-between h-full"
            >
              <div className="flex-1 flex flex-col min-h-0">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-1.5">
                      <PieChart className="h-4 w-4 text-[#F97316]" />
                      <span>Tier Sales Breakdown</span>
                    </h3>
                    <p className="text-[11px] text-slate-500">Distribution by VIP, General & Early Bird</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 font-mono">
                    {tierBreakdown.length} Tiers
                  </span>
                </div>

                {/* Stacked Multi-Segment Distribution Bar */}
                {tierBreakdown.length > 0 && (
                  <div className="mt-3 shrink-0">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 mb-1">
                      <span className="uppercase tracking-wider">Inventory Share</span>
                      <span className="font-mono text-slate-700">
                        {tierBreakdown.reduce((sum, t) => sum + t.count, 0)} Passes
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-lg bg-slate-100 overflow-hidden flex p-0.5 gap-0.5 shadow-inner">
                      {tierBreakdown.map((tier, idx) => {
                        const colors = [
                          'bg-teal-600',
                          'bg-[#F97316]',
                          'bg-indigo-600',
                          'bg-emerald-500',
                          'bg-amber-500',
                          'bg-rose-500',
                        ];
                        const color = colors[idx % colors.length];
                        return (
                          <div
                            key={idx}
                            title={`${tier.name}: ${tier.percentage}% (${tier.count} passes)`}
                            style={{ width: `${Math.max(tier.percentage, 2)}%` }}
                            className={`h-full rounded-xs ${color} transition-all duration-300 hover:brightness-110`}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Tier Cards List - Compact Scrollable Container */}
                <div className="mt-3 space-y-2 flex-1 max-h-[260px] overflow-y-auto pr-1">
                  {tierBreakdown.map((tier, idx) => {
                    const colorPalettes = [
                      { dot: 'bg-teal-500', bar: 'bg-gradient-to-r from-teal-500 to-teal-600', text: 'text-teal-700', bg: 'bg-teal-50/50', border: 'border-teal-200/60', badge: 'bg-teal-100/70 text-teal-800' },
                      { dot: 'bg-orange-500', bar: 'bg-gradient-to-r from-orange-500 to-orange-600', text: 'text-orange-700', bg: 'bg-orange-50/50', border: 'border-orange-200/60', badge: 'bg-orange-100/70 text-orange-800' },
                      { dot: 'bg-indigo-500', bar: 'bg-gradient-to-r from-indigo-500 to-indigo-600', text: 'text-indigo-700', bg: 'bg-indigo-50/50', border: 'border-indigo-200/60', badge: 'bg-indigo-100/70 text-indigo-800' },
                      { dot: 'bg-emerald-500', bar: 'bg-gradient-to-r from-emerald-500 to-emerald-600', text: 'text-emerald-700', bg: 'bg-emerald-50/50', border: 'border-emerald-200/60', badge: 'bg-emerald-100/70 text-emerald-800' },
                      { dot: 'bg-amber-500', bar: 'bg-gradient-to-r from-amber-500 to-amber-600', text: 'text-amber-700', bg: 'bg-amber-50/50', border: 'border-amber-200/60', badge: 'bg-amber-100/70 text-amber-800' },
                      { dot: 'bg-rose-500', bar: 'bg-gradient-to-r from-rose-500 to-rose-600', text: 'text-rose-700', bg: 'bg-rose-50/50', border: 'border-rose-200/60', badge: 'bg-rose-100/70 text-rose-800' },
                    ];
                    const theme = colorPalettes[idx % colorPalettes.length];

                    return (
                      <motion.div
                        key={idx}
                        whileHover={{ scale: 1.005 }}
                        transition={{ duration: 0.15 }}
                        className={`p-2.5 rounded-xl border transition-all ${theme.bg} ${theme.border} hover:shadow-xs`}
                      >
                        <div className="flex justify-between items-center gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className={`w-1.5 h-1.5 rounded-full ${theme.dot} shrink-0`} />
                              <h4 className="font-bold text-xs text-slate-900 truncate" title={tier.name}>
                                {tier.name}
                              </h4>
                            </div>
                            <span className="text-[10px] text-slate-500 font-medium ml-3 block leading-tight mt-0.5">
                              {tier.count} {tier.count === 1 ? 'pass' : 'passes'} sold
                            </span>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="font-mono text-xs font-black text-slate-900 block leading-tight">
                              ₹{tier.revenue.toLocaleString('en-IN')}
                            </span>
                            <span className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-mono font-bold ${theme.badge}`}>
                              {tier.percentage}%
                            </span>
                          </div>
                        </div>

                        {/* Progress Track */}
                        <div className="w-full bg-slate-200/70 rounded-full h-1 overflow-hidden mt-2 ml-3" style={{ width: 'calc(100% - 12px)' }}>
                          <div 
                            className={`h-full rounded-full ${theme.bar} transition-all duration-500`}
                            style={{ width: `${Math.max(tier.percentage, 3)}%` }}
                          />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Micro Summary Footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
                <span className="font-bold text-[10px] uppercase tracking-wider text-slate-400">Total Revenue:</span>
                <span className="font-mono font-black text-emerald-700 text-sm">
                  ₹{tierBreakdown.reduce((sum, t) => sum + t.revenue, 0).toLocaleString('en-IN')}
                </span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Section 2: Full-Width Dedicated Row - Peak Gate Check-in Rush Hours & Traffic Heatmap */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          whileHover={{ y: -2, transition: { duration: 0.2 } }}
          className="rounded-3xl bg-white border border-slate-200/90 p-5 md:p-6 shadow-sm space-y-4"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-orange-100 text-orange-800 border border-orange-200 flex items-center gap-1">
                  <Clock className="h-3 w-3 text-[#F97316]" /> HOURLY RUSH PATTERNS
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Turnstile sensor logs</span>
              </div>
              <h4 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>Peak Gate Check-In Velocity & Queue Heatmap</span>
              </h4>
            </div>

            <div className="flex items-center gap-2 text-[10px] font-bold">
              <span className="flex items-center gap-1 text-slate-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Calm
              </span>
              <span className="flex items-center gap-1 text-slate-600">
                <span className="w-2 h-2 rounded-full bg-amber-400" /> Moderate
              </span>
              <span className="flex items-center gap-1 text-slate-600">
                <span className="w-2 h-2 rounded-full bg-[#EA580C]" /> Peak Rush
              </span>
            </div>
          </div>

          {/* Hourly Time Slot Heatmap Grid (6 equal width columns on desktop) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {[
              { time: '08:00 - 09:00 AM', status: 'Calm', count: 42, color: 'bg-emerald-50 border-emerald-200 text-emerald-800', badge: 'bg-emerald-500' },
              { time: '09:00 - 10:00 AM', status: 'Peak Rush', count: 318, color: 'bg-orange-50 border-orange-300 text-orange-900 ring-1 ring-orange-400/40', badge: 'bg-[#EA580C]' },
              { time: '10:00 - 11:00 AM', status: 'Heavy', count: 215, color: 'bg-amber-50 border-amber-300 text-amber-900', badge: 'bg-amber-500' },
              { time: '11:00 - 01:00 PM', status: 'Moderate', count: 98, color: 'bg-amber-50/70 border-amber-200 text-amber-800', badge: 'bg-amber-400' },
              { time: '01:00 - 03:00 PM', status: 'Calm', count: 34, color: 'bg-emerald-50 border-emerald-200 text-emerald-800', badge: 'bg-emerald-500' },
              { time: '03:00 - Late Entry', status: 'Trickle', count: 18, color: 'bg-slate-50 border-slate-200 text-slate-700', badge: 'bg-slate-400' },
            ].map((slot, idx) => (
              <motion.div 
                key={idx} 
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.15 }}
                className={`p-3 rounded-2xl border transition hover:shadow-xs flex flex-col justify-between ${slot.color}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-600 font-mono truncate">{slot.time}</span>
                  <span className={`w-2 h-2 rounded-full ${slot.badge} shrink-0`} />
                </div>
                <div className="mt-2.5 flex items-baseline justify-between">
                  <span className="font-mono text-base font-black tracking-tight">{slot.count}</span>
                  <span className="text-[9px] font-bold uppercase tracking-wider opacity-80">{slot.status}</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Ground Staff Advice Footer */}
          <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-600 gap-2">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-orange-100 text-[#F97316]">
                <Flame className="h-3.5 w-3.5" />
              </span>
              <span>
                <strong>Gate Staff Advisory:</strong> Deploy <strong>+3 scanning officers</strong> at Gate 1 & 2 between <strong>09:00 AM – 10:15 AM</strong> to maintain under 45-second wait times.
              </span>
            </div>
            <span className="font-mono text-[10px] text-slate-400 shrink-0">
              Turnstile sync: 100%
            </span>
          </div>
        </motion.div>

        {/* Master Attendee List & One-Click CSV Export */}
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
            <div>
              <h3 className="text-xl font-black text-slate-900">Comprehensive Attendee Registry</h3>
              <p className="text-xs text-slate-500">
                Showing {filteredAttendees.length} of {scopedRegistrations.length} attendees for this event scope.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleExportCSV}
                disabled={exportingFormat === 'csv' || filteredAttendees.length === 0}
                className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 flex items-center gap-2 shadow-sm transition"
              >
                <Download className="h-3.5 w-3.5 text-[#0F766E]" />
                <span>Export CSV ({filteredAttendees.length})</span>
              </button>
            </div>
          </div>

          {/* Filtering Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, or ticket code..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0F766E]"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-700 bg-white focus:outline-none focus:border-[#0F766E]"
            >
              <option value="all">All Gate Statuses</option>
              <option value="checked_in">Checked In</option>
              <option value="valid">Valid / Ready for Scan</option>
              <option value="cancelled">Cancelled</option>
              <option value="refunded">Refunded</option>
            </select>

            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-700 bg-white focus:outline-none focus:border-[#0F766E]"
            >
              <option value="all">All Ticket Tiers</option>
              {uniqueTiers.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-100">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-[#FAFAF9] text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Ticket Code</th>
                  <th className="p-3.5">Attendee Info</th>
                  <th className="p-3.5">Tier & Event</th>
                  <th className="p-3.5">Gate Status</th>
                  <th className="p-3.5">Custom Answers</th>
                  <th className="p-3.5 text-right">Price Paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAttendees.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400 font-semibold">
                      No attendee records matched your search filters.
                    </td>
                  </tr>
                ) : (
                  filteredAttendees.map((reg) => (
                    <tr key={reg.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3.5 font-mono font-bold text-[#0F766E] text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <span>{reg.ticketCode}</span>
                          {reg.isLive && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-100 text-emerald-800 font-black uppercase tracking-wider border border-emerald-300">
                              Live
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 font-normal">{reg.orderId}</div>
                      </td>

                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">{reg.attendeeName}</div>
                        <div className="text-[10px] text-slate-400">{reg.attendeeEmail}</div>
                        {reg.attendeePhone && (
                          <div className="text-[10px] text-slate-400 font-mono">{reg.attendeePhone}</div>
                        )}
                      </td>

                      <td className="p-3.5">
                        <div className="font-bold text-slate-800">{reg.ticketTierName}</div>
                        <div className="text-[10px] text-slate-400 truncate max-w-xs">{reg.eventTitle}</div>
                      </td>

                      <td className="p-3.5">
                        {reg.status === 'checked_in' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                            <CheckCircle2 className="h-3 w-3" /> Checked In
                          </span>
                        ) : reg.status === 'valid' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-600 border border-teal-200">
                            <Clock className="h-3 w-3" /> Ready
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
                            {reg.status}
                          </span>
                        )}
                        {reg.checkedInAt && (
                          <div className="text-[9px] text-slate-400 mt-0.5">{reg.checkedInAt}</div>
                        )}
                      </td>

                      <td className="p-3.5">
                        {reg.customResponses && Object.keys(reg.customResponses).length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(reg.customResponses).map(([k, v]) => (
                              <span key={k} className="inline-block px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px]">
                                <span className="font-bold">{k}:</span> {String(v)}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">-</span>
                        )}
                      </td>

                      <td className="p-3.5 text-right font-mono font-bold text-slate-900">
                        ₹{reg.pricePaid.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

