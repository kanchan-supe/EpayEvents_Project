'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Download, QrCode, Mail, Phone, Calendar, MapPin, Ticket as TicketIcon, ArrowRight, ShieldCheck } from 'lucide-react';
import { Navbar, Footer } from '@/components/NavbarFooter';

function OrderSuccessContent() {
  const searchParams = useSearchParams();

  const orderId = searchParams.get('orderId') || 'ORD-849204';
  const buyerName = searchParams.get('buyerName') || 'Valued Attendee';
  const buyerEmail = searchParams.get('buyerEmail') || 'attendee@example.com';
  const ticketName = searchParams.get('ticketName') || 'General Admission Pass';
  const qty = searchParams.get('qty') || '1';
  const total = searchParams.get('total') || '1149';
  const eventTitle = searchParams.get('eventTitle') || 'ePay Global FinTech Summit 2026';
  const venue = searchParams.get('venue') || 'International Tech Convention Center';

  const ticketCode = `EPAY-${orderId}-TKT-1`;

  const handleDownloadPDF = () => {
    alert(`Downloading Ticket PDF for Order ${orderId}...`);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="bg-white p-8 sm:p-10 rounded-2xl border border-slate-200 shadow-md text-center">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="h-10 w-10" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Payment Successful & Ticket Issued!</h1>
        <p className="text-slate-500 text-sm mt-1">
          Thank you, <strong className="text-slate-800">{buyerName}</strong>. Order confirmation has been emailed to <strong className="text-slate-800">{buyerEmail}</strong>.
        </p>

        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
          <Mail className="h-3.5 w-3.5" /> Order ID: {orderId}
        </div>

        {/* Digital QR Ticket PDF Mock */}
        <div className="mt-8 bg-gradient-to-r from-blue-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 text-left shadow-xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-slate-700/80 pb-6">
            <div>
              <span className="text-xs uppercase tracking-widest text-blue-400 font-bold">Official Event Entry Pass</span>
              <h3 className="text-xl font-extrabold text-white mt-1">{eventTitle}</h3>
              <p className="text-xs text-slate-300 mt-1 flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-blue-400" /> {venue}
              </p>
            </div>
            <div className="bg-white text-slate-900 px-3 py-1 rounded-lg font-bold text-xs uppercase tracking-wider">
              {ticketName}
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="space-y-2 text-xs text-slate-300">
              <p><strong>Attendee:</strong> {buyerName}</p>
              <p><strong>Ticket ID:</strong> {ticketCode}</p>
              <p><strong>Total Tickets:</strong> {qty} Pass</p>
              <p><strong>Status:</strong> <span className="text-emerald-400 font-semibold">VALID / CONFIRMED</span></p>
            </div>

            {/* QR Code Payload Simulation */}
            <div className="bg-white p-3 rounded-xl shadow-lg flex flex-col items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(ticketCode)}`}
                alt="QR Ticket payload"
                className="h-28 w-28"
              />
              <span className="text-[10px] text-slate-500 font-mono mt-1">{ticketCode}</span>
            </div>
          </div>
        </div>

        {/* Transactional Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={handleDownloadPDF}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow hover:bg-blue-700 transition"
          >
            <Download className="h-4 w-4" /> Download PDF Ticket
          </button>
          
          <Link
            href="/events"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            Browse More Events <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="container mx-auto px-4 md:px-8 py-12 flex-1">
        <Suspense fallback={<div className="text-center py-12">Loading ticket confirmation...</div>}>
          <OrderSuccessContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

