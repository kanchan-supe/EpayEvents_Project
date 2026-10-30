'use client';

import React, { useState, useEffect } from 'react';
import { Clock, Sparkles, Flame, Tag } from 'lucide-react';

interface EarlyBirdCountdownProps {
  deadlineDate?: string; // YYYY-MM-DD or ISO string
  seatsRemaining?: number;
  tierName?: string;
}

export function EarlyBirdCountdown({
  deadlineDate,
  seatsRemaining,
  tierName = 'Early Bird',
}: EarlyBirdCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  useEffect(() => {
    let target = deadlineDate ? new Date(deadlineDate).getTime() : 0;
    if (!target || isNaN(target)) {
      const fallback = new Date();
      fallback.setDate(fallback.getDate() + 3);
      fallback.setHours(23, 59, 59, 999);
      target = fallback.getTime();
    }

    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isExpired: false });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [deadlineDate]);

  if (timeLeft.isExpired) {
    return null;
  }

  return (
    <div className="rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-orange-200/90 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#F97316] to-amber-500 text-white shadow-sm shrink-0">
          <Flame className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-black text-slate-900 text-sm tracking-tight">
              Early Bird Tier Discount Ending Soon!
            </h4>
            {seatsRemaining !== undefined && (
              <span className="text-[10px] font-extrabold bg-[#F97316] text-white px-2 py-0.5 rounded-full shadow-2xs">
                {seatsRemaining} Seats Remaining
              </span>
            )}
          </div>
          <p className="text-xs text-slate-600 mt-0.5">
            Book now before passes revert to standard ticket pricing.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
        <div className="flex items-center gap-1.5 font-mono text-center">
          <div className="bg-white border border-orange-200/80 px-2.5 py-1.5 rounded-xl shadow-2xs min-w-[42px]">
            <span className="text-sm sm:text-base font-black text-slate-900 block leading-none">
              {String(timeLeft.days).padStart(2, '0')}
            </span>
            <span className="text-[8px] font-bold text-slate-400 uppercase">Days</span>
          </div>
          <span className="text-xs font-bold text-orange-400">:</span>

          <div className="bg-white border border-orange-200/80 px-2.5 py-1.5 rounded-xl shadow-2xs min-w-[42px]">
            <span className="text-sm sm:text-base font-black text-slate-900 block leading-none">
              {String(timeLeft.hours).padStart(2, '0')}
            </span>
            <span className="text-[8px] font-bold text-slate-400 uppercase">Hours</span>
          </div>
          <span className="text-xs font-bold text-orange-400">:</span>

          <div className="bg-white border border-orange-200/80 px-2.5 py-1.5 rounded-xl shadow-2xs min-w-[42px]">
            <span className="text-sm sm:text-base font-black text-slate-900 block leading-none">
              {String(timeLeft.minutes).padStart(2, '0')}
            </span>
            <span className="text-[8px] font-bold text-slate-400 uppercase">Mins</span>
          </div>
          <span className="text-xs font-bold text-orange-400">:</span>

          <div className="bg-white border border-orange-200/80 px-2.5 py-1.5 rounded-xl shadow-2xs min-w-[42px]">
            <span className="text-sm sm:text-base font-black text-[#F97316] block leading-none animate-pulse">
              {String(timeLeft.seconds).padStart(2, '0')}
            </span>
            <span className="text-[8px] font-bold text-slate-400 uppercase">Secs</span>
          </div>
        </div>
      </div>
    </div>
  );
}
