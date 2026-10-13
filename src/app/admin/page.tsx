'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { 
  ShieldCheck, Users, Calendar, DollarSign, Settings, CheckCircle2, 
  XCircle, AlertTriangle, Lock, Search, Filter, RefreshCw, FileText,
  Gamepad2, Sparkles, Terminal, Activity, Zap, Cpu, Server, Shield,
  ArrowUpRight, Download, Check, KeyRound, Radio, Sliders, PlayCircle,
  TrendingUp, Award, Layers
} from 'lucide-react';
import { Navbar, Footer } from '@/components/NavbarFooter';

const initialOrganizers = [
  { id: 'ORG-101', name: 'ePay Global Tech', owner: 'Rajesh Malhotra', email: 'rajesh@epay.com', eventsCount: 4, status: 'approved', joined: '2026-08-12', trustScore: 99, volume: '₹14.8L' },
  { id: 'ORG-102', name: 'AI Builders Club', owner: 'Priya Nambiar', email: 'priya@neural.ai', eventsCount: 2, status: 'approved', joined: '2026-09-01', trustScore: 96, volume: '₹6.2L' },
  { id: 'ORG-103', name: 'UX Craft Academy', owner: 'Sarah Jenkins', email: 'sarah@uxcraft.com', eventsCount: 1, status: 'pending', joined: '2026-10-04', trustScore: 84, volume: '₹1.5L' },
  { id: 'ORG-104', name: 'Soundwave Collective', owner: 'Aarav Sharma', email: 'aarav@soundwave.in', eventsCount: 3, status: 'approved', joined: '2026-07-22', trustScore: 98, volume: '₹8.9L' },
  { id: 'ORG-105', name: 'Quantum Devs Guild', owner: 'Vikram Joshi', email: 'vikram@quantum.io', eventsCount: 1, status: 'suspended', joined: '2026-06-15', trustScore: 52, volume: '₹0.4L' },
];

const mockAuditLogs = [
  { id: 'LOG-901', action: 'ORGANIZER_APPROVED', user: 'Guild Master (Admin)', target: 'UX Craft Academy', timestamp: '2026-10-12 09:30 AM', ip: '192.168.1.45', status: 'SUCCESS' },
  { id: 'LOG-902', action: 'SETTLEMENT_PROCESSED', user: 'Automated Bot', target: 'Payout ₹11,65,725 to ePay Global', timestamp: '2026-10-12 04:15 PM', ip: '192.168.1.45', status: 'CONFIRMED' },
  { id: 'LOG-903', action: 'EVENT_STATUS_CHANGED', user: 'Rajesh Malhotra', target: 'FinTech Summit 2026 -> Published', timestamp: '2026-10-11 11:20 AM', ip: '103.22.41.12', status: 'VERIFIED' },
  { id: 'LOG-904', action: 'SECURITY_RATE_LIMIT_HIT', user: 'System Sentinel', target: 'Blocked 24 suspicious IP pings', timestamp: '2026-10-11 02:40 AM', ip: '45.132.88.19', status: 'BLOCKED' },
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
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

export default function SuperAdminPage() {
  const [organizers, setOrganizers] = useState(initialOrganizers);
  const [activeTab, setActiveTab] = useState<'organizers' | 'settlements' | 'logs' | 'security'>('organizers');
  const [searchQuery, setSearchQuery] = useState('');
  const [serverStatus, setServerStatus] = useState<'OPERATIONAL' | 'SHIELD_ACTIVE'>('OPERATIONAL');

  const toggleOrganizerStatus = (id: string) => {
    setOrganizers(prev =>
      prev.map(org => {
        if (org.id === id) {
          const nextStatus = org.status === 'approved' ? 'suspended' : 'approved';
          return { ...org, status: nextStatus };
        }
        return org;
      })
    );
  };

  const filteredOrganizers = organizers.filter(
    o => o.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
         o.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
         o.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-800 font-sans">
      <Navbar />

      {/* Cyber/Gaming Inspired HUD Hero Header (Dark gradient banner with glowing accents) */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[#0B0F19] via-[#0F172A] to-[#0B0F19] text-white py-10 md:py-14 border-b border-slate-800 shadow-xl">
        {/* Glow Orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#0F766E]/25 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#F97316]/20 rounded-full blur-[130px] pointer-events-none" />

        <div className="container mx-auto px-4 md:px-8 max-w-7xl relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
          >
            <div>
              {/* Top HUD Badge */}
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold uppercase tracking-wider">
                  <KeyRound className="h-3.5 w-3.5 text-[#F97316]" /> SUPER ADMIN PRIVILEGE
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                  GATE ENGINE ONLINE
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white flex items-center gap-3">
                <span>Platform Governance &</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-300 to-[#F97316]">
                  Control Console
                </span>
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl">
                High-privilege system nexus for multi-tier organizer verification, instant batch settlement executions, and security audits.
              </p>
            </div>

            {/* Live Telemetry Pill */}
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-3 backdrop-blur-md">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#0F766E] to-teal-500 text-white shadow-md">
                <Radio className="h-5 w-5 animate-pulse" />
              </div>
              <div className="text-xs">
                <span className="text-slate-400 block font-mono text-[10px]">NETWORK HEALTH</span>
                <span className="text-emerald-400 font-bold font-mono">99.98% • 12ms Latency</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Container - Clean Light Background (#F8FAFC) with Gaming-Accented Cards */}
      <main className="container mx-auto px-4 md:px-8 py-8 md:py-10 flex-1 space-y-8 max-w-7xl">
        
        {/* KPI Gaming Stat HUD Cards (Light card with glowing neon borders on hover) */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {/* Card 1 */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="group relative bg-white p-5 rounded-2xl border border-slate-200/90 hover:border-[#0F766E] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-teal-500/15 to-transparent rounded-bl-full pointer-events-none" />
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">ACTIVE ORGANIZERS</span>
              <div className="p-2.5 rounded-xl bg-[#0F766E]/10 text-[#0F766E] group-hover:scale-110 transition-transform">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">{organizers.length} Guilds</h3>
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold mt-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>4 Verified & Approved</span>
              </div>
            </div>
          </motion.div>

          {/* Card 2 */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="group relative bg-white p-5 rounded-2xl border border-slate-200/90 hover:border-[#F97316] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-orange-500/15 to-transparent rounded-bl-full pointer-events-none" />
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">PLATFORM POOL</span>
              <div className="p-2.5 rounded-xl bg-[#F97316]/10 text-[#F97316] group-hover:scale-110 transition-transform">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">₹31.8 Lakhs</h3>
              <div className="flex items-center gap-1.5 text-xs text-[#0F766E] font-bold mt-1">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>+24.6% Monthly Growth</span>
              </div>
            </div>
          </motion.div>

          {/* Card 3 */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="group relative bg-white p-5 rounded-2xl border border-slate-200/90 hover:border-indigo-500 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-indigo-500/15 to-transparent rounded-bl-full pointer-events-none" />
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">GATE TRANSACTIONS</span>
              <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 group-hover:scale-110 transition-transform">
                <Zap className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">2,480 Passes</h3>
              <div className="flex items-center gap-1.5 text-xs text-indigo-600 font-bold mt-1">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Zero Breach Incidents</span>
              </div>
            </div>
          </motion.div>

          {/* Card 4 */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="group relative bg-white p-5 rounded-2xl border border-slate-200/90 hover:border-purple-500 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-purple-500/15 to-transparent rounded-bl-full pointer-events-none" />
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">DEFENSE SHIELD</span>
              <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 group-hover:scale-110 transition-transform">
                <Shield className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">Level 5 Max</h3>
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold mt-1">
                <Activity className="h-3.5 w-3.5" />
                <span>Anti-Bot Shield Active</span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Gaming Controller Navigation Tabs (Pill style with neon active gradient) */}
        <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap gap-2">
          {[
            { id: 'organizers', label: 'Organizer Guild Roster', icon: Users, badge: '5 Total' },
            { id: 'settlements', label: 'Treasury & Batch Settlements', icon: DollarSign, badge: '1 Pending' },
            { id: 'logs', label: 'System Blackbox Logs', icon: Terminal, badge: 'Live Feed' },
            { id: 'security', label: 'Cyber Defense & Rate Limits', icon: Lock, badge: 'Armored' },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 min-w-[200px] flex items-center justify-between px-4 py-3 rounded-xl font-bold text-xs transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-[#0F766E] to-[#115E59] text-white shadow-md shadow-[#0F766E]/20 scale-[1.01]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${isActive ? 'text-[#F97316]' : 'text-slate-400'}`} />
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

        {/* Tab 1: Organizer Management */}
        {activeTab === 'organizers' && (
          <motion.div 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0F766E] uppercase tracking-wider bg-[#CCFBF1]/40 px-2.5 py-0.5 rounded-full mb-1">
                  <Gamepad2 className="h-3 w-3" /> Guild Verification
                </div>
                <h3 className="text-xl font-black text-slate-900">Organizer Guilds Oversight</h3>
                <p className="text-xs text-slate-500">Approve new host applications, audit trust scores, or freeze offending accounts</p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search guild, owner, email..."
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#0F766E] transition"
                />
              </div>
            </div>

            {/* Organizers Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-100">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-[#FAFAF9] text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Guild ID</th>
                    <th className="p-3.5">Organization</th>
                    <th className="p-3.5">Guildmaster / Lead</th>
                    <th className="p-3.5">Events Hosted</th>
                    <th className="p-3.5">Trust Score</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Governance Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <AnimatePresence>
                    {filteredOrganizers.map(org => (
                      <motion.tr 
                        key={org.id} 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-slate-50/80 transition"
                      >
                        <td className="p-3.5 font-mono font-bold text-[#0F766E]">{org.id}</td>
                        <td className="p-3.5">
                          <div className="font-extrabold text-slate-900 text-sm">{org.name}</div>
                          <span className="text-[10px] text-slate-400 font-mono">Volume: {org.volume}</span>
                        </td>
                        <td className="p-3.5">
                          <div className="font-semibold text-slate-800">{org.owner}</div>
                          <div className="text-[10px] text-slate-400">{org.email}</div>
                        </td>
                        <td className="p-3.5 font-bold text-slate-700">{org.eventsCount} Events</td>
                        <td className="p-3.5">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                              <div 
                                className={`h-1.5 rounded-full ${
                                  org.trustScore > 90 ? 'bg-emerald-500' : org.trustScore > 75 ? 'bg-amber-500' : 'bg-rose-500'
                                }`} 
                                style={{ width: `${org.trustScore}%` }}
                              />
                            </div>
                            <span className="font-mono text-[11px] font-bold text-slate-700">{org.trustScore}%</span>
                          </div>
                        </td>
                        <td className="p-3.5">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            org.status === 'approved'
                              ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                              : org.status === 'pending'
                              ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                              : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                          }`}>
                            {org.status === 'approved' ? 'VERIFIED' : org.status === 'pending' ? 'PENDING' : 'SUSPENDED'}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => toggleOrganizerStatus(org.id)}
                            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition shadow-xs ${
                              org.status === 'approved'
                                ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200'
                                : 'bg-[#0F766E] text-white hover:bg-[#115E59]'
                            }`}
                          >
                            {org.status === 'approved' ? 'Freeze Access' : 'Approve Guild'}
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Tab 2: Settlements */}
        {activeTab === 'settlements' && (
          <motion.div 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6"
          >
            <div className="border-b border-slate-100 pb-5">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F97316] uppercase tracking-wider bg-[#FFEDD5] px-2.5 py-0.5 rounded-full mb-1">
                <DollarSign className="h-3 w-3" /> Treasury Dispatcher
              </div>
              <h3 className="text-xl font-black text-slate-900">Platform Treasury Settlements & Refunds</h3>
              <p className="text-xs text-slate-500">Authorize automated banking settlements to verified organizer accounts</p>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0F766E]/10 via-[#0F766E]/5 to-transparent border border-[#0F766E]/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-[#0F766E] bg-white px-2 py-0.5 rounded-md border border-[#0F766E]/20">
                  BATCH #SETTLE-884
                </span>
                <h4 className="font-extrabold text-slate-900 text-lg mt-2">Ready for Bank Execution: ₹11,65,725</h4>
                <p className="text-slate-500 text-xs mt-0.5">Aggregated payouts across 4 events • UPI & NEFT Gateway routes ready</p>
              </div>
              <button
                onClick={() => alert('Batch bank payout triggered successfully!')}
                className="rounded-xl bg-gradient-to-r from-[#0F766E] to-emerald-600 px-5 py-3 font-bold text-xs text-white hover:shadow-lg hover:shadow-emerald-500/25 transition flex items-center gap-2"
              >
                <Check className="h-4 w-4" />
                <span>Execute Batch Payout (₹11.65L)</span>
              </button>
            </div>

            {/* Breakdown Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-xs text-slate-400 font-semibold block">Total Settled (YTD)</span>
                <h5 className="text-xl font-extrabold text-slate-900 mt-1">₹1,48,50,000</h5>
                <span className="text-[11px] text-emerald-600 font-bold">100% Payout Reliability</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-xs text-slate-400 font-semibold block">Commission Retained (3.5%)</span>
                <h5 className="text-xl font-extrabold text-slate-900 mt-1">₹5,19,750</h5>
                <span className="text-[11px] text-[#0F766E] font-bold">Platform Revenue</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-xs text-slate-400 font-semibold block">Processed Refunds</span>
                <h5 className="text-xl font-extrabold text-slate-900 mt-1">12 Attendees</h5>
                <span className="text-[11px] text-slate-500 font-medium">Automatic 3-day turnaround</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 3: Security Audit Logs */}
        {activeTab === 'logs' && (
          <motion.div 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6"
          >
            <div className="border-b border-slate-100 pb-5">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2.5 py-0.5 rounded-full mb-1">
                <Terminal className="h-3 w-3" /> Blackbox Telemetry
              </div>
              <h3 className="text-xl font-black text-slate-900">Platform Security & Audit Trail</h3>
              <p className="text-xs text-slate-500">Immutable governance actions logged across administrative users and automated workers</p>
            </div>

            <div className="space-y-3">
              {mockAuditLogs.map(log => (
                <div 
                  key={log.id} 
                  className="p-4 rounded-2xl bg-slate-50 hover:bg-[#FAFAF9] border border-slate-200/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-slate-200/70 text-slate-700 font-mono text-[10px] font-bold shrink-0">
                      {log.id}
                    </div>
                    <div>
                      <div className="font-extrabold text-[#0F766E] font-mono text-xs flex items-center gap-2">
                        <span>{log.action}</span>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 text-[9px] font-bold font-mono">
                          {log.status}
                        </span>
                      </div>
                      <div className="text-slate-600 font-medium mt-0.5">{log.target}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Triggered by: <strong>{log.user}</strong></div>
                    </div>
                  </div>
                  <div className="text-right text-[11px] text-slate-400 font-mono">
                    <div className="font-semibold text-slate-600">{log.timestamp}</div>
                    <div className="text-slate-400">IP: {log.ip}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Tab 4: Security Settings */}
        {activeTab === 'security' && (
          <motion.div 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6"
          >
            <div className="border-b border-slate-100 pb-5">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 uppercase tracking-wider bg-rose-50 px-2.5 py-0.5 rounded-full mb-1">
                <ShieldCheck className="h-3 w-3" /> Citadel Defense
              </div>
              <h3 className="text-xl font-black text-slate-900">Cyber Defense, Rate Limiting & Bot Armor</h3>
              <p className="text-xs text-slate-500">Fine-tune public checkout throttle limits, cryptographic pass hashing, and DDoS prevention</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-[#0F766E]" /> API Throttle Sentinel
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md">
                    ACTIVE
                  </span>
                </div>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Rate limiting restricted to 60 requests / minute per client IP address on public event endpoints and search APIs.
                </p>
                <div className="pt-2 flex items-center justify-between text-xs font-bold text-[#0F766E]">
                  <span>Threshold: 60 req/min</span>
                  <span className="hover:underline cursor-pointer">Configure Rule →</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-[#F97316]" /> Bot Armor & Fraud Shield
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md">
                    ENFORCED
                  </span>
                </div>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Automatic fraud scoring on multiple failed UPI requests and rapid checkout submissions within seconds.
                </p>
                <div className="pt-2 flex items-center justify-between text-xs font-bold text-[#F97316]">
                  <span>Behavioral Analysis: ON</span>
                  <span className="hover:underline cursor-pointer">View Guardrails →</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  );
}
