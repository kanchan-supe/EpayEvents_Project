'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, Users, Calendar, DollarSign, Settings, CheckCircle2, XCircle, AlertTriangle, Lock, Search, Filter, RefreshCw, FileText
} from 'lucide-react';
import { Navbar, Footer } from '@/components/NavbarFooter';
import { mockEvents } from '@/lib/data';

const initialOrganizers = [
  { id: 'ORG-101', name: 'ePay Global Tech', owner: 'Rajesh Malhotra', email: 'rajesh@epay.com', eventsCount: 4, status: 'approved', joined: '2026-08-12' },
  { id: 'ORG-102', name: 'AI Builders Club', owner: 'Priya Nambiar', email: 'priya@neural.ai', eventsCount: 2, status: 'approved', joined: '2026-09-01' },
  { id: 'ORG-103', name: 'UX Craft Academy', owner: 'Sarah Jenkins', email: 'sarah@uxcraft.com', eventsCount: 1, status: 'pending', joined: '2026-10-04' },
  { id: 'ORG-104', name: 'Soundwave Collective', owner: 'Aarav Sharma', email: 'aarav@soundwave.in', eventsCount: 3, status: 'approved', joined: '2026-07-22' },
];

const mockAuditLogs = [
  { id: 'LOG-901', action: 'ORGANIZER_APPROVED', user: 'Super Admin', target: 'UX Craft Academy', timestamp: '2026-10-07 09:30 AM', ip: '192.168.1.45' },
  { id: 'LOG-902', action: 'SETTLEMENT_PROCESSED', user: 'Super Admin', target: 'Payout ₹11,65,725 to ePay Global', timestamp: '2026-10-06 04:15 PM', ip: '192.168.1.45' },
  { id: 'LOG-903', action: 'EVENT_STATUS_CHANGED', user: 'Rajesh Malhotra', target: 'FinTech Summit 2026 -> Published', timestamp: '2026-10-05 11:20 AM', ip: '103.22.41.12' },
];

export default function SuperAdminPage() {
  const [organizers, setOrganizers] = useState(initialOrganizers);
  const [activeTab, setActiveTab] = useState<'organizers' | 'settlements' | 'logs' | 'security'>('organizers');
  const [searchQuery, setSearchQuery] = useState('');

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
    o => o.name.toLowerCase().includes(searchQuery.toLowerCase()) || o.owner.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-white">
      <Navbar />

      <div className="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-8">
        <div className="container mx-auto px-4 md:px-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-widest text-amber-400 font-bold bg-amber-950 border border-amber-800 px-2.5 py-0.5 rounded-full">
                Super Admin Privilege
              </span>
            </div>
            <h1 className="text-2xl font-extrabold mt-2">Platform Control Panel & Governance</h1>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 md:px-8 py-10 flex-1 space-y-8">
        {/* Navigation Tabs */}
        <div className="flex gap-2 border-b border-slate-800 pb-4 overflow-x-auto">
          {[
            { id: 'organizers', label: 'Organizer Approval & Management', icon: Users },
            { id: 'settlements', label: 'Platform Settlements & Refunds', icon: DollarSign },
            { id: 'logs', label: 'Security Audit Logs', icon: FileText },
            { id: 'security', label: 'Rate Limiting & Security Settings', icon: Lock },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow'
                    : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="h-4 w-4" /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab 1: Organizer Management */}
        {activeTab === 'organizers' && (
          <div className="bg-slate-800/60 rounded-2xl border border-slate-700/80 p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h3 className="font-bold text-lg">Organizers Oversight</h3>

              <div className="relative w-full sm:w-64">
                <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Filter organizers..."
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 pl-9 pr-4 py-2 text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/80 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3">Org ID</th>
                    <th className="p-3">Organization</th>
                    <th className="p-3">Owner / Contact</th>
                    <th className="p-3">Hosted Events</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Governance Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {filteredOrganizers.map(org => (
                    <tr key={org.id} className="hover:bg-slate-800/40">
                      <td className="p-3 font-mono text-slate-400">{org.id}</td>
                      <td className="p-3 font-bold text-white">{org.name}</td>
                      <td className="p-3">
                        <div className="font-semibold">{org.owner}</div>
                        <div className="text-[10px] text-slate-400">{org.email}</div>
                      </td>
                      <td className="p-3 font-semibold">{org.eventsCount} Events</td>
                      <td className="p-3">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          org.status === 'approved'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : org.status === 'pending'
                            ? 'bg-amber-950 text-amber-400 border border-amber-800'
                            : 'bg-red-950 text-red-400 border border-red-800'
                        }`}>
                          {org.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => toggleOrganizerStatus(org.id)}
                          className={`rounded-lg px-3 py-1 text-xs font-semibold border transition ${
                            org.status === 'approved'
                              ? 'bg-red-950 text-red-300 border-red-800 hover:bg-red-900'
                              : 'bg-emerald-950 text-emerald-300 border-emerald-800 hover:bg-emerald-900'
                          }`}
                        >
                          {org.status === 'approved' ? 'Suspend Access' : 'Approve Organizer'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Settlements */}
        {activeTab === 'settlements' && (
          <div className="bg-slate-800/60 rounded-2xl border border-slate-700/80 p-6 space-y-4">
            <h3 className="font-bold text-lg">System Payout & Settlement Approvals</h3>
            <div className="p-4 bg-slate-900 rounded-xl border border-slate-700 flex justify-between items-center text-xs">
              <div>
                <h4 className="font-bold text-white">Pending Organizer Settlements: 1 Batch</h4>
                <p className="text-slate-400 mt-0.5">Total payout amount ready: ₹11,65,725 across 4 events</p>
              </div>
              <button
                onClick={() => alert('Batch payout executed to linked organizer bank accounts.')}
                className="rounded-xl bg-emerald-600 px-4 py-2 font-bold text-white hover:bg-emerald-700"
              >
                Approve & Execute Bank Payout
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Security Audit Logs */}
        {activeTab === 'logs' && (
          <div className="bg-slate-800/60 rounded-2xl border border-slate-700/80 p-6 space-y-4">
            <h3 className="font-bold text-lg">Platform Audit Logs</h3>
            <div className="space-y-3">
              {mockAuditLogs.map(log => (
                <div key={log.id} className="p-3.5 bg-slate-900 rounded-xl border border-slate-700/70 flex justify-between items-center text-xs">
                  <div>
                    <div className="font-bold text-blue-400 font-mono">{log.action}</div>
                    <div className="text-slate-300 mt-0.5">{log.target}</div>
                  </div>
                  <div className="text-right text-[11px] text-slate-400">
                    <div>{log.timestamp}</div>
                    <div className="font-mono">{log.ip}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Security Settings */}
        {activeTab === 'security' && (
          <div className="bg-slate-800/60 rounded-2xl border border-slate-700/80 p-6 space-y-6">
            <h3 className="font-bold text-lg">Security & Public Form Rate Limiting</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-700 space-y-2">
                <span className="font-bold text-emerald-400">API Rate Limiting</span>
                <p className="text-slate-400">Public endpoints restricted to 60 requests / min per IP.</p>
              </div>
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-700 space-y-2">
                <span className="font-bold text-emerald-400">CAPTCHA & Bot Shield</span>
                <p className="text-slate-400">Active on public ticket checkout and organizer registration forms.</p>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
