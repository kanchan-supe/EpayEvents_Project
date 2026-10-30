import { NextRequest, NextResponse } from 'next/server';
import { 
  saveOrderAndRegistration, 
  getAllOrders, 
  getAllRegistrations, 
  generateEncryptedQRPayload,
  cancelOrderAndTicket,
  OrderPayload,
  RegistrationPayload
} from '@/lib/repositories/orderRepository';
import { createInquiry } from '@/lib/repositories/inquiryRepository';
import { notifyNextInLine } from '@/lib/repositories/waitlistRepository';
import { recordReferralConversion } from '@/lib/repositories/promotionsRepository';

export const dynamic = 'force-dynamic';

/**
 * GET /api/orders
 * Returns list of confirmed orders, registrations, and aggregate metrics.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
    const email = searchParams.get('email')?.trim().toLowerCase();
    const userId = searchParams.get('userId')?.trim();

    let orders = await getAllOrders();
    let registrations = await getAllRegistrations();

    if (eventId) {
      orders = orders.filter(o => o.eventId === eventId);
      registrations = registrations.filter(r => r.eventId === eventId);
    }

    if (email || userId) {
      const emailLower = email?.toLowerCase();
      // Find orders matching by buyerEmail or userId
      const matchedOrderIds = new Set<string>();
      orders = orders.filter(o => {
        const matchesEmail = emailLower && o.buyerEmail?.toLowerCase() === emailLower;
        const matchesUser = userId && o.userId === userId;
        const matched = Boolean(matchesEmail || matchesUser);
        if (matched) matchedOrderIds.add(o.id);
        return matched;
      });

      // Find registrations matching by attendeeEmail, or belonging to one of the matched orders
      registrations = registrations.filter(r => {
        const matchesEmail = emailLower && r.attendeeEmail?.toLowerCase() === emailLower;
        const matchesOrder = r.orderId && matchedOrderIds.has(r.orderId);
        return Boolean(matchesEmail || matchesOrder);
      });
    }

    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const totalTicketsSold = orders.reduce((sum, o) => sum + (o.qty || 1), 0);
    const checkedInCount = registrations.filter(r => r.status === 'checked_in').length;

    return NextResponse.json({
      success: true,
      data: {
        orders,
        registrations,
        metrics: {
          totalRevenue,
          totalOrders: orders.length,
          totalTicketsSold,
          checkedInCount,
          checkinRate: totalTicketsSold > 0 ? Math.round((checkedInCount / totalTicketsSold) * 100) : 0,
        },
      },
    });
  } catch (err: any) {
    console.error('[API /api/orders GET] Error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/orders
 * Creates a new order, issues registration ticket passes, generates encrypted QR payloads,
 * and saves to Supabase.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    // Action: Cancel pass / request refund
    if (action === 'cancel') {
      const { ticketCode, orderId, reason, attendeeName, attendeeEmail, eventId, eventTitle } = body;
      if (!ticketCode) {
        return NextResponse.json(
          { success: false, error: 'ticketCode is required for cancellation' },
          { status: 400 }
        );
      }

      const cancelResult = await cancelOrderAndTicket({
        ticketCode,
        orderId,
        reason: reason || 'Attendee requested pass cancellation & refund',
        cancelledByEmail: attendeeEmail,
        cancelledByName: attendeeName,
      });

      // Automatically log a notification inquiry for the organizer to process refund payment
      if (eventId && attendeeEmail) {
        try {
          await createInquiry({
            eventId,
            eventTitle: eventTitle || 'Ticket Cancellation & Refund',
            organizerEmail: 'organizer@epayevents.com',
            senderName: attendeeName || 'Attendee',
            senderEmail: attendeeEmail,
            subject: `Refund Request: Pass ${ticketCode}`,
            message: `Attendee ${attendeeName || ''} (${attendeeEmail}) requested cancellation and refund for order ${orderId || ticketCode}. Reason: ${reason || 'Change of schedule'}. Pass has been voided.`,
          });
        } catch (inqErr) {
          console.warn('[orders API] Inquiry logging exception:', inqErr);
        }
      }

      // Automatically alert the next person in line on the waitlist!
      let waitlistAlert: any = null;
      if (eventId) {
        try {
          const waitlistResult = await notifyNextInLine({
            eventId,
            eventTitle,
          });
          if (waitlistResult.notified && waitlistResult.entry) {
            waitlistAlert = {
              notified: true,
              attendeeName: waitlistResult.entry.userName,
              attendeeEmail: waitlistResult.entry.userEmail,
              tierName: waitlistResult.entry.ticketTierName,
              message: waitlistResult.message,
            };
          }
        } catch (wErr) {
          console.warn('[orders API] Waitlist auto-notification notice:', wErr);
        }
      }

      return NextResponse.json({
        success: true,
        message: cancelResult.message,
        waitlistAlert,
      });
    }

    const {
      eventId,
      eventTitle,
      userId,
      buyerName,
      buyerEmail,
      buyerPhone,
      ticketTypeId,
      ticketName,
      category = 'General',
      qty = 1,
      subtotal = 0,
      discountAmount = 0,
      couponCode,
      tax = 0,
      platformFee = 0,
      total = 0,
      paymentMethod = 'epay_upi',
      status = 'completed',
      customResponses,
    } = body;

    if (!eventId || !eventTitle || !buyerName || !buyerEmail) {
      return NextResponse.json(
        { success: false, error: 'Missing required order details (eventId, eventTitle, buyerName, buyerEmail)' },
        { status: 400 }
      );
    }

    const orderId = body.id || `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    const ticketCode = `EPAY-${orderId}-TKT-1`;

    const encryptedQr = generateEncryptedQRPayload({
      ticketCode,
      orderId,
      eventId,
      eventTitle,
      attendeeName: buyerName,
      attendeeEmail: buyerEmail,
      ticketTierName: ticketName || 'Event Pass',
      pricePaid: Number(total) || 0,
    });

    const orderPayload: OrderPayload = {
      id: orderId,
      eventId,
      eventTitle,
      userId,
      buyerName,
      buyerEmail,
      buyerPhone,
      ticketTypeId: ticketTypeId || 'tkt-gen',
      ticketName: ticketName || 'General Admission',
      category,
      qty: Number(qty) || 1,
      subtotal: Number(subtotal) || 0,
      discountAmount: Number(discountAmount) || 0,
      couponCode,
      tax: Number(tax) || 0,
      platformFee: Number(platformFee) || 0,
      total: Number(total) || 0,
      status: status as any,
      paymentMethod,
    };

    const registrationPayload: RegistrationPayload = {
      id: `REG-${orderId}-1`,
      orderId,
      ticketCode,
      eventId,
      eventTitle,
      attendeeName: buyerName,
      attendeeEmail: buyerEmail,
      attendeePhone: buyerPhone,
      ticketTierId: ticketTypeId || 'tkt-gen',
      ticketTierName: ticketName || 'General Admission',
      pricePaid: Number(total) || 0,
      status: 'valid',
      qrPayload: encryptedQr,
      customResponses,
    };

    const result = await saveOrderAndRegistration(orderPayload, registrationPayload);

    // If order was referred by an affiliate link, log conversion metrics
    const referralCode = body.referralCode || undefined;
    if (referralCode) {
      try {
        await recordReferralConversion(referralCode, Number(total) || 0, Number(discountAmount) || 0);
      } catch (refErr) {
        console.warn('[orders API] Referral tracking notice:', refErr);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        order: result.order,
        registration: result.registration,
        ticketCode,
        qrPayload: encryptedQr,
      },
    });
  } catch (err: any) {
    console.error('[API /api/orders POST] Error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to create order' },
      { status: 500 }
    );
  }
}

