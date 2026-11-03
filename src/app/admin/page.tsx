'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { 
  ShieldCheck, Users, Calendar, DollarSign, Settings, CheckCircle2, 
  XCircle, AlertTriangle, Lock, Search, Filter, RefreshCw, FileText,
  Gamepad2, Sparkles, Terminal, Activity, Zap, Cpu, Server, Shield,
  ArrowUpRight, Download, Check, KeyRound, Radio, Sliders, PlayCircle,
  TrendingUp, Award, Layers, Star, Ban, Eye, UserCheck, ChevronRight,
  ExternalLink, CreditCard, ArrowRight, UserCog
} from 'lucide-react';
import { Navbar, Footer } from '@/components/NavbarFooter';
import { useAuth } from '@/context/AuthContext';

type AdminTab = 'overview' | 'events' | 'users' | 'reviews' | 'settlements' | 'logs';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.08,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35 },
  },
};

export default function SuperAdminPage() {
  const router = useRouter();
  const { user, role, loading: authLoading } = useAuth();

  // Allow temporary demo elevation if testing
  const [demoBypass, setDemoBypass] = useState(false);
  const isAuthorized = role === 'admin' || demoBypass;

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 1. Data States
  const [events, setEvents] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [reviewsList, setReviewsList] = useState<any[]>([]);
  const [reviewSearch, setReviewSearch] = useState('');
  const [reviewRatingFilter, setReviewRatingFilter] = useState<'all' | '5' | '4' | '3' | '2' | '1'>('all');
  const [auditLogs, setAuditLogs] = useState<any[]>([
    { id: 'LOG-901', action: 'EVENT_APPROVED', operator: 'Super Admin', target: 'AI Business Summit 2026', timestamp: 'Just now', status: 'SUCCESS' },
    { id: 'LOG-902', action: 'COMMISSION_SETTLED', operator: 'Automated Treasury', target: 'Disbursed ₹11.6L to TechForward India', timestamp: '2 hours ago', status: 'CONFIRMED' },
    { id: 'LOG-903', action: 'ORGANIZER_VERIFIED', operator: 'Admin Sentinel', target: 'Priya Nambiar (AI Builders Club)', timestamp: 'Yesterday', status: 'VERIFIED' },
    { id: 'LOG-904', action: 'RATE_LIMIT_DEFENSE', operator: 'System Firewall', target: 'Blocked 24 suspicious IP pings', timestamp: 'Oct 15, 2026', status: 'BLOCKED' },
  ]);

  // Filters
  const [eventSearch, setEventSearch] = useState('');
  const [eventStatusFilter, setEventStatusFilter] = useState<'all' | 'published' | 'suspended' | 'featured'>('all');
  
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'organizer' | 'attendee' | 'admin'>('all');

  // Load all platform data
  const loadPlatformData = async () => {
    setIsRefreshing(true);
    try {
      // A. Fetch Events
      const evRes = await fetch('/api/events');
      const evJson = await evRes.json();
      if (evJson.success && Array.isArray(evJson.data)) {
        setEvents(evJson.data);
      }

      // B. Fetch Users
      const uRes = await fetch('/api/admin/users');
      const uJson = await uRes.json();
      if (uJson.success && Array.isArray(uJson.data)) {
        setUsersList(uJson.data);
      }

      // C. Fetch Orders for metrics
      const oRes = await fetch('/api/orders');
      const oJson = await oRes.json();
      if (oJson.success && oJson.data?.orders) {
        setOrders(oJson.data.orders);
      }

      // D. Fetch Reviews for governance
      const revRes = await fetch('/api/reviews');
      const revJson = await revRes.json();
      if (revJson.success && Array.isArray(revJson.data?.reviews)) {
        setReviewsList(revJson.data.reviews);
      }
    } catch (err) {
      console.warn('[SuperAdmin] Error loading platform data:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadPlatformData();
  }, []);

  // 2. Computed Financial Analytics
  const liveOrderRevenue = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const baseGmv = 3845000;
  const totalGmv = baseGmv + liveOrderRevenue; // Gross Merchandise Value
  const platformCommissionRate = 0.05; // 5% platform take rate
  const platformCommissionEarned = Math.round(totalGmv * platformCommissionRate);
  const organizerPayoutPool = totalGmv - platformCommissionEarned;
  const totalTicketsSold = 2840 + orders.reduce((sum, o) => sum + (Number(o.qty) || 1), 0);

  // 3. Event Moderation Actions
  const handleToggleEventStatus = async (event: any) => {
    const newStatus = event.status === 'suspended' ? 'published' : 'suspended';
    
    // Optimistic UI update
    setEvents(prev => prev.map(e => e.id === event.id || e.slug === event.slug ? { ...e, status: newStatus } : e));
    
    try {
      await fetch('/api/events', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: event.slug, status: newStatus }),
      });

      // Add audit log
      setAuditLogs(prev => [
        {
          id: `LOG-${Date.now()}`,
          action: newStatus === 'suspended' ? 'EVENT_SUSPENDED' : 'EVENT_PUBLISHED',
          operator: user?.email || 'Super Admin',
          target: `${event.title} -> ${newStatus.toUpperCase()}`,
          timestamp: 'Just now',
          status: 'SUCCESS'
        },
        ...prev,
      ]);
    } catch (err) {
      console.error('[SuperAdmin] Failed to toggle event status:', err);
    }
  };

  const handleToggleEventFeatured = async (event: any) => {
    const newFeatured = !event.featured;

    // Optimistic UI update
    setEvents(prev => prev.map(e => e.id === event.id || e.slug === event.slug ? { ...e, featured: newFeatured } : e));

    try {
      await fetch('/api/events', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: event.slug, featured: newFeatured }),
      });

      setAuditLogs(prev => [
        {
          id: `LOG-${Date.now()}`,
          action: newFeatured ? 'EVENT_FEATURED' : 'EVENT_UNFEATURED',
          operator: user?.email || 'Super Admin',
          target: `${event.title} (Featured: ${newFeatured})`,
          timestamp: 'Just now',
          status: 'SUCCESS'
        },
        ...prev,
      ]);
    } catch (err) {
      console.error('[SuperAdmin] Failed to toggle featured status:', err);
    }
  };

  // 4. User Moderation Actions
  const handleToggleUserRole = async (targetUser: any) => {
    const nextRole = targetUser.role === 'attendee' ? 'organizer' : targetUser.role === 'organizer' ? 'admin' : 'attendee';

    setUsersList(prev => prev.map(u => u.id === targetUser.id ? { ...u, role: nextRole } : u));

    try {
      await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: targetUser.id, email: targetUser.email, role: nextRole }),
      });

      setAuditLogs(prev => [
        {
          id: `LOG-${Date.now()}`,
          action: 'USER_ROLE_UPDATED',
          operator: user?.email || 'Super Admin',
          target: `${targetUser.name} promoted to ${nextRole.toUpperCase()}`,
          timestamp: 'Just now',
          status: 'SUCCESS'
        },
        ...prev,
      ]);
    } catch (err) {
      console.error('[SuperAdmin] Failed to update user role:', err);
    }
  };

  const handleToggleUserStatus = async (targetUser: any) => {
    const nextStatus = targetUser.status === 'suspended' ? 'active' : 'suspended';

    setUsersList(prev => prev.map(u => u.id === targetUser.id ? { ...u, status: nextStatus } : u));

    try {
      await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: targetUser.id, email: targetUser.email, status: nextStatus }),
      });

      setAuditLogs(prev => [
        {
          id: `LOG-${Date.now()}`,
          action: nextStatus === 'suspended' ? 'USER_SUSPENDED' : 'USER_REACTIVATED',
          operator: user?.email || 'Super Admin',
          target: `${targetUser.name} (${targetUser.email}) -> ${nextStatus}`,
          timestamp: 'Just now',
          status: 'SUCCESS'
        },
        ...prev,
      ]);
    } catch (err) {
      console.error('[SuperAdmin] Failed to update user status:', err);
    }
  };

  const handleToggleUserVerification = async (targetUser: any) => {
    const nextVerified = !targetUser.verified;

    setUsersList(prev => prev.map(u => u.id === targetUser.id ? { ...u, verified: nextVerified } : u));

    try {
      await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: targetUser.id, email: targetUser.email, verified: nextVerified }),
      });

      setAuditLogs(prev => [
        {
          id: `LOG-${Date.now()}`,
          action: nextVerified ? 'ORGANIZER_VERIFIED' : 'VERIFICATION_REVOKED',
          operator: user?.email || 'Super Admin',
          target: `${targetUser.name} (Verified: ${nextVerified})`,
          timestamp: 'Just now',
          status: 'SUCCESS'
        },
        ...prev,
      ]);
    } catch (err) {
      console.error('[SuperAdmin] Failed to toggle user verification:', err);
    }
  };

  // Filtered Lists
  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      const q = eventSearch.toLowerCase().trim();
      const matchesSearch = !q || e.title?.toLowerCase().includes(q) || e.venue?.city?.toLowerCase().includes(q) || e.category?.name?.toLowerCase().includes(q);
      if (!matchesSearch) return false;

      if (eventStatusFilter === 'published') return e.status === 'published';
      if (eventStatusFilter === 'suspended') return e.status === 'suspended';
      if (eventStatusFilter === 'featured') return Boolean(e.featured);
      return true;
    });
  }, [events, eventSearch, eventStatusFilter]);

  const filteredUsers = useMemo(() => {
    return usersList.filter(u => {
      const q = userSearch.toLowerCase().trim();
      const matchesSearch = !q || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.phone?.includes(q);
      if (!matchesSearch) return false;

      if (userRoleFilter !== 'all') return u.role === userRoleFilter;
      return true;
    });
  }, [usersList, userSearch, userRoleFilter]);

  const filteredReviews = useMemo(() => {
    return reviewsList.filter(r => {
      const q = reviewSearch.toLowerCase().trim();
      const matchesSearch = 
        !q || 
        r.authorName?.toLowerCase().includes(q) || 
        r.authorEmail?.toLowerCase().includes(q) || 
        r.eventTitle?.toLowerCase().includes(q) ||
        r.content?.toLowerCase().includes(q) ||
        r.title?.toLowerCase().includes(q);
      if (!matchesSearch) return false;

      if (reviewRatingFilter !== 'all') {
        return Math.round(r.rating) === parseInt(reviewRatingFilter, 10);
      }
      return true;
    });
  }, [reviewsList, reviewSearch, reviewRatingFilter]);

  // Auth gate with Super Admin Testing Mode
  if (!isAuthorized && !authLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 sm:p-10 text-center max-w-md w-full space-y-5">
            <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <Lock className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900">Super Admin Access Required</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-2">
                This central governance console is restricted to platform super administrators.
                {user ? ` Signed in as ${user.email} (Role: ${role || 'attendee'}).` : ' Please sign in with admin credentials.'}
              </p>
            </div>

            <div className="pt-2 space-y-3">
              <button
                type="button"
                onClick={() => setDemoBypass(true)}
                className="w-full rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-3.5 px-4 font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2"
              >
                <KeyRound className="h-4 w-4 text-amber-300" />
                <span>Enter Super Admin Console (Demo Mode)</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login?redirect=/admin"
                  className="rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 py-2.5 px-3 text-xs font-bold transition text-center"
                >
                  Sign In
                </Link>
                <Link
                  href="/"
                  className="rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 py-2.5 px-3 text-xs font-bold transition text-center"
                >
                  Home
                </Link>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-800 font-sans">
      <Navbar />

      {/* Cyber/Gaming-Accented Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[#0B0F19] via-[#0F172A] to-[#0B0F19] text-white py-10 md:py-14 border-b border-slate-800 shadow-xl">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#0F766E]/20 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[130px] pointer-events-none" />

        <div className="container mx-auto px-4 md:px-8 max-w-7xl relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-mono font-bold uppercase tracking-wider">
                  <ShieldCheck className="h-3.5 w-3.5 text-purple-400" /> SUPER ADMIN NEXUS
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                  GATE ENGINE ONLINE
                </span>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white flex items-center gap-3">
                <span>Super Admin</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-300 to-[#F97316]">
                  Control Console
                </span>
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl">
                Central command for platform-wide gross sales, commission take-rates, event moderation & suspension, and organizer roles.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/admin/attendees"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#F97316] to-amber-500 hover:from-[#ea580c] hover:to-amber-600 text-white text-xs font-bold shadow-md transition"
              >
                <Users className="h-4 w-4" />
                <span>Attendees & Bookings</span>
              </Link>

              <button
                type="button"
                onClick={loadPlatformData}
                disabled={isRefreshing}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition backdrop-blur-md"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? 'Syncing...' : 'Sync Live Data'}</span>
              </button>

              <Link
                href="/organizer/dashboard"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold shadow-md transition"
              >
                <span>Organizer View</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="container mx-auto px-4 md:px-8 py-8 md:py-10 flex-1 space-y-8 max-w-7xl">
        
        {/* KPI Platform Stat HUD Cards */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {/* GMV Metric */}
          <motion.div 
            variants={itemVariants}
            className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">GROSS REVENUE (GMV)</span>
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">₹{(totalGmv / 100000).toFixed(1)} Lakhs</h3>
              <p className="text-xs text-emerald-600 font-bold mt-1 flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>₹{totalGmv.toLocaleString()} total processed</span>
              </p>
            </div>
          </motion.div>

          {/* Commission Take */}
          <motion.div 
            variants={itemVariants}
            className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">COMMISSION EARNED</span>
              <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
                <Award className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">₹{platformCommissionEarned.toLocaleString()}</h3>
              <p className="text-xs text-purple-600 font-bold mt-1">
                5.0% platform take rate
              </p>
            </div>
          </motion.div>

          {/* Total Events Hosted */}
          <motion.div 
            variants={itemVariants}
            className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">TOTAL HOSTED EVENTS</span>
              <div className="p-2.5 rounded-xl bg-teal-50 text-[#0F766E]">
                <Calendar className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">{events.length} Events</h3>
              <p className="text-xs text-[#0F766E] font-bold mt-1">
                {events.filter(e => e.status === 'published').length} Live Published across India
              </p>
            </div>
          </motion.div>

          {/* Registered Users */}
          <motion.div 
            variants={itemVariants}
            className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">USER ECOSYSTEM</span>
              <div className="p-2.5 rounded-xl bg-orange-50 text-[#F97316]">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">{usersList.length} Accounts</h3>
              <p className="text-xs text-[#F97316] font-bold mt-1">
                {usersList.filter(u => u.role === 'organizer').length} Host Organizers
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* Navigation Tabs */}
        <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap gap-2">
          {[
            { id: 'overview', label: 'Platform Analytics', icon: Activity, badge: 'Live Pulse' },
            { id: 'events', label: 'Event Moderation', icon: Calendar, badge: `${events.length} Events` },
            { id: 'users', label: 'User Governance', icon: Users, badge: `${usersList.length} Users` },
            { id: 'reviews', label: 'Attendee Reviews', icon: Star, badge: `${reviewsList.length} Reviews` },
            { id: 'settlements', label: 'Treasury & Settlements', icon: DollarSign, badge: '₹36.5L Pool' },
            { id: 'logs', label: 'System Audit Logs', icon: Terminal, badge: 'Secured' },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 min-w-[190px] flex items-center justify-between px-4 py-3 rounded-xl font-bold text-xs transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 text-white shadow-md shadow-purple-900/20 scale-[1.01]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${isActive ? 'text-amber-300' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </div>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW & FINANCIAL ANALYTICS */}
        {activeTab === 'overview' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Financial Breakdown Card */}
              <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <h3 className="text-xl font-black text-slate-900">Financial Pool & Gateway Settlements</h3>
                    <p className="text-xs text-slate-500">Gross transaction flow, gateway fees, and platform take-rate</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                    UPI & NetBanking Active
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                    <span className="text-[11px] text-slate-400 block font-semibold uppercase">Total GMV</span>
                    <span className="text-2xl font-black text-slate-900">₹{totalGmv.toLocaleString()}</span>
                    <span className="text-[10px] text-slate-500 block">100% Total Sales</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100 space-y-1">
                    <span className="text-[11px] text-purple-600 block font-semibold uppercase">ePay Platform Fee</span>
                    <span className="text-2xl font-black text-purple-700">₹{platformCommissionEarned.toLocaleString()}</span>
                    <span className="text-[10px] text-purple-600 block">5.0% Net Commission</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-teal-50 border border-teal-100 space-y-1">
                    <span className="text-[11px] text-teal-600 block font-semibold uppercase">Organizer Payout Pool</span>
                    <span className="text-2xl font-black text-teal-800">₹{organizerPayoutPool.toLocaleString()}</span>
                    <span className="text-[10px] text-teal-700 block">95.0% Disbursable</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-3">
                  <h4 className="font-bold text-slate-800 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-[#F97316]" /> Super Admin Settlement Engine
                  </h4>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    Automatic T+2 settlement cycle initiates post-event conclusion. Organizers receive bank deposits directly into verified accounts minus gateway and platform processing fees.
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => alert(`Initiating batch settlement of ₹${(organizerPayoutPool / 100000).toFixed(2)} Lakhs to all verified organizers.`)}
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm transition"
                    >
                      Process Batch Settlement
                    </button>
                    <button
                      type="button"
                      onClick={() => alert('Exporting platform financial ledger to CSV...')}
                      className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-white text-slate-700 font-bold text-xs transition flex items-center gap-1.5"
                    >
                      <Download className="h-3.5 w-3.5" /> Export Ledger CSV
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Platform Controls Card */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-5 shadow-sm">
                <div className="border-b pb-4">
                  <h3 className="text-lg font-black text-slate-900">Security & Controls</h3>
                  <p className="text-xs text-slate-500">Live platform policy toggles</p>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div>
                      <p className="font-bold text-slate-800">Anti-Bot Gate Shield</p>
                      <p className="text-[11px] text-slate-400">Rate-limiting for pass scans</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      ACTIVE
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div>
                      <p className="font-bold text-slate-800">New Host Approvals</p>
                      <p className="text-[11px] text-slate-400">Instant vs manual approval</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                      VERIFIED ONLY
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div>
                      <p className="font-bold text-slate-800">Dynamic QR Refresh</p>
                      <p className="text-[11px] text-slate-400">Prevents screenshot pass sharing</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800">
                      ENABLED
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <Link
                      href="/organizer/scanner"
                      className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition shadow-sm"
                    >
                      <ShieldCheck className="h-4 w-4 text-emerald-400" />
                      <span>Launch Gate Scanner (/organizer/scanner)</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 2: EVENT MODERATION & GOVERNANCE */}
        {activeTab === 'events' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-5">
              <div>
                <h3 className="text-xl font-black text-slate-900">Event Moderation & Catalog Governance</h3>
                <p className="text-xs text-slate-500">Approve, highlight with Featured badge, or suspend flagged summits</p>
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={eventSearch}
                    onChange={e => setEventSearch(e.target.value)}
                    placeholder="Search by event title, city..."
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-[#0F766E]"
                  />
                </div>

                <select
                  value={eventStatusFilter}
                  onChange={e => setEventStatusFilter(e.target.value as any)}
                  className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none"
                >
                  <option value="all">All Events ({events.length})</option>
                  <option value="published">Published Live</option>
                  <option value="featured">Featured Only ⭐</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>

            {/* Events Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-100">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-[#FAFAF9] text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Event Details</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Schedule & Venue</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Featured</th>
                    <th className="p-3.5 text-right">Moderator Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredEvents.map(evt => {
                    const isSuspended = evt.status === 'suspended';
                    const isFeatured = Boolean(evt.featured);

                    return (
                      <tr key={evt.id || evt.slug} className="hover:bg-slate-50/80 transition">
                        <td className="p-3.5">
                          <div className="flex items-center gap-3">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={evt.bannerUrl || evt.coverImage || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=300&q=80'}
                              alt={evt.title}
                              className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                            />
                            <div>
                              <Link
                                href={`/events/${evt.slug}`}
                                className="font-extrabold text-slate-900 text-sm hover:text-[#0F766E] transition line-clamp-1 flex items-center gap-1"
                              >
                                <span>{evt.title}</span>
                                <ExternalLink className="h-3 w-3 text-slate-400" />
                              </Link>
                              <span className="text-[10px] text-slate-400 block font-mono">
                                Slug: /events/{evt.slug}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="p-3.5">
                          <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                            {typeof evt.category === 'object' ? evt.category?.name : (evt.category || 'Tech')}
                          </span>
                        </td>

                        <td className="p-3.5">
                          <div className="font-semibold text-slate-800">{evt.date || evt.startDate?.split('T')[0] || 'Upcoming'}</div>
                          <div className="text-[10px] text-slate-400">{evt.venue?.city || evt.city || 'Mumbai'}</div>
                        </td>

                        <td className="p-3.5">
                          {isSuspended ? (
                            <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-[10px] font-extrabold inline-flex items-center gap-1">
                              <Ban className="h-3 w-3" /> Suspended
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold inline-flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" /> Live Active
                            </span>
                          )}
                        </td>

                        <td className="p-3.5">
                          <button
                            type="button"
                            onClick={() => handleToggleEventFeatured(evt)}
                            className={`px-3 py-1 rounded-full text-[10px] font-extrabold transition flex items-center gap-1 border ${
                              isFeatured
                                ? 'bg-amber-100 border-amber-300 text-amber-800 hover:bg-amber-200'
                                : 'bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200'
                            }`}
                          >
                            <Star className={`h-3 w-3 ${isFeatured ? 'fill-amber-500 text-amber-500' : ''}`} />
                            <span>{isFeatured ? 'Featured' : 'Regular'}</span>
                          </button>
                        </td>

                        <td className="p-3.5 text-right space-x-2">
                          <button
                            type="button"
                            onClick={() => handleToggleEventStatus(evt)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                              isSuspended
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                : 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200'
                            }`}
                          >
                            {isSuspended ? 'Approve & Restore' : 'Suspend Event'}
                          </button>

                          <Link
                            href={`/create-event?edit=${evt.slug}`}
                            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition inline-block"
                          >
                            Edit Form
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* TAB 3: USER & ORGANIZER GOVERNANCE */}
        {activeTab === 'users' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-5">
              <div>
                <h3 className="text-xl font-black text-slate-900">User Ecosystem & Access Roles</h3>
                <p className="text-xs text-slate-500">Manage organizer privileges, promote attendees, verify organizers, or freeze accounts</p>
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={e => setUserSearch(e.target.value)}
                    placeholder="Search user by name or email..."
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-[#0F766E]"
                  />
                </div>

                <select
                  value={userRoleFilter}
                  onChange={e => setUserRoleFilter(e.target.value as any)}
                  className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none"
                >
                  <option value="all">All Roles ({usersList.length})</option>
                  <option value="organizer">Organizers Only</option>
                  <option value="attendee">Attendees Only</option>
                  <option value="admin">Super Admins</option>
                </select>
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-100">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-[#FAFAF9] text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">User Identity</th>
                    <th className="p-3.5">Assigned Role</th>
                    <th className="p-3.5">Verification</th>
                    <th className="p-3.5">Total Orders / Hosted</th>
                    <th className="p-3.5">Account Status</th>
                    <th className="p-3.5 text-right">Role Governance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map(u => {
                    const isSuspended = u.status === 'suspended';

                    return (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-3.5">
                          <div className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                            <span>{u.name}</span>
                            {u.verified && <CheckCircle2 className="h-3.5 w-3.5 text-blue-500 inline" />}
                          </div>
                          <span className="text-[10px] text-slate-400 block">{u.email}</span>
                          {u.phone && <span className="text-[10px] text-slate-400 block">{u.phone}</span>}
                        </td>

                        <td className="p-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                            u.role === 'admin'
                              ? 'bg-purple-100 text-purple-800 border-purple-200'
                              : u.role === 'organizer'
                              ? 'bg-orange-100 text-orange-800 border-orange-200'
                              : 'bg-teal-100 text-teal-800 border-teal-200'
                          }`}>
                            {u.role}
                          </span>
                        </td>

                        <td className="p-3.5">
                          <button
                            type="button"
                            onClick={() => handleToggleUserVerification(u)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition flex items-center gap-1 ${
                              u.verified
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                            }`}
                          >
                            <ShieldCheck className="h-3 w-3" />
                            <span>{u.verified ? 'Verified Host' : 'Unverified'}</span>
                          </button>
                        </td>

                        <td className="p-3.5 font-bold text-slate-800">
                          {u.role === 'organizer' ? `${u.eventsHosted || 0} Events Hosted` : `${u.totalOrders || 0} Orders (₹${(u.totalSpent || 0).toLocaleString()})`}
                        </td>

                        <td className="p-3.5">
                          {isSuspended ? (
                            <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-[10px] font-bold">
                              Suspended
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                              Active
                            </span>
                          )}
                        </td>

                        <td className="p-3.5 text-right space-x-2">
                          <button
                            type="button"
                            onClick={() => handleToggleUserRole(u)}
                            className="px-2.5 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold transition"
                            title="Cycle Role: Attendee -> Organizer -> Admin"
                          >
                            Switch Role
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleUserStatus(u)}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition ${
                              isSuspended
                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                            }`}
                          >
                            {isSuspended ? 'Reactivate' : 'Suspend'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* TAB: ATTENDEE REVIEWS & SOCIAL PROOF GOVERNANCE */}
        {activeTab === 'reviews' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
              <div>
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Star className="h-5 w-5 text-[#F97316] fill-[#F97316]" />
                  <span>Attendee Reviews & Testimonials Backend</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Inspect who gave reviews, verified ticket holders, star ratings, and organizer responses.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-mono text-xs font-bold">
                  {reviewsList.length} Total Submissions
                </span>
              </div>
            </div>

            {/* Search & Rating Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by attendee name, email, event, or review keyword..."
                  value={reviewSearch}
                  onChange={(e) => setReviewSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-purple-600"
                />
              </div>

              <select
                value={reviewRatingFilter}
                onChange={(e) => setReviewRatingFilter(e.target.value as any)}
                className="rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-700 bg-white focus:outline-none focus:border-purple-600"
              >
                <option value="all">All Star Ratings</option>
                <option value="5">⭐⭐⭐⭐⭐ (5 Stars)</option>
                <option value="4">⭐⭐⭐⭐ (4 Stars)</option>
                <option value="3">⭐⭐⭐ (3 Stars)</option>
                <option value="2">⭐⭐ (2 Stars)</option>
                <option value="1">⭐ (1 Star)</option>
              </select>
            </div>

            {/* Reviews Registry Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Reviewer Profile</th>
                    <th className="p-3.5">Event & Pass Tier</th>
                    <th className="p-3.5">Rating & Feedback</th>
                    <th className="p-3.5">Verification</th>
                    <th className="p-3.5">Host Reply Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredReviews.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-slate-400 font-semibold">
                        No attendee reviews found matching your search filters.
                      </td>
                    </tr>
                  ) : (
                    filteredReviews.map((rev) => (
                      <tr key={rev.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-3.5">
                          <div className="flex items-center gap-3">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={rev.authorAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${rev.authorName}`}
                              alt={rev.authorName}
                              className="w-9 h-9 rounded-full object-cover bg-slate-100 ring-2 ring-purple-100"
                            />
                            <div>
                              <div className="font-bold text-slate-900">{rev.authorName}</div>
                              <div className="text-[11px] text-slate-400 font-mono">{rev.authorEmail}</div>
                              <div className="text-[9px] text-slate-400">{rev.createdAt?.split('T')[0]}</div>
                            </div>
                          </div>
                        </td>

                        <td className="p-3.5">
                          <div className="font-bold text-slate-800 line-clamp-1">{rev.eventTitle}</div>
                          <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-[#0F766E] border border-teal-200/50">
                            {rev.ticketTierName || 'General Admission'}
                          </span>
                        </td>

                        <td className="p-3.5 max-w-sm">
                          <div className="flex items-center gap-1 mb-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`h-3.5 w-3.5 ${
                                  s <= rev.rating
                                    ? 'fill-[#F97316] text-[#F97316]'
                                    : 'text-slate-200'
                                }`}
                              />
                            ))}
                            <span className="font-bold text-slate-800 text-[11px] ml-1">
                              {rev.rating}.0
                            </span>
                          </div>
                          {rev.title && (
                            <div className="font-bold text-slate-900 text-xs line-clamp-1 mb-0.5">
                              {rev.title}
                            </div>
                          )}
                          <p className="text-slate-600 text-xs line-clamp-2 italic">
                            &quot;{rev.content}&quot;
                          </p>
                        </td>

                        <td className="p-3.5">
                          {rev.isVerifiedPassHolder ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                              <span>Verified Holder</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px]">
                              Standard
                            </span>
                          )}
                        </td>

                        <td className="p-3.5">
                          {rev.organizerReply ? (
                            <div className="p-2 rounded-xl bg-purple-50 border border-purple-200 text-[11px] text-purple-900 space-y-0.5 max-w-xs">
                              <span className="font-bold block text-purple-800">
                                Replied by {rev.organizerReply.repliedBy || 'Host'}
                              </span>
                              <p className="line-clamp-2 text-[10px] text-purple-700">
                                {rev.organizerReply.replyContent}
                              </p>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-[11px] italic">
                              Awaiting response
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* TAB 4: TREASURY & BATCH SETTLEMENTS */}
        {activeTab === 'settlements' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-5">
              <div>
                <h3 className="text-xl font-black text-slate-900">Treasury Settlement Pipeline</h3>
                <p className="text-xs text-slate-500">Batch disburse ticket revenues to linked organizer bank accounts & UPI VPA</p>
              </div>

              <button
                type="button"
                onClick={() => alert(`Batch settlement initiated for ₹${(organizerPayoutPool / 100000).toFixed(2)} Lakhs.`)}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition flex items-center gap-2 shrink-0"
              >
                <DollarSign className="h-4 w-4" />
                <span>Execute All Settlements</span>
              </button>
            </div>

            <div className="space-y-3">
              {[
                { host: 'TechForward India', event: 'AI Business Summit 2026', amount: '₹14,24,000', fee: '₹71,200', net: '₹13,52,800', status: 'Ready to Disburse' },
                { host: 'Soundwave Collective', event: 'Indie Music Fest Mumbai', amount: '₹8,90,000', fee: '₹44,500', net: '₹8,45,500', status: 'Ready to Disburse' },
                { host: 'UX Craft Academy', event: 'Design Systems Conclave', amount: '₹1,50,000', fee: '₹7,500', net: '₹1,42,500', status: 'Settled Yesterday' },
              ].map((s, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{s.host}</h4>
                    <p className="text-xs text-slate-500">{s.event}</p>
                  </div>

                  <div className="flex items-center gap-6 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Gross Sales</span>
                      <span className="font-bold text-slate-800">{s.amount}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-purple-600 block uppercase">5% Fee</span>
                      <span className="font-bold text-purple-700">{s.fee}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-teal-600 block uppercase">Net Payout</span>
                      <span className="font-black text-teal-800 text-sm">{s.net}</span>
                    </div>

                    <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      {s.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* TAB 5: AUDIT LOGS */}
        {activeTab === 'logs' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6"
          >
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="text-xl font-black text-slate-900">Blackbox System Audit Logs</h3>
                <p className="text-xs text-slate-500">Immutable governance telemetry and operator history</p>
              </div>
              <span className="font-mono text-xs px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-bold">
                Level 4 Logging Active
              </span>
            </div>

            <div className="space-y-2.5">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 font-mono text-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div className="flex items-center gap-3">
                    <span className="text-[#0F766E] font-bold">{log.id}</span>
                    <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 text-[10px] font-bold">{log.action}</span>
                    <span className="text-slate-700">{log.target}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                    <span>{log.operator}</span>
                    <span>{log.timestamp}</span>
                    <span className="text-emerald-600 font-bold">{log.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  );
}
