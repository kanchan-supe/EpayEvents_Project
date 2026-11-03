'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Mail, ArrowLeft, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle, KeyRound, Radio
} from 'lucide-react';
import { Navbar, Footer } from '@/components/NavbarFooter';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/context/AuthContext';

export default function ForgotPasswordPage() {
  const { resetPassword, isConfigured } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim()) {
      setErrorMsg('Please enter your account email address.');
      return;
    }

    setLoading(true);
    const { error } = await resetPassword(email);
    setLoading(false);

    if (error) {
      setErrorMsg(error);
    } else {
      setSubmitted(true);
      setResendCooldown(60);
      const timer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF9] text-[#1C1917] font-sans">
      <Navbar />

      <main className="flex-1 relative flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Ambient Gradient Background Glow */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#0F766E]/15 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[#F97316]/15 rounded-full blur-[130px] pointer-events-none" />

        <div className="w-full max-w-md relative z-10 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex justify-center mb-1">
              <Logo variant="default" size="lg" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#1C1917] tracking-tight">
              Reset Your <span className="text-[#0F766E]">Password</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#78716C]">
              We&apos;ll send a secure password recovery link to your registered email
            </p>

            {/* Supabase status badge */}
            <div className="pt-1 flex items-center justify-center">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${
                isConfigured 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}>
                <Radio className={`h-3 w-3 ${isConfigured ? 'text-emerald-500 animate-pulse' : 'text-amber-500'}`} />
                <span>{isConfigured ? 'Connected to Supabase Realtime Auth' : 'Demo Sandbox Mode (Local Supabase Mock)'}</span>
              </span>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-3xl border border-[#E7E5E4] shadow-xl p-6 sm:p-8 space-y-6 relative"
          >
            {submitted ? (
              <div className="text-center space-y-4">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-[#1C1917]">Password Reset Email Dispatched</h3>
                  <p className="text-xs text-[#78716C] leading-relaxed">
                    If an account exists for <strong>{email}</strong>, we have sent instructions to reset your password.
                  </p>
                </div>

                <div className="pt-2 space-y-3">
                  <button
                    type="button"
                    disabled={resendCooldown > 0}
                    onClick={handleSubmit}
                    className="w-full rounded-xl border border-[#E7E5E4] hover:bg-slate-50 text-[#1C1917] py-2.5 px-4 font-bold text-xs transition disabled:opacity-50"
                  >
                    {resendCooldown > 0 ? `Resend email in ${resendCooldown}s` : 'Resend Recovery Email'}
                  </button>

                  <Link
                    href="/login"
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white py-2.5 px-4 font-bold text-xs transition shadow"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Return to Sign In</span>
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 p-3 bg-teal-50 rounded-2xl border border-teal-100 text-xs text-[#0F766E]">
                  <KeyRound className="h-5 w-5 shrink-0 text-[#0F766E]" />
                  <p>
                    Enter your email below and we will send you a one-time link to create a new password.
                  </p>
                </div>

                {errorMsg && (
                  <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-start gap-2 animate-in fade-in">
                    <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#1C1917] mb-1.5">
                      Account Email Address
                    </label>
                    <div className="relative">
                      <Mail className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full rounded-xl border border-[#E7E5E4] pl-10 pr-4 py-2.5 text-xs text-[#1C1917] placeholder-slate-400 focus:outline-none focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/20 transition"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white py-3 px-4 font-bold text-xs shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {loading ? (
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Send Password Reset Link</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>

                <div className="pt-2 text-center text-xs text-[#78716C]">
                  Remembered your password?{' '}
                  <Link href="/login" className="font-extrabold text-[#0F766E] hover:underline">
                    Back to Sign In
                  </Link>
                </div>
              </>
            )}
          </motion.div>

          <div className="flex items-center justify-center gap-2 text-[11px] text-[#78716C]">
            <ShieldCheck className="h-3.5 w-3.5 text-[#059669]" />
            <span>Secure tokens expired after 60 minutes for account safety</span>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
