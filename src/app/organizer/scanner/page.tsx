'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { QrCode, CheckCircle2, XCircle, Camera, ArrowLeft } from 'lucide-react';
import { Navbar, Footer } from '@/components/NavbarFooter';

export default function QRScannerPage() {
  const [ticketInput, setTicketInput] = useState('');
  const [scanResult, setScanResult] = useState<{
    status: 'success' | 'error' | 'already_used';
    message: string;
    attendeeName?: string;
    ticketType?: string;
    orderId?: string;
  } | null>(null);

  const handleManualScan = (e: React.FormEvent) => {
    e.preventDefault();
    const code = ticketInput.trim().toUpperCase();

    if (!code) return;

    if (code.includes('CANCEL') || code.includes('REF-')) {
      setScanResult({
        status: 'error',
        message: 'TICKET CANCELLED - REFUND PROCESSED',
        attendeeName: 'Ticket Voided',
        ticketType: 'Refunded Pass',
        orderId: code,
      });
    } else if (code.includes('TRANSFER')) {
      setScanResult({
        status: 'success',
        message: 'TRANSFERRED TICKET VERIFIED - ENTRY APPROVED',
        attendeeName: 'Rohini Deshmukh (Transferred)',
        ticketType: 'General Admission (Transferred)',
        orderId: code,
      });
    } else if (code.includes('EPAY-ORD') || code.startsWith('EPAY-')) {
      setScanResult({
        status: 'success',
        message: 'VALID SMART TICKET - ENTRY APPROVED',
        attendeeName: 'Alex Morgan',
        ticketType: 'Early Bird VIP Developer Pass',
        orderId: code,
      });
    } else if (code === 'USED') {
      setScanResult({
        status: 'already_used',
        message: 'ALREADY CHECKED IN (Scanned at Gate 1 at 09:45 AM)',
        attendeeName: 'Aarav Sharma',
        ticketType: 'VIP Masterclass Pass',
        orderId: 'EPAY-ORD-849204-TKT-1',
      });
    } else {
      setScanResult({
        status: 'error',
        message: 'INVALID OR UNRECOGNIZED SMART TICKET ID',
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-white">
      <Navbar />

      <div className="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-6">
        <div className="container mx-auto px-4 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/organizer/dashboard" className="text-slate-400 hover:text-white transition">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <QrCode className="h-5 w-5 text-emerald-400" /> Live QR Check-in Scanner
            </h1>
          </div>

          <div className="text-xs text-emerald-400 font-bold bg-emerald-950 border border-emerald-800/80 px-3 py-1 rounded-full flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span> Scanner Active
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 md:px-8 py-10 flex-1 max-w-2xl space-y-8">
        {/* Camera Scanner Viewport Mock */}
        <div className="bg-slate-950 rounded-2xl border border-slate-800 p-8 text-center relative overflow-hidden shadow-2xl">
          <div className="relative mx-auto w-64 h-64 border-2 border-dashed border-emerald-500/60 rounded-2xl flex flex-col items-center justify-center bg-slate-900/50">
            <Camera className="h-12 w-12 text-emerald-400 animate-bounce mb-2" />
            <span className="text-xs text-slate-400 font-medium">Position QR Code within camera frame</span>
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-emerald-400 animate-pulse shadow-[0_0_15px_#34d399]"></div>
          </div>
          <p className="text-xs text-slate-500 mt-4">Camera auto-scan active (Supports webcams & mobile cameras)</p>
        </div>

        {/* Manual Code Entry Form */}
        <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/80 space-y-4">
          <h3 className="font-bold text-sm text-slate-200">Manual Ticket ID Entry / USB Scanner Input</h3>
          <form onSubmit={handleManualScan} className="flex gap-3">
            <input
              type="text"
              value={ticketInput}
              onChange={e => setTicketInput(e.target.value)}
              placeholder="e.g. EPAY-ORD-849204-TKT-1"
              className="flex-1 rounded-xl bg-slate-900 border border-slate-700 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none font-mono"
            />
            <button
              type="submit"
              className="rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition"
            >
              Verify Entry
            </button>
          </form>
          <p className="text-[11px] text-slate-400">Quick test presets: enter <code className="text-emerald-300 bg-slate-900 px-1 py-0.5 rounded">EPAY-ORD-849204</code> or <code className="text-amber-300 bg-slate-900 px-1 py-0.5 rounded">USED</code></p>
        </div>

        {/* Live Verification Result Banner */}
        {scanResult && (
          <div className={`p-6 rounded-2xl border shadow-xl transition-all ${
            scanResult.status === 'success'
              ? 'bg-emerald-950/90 border-emerald-600 text-emerald-100'
              : scanResult.status === 'already_used'
              ? 'bg-amber-950/90 border-amber-600 text-amber-100'
              : 'bg-red-950/90 border-red-600 text-red-100'
          }`}>
            <div className="flex items-center gap-4">
              {scanResult.status === 'success' && <CheckCircle2 className="h-10 w-10 text-emerald-400 shrink-0" />}
              {scanResult.status === 'already_used' && <XCircle className="h-10 w-10 text-amber-400 shrink-0" />}
              {scanResult.status === 'error' && <XCircle className="h-10 w-10 text-red-400 shrink-0" />}

              <div>
                <h3 className="font-extrabold text-lg tracking-wide">{scanResult.message}</h3>
                {scanResult.attendeeName && (
                  <div className="mt-2 text-xs space-y-1 opacity-90">
                    <p><strong>Attendee:</strong> {scanResult.attendeeName}</p>
                    <p><strong>Pass Tier:</strong> {scanResult.ticketType}</p>
                    <p className="font-mono"><strong>Ticket Payload:</strong> {scanResult.orderId}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
