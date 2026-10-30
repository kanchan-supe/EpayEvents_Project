'use client';

import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award, ShieldCheck, Share2, 
  Printer, X, Sparkles
} from 'lucide-react';

export interface CertificateData {
  ticketCode: string;
  attendeeName: string;
  eventTitle: string;
  eventDate?: string;
  venueName?: string;
  venueCity?: string;
  ticketTierName?: string;
  checkedInAt?: string;
}

interface DigitalCertificateModalProps {
  certificate: CertificateData | null;
  onClose: () => void;
}

export function DigitalCertificateModal({
  certificate,
  onClose,
}: DigitalCertificateModalProps) {
  const certificateRef = useRef<HTMLDivElement | null>(null);

  if (!certificate) return null;

  // Safe formatting for issue date
  let issueDateStr = 'Completed';
  try {
    const rawDate = certificate.checkedInAt || certificate.eventDate;
    if (rawDate && rawDate !== 'Invalid Date') {
      const parsed = new Date(rawDate);
      if (!isNaN(parsed.getTime())) {
        issueDateStr = parsed.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      } else {
        issueDateStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      }
    } else {
      issueDateStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    }
  } catch {
    issueDateStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }

  const certNumber = `CERT-EPAY-${certificate.ticketCode.replace('EPAY-', '')}`;

  // Robust 1-Page Print Handler using a dedicated offscreen iframe to eliminate multi-page bleeding
  const handlePrint = () => {
    if (typeof window === 'undefined') return;

    // Remove any previous print frame if present
    const existingFrame = document.getElementById('certificate-print-frame');
    if (existingFrame) {
      existingFrame.remove();
    }

    const iframe = document.createElement('iframe');
    iframe.id = 'certificate-print-frame';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';

    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      window.print();
      return;
    }

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Certificate of Attendance - ${certificate.attendeeName}</title>
          <meta charset="utf-8" />
          <style>
            @page {
              size: landscape;
              margin: 0;
            }
            html, body {
              width: 100vw;
              height: 100vh;
              margin: 0;
              padding: 0;
              background: #ffffff;
              color: #1e293b;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              overflow: hidden;
            }
            .cert-card {
              width: 90vw;
              max-width: 880px;
              height: 84vh;
              max-height: 560px;
              border: 4px double #d97706;
              border-radius: 16px;
              padding: 32px 48px;
              position: relative;
              box-sizing: border-box;
              text-align: center;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              background: #ffffff;
              page-break-inside: avoid;
              page-break-after: avoid;
            }
            .corner-tl { position: absolute; top: 10px; left: 10px; width: 22px; height: 22px; border-top: 2px solid #b45309; border-left: 2px solid #b45309; }
            .corner-tr { position: absolute; top: 10px; right: 10px; width: 22px; height: 22px; border-top: 2px solid #b45309; border-right: 2px solid #b45309; }
            .corner-bl { position: absolute; bottom: 10px; left: 10px; width: 22px; height: 22px; border-bottom: 2px solid #b45309; border-left: 2px solid #b45309; }
            .corner-br { position: absolute; bottom: 10px; right: 10px; width: 22px; height: 22px; border-bottom: 2px solid #b45309; border-right: 2px solid #b45309; }
            
            .pill {
              display: inline-block;
              background: #fef3c7;
              border: 1px solid #f59e0b;
              color: #92400e;
              font-size: 10px;
              font-weight: 800;
              letter-spacing: 2px;
              text-transform: uppercase;
              padding: 3px 14px;
              border-radius: 999px;
              margin-bottom: 8px;
            }
            h1 {
              font-size: 26px;
              font-weight: 900;
              color: #0f172a;
              letter-spacing: 1.5px;
              text-transform: uppercase;
              font-family: Georgia, serif;
              margin: 4px 0 2px 0;
            }
            .subtitle {
              font-size: 13px;
              color: #64748b;
              font-style: italic;
              margin-bottom: 8px;
            }
            .name-box {
              border-bottom: 2px solid #f59e0b;
              display: inline-block;
              padding: 4px 36px;
              margin: 0 auto 10px auto;
            }
            .name {
              font-size: 28px;
              font-weight: 900;
              color: #0f766e;
              font-family: Georgia, serif;
            }
            .desc {
              font-size: 13px;
              color: #475569;
              line-height: 1.5;
              max-width: 580px;
              margin: 0 auto;
            }
            .event-title {
              font-size: 17px;
              font-weight: 800;
              color: #0f172a;
              margin: 4px 0 2px 0;
            }
            .event-venue {
              font-size: 11px;
              color: #64748b;
            }
            .bottom-row {
              border-top: 1px solid #e2e8f0;
              padding-top: 12px;
              display: flex;
              align-items: center;
              justify-content: space-between;
              margin-top: 12px;
            }
            .b-col { text-align: left; min-width: 140px; }
            .b-col.right { text-align: right; }
            .b-lbl { font-size: 9px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; font-weight: 700; margin-bottom: 2px; }
            .b-val { font-family: monospace; font-size: 11px; font-weight: 700; color: #0f172a; }
            .b-date { font-size: 9px; color: #64748b; }
            .verified-badge {
              border: 2px solid #d97706;
              background: #fffbeb;
              color: #92400e;
              padding: 4px 14px;
              border-radius: 999px;
              font-size: 10px;
              font-weight: 900;
              letter-spacing: 1px;
              text-transform: uppercase;
            }
            .sig-title {
              font-family: Georgia, serif;
              font-style: italic;
              font-size: 13px;
              font-weight: 700;
              color: #0f172a;
            }
            .sig-bar {
              width: 120px;
              border-bottom: 1px solid #94a3b8;
              margin-left: auto;
              margin-top: 2px;
              margin-bottom: 2px;
            }
          </style>
        </head>
        <body>
          <div class="cert-card">
            <div class="corner-tl"></div>
            <div class="corner-tr"></div>
            <div class="corner-bl"></div>
            <div class="corner-br"></div>

            <div>
              <span class="pill">OFFICIAL CREDENTIAL</span>
              <h1>Certificate of Attendance</h1>
              <p class="subtitle">This is proudly presented to</p>

              <div class="name-box">
                <div class="name">${certificate.attendeeName}</div>
              </div>

              <div class="desc">
                <p>for active participation and verified completion of attendance at</p>
                <div class="event-title">${certificate.eventTitle}</div>
                <div class="event-venue">
                  ${certificate.venueName ? `${certificate.venueName}, ` : ''}${certificate.venueCity || ''}
                  ${certificate.eventDate ? ` • ${certificate.eventDate}` : ''}
                </div>
              </div>
            </div>

            <div class="bottom-row">
              <div class="b-col">
                <div class="b-lbl">Credential ID</div>
                <div class="b-val">${certNumber}</div>
                <div class="b-date">Issued: ${issueDateStr}</div>
              </div>

              <div>
                <span class="verified-badge">✓ Verified Pass</span>
              </div>

              <div class="b-col right">
                <div class="sig-title">ePayEvents Authority</div>
                <div class="sig-bar"></div>
                <div class="b-date">Digitally Signed & Validated</div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `);
    doc.close();

    // Trigger print from the isolated iframe
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    }, 250);
  };

  const handleShareLinkedIn = () => {
    const text = encodeURIComponent(
      `🎓 Proud to have attended "${certificate.eventTitle}" via ePayEvents! Verified digital credential ID: ${certNumber}. #ePayEvents #EventCertification #ContinuousLearning`
    );
    const linkedInUrl = `https://www.linkedin.com/feed/?shareActive=true&text=${text}`;
    window.open(linkedInUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden text-slate-900 my-8"
        >
          {/* Modal Top Bar */}
          <div className="bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F766E] p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-amber-400/20 text-amber-300 border border-amber-400/30">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm sm:text-base flex items-center gap-2">
                  <span>Digital Certificate of Attendance</span>
                  <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                    Verified
                  </span>
                </h4>
                <p className="text-[10px] text-slate-300">Official proof of gate entry & event completion</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              title="Close modal"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Certificate Canvas Area */}
          <div className="p-5 sm:p-7 bg-slate-100/80 flex justify-center">
            <div
              id="printable-certificate-card"
              ref={certificateRef}
              className="relative w-full bg-white rounded-2xl border-4 border-double border-amber-400 p-6 sm:p-8 shadow-sm text-center space-y-4 overflow-hidden"
            >
              {/* Corner Accents */}
              <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-amber-500 rounded-tl pointer-events-none" />
              <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-amber-500 rounded-tr pointer-events-none" />
              <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-amber-500 rounded-bl pointer-events-none" />
              <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-amber-500 rounded-br pointer-events-none" />

              {/* Certificate Header */}
              <div className="space-y-1.5 relative z-10">
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-50 border border-amber-300 text-amber-900 text-[10px] font-black uppercase tracking-widest shadow-2xs">
                  <Sparkles className="h-3 w-3 text-amber-600" /> OFFICIAL CREDENTIAL <Sparkles className="h-3 w-3 text-amber-600" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase font-serif mt-1">
                  Certificate of Attendance
                </h2>
                <p className="text-xs text-slate-500 italic">This is proudly presented to</p>
              </div>

              {/* Attendee Name */}
              <div className="relative z-10 py-1 border-b-2 border-amber-400/80 max-w-sm mx-auto">
                <h3 className="text-2xl sm:text-3xl font-black text-[#0F766E] tracking-tight font-serif">
                  {certificate.attendeeName}
                </h3>
              </div>

              {/* Description */}
              <div className="relative z-10 space-y-1 text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                <p>
                  for active participation and verified completion of attendance at
                </p>
                <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">
                  {certificate.eventTitle}
                </h4>
                <p className="text-[11px] text-slate-500">
                  {certificate.venueName ? `${certificate.venueName}, ` : ''}{certificate.venueCity || ''}
                  {certificate.eventDate ? ` • ${certificate.eventDate}` : ''}
                </p>
              </div>

              {/* Bottom Metadata & Badges */}
              <div className="relative z-10 pt-4 border-t border-slate-200 flex items-center justify-between gap-4 text-xs">
                {/* Left: Credential ID */}
                <div className="text-left space-y-0.5 min-w-[130px]">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Credential ID</span>
                  <span className="font-mono text-[10px] font-bold text-slate-800 block truncate">{certNumber}</span>
                  <span className="text-[9px] text-slate-500 block">Issued: {issueDateStr}</span>
                </div>

                {/* Center: Gold Stamp Badge */}
                <div className="shrink-0 flex items-center justify-center">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-400 shadow-xs">
                    <ShieldCheck className="h-4 w-4 text-amber-600" />
                    <span className="text-[9px] font-black uppercase tracking-wider text-amber-900">Verified Pass</span>
                  </div>
                </div>

                {/* Right: Signature Line */}
                <div className="text-right space-y-0.5 min-w-[130px]">
                  <span className="font-serif italic text-xs font-bold text-slate-800 block">ePayEvents Authority</span>
                  <div className="w-28 border-b border-slate-300 ml-auto" />
                  <span className="text-[8px] text-slate-400 block">Digitally Signed & Validated</span>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer Controls */}
          <div className="p-4 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleShareLinkedIn}
                className="rounded-xl bg-[#0A66C2] hover:bg-[#084e96] text-white px-4 py-2.5 text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Share2 className="h-4 w-4" />
                <span>Share on LinkedIn</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 px-4 py-2.5 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <Printer className="h-4 w-4 text-slate-600" />
                <span>Print / Save as PDF (Single Page)</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 text-xs font-bold transition cursor-pointer"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
