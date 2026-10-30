import { NextRequest, NextResponse } from 'next/server';
import { 
  getWaitlistEntries, 
  addToWaitlist, 
  notifyNextInLine, 
  getWaitlistNotifications 
} from '@/lib/repositories/waitlistRepository';
import { createInquiry } from '@/lib/repositories/inquiryRepository';

export const dynamic = 'force-dynamic';

/**
 * GET /api/waitlist
 * Query waitlist entries or dispatched notifications
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId') || undefined;
    const ticketTierId = searchParams.get('ticketTierId') || undefined;
    const userEmail = searchParams.get('userEmail') || undefined;
    const type = searchParams.get('type'); // 'notifications' or 'entries'

    if (type === 'notifications') {
      const notices = await getWaitlistNotifications(userEmail);
      return NextResponse.json({ success: true, data: notices });
    }

    const entries = await getWaitlistEntries(eventId, ticketTierId);
    return NextResponse.json({
      success: true,
      data: entries,
      count: entries.length,
      waitingCount: entries.filter(e => e.status === 'waiting').length,
    });
  } catch (error: any) {
    console.error('[API /api/waitlist GET] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch waitlist' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/waitlist
 * Handle joining the waitlist or triggering notification dispatch
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action = 'join' } = body;

    if (action === 'join') {
      const { 
        eventId, 
        eventTitle, 
        ticketTierId, 
        ticketTierName, 
        userName, 
        userEmail, 
        userPhone, 
        quantityRequested = 1 
      } = body;

      if (!eventId || !ticketTierId || !userEmail || !userName) {
        return NextResponse.json(
          { success: false, error: 'Missing required fields: eventId, ticketTierId, userName, userEmail' },
          { status: 400 }
        );
      }

      const result = await addToWaitlist({
        eventId,
        eventTitle: eventTitle || 'ePay Event',
        ticketTierId,
        ticketTierName: ticketTierName || 'Sold-Out Tier',
        userName,
        userEmail,
        userPhone,
        quantityRequested: Number(quantityRequested) || 1,
      });

      // Log an inquiry/notification for the organizer so they know demand
      try {
        await createInquiry({
          eventId,
          eventTitle: eventTitle || 'Waitlist Alert',
          organizerEmail: 'organizer@epayevents.com',
          senderName: userName,
          senderEmail: userEmail,
          senderPhone: userPhone,
          subject: `Waitlist Joined: #${result.position} for ${ticketTierName || 'Tier'}`,
          message: `${userName} (${userEmail}) joined the waitlist for sold-out tier "${ticketTierName}" requesting ${quantityRequested} pass(es). Queue position: #${result.position}.`,
        });
      } catch (inqErr) {
        console.warn('[waitlist API] Optional inquiry notice:', inqErr);
      }

      return NextResponse.json({
        success: true,
        message: `Successfully joined waitlist at position #${result.position}! We will notify you instantly via SMS and Email when a spot opens.`,
        data: result.entry,
        position: result.position,
      });
    }

    if (action === 'notify_next') {
      const { eventId, ticketTierId, eventTitle } = body;
      if (!eventId) {
        return NextResponse.json(
          { success: false, error: 'eventId is required to notify next in line' },
          { status: 400 }
        );
      }

      const notifyResult = await notifyNextInLine({
        eventId,
        ticketTierId,
        eventTitle,
      });

      return NextResponse.json({
        success: true,
        notified: notifyResult.notified,
        message: notifyResult.message,
        entry: notifyResult.entry,
        notification: notifyResult.notification,
      });
    }

    return NextResponse.json(
      { success: false, error: `Invalid action: ${action}` },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('[API /api/waitlist POST] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Waitlist operation failed' },
      { status: 500 }
    );
  }
}

