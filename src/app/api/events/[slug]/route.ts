import { NextRequest, NextResponse } from 'next/server';
import { getEventBySlug, updateEvent } from '@/lib/repositories/eventRepository';

interface RouteContext {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * GET /api/events/[slug]
 * Retrieves a single event by its unique slug using eventRepository.getEventBySlug()
 */
export async function GET(
  req: NextRequest,
  context: RouteContext
) {
  try {
    const { slug } = await context.params;

    if (!slug || !slug.trim()) {
      return NextResponse.json(
        { success: false, error: 'Event slug is required.' },
        { status: 400 }
      );
    }

    const event = await getEventBySlug(slug.trim());

    if (!event) {
      return NextResponse.json(
        { success: false, error: `Event with slug "${slug}" was not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: event,
    });
  } catch (error: any) {
    console.error('[API /api/events/[slug] GET] Error fetching event by slug:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/events/[slug]
 * Updates an existing event by slug using eventRepository.updateEvent()
 */
export async function PUT(
  req: NextRequest,
  context: RouteContext
) {
  try {
    const { slug } = await context.params;
    const body = await req.json();

    if (!slug || !slug.trim()) {
      return NextResponse.json(
        { success: false, error: 'Event slug is required.' },
        { status: 400 }
      );
    }

    const updated = await updateEvent(slug.trim(), body);

    if (!updated) {
      return NextResponse.json(
        { success: false, error: `Event "${slug}" was not found to update.` },
        { status: 404 }
      );
    }

    console.log(`[API /api/events/[slug] PUT] Event "${updated.title}" successfully updated`);

    return NextResponse.json({
      success: true,
      message: 'Event updated successfully!',
      data: updated,
    });
  } catch (error: any) {
    console.error('[API /api/events/[slug] PUT] Error updating event:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

