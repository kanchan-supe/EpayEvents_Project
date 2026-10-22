import { NextRequest, NextResponse } from 'next/server';
import { verifyAndCheckInTicket } from '@/lib/repositories/orderRepository';

export const dynamic = 'force-dynamic';

/**
 * POST /api/checkin
 * Verifies scanned QR code payload or ticket code.
 * Changes status from 'valid' to 'checked_in', records timestamp,
 * and prevents duplicate entries.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const rawInput = body.ticketCode || body.qrPayload || body.code;
    const targetEventId = body.targetEventId || body.eventId;

    if (!rawInput) {
      return NextResponse.json(
        { success: false, status: 'invalid', message: 'No ticket code or QR payload provided.' },
        { status: 400 }
      );
    }

    const result = await verifyAndCheckInTicket(rawInput, targetEventId);

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('[API /api/checkin POST] Error:', err);
    return NextResponse.json(
      { success: false, status: 'error', message: err.message || 'Check-in processing error' },
      { status: 500 }
    );
  }
}

