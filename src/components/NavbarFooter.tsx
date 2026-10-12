import React from 'react';
import Link from 'next/link';
import { User, Menu, PlusCircle, ChevronDown, Compass, Cpu, Briefcase, Music, BookOpen, HeartPulse, Palette } from 'lucide-react';
import { mockCategories } from '@/lib/data';
import { Logo } from '@/components/Logo';

const categoryIconMapNavbar: Record<string, React.ReactNode> = {
  Cpu: <Cpu className="h-4 w-4" />,
  Briefcase: <Briefcase className="h-4 w-4" />,
  Music: <Music className="h-4 w-4" />,
  BookOpen: <BookOpen className="h-4 w-4" />,
  HeartPulse: <HeartPulse className="h-4 w-4" />,
  Palette: <Palette className="h-4 w-4" />,
};

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#E7E5E4] bg-white/95 backdrop-blur backdrop-filter supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center">
            <Logo variant="default" size="md" />
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-sm font-bold">
            <Link href="/" className="text-[#1C1917] transition-colors hover:text-[#0F766E]">
              Home
            </Link>

            {/* DISCOVER EVENTS WITH CATEGORIES DROPDOWN */}
            <div className="relative group py-2">
              <Link href="/events" className="text-[#78716C] transition-colors hover:text-[#0F766E]">
                Discover Events
              </Link>

              {/* Categories Popup */}
              <div className="absolute top-full left-0 hidden group-hover:block w-64 pt-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="bg-white rounded-2xl border border-[#E7E5E4] shadow-2xl p-2 space-y-1">
                  {mockCategories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/events?category=${cat.slug}`}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-[#FFEDD5]/50 text-[#1C1917] text-xs transition group/item"
                    >
                      <span className="p-1.5 rounded-lg bg-[#FAFAF9] group-hover/item:bg-[#0F766E] group-hover/item:text-white text-[#78716C] transition">
                        {categoryIconMapNavbar[cat.icon] || <Cpu className="h-4 w-4" />}
                      </span>
                      <div className="flex-1">
                        <span className="font-bold block text-[#1C1917] group-hover/item:text-[#0F766E] transition">{cat.name}</span>
                        <span className="text-[10px] text-[#78716C] line-clamp-1 font-normal">{cat.count} Events</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <Link href="/about" className="text-[#78716C] transition-colors hover:text-[#0F766E]">
              About Us
            </Link>
            <Link href="/contact" className="text-[#78716C] transition-colors hover:text-[#0F766E]">
              Contact
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Link 
            href="/create-event" 
            className="hidden sm:inline-flex items-center gap-2 rounded-lg bg-[#F97316] px-4 py-2 text-sm font-bold text-white shadow hover:bg-[#ea580c] transition-colors"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Host an Event</span>
          </Link>
          
          <Link 
            href="/login" 
            className="inline-flex items-center gap-2 rounded-lg bg-[#0F766E] px-4 py-2 text-sm font-bold text-white shadow hover:bg-[#115E59] transition-colors"
          >
            <User className="h-4 w-4" />
            <span>Sign In</span>
          </Link>

          <button className="md:hidden p-2 text-gray-600 hover:text-gray-900">
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>
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
