'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { MapPin } from 'lucide-react';
import { GateMobileShell } from '@/components/gate-staff/GateMobileShell';
import { INITIAL_GATE_EVENTS } from '@/lib/gate-staff-data';

export default function GateStaffMyEventsPage() {
  const router = useRouter();
  const events = INITIAL_GATE_EVENTS;

  return (
    <GateMobileShell showHeader={true} activeTab="events">
      {/* Title & Subtitle matching 03 · Assigned events.png */}
      <div className="space-y-1 mb-5">
        <h1 className="font-serif text-3xl font-medium tracking-tight text-[#1F1916]">
          My Events
        </h1>
        <p className="text-sm text-[#70665F]">
          View your assigned events and manage guest check-in.
        </p>
      </div>

      {/* Events List */}
      <div className="space-y-4">
        {events.map((evt) => (
          <div
            key={evt.id}
            className="bg-white rounded-3xl p-5 border border-[#EAE5DC] shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-4"
          >
            {/* Status indicator */}
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#B04A26] inline-block" />
              <span className="text-sm font-medium text-[#7A3B18]">
                {evt.status}
              </span>
            </div>

            {/* Event Title */}
            <h2 className="font-semibold text-lg text-[#1F1916] leading-snug">
              {evt.title}
            </h2>

            {/* Date Details */}
            <div className="space-y-1">
              <span className="text-xs text-[#8A7E75] block">Date</span>
              <span className="text-sm font-medium text-[#2C2420] block">
                {evt.date}
              </span>
            </div>

            {/* Gate Location */}
            <div className="flex items-center gap-2 text-sm text-[#4A403A]">
              <MapPin className="w-4 h-4 text-[#7A3B18] stroke-[2]" />
              <span className="font-normal">{evt.gate}</span>
            </div>

            {/* Organizer */}
            {evt.organizer && (
              <p className="text-xs text-[#8A7E75]">
                Organizer: {evt.organizer}
              </p>
            )}

            {/* Open Event CTA button */}
            <button
              type="button"
              onClick={() => router.push(`/gate-staff/checkin?eventId=${evt.id}`)}
              className="w-full py-3.5 px-4 bg-[#211612] hover:bg-[#34241D] text-white rounded-2xl text-sm font-medium transition-colors shadow-xs active:scale-[0.99]"
            >
              Open Event
            </button>
          </div>
        ))}
      </div>
    </GateMobileShell>
  );
}
