import { NextRequest, NextResponse } from 'next/server';
import { 
  getAllReviews, 
  addReview, 
  replyToReview, 
  getEventRatingStats 
} from '@/lib/repositories/reviewRepository';

export const dynamic = 'force-dynamic';

/**
 * GET /api/reviews?eventId=[slugOrId]
 * Returns list of verified reviews and aggregate star metrics for an event
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId') || undefined;

    const reviews = await getAllReviews(eventId);
    const stats = eventId ? await getEventRatingStats(eventId) : null;

    return NextResponse.json({
      success: true,
      data: {
        reviews,
        stats,
      },
    });
  } catch (err: any) {
    console.error('[API /api/reviews GET] Error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed fetching reviews' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/reviews
 * Submits a new review or organizer reply
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action = 'create', reviewId, replyContent, repliedBy, ...reviewPayload } = body;

    // Action 1: Organizer Reply to existing review
    if (action === 'reply') {
      if (!reviewId || !replyContent) {
        return NextResponse.json(
          { success: false, error: 'reviewId and replyContent are required for replies' },
          { status: 400 }
        );
      }
      const updated = await replyToReview(reviewId, replyContent, repliedBy || 'Event Organizer');
      return NextResponse.json({
        success: true,
        data: updated,
      });
    }

    // Action 2: Create new review
    const {
      eventId,
      eventTitle,
      userId,
      authorName,
      authorEmail,
      authorAvatar,
      rating,
      title,
      content,
      ticketTierName,
      isVerifiedPassHolder = true,
    } = reviewPayload;

    if (!eventId || !authorName || !content || !rating) {
      return NextResponse.json(
        { success: false, error: 'Missing required review fields (eventId, authorName, rating, content)' },
        { status: 400 }
      );
    }

    const created = await addReview({
      eventId,
      eventTitle: eventTitle || 'ePay Event',
      userId,
      authorName,
      authorEmail: authorEmail || 'attendee@epayevents.com',
      authorAvatar: authorAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${authorName}`,
      rating: Math.min(5, Math.max(1, Number(rating))),
      title,
      content,
      ticketTierName,
      isVerifiedPassHolder,
    });

    return NextResponse.json({
      success: true,
      data: created,
    });
  } catch (err: any) {
    console.error('[API /api/reviews POST] Error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed submitting review' },
      { status: 500 }
    );
  }
}

