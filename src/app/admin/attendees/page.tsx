'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Ticket, Calendar, DollarSign, Download, Search, 
  Filter, RefreshCw, FileText, CheckCircle2, XCircle, 
  Eye, QrCode, AlertCircle, ArrowLeft, ShieldCheck, 
  ExternalLink, ChevronLeft, ChevronRight, Phone, Mail, 
  Sparkles, Check, Clock, UserCheck, Link2, Percent
} from 'lucide-react';
import { Navbar, Footer } from '@/components/NavbarFooter';
import { useAuth } from '@/context/AuthContext';
import { QRCodeImage } from '@/components/QRCodeImage';

interface BookingItem {
  bookingId: string;
  orderId: string;
  ticketCode: string;
  attendeeName: string;
  attendeeEmail: string;
  attendeePhone: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  venue: string;
  venueCity: string;
  ticketTierId: string;
  ticketTierName: string;
  amountPaid: number;
  bookingDate: string;
  paymentStatus: 'completed' | 'pending' | 'cancelled' | 'refunded';
  ticketStatus: 'valid' | 'checked_in' | 'cancelled' | 'refunded';
  paymentMethod: string;
  qrPayload?: string;
  customResponses?: Record<string, any>;
}

export default function AdminBookingsPage() {
  const router = useRouter();
  const { user, role, loading: authLoading } = useAuth();

  // Allow test preview if developing
  const [demoBypass, setDemoBypass] = useState(false);
  const isAuthorized = role === 'admin' || demoBypass;

  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [distinctEvents, setDistinctEvents] = useState<{ id: string; title: string }[]>([]);
  const [summary, setSummary] = useState({ totalBookings: 0, totalCompleted: 0, totalRevenue: 0 });
  const [loading, setLoading] = useState(true);

  // Filter & Search states
  const [search, setSearch] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  // View Mode: 'attendees' or 'referrals'
  const [viewTab, setViewTab] = useState<'attendees' | 'referrals'>('attendees');
  const [referralsList, setReferralsList] = useState<any[]>([]);
  const [loadingReferrals, setLoadingReferrals] = useState(false);

  // Modals
  const [activeDetailsBooking, setActiveDetailsBooking] = useState<BookingItem | null>(null);
  const [activeTicketPreview, setActiveTicketPreview] = useState<BookingItem | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const fetchReferrals = async () => {
    setLoadingReferrals(true);
    try {
      const res = await fetch('/api/promotions?type=referrals');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setReferralsList(json.data);
      }
    } catch (e) {
      console.warn('Failed to fetch referrals in admin:', e);
    } finally {
      setLoadingReferrals(false);
    }
  };

  useEffect(() => {
    if (viewTab === 'referrals') {
      fetchReferrals();
    }
  }, [viewTab]);

  const fetchBookings = async (pageToFetch = currentPage) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: pageToFetch.toString(),
        limit: pageSize.toString(),
        search,
        event: selectedEvent,
        status: selectedStatus,
        adminRole: role || 'admin',
      });

      const res = await fetch(`/api/admin/bookings?${queryParams.toString()}`);
      const json = await res.json();

      if (json.success && json.data) {
        setBookings(json.data.bookings || []);
        setDistinctEvents(json.data.distinctEvents || []);
        setSummary(json.data.summary || { totalBookings: 0, totalCompleted: 0, totalRevenue: 0 });
        if (json.data.pagination) {
          setCurrentPage(json.data.pagination.currentPage);
          setTotalPages(json.data.pagination.totalPages);
          setTotalCount(json.data.pagination.totalCount);
        }
      }
    } catch (err) {
      console.warn('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings(1);
  }, [search, selectedEvent, selectedStatus]);

  // Handle Individual PDF Download
  const handleDownloadTicketPdf = async (booking: BookingItem) => {
    setDownloadingId(booking.bookingId);
    try {
      const endpoint = `/api/admin/tickets/${encodeURIComponent(booking.bookingId)}/download`;
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error('Download failed');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ePayEvents-Ticket-${booking.ticketCode || booking.bookingId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (e: any) {
      alert(`Could not download ticket PDF: ${e.message}`);
    } finally {
      setDownloadingId(null);
    }
  };

  // Export CSV of Current Bookings
  const handleExportCsv = () => {
    if (bookings.length === 0) {
      alert('No booking records to export');
      return;
    }

    const headers = [
      'Booking ID',
      'Order ID',
      'Ticket Code',
      'Attendee Name',
      'Email',
      'Phone',
      'Event Title',
      'Ticket Tier',
      'Amount Paid (INR)',
      'Booking Date',
      'Payment Status',
      'Ticket Status',
      'Payment Method',
    ];

    const rows = bookings.map((b) => [
      `"${b.bookingId}"`,
      `"${b.orderId}"`,
      `"${b.ticketCode}"`,
      `"${b.attendeeName.replace(/"/g, '""')}"`,
      `"${b.attendeeEmail}"`,
      `"${b.attendeePhone}"`,
      `"${b.eventTitle.replace(/"/g, '""')}"`,
      `"${b.ticketTierName.replace(/"/g, '""')}"`,
      b.amountPaid,
      `"${new Date(b.bookingDate).toLocaleDateString('en-US')}"`,
      `"${b.paymentStatus}"`,
      `"${b.ticketStatus}"`,
      `"${b.paymentMethod}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ePayEvents-Attendees-Bookings-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF9] text-slate-900 font-sans">
      <Navbar />

      {/* Top Banner */}
      <section className="bg-gradient-to-r from-slate-950 via-slate-900 to-teal-950 text-white border-b border-white/10 pt-10 pb-12">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Link
                  href="/admin"
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Back to Admin Overview
                </Link>
                <span className="text-slate-600">•</span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[10px] font-bold uppercase tracking-wider">
                  <ShieldCheck className="h-3 w-3" /> Master Governance
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
                <span>Attendee & Booking Intelligence</span>
                <span className="text-xs font-bold bg-[#F97316] text-white px-2.5 py-0.5 rounded-full">
                  {summary.totalBookings} Total
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
                Inspect registered participants, download individual gate tickets as PDF, inspect custom form questions, and export full reports.
              </p>
            </div>

            {/* Top Quick Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleExportCsv}
                className="rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 text-xs font-bold transition flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <Download className="h-4 w-4 text-emerald-400" />
                <span>Export CSV Report</span>
              </button>

              <button
                type="button"
                onClick={() => fetchBookings(currentPage)}
                className="rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white px-4 py-2.5 text-xs font-bold transition flex items-center gap-2 shadow-md cursor-pointer"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh Feed</span>
              </button>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-white/10">
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Bookings</span>
              <span className="text-2xl font-black text-white mt-1 block">{summary.totalBookings} Passes</span>
            </div>

            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Completed Admissions</span>
              <span className="text-2xl font-black text-emerald-400 mt-1 block">{summary.totalCompleted} Passes</span>
            </div>

            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Gross Pass Revenue</span>
              <span className="text-2xl font-black text-[#F97316] mt-1 block">₹{summary.totalRevenue.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Table & Filter Area */}
      <main className="container mx-auto px-4 md:px-8 py-8 flex-1">
        
        {/* Navigation Tabs between Bookings & Referrals */}
        <div className="flex border-b border-slate-200 gap-4 mb-6">
          <button
            onClick={() => setViewTab('attendees')}
            className={`pb-3 text-sm font-black flex items-center gap-2 border-b-2 transition cursor-pointer ${
              viewTab === 'attendees'
                ? 'border-[#0F766E] text-[#0F766E]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Attendee Bookings ({summary.totalBookings})</span>
          </button>

          <button
            onClick={() => setViewTab('referrals')}
            className={`pb-3 text-sm font-black flex items-center gap-2 border-b-2 transition cursor-pointer ${
              viewTab === 'referrals'
                ? 'border-[#F97316] text-[#F97316]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Link2 className="h-4 w-4" />
            <span>Affiliate & Referral Intelligence ({referralsList.length})</span>
          </button>
        </div>

        {viewTab === 'referrals' ? (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-[#E7E5E4] shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">All Organizer Affiliate & Referral Programs</h3>
                  <p className="text-xs text-slate-500">Monitor tracking links, attendee discount percentages, referral ticket conversions, gross revenue, and partner payouts across all events.</p>
                </div>
                <button
                  onClick={fetchReferrals}
                  className="rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${loadingReferrals ? 'animate-spin' : ''}`} />
                  <span>Refresh Referrals</span>
                </button>
              </div>

              {loadingReferrals ? (
                <div className="py-12 text-center text-slate-400 text-xs">Loading affiliate intelligence...</div>
              ) : referralsList.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">No referral links registered yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-[#FAFAF9] border-b border-[#E7E5E4] text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      <tr>
                        <th className="py-3 px-4">Affiliate / Partner</th>
                        <th className="py-3 px-4">Event</th>
                        <th className="py-3 px-4">Referral Code</th>
                        <th className="py-3 px-4">Discount % Given</th>
                        <th className="py-3 px-4">Total Clicks</th>
                        <th className="py-3 px-4">Ticket Sales</th>
                        <th className="py-3 px-4">Revenue Generated</th>
                        <th className="py-3 px-4">Commission Earned</th>
                        <th className="py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {referralsList.map((ref) => (
                        <tr key={ref.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-3.5 px-4 font-bold text-slate-900">
                            <div>{ref.affiliateName}</div>
                            <span className="text-[10px] text-slate-400 capitalize">{ref.type?.replace('_', ' ')} • {ref.affiliateEmail || 'No email'}</span>
                          </td>
                          <td className="py-3.5 px-4 font-medium text-slate-800">
                            {ref.eventTitle}
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-orange-600">
                            {ref.code}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                              {ref.discountPercent || 0}% OFF
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-700">
                            {ref.clickCount || 0}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-[#0F766E]">
                            {ref.conversionsCount || 0} bookings
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-900">
                            ₹{(ref.totalRevenueGenerated || 0).toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-orange-600">
                            ₹{(ref.totalCommissionEarned || 0).toLocaleString()} ({ref.commissionPercent}%)
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              ref.payoutStatus === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {ref.payoutStatus || 'unpaid'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Filters & Search Control Bar */}
            <div className="bg-white p-4 rounded-2xl border border-[#E7E5E4] shadow-xs mb-6 space-y-3">
              <div className="flex flex-col md:flex-row gap-3">
                {/* Search Input */}
                <div className="flex-1 relative">
                  <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by attendee name, email, phone, ticket ID, or event..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0F766E] bg-slate-50/60"
                  />
                </div>

                {/* Event Filter */}
                <div className="w-full md:w-64">
                  <select
                    value={selectedEvent}
                    onChange={(e) => setSelectedEvent(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0F766E] bg-slate-50/60 font-medium"
                  >
                    <option value="all">All Events ({distinctEvents.length})</option>
                    {distinctEvents.map((evt, idx) => (
                      <option key={`${evt.id}-${idx}`} value={evt.id}>
                        {evt.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div className="w-full md:w-48">
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0F766E] bg-slate-50/60 font-medium"
                  >
                    <option value="all">All Statuses</option>
                    <option value="completed">Completed / Valid</option>
                    <option value="pending">Pending Approval</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>
              </div>
            </div>

        {/* Data Table */}
        <div className="bg-white rounded-3xl border border-[#E7E5E4] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-[#FAFAF9] border-b border-[#E7E5E4] text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-4 px-4">Attendee</th>
                  <th className="py-4 px-4">Contact</th>
                  <th className="py-4 px-4">Event & Pass</th>
                  <th className="py-4 px-4">Amount</th>
                  <th className="py-4 px-4">Booking Date</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-4">Booking ID</th>
                  <th className="py-4 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E5E4]">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      <div className="animate-spin h-6 w-6 border-2 border-[#0F766E] border-t-transparent rounded-full mx-auto mb-2" />
                      Loading bookings directory...
                    </td>
                  </tr>
                ) : bookings.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      No attendee bookings matched your filters.
                    </td>
                  </tr>
                ) : (
                  bookings.map((b) => {
                    const isPaid = b.paymentStatus === 'completed';
                    const isCancelled = b.paymentStatus === 'cancelled' || b.paymentStatus === 'refunded';

                    return (
                      <tr key={b.bookingId} className="hover:bg-slate-50/80 transition-colors">
                        {/* Attendee Name */}
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-teal-50 border border-teal-200 text-[#0F766E] flex items-center justify-center font-bold text-xs uppercase">
                              {b.attendeeName.charAt(0)}
                            </div>
                            <span>{b.attendeeName}</span>
                          </div>
                        </td>

                        {/* Contact (Email + Phone) */}
                        <td className="py-3.5 px-4 space-y-0.5">
                          <div className="flex items-center gap-1.5 text-slate-700">
                            <Mail className="h-3 w-3 text-slate-400" />
                            <span>{b.attendeeEmail}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                            <Phone className="h-3 w-3 text-slate-400" />
                            <span>{b.attendeePhone || '—'}</span>
                          </div>
                        </td>

                        {/* Event Name & Ticket Tier */}
                        <td className="py-3.5 px-4 space-y-1">
                          <div className="font-extrabold text-slate-900 line-clamp-1 max-w-[220px]">
                            {b.eventTitle}
                          </div>
                          <span className="inline-block text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-full">
                            {b.ticketTierName}
                          </span>
                        </td>

                        {/* Amount Paid */}
                        <td className="py-3.5 px-4 font-black text-slate-900">
                          {b.amountPaid === 0 ? (
                            <span className="text-emerald-700 font-bold">FREE</span>
                          ) : (
                            `₹${b.amountPaid.toLocaleString()}`
                          )}
                        </td>

                        {/* Booking Date */}
                        <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                          {new Date(b.bookingDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </td>

                        {/* Payment & Pass Status */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                              isPaid
                                ? 'bg-emerald-100 text-emerald-800'
                                : isCancelled
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {isPaid && <Check className="h-3 w-3 text-emerald-600" />}
                            {b.paymentStatus}
                          </span>
                        </td>

                        {/* Booking ID / Ticket Code */}
                        <td className="py-3.5 px-4 font-mono font-bold text-[11px] text-[#0F766E]">
                          {b.ticketCode || b.bookingId}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* View Full Booking Details Modal */}
                            <button
                              type="button"
                              onClick={() => setActiveDetailsBooking(b)}
                              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 transition cursor-pointer"
                              title="View Full Booking & Registration Form Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>

                            {/* View QR Pass on Screen */}
                            <button
                              type="button"
                              onClick={() => setActiveTicketPreview(b)}
                              className="p-1.5 rounded-lg border border-teal-200 bg-teal-50 text-[#0F766E] hover:bg-teal-100 transition cursor-pointer"
                              title="Preview Gate QR Code"
                            >
                              <QrCode className="h-4 w-4" />
                            </button>

                            {/* Download PDF Ticket */}
                            <button
                              type="button"
                              onClick={() => handleDownloadTicketPdf(b)}
                              disabled={downloadingId === b.bookingId}
                              className="p-1.5 rounded-lg border border-[#F97316]/30 bg-orange-50 text-[#F97316] hover:bg-orange-100 transition cursor-pointer"
                              title="Download Official Ticket Pass PDF"
                            >
                              <Download className={`h-4 w-4 ${downloadingId === b.bookingId ? 'animate-bounce' : ''}`} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Bottom Footer */}
          <div className="p-4 bg-[#FAFAF9] border-t border-[#E7E5E4] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-medium">
            <span>
              Showing {bookings.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
              {Math.min(currentPage * pageSize, totalCount)} of {totalCount} total entries
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => fetchBookings(Math.max(1, currentPage - 1))}
                disabled={currentPage <= 1 || loading}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <span className="px-3 py-1 font-bold text-slate-800 bg-white border border-slate-200 rounded-lg">
                Page {currentPage} of {totalPages}
              </span>

              <button
                type="button"
                onClick={() => fetchBookings(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage >= totalPages || loading}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        </>
      )}
      </main>

      {/* MODAL 1: VIEW FULL DETAILS & CUSTOM FORM RESPONSES */}
      <AnimatePresence>
        {activeDetailsBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden text-slate-900 my-8"
            >
              <div className="bg-gradient-to-r from-slate-900 to-[#0F766E] p-5 text-white flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-base">Booking & Registration Record</h4>
                  <span className="text-[10px] text-teal-300 font-mono">{activeDetailsBooking.ticketCode}</span>
                </div>
                <button
                  onClick={() => setActiveDetailsBooking(null)}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
                {/* Event Summary */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Event & Pass</span>
                  <h5 className="font-extrabold text-sm text-slate-900">{activeDetailsBooking.eventTitle}</h5>
                  <p className="text-slate-600">
                    {activeDetailsBooking.ticketTierName} • ₹{activeDetailsBooking.amountPaid.toLocaleString()}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Venue: {activeDetailsBooking.venue}, {activeDetailsBooking.venueCity}
                  </p>
                </div>

                {/* Attendee Details */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Attendee Details</span>
                  <div className="grid grid-cols-2 gap-2 text-slate-800">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Full Name</span>
                      <strong>{activeDetailsBooking.attendeeName}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Email</span>
                      <strong>{activeDetailsBooking.attendeeEmail}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Phone</span>
                      <strong>{activeDetailsBooking.attendeePhone || '—'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Payment Method</span>
                      <strong className="capitalize">{activeDetailsBooking.paymentMethod.replace('_', ' ')}</strong>
                    </div>
                  </div>
                </div>

                {/* Custom Registration Form Responses */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Registration Form Answers</span>
                  {activeDetailsBooking.customResponses && Object.keys(activeDetailsBooking.customResponses).length > 0 ? (
                    <div className="space-y-1.5 pt-1">
                      {Object.entries(activeDetailsBooking.customResponses).map(([key, val]) => (
                        <div key={key} className="bg-white p-2 rounded-xl border border-slate-200">
                          <span className="text-[10px] text-slate-400 block capitalize font-semibold">{key.replace(/_/g, ' ')}</span>
                          <span className="font-bold text-slate-800">{String(val)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-400 italic">No custom fields were required for this event tier.</p>
                  )}
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleDownloadTicketPdf(activeDetailsBooking)}
                  className="rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white px-4 py-2 text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download PDF Pass</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveDetailsBooking(null)}
                  className="rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 px-5 py-2 text-xs font-bold transition"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: TICKET QR PREVIEW */}
      <AnimatePresence>
        {activeTicketPreview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-sm w-full p-6 text-center text-slate-900 space-y-4"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <span className="text-xs font-extrabold text-[#0F766E] uppercase">Official Gate Pass QR</span>
                <button
                  onClick={() => setActiveTicketPreview(null)}
                  className="text-slate-400 hover:text-slate-700 font-bold text-xs"
                >
                  ✕
                </button>
              </div>

              <div>
                <h4 className="font-black text-sm text-slate-900">{activeTicketPreview.eventTitle}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{activeTicketPreview.attendeeName}</p>
              </div>

              {/* QR Code */}
              <div className="p-3 bg-white rounded-2xl border-2 border-dashed border-teal-500 inline-block shadow-inner">
                <QRCodeImage
                  value={activeTicketPreview.qrPayload || activeTicketPreview.ticketCode}
                  size={180}
                  className="mx-auto"
                  alt="Attendee Gate QR Pass"
                />
              </div>

              <div className="font-mono text-xs font-bold text-[#0F766E] bg-slate-100 p-2 rounded-xl">
                {activeTicketPreview.ticketCode}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleDownloadTicketPdf(activeTicketPreview)}
                  className="flex-1 py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTicketPreview(null)}
                  className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                >
                  Done
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

