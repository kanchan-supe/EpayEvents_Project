'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  CheckCircle2, Download, Mail, MapPin, 
  ArrowRight, ArrowRightLeft, Undo2, 
  Copy, Check
} from 'lucide-react';
import { Navbar, Footer } from '@/components/NavbarFooter';
import { Logo } from '@/components/Logo';

function OrderSuccessContent() {
  const searchParams = useSearchParams();

  const orderId = searchParams.get('orderId') || 'ORD-849204';
  const buyerName = searchParams.get('buyerName') || 'Valued Attendee';
  const buyerEmail = searchParams.get('buyerEmail') || 'attendee@example.com';
  const buyerPhone = searchParams.get('buyerPhone') || '+91 9876543210';
  const ticketName = searchParams.get('ticketName') || 'General Admission Pass';
  const category = searchParams.get('category') || 'General';
  const qty = searchParams.get('qty') || '1';
  const total = searchParams.get('total') || '1149';
  const eventTitle = searchParams.get('eventTitle') || 'ePay Global FinTech Summit 2026';
  const venue = searchParams.get('venue') || 'International Tech Convention Center';
  const approvalRequired = searchParams.get('approvalRequired') === 'yes';

  // Smart Unique Ticket ID
  const ticketCode = `EPAY-${orderId}-TKT-1`;

  // Transfer & Refund Workflow Interactive States
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferSuccess, setTransferSuccess] = useState<string | null>(null);
  const [transferRecipient, setTransferRecipient] = useState({ name: '', email: '' });

  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundStatus, setRefundStatus] = useState<string | null>(null);
  const [refundReason, setRefundReason] = useState('Schedule Conflict');

  const [copied, setCopied] = useState(false);

  const handleCopyTicketId = () => {
    navigator.clipboard.writeText(ticketCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadPDF = () => {
    alert(`Downloading Official ePayEvents PDF Pass for Ticket ${ticketCode}...`);
  };

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferRecipient.email) return;
    setTransferSuccess(`Ticket #${ticketCode} successfully transferred to ${transferRecipient.name} (${transferRecipient.email}). New secure QR code sent!`);
    setShowTransferModal(false);
  };

  const handleRefundSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRefundStatus(`Cancellation initiated for ${ticketCode}. Refund of ₹${total} will be credited to source account within 3-5 business days. Cancellation reference: REF-${Date.now().toString().slice(-6)}.`);
    setShowRefundModal(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="bg-white p-8 sm:p-10 rounded-3xl border border-[#E7E5E4] shadow-sm text-center">
        
        {/* Brand Logo Header */}
        <div className="flex justify-center mb-6">
          <Logo variant="default" size="md" />
        </div>

        <div className="w-16 h-16 bg-[#CCFBF1] text-[#0F766E] rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
          <CheckCircle2 className="h-10 w-10" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-[#1C1917]">
          {approvalRequired ? 'Application Submitted & Provisional Pass Issued!' : 'Payment Confirmed & Smart Ticket Issued!'}
        </h1>
        <p className="text-[#78716C] text-sm mt-1">
          Thank you, <strong className="text-[#1C1917]">{buyerName}</strong>. Your QR Pass & order confirmation have been dispatched to <strong className="text-[#1C1917]">{buyerEmail}</strong>.
        </p>

        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FAFAF9] border border-[#E7E5E4] px-3.5 py-1 text-xs font-semibold text-[#1C1917]">
            <Mail className="h-3.5 w-3.5 text-[#0F766E]" /> Order ID: {orderId}
          </span>
          <button
            onClick={handleCopyTicketId}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#0F766E]/10 border border-[#0F766E]/30 px-3.5 py-1 text-xs font-bold text-[#0F766E] hover:bg-[#0F766E]/20 transition"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {ticketCode}
          </button>
        </div>

        {/* Transfer Confirmation Notice */}
        {transferSuccess && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 font-semibold text-left flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
            <span>{transferSuccess}</span>
          </div>
        )}

        {/* Refund Confirmation Notice */}
        {refundStatus && (
          <div className="mt-4 p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-900 font-semibold text-left flex items-start gap-2">
            <Undo2 className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
            <span>{refundStatus}</span>
          </div>
        )}

        {/* Digital QR Ticket Pass Card */}
        <div className="mt-8 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] text-white rounded-3xl p-6 sm:p-8 text-left shadow-2xl relative overflow-hidden border border-slate-700">
          
          {/* Ticket Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-700/80 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <Logo variant="white" size="sm" showWordmark={true} />
                <span className="text-[10px] uppercase tracking-widest text-cyan-400 font-bold bg-cyan-950/80 px-2 py-0.5 rounded-md border border-cyan-800">
                  SMART QR PASS
                </span>
              </div>
              <h3 className="text-xl font-black text-white mt-2">{eventTitle}</h3>
              <p className="text-xs text-slate-300 mt-1 flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-[#F97316]" /> {venue}
              </p>
            </div>
            
            <div className="text-right">
              <span className="bg-[#F97316] text-white px-3 py-1 rounded-xl font-black text-xs uppercase tracking-wider block">
                {ticketName}
              </span>
              <span className="text-[10px] text-slate-400 font-medium block mt-1">Tier: {category}</span>
            </div>
          </div>

          {/* Ticket Body: Unique ID, Attendee, and QR Payload */}
          <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="space-y-2.5 text-xs text-slate-300 w-full sm:w-auto">
              <p><strong>Primary Attendee:</strong> {buyerName} ({buyerPhone})</p>
              <p><strong>Unique Ticket ID:</strong> <span className="font-mono text-cyan-300 font-bold">{ticketCode}</span></p>
              <p><strong>Pass Count:</strong> {qty} Pass</p>
              <p><strong>Amount Paid:</strong> ₹{total}</p>
              <p>
                <strong>Status:</strong>{' '}
                {refundStatus ? (
                  <span className="text-amber-400 font-bold">CANCELLED / REFUND PENDING</span>
                ) : approvalRequired ? (
                  <span className="text-amber-400 font-bold">PENDING ORGANIZER REVIEW</span>
                ) : (
                  <span className="text-emerald-400 font-bold">VALID & SCAN-READY</span>
                )}
              </p>
            </div>

            {/* Encrypted QR Code Simulation */}
            <div className="bg-white p-3.5 rounded-2xl shadow-xl flex flex-col items-center shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(ticketCode)}`}
                alt="Smart QR Pass"
                className="h-28 w-28"
              />
              <span className="text-[10px] text-slate-600 font-mono font-bold mt-1.5">{ticketCode}</span>
            </div>
          </div>
        </div>

        {/* Smart Actions: Download, Transfer Ticket, Cancellation / Refund */}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            onClick={handleDownloadPDF}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0F766E] px-5 py-3 font-bold text-xs sm:text-sm text-white shadow hover:bg-[#115E59] transition"
          >
            <Download className="h-4 w-4" /> Download PDF Ticket
          </button>

          <button
            onClick={() => setShowTransferModal(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#F97316] px-5 py-3 font-bold text-xs sm:text-sm text-white shadow hover:bg-[#ea580c] transition"
          >
            <ArrowRightLeft className="h-4 w-4" /> Transfer Ticket
          </button>

          <button
            onClick={() => setShowRefundModal(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E7E5E4] px-5 py-3 font-bold text-xs sm:text-sm text-[#1C1917] hover:bg-slate-50 transition"
          >
            <Undo2 className="h-4 w-4 text-red-500" /> Cancel & Refund
          </button>
          
          <Link
            href="/events"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E7E5E4] px-5 py-3 font-bold text-xs sm:text-sm text-[#78716C] hover:bg-slate-50 transition"
          >
            Explore Events <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Modal: Transfer Ticket Workflow */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-[#E7E5E4] space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-[#1C1917] flex items-center gap-2">
                <ArrowRightLeft className="h-5 w-5 text-[#F97316]" /> Transfer Ticket Ownership
              </h3>
              <button onClick={() => setShowTransferModal(false)} className="text-slate-400 hover:text-slate-700 text-lg">✕</button>
            </div>
            
            <p className="text-xs text-[#78716C] leading-relaxed">
              Transfer pass <strong className="text-[#1C1917]">#{ticketCode}</strong> to another attendee. A new unique QR code will be generated and issued to the recipient.
            </p>

            <form onSubmit={handleTransferSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1C1917] mb-1">Recipient Full Name *</label>
                <input
                  type="text"
                  required
                  value={transferRecipient.name}
                  onChange={e => setTransferRecipient({ ...transferRecipient, name: e.target.value })}
                  placeholder="e.g. Rohini Deshmukh"
                  className="w-full px-3 py-2 text-xs border border-[#E7E5E4] rounded-xl focus:outline-none focus:border-[#0F766E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1C1917] mb-1">Recipient Email Address *</label>
                <input
                  type="email"
                  required
                  value={transferRecipient.email}
                  onChange={e => setTransferRecipient({ ...transferRecipient, email: e.target.value })}
                  placeholder="recipient@example.com"
                  className="w-full px-3 py-2 text-xs border border-[#E7E5E4] rounded-xl focus:outline-none focus:border-[#0F766E]"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#F97316] text-white rounded-xl text-xs font-bold hover:bg-[#ea580c] transition shadow"
                >
                  Confirm Transfer
                </button>
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="px-4 py-2.5 border border-[#E7E5E4] text-[#1C1917] rounded-xl text-xs font-bold hover:bg-slate-100"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Cancellation & Refund Workflow */}
      {showRefundModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-[#E7E5E4] space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-[#1C1917] flex items-center gap-2">
                <Undo2 className="h-5 w-5 text-red-500" /> Cancel Ticket & Request Refund
              </h3>
              <button onClick={() => setShowRefundModal(false)} className="text-slate-400 hover:text-slate-700 text-lg">✕</button>
            </div>
            
            <p className="text-xs text-[#78716C] leading-relaxed">
              Ticket <strong className="text-[#1C1917]">#{ticketCode}</strong> will be invalidated immediately. Standard refund of <strong>₹{total}</strong> will be processed to the original payment mode.
            </p>

            <form onSubmit={handleRefundSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1C1917] mb-1">Reason for Cancellation</label>
                <select
                  value={refundReason}
                  onChange={e => setRefundReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#E7E5E4] rounded-xl focus:outline-none focus:border-[#0F766E] bg-white text-[#1C1917]"
                >
                  <option value="Schedule Conflict">Schedule Conflict / Cannot Attend</option>
                  <option value="Booked by Mistake">Booked Duplicate / Incorrect Pass</option>
                  <option value="Travel Issues">Travel or Logistics Difficulty</option>
                  <option value="Medical Emergency">Medical / Personal Emergency</option>
                </select>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition shadow"
                >
                  Process Cancellation & Refund
                </button>
                <button
                  type="button"
                  onClick={() => setShowRefundModal(false)}
                  className="px-4 py-2.5 border border-[#E7E5E4] text-[#1C1917] rounded-xl text-xs font-bold hover:bg-slate-100"
                >
                  Keep Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF9]">
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
