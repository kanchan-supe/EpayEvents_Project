import { NextRequest, NextResponse } from 'next/server';
import { 
  getAllInquiries, 
  createInquiry, 
  replyToInquiry, 
  updateInquiryStatus 
} from '@/lib/repositories/inquiryRepository';

export const dynamic = 'force-dynamic';

/**
 * GET /api/inquiries?organizerEmail=...&eventId=...
 * Returns inquiries received from attendees
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizerEmail = searchParams.get('organizerEmail') || undefined;
    const eventId = searchParams.get('eventId') || undefined;
    const senderEmail = searchParams.get('senderEmail') || undefined;

    const inquiries = await getAllInquiries(organizerEmail, eventId, senderEmail);

    return NextResponse.json({
      success: true,
      data: inquiries,
    });
  } catch (err: any) {
    console.error('[API /api/inquiries GET] Error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed fetching inquiries' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/inquiries
 * Actions: 'create' | 'reply' | 'status'
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action = 'create' } = body;

    // Action 1: Organizer replies to attendee inquiry
    if (action === 'reply') {
      const { inquiryId, replyContent } = body;
      if (!inquiryId || !replyContent) {
        return NextResponse.json(
          { success: false, error: 'inquiryId and replyContent are required' },
          { status: 400 }
        );
      }
      const updated = await replyToInquiry(inquiryId, replyContent);
      return NextResponse.json({ success: true, data: updated });
    }

    // Action 2: Change status (e.g. mark as read or archived)
    if (action === 'status') {
      const { inquiryId, status } = body;
      if (!inquiryId || !status) {
        return NextResponse.json(
          { success: false, error: 'inquiryId and status are required' },
          { status: 400 }
        );
      }
      const updated = await updateInquiryStatus(inquiryId, status);
      return NextResponse.json({ success: true, data: updated });
    }

    // Action 3: Attendee creates a new inquiry
    const { eventId, eventTitle, organizerEmail, senderName, senderEmail, senderPhone, subject, message } = body;
    if (!eventId || !senderName || !senderEmail || !message) {
      return NextResponse.json(
        { success: false, error: 'eventId, senderName, senderEmail, and message are required' },
        { status: 400 }
      );
    }

    const created = await createInquiry({
      eventId,
      eventTitle: eventTitle || 'Event Inquiry',
      organizerEmail: organizerEmail || 'contact@organizer.com',
      senderName,
      senderEmail,
      senderPhone: senderPhone || '',
      subject: subject || 'General Query',
      message,
    });

    return NextResponse.json({
      success: true,
      data: created,
    });
  } catch (err: any) {
    console.error('[API /api/inquiries POST] Error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed submitting inquiry' },
      { status: 500 }
    );
  }
}

