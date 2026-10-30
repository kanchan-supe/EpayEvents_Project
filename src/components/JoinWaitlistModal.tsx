'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, X, CheckCircle2, AlertCircle, Clock, ShieldCheck, 
  Users, Mail, Phone, User, Ticket, Sparkles, Send, ArrowRight
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export interface JoinWaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  eventTitle: string;
  ticketTierId: string;
  ticketTierName: string;
  tierPrice?: number;
  onSuccess?: (entry: any) => void;
}

export function JoinWaitlistModal({
  isOpen,
  onClose,
  eventId,
  eventTitle,
  ticketTierId,
  ticketTierName,
  tierPrice,
  onSuccess,
}: JoinWaitlistModalProps) {
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successEntry, setSuccessEntry] = useState<{
    position: number;
    userName: string;
    userEmail: string;
  } | null>(null);

  // Pre-fill user data if logged in
  useEffect(() => {
    if (user) {
      setName(user.user_metadata?.full_name || user.email?.split('@')[0] || '');
      setEmail(user.email || '');
      setPhone(user.user_metadata?.phone || '');
    }
  }, [user]);

  // Reset state when modal reopens
  useEffect(() => {
    if (isOpen) {
      setSuccessEntry(null);
      setErrorMsg(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg('Please enter your full name');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'join',
          eventId,
          eventTitle,
          ticketTierId,
          ticketTierName,
          userName: name.trim(),
          userEmail: email.trim().toLowerCase(),
          userPhone: phone.trim(),
          quantityRequested: quantity,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to join waitlist. Please try again.');
      }

      setSuccessEntry({
        position: json.position || 1,
        userName: name.trim(),
        userEmail: email.trim(),
      });

      if (onSuccess) {
        onSuccess(json.data);
      }
    } catch (err: any) {
      console.error('Waitlist submit error:', err);
      setErrorMsg(err.message || 'Something went wrong while joining the waitlist.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          transition={{ duration: 0.25 }}
          className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden text-slate-900 relative"
        >
          {/* Top Banner Gradient */}
          <div className="bg-gradient-to-r from-[#0F172A] via-[#0F766E] to-[#0F172A] p-5 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-300/30">
                <Bell className="h-5 w-5 animate-bounce" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded-full inline-block">
                  Tier Sold Out
                </span>
                <h3 className="font-extrabold text-base tracking-tight mt-0.5">
                  Priority Ticket Waitlist
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
              aria-label="Close dialog"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-6">
            {!successEntry ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Event & Tier Context Box */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#0F766E] uppercase tracking-wider">
                      {ticketTierName}
                    </span>
                    <span className="text-xs font-black text-slate-900">
                      {tierPrice !== undefined ? (tierPrice === 0 ? 'FREE' : `₹${tierPrice.toLocaleString()}`) : 'Sold Out'}
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-slate-900 line-clamp-1">
                    {eventTitle}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    All current passes for this tier have been booked. Join the queue now to lock your spot.
                  </p>
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Form Inputs */}
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Rahul Sharma"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white font-medium focus:outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Email Address (For Instant Release Notice) *
                    </label>
                    <div className="relative">
                      <Mail className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. rahul@example.com"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white font-medium focus:outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Phone / WhatsApp (Optional)
                      </label>
                      <div className="relative">
                        <Phone className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white font-medium focus:outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Passes Needed
                      </label>
                      <select
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-800 focus:outline-none focus:border-[#0F766E]"
                      >
                        <option value={1}>1 Ticket</option>
                        <option value={2}>2 Tickets</option>
                        <option value={3}>3 Tickets</option>
                        <option value={4}>4 Tickets</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Trust Guarantee Highlights */}
                <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-2xl space-y-1.5 text-[11px] text-amber-900">
                  <div className="flex items-center gap-1.5 font-bold text-amber-800">
                    <Clock className="h-3.5 w-3.5 text-amber-600" />
                    <span>How Automated Waitlist Dispatch Works</span>
                  </div>
                  <p className="leading-relaxed">
                    When another attendee cancels their pass or requests a refund, our system automatically dispatches a prioritized reservation link to the next person in line with a <strong>2-hour exclusive window</strong> to complete booking.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#0F766E] to-teal-600 hover:from-[#115E59] hover:to-teal-700 text-xs font-black text-white transition shadow-md flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <span>Joining Queue...</span>
                    ) : (
                      <>
                        <Bell className="h-4 w-4" />
                        <span>Join Priority Waitlist</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              /* Success State */
              <div className="text-center py-4 space-y-5">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-200 shadow-sm">
                  <CheckCircle2 className="h-8 w-8" />
                </div>

                <div className="space-y-1.5">
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#0F766E] bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                    Queue Position Confirmed
                  </span>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight pt-1">
                    You are #{successEntry.position} in line!
                  </h3>
                  <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                    Thank you <strong>{successEntry.userName}</strong>. As soon as another attendee cancels or requests a refund for <em>{ticketTierName}</em>, we will automatically notify you at <strong>{successEntry.userEmail}</strong>.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left text-xs space-y-2 max-w-md mx-auto">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-semibold uppercase">Event</span>
                    <span className="font-bold text-slate-800">{eventTitle}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-semibold uppercase">Pass Tier</span>
                    <span className="font-bold text-[#0F766E]">{ticketTierName}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-semibold uppercase">Hold Window</span>
                    <span className="font-bold text-amber-700">2 Hours from Release</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full py-3 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold transition shadow-md"
                  >
                    Got It, Thank You!
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

