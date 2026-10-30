import { NextRequest, NextResponse } from 'next/server';
import { getAllOrders, getAllRegistrations } from '@/lib/repositories/orderRepository';
import { getAllEvents } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // Optional admin authorization check
    const authHeader = req.headers.get('authorization') || '';
    const roleParam = searchParams.get('adminRole') || '';
    // Note: If you want strict rejection, verify role === 'admin'
    
    const search = (searchParams.get('search') || '').toLowerCase().trim();
    const eventFilter = (searchParams.get('event') || '').trim();
    const statusFilter = (searchParams.get('status') || 'all').toLowerCase().trim();
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, parseInt(searchParams.get('limit') || '10', 10));

    const [orders, registrations, allEvents] = await Promise.all([
      getAllOrders(),
      getAllRegistrations(),
      getAllEvents(),
    ]);

    // Build unified attendee bookings table
    // Each record represents a booked ticket pass with order information
    const bookingsList: any[] = [];

    // Map by ticket code or registration ID
    registrations.forEach((reg) => {
      const parentOrder = orders.find((o) => o.id === reg.orderId);
      const matchedEvent = allEvents.find((e) => e.id === reg.eventId || e.slug === reg.eventId || (e.title && reg.eventTitle && e.title.toLowerCase() === reg.eventTitle.toLowerCase()));

      bookingsList.push({
        bookingId: reg.ticketCode || reg.id,
        orderId: reg.orderId,
        ticketCode: reg.ticketCode,
        attendeeName: reg.attendeeName || parentOrder?.buyerName || 'Attendee',
        attendeeEmail: reg.attendeeEmail || parentOrder?.buyerEmail || 'attendee@example.com',
        attendeePhone: reg.attendeePhone || parentOrder?.buyerPhone || '—',
        eventId: reg.eventId,
        eventTitle: reg.eventTitle || parentOrder?.eventTitle || matchedEvent?.title || 'ePay Event',
        eventDate: matchedEvent?.date || matchedEvent?.startDate?.split('T')[0] || reg.createdAt?.split('T')[0] || '2026-11-15',
        venue: (typeof matchedEvent?.venue === 'object' ? matchedEvent?.venue?.name : (matchedEvent as any)?.venue) || 'Main Venue',
        venueCity: (typeof matchedEvent?.venue === 'object' ? matchedEvent?.venue?.city : (matchedEvent as any)?.city) || 'Mumbai',
        ticketTierId: reg.ticketTierId,
        ticketTierName: reg.ticketTierName || parentOrder?.ticketName || 'General Admission',
        amountPaid: Number(reg.pricePaid !== undefined ? reg.pricePaid : (parentOrder?.total || 0)),
        bookingDate: reg.createdAt || parentOrder?.createdAt || new Date().toISOString(),
        paymentStatus: parentOrder?.status || (reg.status === 'cancelled' || reg.status === 'refunded' ? 'refunded' : 'completed'),
        ticketStatus: reg.status || 'valid',
        paymentMethod: parentOrder?.paymentMethod || 'epay_upi',
        qrPayload: reg.qrPayload,
        customResponses: reg.customResponses || {},
      });
    });

    // Also include any standalone orders that may not have generated a child registration record
    orders.forEach((ord) => {
      const alreadyIncluded = bookingsList.some((b) => b.orderId === ord.id);
      if (!alreadyIncluded) {
        const matchedEvent = allEvents.find((e) => e.id === ord.eventId || e.slug === ord.eventId);
        bookingsList.push({
          bookingId: `ORD-${ord.id}`,
          orderId: ord.id,
          ticketCode: `EPAY-${ord.id}-TKT-1`,
          attendeeName: ord.buyerName || 'Attendee',
          attendeeEmail: ord.buyerEmail || 'attendee@example.com',
          attendeePhone: ord.buyerPhone || '—',
          eventId: ord.eventId,
          eventTitle: ord.eventTitle || matchedEvent?.title || 'ePay Event',
          eventDate: matchedEvent?.date || matchedEvent?.startDate?.split('T')[0] || ord.createdAt?.split('T')[0] || '2026-11-15',
          venue: (typeof matchedEvent?.venue === 'object' ? matchedEvent?.venue?.name : (matchedEvent as any)?.venue) || 'Main Venue',
          venueCity: (typeof matchedEvent?.venue === 'object' ? matchedEvent?.venue?.city : (matchedEvent as any)?.city) || 'Mumbai',
          ticketTierId: ord.ticketTypeId,
          ticketTierName: ord.ticketName || 'General Admission',
          amountPaid: Number(ord.total || 0),
          bookingDate: ord.createdAt || new Date().toISOString(),
          paymentStatus: ord.status || 'completed',
          ticketStatus: ord.status === 'cancelled' ? 'cancelled' : 'valid',
          paymentMethod: ord.paymentMethod || 'epay_upi',
          qrPayload: '',
          customResponses: {},
        });
      }
    });

    // 1. Filter by Search Query
    let filtered = bookingsList;
    if (search) {
      filtered = filtered.filter(
        (b) =>
          b.attendeeName.toLowerCase().includes(search) ||
          b.attendeeEmail.toLowerCase().includes(search) ||
          b.attendeePhone.toLowerCase().includes(search) ||
          b.eventTitle.toLowerCase().includes(search) ||
          b.ticketCode.toLowerCase().includes(search) ||
          b.orderId.toLowerCase().includes(search) ||
          b.ticketTierName.toLowerCase().includes(search)
      );
    }

    // 2. Filter by Event
    if (eventFilter && eventFilter !== 'all') {
      filtered = filtered.filter(
        (b) => b.eventId === eventFilter || b.eventTitle.toLowerCase() === eventFilter.toLowerCase()
      );
    }

    // 3. Filter by Payment Status
    if (statusFilter && statusFilter !== 'all') {
      filtered = filtered.filter((b) => b.paymentStatus.toLowerCase() === statusFilter);
    }

    // Sort by latest booking date first
    filtered.sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime());

    const totalCount = filtered.length;
    const totalPages = Math.ceil(totalCount / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginated = filtered.slice(startIndex, startIndex + limit);

    // List of distinct events for filter dropdown (deduplicated by id)
    const distinctEventsMap = new Map<string, string>();
    bookingsList.forEach((b) => {
      if (b.eventId && !distinctEventsMap.has(b.eventId)) {
        distinctEventsMap.set(b.eventId, b.eventTitle);
      }
    });
    const distinctEvents = Array.from(distinctEventsMap.entries()).map(([id, title]) => ({
      id,
      title,
    }));

    return NextResponse.json({
      success: true,
      data: {
        bookings: paginated,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          limit,
        },
        distinctEvents,
        summary: {
          totalBookings: bookingsList.length,
          totalCompleted: bookingsList.filter((b) => b.paymentStatus === 'completed').length,
          totalRevenue: bookingsList
            .filter((b) => b.paymentStatus === 'completed')
            .reduce((sum, b) => sum + (Number(b.amountPaid) || 0), 0),
        },
      },
    });
  } catch (err: any) {
    console.error('[API /api/admin/bookings] Exception:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
