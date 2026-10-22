'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { 
  Check, ChevronRight, ChevronLeft, Plus,
  MapPin, Ticket as TicketIcon, FileText, Send, Sparkles,
  Users, Award, HelpCircle, UserCheck, AlertCircle,
  Lock, ShieldAlert, ArrowRight, Edit, Save, ArrowLeft, RefreshCw
} from 'lucide-react';
import { Navbar, Footer } from '@/components/NavbarFooter';
import { 
  EventWizardData, TicketTypeForm, RegistrationField, SpeakerForm, 
  AgendaForm, SponsorForm, ExhibitorForm, FaqForm, CouponForm 
} from '@/lib/wizardTypes';
import { mockCategories } from '@/lib/data';

const initialFormData: EventWizardData = {
  title: '',
  categorySlug: 'tech-ai',
  shortDescription: '',
  description: '',
  bannerUrl: '',
  organizerName: 'ePayEvents Tech Team',
  organizerEmail: 'organizer@epayevents.com',
  organizerPhone: '+91 98765 43210',
  organizerAvatar: '/organizers/organizer_workspace.jpg',
  organizerBio: 'Experienced event organizer specializing in technology, startups, and innovation summits across India.',
  startDate: '',
  startTime: '09:00',
  endDate: '',
  endTime: '18:00',
  timezone: 'IST',
  eventType: 'physical',
  venueName: '',
  address: '',
  city: '',
  onlineUrl: '',
  speakers: [
    {
      id: 'sp-1',
      name: 'Dr. Rajesh Verma',
      role: 'Head of AI Engineering',
      company: 'TechCorp India',
      avatar: '/speakers/speaker1.jpg',
      bio: 'Leading AI research & large language models for enterprise solutions.',
      linkedinUrl: 'https://linkedin.com'
    }
  ],
  agenda: [
    {
      id: 'ag-1',
      time: '09:30 AM - 10:30 AM',
      title: 'Keynote: The Future of Agentic AI & Event Ticketing',
      description: 'Opening remarks and keynote presentation on next-gen tech stack.',
      speaker: 'Dr. Rajesh Verma'
    }
  ],
  sponsors: [
    {
      id: 'sp-1',
      name: 'Google Cloud India',
      logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80',
      tier: 'Title',
      websiteUrl: 'https://cloud.google.com'
    }
  ],
  exhibitors: [
    {
      id: 'ex-1',
      name: 'PayFast Solutions',
      logoUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=300&q=80',
      category: 'FinTech',
      boothNumber: 'Booth A-12',
      description: 'Instant payment solutions for event organizers'
    }
  ],
  ticketTypes: [
    { id: 't-1', name: 'General Admission', description: 'Standard event access', price: 999, quantity: 100, minPerOrder: 1, maxPerOrder: 5 }
  ],
  couponCodes: [
    { id: 'c-1', code: 'EARLYBIRD', discountPercent: 20, description: '20% off for early registrants' }
  ],
  faqs: [
    { id: 'faq-1', question: 'Is refund available if I cannot attend?', answer: 'Yes, full refunds are processed up to 48 hours prior to the event start date.' },
    { id: 'faq-2', question: 'Will I get instant QR ticket on WhatsApp?', answer: 'Yes, immediately after payment your QR pass will be sent via SMS/WhatsApp and Email.' }
  ],
  termsAndPolicy: '1. Entry requires valid QR pass.\n2. Tickets are non-transferrable without organizer approval.\n3. Attendees must follow venue security protocols.',
  registrationFields: [
    { id: 'rf-1', label: 'Full Name', fieldType: 'text', required: true },
    { id: 'rf-2', label: 'Email Address', fieldType: 'email', required: true }
  ],
  taxPercentage: 18,
  platformFeePercentage: 3.5,
  status: 'draft'
};

const STEPS = [
  { id: 1, title: 'Basic Info', icon: Sparkles },
  { id: 2, title: 'Organizer Contact', icon: UserCheck },
  { id: 3, title: 'Date & Venue', icon: MapPin },
  { id: 4, title: 'Speakers & Agenda', icon: Users },
  { id: 5, title: 'Sponsors & Exhibitors', icon: Award },
  { id: 6, title: 'Tickets & Offers', icon: TicketIcon },
  { id: 7, title: 'FAQs & Policies', icon: HelpCircle },
  { id: 8, title: 'Custom Reg Form', icon: FileText },
  { id: 9, title: 'Publish', icon: Send },
];

import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

function CreateEventWizardInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editTarget = searchParams.get('edit') || searchParams.get('slug');

  const { user, role, loading: authLoading, upgradeToOrganizer } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<EventWizardData>(initialFormData);
  const [isPublished, setIsPublished] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [publishedSlug, setPublishedSlug] = useState<string>('');
  const [autoRedirectTimer, setAutoRedirectTimer] = useState<number | null>(null);

  // Edit Mode states
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [isLoadingExisting, setIsLoadingExisting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // State for attendee access restriction
  const [upgradingRole, setUpgradingRole] = useState(false);
  const [upgradeError, setUpgradeError] = useState<string | null>(null);
  const [attendeeRedirectTimer, setAttendeeRedirectTimer] = useState<number | null>(10);

  // Load existing event data if editing
  React.useEffect(() => {
    if (!editTarget) return;

    let isMounted = true;
    async function loadEventData() {
      setIsLoadingExisting(true);
      setLoadError(null);
      try {
        const res = await fetch(`/api/events/${editTarget}`);
        const json = await res.json();
        let evt = json.success && json.data ? json.data : null;

        // Check localStorage for latest saved edits on this browser
        try {
          const stored = localStorage.getItem('epay_persisted_events');
          if (stored) {
            const parsed: Record<string, any> = JSON.parse(stored);
            let localCopy: any = null;
            if (typeof parsed === 'object' && parsed !== null) {
              if (editTarget && editTarget in parsed) {
                localCopy = parsed[editTarget];
              } else if (evt && evt.id && evt.id in parsed) {
                localCopy = parsed[evt.id];
              }
            }
            if (localCopy) {
              evt = evt ? { ...evt, ...localCopy } : localCopy;
            }
          }
        } catch (e) {
          console.warn('[CreateEvent] Error reading localStorage during load:', e);
        }

        if (evt && isMounted) {
          setIsEditMode(true);
          setEditingEventId(evt.id || editTarget);

          // Prepopulate full wizard form data
          setFormData({
            title: evt.title || '',
            categorySlug: evt.category?.slug || 'tech-ai',
            shortDescription: evt.shortDescription || '',
            description: evt.description || '',
            bannerUrl: evt.bannerUrl || evt.coverImage || '',
            organizerName: evt.organization?.name || user?.user_metadata?.full_name || 'ePay Organizer',
            organizerEmail: evt.organization?.contactEmail || user?.email || 'organizer@epayevents.com',
            organizerPhone: evt.organization?.phone || user?.user_metadata?.phone || '+91 98765 43210',
            organizerAvatar: evt.organization?.avatar || '/organizers/organizer_workspace.jpg',
            organizerBio: evt.organization?.bio || '',
            startDate: evt.date || (evt.startDate ? evt.startDate.split('T')[0] : ''),
            startTime: evt.startTime ? evt.startTime.replace(/\s*(AM|PM)/i, '').trim() : '09:00',
            endDate: evt.endDate ? evt.endDate.split('T')[0] : (evt.date || ''),
            endTime: evt.endTime ? evt.endTime.replace(/\s*(AM|PM)/i, '').trim() : '18:00',
            timezone: evt.timezone || 'IST',
            eventType: evt.eventType || (evt.isOnline ? 'online' : 'physical'),
            venueName: evt.venue?.name || '',
            address: evt.venue?.address || '',
            city: evt.venue?.city || '',
            onlineUrl: evt.venue?.onlineUrl || '',
            speakers: Array.isArray(evt.speakers) && evt.speakers.length > 0 
              ? evt.speakers.map((s: any, i: number) => ({
                  id: s.id || `sp-${i + 1}`,
                  name: s.name || '',
                  role: s.role || '',
                  company: s.company || '',
                  avatar: s.avatar || s.imageUrl || '/speakers/speaker1.jpg',
                  bio: s.bio || '',
                  linkedinUrl: s.linkedinUrl || '',
                }))
              : initialFormData.speakers,
            agenda: Array.isArray(evt.agenda) && evt.agenda.length > 0
              ? evt.agenda.map((a: any, i: number) => ({
                  id: a.id || `ag-${i + 1}`,
                  time: a.time || '10:00 AM - 11:00 AM',
                  title: a.title || '',
                  description: a.description || '',
                  speaker: a.speaker || '',
                }))
              : initialFormData.agenda,
            sponsors: Array.isArray(evt.sponsors) && evt.sponsors.length > 0
              ? evt.sponsors.map((sp: any, i: number) => ({
                  id: sp.id || `sp-${i + 1}`,
                  name: sp.name || '',
                  logoUrl: sp.logoUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80',
                  tier: sp.tier || 'Gold',
                  websiteUrl: sp.websiteUrl || '',
                }))
              : initialFormData.sponsors,
            exhibitors: Array.isArray(evt.exhibitors) && evt.exhibitors.length > 0
              ? evt.exhibitors.map((ex: any, i: number) => ({
                  id: ex.id || `ex-${i + 1}`,
                  name: ex.name || '',
                  logoUrl: ex.logoUrl || 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=300&q=80',
                  category: ex.category || 'Tech',
                  boothNumber: ex.boothNumber || 'Booth 1',
                  description: ex.description || '',
                }))
              : initialFormData.exhibitors,
            ticketTypes: Array.isArray(evt.ticketTypes) && evt.ticketTypes.length > 0
              ? evt.ticketTypes.map((t: any, i: number) => ({
                  id: t.id || `t-${i + 1}`,
                  name: t.name || '',
                  description: t.description || '',
                  price: Number(t.price) || 0,
                  quantity: Number(t.quantity) || 100,
                  minPerOrder: Number(t.minPerOrder) || 1,
                  maxPerOrder: Number(t.maxPerOrder) || 5,
                  category: t.category || 'General',
                  isTransferrable: t.isTransferrable ?? true,
                  isRefundable: t.isRefundable ?? true,
                  isHidden: t.isHidden ?? false,
                }))
              : initialFormData.ticketTypes,
            couponCodes: initialFormData.couponCodes,
            faqs: Array.isArray(evt.faqs) && evt.faqs.length > 0
              ? evt.faqs.map((f: any, i: number) => ({
                  id: f.id || `faq-${i + 1}`,
                  question: f.question || '',
                  answer: f.answer || '',
                }))
              : initialFormData.faqs,
            termsAndPolicy: evt.termsAndPolicy || initialFormData.termsAndPolicy,
            registrationFields: Array.isArray(evt.registrationFields) && evt.registrationFields.length > 0
              ? evt.registrationFields.map((rf: any, i: number) => ({
                  id: rf.id || `rf-${i + 1}`,
                  label: rf.label || '',
                  fieldType: rf.fieldType || rf.type || 'text',
                  required: Boolean(rf.required),
                  options: rf.options,
                }))
              : initialFormData.registrationFields,
            taxPercentage: 18,
            platformFeePercentage: 3.5,
            status: evt.status || 'published',
          });
        } else if (isMounted) {
          setLoadError(`Event "${editTarget}" was not found.`);
        }
      } catch (err: any) {
        console.error('[CreateEvent] Error loading event:', err);
        if (isMounted) {
          setLoadError(err.message || 'Could not load event for editing.');
        }
      } finally {
        if (isMounted) {
          setIsLoadingExisting(false);
        }
      }
    }

    loadEventData();

    return () => {
      isMounted = false;
    };
  }, [editTarget]);

  // 1. If not authenticated, redirect to /login?redirect=/create-event
  React.useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/login?redirect=/create-event${editTarget ? `?edit=${editTarget}` : ''}`);
    }
  }, [authLoading, user, router, editTarget]);

  // 2. If attendee, run auto-redirect countdown to /events
  React.useEffect(() => {
    if (!authLoading && user && role === 'attendee' && attendeeRedirectTimer !== null) {
      if (attendeeRedirectTimer <= 0) {
        router.push('/events');
        return;
      }
      const t = setTimeout(() => {
        setAttendeeRedirectTimer(prev => (prev !== null && prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearTimeout(t);
    }
  }, [authLoading, user, role, attendeeRedirectTimer, router]);

  // 3. Pre-fill organizer contact details from user session (only in create mode)
  React.useEffect(() => {
    if (user && !editTarget) {
      setFormData(prev => ({
        ...prev,
        organizerName: prev.organizerName || user.user_metadata?.full_name || 'ePay Organizer',
        organizerEmail: prev.organizerEmail || user.email || 'organizer@epayevents.com',
        organizerPhone: prev.organizerPhone || user.user_metadata?.phone || '+91 98765 43210',
      }));
    }
  }, [user, editTarget]);

  // 4. Auto-redirect to the event detail page after successful publish (force full refresh to bust client router cache)
  React.useEffect(() => {
    if (isPublished && publishedSlug && autoRedirectTimer !== null) {
      if (autoRedirectTimer <= 0) {
        window.location.href = `/events/${publishedSlug}`;
        return;
      }
      const timer = setTimeout(() => {
        setAutoRedirectTimer(prev => (prev !== null && prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isPublished, publishedSlug, autoRedirectTimer]);

  const handleUpgradeToOrganizer = async () => {
    setUpgradingRole(true);
    setUpgradeError(null);
    const res = await upgradeToOrganizer();
    setUpgradingRole(false);
    if (res.error) {
      setUpgradeError(res.error);
    } else {
      setAttendeeRedirectTimer(null);
    }
  };

  const updateField = <K extends keyof EventWizardData>(field: K, value: EventWizardData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < 9) setCurrentStep(prev => prev + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  // Speaker Helpers
  const addSpeaker = () => {
    const newSp: SpeakerForm = {
      id: `sp-${Date.now()}`,
      name: 'Priya Sharma',
      role: 'VP of Product',
      company: 'EventTech Labs',
      avatar: '/speakers/speaker2.jpg',
      bio: 'Product strategist and tech speaker.',
      linkedinUrl: 'https://linkedin.com'
    };
    setFormData(prev => ({ ...prev, speakers: [...prev.speakers, newSp] }));
  };

  const removeSpeaker = (id: string) => {
    setFormData(prev => ({ ...prev, speakers: prev.speakers.filter(s => s.id !== id) }));
  };

  // Agenda Helpers
  const addAgendaItem = () => {
    const newAg: AgendaForm = {
      id: `ag-${Date.now()}`,
      time: '11:00 AM - 12:00 PM',
      title: 'Panel Discussion: Modern Ticketing Architecture',
      description: 'Interactive discussion with industry leaders.',
      speaker: 'Priya Sharma'
    };
    setFormData(prev => ({ ...prev, agenda: [...prev.agenda, newAg] }));
  };

  const removeAgendaItem = (id: string) => {
    setFormData(prev => ({ ...prev, agenda: prev.agenda.filter(a => a.id !== id) }));
  };

  // Sponsor Helpers
  const addSponsor = () => {
    const newSponsor: SponsorForm = {
      id: `sp-${Date.now()}`,
      name: 'Tech Partner',
      logoUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=300&q=80',
      tier: 'Gold',
      websiteUrl: 'https://example.com'
    };
    setFormData(prev => ({ ...prev, sponsors: [...prev.sponsors, newSponsor] }));
  };

  const removeSponsor = (id: string) => {
    setFormData(prev => ({ ...prev, sponsors: prev.sponsors.filter(s => s.id !== id) }));
  };

  // Exhibitor Helpers
  const addExhibitor = () => {
    const newExhibitor: ExhibitorForm = {
      id: `ex-${Date.now()}`,
      name: 'CloudScale Innovations',
      logoUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=300&q=80',
      category: 'Cloud & AI',
      boothNumber: 'Booth B-05',
      description: 'High performance enterprise cloud infrastructure'
    };
    setFormData(prev => ({ ...prev, exhibitors: [...prev.exhibitors, newExhibitor] }));
  };

  const removeExhibitor = (id: string) => {
    setFormData(prev => ({ ...prev, exhibitors: prev.exhibitors.filter(e => e.id !== id) }));
  };

  // FAQ Helpers
  const addFaq = () => {
    const newFaq: FaqForm = {
      id: `faq-${Date.now()}`,
      question: 'Where can I park my vehicle at the venue?',
      answer: 'Complimentary visitor parking is available at Basement Level 2 of the venue.'
    };
    setFormData(prev => ({ ...prev, faqs: [...prev.faqs, newFaq] }));
  };

  const removeFaq = (id: string) => {
    setFormData(prev => ({ ...prev, faqs: prev.faqs.filter(f => f.id !== id) }));
  };

  // Coupon Helpers
  const addCoupon = () => {
    const newCoupon: CouponForm = {
      id: `c-${Date.now()}`,
      code: 'EPAYVIP',
      discountPercent: 15,
      description: 'Special 15% discount for VIP attendees'
    };
    setFormData(prev => ({ ...prev, couponCodes: [...prev.couponCodes, newCoupon] }));
  };

  const removeCoupon = (id: string) => {
    setFormData(prev => ({ ...prev, couponCodes: prev.couponCodes.filter(c => c.id !== id) }));
  };

  // Ticket Helpers
  const addTicketType = () => {
    const newTicket: TicketTypeForm = {
      id: `t-${Date.now()}`,
      name: 'VIP Pass',
      description: 'Exclusive perks & priority entry',
      price: 1999,
      quantity: 50,
      minPerOrder: 1,
      maxPerOrder: 3
    };
    setFormData(prev => ({ ...prev, ticketTypes: [...prev.ticketTypes, newTicket] }));
  };

  const removeTicketType = (id: string) => {
    setFormData(prev => ({ ...prev, ticketTypes: prev.ticketTypes.filter(t => t.id !== id) }));
  };

  // Registration Field Helpers
  const addRegistrationField = () => {
    const newField: RegistrationField = {
      id: `rf-${Date.now()}`,
      label: 'Designation / Organization',
      fieldType: 'text',
      required: false
    };
    setFormData(prev => ({ ...prev, registrationFields: [...prev.registrationFields, newField] }));
  };

  const removeRegistrationField = (id: string) => {
    setFormData(prev => ({ ...prev, registrationFields: prev.registrationFields.filter(f => f.id !== id) }));
  };

  const handlePublish = async (status: 'draft' | 'published') => {
    setIsSubmitting(true);
    setPublishError(null);

    // Basic validation
    if (!formData.title || !formData.title.trim()) {
      setPublishError('Event Title is required. Please enter an event title in Step 1.');
      setCurrentStep(1);
      setIsSubmitting(false);
      return;
    }

    const payload = {
      ...formData,
      status,
      id: editingEventId || undefined,
    };

    console.log(`[CreateEvent] Submitting event payload (${isEditMode ? 'UPDATE' : 'CREATE'}):`, payload);

    try {
      const url = isEditMode && editTarget ? `/api/events/${editTarget}` : '/api/events';
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      console.log('[CreateEvent] Server response:', result);

      if (!response.ok || !result.success) {
        throw new Error(result.error || `Failed to ${isEditMode ? 'update' : 'publish'} event. Please verify all required fields.`);
      }

      const savedEvent = result.data;
      const finalSlug = savedEvent?.slug || editTarget || '';
      setPublishedSlug(finalSlug);
      updateField('status', status);
      setIsPublished(true);
      setAutoRedirectTimer(5); // Start 5-second countdown to event page

      // Persist to browser localStorage so edits immediately reflect everywhere
      try {
        const existingRaw = localStorage.getItem('epay_persisted_events');
        const map = existingRaw ? JSON.parse(existingRaw) : {};
        if (savedEvent) {
          if (savedEvent.id) map[savedEvent.id] = savedEvent;
          if (savedEvent.slug) map[savedEvent.slug] = savedEvent;
        }
        if (editTarget && savedEvent) {
          map[editTarget] = savedEvent;
        }
        if (finalSlug && savedEvent) {
          map[finalSlug] = savedEvent;
        }
        localStorage.setItem('epay_persisted_events', JSON.stringify(map));
        console.log('[CreateEvent] Saved event to localStorage map:', finalSlug);
      } catch (storageErr) {
        console.warn('[CreateEvent] Error writing to localStorage:', storageErr);
      }

      console.log(`[CreateEvent] Event successfully ${isEditMode ? 'updated' : 'saved'} with slug: "${finalSlug}" and status: "${status}"`);
    } catch (err: any) {
      console.error('[CreateEvent] Submission failed:', err);
      setPublishError(err.message || `An unexpected error occurred while ${isEditMode ? 'updating' : 'publishing'} the event.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading State: Fetching event data for editing
  if (isLoadingExisting) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAFAF9]">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl border border-[#E7E5E4] shadow-sm p-8 text-center max-w-sm w-full space-y-4">
            <div className="h-8 w-8 border-3 border-[#0F766E] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-[#1C1917]">Loading Event Data for Editing...</p>
            <p className="text-[11px] text-[#78716C]">Fetching latest schedule, ticket tiers, and event settings</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Auth State 1: Checking Authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAFAF9]">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl border border-[#E7E5E4] shadow-sm p-8 text-center max-w-sm w-full space-y-4">
            <div className="h-8 w-8 border-3 border-[#0F766E] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-[#1C1917]">Verifying Organizer Access...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Auth State 2: Unauthenticated
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAFAF9]">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl border border-[#E7E5E4] shadow-sm p-8 text-center max-w-sm w-full space-y-4">
            <div className="h-8 w-8 border-3 border-[#F97316] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-[#1C1917]">Redirecting to Sign In...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Auth State 3: User is logged in as Attendee
  if (role === 'attendee') {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAFAF9]">
        <Navbar />

        <div className="bg-gradient-to-r from-[#0F172A] via-[#0F766E] to-[#0F172A] text-white py-10 shadow-md">
          <div className="container mx-auto px-4 md:px-8 max-w-3xl">
            <span className="inline-block px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-full mb-2">
              Organizer Role Required
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Only Organizers Can Create Events</h1>
            <p className="text-slate-200 text-xs sm:text-sm mt-1">
              Your account is currently registered as an Attendee pass holder.
            </p>
          </div>
        </div>

        <main className="container mx-auto px-4 md:px-8 py-10 flex-1 max-w-3xl">
          <div className="bg-white rounded-3xl border border-[#E7E5E4] shadow-xl p-8 sm:p-10 space-y-6">
            <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <ShieldAlert className="h-8 w-8" />
            </div>

            <div className="text-center space-y-2">
              <h2 className="text-xl sm:text-2xl font-black text-[#1C1917]">
                Only organizers can create events
              </h2>
              <p className="text-xs sm:text-sm text-[#78716C] max-w-md mx-auto leading-relaxed">
                You are currently signed in as <strong>{user.email}</strong> with the <strong>Attendee</strong> role.
                Publishing tech summits, masterclasses, and conferences requires host privileges.
              </p>
            </div>

            {/* Upgrade error banner if any */}
            {upgradeError && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                {upgradeError}
              </div>
            )}

            {/* Auto-redirect countdown banner */}
            {attendeeRedirectTimer !== null && (
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center justify-between">
                <span>
                  Redirecting to discovery in <strong>{attendeeRedirectTimer}s</strong>...
                </span>
                <button
                  type="button"
                  onClick={() => setAttendeeRedirectTimer(null)}
                  className="text-xs font-bold text-amber-900 underline hover:no-underline ml-2"
                >
                  Stay on this page
                </button>
              </div>
            )}

            {/* Action options */}
            <div className="pt-2 space-y-3">
              <button
                type="button"
                onClick={handleUpgradeToOrganizer}
                disabled={upgradingRole}
                className="w-full rounded-2xl bg-[#F97316] hover:bg-[#EA580C] text-white py-3.5 px-4 font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {upgradingRole ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Upgrading your account to Organizer...</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="h-4 w-4" />
                    <span>Upgrade to Organizer Account (Free)</span>
                  </>
                )}
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link
                  href="/login?redirect=/create-event"
                  className="rounded-2xl border border-[#E7E5E4] hover:bg-slate-50 text-[#1C1917] py-3 px-4 font-bold text-xs transition text-center flex items-center justify-center gap-2"
                >
                  <Lock className="h-3.5 w-3.5 text-[#0F766E]" />
                  <span>Sign in as Different User</span>
                </Link>

                <Link
                  href="/events"
                  className="rounded-2xl border border-[#E7E5E4] hover:bg-slate-50 text-[#1C1917] py-3 px-4 font-bold text-xs transition text-center flex items-center justify-center gap-2"
                >
                  <span>Browse Events Catalog</span>
                  <ArrowRight className="h-3.5 w-3.5 text-[#78716C]" />
                </Link>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // Auth State 4: User is logged in as Organizer or Admin -> Render Wizard!
  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF9]">
      <Navbar />

      <div className="bg-gradient-to-r from-[#0F172A] via-[#0F766E] to-[#0F172A] text-white py-10 shadow-md">
        <div className="container mx-auto px-4 md:px-8 max-w-6xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="inline-block px-3 py-1 bg-[#F97316] text-white text-xs font-bold rounded-full mb-2">
                {isEditMode ? '✏️ Event Edit Mode' : 'Organizer Portal'}
              </span>
              <h1 className="text-3xl font-black tracking-tight">
                {isEditMode ? `Edit Event: ${formData.title || 'Loading...'}` : 'Create & Host Your Event'}
              </h1>
              <p className="text-slate-200 text-sm mt-1 max-w-2xl">
                {isEditMode
                  ? 'Update event details, schedules, venue locations, ticket pricing, and attendee registration questions.'
                  : 'Configure full event details including organizers, speakers, schedule agenda, sponsors, ticket tiers, FAQs, and custom registration questions.'}
              </p>
            </div>
            {isEditMode && editTarget && (
              <Link
                href={`/events/${editTarget}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition backdrop-blur-md shrink-0"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>View Event</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 md:px-8 py-8 flex-1 max-w-6xl">
        {/* Step Indicator Header */}
        <div className="mb-8 overflow-x-auto pb-4">
          <div className="flex items-center min-w-[850px] justify-between">
            {STEPS.map((step, idx) => {
              const IconComponent = step.icon;
              const isCompleted = currentStep > step.id;
              const isCurrent = currentStep === step.id;

              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <button
                      onClick={() => setCurrentStep(step.id)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs transition-all ${
                        isCompleted 
                          ? 'bg-[#0F766E] text-white' 
                          : isCurrent 
                          ? 'bg-[#F97316] text-white ring-4 ring-[#FFEDD5]' 
                          : 'bg-white border border-[#E7E5E4] text-[#78716C]'
                      }`}
                    >
                      {isCompleted ? <Check className="h-5 w-5" /> : <IconComponent className="h-4 w-4" />}
                    </button>
                    <span className={`text-[11px] font-bold mt-2 whitespace-nowrap ${isCurrent ? 'text-[#F97316]' : 'text-[#78716C]'}`}>
                      {step.title}
                    </span>
                  </div>

                  {idx < STEPS.length - 1 && (
                    <div className={`h-1 flex-1 mx-2 rounded ${isCompleted ? 'bg-[#0F766E]' : 'bg-[#E7E5E4]'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Load Error Alert if any */}
        {loadError && (
          <div className="mb-6 rounded-2xl bg-amber-50 border border-amber-200 p-4 text-xs font-bold text-amber-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
              <span>{loadError}</span>
            </div>
            <Link href="/organizer/dashboard" className="underline hover:no-underline text-amber-900">
              Return to Dashboard
            </Link>
          </div>
        )}

        {/* Wizard Form Body */}
        {isPublished ? (
          <div className="bg-white p-8 md:p-10 rounded-3xl border border-[#E7E5E4] shadow-xl text-center max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-[#CCFBF1] text-[#0F766E] rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Check className="h-8 w-8" />
            </div>
            
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full text-xs font-semibold mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Saved to Supabase & Live on Catalog</span>
            </div>

            <h2 className="text-2xl font-black text-[#1C1917]">
              {isEditMode 
                ? (formData.status === 'published' ? 'Event Updated & Live Successfully!' : 'Event Changes Saved as Draft!')
                : (formData.status === 'published' ? 'Event Published Live Successfully!' : 'Saved as Draft!')}
            </h2>
            <p className="text-[#78716C] text-sm mt-2">
              {isEditMode 
                ? <>Your modifications to <strong>&quot;{formData.title || 'Untitled Event'}&quot;</strong> have been saved and updated live across the platform.</>
                : <>Your event <strong>&quot;{formData.title || 'Untitled Event'}&quot;</strong> has been published and is now discoverable on the homepage and catalog.</>}
            </p>

            {/* Auto-redirect countdown banner */}
            {autoRedirectTimer !== null && publishedSlug && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center justify-between">
                <span>
                  Redirecting to your live event page in <strong>{autoRedirectTimer}</strong>s...
                </span>
                <button
                  type="button"
                  onClick={() => setAutoRedirectTimer(null)}
                  className="text-xs font-bold text-amber-900 underline hover:no-underline ml-2"
                >
                  Cancel auto-redirect
                </button>
              </div>
            )}

            <div className="mt-6 bg-[#FAFAF9] p-5 rounded-2xl border border-[#E7E5E4] text-left space-y-2 text-xs text-[#1C1917]">
              {publishedSlug && (
                <p><strong>Event Slug:</strong> <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-[#0F766E]">/events/{publishedSlug}</code></p>
              )}
              <p><strong>Organizer:</strong> {formData.organizerName || 'ePay Organizer'} ({formData.organizerEmail || 'N/A'})</p>
              <p><strong>Category:</strong> {formData.categorySlug}</p>
              <p><strong>Speakers:</strong> {formData.speakers.length} speakers added</p>
              <p><strong>Agenda Sessions:</strong> {formData.agenda.length} sessions</p>
              <p><strong>Sponsors & Exhibitors:</strong> {formData.sponsors.length} sponsors, {formData.exhibitors.length} exhibitors</p>
              <p><strong>Ticket Tiers:</strong> {formData.ticketTypes.length} tiers configured</p>
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {publishedSlug && (
                <a
                  href={`/events/${publishedSlug}`}
                  className="rounded-xl bg-[#0F766E] px-6 py-3 text-sm font-bold text-white hover:bg-[#115E59] transition shadow-md flex items-center gap-2"
                >
                  <span>🎉 View Event Page</span>
                </a>
              )}
              <Link
                href="/organizer/dashboard"
                className="rounded-xl bg-[#F97316] px-6 py-3 text-sm font-bold text-white hover:bg-[#ea580c] transition shadow-md flex items-center gap-2"
              >
                <span>📊 Organizer Dashboard</span>
              </Link>
              <Link
                href="/events"
                className="rounded-xl border border-[#E7E5E4] bg-white px-5 py-3 text-sm font-bold text-[#1C1917] hover:bg-slate-100 transition"
              >
                Browse All Events
              </Link>
              <button 
                type="button"
                onClick={() => { setIsPublished(false); setAutoRedirectTimer(null); setCurrentStep(1); setFormData(initialFormData); setPublishedSlug(''); }}
                className="rounded-xl border border-[#E7E5E4] px-5 py-3 text-sm font-bold text-[#78716C] hover:bg-slate-100 transition"
              >
                Create Another Event
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white p-8 md:p-10 rounded-3xl border border-[#E7E5E4] shadow-sm">
            
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="border-b border-[#E7E5E4] pb-4">
                  <h2 className="text-xl font-black text-[#1C1917]">Step 1: Event Basic Information</h2>
                  <p className="text-xs text-[#78716C]">Define your event title, category, and main banner image</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#1C1917] mb-1">Event Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={e => updateField('title', e.target.value)}
                    placeholder="e.g. National AI & FinTech Developers Summit 2026"
                    className="w-full rounded-xl border border-[#E7E5E4] px-4 py-3 text-sm focus:border-[#0F766E] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-[#1C1917] mb-1">Category *</label>
                    <select
                      value={formData.categorySlug}
                      onChange={e => updateField('categorySlug', e.target.value)}
                      className="w-full rounded-xl border border-[#E7E5E4] px-4 py-3 text-sm focus:border-[#0F766E] focus:outline-none bg-white"
                    >
                      {mockCategories.map(cat => (
                        <option key={cat.id} value={cat.slug}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[#1C1917] mb-1">Short Tagline / Catchphrase</label>
                    <input
                      type="text"
                      value={formData.shortDescription}
                      onChange={e => updateField('shortDescription', e.target.value)}
                      placeholder="e.g. Empowering 1,000+ developers with Next.js & AI"
                      className="w-full rounded-xl border border-[#E7E5E4] px-4 py-3 text-sm focus:border-[#0F766E] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#1C1917] mb-1">Detailed About Event Description</label>
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={e => updateField('description', e.target.value)}
                    placeholder="Write a comprehensive overview of what attendees will experience..."
                    className="w-full rounded-xl border border-[#E7E5E4] px-4 py-3 text-sm focus:border-[#0F766E] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#1C1917] mb-1">Cover Banner Image URL</label>
                  <input
                    type="text"
                    value={formData.bannerUrl}
                    onChange={e => updateField('bannerUrl', e.target.value)}
                    placeholder="https://images.unsplash.com/photo-1540575467063-178a50c2df87"
                    className="w-full rounded-xl border border-[#E7E5E4] px-4 py-3 text-sm focus:border-[#0F766E] focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Organizer Contact Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="border-b border-[#E7E5E4] pb-4">
                  <h2 className="text-xl font-black text-[#1C1917]">Step 2: Organizer Contact & Bio</h2>
                  <p className="text-xs text-[#78716C]">Shown on the Event Detail page to build trust with attendees</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-[#1C1917] mb-1">Organizer / Host Name *</label>
                    <input
                      type="text"
                      value={formData.organizerName}
                      onChange={e => updateField('organizerName', e.target.value)}
                      placeholder="e.g. TechEvents Pvt Ltd"
                      className="w-full rounded-xl border border-[#E7E5E4] px-4 py-3 text-sm focus:border-[#0F766E] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[#1C1917] mb-1">Official Support Email *</label>
                    <input
                      type="email"
                      value={formData.organizerEmail}
                      onChange={e => updateField('organizerEmail', e.target.value)}
                      placeholder="support@techevents.com"
                      className="w-full rounded-xl border border-[#E7E5E4] px-4 py-3 text-sm focus:border-[#0F766E] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-[#1C1917] mb-1">Organizer Contact Phone</label>
                    <input
                      type="text"
                      value={formData.organizerPhone}
                      onChange={e => updateField('organizerPhone', e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full rounded-xl border border-[#E7E5E4] px-4 py-3 text-sm focus:border-[#0F766E] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[#1C1917] mb-1">Organizer Logo / Photo URL</label>
                    <input
                      type="text"
                      value={formData.organizerAvatar}
                      onChange={e => updateField('organizerAvatar', e.target.value)}
                      placeholder="/organizers/organizer_workspace.jpg"
                      className="w-full rounded-xl border border-[#E7E5E4] px-4 py-3 text-sm focus:border-[#0F766E] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#1C1917] mb-1">Organizer Short Bio</label>
                  <textarea
                    rows={3}
                    value={formData.organizerBio}
                    onChange={e => updateField('organizerBio', e.target.value)}
                    placeholder="Brief background of your organization or track record..."
                    className="w-full rounded-xl border border-[#E7E5E4] px-4 py-3 text-sm focus:border-[#0F766E] focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Date & Venue */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="border-b border-[#E7E5E4] pb-4">
                  <h2 className="text-xl font-black text-[#1C1917]">Step 3: Date, Time & Venue Details</h2>
                  <p className="text-xs text-[#78716C]">Set your event format and physical address or streaming URL</p>
                </div>

                <div className="bg-[#FAFAF9] p-5 rounded-2xl border border-[#E7E5E4] space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-[#1C1917] mb-1">Start Date *</label>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={e => {
                          const val = e.target.value;
                          updateField('startDate', val);
                          if (!formData.endDate) {
                            updateField('endDate', val);
                          }
                        }}
                        className="w-full rounded-xl border border-[#E7E5E4] px-4 py-3 text-sm focus:border-[#0F766E] focus:outline-none bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#1C1917] mb-1">Start Time *</label>
                      <input
                        type="time"
                        value={formData.startTime}
                        onChange={e => updateField('startTime', e.target.value)}
                        className="w-full rounded-xl border border-[#E7E5E4] px-4 py-3 text-sm focus:border-[#0F766E] focus:outline-none bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-[#1C1917] mb-1">End Date *</label>
                      <input
                        type="date"
                        value={formData.endDate}
                        min={formData.startDate}
                        onChange={e => updateField('endDate', e.target.value)}
                        className="w-full rounded-xl border border-[#E7E5E4] px-4 py-3 text-sm focus:border-[#0F766E] focus:outline-none bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#1C1917] mb-1">End Time *</label>
                      <input
                        type="time"
                        value={formData.endTime}
                        onChange={e => updateField('endTime', e.target.value)}
                        className="w-full rounded-xl border border-[#E7E5E4] px-4 py-3 text-sm focus:border-[#0F766E] focus:outline-none bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#1C1917] mb-2">Event Format</label>
                  <div className="grid grid-cols-3 gap-4">
                    {(
                      [
                        { id: 'physical', label: 'In-Person Venue' },
                        { id: 'online', label: 'Online / Zoom' },
                        { id: 'hybrid', label: 'Hybrid Event' }
                      ] as const
                    ).map(fmt => (
                      <button
                        key={fmt.id}
                        type="button"
                        onClick={() => updateField('eventType', fmt.id)}
                        className={`p-3 rounded-xl border font-bold text-xs transition ${
                          formData.eventType === fmt.id ? 'border-[#0F766E] bg-[#CCFBF1]/30 text-[#0F766E]' : 'border-[#E7E5E4] text-[#78716C]'
                        }`}
                      >
                        {fmt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {(formData.eventType === 'physical' || formData.eventType === 'hybrid') && (
                  <div className="space-y-4 pt-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-[#1C1917] mb-1">Venue Name *</label>
                        <input
                          type="text"
                          value={formData.venueName}
                          onChange={e => updateField('venueName', e.target.value)}
                          placeholder="e.g. Grand Hyatt Convention Center"
                          className="w-full rounded-xl border border-[#E7E5E4] px-4 py-3 text-sm focus:border-[#0F766E] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-[#1C1917] mb-1">City *</label>
                        <input
                          type="text"
                          value={formData.city}
                          onChange={e => updateField('city', e.target.value)}
                          placeholder="e.g. Mumbai, Bengaluru"
                          className="w-full rounded-xl border border-[#E7E5E4] px-4 py-3 text-sm focus:border-[#0F766E] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Speakers & Agenda */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-[#E7E5E4] pb-4">
                  <div>
                    <h2 className="text-xl font-black text-[#1C1917]">Step 4: Speakers & Agenda Schedule</h2>
                    <p className="text-xs text-[#78716C]">Add featured speakers and timeline sessions</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={addSpeaker}
                      className="inline-flex items-center gap-1 rounded-xl bg-[#0F766E] text-white px-3 py-2 text-xs font-bold hover:bg-[#115E59]"
                    >
                      <Plus className="h-4 w-4" /> Add Speaker
                    </button>
                    <button
                      type="button"
                      onClick={addAgendaItem}
                      className="inline-flex items-center gap-1 rounded-xl bg-[#F97316] text-white px-3 py-2 text-xs font-bold hover:bg-[#ea580c]"
                    >
                      <Plus className="h-4 w-4" /> Add Agenda Session
                    </button>
                  </div>
                </div>

                {/* Speakers Section */}
                <div className="space-y-4">
                  <h3 className="font-bold text-sm text-[#1C1917]">Featured Speakers ({formData.speakers.length})</h3>
                  {formData.speakers.map((sp, idx) => (
                    <div key={sp.id} className="p-4 rounded-2xl border border-[#E7E5E4] bg-[#FAFAF9] space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-xs text-[#0F766E]">Speaker #{idx + 1}</span>
                        {formData.speakers.length > 1 && (
                          <button type="button" onClick={() => removeSpeaker(sp.id)} className="text-red-500 text-xs font-bold">Remove</button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <input
                          type="text"
                          value={sp.name}
                          onChange={e => {
                            const updated = [...formData.speakers];
                            updated[idx].name = e.target.value;
                            updateField('speakers', updated);
                          }}
                          placeholder="Speaker Name"
                          className="rounded-xl border border-[#E7E5E4] px-3 py-2 text-xs font-bold"
                        />
                        <input
                          type="text"
                          value={sp.role}
                          onChange={e => {
                            const updated = [...formData.speakers];
                            updated[idx].role = e.target.value;
                            updateField('speakers', updated);
                          }}
                          placeholder="Designation / Role"
                          className="rounded-xl border border-[#E7E5E4] px-3 py-2 text-xs"
                        />
                        <input
                          type="text"
                          value={sp.company}
                          onChange={e => {
                            const updated = [...formData.speakers];
                            updated[idx].company = e.target.value;
                            updateField('speakers', updated);
                          }}
                          placeholder="Company Name"
                          className="rounded-xl border border-[#E7E5E4] px-3 py-2 text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Agenda Section */}
                <div className="space-y-4 pt-4 border-t border-[#E7E5E4]">
                  <h3 className="font-bold text-sm text-[#1C1917]">Event Agenda Schedule ({formData.agenda.length})</h3>
                  {formData.agenda.map((ag, idx) => (
                    <div key={ag.id} className="p-4 rounded-2xl border border-[#E7E5E4] bg-[#FAFAF9] space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-xs text-[#F97316]">Session #{idx + 1}</span>
                        {formData.agenda.length > 1 && (
                          <button type="button" onClick={() => removeAgendaItem(ag.id)} className="text-red-500 text-xs font-bold">Remove</button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={ag.time}
                          onChange={e => {
                            const updated = [...formData.agenda];
                            updated[idx].time = e.target.value;
                            updateField('agenda', updated);
                          }}
                          placeholder="Time slot (e.g. 10:00 AM - 11:00 AM)"
                          className="rounded-xl border border-[#E7E5E4] px-3 py-2 text-xs font-bold"
                        />
                        <input
                          type="text"
                          value={ag.title}
                          onChange={e => {
                            const updated = [...formData.agenda];
                            updated[idx].title = e.target.value;
                            updateField('agenda', updated);
                          }}
                          placeholder="Session Title"
                          className="rounded-xl border border-[#E7E5E4] px-3 py-2 text-xs font-bold"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 5: Sponsors & Exhibitors */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-[#E7E5E4] pb-4">
                  <div>
                    <h2 className="text-xl font-black text-[#1C1917]">Step 5: Sponsors & Exhibitor Partners</h2>
                    <p className="text-xs text-[#78716C]">Showcase supporting brands and booth exhibitors</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={addSponsor}
                      className="inline-flex items-center gap-1 rounded-xl bg-[#0F766E] text-white px-3 py-2 text-xs font-bold"
                    >
                      <Plus className="h-4 w-4" /> Add Sponsor
                    </button>
                    <button
                      type="button"
                      onClick={addExhibitor}
                      className="inline-flex items-center gap-1 rounded-xl bg-[#F97316] text-white px-3 py-2 text-xs font-bold"
                    >
                      <Plus className="h-4 w-4" /> Add Exhibitor
                    </button>
                  </div>
                </div>

                {/* Sponsors List */}
                <div className="space-y-3">
                  <h3 className="font-bold text-sm text-[#1C1917]">Sponsors ({formData.sponsors.length})</h3>
                  {formData.sponsors.map((sp, idx) => (
                    <div key={sp.id} className="flex gap-3 items-center p-4 rounded-2xl border border-[#E7E5E4] bg-[#FAFAF9]">
                      <input
                        type="text"
                        value={sp.name}
                        onChange={e => {
                          const updated = [...formData.sponsors];
                          updated[idx].name = e.target.value;
                          updateField('sponsors', updated);
                        }}
                        placeholder="Sponsor Name"
                        className="flex-1 rounded-xl border border-[#E7E5E4] px-3 py-2 text-xs font-bold"
                      />
                      <select
                        value={sp.tier}
                        onChange={e => {
                          const updated = [...formData.sponsors];
                          updated[idx].tier = e.target.value as SponsorForm['tier'];
                          updateField('sponsors', updated);
                        }}
                        className="rounded-xl border border-[#E7E5E4] px-3 py-2 text-xs font-bold bg-white"
                      >
                        <option value="Title">Title Sponsor</option>
                        <option value="Platinum">Platinum</option>
                        <option value="Gold">Gold</option>
                        <option value="Silver">Silver</option>
                        <option value="Community Partner">Community Partner</option>
                      </select>
                      {formData.sponsors.length > 1 && (
                        <button type="button" onClick={() => removeSponsor(sp.id)} className="text-red-500 text-xs font-bold">Delete</button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Exhibitors List */}
                <div className="space-y-3 pt-4 border-t border-[#E7E5E4]">
                  <h3 className="font-bold text-sm text-[#1C1917]">Exhibitors ({formData.exhibitors.length})</h3>
                  {formData.exhibitors.map((ex, idx) => (
                    <div key={ex.id} className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl border border-[#E7E5E4] bg-[#FAFAF9]">
                      <input
                        type="text"
                        value={ex.name}
                        onChange={e => {
                          const updated = [...formData.exhibitors];
                          updated[idx].name = e.target.value;
                          updateField('exhibitors', updated);
                        }}
                        placeholder="Exhibitor Name"
                        className="rounded-xl border border-[#E7E5E4] px-3 py-2 text-xs font-bold"
                      />
                      <input
                        type="text"
                        value={ex.boothNumber}
                        onChange={e => {
                          const updated = [...formData.exhibitors];
                          updated[idx].boothNumber = e.target.value;
                          updateField('exhibitors', updated);
                        }}
                        placeholder="Booth Number (e.g. A-12)"
                        className="rounded-xl border border-[#E7E5E4] px-3 py-2 text-xs"
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={ex.category}
                          onChange={e => {
                            const updated = [...formData.exhibitors];
                            updated[idx].category = e.target.value;
                            updateField('exhibitors', updated);
                          }}
                          placeholder="Category"
                          className="flex-1 rounded-xl border border-[#E7E5E4] px-3 py-2 text-xs"
                        />
                        {formData.exhibitors.length > 1 && (
                          <button type="button" onClick={() => removeExhibitor(ex.id)} className="text-red-500 text-xs font-bold">Remove</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 6: Tickets & Offers */}
            {currentStep === 6 && (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-[#E7E5E4] pb-4">
                  <div>
                    <h2 className="text-xl font-black text-[#1C1917]">Step 6: Ticket Tiers & Promotional Coupons</h2>
                    <p className="text-xs text-[#78716C]">Configure ticket pricing, seat quantities, and promo discount codes</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={addTicketType}
                      className="inline-flex items-center gap-1 rounded-xl bg-[#0F766E] text-white px-3 py-2 text-xs font-bold"
                    >
                      <Plus className="h-4 w-4" /> Add Ticket Tier
                    </button>
                    <button
                      type="button"
                      onClick={addCoupon}
                      className="inline-flex items-center gap-1 rounded-xl bg-[#F97316] text-white px-3 py-2 text-xs font-bold"
                    >
                      <Plus className="h-4 w-4" /> Add Promo Coupon
                    </button>
                  </div>
                </div>

                {/* Ticket Tiers */}
                <div className="space-y-4">
                  {formData.ticketTypes.map((tkt, idx) => (
                    <div key={tkt.id} className="p-5 rounded-2xl border border-[#E7E5E4] bg-[#FAFAF9] space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-[#0F766E]">Ticket Tier #{idx + 1}</span>
                          <span className="text-[10px] bg-slate-200 text-slate-700 font-mono px-2 py-0.5 rounded">
                            {tkt.category || 'General'}
                          </span>
                        </div>
                        {formData.ticketTypes.length > 1 && (
                          <button type="button" onClick={() => removeTicketType(tkt.id)} className="text-red-500 text-xs font-bold">Delete Tier</button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-bold text-[#1C1917] mb-1">Ticket Name *</label>
                          <input
                            type="text"
                            value={tkt.name}
                            onChange={e => {
                              const updated = [...formData.ticketTypes];
                              updated[idx].name = e.target.value;
                              updateField('ticketTypes', updated);
                            }}
                            placeholder="e.g. VIP Developer Pass"
                            className="w-full rounded-xl border border-[#E7E5E4] px-3 py-2 text-xs font-bold"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-[#1C1917] mb-1">Category</label>
                          <select
                            value={tkt.category || 'General'}
                            onChange={e => {
                              const updated = [...formData.ticketTypes];
                              updated[idx].category = e.target.value as TicketTypeForm['category'];
                              updateField('ticketTypes', updated);
                            }}
                            className="w-full rounded-xl border border-[#E7E5E4] px-3 py-2 text-xs font-bold bg-white text-[#1C1917]"
                          >
                            <option value="General">General</option>
                            <option value="VIP">VIP</option>
                            <option value="Workshop">Workshop</option>
                            <option value="Virtual">Virtual</option>
                            <option value="Student">Student</option>
                            <option value="Corporate">Corporate</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-[#1C1917] mb-1">Price (₹, 0 for Free)</label>
                          <input
                            type="number"
                            value={tkt.price}
                            onChange={e => {
                              const updated = [...formData.ticketTypes];
                              updated[idx].price = Number(e.target.value);
                              updateField('ticketTypes', updated);
                            }}
                            placeholder="Price (₹)"
                            className="w-full rounded-xl border border-[#E7E5E4] px-3 py-2 text-xs font-bold"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-[#1C1917] mb-1">Total Seat Quantity</label>
                          <input
                            type="number"
                            value={tkt.quantity}
                            onChange={e => {
                              const updated = [...formData.ticketTypes];
                              updated[idx].quantity = Number(e.target.value);
                              updateField('ticketTypes', updated);
                            }}
                            placeholder="Seats count"
                            className="w-full rounded-xl border border-[#E7E5E4] px-3 py-2 text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-[#1C1917] mb-1">Min Per Order Limit</label>
                          <input
                            type="number"
                            value={tkt.minPerOrder || 1}
                            onChange={e => {
                              const updated = [...formData.ticketTypes];
                              updated[idx].minPerOrder = Number(e.target.value);
                              updateField('ticketTypes', updated);
                            }}
                            className="w-full rounded-xl border border-[#E7E5E4] px-3 py-2 text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-[#1C1917] mb-1">Max Per Order Limit</label>
                          <input
                            type="number"
                            value={tkt.maxPerOrder || 5}
                            onChange={e => {
                              const updated = [...formData.ticketTypes];
                              updated[idx].maxPerOrder = Number(e.target.value);
                              updateField('ticketTypes', updated);
                            }}
                            className="w-full rounded-xl border border-[#E7E5E4] px-3 py-2 text-xs"
                          />
                        </div>
                      </div>

                      {/* Smart Features Toggles */}
                      <div className="p-3 bg-white rounded-xl border border-[#E7E5E4] space-y-2">
                        <span className="text-[11px] font-bold text-[#0F766E] uppercase tracking-wider block">
                          Smart Ticketing Module Settings
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-700">
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={tkt.isEarlyBird || false}
                              onChange={e => {
                                const updated = [...formData.ticketTypes];
                                updated[idx].isEarlyBird = e.target.checked;
                                updateField('ticketTypes', updated);
                              }}
                              className="rounded text-[#0F766E]"
                            />
                            <span>Early-Bird Tier</span>
                          </label>

                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={tkt.isGroupDiscount || false}
                              onChange={e => {
                                const updated = [...formData.ticketTypes];
                                updated[idx].isGroupDiscount = e.target.checked;
                                updateField('ticketTypes', updated);
                              }}
                              className="rounded text-[#0F766E]"
                            />
                            <span>Group Discount (4+)</span>
                          </label>

                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={tkt.isApprovalRequired || false}
                              onChange={e => {
                                const updated = [...formData.ticketTypes];
                                updated[idx].isApprovalRequired = e.target.checked;
                                updateField('ticketTypes', updated);
                              }}
                              className="rounded text-[#0F766E]"
                            />
                            <span>Approval Required</span>
                          </label>

                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={tkt.isWaitlist || false}
                              onChange={e => {
                                const updated = [...formData.ticketTypes];
                                updated[idx].isWaitlist = e.target.checked;
                                updateField('ticketTypes', updated);
                              }}
                              className="rounded text-[#0F766E]"
                            />
                            <span>Enable Waitlist</span>
                          </label>

                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={tkt.isComplimentary || false}
                              onChange={e => {
                                const updated = [...formData.ticketTypes];
                                updated[idx].isComplimentary = e.target.checked;
                                updateField('ticketTypes', updated);
                              }}
                              className="rounded text-[#0F766E]"
                            />
                            <span>Complimentary Pass</span>
                          </label>

                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={tkt.isHidden || false}
                              onChange={e => {
                                const updated = [...formData.ticketTypes];
                                updated[idx].isHidden = e.target.checked;
                                updateField('ticketTypes', updated);
                              }}
                              className="rounded text-[#0F766E]"
                            />
                            <span>Hidden (Passcode)</span>
                          </label>

                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={tkt.isTransferrable ?? true}
                              onChange={e => {
                                const updated = [...formData.ticketTypes];
                                updated[idx].isTransferrable = e.target.checked;
                                updateField('ticketTypes', updated);
                              }}
                              className="rounded text-[#0F766E]"
                            />
                            <span>Transfer Allowed</span>
                          </label>

                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={tkt.isRefundable ?? true}
                              onChange={e => {
                                const updated = [...formData.ticketTypes];
                                updated[idx].isRefundable = e.target.checked;
                                updateField('ticketTypes', updated);
                              }}
                              className="rounded text-[#0F766E]"
                            />
                            <span>Refund Allowed</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Coupon Codes */}
                <div className="space-y-3 pt-4 border-t border-[#E7E5E4]">
                  <h3 className="font-bold text-sm text-[#1C1917]">Promotional Coupons ({formData.couponCodes.length})</h3>
                  {formData.couponCodes.map((cp, idx) => (
                    <div key={cp.id} className="flex gap-3 items-center p-4 rounded-2xl border border-[#E7E5E4] bg-[#FAFAF9]">
                      <input
                        type="text"
                        value={cp.code}
                        onChange={e => {
                          const updated = [...formData.couponCodes];
                          updated[idx].code = e.target.value.toUpperCase();
                          updateField('couponCodes', updated);
                        }}
                        placeholder="COUPON CODE (e.g. EPAY20)"
                        className="rounded-xl border border-[#E7E5E4] px-3 py-2 text-xs font-bold tracking-wider uppercase"
                      />
                      <input
                        type="number"
                        value={cp.discountPercent}
                        onChange={e => {
                          const updated = [...formData.couponCodes];
                          updated[idx].discountPercent = Number(e.target.value);
                          updateField('couponCodes', updated);
                        }}
                        placeholder="Discount %"
                        className="w-28 rounded-xl border border-[#E7E5E4] px-3 py-2 text-xs font-bold"
                      />
                      <input
                        type="text"
                        value={cp.description}
                        onChange={e => {
                          const updated = [...formData.couponCodes];
                          updated[idx].description = e.target.value;
                          updateField('couponCodes', updated);
                        }}
                        placeholder="Description"
                        className="flex-1 rounded-xl border border-[#E7E5E4] px-3 py-2 text-xs"
                      />
                      {formData.couponCodes.length > 0 && (
                        <button type="button" onClick={() => removeCoupon(cp.id)} className="text-red-500 text-xs font-bold">Remove</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 7: FAQs & Terms Policy */}
            {currentStep === 7 && (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-[#E7E5E4] pb-4">
                  <div>
                    <h2 className="text-xl font-black text-[#1C1917]">Step 7: FAQs & Terms / Refund Policy</h2>
                    <p className="text-xs text-[#78716C]">Provide clear answers to frequent questions and event guidelines</p>
                  </div>
                  <button
                    type="button"
                    onClick={addFaq}
                    className="inline-flex items-center gap-1 rounded-xl bg-[#0F766E] text-white px-3 py-2 text-xs font-bold"
                  >
                    <Plus className="h-4 w-4" /> Add FAQ
                  </button>
                </div>

                {/* FAQs */}
                <div className="space-y-3">
                  <h3 className="font-bold text-sm text-[#1C1917]">Frequently Asked Questions ({formData.faqs.length})</h3>
                  {formData.faqs.map((faq, idx) => (
                    <div key={faq.id} className="p-4 rounded-2xl border border-[#E7E5E4] bg-[#FAFAF9] space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-xs text-[#0F766E]">FAQ #{idx + 1}</span>
                        {formData.faqs.length > 1 && (
                          <button type="button" onClick={() => removeFaq(faq.id)} className="text-red-500 text-xs font-bold">Delete</button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={faq.question}
                        onChange={e => {
                          const updated = [...formData.faqs];
                          updated[idx].question = e.target.value;
                          updateField('faqs', updated);
                        }}
                        placeholder="Question (e.g. Is food included in the VIP ticket?)"
                        className="w-full rounded-xl border border-[#E7E5E4] px-3 py-2 text-xs font-bold"
                      />
                      <textarea
                        rows={2}
                        value={faq.answer}
                        onChange={e => {
                          const updated = [...formData.faqs];
                          updated[idx].answer = e.target.value;
                          updateField('faqs', updated);
                        }}
                        placeholder="Answer details..."
                        className="w-full rounded-xl border border-[#E7E5E4] px-3 py-2 text-xs"
                      />
                    </div>
                  ))}
                </div>

                {/* Terms Policy */}
                <div className="pt-4 border-t border-[#E7E5E4]">
                  <label className="block text-sm font-bold text-[#1C1917] mb-1">Terms & Refund Policy Guidelines</label>
                  <textarea
                    rows={4}
                    value={formData.termsAndPolicy}
                    onChange={e => updateField('termsAndPolicy', e.target.value)}
                    placeholder="Enter terms, entry restrictions, and refund policies line by line..."
                    className="w-full rounded-xl border border-[#E7E5E4] px-4 py-3 text-sm focus:border-[#0F766E] focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Step 8: Custom Registration Form */}
            {currentStep === 8 && (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-[#E7E5E4] pb-4">
                  <div>
                    <h2 className="text-xl font-black text-[#1C1917]">Step 8: Custom Registration Form Questions</h2>
                    <p className="text-xs text-[#78716C]">Ask custom attendee questions during checkout</p>
                  </div>
                  <button
                    type="button"
                    onClick={addRegistrationField}
                    className="inline-flex items-center gap-1 rounded-xl bg-[#0F766E] text-white px-3 py-2 text-xs font-bold"
                  >
                    <Plus className="h-4 w-4" /> Add Field
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.registrationFields.map((rf, idx) => (
                    <div key={rf.id} className="flex items-center gap-4 p-4 rounded-2xl border border-[#E7E5E4] bg-[#FAFAF9]">
                      <div className="flex-1">
                        <label className="block text-xs font-bold text-[#78716C]">Question Label</label>
                        <input
                          type="text"
                          value={rf.label}
                          onChange={e => {
                            const updated = [...formData.registrationFields];
                            updated[idx].label = e.target.value;
                            updateField('registrationFields', updated);
                          }}
                          className="w-full rounded-xl border border-[#E7E5E4] px-3 py-2 text-xs font-bold"
                        />
                      </div>
                      <div className="w-36">
                        <label className="block text-xs font-bold text-[#78716C]">Field Type</label>
                        <select
                          value={rf.fieldType}
                          onChange={e => {
                            const updated = [...formData.registrationFields];
                            updated[idx].fieldType = e.target.value as RegistrationField['fieldType'];
                            updateField('registrationFields', updated);
                          }}
                          className="w-full rounded-xl border border-[#E7E5E4] px-2 py-2 text-xs font-bold bg-white"
                        >
                          <option value="text">Text Input</option>
                          <option value="email">Email</option>
                          <option value="phone">Phone Number</option>
                        </select>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeRegistrationField(rf.id)}
                        className="text-red-500 font-bold text-xs pt-4"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 9: Final Publish */}
            {currentStep === 9 && (
              <div className="space-y-6">
                <div className="border-b border-[#E7E5E4] pb-4">
                  <h2 className="text-xl font-black text-[#1C1917]">
                    {isEditMode ? 'Step 9: Review & Save Modifications' : 'Step 9: Final Review & Live Publish'}
                  </h2>
                  <p className="text-xs text-[#78716C]">
                    {isEditMode 
                      ? 'Verify your event changes before updating the live catalog and Supabase database' 
                      : 'Verify all details before publishing your event to ePayEvents'}
                  </p>
                </div>

                <div className="bg-[#FAFAF9] p-6 rounded-2xl border border-[#E7E5E4] space-y-3 text-xs text-[#1C1917]">
                  <p><strong>Title:</strong> {formData.title || 'Untitled Event'}</p>
                  <div className="bg-white p-3 rounded-xl border border-[#E7E5E4] space-y-1">
                    <p><strong>Start Date & Time:</strong> {formData.startDate || 'TBD'} at {formData.startTime || '10:00'}</p>
                    <p><strong>End Date & Time:</strong> {formData.endDate || formData.startDate || 'TBD'} at {formData.endTime || '18:00'}</p>
                    <p className="text-[11px] text-[#78716C]">Timezone: {formData.timezone || 'IST'}</p>
                  </div>
                  <p><strong>Venue / Location:</strong> {formData.venueName || 'Virtual Online'}, {formData.city}</p>
                  <p><strong>Speakers Configured:</strong> {formData.speakers.length} speakers</p>
                  <p><strong>Agenda Sessions:</strong> {formData.agenda.length} sessions</p>
                  <p><strong>Sponsors / Exhibitors:</strong> {formData.sponsors.length} sponsors, {formData.exhibitors.length} exhibitors</p>
                  <p><strong>Ticket Tiers:</strong> {formData.ticketTypes.map(t => `${t.name} (₹${t.price})`).join(', ')}</p>
                  <p><strong>Promo Codes:</strong> {formData.couponCodes.map(c => `${c.code} (${c.discountPercent}% OFF)`).join(', ')}</p>
                  <p><strong>FAQs:</strong> {formData.faqs.length} answered questions</p>
                </div>

                {publishError && (
                  <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-xs font-semibold text-rose-700 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{publishError}</span>
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handlePublish('published')}
                    className={`flex-1 rounded-xl bg-[#0F766E] py-3.5 text-sm font-bold text-white transition shadow-lg flex items-center justify-center gap-2 ${
                      isSubmitting ? 'opacity-60 cursor-not-allowed' : 'hover:bg-[#115E59]'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>{isEditMode ? 'Saving Changes...' : 'Publishing to Platform...'}</span>
                      </>
                    ) : (
                      <span>{isEditMode ? '💾 Save & Update Event Live' : '🚀 Publish Event Live Now'}</span>
                    )}
                  </button>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handlePublish('draft')}
                    className="rounded-xl border border-[#E7E5E4] bg-white px-6 py-3.5 text-sm font-bold text-[#1C1917] hover:bg-slate-100 transition disabled:opacity-60"
                  >
                    Save as Draft
                  </button>
                </div>
              </div>
            )}

            {/* Navigation controls */}
            <div className="mt-8 pt-6 border-t border-[#E7E5E4] flex justify-between">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentStep === 1}
                className={`inline-flex items-center gap-1 text-xs font-bold rounded-xl px-4 py-2.5 border transition ${
                  currentStep === 1 ? 'opacity-40 cursor-not-allowed border-[#E7E5E4] text-[#78716C]' : 'border-[#E7E5E4] text-[#1C1917] hover:bg-slate-100'
                }`}
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </button>

              {currentStep < 9 && (
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center gap-1 text-xs font-bold rounded-xl bg-[#F97316] text-white px-5 py-2.5 hover:bg-[#ea580c] transition shadow"
                >
                  Next Step <ChevronRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function CreateEventWizard() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col bg-[#FAFAF9]">
          <Navbar />
          <main className="flex-1 flex items-center justify-center p-6">
            <div className="bg-white rounded-3xl border border-[#E7E5E4] shadow-sm p-8 text-center max-w-sm w-full space-y-4">
              <div className="h-8 w-8 border-3 border-[#0F766E] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-bold text-[#1C1917]">Loading Event Studio...</p>
            </div>
          </main>
          <Footer />
        </div>
      }
    >
      <CreateEventWizardInner />
    </Suspense>
  );
}
