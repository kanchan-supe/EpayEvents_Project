import React from 'react';
import Link from 'next/link';
import { Ticket, User, Menu, PlusCircle } from 'lucide-react';

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur backdrop-filter supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-blue-600">
            <Ticket className="h-7 w-7" />
            <span>ePayEvents</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/events" className="transition-colors hover:text-blue-600">
              Discover Events
            </Link>
            <Link href="/events?category=tech-ai" className="transition-colors text-muted-foreground hover:text-foreground">
              Tech & AI
            </Link>
            <Link href="/events?category=business-fintech" className="transition-colors text-muted-foreground hover:text-foreground">
              FinTech
            </Link>
            <Link href="/events?category=workshops" className="transition-colors text-muted-foreground hover:text-foreground">
              Workshops
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Link 
            href="/create-event" 
            className="hidden sm:inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3.5 py-2 text-sm font-medium text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Host an Event</span>
          </Link>
          
          <Link 
            href="/login" 
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 transition-colors"
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
    <footer className="border-t bg-slate-900 text-slate-300 py-12">
      <div className="container mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xl font-bold text-white">
            <Ticket className="h-6 w-6 text-blue-400" />
            <span>ePayEvents</span>
          </div>
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
            <li><Link href="#" className="hover:text-white transition">Instant QR Pass Delivery</Link></li>
            <li><Link href="#" className="hover:text-white transition">Terms of Service</Link></li>
            <li><Link href="#" className="hover:text-white transition">Privacy Policy</Link></li>
            <li><Link href="#" className="hover:text-white transition">Support & FAQ</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
