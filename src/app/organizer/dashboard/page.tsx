'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, Calendar, Users, DollarSign, QrCode, PlusCircle, Download, 
  CheckCircle2, Search, ArrowUpRight, TrendingUp, Settings, Wallet, 
  Sparkles, Filter, Activity, ArrowDownRight, Eye, ShieldCheck, Clock,
  ChevronRight, RefreshCw, Layers, Ticket, Check, AlertCircle, Share2
} from 'lucide-react';
import { Navbar, Footer } from '@/components/NavbarFooter';
import { mockEvents, getAllEvents } from '@/lib/data';

interface RegistrationRecord {
  id: string;
  name: string;
  email: string;
  ticket: string;
  status: 'Checked In' | 'Transferred' | 'Approved' | 'Waitlist' | 'Refunded';
  checkinTime: string;
  price: number;
  date: string;
}

const mockRegistrations: RegistrationRecord[] = [
  { id: 'TKT-EPAY-849201', name: 'Alex Morgan', email: 'alex@example.com', ticket: 'Early Bird Pass (General)', status: 'Checked In', checkinTime: '10:14 AM', price: 1499, date: '2026-10-07' },
  { id: 'TKT-EPAY-849202', name: 'Rohini Deshmukh', email: 'rohini@tech.in', ticket: 'VIP Masterclass (Transferred)', status: 'Transferred', checkinTime: '-', price: 5999, date: '2026-10-07' },
  { id: 'TKT-EPAY-849203', name: 'Aarav Sharma', email: 'aarav@finpulse.io', ticket: 'General Admission (Group 4+)', status: 'Checked In', checkinTime: '09:45 AM', price: 2124, date: '2026-10-07' },
  { id: 'TKT-EPAY-849204', name: 'Priya Nambiar', email: 'priya@neural.ai', ticket: 'Founder Grant (Complimentary)', status: 'Approved', checkinTime: '-', price: 0, date: '2026-10-06' },
  { id: 'TKT-EPAY-849205', name: 'David Miller', email: 'david@cloud.com', ticket: 'AI Workshop Lab (Waitlisted)', status: 'Waitlist', checkinTime: '-', price: 3499, date: '2026-10-06' },
  { id: 'TKT-EPAY-849206', name: 'Vikram Joshi', email: 'vikram@media.in', ticket: 'General Pass (Cancelled)', status: 'Refunded', checkinTime: '-', price: 2499, date: '2026-10-06' },
];

import { Variants } from 'framer-motion';

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
  const allEvents = getAllEvents();
  const totalEvents = allEvents.length;
  const publishedEvents = allEvents.filter(e => e.status === 'published');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'30d' | '90d' | 'year'>('30d');

  const totalRegistrations = 1248;
  const totalRevenue = 1845000;
  const checkedInCount = 742;
  const checkinRate = Math.round((checkedInCount / totalRegistrations) * 100);

  // Filter registrations
  const filteredRegistrations = mockRegistrations.filter(reg => {
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
                <span>+18.4% from last month</span>
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
                <span>Settlement Guaranteed</span>
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
              <h2 className="text-xl font-black text-slate-900">Your Active & Published Events</h2>
              <p className="text-xs text-slate-500">Manage ticketing status, view live attendees, and test QR verification</p>
            </div>

            <Link
              href="/create-event"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#0F766E] text-white px-4 py-2 text-xs font-bold hover:bg-[#115E59] transition shadow-sm"
            >
              <PlusCircle className="h-3.5 w-3.5" /> New Event
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publishedEvents.slice(0, 3).map((evt, idx) => {
              const minPrice = Math.min(...evt.ticketTypes.map(t => t.price));
              const seats = evt.ticketTypes.reduce((acc, t) => acc + (t.remainingQuantity ?? t.quantity), 0);

              return (
                <motion.div
                  key={evt.id}
                  whileHover={{ y: -4 }}
                  className="rounded-2xl border border-slate-200 bg-[#FAFAF9] p-4 flex flex-col justify-between hover:border-[#0F766E]/40 hover:shadow-md transition-all group"
                >
                  <div className="space-y-3">
                    <div className="relative h-32 w-full rounded-xl overflow-hidden bg-slate-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={evt.bannerUrl}
                        alt={evt.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-2 left-2 rounded-full bg-[#059669] text-white px-2 py-0.5 text-[10px] font-bold shadow">
                        Live Active
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-[#0F766E] uppercase tracking-wider">
                        {evt.category.name}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm line-clamp-1 group-hover:text-[#0F766E] transition-colors">
                        {evt.title}
                      </h4>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3 text-slate-400" />
                        {new Date(evt.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200/80 mt-3 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Price onwards</span>
                      <span className="font-black text-slate-900">₹{minPrice.toLocaleString()}</span>
                    </div>
                    <Link
                      href={`/events/${evt.slug}`}
                      className="inline-flex items-center gap-1 font-bold text-[#F97316] hover:text-[#ea580c] transition text-xs"
                    >
                      <span>Manage</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Live Registrations Table & Settlement Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Registrations Table with Search and Status Filter */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-2 bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
              <div>
                <h3 className="text-xl font-black text-slate-900">Live Attendee Feed & Gate Logs</h3>
                <p className="text-xs text-slate-500">Real-time check-ins, transfers, and approval statuses</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => alert('Generating Attendee CSV report...')}
                  className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 shadow-sm transition"
                >
                  <Download className="h-3.5 w-3.5 text-[#0F766E]" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

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
                        <td className="p-3.5 font-mono font-bold text-[#0F766E] text-[11px]">{reg.id}</td>
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
