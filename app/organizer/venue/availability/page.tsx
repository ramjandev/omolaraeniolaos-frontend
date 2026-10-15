'use client';

import * as React from 'react';
import { Save } from 'lucide-react';
import { AppShell } from '@/components/shell/AppShell';
import { MOCK_VENUE_SPACES } from '@/lib/mock-data/venue';

export default function VenueAvailabilityPage() {
  return (
    <AppShell currentRole="organizer_venue">
      <div className="space-y-6 w-full pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1F140E] tracking-tight">
              Venue Availability & Operating Hours
            </h1>
            <p className="text-xs sm:text-sm text-[#71717A] mt-1 font-sans">
              Configure daily operating hours, blackout dates, and buffer periods between bookings.
            </p>
          </div>

          <button
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1F140E] text-white hover:bg-[#342217] text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Schedules</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_VENUE_SPACES.map((space) => (
            <div
              key={space.id}
              className="p-6 rounded-2xl bg-white border border-[#EFECE6] shadow-2xs space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-[#1F140E]">{space.name}</h3>
                  <p className="text-xs text-[#8C7A6B]">{space.capacity} cap. · {space.type}</p>
                </div>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    space.status === 'Occupied'
                      ? 'bg-[#1F140E] text-white'
                      : 'bg-emerald-50 text-emerald-700'
                  }`}
                >
                  {space.status}
                </span>
              </div>

              <div className="space-y-2 pt-2 border-t border-[#F4F1EB] text-xs">
                <div className="flex items-center justify-between text-[#71717A]">
                  <span>Daily Hours</span>
                  <span className="font-semibold text-[#1F140E]">08:00 AM — 11:00 PM</span>
                </div>
                <div className="flex items-center justify-between text-[#71717A]">
                  <span>Turnaround Buffer</span>
                  <span className="font-semibold text-[#1F140E]">3 Hours</span>
                </div>
                <div className="flex items-center justify-between text-[#71717A]">
                  <span>Load-in Access</span>
                  <span className="font-semibold text-[#1F140E]">24h Prior</span>
                </div>
              </div>

              <div className="pt-2">
                <div className="flex items-center justify-between text-[11px] text-[#8C7A6B] mb-1">
                  <span>Current Utilization</span>
                  <span className="font-semibold text-[#1F140E]">{space.utilization}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#EFECE6] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#6E3B1C]"
                    style={{ width: `${space.utilization}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
