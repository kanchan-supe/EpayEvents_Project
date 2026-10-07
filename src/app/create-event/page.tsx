'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Check, ChevronRight, ChevronLeft, Plus, Trash2, Image as ImageIcon, 
  Calendar, MapPin, Ticket as TicketIcon, FileText, CreditCard, Send, Sparkles, AlertCircle
} from 'lucide-react';
import { Navbar, Footer } from '@/components/NavbarFooter';
import { EventWizardData, TicketTypeForm, RegistrationField } from '@/lib/wizardTypes';
import { mockCategories } from '@/lib/data';

const initialFormData: EventWizardData = {
  title: '',
  categorySlug: 'tech-ai',
  shortDescription: '',
  description: '',
  bannerUrl: '',
  organizerEmail: '',
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
  ticketTypes: [
    { id: 't-1', name: 'General Admission', description: 'Standard event access', price: 999, quantity: 100, minPerOrder: 1, maxPerOrder: 5 }
  ],
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
  { id: 2, title: 'Date & Time', icon: Calendar },
  { id: 3, title: 'Venue Details', icon: MapPin },
  { id: 4, title: 'Tickets Config', icon: TicketIcon },
  { id: 5, title: 'Registration Form', icon: FileText },
  { id: 6, title: 'Payment & Fees', icon: CreditCard },
  { id: 7, title: 'Publish', icon: Send },
];

export default function CreateEventWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<EventWizardData>(initialFormData);
  const [isPublished, setIsPublished] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  const updateField = (field: keyof EventWizardData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < 7) setCurrentStep(prev => prev + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

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

  const handlePublish = (status: 'draft' | 'published') => {
    updateField('status', status);
    setIsPublished(true);
  };

  // Preset sample banner image for quick testing
  const setSampleBanner = (url: string) => {
    setImageUploading(true);
    setTimeout(() => {
      updateField('bannerUrl', url);
      setImageUploading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <div className="bg-slate-900 text-white py-10 border-b border-slate-800">
        <div className="container mx-auto px-4 md:px-8 max-w-5xl">
          <h1 className="text-3xl font-extrabold">Sprint 2: Event Creation Wizard</h1>
          <p className="text-slate-400 text-sm mt-1">Configure your event, custom registration questions, tickets, and publish</p>
        </div>
      </div>

      <main className="container mx-auto px-4 md:px-8 py-10 flex-1 max-w-5xl">
        {/* Step Indicator Header */}
        <div className="mb-10 overflow-x-auto pb-4">
          <div className="flex items-center min-w-[700px] justify-between">
            {STEPS.map((step, idx) => {
              const IconComponent = step.icon;
              const isCompleted = currentStep > step.id;
              const isCurrent = currentStep === step.id;

              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                      isCompleted 
                        ? 'bg-emerald-600 text-white' 
                        : isCurrent 
                        ? 'bg-blue-600 text-white ring-4 ring-blue-100' 
                        : 'bg-slate-200 text-slate-500'
                    }`}>
                      {isCompleted ? <Check className="h-5 w-5" /> : <IconComponent className="h-5 w-5" />}
                    </div>
                    <span className={`text-xs font-semibold mt-2 whitespace-nowrap ${isCurrent ? 'text-blue-600' : 'text-slate-500'}`}>
                      {step.title}
                    </span>
                  </div>

                  {idx < STEPS.length - 1 && (
                    <div className={`h-1 flex-1 mx-2 rounded ${isCompleted ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Wizard Form Body */}
        {isPublished ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-md text-center max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">
              Event {formData.status === 'published' ? 'Published Successfully!' : 'Saved as Draft!'}
            </h2>
            <p className="text-slate-600 text-sm mt-2">
              Your event <strong>&quot;{formData.title || 'Untitled Event'}&quot;</strong> has been created and configured.
            </p>

            <div className="mt-8 bg-slate-50 p-4 rounded-xl border border-slate-200 text-left space-y-2 text-xs text-slate-600">
              <p><strong>Category:</strong> {formData.categorySlug}</p>
              <p><strong>Event Format:</strong> {formData.eventType.toUpperCase()}</p>
              <p><strong>Tickets Configured:</strong> {formData.ticketTypes.length} ticket tiers</p>
              <p><strong>Custom Fields:</strong> {formData.registrationFields.length} registration questions</p>
            </div>

            <div className="mt-8 flex justify-center gap-4">
              <Link href="/events" className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition">
                View All Public Events
              </Link>
              <button 
                onClick={() => { setIsPublished(false); setCurrentStep(1); setFormData(initialFormData); }}
                className="rounded-xl border border-slate-300 px-6 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
              >
                Create Another Event
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-slate-900">Step 1: Basic Information</h2>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Event Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={e => updateField('title', e.target.value)}
                    placeholder="e.g. Asia AI & FinTech Developers Conclave 2026"
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Category *</label>
                    <select
                      value={formData.categorySlug}
                      onChange={e => updateField('categorySlug', e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
                    >
                      {mockCategories.map(cat => (
                        <option key={cat.id} value={cat.slug}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Organizer Contact Email</label>
                    <input
                      type="email"
                      value={formData.organizerEmail}
                      onChange={e => updateField('organizerEmail', e.target.value)}
                      placeholder="events@yourcompany.com"
                      className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Short Tagline / Summary</label>
                  <input
                    type="text"
                    value={formData.shortDescription}
                    onChange={e => updateField('shortDescription', e.target.value)}
                    placeholder="Brief 1-line overview of the event"
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Full Description</label>
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={e => updateField('description', e.target.value)}
                    placeholder="Detailed agenda, who should attend, prerequisites..."
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>

                {/* Image Upload mock simulation */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Event Banner Image URL (AWS S3/Cloudflare R2 mock)</label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={formData.bannerUrl}
                      onChange={e => updateField('bannerUrl', e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div className="mt-2 flex gap-2">
                    <span className="text-xs text-slate-500 self-center">Quick sample presets:</span>
                    <button
                      type="button"
                      onClick={() => setSampleBanner('https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80')}
                      className="text-xs bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg text-slate-700"
                    >
                      Tech Summit
                    </button>
                    <button
                      type="button"
                      onClick={() => setSampleBanner('https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80')}
                      className="text-xs bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg text-slate-700"
                    >
                      AI Hackathon
                    </button>
                  </div>
                  {formData.bannerUrl && (
                    <div className="mt-4 rounded-xl overflow-hidden h-40 border border-slate-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={formData.bannerUrl} alt="Preview" className="h-full w-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Date & Time */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-slate-900">Step 2: Date & Time Configuration</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Start Date *</label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={e => updateField('startDate', e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Start Time</label>
                    <input
                      type="time"
                      value={formData.startTime}
                      onChange={e => updateField('startTime', e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">End Date *</label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={e => updateField('endDate', e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">End Time</label>
                    <input
                      type="time"
                      value={formData.endTime}
                      onChange={e => updateField('endTime', e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Timezone</label>
                  <select
                    value={formData.timezone}
                    onChange={e => updateField('timezone', e.target.value)}
                    className="w-full sm:w-1/2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
                  >
                    <option value="IST">India Standard Time (IST - UTC+05:30)</option>
                    <option value="UTC">Coordinated Universal Time (UTC)</option>
                    <option value="EST">Eastern Standard Time (EST)</option>
                    <option value="PST">Pacific Standard Time (PST)</option>
                  </select>
                </div>
              </div>
            )}

            {/* Step 3: Venue */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-slate-900">Step 3: Venue & Location</h2>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Event Format</label>
                  <div className="flex gap-4">
                    {[
                      { id: 'physical', label: 'Physical In-Person' },
                      { id: 'online', label: 'Online / Virtual' },
                      { id: 'hybrid', label: 'Hybrid (Both)' }
                    ].map(fmt => (
                      <label key={fmt.id} className={`flex-1 p-4 rounded-xl border cursor-pointer text-center font-semibold text-sm transition ${
                        formData.eventType === fmt.id ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600'
                      }`}>
                        <input
                          type="radio"
                          name="eventType"
                          value={fmt.id}
                          checked={formData.eventType === fmt.id}
                          onChange={() => updateField('eventType', fmt.id as any)}
                          className="sr-only"
                        />
                        {fmt.label}
                      </label>
                    ))}
                  </div>
                </div>

                {(formData.eventType === 'physical' || formData.eventType === 'hybrid') && (
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Venue Name *</label>
                      <input
                        type="text"
                        value={formData.venueName}
                        onChange={e => updateField('venueName', e.target.value)}
                        placeholder="e.g. Jio World Convention Centre"
                        className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Address</label>
                        <input
                          type="text"
                          value={formData.address}
                          onChange={e => updateField('address', e.target.value)}
                          placeholder="Street address..."
                          className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">City *</label>
                        <input
                          type="text"
                          value={formData.city}
                          onChange={e => updateField('city', e.target.value)}
                          placeholder="e.g. Mumbai, Bengaluru, Hyderabad"
                          className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {(formData.eventType === 'online' || formData.eventType === 'hybrid') && (
                  <div className="pt-4 border-t border-slate-100">
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Online Stream / Zoom Link</label>
                    <input
                      type="text"
                      value={formData.onlineUrl}
                      onChange={e => updateField('onlineUrl', e.target.value)}
                      placeholder="https://zoom.us/j/12345678"
                      className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Tickets Configuration */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Step 4: Ticket Configuration</h2>
                    <p className="text-xs text-slate-500">Configure free, paid, VIP, or early-bird ticket tiers</p>
                  </div>
                  <button
                    type="button"
                    onClick={addTicketType}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 text-blue-600 px-3.5 py-2 text-xs font-semibold border border-blue-200 hover:bg-blue-100"
                  >
                    <Plus className="h-4 w-4" /> Add Ticket Tier
                  </button>
                </div>

                <div className="space-y-4">
                  {formData.ticketTypes.map((tkt, idx) => (
                    <div key={tkt.id} className="p-5 rounded-xl border border-slate-200 bg-slate-50 space-y-4">
                      <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                        <span className="font-bold text-slate-800 text-sm">Ticket Tier #{idx + 1}</span>
                        {formData.ticketTypes.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeTicketType(tkt.id)}
                            className="text-red-500 hover:text-red-700 text-xs flex items-center gap-1"
                          >
                            <Trash2 className="h-4 w-4" /> Remove
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">Ticket Name</label>
                          <input
                            type="text"
                            value={tkt.name}
                            onChange={e => {
                              const updated = [...formData.ticketTypes];
                              updated[idx].name = e.target.value;
                              updateField('ticketTypes', updated);
                            }}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">Price (₹, 0 for Free)</label>
                          <input
                            type="number"
                            value={tkt.price}
                            onChange={e => {
                              const updated = [...formData.ticketTypes];
                              updated[idx].price = Number(e.target.value);
                              updateField('ticketTypes', updated);
                            }}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">Total Quantity Available</label>
                          <input
                            type="number"
                            value={tkt.quantity}
                            onChange={e => {
                              const updated = [...formData.ticketTypes];
                              updated[idx].quantity = Number(e.target.value);
                              updateField('ticketTypes', updated);
                            }}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 5: Custom Registration Form Builder */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Step 5: Custom Registration Form</h2>
                    <p className="text-xs text-slate-500">Collect extra attendee details during checkout</p>
                  </div>
                  <button
                    type="button"
                    onClick={addRegistrationField}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 text-blue-600 px-3.5 py-2 text-xs font-semibold border border-blue-200 hover:bg-blue-100"
                  >
                    <Plus className="h-4 w-4" /> Add Field
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.registrationFields.map((rf, idx) => (
                    <div key={rf.id} className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50">
                      <div className="flex-1">
                        <label className="block text-xs font-semibold text-slate-500">Field Question Label</label>
                        <input
                          type="text"
                          value={rf.label}
                          onChange={e => {
                            const updated = [...formData.registrationFields];
                            updated[idx].label = e.target.value;
                            updateField('registrationFields', updated);
                          }}
                          className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium"
                        />
                      </div>

                      <div className="w-36">
                        <label className="block text-xs font-semibold text-slate-500">Input Type</label>
                        <select
                          value={rf.fieldType}
                          onChange={e => {
                            const updated = [...formData.registrationFields];
                            updated[idx].fieldType = e.target.value as any;
                            updateField('registrationFields', updated);
                          }}
                          className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs"
                        >
                          <option value="text">Text Input</option>
                          <option value="email">Email</option>
                          <option value="phone">Phone Number</option>
                          <option value="select">Dropdown Select</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-2 pt-4">
                        <input
                          type="checkbox"
                          id={`req-${rf.id}`}
                          checked={rf.required}
                          onChange={e => {
                            const updated = [...formData.registrationFields];
                            updated[idx].required = e.target.checked;
                            updateField('registrationFields', updated);
                          }}
                        />
                        <label htmlFor={`req-${rf.id}`} className="text-xs font-medium text-slate-600">Required</label>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeRegistrationField(rf.id)}
                        className="text-red-500 hover:text-red-700 text-xs pt-4"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 6: Payment Settings */}
            {currentStep === 6 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-slate-900">Step 6: Payment & Platform Fee Settings</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Applicable GST / Tax (%)</label>
                    <input
                      type="number"
                      value={formData.taxPercentage}
                      onChange={e => updateField('taxPercentage', Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">ePay Platform Fee (%)</label>
                    <input
                      type="number"
                      value={formData.platformFeePercentage}
                      onChange={e => updateField('platformFeePercentage', Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-blue-800 leading-relaxed">
                    <strong>Payment Gateway Note:</strong> Payout settlement records will be generated automatically in the Organizer Dashboard post ticket sales.
                  </div>
                </div>
              </div>
            )}

            {/* Step 7: Publish & Review */}
            {currentStep === 7 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-slate-900">Step 7: Final Review & Publish</h2>
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-3 text-sm">
                  <p><strong>Title:</strong> {formData.title || 'Untitled Event'}</p>
                  <p><strong>Category:</strong> {formData.categorySlug}</p>
                  <p><strong>Date:</strong> {formData.startDate || 'Not specified'} to {formData.endDate || 'Not specified'}</p>
                  <p><strong>Location / Venue:</strong> {formData.venueName || 'Virtual Online'}, {formData.city}</p>
                  <p><strong>Ticket Tiers:</strong> {formData.ticketTypes.map(t => `${t.name} (₹${t.price})`).join(', ')}</p>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => handlePublish('published')}
                    className="flex-1 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-700 transition"
                  >
                    Publish Event Live Now
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePublish('draft')}
                    className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
                  >
                    Save as Draft
                  </button>
                </div>
              </div>
            )}

            {/* Navigation controls */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentStep === 1}
                className={`inline-flex items-center gap-1 text-sm font-semibold rounded-lg px-4 py-2 border transition ${
                  currentStep === 1 ? 'opacity-40 cursor-not-allowed border-slate-200 text-slate-400' : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </button>

              {currentStep < 7 && (
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center gap-1 text-sm font-semibold rounded-lg bg-blue-600 text-white px-5 py-2 hover:bg-blue-700 transition"
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
