import { NextRequest, NextResponse } from 'next/server';
import { EventItem } from '@/lib/types';
import { mockCategories, getAllEvents, addPublishedEvent } from '@/lib/data';
import { slugify } from '@/lib/eventsStore';

export interface EventApiResponseItem {
  id: string;
  title: string;
  slug: string;
  coverImage: string;
  date: string;
  startTime: string;
  venue: string;
  city: string;
  isOnline: boolean;
  startingPrice: number;
  availableSeats: number;
  category: string;
  status: 'published';
  organizer: {
    name: string;
  };
}

export function transformEventToApiResponse(event: EventItem): EventApiResponseItem {
  const minPrice = event.ticketTypes && event.ticketTypes.length > 0 
    ? Math.min(...event.ticketTypes.map(t => t.price)) 
    : 0;
  
  const totalAvailableSeats = event.ticketTypes && event.ticketTypes.length > 0
    ? event.ticketTypes.reduce((acc, t) => acc + (t.remainingQuantity ?? t.quantity), 0)
    : 0;

  // Extract date and time in clean formats
  const startDateObj = new Date(event.startDate);
  const dateFormatted = !isNaN(startDateObj.getTime())
    ? startDateObj.toISOString().split('T')[0]
    : '2026-11-15';
  
  const hours = startDateObj.getHours().toString().padStart(2, '0');
  const minutes = startDateObj.getMinutes().toString().padStart(2, '0');
  const startTimeFormatted = !isNaN(startDateObj.getTime()) ? `${hours}:${minutes}` : '10:00';

  return {
    id: event.id,
    title: event.title,
    slug: event.slug,
    coverImage: event.bannerUrl,
    date: dateFormatted,
    startTime: startTimeFormatted,
    venue: event.venue?.name || (event.eventType === 'online' ? 'Online Event' : 'Main Venue'),
    city: event.venue?.city || (event.eventType === 'online' ? 'Virtual' : 'India'),
    isOnline: event.eventType === 'online',
    startingPrice: minPrice,
    availableSeats: totalAvailableSeats,
    category: event.category?.name || 'Event',
    status: 'published',
    organizer: {
      name: event.organization?.name || 'ePayEvents Organizer',
    },
  };
}

export async function GET() {
  try {
    const allEvents = getAllEvents();
    // Return only events with status = "published"
    const publishedEvents = allEvents
      .filter(event => event.status === 'published')
      .map(transformEventToApiResponse);

    console.log(`[API /api/events GET] Returned ${publishedEvents.length} published events`);

    return NextResponse.json({
      success: true,
      data: publishedEvents,
    });
  } catch (error) {
    console.error('[API /api/events GET] Failed to fetch events:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('[API /api/events POST] Received event data:', JSON.stringify(body, null, 2));

    const {
      title,
      slug: customSlug,
      categorySlug,
      shortDescription,
      description,
      bannerUrl,
      organizerName,
      organizerEmail,
      organizerPhone,
      organizerBio,
      startDate,
      startTime,
      endDate,
      endTime,
      timezone,
      eventType,
      venueName,
      address,
      city,
      onlineUrl,
      ticketTypes,
      couponCodes,
      registrationFields,
      speakers,
      agenda,
      sponsors,
      exhibitors,
      faqs,
      status: requestedStatus,
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { success: false, error: 'Event title is required.' },
        { status: 400 }
      );
    }

    // 1. Generate slug
    const baseSlug = customSlug && customSlug.trim() ? slugify(customSlug) : slugify(title);
    const uniqueSlug = baseSlug || `event-${Date.now()}`;
    const eventId = body.id || `evt_${Math.random().toString(36).substring(2, 9)}`;

    // 2. Resolve Category
    const category = mockCategories.find(c => c.slug === categorySlug) || mockCategories[0];

    // 3. Format Date / Time into ISO string
    let parsedStartDate = startDate;
    if (startDate && startTime) {
      parsedStartDate = `${startDate}T${startTime}:00Z`;
    } else if (!startDate) {
      parsedStartDate = new Date().toISOString();
    }

    let parsedEndDate = endDate;
    if (endDate && endTime) {
      parsedEndDate = `${endDate}T${endTime}:00Z`;
    } else if (!endDate) {
      parsedEndDate = parsedStartDate;
    }

    // 4. Map ticketTypes
    const mappedTicketTypes: any[] = Array.isArray(ticketTypes) && ticketTypes.length > 0
      ? ticketTypes.map((t: any, idx: number) => ({
          id: t.id || `tkt-${Date.now()}-${idx}`,
          name: t.name || 'General Admission',
          description: t.description || 'Standard entry pass',
          price: Number(t.price) || 0,
          originalPrice: t.originalPrice ? Number(t.originalPrice) : undefined,
          quantity: Number(t.quantity) || 100,
          remainingQuantity: t.remainingQuantity !== undefined ? Number(t.remainingQuantity) : (Number(t.quantity) || 100),
          minPerOrder: Number(t.minPerOrder) || 1,
          maxPerOrder: Number(t.maxPerOrder) || 10,
          category: (t.category as any) || 'General',
          features: t.features || ['Full Event Access', 'Instant QR Pass'],
          isEarlyBird: Boolean(t.isEarlyBird),
          isPopular: Boolean(t.isPopular),
        }))
      : [
          {
            id: `tkt-${Date.now()}-0`,
            name: 'General Admission',
            description: 'Standard event pass',
            price: 499,
            quantity: 200,
            remainingQuantity: 200,
            minPerOrder: 1,
            maxPerOrder: 5,
            category: 'General' as const,
            features: ['Full Event Access', 'Instant QR Ticket'],
            isPopular: true,
          },
        ];

    // 5. Build full event item
    const newEvent: EventItem = {
      id: eventId,
      title: title.trim(),
      slug: uniqueSlug,
      shortDescription: shortDescription?.trim() || `${title.trim()} - Organized on ePayEvents platform.`,
      description: description?.trim() || `Welcome to ${title.trim()}. Book tickets now on ePayEvents!`,
      bannerUrl: bannerUrl?.trim() || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1400&q=80',
      eventType: eventType === 'online' ? 'online' : eventType === 'hybrid' ? 'hybrid' : 'physical',
      status: requestedStatus === 'draft' ? 'draft' : 'published', // defaults to published as requested
      startDate: parsedStartDate,
      endDate: parsedEndDate,
      timezone: timezone || 'IST',
      featured: true,
      category,
      organization: {
        id: `org-${Date.now()}`,
        name: organizerName?.trim() || 'ePayEvents Organizer',
        slug: slugify(organizerName || 'organizer'),
        verified: true,
        contactEmail: organizerEmail?.trim() || 'organizer@epayevents.com',
        avatar: '/team/rahul.jpg',
        bio: organizerBio || 'Event host on ePayEvents platform',
      },
      venue: {
        name: venueName?.trim() || (eventType === 'online' ? 'Online Event' : 'Main Venue'),
        address: address?.trim() || (eventType === 'online' ? 'Virtual' : 'Event Center'),
        city: city?.trim() || (eventType === 'online' ? 'Virtual' : 'Mumbai'),
        country: 'India',
        onlineUrl: onlineUrl?.trim() || undefined,
      },
      ticketTypes: mappedTicketTypes,
      speakers: Array.isArray(speakers) ? speakers : [],
      agenda: Array.isArray(agenda) ? agenda : [],
      sponsors: Array.isArray(sponsors) ? sponsors : [],
      exhibitors: Array.isArray(exhibitors) ? exhibitors : [],
      faqs: Array.isArray(faqs) ? faqs : [],
      couponCodes: Array.isArray(couponCodes) ? couponCodes : [],
    };

    // 6. Save in persistent store
    const savedEvent = addPublishedEvent(newEvent);
    console.log(`[API /api/events POST] Successfully created and saved event "${savedEvent.title}" (slug: ${savedEvent.slug}, status: ${savedEvent.status})`);

    // 7. Format matching the specified response format
    const minPrice = Math.min(...savedEvent.ticketTypes.map(t => t.price));
    const totalAvailableSeats = savedEvent.ticketTypes.reduce((acc, t) => acc + (t.remainingQuantity ?? t.quantity), 0);

    const responseFormat = {
      id: savedEvent.id,
      title: savedEvent.title,
      slug: savedEvent.slug,
      coverImage: savedEvent.bannerUrl,
      date: startDate || savedEvent.startDate.split('T')[0],
      startTime: startTime || '10:00',
      venue: savedEvent.venue.name,
      city: savedEvent.venue.city,
      isOnline: savedEvent.eventType === 'online',
      startingPrice: minPrice,
      availableSeats: totalAvailableSeats,
      category: savedEvent.category.name,
      status: savedEvent.status,
      tickets: savedEvent.ticketTypes,
      registrationFields: registrationFields || [],
      organizer: {
        name: savedEvent.organization.name,
        email: savedEvent.organization.contactEmail,
        phone: organizerPhone || '',
      },
    };

    return NextResponse.json({
      success: true,
      message: 'Event published successfully!',
      data: responseFormat,
    }, { status: 201 });
  } catch (error: any) {
    console.error('[API /api/events POST] Error saving event:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to publish event' },
      { status: 500 }
    );
  }
}
