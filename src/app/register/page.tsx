'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  User, Mail, Lock, Phone, Eye, EyeOff, ArrowRight, ShieldCheck, 
  CheckCircle2, AlertCircle, Building2, Radio
} from 'lucide-react';
import { Navbar, Footer } from '@/components/NavbarFooter';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/context/AuthContext';

export default function RegisterPage() {
  const router = useRouter();
  const { signUp, signInWithOAuth, isConfigured } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'attendee' | 'organizer'>('attendee');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'github' | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  // Compute password strength
  const getPasswordStrength = () => {
    if (!password) return { label: '', color: 'bg-transparent', score: 0 };
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 1) return { label: 'Weak', color: 'bg-red-500', score: 25 };
    if (score === 2) return { label: 'Fair', color: 'bg-amber-500', score: 50 };
    if (score === 3) return { label: 'Good', color: 'bg-blue-500', score: 75 };
    return { label: 'Strong', color: 'bg-emerald-500', score: 100 };
  };

  const strength = getPasswordStrength();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!email.trim() || !password) {
      setErrorMsg('Please provide a valid email and password.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    if (!agreeTerms) {
      setErrorMsg('You must agree to the Terms of Service and Privacy Policy.');
      return;
    }

    setLoading(true);
    const result = await signUp(email, password, {
      fullName,
      role,
      phone,
    });
    setLoading(false);

    if (result.error) {
      setErrorMsg(result.error);
    } else if (result.needsEmailConfirmation) {
      setNeedsConfirmation(true);
    } else {
      setSuccessMsg('Account created successfully! Redirecting...');
      setTimeout(() => {
        if (role === 'organizer') {
          router.push('/create-event');
        } else {
          router.push('/events');
        }
      }, 1200);
    }
  };

  const handleOAuth = async (provider: 'google' | 'github') => {
    setErrorMsg('');
    setOauthLoading(provider);
    const { error } = await signInWithOAuth(provider);
    setOauthLoading(null);
    if (error) {
      setErrorMsg(error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF9] text-[#1C1917] font-sans">
      <Navbar />

      <main className="flex-1 relative flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Ambient Gradient Background Glow */}
        <div className="absolute top-1/4 -right-20 w-96 h-96 bg-[#0F766E]/15 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-[#F97316]/15 rounded-full blur-[130px] pointer-events-none" />

        <div className="w-full max-w-lg relative z-10 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex justify-center mb-1">
              <Logo variant="default" size="lg" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#1C1917] tracking-tight">
              Create Your <span className="text-[#0F766E]">ePayEvents</span> Account
            </h1>
            <p className="text-xs sm:text-sm text-[#78716C]">
              Join thousands of attendees and event organizers across India
            </p>

            {/* Supabase Realtime Project Badge */}
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

          {/* Form Card or Email Confirmation Notice */}
          {needsConfirmation ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl border border-[#E7E5E4] shadow-xl p-8 text-center space-y-4"
            >
              <div className="w-16 h-16 bg-teal-50 text-[#0F766E] rounded-full flex items-center justify-center mx-auto shadow-inner">
                <Mail className="h-8 w-8" />
              </div>
              <h2 className="text-xl font-bold text-[#1C1917]">Verify Your Email Address</h2>
              <p className="text-xs sm:text-sm text-[#78716C] leading-relaxed max-w-sm mx-auto">
                We have sent an authentication verification email to <strong>{email}</strong>. Please click the link inside to activate your account.
              </p>
              <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/login"
                  className="rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white py-2.5 px-5 text-xs font-bold transition shadow"
                >
                  Go to Sign In
                </Link>
                <button
                  type="button"
                  onClick={() => setNeedsConfirmation(false)}
                  className="rounded-xl border border-[#E7E5E4] hover:bg-slate-50 text-[#1C1917] py-2.5 px-5 text-xs font-bold transition"
                >
                  Edit Email
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-3xl border border-[#E7E5E4] shadow-xl p-6 sm:p-8 space-y-6 relative"
            >
              {/* Account Type Selector */}
              <div>
                <label className="block text-xs font-bold text-[#1C1917] mb-2">
                  Select Account Role
                </label>
                <div className="grid grid-cols-2 p-1 bg-[#FAFAF9] rounded-2xl border border-[#E7E5E4] text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setRole('attendee')}
                    className={`py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
                      role === 'attendee'
                        ? 'bg-white text-[#0F766E] shadow-sm font-extrabold'
                        : 'text-[#78716C] hover:text-[#1C1917]'
                    }`}
                  >
                    <User className="h-3.5 w-3.5" />
                    <span>Attendee</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('organizer')}
                    className={`py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
                      role === 'organizer'
                        ? 'bg-white text-[#F97316] shadow-sm font-extrabold'
                        : 'text-[#78716C] hover:text-[#1C1917]'
                    }`}
                  >
                    <Building2 className="h-3.5 w-3.5" />
                    <span>Event Host / Organizer</span>
                  </button>
                </div>
              </div>

              {/* Alerts */}
              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-start gap-2 animate-in fade-in">
                  <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-start gap-2 animate-in fade-in">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{successMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-[#1C1917] mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full rounded-xl border border-[#E7E5E4] pl-10 pr-4 py-2.5 text-xs text-[#1C1917] placeholder-slate-400 focus:outline-none focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/20 transition"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-bold text-[#1C1917] mb-1.5">
                    Email Address
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

                {/* Phone Number */}
                <div>
                  <label className="block text-xs font-bold text-[#1C1917] mb-1.5">
                    Phone Number <span className="text-slate-400 font-normal">(For instant SMS/WhatsApp ticket passes)</span>
                  </label>
                  <div className="relative">
                    <Phone className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full rounded-xl border border-[#E7E5E4] pl-10 pr-4 py-2.5 text-xs text-[#1C1917] placeholder-slate-400 focus:outline-none focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/20 transition"
                    />
                  </div>
                </div>

                {/* Password & Confirm */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#1C1917] mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full rounded-xl border border-[#E7E5E4] pl-10 pr-10 py-2.5 text-xs text-[#1C1917] placeholder-slate-400 focus:outline-none focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/20 transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1C1917] mb-1.5">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full rounded-xl border border-[#E7E5E4] pl-10 pr-4 py-2.5 text-xs text-[#1C1917] placeholder-slate-400 focus:outline-none focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/20 transition"
                      />
                    </div>
                  </div>
                </div>

                {/* Password Strength Meter */}
                {password && (
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] text-[#78716C] font-semibold">
                      <span>Password Strength</span>
                      <span className="font-bold text-[#1C1917]">{strength.label}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${strength.color} transition-all duration-300`}
                        style={{ width: `${strength.score}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Terms agreement */}
                <div className="flex items-start gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-[#0F766E] focus:ring-[#0F766E] h-4 w-4"
                  />
                  <label htmlFor="terms" className="text-xs text-[#78716C] leading-snug cursor-pointer">
                    I agree to the{' '}
                    <span className="text-[#0F766E] font-bold">Terms of Service</span> and{' '}
                    <span className="text-[#0F766E] font-bold">Privacy Policy</span>.
                  </label>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white py-3 px-4 font-bold text-xs shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? (
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Complete Registration</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative flex items-center justify-center">
                <div className="border-t border-[#E7E5E4] w-full" />
                <span className="bg-white px-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider absolute">
                  Or Sign Up With
                </span>
              </div>

              {/* Social OAuth */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleOAuth('google')}
                  disabled={Boolean(oauthLoading)}
                  className="rounded-xl border border-[#E7E5E4] hover:bg-slate-50 py-2.5 px-3 text-xs font-bold text-[#1C1917] transition flex items-center justify-center gap-2 shadow-sm"
                >
                  {oauthLoading === 'google' ? (
                    <div className="h-3.5 w-3.5 border-2 border-[#1C1917] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                  )}
                  <span>Google</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOAuth('github')}
                  disabled={Boolean(oauthLoading)}
                  className="rounded-xl border border-[#E7E5E4] hover:bg-slate-50 py-2.5 px-3 text-xs font-bold text-[#1C1917] transition flex items-center justify-center gap-2 shadow-sm"
                >
                  {oauthLoading === 'github' ? (
                    <div className="h-3.5 w-3.5 border-2 border-[#1C1917] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                    </svg>
                  )}
                  <span>GitHub</span>
                </button>
              </div>

              {/* Already have an account */}
              <div className="pt-2 text-center text-xs text-[#78716C]">
                Already registered?{' '}
                <Link href="/login" className="font-extrabold text-[#0F766E] hover:underline">
                  Sign in to your account
                </Link>
              </div>
            </motion.div>
          )}

          {/* Security Guarantee Note */}
          <div className="flex items-center justify-center gap-2 text-[11px] text-[#78716C]">
            <ShieldCheck className="h-3.5 w-3.5 text-[#059669]" />
            <span>Encrypted credentials protected by Supabase Row Level Security</span>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
