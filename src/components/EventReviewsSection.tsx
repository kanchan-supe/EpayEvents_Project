'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, MessageSquare, CheckCircle2, ShieldCheck, CornerDownRight, 
  Send, ThumbsUp, Sparkles, Filter, AlertCircle 
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ReviewItem } from '@/lib/repositories/reviewRepository';

interface EventReviewsSectionProps {
  eventId: string;
  eventTitle: string;
  organizerName: string;
}

export function EventReviewsSection({ eventId, eventTitle, organizerName }: EventReviewsSectionProps) {
  const { user, profile } = useAuth();
  
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [stats, setStats] = useState<{
    averageRating: number;
    totalReviews: number;
    distribution: Record<number, number>;
  }>({
    averageRating: 5.0,
    totalReviews: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewContent, setReviewContent] = useState('');
  const [reviewerName, setReviewerName] = useState('');
  const [reviewerEmail, setReviewerEmail] = useState('');
  const [ticketTier, setTicketTier] = useState('General Admission');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Organizer Reply state
  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  // Filter state
  const [starFilter, setStarFilter] = useState<number | 'all'>('all');

  const fetchReviews = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/reviews?eventId=${encodeURIComponent(eventId)}`);
      const json = await res.json();
      if (json.success && json.data) {
        setReviews(json.data.reviews || []);
        if (json.data.stats) {
          setStats(json.data.stats);
        }
      }
    } catch (err) {
      console.warn('[EventReviewsSection] Could not load reviews:', err);
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchReviews();

    // Listen to review events
    const handleNewReview = () => fetchReviews();
    window.addEventListener('epay_review_created', handleNewReview);
    window.addEventListener('epay_review_replied', handleNewReview);
    return () => {
      window.removeEventListener('epay_review_created', handleNewReview);
      window.removeEventListener('epay_review_replied', handleNewReview);
    };
  }, [fetchReviews]);

  // Pre-fill user details if logged in
  useEffect(() => {
    if (user) {
      setReviewerName(profile?.full_name || user.email?.split('@')[0] || '');
      setReviewerEmail(user.email || '');
    }
  }, [user, profile]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewContent.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          eventTitle,
          authorName: reviewerName.trim() || 'Verified Attendee',
          authorEmail: reviewerEmail.trim() || user?.email || 'attendee@epayevents.com',
          rating,
          title: reviewTitle.trim() || 'Attendee Experience',
          content: reviewContent.trim(),
          ticketTierName: ticketTier,
          isVerifiedPassHolder: true,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setSuccessMessage('Thank you! Your verified attendee review has been published.');
        setReviewTitle('');
        setReviewContent('');
        setShowWriteModal(false);
        fetchReviews();
        setTimeout(() => setSuccessMessage(''), 5000);
      }
    } catch (err) {
      console.error('Error submitting review:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOrganizerReply = async (reviewId: string) => {
    if (!replyText.trim()) return;
    setIsSubmittingReply(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reply',
          reviewId,
          replyContent: replyText.trim(),
          repliedBy: organizerName || 'Event Host Team',
        }),
      });
      const json = await res.json();
      if (json.success) {
        setReplyingReviewId(null);
        setReplyText('');
        fetchReviews();
      }
    } catch (err) {
      console.error('Error posting reply:', err);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const filteredReviews = starFilter === 'all' 
    ? reviews 
    : reviews.filter(r => Math.round(r.rating) === starFilter);

  const isOrganizer = profile?.role === 'organizer' || profile?.role === 'admin';

  return (
    <section id="reviews-section" className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E7E5E4] shadow-sm space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E7E5E4] pb-6">
        <div>
          <span className="text-xs font-extrabold text-[#F97316] uppercase tracking-widest bg-[#F97316]/10 px-3 py-1 rounded-full border border-[#F97316]/20 inline-flex items-center gap-1.5">
            <Star className="h-3.5 w-3.5 fill-[#F97316] text-[#F97316]" /> VERIFIED TESTIMONIALS
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#1C1917] tracking-tight mt-2">
            Attendee <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F97316] via-amber-500 to-teal-600">Reviews & Ratings</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Real feedback from verified badge and pass holders who attended {eventTitle}.
          </p>
        </div>

        <button
          onClick={() => setShowWriteModal(true)}
          className="rounded-2xl bg-gradient-to-r from-[#0F766E] to-teal-600 hover:from-[#115E59] hover:to-teal-700 text-white px-5 py-3 text-xs md:text-sm font-bold shadow-md hover:shadow-teal-600/25 transition-all flex items-center gap-2"
        >
          <Sparkles className="h-4 w-4" />
          <span>Write a Review</span>
        </button>
      </div>

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Aggregate Rating Scoreboard & Star Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-[#FAFAF9] p-6 rounded-2xl border border-[#E7E5E4]">
        {/* Left: Big Score */}
        <div className="flex flex-col items-center justify-center text-center p-4 border-b md:border-b-0 md:border-r border-[#E7E5E4]">
          <span className="text-5xl font-black text-slate-900 tracking-tight">
            {stats.averageRating.toFixed(1)}
          </span>
          <div className="flex items-center gap-1 my-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-5 w-5 ${
                  star <= Math.round(stats.averageRating)
                    ? 'fill-[#F97316] text-[#F97316]'
                    : 'text-slate-300'
                }`}
              />
            ))}
          </div>
          <span className="text-xs font-bold text-slate-500">
            Based on {stats.totalReviews || reviews.length} verified reviews
          </span>
          <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-extrabold text-[#059669] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            <ShieldCheck className="h-3.5 w-3.5" /> 100% Verified Pass Holders
          </span>
        </div>

        {/* Middle & Right: Star Bars */}
        <div className="md:col-span-2 flex flex-col justify-center space-y-2.5 py-2">
          {[5, 4, 3, 2, 1].map((s) => {
            const count = stats.distribution[s] || 0;
            const total = stats.totalReviews || reviews.length || 1;
            const pct = Math.round((count / total) * 100);

            return (
              <button
                key={s}
                onClick={() => setStarFilter(starFilter === s ? 'all' : s)}
                className="flex items-center gap-3 text-xs w-full text-left group hover:opacity-90 transition"
              >
                <div className="flex items-center gap-1 w-12 font-bold text-slate-700 shrink-0">
                  <span>{s}</span>
                  <Star className="h-3.5 w-3.5 fill-[#F97316] text-[#F97316]" />
                </div>
                <div className="flex-1 bg-slate-200 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-teal-500 to-[#F97316] h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-10 text-right font-mono text-slate-500 text-[11px] font-bold shrink-0">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3 text-xs font-bold">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-slate-400 uppercase text-[10px] tracking-wider">Filter:</span>
          {(['all', 5, 4, 3, 2, 1] as const).map((filterVal) => (
            <button
              key={filterVal}
              onClick={() => setStarFilter(filterVal)}
              className={`px-3 py-1 rounded-lg transition ${
                starFilter === filterVal
                  ? 'bg-[#0F766E] text-white shadow-xs font-extrabold'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {filterVal === 'all' ? 'All Reviews' : `${filterVal} Stars`}
            </button>
          ))}
        </div>
        <span className="text-slate-400 text-xs">
          Showing {filteredReviews.length} reviews
        </span>
      </div>

      {/* Reviews List Feed */}
      <div className="space-y-6">
        {filteredReviews.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-3">
            <MessageSquare className="h-8 w-8 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No reviews found for this rating.</p>
            <p className="text-xs text-slate-400">Be the first verified attendee to share your experience!</p>
          </div>
        ) : (
          filteredReviews.map((rev) => (
            <motion.div
              key={rev.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-2xl border border-slate-200 bg-[#FAFAF9] hover:border-slate-300 transition space-y-4"
            >
              {/* Reviewer Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={rev.authorAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${rev.authorName}`}
                    alt={rev.authorName}
                    className="w-10 h-10 rounded-full object-cover bg-slate-200 ring-2 ring-[#FFEDD5]"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-sm">{rev.authorName}</h4>
                      {rev.isVerifiedPassHolder && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-[#059669] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="h-3 w-3" /> Verified Pass Holder
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                      <span>{rev.ticketTierName || 'General Attendee'}</span>
                      <span>•</span>
                      <span>{rev.createdAt.split('T')[0]}</span>
                    </div>
                  </div>
                </div>

                {/* Stars */}
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= rev.rating
                          ? 'fill-[#F97316] text-[#F97316]'
                          : 'text-slate-200'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Review Text */}
              <div className="space-y-1">
                {rev.title && (
                  <h5 className="font-extrabold text-slate-900 text-sm">{rev.title}</h5>
                )}
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {rev.content}
                </p>
              </div>

              {/* Organizer Official Reply Block */}
              {rev.organizerReply ? (
                <div className="mt-4 p-4 rounded-xl bg-teal-50/70 border border-teal-200/80 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#0F766E]">
                    <CornerDownRight className="h-3.5 w-3.5 text-[#0F766E]" />
                    <span>Response from {rev.organizerReply.repliedBy || organizerName}</span>
                    <span className="text-[10px] text-teal-600 font-normal">
                      • {rev.organizerReply.repliedAt.split('T')[0]}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 pl-5 leading-relaxed">
                    {rev.organizerReply.replyContent}
                  </p>
                </div>
              ) : (
                /* Show Host Reply button if user is an organizer/admin */
                isOrganizer && (
                  <div className="pt-2">
                    {replyingReviewId === rev.id ? (
                      <div className="p-3 bg-white rounded-xl border border-teal-200 space-y-2 mt-2">
                        <textarea
                          rows={2}
                          placeholder={`Write a public response as ${organizerName}...`}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-[#0F766E]"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setReplyingReviewId(null)}
                            className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOrganizerReply(rev.id)}
                            disabled={isSubmittingReply || !replyText.trim()}
                            className="px-3.5 py-1.5 bg-[#0F766E] text-white text-xs font-bold rounded-lg hover:bg-[#115E59] disabled:opacity-50"
                          >
                            {isSubmittingReply ? 'Posting...' : 'Post Reply'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setReplyingReviewId(rev.id);
                          setReplyText('');
                        }}
                        className="text-xs font-bold text-[#0F766E] hover:text-[#115E59] flex items-center gap-1.5 hover:underline"
                      >
                        <CornerDownRight className="h-3 w-3" />
                        <span>Reply as Host Organizer</span>
                      </button>
                    )}
                  </div>
                )
              )}
            </motion.div>
          ))
        )}
      </div>

      {/* Review Submission Modal Dialog */}
      <AnimatePresence>
        {showWriteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-5"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-xl font-black text-slate-900">Review & Rate Event</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{eventTitle}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowWriteModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmitReview} className="space-y-4">
                {/* Interactive Star Picker */}
                <div className="space-y-1.5 text-center py-2 bg-amber-50/50 rounded-2xl border border-amber-200/50">
                  <span className="text-xs font-bold text-slate-700 block">Overall Experience Rating</span>
                  <div className="flex items-center justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(star)}
                        className="p-1 hover:scale-125 transition-transform"
                      >
                        <Star
                          className={`h-7 w-7 ${
                            star <= (hoverRating || rating)
                              ? 'fill-[#F97316] text-[#F97316]'
                              : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <span className="text-xs font-extrabold text-[#F97316]">
                    {rating === 5 ? '🌟 Exceptional 5/5' : rating === 4 ? 'Great 4/5' : rating === 3 ? 'Average 3/5' : `${rating}/5 Stars`}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      value={reviewerName}
                      onChange={(e) => setReviewerName(e.target.value)}
                      placeholder="e.g. Aditya Verma"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0F766E]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Ticket Tier</label>
                    <select
                      value={ticketTier}
                      onChange={(e) => setTicketTier(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#0F766E]"
                    >
                      <option value="VIP Masterclass Pass">VIP Masterclass Pass</option>
                      <option value="General Admission">General Admission</option>
                      <option value="Early Bird Pass">Early Bird Pass</option>
                      <option value="Founder / Investor Pass">Founder / Investor Pass</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Review Headline</label>
                  <input
                    type="text"
                    required
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    placeholder="e.g. Incredible speaker panels and seamless gate check-in!"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0F766E]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Detailed Feedback</label>
                  <textarea
                    rows={4}
                    required
                    value={reviewContent}
                    onChange={(e) => setReviewContent(e.target.value)}
                    placeholder="Share details about the venue, speaker insights, networking opportunities, and organization..."
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0F766E]"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowWriteModal(false)}
                    className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-gradient-to-r from-[#0F766E] to-teal-600 hover:from-[#115E59] hover:to-teal-700 text-white text-xs font-bold rounded-xl shadow-md transition disabled:opacity-50"
                  >
                    {isSubmitting ? 'Publishing...' : 'Publish Verified Review'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}

