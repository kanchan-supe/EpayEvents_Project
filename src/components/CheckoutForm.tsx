'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Ticket, ShieldCheck, Tag, CreditCard, CheckCircle2, User, Mail, Phone, Lock, Sparkles } from 'lucide-react';
import { EventItem, TicketType } from '@/lib/types';

export function CheckoutForm({ event, initialTicketId }: { event: EventItem; initialTicketId?: string }) {
  const router = useRouter();
  const [selectedTicketId, setSelectedTicketId] = useState<string>(
    initialTicketId || (event.ticketTypes[0]?.id ?? '')
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [couponCode, setCouponCode] = useState<string>('');
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [couponMsg, setCouponMsg] = useState<{ text: string; isError: boolean } | null>(null);

  // Form Fields
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'epay_upi' | 'card' | 'netbanking'>('epay_upi');
  const [isProcessing, setIsProcessing] = useState(false);

  const selectedTicket = event.ticketTypes.find(t => t.id === selectedTicketId) || event.ticketTypes[0];

  const subtotal = (selectedTicket?.price || 0) * quantity;
  const discountAmount = (subtotal * appliedDiscount) / 100;
  const tax = Math.round((subtotal - discountAmount) * 0.18); // 18% GST
  const platformFee = selectedTicket?.price === 0 ? 0 : 50; // Flat ₹50 platform fee
  const total = Math.max(0, subtotal - discountAmount + tax + platformFee);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCode.trim().toUpperCase() === 'EPAY20') {
      setAppliedDiscount(20);
      setCouponMsg({ text: 'Promo code EPAY20 applied! (20% OFF)', isError: false });
    } else if (couponCode.trim().toUpperCase() === 'FREEPASS') {
      setAppliedDiscount(100);
      setCouponMsg({ text: 'VIP Promo applied! 100% OFF', isError: false });
    } else {
      setCouponMsg({ text: 'Invalid promo code. Try "EPAY20"', isError: true });
    }
  };

  const handleCompletePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      // Simulate Order Creation & Ticket Generation
      const orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
      const queryParams = new URLSearchParams({
        orderId,
        buyerName,
        buyerEmail,
        ticketName: selectedTicket?.name || 'General Pass',
        qty: quantity.toString(),
        total: total.toString(),
        eventTitle: event.title,
        venue: event.venue.name,
        date: event.startDate,
      });

      router.push(`/order-success?${queryParams.toString()}`);
    }, 1500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Checkout Form */}
      <div className="lg:col-span-2 space-y-6">
        <form onSubmit={handleCompletePayment} className="space-y-6">
          {/* Attendee Details */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <User className="h-5 w-5 text-blue-600" /> Attendee Details
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={buyerName}
                onChange={e => setBuyerName(e.target.value)}
                placeholder="e.g. Alex Morgan"
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address (For Ticket PDF) *</label>
                <input
                  type="email"
                  required
                  value={buyerEmail}
                  onChange={e => setBuyerEmail(e.target.value)}
                  placeholder="alex@example.com"
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Phone (For SMS Ticket ID) *</label>
                <input
                  type="tel"
                  required
                  value={buyerPhone}
                  onChange={e => setBuyerPhone(e.target.value)}
                  placeholder="+91 9876543210"
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Ticket Selection */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Ticket className="h-5 w-5 text-blue-600" /> Select Pass Tier
            </h2>

            <div className="space-y-3">
              {event.ticketTypes.map(tkt => (
                <label
                  key={tkt.id}
                  className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition ${
                    selectedTicketId === tkt.id ? 'border-blue-600 bg-blue-50/50' : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="ticketTier"
                      checked={selectedTicketId === tkt.id}
                      onChange={() => setSelectedTicketId(tkt.id)}
                      className="h-4 w-4 text-blue-600"
                    />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{tkt.name}</h4>
                      <p className="text-xs text-slate-500">{tkt.description}</p>
                    </div>
                  </div>

                  <span className="font-bold text-slate-900 text-sm">
                    {tkt.price === 0 ? 'FREE' : `₹${tkt.price.toLocaleString()}`}
                  </span>
                </label>
              ))}
            </div>

            <div className="pt-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700">Quantity</span>
              <select
                value={quantity}
                onChange={e => setQuantity(Number(e.target.value))}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold focus:outline-none"
              >
                {[1, 2, 3, 4, 5].map(q => (
                  <option key={q} value={q}>{q} {q === 1 ? 'Ticket' : 'Tickets'}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Payment Gateway Option */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <CreditCard className="h-5 w-5 text-blue-600" /> Payment Gateway Integration
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'epay_upi', label: 'ePay / UPI Instant', desc: 'GPay, PhonePe, Paytm' },
                { id: 'card', label: 'Credit / Debit Card', desc: 'Visa, MasterCard, RuPay' },
                { id: 'netbanking', label: 'Net Banking', desc: 'All Major Banks' },
              ].map(pm => (
                <label
                  key={pm.id}
                  className={`p-3.5 rounded-xl border cursor-pointer flex flex-col justify-between transition ${
                    paymentMethod === pm.id ? 'border-blue-600 bg-blue-50/50 text-blue-900' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs">{pm.label}</span>
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === pm.id}
                      onChange={() => setPaymentMethod(pm.id as any)}
                      className="sr-only"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500">{pm.desc}</span>
                </label>
              ))}
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full mt-4 rounded-xl bg-blue-600 py-3.5 font-bold text-white shadow hover:bg-blue-700 transition flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing Secure Checkout...</span>
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  <span>Pay ₹{total.toLocaleString()} & Generate Tickets</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Summary Sidebar */}
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm sticky top-24 space-y-6">
          <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3">
            Order Summary
          </h3>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>{selectedTicket?.name} (x{quantity})</span>
              <span className="font-semibold text-slate-900">₹{subtotal.toLocaleString()}</span>
            </div>

            {appliedDiscount > 0 && (
              <div className="flex justify-between text-emerald-600 font-medium text-xs">
                <span>Discount ({appliedDiscount}%)</span>
                <span>-₹{discountAmount.toLocaleString()}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-600 text-xs">
              <span>GST Tax (18%)</span>
              <span>₹{tax.toLocaleString()}</span>
            </div>

            <div className="flex justify-between text-slate-600 text-xs">
              <span>ePay Platform Fee</span>
              <span>₹{platformFee.toLocaleString()}</span>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-between font-extrabold text-slate-900 text-lg">
              <span>Total Due</span>
              <span className="text-blue-600">₹{total.toLocaleString()}</span>
            </div>
          </div>

          {/* Coupon Code Section */}
          <div className="pt-4 border-t border-slate-100">
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <Tag className="h-3.5 w-3.5 text-blue-600" /> Apply Coupon / Promo Code
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={e => setCouponCode(e.target.value)}
                placeholder="EPAY20"
                className="flex-1 uppercase rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold focus:outline-none"
              />
              <button
                type="button"
                onClick={handleApplyCoupon}
                className="rounded-lg bg-slate-900 text-white px-3 py-1.5 text-xs font-semibold hover:bg-slate-800"
              >
                Apply
              </button>
            </div>
            {couponMsg && (
              <p className={`text-[11px] mt-1.5 ${couponMsg.isError ? 'text-red-500' : 'text-emerald-600 font-medium'}`}>
                {couponMsg.text}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
