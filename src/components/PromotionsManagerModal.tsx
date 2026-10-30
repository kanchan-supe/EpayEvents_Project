'use client';

import React, { useState, useEffect } from 'react';
import { 
  Link2, Plus, Check, Copy, TrendingUp, DollarSign, 
  ExternalLink, Sparkles, Percent, MousePointerClick, ShoppingBag, Gift, Award
} from 'lucide-react';
import { ReferralLink } from '@/lib/repositories/promotionsRepository';

interface PromotionsManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizerEmail?: string;
  events?: { id: string; title: string; slug: string }[];
}

export function PromotionsManagerModal({
  isOpen,
  onClose,
  organizerEmail,
  events = [],
}: PromotionsManagerModalProps) {
  const [referrals, setReferrals] = useState<ReferralLink[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New Referral link form state
  const [showNewRefModal, setShowNewRefModal] = useState(false);
  const [refCode, setRefCode] = useState('');
  const [affiliateName, setAffiliateName] = useState('');
  const [affiliateEmail, setAffiliateEmail] = useState('');
  const [refType, setRefType] = useState<'speaker' | 'sponsor' | 'campus_ambassador' | 'influencer'>('campus_ambassador');
  const [refEventId, setRefEventId] = useState<string>(events[0]?.id || 'evt_9f3k2');
  const [commissionPercent, setCommissionPercent] = useState<number>(10);
  const [refDiscountPercent, setRefDiscountPercent] = useState<number>(10);

  // Edit discount inline modal/state
  const [editingRefId, setEditingRefId] = useState<string | null>(null);
  const [editingDiscountVal, setEditingDiscountVal] = useState<number>(10);

  const fetchReferrals = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/promotions?type=referrals');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setReferrals(json.data);
      }
    } catch (e) {
      console.warn('Error fetching referrals:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchReferrals();
    }
  }, [isOpen]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleCreateReferral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refCode.trim() || !affiliateName.trim()) return;

    const matchedEvent = events.find(ev => ev.id === refEventId);
    try {
      const res = await fetch('/api/promotions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_referral',
          code: refCode.trim().toUpperCase(),
          affiliateName: affiliateName.trim(),
          affiliateEmail: affiliateEmail.trim(),
          type: refType,
          eventId: refEventId,
          eventTitle: matchedEvent?.title || 'Summit Event',
          commissionPercent: Number(commissionPercent),
          discountPercent: Number(refDiscountPercent),
          organizerEmail,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setShowNewRefModal(false);
        setRefCode('');
        setAffiliateName('');
        setAffiliateEmail('');
        fetchReferrals();
      }
    } catch (e) {
      console.warn('Failed to create referral link:', e);
    }
  };

  const handleUpdateDiscount = async (refId: string, newDiscount: number) => {
    try {
      const res = await fetch('/api/promotions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_referral_discount',
          id: refId,
          discountPercent: newDiscount,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setEditingRefId(null);
        fetchReferrals();
      }
    } catch (e) {
      console.warn('Failed to update referral discount:', e);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-5xl w-full overflow-hidden text-slate-900 my-8">
        
        {/* Top Header */}
        <div className="bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#F97316]/90 p-6 text-white flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-white/10 text-orange-300 text-[11px] font-bold border border-white/10 uppercase tracking-wider mb-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" /> Affiliate & Referral Tracking
            </div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <Link2 className="h-6 w-6 text-[#F97316]" /> Referral Links & Affiliates
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Generate custom referral tracking links for partners, speakers, and campus ambassadors with attendee discounts and automated commission metrics.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm">Affiliate & Partner Referral Links ({referrals.length})</h4>
                <p className="text-xs text-slate-500">
                  Share custom links with speakers, sponsors, and campus ambassadors to track ticket sales & payout commissions.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowNewRefModal(true)}
                className="rounded-xl bg-[#F97316] hover:bg-[#ea580c] text-white px-4 py-2.5 text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Create Referral Partner Link</span>
              </button>
            </div>

            {/* Referral Cards */}
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading referral links...</div>
            ) : referrals.length === 0 ? (
              <div className="p-12 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
                <Link2 className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-600">No referral links created yet</p>
                <p className="text-[11px] text-slate-400 mt-1">Click &quot;Create Referral Partner Link&quot; above to get started.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {referrals.map((r) => {
                  const matchedEv = events.find(e => e.id === r.eventId);
                  const eventPath = matchedEv?.slug ? `/events/${matchedEv.slug}` : `/events`;
                  const shareableUrl = typeof window !== 'undefined'
                    ? `${window.location.origin}${eventPath}?ref=${r.code}`
                    : `https://epayevents.com${eventPath}?ref=${r.code}`;

                  const isEditing = editingRefId === r.id;

                  return (
                    <div
                      key={r.id}
                      className="rounded-2xl border border-slate-200/90 bg-white shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden"
                    >
                      {/* Top Header Row */}
                      <div className="p-4 sm:p-5 bg-gradient-to-b from-slate-50/70 to-white border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            {/* Referral Code Badge */}
                            <span className="font-mono text-xs font-black text-orange-600 bg-orange-50 border border-orange-200/80 px-2.5 py-1 rounded-lg tracking-wide shadow-2xs">
                              {r.code}
                            </span>

                            {/* Affiliate Name */}
                            <span className="text-sm font-extrabold text-slate-900 tracking-tight">
                              {r.affiliateName}
                            </span>

                            {/* Partner Category Badge */}
                            <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-md capitalize">
                              {r.type.replace('_', ' ')}
                            </span>

                            {/* Attendee Discount Pill */}
                            <span className="inline-flex items-center gap-1 text-[11px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2.5 py-0.5 rounded-full shadow-2xs">
                              <Gift className="h-3 w-3 text-emerald-600" />
                              {r.discountPercent || 0}% Attendee Discount
                            </span>
                          </div>

                          {/* Event & Commission Info */}
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                            <span>
                              Event: <strong className="text-slate-800 font-semibold">{r.eventTitle}</strong>
                            </span>
                            <span className="text-slate-300">•</span>
                            <span>
                              Partner Commission: <strong className="text-orange-600 font-bold">{r.commissionPercent}%</strong>
                            </span>
                            {r.affiliateEmail && (
                              <>
                                <span className="text-slate-300">•</span>
                                <span className="text-slate-400 font-mono text-[11px]">{r.affiliateEmail}</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Top Action Buttons */}
                        <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              if (isEditing) {
                                setEditingRefId(null);
                              } else {
                                setEditingRefId(r.id);
                                setEditingDiscountVal(r.discountPercent || 0);
                              }
                            }}
                            className={`rounded-xl px-3 py-2 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                              isEditing
                                ? 'bg-orange-100 text-orange-800 border border-orange-300'
                                : 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <Percent className="h-3.5 w-3.5 text-orange-600" />
                            <span>{isEditing ? 'Close Edit' : 'Edit Discount %'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleCopy(r.id, shareableUrl)}
                            className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 px-3.5 py-2 text-xs font-bold text-slate-800 transition flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-98"
                          >
                            {copiedId === r.id ? (
                              <>
                                <Check className="h-3.5 w-3.5 text-emerald-600" />
                                <span className="text-emerald-600 font-black">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3.5 w-3.5 text-slate-500" />
                                <span>Copy Referral Link</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Inline Discount % Editor */}
                      {isEditing && (
                        <div className="p-3.5 mx-4 mt-3 rounded-xl bg-orange-50/70 border border-orange-200/90 flex flex-wrap items-center justify-between gap-3 text-xs animate-in fade-in duration-150">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800">Set Attendee Discount %:</span>
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={editingDiscountVal}
                                onChange={e => setEditingDiscountVal(Number(e.target.value))}
                                className="w-16 px-2.5 py-1 bg-white border border-orange-300 rounded-lg text-xs font-black text-center text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                              />
                              <span className="text-orange-700 font-extrabold">%</span>
                            </div>
                            <span className="text-[11px] text-slate-500 hidden sm:inline">
                              (Applied automatically to ticket price when users book via this link)
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleUpdateDiscount(r.id, editingDiscountVal)}
                              className="px-3 py-1.5 bg-[#F97316] text-white rounded-lg font-bold text-xs hover:bg-[#ea580c] transition cursor-pointer shadow-2xs"
                            >
                              Save Discount %
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingRefId(null)}
                              className="px-2.5 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg font-bold text-xs hover:bg-slate-100 transition cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Performance Metric Badges Grid */}
                      <div className="p-4 sm:p-5">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
                          {/* 1. Total Clicks */}
                          <div className="bg-slate-50/80 hover:bg-slate-100/70 p-3 rounded-xl border border-slate-200/70 flex flex-col justify-between transition">
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Total Clicks</span>
                              <MousePointerClick className="h-3.5 w-3.5 text-slate-400" />
                            </div>
                            <div className="text-lg font-black text-slate-800 tracking-tight">
                              {r.clickCount.toLocaleString()}
                            </div>
                            <span className="text-[10px] text-slate-400 mt-0.5">Link visits</span>
                          </div>

                          {/* 2. Ticket Sales */}
                          <div className="bg-teal-50/40 hover:bg-teal-50/70 p-3 rounded-xl border border-teal-200/60 flex flex-col justify-between transition">
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className="text-[10px] uppercase font-bold tracking-wider text-teal-700/80">Ticket Sales</span>
                              <ShoppingBag className="h-3.5 w-3.5 text-[#0F766E]" />
                            </div>
                            <div className="text-lg font-black text-[#0F766E] tracking-tight">
                              {r.conversionsCount} <span className="text-xs font-bold font-sans">passes</span>
                            </div>
                            <span className="text-[10px] text-teal-600/80 mt-0.5">Successful orders</span>
                          </div>

                          {/* 3. Revenue Generated */}
                          <div className="bg-slate-50/80 hover:bg-slate-100/70 p-3 rounded-xl border border-slate-200/70 flex flex-col justify-between transition">
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Revenue</span>
                              <TrendingUp className="h-3.5 w-3.5 text-slate-500" />
                            </div>
                            <div className="text-lg font-black text-slate-800 tracking-tight">
                              ₹{((r as any).totalRevenueGenerated ?? (r as any).revenueGenerated ?? 0).toLocaleString()}
                            </div>
                            <span className="text-[10px] text-slate-400 mt-0.5">Gross ticket value</span>
                          </div>

                          {/* 4. Partner Commission */}
                          <div className="bg-amber-50/40 hover:bg-amber-50/70 p-3 rounded-xl border border-amber-200/70 flex flex-col justify-between transition">
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-700/80">Partner Payout</span>
                              <Award className="h-3.5 w-3.5 text-amber-600" />
                            </div>
                            <div className="text-lg font-black text-amber-700 tracking-tight">
                              ₹{((r as any).totalCommissionEarned ?? (r as any).commissionEarned ?? 0).toLocaleString()}
                            </div>
                            <span className="text-[10px] text-amber-600/80 mt-0.5">({r.commissionPercent}% commission)</span>
                          </div>

                          {/* 5. Attendee Discount % */}
                          <div className="bg-emerald-50/40 hover:bg-emerald-50/70 p-3 rounded-xl border border-emerald-200/70 flex flex-col justify-between transition">
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700/80">Attendee Off</span>
                              <Gift className="h-3.5 w-3.5 text-emerald-600" />
                            </div>
                            <div className="text-lg font-black text-emerald-700 tracking-tight">
                              {r.discountPercent || 0}%
                            </div>
                            <span className="text-[10px] text-emerald-600/80 mt-0.5">Per-ticket discount</span>
                          </div>

                          {/* 6. Discount Given */}
                          <div className="bg-slate-50/80 hover:bg-slate-100/70 p-3 rounded-xl border border-slate-200/70 flex flex-col justify-between transition">
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Total Savings</span>
                              <DollarSign className="h-3.5 w-3.5 text-slate-400" />
                            </div>
                            <div className="text-lg font-black text-slate-800 tracking-tight">
                              ₹{((r as any).totalDiscountGiven ?? (r as any).discountGiven ?? 0).toLocaleString()}
                            </div>
                            <span className="text-[10px] text-slate-400 mt-0.5">Attendee savings</span>
                          </div>
                        </div>

                        {/* Referral Link URL Preview Box */}
                        <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                          <div className="flex items-center gap-1.5 text-slate-400 truncate font-mono text-[11px]">
                            <ExternalLink className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                            <span className="truncate">{shareableUrl}</span>
                          </div>
                          <span className="text-[11px] font-medium text-slate-400 shrink-0">
                            Auto-applies {r.discountPercent || 0}% discount at checkout
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
          <span>ePayEvents Referral Engine • Commission & Attendee Discounts</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>

      {/* SUB-MODAL: CREATE REFERRAL LINK */}
      {showNewRefModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <form
            onSubmit={handleCreateReferral}
            className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 text-slate-900 space-y-4"
          >
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h4 className="font-extrabold text-base text-slate-900">Create Affiliate / Referral Link</h4>
              <button
                type="button"
                onClick={() => setShowNewRefModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Partner / Affiliate Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Dr. Rajesh Verma or IIT Campus Club"
                value={affiliateName}
                onChange={e => setAffiliateName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#F97316]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Referral Tag / Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CAMPUS-PUNE"
                  value={refCode}
                  onChange={e => setRefCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 text-xs font-mono font-bold uppercase rounded-xl border border-slate-300 focus:outline-none focus:border-[#F97316]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Partner Category</label>
                <select
                  value={refType}
                  onChange={e => setRefType(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#F97316]"
                >
                  <option value="campus_ambassador">Campus Ambassador</option>
                  <option value="speaker">Keynote Speaker</option>
                  <option value="sponsor">Sponsor / Partner</option>
                  <option value="influencer">Influencer / Media</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Partner Commission (%)</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  required
                  value={commissionPercent}
                  onChange={e => setCommissionPercent(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-300 focus:outline-none focus:border-[#F97316]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Attendee Discount (%)</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  required
                  value={refDiscountPercent}
                  onChange={e => setRefDiscountPercent(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-300 focus:outline-none focus:border-[#F97316]"
                />
                <p className="text-[10px] text-slate-500 mt-0.5">Applied to ticket price on link booking</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Select Event</label>
              <select
                value={refEventId}
                onChange={e => setRefEventId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#F97316]"
              >
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Partner Email (Optional)</label>
              <input
                type="email"
                placeholder="ambassador@campus.edu"
                value={affiliateEmail}
                onChange={e => setAffiliateEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#F97316]"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowNewRefModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-[#F97316] hover:bg-[#ea580c] text-xs font-bold text-white transition shadow-sm"
              >
                Generate Referral Link
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
