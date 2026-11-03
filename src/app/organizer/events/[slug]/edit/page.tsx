'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function OrganizerEventEditRedirect() {
  const params = useParams();
  const router = useRouter();

  React.useEffect(() => {
    const slug = params?.slug as string;
    if (slug) {
      router.replace(`/create-event?edit=${slug}`);
    } else {
      router.replace('/organizer/dashboard');
    }
  }, [params, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAF9]">
      <div className="text-center space-y-3">
        <div className="h-8 w-8 border-3 border-[#0F766E] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-bold text-slate-700">Opening Event Editor...</p>
      </div>
    </div>
  );
}

