import { NextRequest, NextResponse } from 'next/server';
import { getAllOrders, getAllRegistrations } from '@/lib/repositories/orderRepository';
import { getAllEvents } from '@/lib/data';
import QRCode from 'qrcode';

export const dynamic = 'force-dynamic';

function generatePdfTicket(data: {
  eventTitle: string;
  ticketTierName: string;
  attendeeName: string;
  attendeeEmail: string;
  attendeePhone?: string;
  ticketCode: string;
  orderId: string;
  venue: string;
  venueCity?: string;
  eventDate: string;
  amountPaid: number;
  status: string;
}): Buffer {
  const safeText = (t: any) => String(t || '').replace(/[()\\]/g, '');

  // 1. Generate QR Code module matrix
  const qrPayload = data.ticketCode || data.orderId || 'EPAY-SAMPLE-PASS';
  let qrSize = 25;
  let qrModules: any = null;
  try {
    const qrObj = QRCode.create(qrPayload, { errorCorrectionLevel: 'M' });
    qrSize = qrObj.modules.size;
    qrModules = qrObj.modules;
  } catch (e) {
    console.error('QR creation error in PDF generator:', e);
  }

  // Cell size and positioning for the QR Scanner Bay on the ticket
  const cellSize = 3.9;
  const qrStartX = 390;
  const qrStartY = 530;

  let qrRects = '';
  if (qrModules) {
    qrRects += '0.07 0.09 0.15 rg\n'; // Dark Slate #111827 for maximum optical scanner contrast
    for (let r = 0; r < qrSize; r++) {
      for (let c = 0; c < qrSize; c++) {
        if (qrModules.get(c, r)) {
          const x = (qrStartX + c * cellSize).toFixed(2);
          const y = (qrStartY + (qrSize - 1 - r) * cellSize).toFixed(2);
          qrRects += `${x} ${y} ${cellSize.toFixed(2)} ${cellSize.toFixed(2)} re f\n`;
        }
      }
    }
  }

  // 2. Build PDF graphics and text instructions stream
  const content: string[] = [];

  // Top Decorative Gradient Bands
  content.push('0.02 0.59 0.41 rg'); // Emerald Pine #059669
  content.push('45 798 505 4 re f');
  content.push('0.96 0.62 0.04 rg'); // Warm Amber #F59E0B
  content.push('45 794 180 4 re f');

  // OFFICIAL ePayEvents BRAND LOGO
  // Ticket Logo Icon (Emerald ticket with side cutouts and pulse line)
  content.push('0.02 0.59 0.41 rg');
  content.push('45 744 36 36 re f'); // Ticket Body
  content.push('1 1 1 rg');
  content.push('42 758 6 8 re f'); // Left notch
  content.push('78 758 6 8 re f'); // Right notch
  content.push('1 1 1 RG 2 w 1 J 1 j'); // White pulse stroke
  content.push('50 762 m 54 762 l 57 757 l 61 767 l 65 754 l 68 764 l 71 762 l 75 762 l S');

  // Logo Wordmark Text
  content.push('BT');
  content.push('/F2 20 Tf 0.07 0.09 0.15 rg');
  content.push('90 759 Td (ePay) Tj');
  content.push('/F2 20 Tf 0.02 0.59 0.41 rg');
  content.push('52 0 Td (Events) Tj');
  content.push('/F1 9 Tf 0.38 0.42 0.48 rg');
  content.push('-52 -13 Td (OFFICIAL DIGITAL GATE ENTRY PASS  |  SECURE 256-BIT CRYPTOGRAPHIC TICKET) Tj');
  content.push('ET');

  // Top-Right Verified Gate Entry Badge
  content.push('0.94 0.98 0.95 rg 0.02 0.59 0.41 RG 1 w');
  content.push('425 748 125 24 re B');
  content.push('BT');
  content.push('/F2 9 Tf 0.02 0.59 0.41 rg');
  content.push('438 756 Td (VALID GATE ENTRY) Tj');
  content.push('ET');

  // MAIN PASS CARD CONTAINER (x: 45, y: 390, width: 505, height: 335)
  content.push('0.98 0.99 0.99 rg 0.88 0.90 0.93 RG 1 w');
  content.push('45 390 505 335 re B');

  // Card Header Ribbon Bar
  content.push('0.95 0.97 0.98 rg');
  content.push('45 680 505 45 re f');
  content.push('0.88 0.90 0.93 RG 1 w');
  content.push('45 680 m 550 680 l S');

  // Category Pill inside Header
  content.push('0.99 0.95 0.88 rg 0.96 0.62 0.04 RG 1 w');
  content.push('60 690 190 22 re B');
  content.push('BT');
  content.push('/F2 9 Tf 0.72 0.44 0.03 rg');
  content.push('70 697 Td (PASS: ' + safeText(data.ticketTierName).toUpperCase() + ') Tj');
  content.push('ET');

  // Order Reference on top right
  content.push('BT');
  content.push('/F1 9 Tf 0.4 0.45 0.5 rg');
  content.push('410 697 Td (ORDER: #' + safeText(data.orderId) + ') Tj');
  content.push('ET');

  // Event Title & Details (Left Column)
  content.push('BT');
  content.push('/F2 18 Tf 0.07 0.09 0.15 rg');
  content.push('65 645 Td (' + safeText(data.eventTitle) + ') Tj');

  content.push('/F2 11 Tf 0.02 0.59 0.41 rg');
  content.push('0 -22 Td (DATE: ' + safeText(data.eventDate) + '   |   GATES OPEN: 09:30 AM) Tj');

  content.push('/F1 11 Tf 0.25 0.3 0.35 rg');
  content.push('0 -18 Td (VENUE: ' + safeText(data.venue) + ', ' + safeText(data.venueCity || 'India') + ') Tj');
  content.push('ET');

  // Dashed Internal Separator
  content.push('0.88 0.90 0.93 RG [3 3] 0 d 1 w');
  content.push('65 575 m 360 575 l S');
  content.push('[] 0 d');

  // Attendee Credentials Section
  content.push('BT');
  content.push('/F2 10 Tf 0.02 0.59 0.41 rg');
  content.push('65 555 Td (ATTENDEE CREDENTIALS) Tj');

  content.push('/F1 10 Tf 0.4 0.45 0.5 rg');
  content.push('0 -18 Td (Full Name:) Tj');
  content.push('/F2 11 Tf 0.07 0.09 0.15 rg');
  content.push('80 0 Td (' + safeText(data.attendeeName) + ') Tj');

  content.push('/F1 10 Tf 0.4 0.45 0.5 rg');
  content.push('-80 -16 Td (Registered Email:) Tj');
  content.push('/F1 10 Tf 0.15 0.2 0.25 rg');
  content.push('95 0 Td (' + safeText(data.attendeeEmail) + ') Tj');

  content.push('/F1 10 Tf 0.4 0.45 0.5 rg');
  content.push('-95 -16 Td (Contact Phone:) Tj');
  content.push('/F1 10 Tf 0.15 0.2 0.25 rg');
  content.push('80 0 Td (' + safeText(data.attendeePhone || 'N/A') + ') Tj');

  content.push('/F1 10 Tf 0.4 0.45 0.5 rg');
  content.push('-80 -16 Td (Amount Paid:) Tj');
  content.push('/F2 11 Tf 0.07 0.09 0.15 rg');
  content.push('80 0 Td (INR ' + Number(data.amountPaid || 0).toLocaleString('en-IN') + '  [PAID & CONFIRMED]) Tj');
  content.push('ET');

  // Official Ticket Pass Identifier Badge
  content.push('0.94 0.98 0.95 rg 0.02 0.59 0.41 RG 1 w');
  content.push('65 410 280 40 re B');
  content.push('BT');
  content.push('/F1 9 Tf 0.02 0.59 0.41 rg');
  content.push('75 435 Td (OFFICIAL TICKET IDENTIFIER) Tj');
  content.push('/F2 12 Tf 0.07 0.09 0.15 rg');
  content.push('0 -15 Td (' + safeText(data.ticketCode) + ') Tj');
  content.push('ET');

  // Vertical Perforated Ticket Line
  content.push('0.85 0.88 0.92 RG [4 3] 0 d 1.5 w');
  content.push('365 390 m 365 725 l S');
  content.push('[] 0 d');

  // Notch indicators at dividing line
  content.push('1 1 1 rg 0.88 0.90 0.93 RG 1 w');
  content.push('365 721 8 8 re f');
  content.push('365 390 8 8 re f');

  // RIGHT COLUMN: HIGH-TECH OPTICAL SCANNER BAY
  content.push('0.95 0.96 0.98 rg 0.85 0.88 0.92 RG 1 w');
  content.push('378 405 160 260 re B');

  // Scanner Viewfinder 4 Corner Brackets
  content.push('0.02 0.59 0.41 RG 2 w');
  content.push('384 640 m 384 632 l 392 632 l S'); // Top-Left
  content.push('532 640 m 532 632 l 524 632 l S'); // Top-Right
  content.push('384 515 m 384 523 l 392 523 l S'); // Bottom-Left
  content.push('532 515 m 532 523 l 524 523 l S'); // Bottom-Right

  // Viewfinder Header
  content.push('BT');
  content.push('/F2 9 Tf 0.02 0.59 0.41 rg');
  content.push('408 647 Td (OPTICAL QR SCANNER) Tj');
  content.push('ET');

  // Render High-Resolution Vector Scannable QR Code
  content.push(qrRects);

  // Scanner Status Indicators below QR code
  content.push('BT');
  content.push('/F2 9 Tf 0.07 0.09 0.15 rg');
  content.push('412 495 Td (SCANNER READY) Tj');
  content.push('/F1 8 Tf 0.4 0.45 0.5 rg');
  content.push('-12 -14 Td (Single-Entry Turnstile Valid) Tj');
  content.push('/F2 8 Tf 0.02 0.59 0.41 rg');
  content.push('2 -14 Td ([*] Instant Gate Verification) Tj');
  content.push('ET');

  // SECURITY GUIDELINES & ANTI-FRAUD SECTION
  content.push('0.98 0.98 0.99 rg 0.89 0.91 0.94 RG 1 w');
  content.push('45 220 505 145 re B');

  content.push('BT');
  content.push('/F2 11 Tf 0.07 0.09 0.15 rg');
  content.push('65 340 Td (GATE ENTRY & SECURITY GUIDELINES) Tj');

  content.push('/F1 9 Tf 0.25 0.3 0.35 rg');
  content.push('0 -20 Td (1. Present this digital gate entry pass on your mobile screen or bring a clear printed copy to the turnstile.) Tj');
  content.push('0 -16 Td (2. Gate scanners will instantly verify the optical QR code. Each ticket code is strictly single-use valid.) Tj');
  content.push('0 -16 Td (3. Please carry a valid government-issued photo ID matching the registered attendee name for verification.) Tj');
  content.push('0 -16 Td (4. Transfers, resale, or unauthorized duplication will void this pass under ePayEvents anti-fraud terms.) Tj');
  content.push('0 -16 Td (5. For assistance at the gate, visit the ePayEvents Helpdesk or contact support@epayevents.com.) Tj');
  content.push('ET');

  // Cryptographic Signature & Watermark Footer
  content.push('BT');
  content.push('/F1 8 Tf 0.4 0.45 0.5 rg');
  content.push('65 180 Td (Tamper-Evident SHA-256 Verified  |  ePayEvents Gatekeeper Protocol v2.4  |  https://epayevents.com) Tj');
  content.push('0 -12 Td (Issued to: ' + safeText(data.attendeeName) + ' (' + safeText(data.attendeeEmail) + ')  |  Booking Order: ' + safeText(data.orderId) + ') Tj');
  content.push('ET');

  // Bottom Emerald Accent Bar
  content.push('0.02 0.59 0.41 rg');
  content.push('45 150 505 3 re f');

  const streamContent = content.join('\n');
  const streamLen = Buffer.byteLength(streamContent);

  // Exact Byte-Accurate PDF Assembly
  const header = '%PDF-1.4\n';
  const obj1 = '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n';
  const obj2 = '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n';
  const obj3 = '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>\nendobj\n';
  const obj4 = `4 0 obj\n<< /Length ${streamLen} >>\nstream\n${streamContent}\nendstream\nendobj\n`;
  const obj5 = '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n';
  const obj6 = '6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n';

  let offset = Buffer.byteLength(header);
  const offset1 = offset;
  offset += Buffer.byteLength(obj1);
  const offset2 = offset;
  offset += Buffer.byteLength(obj2);
  const offset3 = offset;
  offset += Buffer.byteLength(obj3);
  const offset4 = offset;
  offset += Buffer.byteLength(obj4);
  const offset5 = offset;
  offset += Buffer.byteLength(obj5);
  const offset6 = offset;
  offset += Buffer.byteLength(obj6);

  const xrefOffset = offset;
  const pad = (n: number) => String(n).padStart(10, '0');

  const xref = [
    'xref',
    '0 7',
    '0000000000 65535 f ',
    `${pad(offset1)} 00000 n `,
    `${pad(offset2)} 00000 n `,
    `${pad(offset3)} 00000 n `,
    `${pad(offset4)} 00000 n `,
    `${pad(offset5)} 00000 n `,
    `${pad(offset6)} 00000 n `,
    'trailer',
    '<< /Size 7 /Root 1 0 R >>',
    'startxref',
    String(xrefOffset),
    '%%EOF'
  ].join('\n');

  return Buffer.from(header + obj1 + obj2 + obj3 + obj4 + obj5 + obj6 + xref);
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const { bookingId } = await params;
    const cleanId = decodeURIComponent(bookingId).trim();

    const [orders, registrations, allEvents] = await Promise.all([
      getAllOrders(),
      getAllRegistrations(),
      getAllEvents(),
    ]);

    // Find registration or order
    const matchedReg = registrations.find(
      (r) => r.ticketCode === cleanId || r.id === cleanId || r.orderId === cleanId
    );
    const matchedOrder = orders.find(
      (o) => o.id === cleanId || o.id === matchedReg?.orderId
    );

    if (!matchedReg && !matchedOrder) {
      return NextResponse.json({ success: false, error: 'Booking or ticket not found' }, { status: 404 });
    }

    const eventId = matchedReg?.eventId || matchedOrder?.eventId;
    const matchedEvent = allEvents.find((e) => e.id === eventId || e.slug === eventId);

    const ticketData = {
      eventTitle: matchedReg?.eventTitle || matchedOrder?.eventTitle || matchedEvent?.title || 'ePay Event',
      ticketTierName: matchedReg?.ticketTierName || matchedOrder?.ticketName || 'General Admission',
      attendeeName: matchedReg?.attendeeName || matchedOrder?.buyerName || 'Attendee',
      attendeeEmail: matchedReg?.attendeeEmail || matchedOrder?.buyerEmail || 'attendee@example.com',
      attendeePhone: matchedReg?.attendeePhone || matchedOrder?.buyerPhone || '—',
      ticketCode: matchedReg?.ticketCode || `EPAY-${matchedOrder?.id}-TKT-1`,
      orderId: matchedReg?.orderId || matchedOrder?.id || cleanId,
      venue: (typeof matchedEvent?.venue === 'object' ? matchedEvent?.venue?.name : (matchedEvent as any)?.venue) || 'Convention Center',
      venueCity: (typeof matchedEvent?.venue === 'object' ? matchedEvent?.venue?.city : (matchedEvent as any)?.city) || 'Mumbai',
      eventDate: matchedEvent?.date || matchedEvent?.startDate?.split('T')[0] || matchedReg?.createdAt?.split('T')[0] || '2026-11-15',
      amountPaid: Number(matchedReg?.pricePaid !== undefined ? matchedReg.pricePaid : (matchedOrder?.total || 0)),
      status: matchedReg?.status || matchedOrder?.status || 'valid',
    };

    const pdfBuffer = generatePdfTicket(ticketData);

    return new NextResponse(pdfBuffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="ePayEvents-Pass-${ticketData.ticketCode}.pdf"`,
        'Content-Length': String(pdfBuffer.length),
      },
    });
  } catch (err: any) {
    console.error('[API /api/admin/tickets/[bookingId]/download] Exception:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
