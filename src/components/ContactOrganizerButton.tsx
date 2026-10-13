'use client';

import React from 'react';
import { 
  Building2, Mail
} from 'lucide-react';

export function ContactOrganizerButton({ orgName, email }: { orgName: string; email?: string }) {
  return (
    <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-8 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center font-bold text-white text-xl shadow-lg">
          <Building2 className="h-7 w-7" />
        </div>
        <div>
          <span className="text-xs text-blue-300 font-bold uppercase tracking-wider">Organized & Managed By</span>
          <h3 className="text-xl font-bold text-white mt-0.5">{orgName}</h3>
          <p className="text-xs text-slate-300 mt-1 flex items-center gap-2">
            <Mail className="h-3.5 w-3.5 text-blue-400" /> {email || 'contact@organizer.com'}
          </p>
        </div>
      </div>

      <button
        onClick={() => alert(`Contacting ${orgName}... Email: ${email || 'contact@organizer.com'}`)}
        className="rounded-xl bg-white text-slate-900 px-5 py-2.5 font-bold text-xs hover:bg-slate-100 transition shadow shrink-0"
      >
        Contact Organizer
      </button>
    </div>
  );
}

