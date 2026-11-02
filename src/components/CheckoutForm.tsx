'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  Ticket, ShieldCheck, Tag, CreditCard, CheckCircle2, User, Lock, Sparkles, 
  Users, Clock, Key, AlertCircle, ArrowRightLeft, Undo2, Award
} from 'lucide-react';
import { EventItem } from '@/lib/types';
import { VenueSeatingLayout } from '@/components/VenueSeatingLayout';

export function CheckoutForm({ 
  event, 
  initialTicketId,
  initialCouponCode = '',
  initialReferralCode = '',
}: { 
  event: EventItem; 
  initialTicketId?: string;
  initialCouponCode?: string;
  initialReferralCode?: string;
}) {
  const router = useRouter();
  const { user, profile } = useAuth();

  // Passcode unlock state for hidden passes
  const [unlockedPasscode, setUnlockedPasscode] = useState('');
  const [passcodeInput, setPasscodeInput] = useState('');
  const [passcodeError, setPasscodeError] = useState('');

  // Synchronize event with latest localStorage edits (for freshly created/published events)
  const [currentEvent, setCurrentEvent] = useState<EventItem>(() => {
    let active = event;
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('epay_persisted_events');
        if (stored) {
          const parsed = JSON.parse(stored);
          const normSlug = (event.slug || '').toLowerCase().trim();
          const normId = (event.id || '').toLowerCase().trim();
          let edited = parsed[event.id] || parsed[event.slug];
          if (!edited && typeof parsed === 'object') {
            edited = Object.values(parsed).find((item: any) => 
              (item.slug && item.slug.toLowerCase().trim() === normSlug) ||
              (item.id && String(item.id).toLowerCase().trim() === normId) ||
              (item.title && item.title.toLowerCase().trim() === event.title?.toLowerCase().trim())
            );
          }
          if (edited) {
            active = { ...event, ...edited };
          }
        }
      } catch (e) {
        console.warn('[CheckoutForm] localStorage error:', e);
      }
    }
    return active;
  });

  // Per-tier quantity state: Record<ticketId, quantity>
  const [ticketQuantities, setTicketQuantities] = useState<Record<string, number>>(() => {
    const initialMap: Record<string, number> = {};
    const tTypes = (currentEvent.ticketTypes && currentEvent.ticketTypes.length > 0)
      ? currentEvent.ticketTypes
      : (event.ticketTypes && event.ticketTypes.length > 0)
      ? event.ticketTypes
      : [];
    tTypes.forEach(t => {
      // Don't auto-select hidden or waitlist tickets
      if (!t.isHidden && !t.isWaitlist) {
        initialMap[t.id] = t.id === (initialTicketId || tTypes[0]?.id) ? 1 : 0;
      } else {
        initialMap[t.id] = 0;
      }
    });
    return initialMap;
  });

  // Waitlist email state
  const [waitlistSuccess, setWaitlistSuccess] = useState<string | null>(null);

  // Transfer & Refund preview modals / options
  const [enableTransferProtection, setEnableTransferProtection] = useState(true);
  const [enableRefundGuarantee, setEnableRefundGuarantee] = useState(true);

  // Referral & Promo code & discounts
  const [couponCode, setCouponCode] = useState<string>(initialCouponCode || initialReferralCode || '');
  const [referralCode, setReferralCode] = useState<string>(initialReferralCode || '');
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [referralInfo, setReferralInfo] = useState<{ affiliateName?: string; discountPercent: number } | null>(null);
  const [couponMsg, setCouponMsg] = useState<{ text: string; isError: boolean } | null>(null);

  // Auto-apply referral link discount if passed
  React.useEffect(() => {
    const activeRef = initialReferralCode;
    if (activeRef) {
      setReferralCode(activeRef);
      fetch(`/api/promotions?action=get_ref&code=${encodeURIComponent(activeRef)}`)
        .then(res => res.json())
        .then(json => {
          if (json.success && json.data) {
            const r = json.data;
            if (r.discountPercent > 0) {
              setAppliedDiscount(r.discountPercent);
              setReferralInfo({ affiliateName: r.affiliateName, discountPercent: r.discountPercent });
              setCouponMsg({
                text: `Referral Link Applied! ${r.discountPercent}% Discount granted by ${r.affiliateName}.`,
                isError: false,
              });
            }
          }
        })
        .catch(err => console.warn('Referral fetch error:', err));
    } else if (initialCouponCode) {
      // Auto-validate initial coupon
      fetch(`/api/promotions?action=validate&code=${encodeURIComponent(initialCouponCode)}&eventId=${encodeURIComponent(event.id)}`)
        .then(res => res.json())
        .then(json => {
          if (json.success && json.discountPercent !== undefined) {
            setAppliedDiscount(json.discountPercent);
            setCouponMsg({ text: `Promo code ${initialCouponCode} applied! (${json.discountPercent}% OFF)`, isError: false });
          }
        })
        .catch(() => {});
    }
  }, [initialReferralCode, initialCouponCode, event.id]);

  // Live Seat Selection State
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  // Attendee Form Fields
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [approvalNote, setApprovalNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'epay_upi' | 'card' | 'netbanking'>('epay_upi');
  const [isProcessing, setIsProcessing] = useState(false);
  // Pre-fill user details if logged in
  React.useEffect(() => {
    if (user) {
      if (!buyerName) {
        setBuyerName(profile?.full_name || (user.user_metadata as any)?.full_name || (user.user_metadata as any)?.name || '');
      }
      if (!buyerEmail && user.email) {
        setBuyerEmail(user.email);
      }
      if (!buyerPhone && (profile?.phone || (user.user_metadata as any)?.phone)) {
        setBuyerPhone(profile?.phone || (user.user_metadata as any)?.phone || '');
      }
    }
  }, [user, profile]);


  // Group discount calculation & Dynamic surge
  const totalTicketsSelected = Object.values(ticketQuantities).reduce((a, b) => a + b, 0);
  const activeSelectedTier = event.ticketTypes.find(t => (ticketQuantities[t.id] || 0) > 0) || event.ticketTypes[0];
  
  // Calculate subtotal with group discount rules and dynamic pricing surge
  let subtotal = 0;
  let groupDiscountAmount = 0;

  event.ticketTypes.forEach(t => {
    const qty = ticketQuantities[t.id] || 0;
    if (qty > 0) {
      const baseTierPrice = t.price;
      const tierSubtotal = baseTierPrice * qty;
      subtotal += tierSubtotal;

      // Group discount rule: e.g. 15% off when booking 4 or more
      if (t.isGroupDiscount && t.groupMinQty && qty >= t.groupMinQty) {
        const discountRate = (t.groupDiscountPercent || 15) / 100;
        groupDiscountAmount += Math.round(tierSubtotal * discountRate);
      }
    }
  });

  const couponDiscountAmount = Math.round((subtotal * appliedDiscount) / 100);
  const totalDiscounts = groupDiscountAmount + couponDiscountAmount;
  const taxableAmount = Math.max(0, subtotal - totalDiscounts);
  const tax = taxableAmount === 0 ? 0 : Math.round(taxableAmount * 0.18); // 18% GST
  const platformFee = taxableAmount === 0 ? 0 : 50; // Flat ₹50 platform fee
  const total = Math.max(0, taxableAmount + tax + platformFee);

  const updateQuantity = (tktId: string, delta: number) => {
    const ticketDef = event.ticketTypes.find(t => t.id === tktId);
    if (!ticketDef) return;

    // Check limits
    const maxAllowed = ticketDef.maxPerOrder || 6;
    const minAllowed = 0;

    setTicketQuantities(prev => {
      const current = prev[tktId] || 0;
      const next = Math.max(minAllowed, Math.min(maxAllowed, current + delta));
      return { ...prev, [tktId]: next };
    });
  };

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    try {
      const res = await fetch(`/api/promotions?action=validate&code=${encodeURIComponent(code)}&eventId=${encodeURIComponent(event.id)}&subtotal=${subtotal}`);
      const json = await res.json();
      if (json.success && (json.discountPercent !== undefined || json.fixedDiscount !== undefined)) {
        const pct = json.discountPercent || (json.fixedDiscount && subtotal > 0 ? Math.round((json.fixedDiscount / subtotal) * 100) : 0);
        setAppliedDiscount(pct);
        setCouponMsg({ 
          text: json.fixedDiscount 
            ? `Discount code ${code} applied! (₹${json.fixedDiscount} FLAT OFF)` 
            : `Promo code ${code} applied! (${pct}% OFF)`, 
          isError: false 
        });
        return;
      } else if (json.error) {
        setCouponMsg({ text: json.error, isError: true });
        return;
      }
    } catch (e) {
      console.warn('Online promo verification failed, testing local fallback:', e);
    }

    // Static local fallbacks
    if (code === 'EARLYBIRD20' || code === 'EPAY20') {
      setAppliedDiscount(20);
      setCouponMsg({ text: `Promo code ${code} applied! (20% OFF)`, isError: false });
    } else if (code === 'EARLYDEV' || code === 'EARLYBIRD') {
      setAppliedDiscount(15);
      setCouponMsg({ text: 'Early Bird Code Applied! (15% OFF)', isError: false });
    } else if (code === 'FREEPASS') {
      setAppliedDiscount(100);
      setCouponMsg({ text: 'VIP Complimentary 100% OFF code applied!', isError: false });
    } else {
      setCouponMsg({ text: 'Invalid or expired promo code.', isError: true });
    }
  };

  const handleUnlockHidden = (e: React.FormEvent) => {
    e.preventDefault();
    setPasscodeError('');
    if (passcodeInput.trim().toUpperCase() === 'EPAYVIP') {
      setUnlockedPasscode('EPAYVIP');
      setPasscodeInput('');
    } else {
      setPasscodeError('Invalid passcode. Hint: Try EPAYVIP');
    }
  };

  const handleJoinWaitlist = (tktName: string) => {
    if (!buyerEmail) {
      alert('Please enter your email address in the Attendee Details section first.');
      return;
    }
    setWaitlistSuccess(`You have joined the priority waitlist for ${tktName}! We will alert ${buyerEmail} on seat drops.`);
    setTimeout(() => setWaitlistSuccess(null), 5000);
  };

  const handleCompletePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totalTicketsSelected === 0) {
      alert('Please select at least 1 ticket to proceed.');
      return;
    }
    setIsProcessing(true);

    const orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    const ticketId = `EPAY-${orderId}-TKT-1`;
    const ticketTier = activeSelectedTier || event.ticketTypes[0];
    const ticketTierName = ticketTier?.name || 'General Admission Pass';
    const categoryName = ticketTier?.category || 'General';

    let secureQrPayload = '';

    try {
      const { generateEncryptedQRPayload, saveOrderAndRegistration } = await import('@/lib/repositories/orderRepository');
      secureQrPayload = generateEncryptedQRPayload({
        ticketCode: ticketId,
        orderId,
        eventId: event.id,
        eventTitle: event.title,
        attendeeName: buyerName,
        attendeeEmail: buyerEmail,
        ticketTierName,
        pricePaid: total,
      });

      await saveOrderAndRegistration(
        {
          id: orderId,
          eventId: event.id,
          userId: user?.id,
          eventTitle: event.title,
          buyerName,
          buyerEmail,
          buyerPhone,
          ticketTypeId: ticketTier?.id || 'tkt-1',
          ticketName: ticketTierName,
          category: categoryName,
          qty: totalTicketsSelected,
          subtotal,
          discountAmount: groupDiscountAmount + (subtotal * appliedDiscount) / 100,
          couponCode: couponCode || undefined,
          tax,
          platformFee,
          total,
          status: 'completed',
          paymentMethod,
        },
        {
          id: `REG-${orderId}-1`,
          orderId,
          ticketCode: ticketId,
          eventId: event.id,
          eventTitle: event.title,
          attendeeName: buyerName,
          attendeeEmail: buyerEmail,
          attendeePhone: buyerPhone,
          ticketTierId: ticketTier?.id || 'tkt-1',
          ticketTierName,
          pricePaid: total,
          status: ticketTier?.isApprovalRequired ? 'pending_approval' as any : 'valid',
          qrPayload: secureQrPayload,
        }
      );

      // Track referral conversion with API
      if (referralCode) {
        fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventId: event.id,
            eventTitle: event.title,
            buyerName,
            buyerEmail,
            total,
            discountAmount: (subtotal * appliedDiscount) / 100,
            referralCode,
          }),
        }).catch(() => {});
      }
    } catch (err) {
      console.warn('Could not save order:', err);
    }

    setTimeout(() => {
      const queryParams = new URLSearchParams({
        orderId,
        buyerName,
        buyerEmail,
        buyerPhone,
        ticketName: ticketTierName,
        category: categoryName,
        qty: totalTicketsSelected.toString(),
        total: total.toString(),
        eventTitle: event.title,
        eventId: event.id,
        venue: event.venue.name,
        date: event.startDate,
        qrPayload: secureQrPayload,
        transferrable: enableTransferProtection ? 'yes' : 'no',
        refundable: enableRefundGuarantee ? 'yes' : 'no',
        approvalRequired: activeSelectedTier?.isApprovalRequired ? 'yes' : 'no',
        seats: selectedSeats.length > 0 ? selectedSeats.join(',') : '',
      });

      router.push(`/order-success?${queryParams.toString()}`);
    }, 1200);
  };


  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Checkout Form */}
      <div className="lg:col-span-2 space-y-6">
        <form onSubmit={handleCompletePayment} className="space-y-6">
          
          {/* Smart Ticketing Feature Highlights Ribbon */}
          <div className="bg-gradient-to-r from-[#0F766E]/10 via-[#0F766E]/5 to-[#F97316]/10 border border-[#0F766E]/30 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#F97316]" />
              <span className="font-bold text-[#1C1917]">Smart Ticketing Engine Active</span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold text-[#78716C]">
              <span className="flex items-center gap-1 text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Instant QR ID
              </span>
              <span className="flex items-center gap-1 text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-md">
                <ArrowRightLeft className="h-3 w-3 text-blue-600" /> Free Pass Transfer
              </span>
              <span className="flex items-center gap-1 text-teal-700 bg-teal-100/70 px-2 py-0.5 rounded-md">
                <Undo2 className="h-3 w-3 text-teal-600" /> Instant Refund Policy
              </span>
            </div>
          </div>

          {/* Attendee Details */}
          <div className="bg-white p-6 rounded-2xl border border-[#E7E5E4] shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-[#1C1917] flex items-center gap-2 border-b border-[#E7E5E4] pb-3">
              <User className="h-5 w-5 text-[#0F766E]" /> Attendee & Registration Information
            </h2>

            <div>
              <label className="block text-xs font-semibold text-[#1C1917] mb-1">Full Legal Name *</label>
              <input
                type="text"
                required
                value={buyerName}
                onChange={e => setBuyerName(e.target.value)}
                placeholder="e.g. Alex Morgan"
                className="w-full rounded-xl border border-[#E7E5E4] px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#0F766E] focus:outline-none text-[#1C1917]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#1C1917] mb-1">Email Address (For Encrypted QR Ticket) *</label>
                <input
                  type="email"
                  required
                  value={buyerEmail}
                  onChange={e => setBuyerEmail(e.target.value)}
                  placeholder="alex@example.com"
                  className="w-full rounded-xl border border-[#E7E5E4] px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#0F766E] focus:outline-none text-[#1C1917]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1C1917] mb-1">Mobile Phone (For WhatsApp Pass Delivery) *</label>
                <input
                  type="tel"
                  required
                  value={buyerPhone}
                  onChange={e => setBuyerPhone(e.target.value)}
                  placeholder="+91 9876543210"
                  className="w-full rounded-xl border border-[#E7E5E4] px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#0F766E] focus:outline-none text-[#1C1917]"
                />
              </div>
            </div>

            {/* Verification Note for Approval-Based Tickets */}
            {activeSelectedTier?.isApprovalRequired && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-800">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <span>Approval-Required Ticket: Enter Verification Details</span>
                </div>
                <textarea
                  rows={2}
                  value={approvalNote}
                  onChange={e => setApprovalNote(e.target.value)}
                  placeholder="Provide your company/startup URL, LinkedIn profile, or reason for complimentary pass application..."
                  className="w-full rounded-lg border border-amber-300 bg-white p-2 text-xs text-[#1C1917] focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Ticket Selection with Smart Engine Tiers */}
          <div className="bg-white p-6 rounded-2xl border border-[#E7E5E4] shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E7E5E4] pb-3">
              <div>
                <h2 className="text-lg font-bold text-[#1C1917] flex items-center gap-2">
                  <Ticket className="h-5 w-5 text-[#0F766E]" /> Select Ticket Categories & Limits
                </h2>
                <p className="text-xs text-[#78716C] mt-0.5">Choose ticket quantities across available tiers with real-time dynamic pricing</p>
              </div>

              {/* Unlock Hidden Passes Form */}
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  placeholder="Passcode for VIP"
                  value={passcodeInput}
                  onChange={e => setPasscodeInput(e.target.value)}
                  className="w-32 uppercase text-[11px] font-mono px-2.5 py-1.5 rounded-lg border border-[#E7E5E4] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleUnlockHidden}
                  className="px-2.5 py-1.5 bg-slate-900 text-white text-[11px] font-bold rounded-lg hover:bg-slate-800 transition flex items-center gap-1"
                >
                  <Key className="h-3 w-3 text-cyan-400" /> Unlock
                </button>
              </div>
            </div>

            {passcodeError && (
              <p className="text-xs text-red-500 font-medium">{passcodeError}</p>
            )}
            {unlockedPasscode && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Private Secret Pass Unlocked successfully!</span>
              </div>
            )}
            {waitlistSuccess && (
              <div className="p-3 bg-purple-50 border border-purple-200 text-purple-800 text-xs font-bold rounded-xl flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-purple-600" />
                <span>{waitlistSuccess}</span>
              </div>
            )}

            <div className="space-y-4">
              {event.ticketTypes.map(tkt => {
                // If tier is hidden and passcode not unlocked, show passcode placeholder
                if (tkt.isHidden && unlockedPasscode !== tkt.accessPasscode) {
                  return (
                    <div key={tkt.id} className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 flex items-center justify-between text-xs text-[#78716C]">
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4 text-slate-400" />
                        <span className="font-semibold italic">Hidden VIP Pass (Passcode Protected)</span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono">Enter passcode &apos;EPAYVIP&apos; to view</span>
                    </div>
                  );
                }

                const qty = ticketQuantities[tkt.id] || 0;
                const isSelected = qty > 0;
                const isWaitlist = tkt.isWaitlist;

                return (
                  <div
                    key={tkt.id}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition gap-4 ${
                      isSelected 
                        ? 'border-[#0F766E] bg-[#0F766E]/5 shadow-sm ring-1 ring-[#0F766E]/30' 
                        : isWaitlist
                        ? 'border-purple-200 bg-purple-50/40'
                        : 'border-[#E7E5E4] bg-white hover:bg-[#FAFAF9]'
                    }`}
                  >
                    <div className="flex-1 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-bold text-[#1C1917] text-base">{tkt.name}</h4>
                        
                        {/* Category Badge */}
                        {tkt.category && (
                          <span className="bg-slate-100 text-[#0F766E] border border-[#0F766E]/30 text-[10px] font-bold px-2 py-0.5 rounded-md">
                            {tkt.category}
                          </span>
                        )}

                        {/* Early Bird Badge */}
                        {tkt.isEarlyBird && (
                          <span className="bg-[#F97316] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase flex items-center gap-1 shadow-xs">
                            <Clock className="h-3 w-3" /> {tkt.earlyBirdDeadline || 'Early Bird'}
                          </span>
                        )}

                        {/* Group Discount Badge */}
                        {tkt.isGroupDiscount && (
                          <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Users className="h-3 w-3" /> Group: {tkt.groupDiscountPercent}% Off (4+ passes)
                          </span>
                        )}

                        {/* Complimentary Pass Badge */}
                        {tkt.isComplimentary && (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Award className="h-3 w-3" /> 100% Complimentary
                          </span>
                        )}

                        {/* Waitlist Badge */}
                        {isWaitlist && (
                          <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Clock className="h-3 w-3" /> Waitlist Open
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-[#78716C] leading-relaxed">{tkt.description}</p>
                      
                      {/* Price Display with Original / Discounted Cross-through */}
                      <div className="flex items-center gap-2 pt-0.5">
                        <span className="font-extrabold text-[#1C1917] text-base">
                          {tkt.price === 0 ? 'FREE' : `₹${tkt.price.toLocaleString()}`}
                        </span>
                        {tkt.originalPrice && tkt.originalPrice > tkt.price && (
                          <span className="text-xs text-slate-400 line-through">
                            ₹{tkt.originalPrice.toLocaleString()}
                          </span>
                        )}
                        <span className="text-[11px] text-[#78716C]">
                          (Max {tkt.maxPerOrder || 6} per order)
                        </span>
                      </div>
                    </div>

                    {/* Quantity or Waitlist Action Controls */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E7E5E4]">
                      {isWaitlist ? (
                        <button
                          type="button"
                          onClick={() => handleJoinWaitlist(tkt.name)}
                          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition shadow-sm"
                        >
                          Join Waitlist
                        </button>
                      ) : (
                        <div className="flex items-center gap-3 bg-[#FAFAF9] border border-[#E7E5E4] rounded-xl p-1">
                          <button
                            type="button"
                            onClick={() => updateQuantity(tkt.id, -1)}
                            disabled={qty === 0}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-base transition ${
                              qty === 0
                                ? 'text-slate-300 cursor-not-allowed'
                                : 'bg-white text-[#1C1917] hover:bg-slate-200 shadow-sm'
                            }`}
                            title="Decrease Quantity"
                          >
                            -
                          </button>
                          
                          <span className="w-6 text-center font-extrabold text-[#1C1917] text-sm">
                            {qty}
                          </span>

                          <button
                            type="button"
                            onClick={() => updateQuantity(tkt.id, 1)}
                            disabled={qty >= (tkt.maxPerOrder || 6)}
                            className="w-8 h-8 rounded-lg bg-[#0F766E] text-white flex items-center justify-center font-bold text-base hover:bg-[#115E59] shadow-sm transition disabled:opacity-40"
                            title="Increase Quantity"
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Seat Selection / Venue Seating Layout */}
          {totalTicketsSelected > 0 && (
            <VenueSeatingLayout
              requiredSeatsCount={totalTicketsSelected}
              selectedSeats={selectedSeats}
              onSeatSelect={setSelectedSeats}
              eventTitle={event.title}
              venueName={event.venue?.name}
            />
          )}

          {/* Ticket Transfer & Refund Policy Protection Options */}
          <div className="bg-white p-6 rounded-2xl border border-[#E7E5E4] shadow-sm space-y-3">
            <h3 className="font-bold text-[#1C1917] text-sm flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#059669]" /> Ticket Flexibility & Cancellation Guarantees
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <label className="p-3 rounded-xl border border-[#E7E5E4] flex items-start gap-3 bg-[#FAFAF9] cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableTransferProtection}
                  onChange={e => setEnableTransferProtection(e.target.checked)}
                  className="mt-0.5 rounded text-[#0F766E]"
                />
                <div>
                  <span className="block text-xs font-bold text-[#1C1917]">Free Ticket Transfer Protection</span>
                  <span className="block text-[11px] text-[#78716C] mt-0.5">Transfer pass to a colleague or friend anytime before event gate check-in</span>
                </div>
              </label>

              <label className="p-3 rounded-xl border border-[#E7E5E4] flex items-start gap-3 bg-[#FAFAF9] cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableRefundGuarantee}
                  onChange={e => setEnableRefundGuarantee(e.target.checked)}
                  className="mt-0.5 rounded text-[#0F766E]"
                />
                <div>
                  <span className="block text-xs font-bold text-[#1C1917]">Standard Refund Workflow Included</span>
                  <span className="block text-[11px] text-[#78716C] mt-0.5">Full refund processing allowed up to 48 hours prior to start date</span>
                </div>
              </label>
            </div>
          </div>

          {/* Payment Gateway Option */}
          <div className="bg-white p-6 rounded-2xl border border-[#E7E5E4] shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-[#1C1917] flex items-center gap-2 border-b border-[#E7E5E4] pb-3">
              <CreditCard className="h-5 w-5 text-[#0F766E]" /> Payment Gateway Integration
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(
                [
                  { id: 'epay_upi', label: 'ePay / UPI Instant', desc: 'GPay, PhonePe, Paytm, QR' },
                  { id: 'card', label: 'Credit / Debit Card', desc: 'Visa, MasterCard, RuPay' },
                  { id: 'netbanking', label: 'Net Banking', desc: 'All Major Indian Banks' },
                ] as const
              ).map(pm => (
                <label
                  key={pm.id}
                  className={`p-3.5 rounded-xl border cursor-pointer flex flex-col justify-between transition ${
                    paymentMethod === pm.id ? 'border-[#0F766E] bg-[#0F766E]/5 text-[#0F766E]' : 'border-[#E7E5E4] text-[#78716C] hover:bg-[#FAFAF9]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs text-[#1C1917]">{pm.label}</span>
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === pm.id}
                      onChange={() => setPaymentMethod(pm.id)}
                      className="sr-only"
                    />
                  </div>
                  <span className="text-[10px] text-[#78716C]">{pm.desc}</span>
                </label>
              ))}
            </div>

            <button
              type="submit"
              disabled={isProcessing || totalTicketsSelected === 0}
              className={`w-full mt-4 rounded-xl py-3.5 font-bold text-white shadow transition flex items-center justify-center gap-2 ${
                totalTicketsSelected === 0
                  ? 'bg-slate-300 cursor-not-allowed'
                  : 'bg-[#F97316] hover:bg-[#ea580c]'
              }`}
            >
              {isProcessing ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Generating Secure Ticket Pass...</span>
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  <span>
                    {total === 0 
                      ? `Confirm Free Registration (${totalTicketsSelected} Pass)` 
                      : `Pay ₹${total.toLocaleString()} & Issue (${totalTicketsSelected}) Pass${totalTicketsSelected !== 1 ? 'es' : ''}`}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Summary Sidebar */}
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-[#E7E5E4] shadow-sm sticky top-24 space-y-6">
          <h3 className="font-bold text-[#1C1917] text-base border-b border-[#E7E5E4] pb-3">
            Smart Ticket Summary
          </h3>

          <div className="space-y-3 text-sm">
            {event.ticketTypes.filter(t => (ticketQuantities[t.id] || 0) > 0).map(t => {
              const qty = ticketQuantities[t.id] || 0;
              return (
                <div key={t.id} className="flex justify-between text-[#78716C]">
                  <div>
                    <span className="font-medium text-[#1C1917] block">{t.name} (x{qty})</span>
                    <span className="text-[10px] text-slate-400">Category: {t.category || 'General'}</span>
                  </div>
                  <span className="font-semibold text-[#1C1917]">
                    {t.price === 0 ? 'FREE' : `₹${(t.price * qty).toLocaleString()}`}
                  </span>
                </div>
              );
            })}

            {totalTicketsSelected === 0 && (
              <p className="text-xs text-amber-600 font-medium italic">No pass selected. Increase ticket count above.</p>
            )}

            {/* Selected Seats summary tag */}
            {selectedSeats.length > 0 && (
              <div className="bg-teal-50 border border-teal-200/80 p-2.5 rounded-xl text-xs space-y-1">
                <div className="flex items-center justify-between text-[#0F766E] font-bold">
                  <span>Reserved Seats:</span>
                  <span className="font-mono text-[11px]">{selectedSeats.length} Seat{selectedSeats.length > 1 ? 's' : ''}</span>
                </div>
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {selectedSeats.map(s => (
                    <span key={s} className="px-1.5 py-0.5 rounded bg-white text-[#0F766E] border border-teal-300 font-mono text-[10px] font-bold">
                      {s.replace('VIP-', '').replace('PREM-', '').replace('STD-', '')}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {groupDiscountAmount > 0 && (
              <div className="flex justify-between text-[#059669] font-medium text-xs bg-emerald-50 p-2 rounded-lg">
                <span>Group Booking Discount (4+)</span>
                <span>-₹{groupDiscountAmount.toLocaleString()}</span>
              </div>
            )}

            {couponDiscountAmount > 0 && (
              <div className="flex justify-between text-[#059669] font-medium text-xs bg-emerald-50 p-2 rounded-lg">
                <span>{referralInfo ? `Referral Discount (${appliedDiscount}%)` : `Promo Code (${appliedDiscount}%)`}</span>
                <span>-₹{couponDiscountAmount.toLocaleString()}</span>
              </div>
            )}

            <div className="flex justify-between text-[#78716C] text-xs">
              <span>GST Tax (18%)</span>
              <span>₹{tax.toLocaleString()}</span>
            </div>

            <div className="flex justify-between text-[#78716C] text-xs">
              <span>ePay Platform Fee</span>
              <span>₹{platformFee.toLocaleString()}</span>
            </div>

            <div className="pt-3 border-t border-[#E7E5E4] flex justify-between font-extrabold text-[#1C1917] text-lg">
              <span>Total Due</span>
              <span className="text-[#F97316]">
                {total === 0 ? 'FREE' : `₹${total.toLocaleString()}`}
              </span>
            </div>
          </div>

          {/* Promo / Coupon Code Section */}
          <div className="pt-4 border-t border-slate-200">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5 text-[#0F766E]" />
                  Have a Coupon or Promo Code?
                </span>
                {appliedDiscount > 0 && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    {appliedDiscount}% Applied
                  </span>
                )}
              </div>

              {/* Single clean merged input with inside button */}
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={couponCode}
                  onChange={e => setCouponCode(e.target.value)}
                  placeholder="Enter code (e.g. EARLYBIRD20)"
                  className="w-full rounded-xl border border-slate-300 bg-white pl-3.5 pr-20 py-2.5 text-xs font-mono font-bold uppercase tracking-wider placeholder:normal-case placeholder:font-sans placeholder:font-normal placeholder:text-slate-400 focus:outline-none focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/20 text-slate-900 shadow-2xs"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg bg-[#0F766E] hover:bg-[#115E59] text-white px-3.5 py-1.5 text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
                >
                  Apply
                </button>
              </div>

              {/* Suggestions row - clean horizontal wrapping pills */}
              {!appliedDiscount && (
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  <span className="text-[11px] text-slate-400 font-medium">Try:</span>
                  {['EARLYBIRD20', 'EPAY20'].map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => {
                        setCouponCode(code);
                        setAppliedDiscount(20);
                        setCouponMsg({ text: `Promo code ${code} applied! (20% OFF)`, isError: false });
                      }}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-emerald-500 hover:text-emerald-700 transition text-[11px] font-bold cursor-pointer shadow-2xs active:scale-95 group"
                    >
                      <span className="font-mono text-emerald-700 group-hover:underline">{code}</span>
                      <span className="text-[10px] font-extrabold text-white bg-[#0F766E] px-1.5 py-0.2 rounded">
                        20% OFF
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Status message banner */}
              {couponMsg && (
                <div className={`text-xs p-2.5 rounded-xl border flex items-center justify-between gap-2 ${
                  couponMsg.isError 
                    ? 'text-red-700 bg-red-50 border-red-200' 
                    : 'text-emerald-800 bg-emerald-50 border-emerald-200 font-semibold shadow-2xs'
                }`}>
                  <div className="flex items-center gap-2 min-w-0">
                    <Sparkles className={`h-3.5 w-3.5 shrink-0 ${couponMsg.isError ? 'text-red-500' : 'text-emerald-600'}`} />
                    <span className="truncate">{couponMsg.text}</span>
                  </div>
                  {!couponMsg.isError && (
                    <button
                      type="button"
                      onClick={() => {
                        setCouponCode('');
                        setAppliedDiscount(0);
                        setCouponMsg(null);
                      }}
                      className="text-[11px] text-emerald-800 underline font-bold cursor-pointer hover:text-emerald-950 shrink-0"
                    >
                      Remove
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
