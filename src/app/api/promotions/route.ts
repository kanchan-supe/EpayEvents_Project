import { NextRequest, NextResponse } from 'next/server';
import {
  getPromoCodes,
  validatePromoCode,
  createPromoCode,
  togglePromoCodeStatus,
  deletePromoCode,
  getReferralLinks,
  getReferralByCode,
  updateReferralDiscount,
  createReferralLink,
  recordReferralClick,
} from '@/lib/repositories/promotionsRepository';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'promo';
    const email = searchParams.get('email') || undefined;
    const eventId = searchParams.get('eventId') || undefined;
    const code = searchParams.get('code') || undefined;

    // Validate a promo code
    if (searchParams.get('action') === 'validate' && code) {
      const subtotal = Number(searchParams.get('subtotal')) || 0;
      const res = await validatePromoCode(code, eventId, undefined, subtotal);
      return NextResponse.json({ success: res.valid, ...res });
    }

    // Get a referral link by code (e.g. to fetch discountPercent for attendee checkout)
    if (searchParams.get('action') === 'get_ref' && code) {
      const referral = await getReferralByCode(code);
      if (!referral) {
        return NextResponse.json({ success: false, error: 'Referral code not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: referral });
    }

    // Track a referral click
    if (searchParams.get('action') === 'track_click' && code) {
      const cleanCode = code.trim().toUpperCase();
      const tracked = await recordReferralClick(cleanCode);
      return NextResponse.json({ success: Boolean(tracked), data: tracked });
    }

    if (type === 'referrals') {
      const referrals = await getReferralLinks(email, eventId);
      return NextResponse.json({ success: true, data: referrals });
    }

    const promos = await getPromoCodes(email, eventId);
    return NextResponse.json({ success: true, data: promos });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'create_promo') {
      const { code, eventId, discountType, discountValue, maxUses, expiresAt, organizerEmail, minOrderAmount } = body;
      if (!code || !discountValue) {
        return NextResponse.json({ success: false, error: 'Code and discount value are required' }, { status: 400 });
      }

      const created = await createPromoCode({
        code,
        eventId: eventId || undefined,
        discountType: discountType || 'percentage',
        discountValue: Number(discountValue),
        maxUses: Number(maxUses) || 100,
        expiresAt: expiresAt || undefined,
        organizerEmail: organizerEmail || undefined,
        minOrderAmount: minOrderAmount ? Number(minOrderAmount) : undefined,
        isActive: true,
      });

      return NextResponse.json({ success: true, data: created });
    }

    if (action === 'toggle_promo') {
      const { id } = body;
      const updated = await togglePromoCodeStatus(id);
      return NextResponse.json({ success: Boolean(updated), data: updated });
    }

    if (action === 'delete_promo') {
      const { id } = body;
      const deleted = await deletePromoCode(id);
      return NextResponse.json({ success: deleted });
    }

    if (action === 'create_referral') {
      const { code, affiliateName, affiliateEmail, type, eventId, eventTitle, commissionPercent, discountPercent, organizerEmail } = body;
      if (!code || !affiliateName || !eventId) {
        return NextResponse.json({ success: false, error: 'Code, affiliate name and event are required' }, { status: 400 });
      }

      const created = await createReferralLink({
        code,
        affiliateName,
        affiliateEmail: affiliateEmail || '',
        organizerEmail: organizerEmail || undefined,
        type: type || 'campus_ambassador',
        eventId,
        eventTitle: eventTitle || 'Event',
        commissionPercent: Number(commissionPercent) || 10,
        discountPercent: Number(discountPercent) || 0,
      });

      return NextResponse.json({ success: true, data: created });
    }

    if (action === 'update_referral_discount') {
      const { id, discountPercent } = body;
      if (!id || discountPercent === undefined) {
        return NextResponse.json({ success: false, error: 'Referral ID and discount percentage are required' }, { status: 400 });
      }
      const updated = await updateReferralDiscount(id, Number(discountPercent));
      return NextResponse.json({ success: Boolean(updated), data: updated });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

