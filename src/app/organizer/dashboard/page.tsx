'use client';

import React from 'react';
import Link from 'next/link';
import { 
  BarChart3, Calendar, Users, DollarSign, QrCode, PlusCircle, Download, CheckCircle2, Search, ArrowUpRight, TrendingUp, Settings, Wallet
} from 'lucide-react';
import { Navbar, Footer } from '@/components/NavbarFooter';
import { mockEvents } from '@/lib/data';

const mockRegistrations = [
  { id: 'REG-101', name: 'Alex Morgan', email: 'alex@example.com', ticket: 'General Admission', status: 'Checked In', checkinTime: '10:14 AM', price: 2499, date: '2026-10-07' },
  { id: 'REG-102', name: 'Sarah Jenkins', email: 'sarah@stripe.com', ticket: 'VIP Developer Pass', status: 'Pending', checkinTime: '-', price: 5999, date: '2026-10-07' },
  { id: 'REG-103', name: 'Aarav Sharma', email: 'aarav@finpulse.io', ticket: 'General Admission', status: 'Checked In', checkinTime: '09:45 AM', price: 2499, date: '2026-10-07' },
  { id: 'REG-104', name: 'Priya Nambiar', email: 'priya@neural.ai', ticket: 'VIP Developer Pass', status: 'Checked In', checkinTime: '09:30 AM', price: 5999, date: '2026-10-06' },
  { id: 'REG-105', name: 'David Miller', email: 'david@cloud.com', ticket: 'Virtual Pass', status: 'Pending', checkinTime: '-', price: 0, date: '2026-10-06' },
];



export default function OrganizerDashboardPage() {
  const totalEvents = mockEvents.length;
  const totalRegistrations = 842;
  const totalRevenue = 1485000;
  const checkedInCount = 512;
  const checkinRate = Math.round((checkedInCount / totalRegistrations) * 100);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <div className="bg-slate-900 text-white py-8 border-b border-slate-800">
        <div className="container mx-auto px-4 md:px-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-blue-400 font-bold">Organizer Portal</span>
            <h1 className="text-2xl font-extrabold mt-1">Dashboard & Analytics</h1>
          </div>

          <div className="flex gap-3">
            <Link
              href="/organizer/scanner"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-700 transition"
            >
              <QrCode className="h-4 w-4" /> Open QR Scanner
            </Link>
            <Link
              href="/create-event"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-blue-700 transition"
            >
              <PlusCircle className="h-4 w-4" /> Create Event
            </Link>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 md:px-8 py-10 flex-1 space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Hosted Events</span>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{totalEvents}</h3>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5" /> +2 this month
              </p>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Calendar className="h-6 w-6" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Attendees</span>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{totalRegistrations.toLocaleString()}</h3>
              <p className="text-[11px] text-slate-500 mt-1">Across all tickets</p>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <Users className="h-6 w-6" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Gross Revenue</span>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">₹{(totalRevenue / 100000).toFixed(2)} Lakhs</h3>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1">Payout status: Settled</p>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <Wallet className="h-6 w-6" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Live Check-in Rate</span>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{checkinRate}%</h3>
              <p className="text-[11px] text-slate-500 mt-1">{checkedInCount} / {totalRegistrations} checked in</p>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <QrCode className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Live Check-in Counter & Recent Registrations */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Recent Registrations & Attendees</h3>
                <p className="text-xs text-slate-500">Live attendee feed with CSV export support</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => alert('Exporting Attendee CSV report...')}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Export CSV
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-3">Reg ID</th>
                    <th className="p-3">Attendee Name</th>
                    <th className="p-3">Ticket Pass</th>
                    <th className="p-3">Check-in Status</th>
                    <th className="p-3">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {mockRegistrations.map((reg) => (
                    <tr key={reg.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3 font-mono font-semibold text-slate-900">{reg.id}</td>
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{reg.name}</div>
                        <div className="text-[10px] text-slate-400">{reg.email}</div>
                      </td>
                      <td className="p-3 font-medium text-slate-700">{reg.ticket}</td>
                      <td className="p-3">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          reg.status === 'Checked In' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          <CheckCircle2 className="h-3 w-3" /> {reg.status} ({reg.checkinTime})
                        </span>
                      </td>
                      <td className="p-3 font-bold text-slate-900">₹{reg.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Settlement & Payout Summary */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <Wallet className="h-5 w-5 text-emerald-600" /> Settlement Payouts
              </h3>

              <div className="space-y-3 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Gross Ticket Sales</span>
                  <span className="font-bold text-slate-900">₹14,85,000</span>
                </div>
                <div className="flex justify-between">
                  <span>Platform Fee (3.5%)</span>
                  <span>-₹51,975</span>
                </div>
                <div className="flex justify-between">
                  <span>GST Tax Retained</span>
                  <span>-₹2,67,300</span>
                </div>
                <div className="pt-3 border-t border-slate-100 flex justify-between text-sm font-extrabold text-slate-900">
                  <span>Net Payout Ready</span>
                  <span className="text-emerald-600">₹11,65,725</span>
                </div>
              </div>

              <div className="pt-2">
                <span className="inline-block rounded-lg bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700 border border-emerald-200 w-full text-center">
                  Direct Bank Payout Processed (ePay Settlement)
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
