'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  User, Menu, PlusCircle, Cpu, Briefcase, Music, BookOpen, HeartPulse, Palette, 
  LogOut, LayoutDashboard, ChevronDown, Sparkles, Ticket, BarChart3,
  PartyPopper, Heart, Mic2, Sun, Trophy, UtensilsCrossed, HandHeart, ShoppingBag, Smile, Gem, Users
} from 'lucide-react';
import { mockCategories } from '@/lib/data';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/context/AuthContext';

const categoryIconMapNavbar: Record<string, React.ReactNode> = {
  Cpu: <Cpu className="h-4 w-4" />,
  Briefcase: <Briefcase className="h-4 w-4" />,
  Music: <Music className="h-4 w-4" />,
  BookOpen: <BookOpen className="h-4 w-4" />,
  HeartPulse: <HeartPulse className="h-4 w-4" />,
  Palette: <Palette className="h-4 w-4" />,
  Users: <Users className="h-4 w-4" />,
  PartyPopper: <PartyPopper className="h-4 w-4" />,
  Sparkles: <Sparkles className="h-4 w-4" />,
  Heart: <Heart className="h-4 w-4" />,
  Mic2: <Mic2 className="h-4 w-4" />,
  Sun: <Sun className="h-4 w-4" />,
  Trophy: <Trophy className="h-4 w-4" />,
  UtensilsCrossed: <UtensilsCrossed className="h-4 w-4" />,
  HandHeart: <HandHeart className="h-4 w-4" />,
  ShoppingBag: <ShoppingBag className="h-4 w-4" />,
  Smile: <Smile className="h-4 w-4" />,
  Gem: <Gem className="h-4 w-4" />,
};

export function Navbar() {
  const { user, profile, signOut } = useAuth();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#E7E5E4] bg-white/95 backdrop-blur backdrop-filter supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center">
            <Logo variant="default" size="md" />
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-sm font-bold">
            {/* Role-based navigation links */}
            {!user && (
              <>
                <Link href="/" className="text-[#1C1917] transition-colors hover:text-[#0F766E]">
                  Home
                </Link>

                {/* DISCOVER EVENTS WITH MULTI-COLUMN MEGA-MENU DROPDOWN */}
                <div className="relative group py-2">
                  <Link href="/events" className="text-[#78716C] transition-colors hover:text-[#0F766E] flex items-center gap-1">
                    <span>Discover Events</span>
                    <ChevronDown className="h-3.5 w-3.5 opacity-60 group-hover:rotate-180 transition-transform duration-200" />
                  </Link>

                  {/* Categories Mega-Menu Popup (Multi-Column Grid) */}
                  <div className="absolute top-full -left-6 hidden group-hover:block w-[720px] pt-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="bg-white rounded-3xl border border-[#E7E5E4] shadow-2xl p-6 space-y-4">
                      {/* Mega-menu Header */}
                      <div className="flex items-center justify-between pb-3 border-b border-[#E7E5E4]">
                        <div>
                          <h4 className="text-xs font-black text-[#1C1917] uppercase tracking-wider flex items-center gap-2">
                            <Sparkles className="h-3.5 w-3.5 text-[#F97316]" />
                            Explore By Category
                          </h4>
                          <p className="text-[11px] text-[#78716C] mt-0.5">Find live conclaves, local meetups, conferences & fests</p>
                        </div>
                        <Link
                          href="/events"
                          className="text-xs font-extrabold text-[#0F766E] hover:text-[#115E59] hover:underline"
                        >
                          View All Events →
                        </Link>
                      </div>

                      {/* 3-Column Category Grid */}
                      <div className="grid grid-cols-3 gap-2 max-h-[380px] overflow-y-auto pr-1">
                        {mockCategories.map((cat) => (
                          <Link
                            key={cat.id}
                            href={`/events?category=${cat.slug}`}
                            className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-[#FFEDD5]/40 text-[#1C1917] text-xs transition-all group/item border border-transparent hover:border-[#F97316]/20"
                          >
                            <span className="p-2 rounded-xl bg-[#FAFAF9] group-hover/item:bg-[#0F766E] group-hover/item:text-white text-[#78716C] transition shrink-0 shadow-xs">
                              {categoryIconMapNavbar[cat.icon] || <Cpu className="h-4 w-4" />}
                            </span>
                            <div className="min-w-0 flex-1">
                              <span className="font-bold block text-[#1C1917] group-hover/item:text-[#0F766E] truncate transition text-xs">
                                {cat.name}
                              </span>
                              <span className="text-[10px] text-[#78716C] block font-medium">
                                {cat.count} Events
                              </span>
                            </div>
                          </Link>
                        ))}
                      </div>

                      {/* Mega-menu Footer Banner */}
                      <div className="pt-3 border-t border-[#E7E5E4] flex items-center justify-between bg-[#FAFAF9] -mx-6 -mb-6 p-4 rounded-b-3xl text-xs">
                        <span className="text-[#78716C] text-[11px]">
                          Hosting an event or gathering?
                        </span>
                        <Link
                          href="/create-event"
                          className="font-bold text-[#F97316] hover:text-[#ea580c] flex items-center gap-1 text-xs"
                        >
                          <span>List your event for free</span>
                          <ChevronDown className="h-3 w-3 -rotate-90" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                <Link href="/about" className="text-[#78716C] transition-colors hover:text-[#0F766E]">
                  About Us
                </Link>
                <Link href="/contact" className="text-[#78716C] transition-colors hover:text-[#0F766E]">
                  Contact
                </Link>
              </>
            )}

            {/* 1. Attendee Logged In Links */}
            {user && (profile?.role === 'attendee' || !profile?.role) && (
              <>
                <Link href="/" className="text-[#1C1917] transition-colors hover:text-[#0F766E]">
                  Home
                </Link>

                <div className="relative group py-2">
                  <Link href="/events" className="text-[#78716C] transition-colors hover:text-[#0F766E] flex items-center gap-1">
                    <span>Discover Events</span>
                    <ChevronDown className="h-3.5 w-3.5 opacity-60 group-hover:rotate-180 transition-transform duration-200" />
                  </Link>

                  <div className="absolute top-full -left-6 hidden group-hover:block w-[720px] pt-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="bg-white rounded-3xl border border-[#E7E5E4] shadow-2xl p-6 space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-[#E7E5E4]">
                        <div>
                          <h4 className="text-xs font-black text-[#1C1917] uppercase tracking-wider flex items-center gap-2">
                            <Sparkles className="h-3.5 w-3.5 text-[#F97316]" />
                            Explore By Category
                          </h4>
                          <p className="text-[11px] text-[#78716C] mt-0.5">Find live conclaves, local meetups, conferences & fests</p>
                        </div>
                        <Link href="/events" className="text-xs font-extrabold text-[#0F766E] hover:text-[#115E59] hover:underline">
                          View All Events →
                        </Link>
                      </div>

                      <div className="grid grid-cols-3 gap-2 max-h-[380px] overflow-y-auto pr-1">
                        {mockCategories.map((cat) => (
                          <Link
                            key={cat.id}
                            href={`/events?category=${cat.slug}`}
                            className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-[#FFEDD5]/40 text-[#1C1917] text-xs transition-all group/item border border-transparent hover:border-[#F97316]/20"
                          >
                            <span className="p-2 rounded-xl bg-[#FAFAF9] group-hover/item:bg-[#0F766E] group-hover/item:text-white text-[#78716C] transition shrink-0 shadow-xs">
                              {categoryIconMapNavbar[cat.icon] || <Cpu className="h-4 w-4" />}
                            </span>
                            <div className="min-w-0 flex-1">
                              <span className="font-bold block text-[#1C1917] group-hover/item:text-[#0F766E] truncate transition text-xs">
                                {cat.name}
                              </span>
                              <span className="text-[10px] text-[#78716C] block font-medium">
                                {cat.count} Events
                              </span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <Link href="/about" className="text-[#78716C] transition-colors hover:text-[#0F766E]">
                  About Us
                </Link>
                <Link href="/contact" className="text-[#78716C] transition-colors hover:text-[#0F766E]">
                  Contact
                </Link>
                <Link href="/my-tickets" className="text-[#0F766E] transition-colors hover:text-[#115E59] flex items-center gap-1.5 font-bold">
                  <Ticket className="h-4 w-4" />
                  <span>My Tickets</span>
                </Link>
              </>
            )}

            {/* 2. Organizer Logged In Links */}
            {user && profile?.role === 'organizer' && (
              <>
                <Link href="/organizer/dashboard" className="text-[#0F766E] transition-colors hover:text-[#115E59] flex items-center gap-1.5 font-bold">
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Organizer Dashboard</span>
                </Link>
                <Link href="/organizer/analytics" className="text-[#1C1917] transition-colors hover:text-[#0F766E] flex items-center gap-1.5">
                  <BarChart3 className="h-4 w-4 text-[#F97316]" />
                  <span>Analytics</span>
                </Link>
                <Link href="/my-tickets" className="text-[#78716C] transition-colors hover:text-[#0F766E] flex items-center gap-1.5">
                  <Ticket className="h-4 w-4" />
                  <span>My Tickets</span>
                </Link>
              </>
            )}

            {/* 3. Admin Logged In Links */}
            {user && profile?.role === 'admin' && (
              <>
                <Link href="/" className="text-[#1C1917] transition-colors hover:text-[#0F766E]">
                  Home
                </Link>

                <div className="relative group py-2">
                  <Link href="/events" className="text-[#78716C] transition-colors hover:text-[#0F766E] flex items-center gap-1">
                    <span>Discover Events</span>
                    <ChevronDown className="h-3.5 w-3.5 opacity-60 group-hover:rotate-180 transition-transform duration-200" />
                  </Link>

                  <div className="absolute top-full -left-6 hidden group-hover:block w-[720px] pt-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="bg-white rounded-3xl border border-[#E7E5E4] shadow-2xl p-6 space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-[#E7E5E4]">
                        <div>
                          <h4 className="text-xs font-black text-[#1C1917] uppercase tracking-wider flex items-center gap-2">
                            <Sparkles className="h-3.5 w-3.5 text-[#F97316]" />
                            Explore By Category
                          </h4>
                          <p className="text-[11px] text-[#78716C] mt-0.5">Find live conclaves, local meetups, conferences & fests</p>
                        </div>
                        <Link href="/events" className="text-xs font-extrabold text-[#0F766E] hover:text-[#115E59] hover:underline">
                          View All Events →
                        </Link>
                      </div>

                      <div className="grid grid-cols-3 gap-2 max-h-[380px] overflow-y-auto pr-1">
                        {mockCategories.map((cat) => (
                          <Link
                            key={cat.id}
                            href={`/events?category=${cat.slug}`}
                            className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-[#FFEDD5]/40 text-[#1C1917] text-xs transition-all group/item border border-transparent hover:border-[#F97316]/20"
                          >
                            <span className="p-2 rounded-xl bg-[#FAFAF9] group-hover/item:bg-[#0F766E] group-hover/item:text-white text-[#78716C] transition shrink-0 shadow-xs">
                              {categoryIconMapNavbar[cat.icon] || <Cpu className="h-4 w-4" />}
                            </span>
                            <div className="min-w-0 flex-1">
                              <span className="font-bold block text-[#1C1917] group-hover/item:text-[#0F766E] truncate transition text-xs">
                                {cat.name}
                              </span>
                              <span className="text-[10px] text-[#78716C] block font-medium">
                                {cat.count} Events
                              </span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <Link href="/about" className="text-[#78716C] transition-colors hover:text-[#0F766E]">
                  About Us
                </Link>
                <Link href="/contact" className="text-[#78716C] transition-colors hover:text-[#0F766E]">
                  Contact
                </Link>
                <Link href="/my-tickets" className="text-[#0F766E] transition-colors hover:text-[#115E59] flex items-center gap-1.5 font-bold">
                  <Ticket className="h-4 w-4" />
                  <span>My Tickets</span>
                </Link>
              </>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {/* Host an Event button (shown for Guest, Organizer, Admin) */}
          {(!user || profile?.role === 'organizer' || profile?.role === 'admin') && (
            <Link 
              href="/create-event" 
              className="hidden sm:inline-flex items-center gap-2 rounded-lg bg-[#F97316] px-4 py-2 text-sm font-bold text-white shadow hover:bg-[#ea580c] transition-colors"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Host an Event</span>
            </Link>
          )}
          
          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 rounded-xl border border-[#E7E5E4] bg-white px-3 py-1.5 text-xs font-bold text-[#1C1917] shadow-sm hover:border-[#0F766E] transition"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email || 'user'}`}
                  alt={profile?.full_name || 'User'}
                  className="w-6 h-6 rounded-full bg-slate-100 object-cover"
                />
                <span className="max-w-[120px] truncate inline-block font-extrabold text-[#1C1917]">
                  {profile?.full_name || user.email?.split('@')[0]}
                </span>
                <span className={`hidden md:inline-flex px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                  profile?.role === 'admin'
                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                    : profile?.role === 'organizer'
                    ? 'bg-orange-50 text-[#F97316] border-orange-200'
                    : 'bg-teal-50 text-[#0F766E] border-teal-200'
                }`}>
                  {profile?.role === 'admin' ? 'Admin' : profile?.role === 'organizer' ? 'Organizer' : 'Attendee'}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-60 rounded-2xl border border-[#E7E5E4] bg-white p-2 shadow-2xl z-50 animate-in fade-in slide-in-from-top-1"
                  onMouseLeave={() => setUserDropdownOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-[#E7E5E4] mb-1">
                    <p className="font-bold text-xs text-[#1C1917] truncate">{profile?.full_name || (profile?.role === 'admin' ? 'Administrator' : profile?.role === 'organizer' ? 'Organizer' : 'Attendee')}</p>
                    <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider border ${
                      profile?.role === 'admin'
                        ? 'bg-purple-50 text-purple-700 border-purple-200'
                        : profile?.role === 'organizer'
                        ? 'bg-orange-50 text-[#F97316] border-orange-200'
                        : 'bg-teal-50 text-[#0F766E] border-teal-200'
                    }`}>
                      Role: {profile?.role ? (profile.role.charAt(0).toUpperCase() + profile.role.slice(1)) : 'Attendee'}
                    </span>
                  </div>

                  <Link
                    href="/my-tickets"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-[#0F766E] bg-teal-50/70 hover:bg-teal-50 transition"
                  >
                    <Ticket className="h-4 w-4 text-[#0F766E]" />
                    <span>My Passes & Tickets</span>
                  </Link>

                  {profile?.role === 'admin' && (
                    <Link
                      href="/admin"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-purple-700 hover:bg-purple-50 transition"
                    >
                      <Sparkles className="h-4 w-4 text-purple-600" />
                      <span>Admin Control Panel</span>
                    </Link>
                  )}

                  {(profile?.role === 'organizer' || profile?.role === 'admin') && (
                    <>
                      <Link
                        href="/organizer/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-[#1C1917] hover:bg-slate-50 transition"
                      >
                        <LayoutDashboard className="h-4 w-4 text-[#0F766E]" />
                        <span>Organizer Dashboard</span>
                      </Link>

                      <Link
                        href="/organizer/analytics"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-[#1C1917] hover:bg-slate-50 transition"
                      >
                        <BarChart3 className="h-4 w-4 text-[#0F766E]" />
                        <span>Event Analytics & Exports</span>
                      </Link>

                      <Link
                        href="/create-event"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-[#1C1917] hover:bg-slate-50 transition"
                      >
                        <Sparkles className="h-4 w-4 text-[#F97316]" />
                        <span>Create Event Wizard</span>
                      </Link>
                    </>
                  )}

                  <button
                    type="button"
                    onClick={async () => {
                      setUserDropdownOpen(false);
                      await signOut();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition text-left mt-1 border-t border-slate-100"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link 
                href="/login" 
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#E7E5E4] px-3.5 py-2 text-xs font-bold text-[#1C1917] hover:border-[#0F766E] transition-colors"
              >
                <User className="h-3.5 w-3.5 text-[#0F766E]" />
                <span>Sign In</span>
              </Link>
              <Link 
                href="/signup" 
                className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-[#0F766E] px-3.5 py-2 text-xs font-bold text-white shadow hover:bg-[#115E59] transition-colors"
              >
                <span>Sign Up</span>
              </Link>
            </div>
          )}

          <button 
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-gray-900"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E7E5E4] bg-white px-4 py-3 space-y-2">
          {user ? (
            <div className="p-3 bg-slate-50 rounded-xl mb-2 border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-xs text-[#1C1917]">{profile?.full_name || user.email?.split('@')[0]}</p>
                  <p className="text-[10px] text-slate-500">{user.email}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                  profile?.role === 'admin'
                    ? 'bg-purple-100 text-purple-700'
                    : profile?.role === 'organizer'
                    ? 'bg-orange-100 text-[#F97316]'
                    : 'bg-teal-100 text-[#0F766E]'
                }`}>
                  {profile?.role || 'Attendee'}
                </span>
              </div>
              <button
                type="button"
                onClick={async () => {
                  setMobileMenuOpen(false);
                  await signOut();
                }}
                className="mt-2 text-xs text-red-600 font-bold hover:underline"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 mb-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2 rounded-lg border border-slate-300 text-xs font-bold text-[#1C1917]"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2 rounded-lg bg-[#0F766E] text-white text-xs font-bold"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile links matching role */}
          {!user && (
            <>
              <Link href="/" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-xs font-bold text-[#1C1917]">
                Home
              </Link>
              <Link href="/events" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-xs font-bold text-[#1C1917]">
                Discover Events
              </Link>
              <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-xs font-bold text-[#1C1917]">
                About Us
              </Link>
              <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-xs font-bold text-[#1C1917]">
                Contact
              </Link>
              <Link href="/create-event" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-xs font-bold text-[#F97316]">
                Host an Event
              </Link>
            </>
          )}

          {user && (profile?.role === 'attendee' || !profile?.role) && (
            <>
              <Link href="/" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-xs font-bold text-[#1C1917]">
                Home
              </Link>
              <Link href="/events" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-xs font-bold text-[#1C1917]">
                Discover Events
              </Link>
              <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-xs font-bold text-[#1C1917]">
                About Us
              </Link>
              <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-xs font-bold text-[#1C1917]">
                Contact
              </Link>
              <Link href="/my-tickets" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 py-1.5 text-xs font-bold text-[#0F766E]">
                <Ticket className="h-3.5 w-3.5" />
                <span>My Tickets</span>
              </Link>
            </>
          )}

          {user && profile?.role === 'organizer' && (
            <>
              <Link href="/organizer/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 py-1.5 text-xs font-bold text-[#0F766E]">
                <LayoutDashboard className="h-3.5 w-3.5" />
                <span>Organizer Dashboard</span>
              </Link>
              <Link href="/organizer/analytics" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 py-1.5 text-xs font-bold text-[#1C1917]">
                <BarChart3 className="h-3.5 w-3.5 text-[#F97316]" />
                <span>Analytics</span>
              </Link>
              <Link href="/my-tickets" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 py-1.5 text-xs font-bold text-[#78716C]">
                <Ticket className="h-3.5 w-3.5" />
                <span>My Tickets</span>
              </Link>
              <Link href="/create-event" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-xs font-bold text-[#F97316]">
                Host an Event
              </Link>
            </>
          )}

          {user && profile?.role === 'admin' && (
            <>
              <Link href="/" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-xs font-bold text-[#1C1917]">
                Home
              </Link>
              <Link href="/events" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-xs font-bold text-[#1C1917]">
                Discover Events
              </Link>
              <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-xs font-bold text-[#1C1917]">
                About Us
              </Link>
              <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-xs font-bold text-[#1C1917]">
                Contact
              </Link>
              <Link href="/my-tickets" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 py-1.5 text-xs font-bold text-[#0F766E]">
                <Ticket className="h-3.5 w-3.5" />
                <span>My Tickets</span>
              </Link>
              <Link href="/create-event" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-xs font-bold text-[#F97316]">
                Host an Event
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-[#1E293B] bg-[#1E293B] text-slate-300 py-12">
      <div className="container mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <Link href="/" className="inline-block">
            <Logo variant="white" size="md" />
          </Link>
          <p className="text-sm text-slate-400">
            A simple platform where you can create events, sell tickets, collect payments and check people in with QR. No more Google Forms + Excel + WhatsApp chaos.
          </p>
          <div className="text-xs text-slate-500">
            © 2026 ePayEvents Platform. Built for organizers and attendees.
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-white mb-4 text-sm">Discover</h3>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><Link href="/events" className="hover:text-white transition">All Events</Link></li>
            <li><Link href="/events?category=tech-ai" className="hover:text-white transition">Tech Conferences</Link></li>
            <li><Link href="/events?category=business-fintech" className="hover:text-white transition">FinTech Summits</Link></li>
            <li><Link href="/events?category=music-concerts" className="hover:text-white transition">Music & Live Shows</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-white mb-4 text-sm">Organizers</h3>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><Link href="/create-event" className="hover:text-white transition">Host an Event</Link></li>
            <li><Link href="/organizer/dashboard" className="hover:text-white transition">Organizer Dashboard</Link></li>
            <li><Link href="#" className="hover:text-white transition">Pricing & Fees</Link></li>
            <li><Link href="#" className="hover:text-white transition">QR Check-in Guide</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-white mb-4 text-sm">Help & Support</h3>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><Link href="/contact" className="hover:text-white transition">Support & Contact</Link></li>
            <li><Link href="#" className="hover:text-white transition">Instant QR Pass Delivery</Link></li>
            <li><Link href="#" className="hover:text-white transition">Terms of Service</Link></li>
            <li><Link href="#" className="hover:text-white transition">Privacy Policy</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
