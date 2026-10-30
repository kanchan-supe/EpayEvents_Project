import { NextRequest, NextResponse } from 'next/server';
import { EventItem } from '@/lib/types';
import { getPublishedEvents, createEvent, updateEvent, getEventStatus } from '@/lib/repositories/eventRepository';

export interface EventApiResponseItem {
  id: string;
  title: string;
  slug: string;
  coverImage: string;
  date: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  timezone?: string;
  venue: string;
  city: string;
  isOnline: boolean;
  startingPrice: number;
  availableSeats: number;
  category: string;
  status: 'published';
  eventStatus: 'live' | 'upcoming' | 'past';
  organizer: {
    id?: string;
    name: string;
    email?: string;
  };
  organizerId?: string;
  organizerEmail?: string;
}

export function formatDisplayTime(timeStr?: string): string {
  if (!timeStr) return '10:00 AM';
  const trimmed = timeStr.trim();
  if (/(AM|PM)$/i.test(trimmed)) {
    return trimmed.toUpperCase();
  }
  const parts = trimmed.split(':');
  if (parts.length >= 2) {
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    if (!isNaN(hours) && !isNaN(minutes)) {
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 === 0 ? 12 : hours % 12;
      const displayMinutes = minutes.toString().padStart(2, '0');
      return `${displayHours.toString().padStart(2, '0')}:${displayMinutes} ${period}`;
    }
  }
  return trimmed;
}

export function transformEventToApiResponse(event: EventItem): EventApiResponseItem {
  const minPrice = event.ticketTypes && event.ticketTypes.length > 0 
    ? Math.min(...event.ticketTypes.map(t => t.price)) 
    : 0;
  
  const totalAvailableSeats = event.ticketTypes && event.ticketTypes.length > 0
    ? event.ticketTypes.reduce((acc, t) => acc + (t.remainingQuantity ?? t.quantity), 0)
    : 0;

  // Extract clean start date without timezone offset shifts
  let startDateFormatted = event.date || '2026-11-15';
  if (event.startDate) {
    const dateMatch = event.startDate.match(/^(\d{4}-\d{2}-\d{2})/);
    if (dateMatch) {
      startDateFormatted = dateMatch[1];
    }
  }

  // Extract clean end date
  let endDateFormatted = startDateFormatted;
  if (event.endDate) {
    const dateMatch = event.endDate.match(/^(\d{4}-\d{2}-\d{2})/);
    if (dateMatch) {
      endDateFormatted = dateMatch[1];
    }
  }

  // Extract clean start time without timezone offset shifts (preserves exact 10:00 AM)
  let startTimeFormatted = '10:00 AM';
  if (event.startTime) {
    startTimeFormatted = formatDisplayTime(event.startTime);
  } else if (event.startDate) {
    const timeMatch = event.startDate.match(/T(\d{2}):(\d{2})/);
    if (timeMatch && (timeMatch[1] !== '00' || timeMatch[2] !== '00')) {
      const h = parseInt(timeMatch[1], 10);
      const m = parseInt(timeMatch[2], 10);
      const period = h >= 12 ? 'PM' : 'AM';
      const displayH = h % 12 === 0 ? 12 : h % 12;
      startTimeFormatted = `${displayH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${period}`;
    }
  }

  // Extract clean end time
  let endTimeFormatted = '06:00 PM';
  if (event.endTime) {
    endTimeFormatted = formatDisplayTime(event.endTime);
  } else if (event.endDate) {
    const timeMatch = event.endDate.match(/T(\d{2}):(\d{2})/);
    if (timeMatch && (timeMatch[1] !== '00' || timeMatch[2] !== '00')) {
      const h = parseInt(timeMatch[1], 10);
      const m = parseInt(timeMatch[2], 10);
      const period = h >= 12 ? 'PM' : 'AM';
      const displayH = h % 12 === 0 ? 12 : h % 12;
      endTimeFormatted = `${displayH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${period}`;
    }
  }

  return {
    id: event.id,
    title: event.title,
    slug: event.slug,
    coverImage: event.bannerUrl,
    date: startDateFormatted,
    startDate: startDateFormatted,
    endDate: endDateFormatted,
    startTime: startTimeFormatted,
    endTime: endTimeFormatted,
    timezone: event.timezone || 'IST',
    venue: event.venue?.name || (event.eventType === 'online' ? 'Online Event' : 'Main Venue'),
    city: event.venue?.city || (event.eventType === 'online' ? 'Virtual' : 'India'),
    isOnline: event.eventType === 'online',
    startingPrice: minPrice,
    availableSeats: totalAvailableSeats,
    category: event.category?.name || 'Event',
    status: 'published',
    eventStatus: getEventStatus(startDateFormatted),
    organizer: {
      id: event.organization?.id,
      name: event.organization?.name || 'ePayEvents Organizer',
      email: event.organization?.contactEmail,
    },
    organizerId: event.organization?.id,
    organizerEmail: event.organization?.contactEmail,
  };
}

/**
 * GET /api/events
 * Returns only events where status = 'published' using eventRepository.getPublishedEvents()
 * Supports optional ?organizerId=... and ?organizerEmail=... filtering
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const filterOrganizerId = searchParams.get('organizerId');
    const filterOrganizerEmail = searchParams.get('organizerEmail')?.toLowerCase().trim();

    const publishedEvents = await getPublishedEvents();
    let formatted = publishedEvents.map(transformEventToApiResponse);

    if (filterOrganizerId || filterOrganizerEmail) {
      formatted = formatted.filter(ev => {
        const idMatch = filterOrganizerId && (
          ev.organizerId === filterOrganizerId || 
          ev.organizer?.id === filterOrganizerId
        );
        const emailMatch = filterOrganizerEmail && (
          ev.organizerEmail?.toLowerCase() === filterOrganizerEmail || 
          ev.organizer?.email?.toLowerCase() === filterOrganizerEmail
        );
        return Boolean(idMatch || emailMatch);
      });
    }

    console.log(`[API /api/events GET] Returned ${formatted.length} published events via eventRepository (filtered: ${Boolean(filterOrganizerId || filterOrganizerEmail)})`);

    return NextResponse.json({
      success: true,
      data: formatted,
    });
  } catch (error: any) {
    console.error('[API /api/events GET] Failed to fetch events:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/events
 * Creates and publishes an event using eventRepository.createEvent()
 * When publishing, sets status = 'published'
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('[API /api/events POST] Received event data:', JSON.stringify(body, null, 2));

    if (!body.title || !body.title.trim()) {
      return NextResponse.json(
        { success: false, error: 'Event title is required.' },
        { status: 400 }
      );
    }

    // Force status: 'published' on publishing
    const payload = {
      ...body,
      status: 'published',
    };

    const savedEvent = await createEvent(payload);
    console.log(`[API /api/events POST] Successfully published event: "${savedEvent.title}" (${savedEvent.slug})`);

    const minPrice = Math.min(...savedEvent.ticketTypes.map(t => t.price));
    const totalAvailableSeats = savedEvent.ticketTypes.reduce(
      (acc, t) => acc + (t.remainingQuantity ?? t.quantity),
      0
    );

    const responseData = {
      id: savedEvent.id,
      title: savedEvent.title,
      slug: savedEvent.slug,
      coverImage: savedEvent.bannerUrl,
      date: body.startDate || savedEvent.date || (savedEvent.startDate ? savedEvent.startDate.split('T')[0] : '2026-11-15'),
      startDate: body.startDate || (savedEvent.startDate ? savedEvent.startDate.split('T')[0] : savedEvent.date || '2026-11-15'),
      endDate: body.endDate || (savedEvent.endDate ? savedEvent.endDate.split('T')[0] : body.startDate || savedEvent.date || '2026-11-16'),
      startTime: formatDisplayTime(savedEvent.startTime || body.startTime || '10:00 AM'),
      endTime: formatDisplayTime(savedEvent.endTime || body.endTime || '06:00 PM'),
      timezone: savedEvent.timezone || body.timezone || 'IST',
      venue: savedEvent.venue.name,
      city: savedEvent.venue.city,
      isOnline: savedEvent.eventType === 'online',
      startingPrice: minPrice,
      availableSeats: totalAvailableSeats,
      category: savedEvent.category.name,
      status: savedEvent.status,
      tickets: savedEvent.ticketTypes,
      registrationFields: body.registrationFields || savedEvent.registrationFields || [],
      organizer: {
        name: savedEvent.organization.name,
        email: savedEvent.organization.contactEmail,
        phone: body.organizerPhone || '',
      },
    };

    return NextResponse.json(
      {
        success: true,
        message: 'Event published successfully!',
        data: responseData,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[API /api/events POST] Error saving event:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to publish event' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/events
 * Updates an existing event when id or slug is provided in request body
 */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const identifier = body.id || body.slug;

    if (!identifier) {
      return NextResponse.json(
        { success: false, error: 'Event id or slug is required for updating.' },
        { status: 400 }
      );
    }

    const updated = await updateEvent(identifier, body);

    if (!updated) {
      return NextResponse.json(
        { success: false, error: `Event "${identifier}" not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Event updated successfully!',
      data: updated,
    });
  } catch (error: any) {
    console.error('[API /api/events PUT] Error updating event:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update event' },
      { status: 500 }
    );
  }
}
