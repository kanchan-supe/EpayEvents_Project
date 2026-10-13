'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Navbar, Footer } from '@/components/NavbarFooter';
import { 
  Mail, Phone, MapPin, Send, CheckCircle2, Clock, 
  Radio, Terminal, Zap
} from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9] text-[#1C1917] flex flex-col justify-between overflow-x-hidden font-sans">
      <Navbar />

      {/* Hero Header Banner with Gaming Elements */}
      <section className="relative py-12 lg:py-14 bg-gradient-to-b from-[#0B0F19] via-[#0F172A] to-[#0B0F19] border-b border-slate-800 overflow-hidden text-white">
        {/* Gaming Grid Line Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

        {/* Ambient Glowing Orbs */}
        <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-[#0F766E]/20 blur-[120px] rounded-full pointer-events-none animate-pulse" />
        <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-[#F97316]/15 blur-[120px] rounded-full pointer-events-none animate-pulse" />

        <div className="container mx-auto px-4 md:px-8 max-w-5xl relative z-10 text-center space-y-3.5">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full bg-slate-900/90 border border-cyan-500/40 px-3.5 py-1 text-xs font-mono font-bold text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.25)] backdrop-blur-md"
          >
            <Radio className="h-3.5 w-3.5 text-[#F97316] animate-pulse" />
            <span>24/7 SUPPORT COMMAND CENTER</span>
          </motion.div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
            Connect With Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-[#0F766E] to-[#F97316]">Event Guild</span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto font-normal">
            Need help configuring your event arena, instant QR scanners, or payout settlements? Launch a signal to our squad.
          </p>
        </div>
      </section>

      {/* Main Body Section - Clean Light Background */}
      <main className="flex-1 py-12 sm:py-16 bg-[#FAFAF9]">
        <div className="container mx-auto px-4 md:px-8 max-w-6xl">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Info HUD Card */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6 lg:col-span-1"
            >
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E7E5E4] shadow-sm space-y-6">
                
                <div className="flex items-center justify-between pb-3 border-b border-[#E7E5E4]">
                  <span className="font-mono text-xs text-[#0F766E] font-bold uppercase tracking-wider flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-[#F97316]" /> CONTACT TELEMETRY
                  </span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                </div>

                <p className="text-xs text-[#78716C] leading-relaxed">
                  Our event engineering support team is online Monday to Saturday, 9:00 AM – 8:00 PM IST.
                </p>

                <div className="space-y-5 text-xs">
                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 rounded-xl bg-[#0F766E]/10 text-[#0F766E] shrink-0 font-bold">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="font-bold text-[#1C1917] block">Email Dispatch</span>
                      <a href="mailto:support@epayevents.com" className="text-[#78716C] hover:text-[#0F766E] transition">
                        support@epayevents.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 rounded-xl bg-[#F97316]/10 text-[#F97316] shrink-0 font-bold">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="font-bold text-[#1C1917] block">Hotline / WhatsApp</span>
                      <span className="text-[#78716C]">+91 98765 43210</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 shrink-0 font-bold">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="font-bold text-[#1C1917] block">Headquarters Arena</span>
                      <span className="text-[#78716C] leading-relaxed block mt-0.5">
                        ePayEvents Tech HQ, HSR Layout, Sector 6, Bengaluru, Karnataka 560102
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 shrink-0 font-bold">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="font-bold text-[#1C1917] block">Response Telemetry</span>
                      <span className="text-[#78716C]">Under 2 hours on business days</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Help Banner */}
              <div className="bg-[#1E293B] p-6 rounded-3xl text-white space-y-3 shadow-lg border border-[#0F766E]/30">
                <div className="flex items-center gap-2 text-[#F97316] font-bold text-xs font-mono uppercase tracking-wider">
                  <Zap className="h-4 w-4 text-cyan-400" /> INSTANT KNOWLEDGE BASE
                </div>
                <h4 className="font-extrabold text-base text-white">Organizer Knowledge Vault</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Access tutorials on configuring promo coupon codes, seat tier caps, and gate scanners.
                </p>
              </div>
            </motion.div>

            {/* Right Column: Interactive Light Theme Form Card */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white p-6 sm:p-10 rounded-3xl border border-[#E7E5E4] shadow-sm lg:col-span-2 relative overflow-hidden"
            >
              {submitted ? (
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="py-16 text-center space-y-4">
                  <div className="w-20 h-20 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 className="h-10 w-10" />
                  </div>
                  <h3 className="text-2xl font-black text-[#1C1917]">Transmission Received!</h3>
                  <p className="text-xs sm:text-sm text-[#78716C] max-w-md mx-auto leading-relaxed">
                    Thank you, <span className="font-bold text-[#1C1917]">{formData.name}</span>. Our event squad has logged your inquiry and will contact <span className="font-bold text-[#1C1917]">{formData.email}</span> shortly.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ name: '', email: '', phone: '', subject: 'General Inquiry', message: '' });
                    }}
                    className="mt-4 px-7 py-3 rounded-xl bg-[#0F766E] text-white font-bold text-xs hover:bg-[#115E59] transition shadow-md"
                  >
                    Send Another Transmission
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                  <div className="border-b border-[#E7E5E4] pb-4 flex justify-between items-center">
                    <div>
                      <h3 className="text-2xl font-black text-[#1C1917]">Transmit Message</h3>
                      <p className="text-xs text-[#78716C] mt-1">Fill in the fields below to connect directly with our support squad.</p>
                    </div>
                    <span className="px-3 py-1 bg-[#FAFAF9] border border-[#E7E5E4] text-[#0F766E] text-[10px] font-mono font-bold rounded-md uppercase">
                      SECURE FORM
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[#1C1917]">Your Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Rahul Sharma"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-[#E7E5E4] text-xs focus:ring-2 focus:ring-[#0F766E] focus:outline-none text-[#1C1917]"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[#1C1917]">Email Address *</label>
                      <input
                        type="email"
                        required
                        placeholder="rahul@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-[#E7E5E4] text-xs focus:ring-2 focus:ring-[#0F766E] focus:outline-none text-[#1C1917]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[#1C1917]">Phone / WhatsApp Number</label>
                      <input
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-[#E7E5E4] text-xs focus:ring-2 focus:ring-[#0F766E] focus:outline-none text-[#1C1917]"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[#1C1917]">Inquiry Subject</label>
                      <select
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-[#E7E5E4] text-xs focus:ring-2 focus:ring-[#0F766E] focus:outline-none bg-white text-[#1C1917]"
                      >
                        <option value="General Inquiry">General Inquiry</option>
                        <option value="Hosting an Event">Hosting an Event / Onboarding</option>
                        <option value="Payments & Settlements">Payments & Settlements</option>
                        <option value="QR Gate Check-in">QR Gate Check-in Tech</option>
                        <option value="Enterprise / Large Scale Event">Enterprise / Large Scale Event</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#1C1917]">Your Message *</label>
                    <textarea
                      required
                      rows={5}
                      placeholder="Specify event dates, expected attendees, or tech requirements..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-[#E7E5E4] text-xs focus:ring-2 focus:ring-[#0F766E] focus:outline-none resize-none text-[#1C1917]"
                    ></textarea>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#F97316] hover:bg-[#ea580c] text-white font-extrabold text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-[#F97316]/20"
                  >
                    <span>Launch Transmission</span>
                    <Send className="h-4 w-4" />
                  </motion.button>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
