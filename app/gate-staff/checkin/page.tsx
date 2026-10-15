'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { GateMobileShell } from '@/components/gate-staff/GateMobileShell';
import { INITIAL_GATE_EVENTS, INITIAL_GUESTS } from '@/lib/gate-staff-data';

function GateStaffCheckinHomePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get('eventId') || 'evt-1';

  const event = INITIAL_GATE_EVENTS.find((e) => e.id === eventId) || INITIAL_GATE_EVENTS[0];
  const recentCheckins = INITIAL_GUESTS.filter((g) => g.checkInStatus === 'Checked In');

  const expected = event.expected;
  const checkedIn = event.checkedIn;
  const remaining = expected - checkedIn;

  return (
    <GateMobileShell showHeader={false} activeTab="checkin">
      <div className="space-y-6 pt-1">
        {/* Top Back Link */}
        <Link
          href="/gate-staff"
          className="inline-flex items-center gap-1 text-sm font-medium text-[#7A3B18] hover:underline"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>My Events</span>
        </Link>

        {/* Event Header */}
        <div className="space-y-1">
          <h1 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-[#1F1916] leading-snug">
            {event.title}
          </h1>
          <p className="text-xs sm:text-sm text-[#70665F]">
            {event.date} · {event.gate}
          </p>
        </div>

        {/* Live Pill */}
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#2A6E3B] inline-block animate-pulse" />
          <span className="text-xs font-semibold text-[#2A6E3B]">
            Live
          </span>
        </div>

        {/* 3 Metric Cards matching mockup 04 */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="bg-white rounded-2xl p-3 border border-[#EAE5DC] shadow-[0_2px_6px_rgba(0,0,0,0.02)]">
            <span className="text-[11px] text-[#80756C] block font-normal leading-tight mb-2">
              Expected Guests
            </span>
            <span className="font-serif text-2xl font-semibold text-[#1F1916] block">
              {expected}
            </span>
          </div>

          <div className="bg-white rounded-2xl p-3 border border-[#EAE5DC] shadow-[0_2px_6px_rgba(0,0,0,0.02)]">
            <span className="text-[11px] text-[#80756C] block font-normal leading-tight mb-2">
              Checked In
            </span>
            <span className="font-serif text-2xl font-semibold text-[#1F1916] block">
              {checkedIn}
            </span>
          </div>

          <div className="bg-white rounded-2xl p-3 border border-[#EAE5DC] shadow-[0_2px_6px_rgba(0,0,0,0.02)]">
            <span className="text-[11px] text-[#80756C] block font-normal leading-tight mb-2">
              Remaining
            </span>
            <span className="font-serif text-2xl font-semibold text-[#1F1916] block">
              {remaining}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-1">
          {/* Brown Button: Scan Guest QR */}
          <button
            type="button"
            onClick={() => router.push('/gate-staff/scanner')}
            className="w-full py-4 px-4 bg-[#7A3B18] hover:bg-[#683214] active:scale-[0.99] text-white rounded-2xl text-base font-medium transition-colors shadow-xs text-center"
          >
            Scan Guest QR
          </button>

          {/* Dark Charcoal Button: Search Guest */}
          <button
            type="button"
            onClick={() => router.push('/gate-staff/search')}
            className="w-full py-4 px-4 bg-[#211612] hover:bg-[#34241D] active:scale-[0.99] text-white rounded-2xl text-base font-medium transition-colors shadow-xs text-center"
          >
            Search Guest
          </button>
        </div>

        {/* Recent Check-ins */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm text-[#1F1916]">
              Recent Check-ins
            </h3>
            <Link
              href="/gate-staff/history"
              className="text-xs font-medium text-[#7A3B18] hover:underline"
            >
              Check-in History
            </Link>
          </div>

          <div className="space-y-2.5">
            {recentCheckins.map((guest) => (
              <div
                key={guest.id}
                className="bg-white rounded-2xl p-4 border border-[#EAE5DC] shadow-[0_2px_6px_rgba(0,0,0,0.02)] space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm text-[#1F1916]">
                    {guest.name}
                  </h4>
                </div>
                <p className="text-xs text-[#8A7E75]">
                  {guest.checkInTime}
                </p>
                <div className="flex items-center gap-1.5 pt-0.5">
                  <span className="w-2 h-2 rounded-full bg-[#2A6E3B] inline-block" />
                  <span className="text-xs text-[#2A6E3B] font-medium">
                    Checked In
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </GateMobileShell>
  );
}

export default function GateStaffCheckinHomePage() {
  return (
    <React.Suspense
      fallback={
        <GateMobileShell showHeader={false} activeTab="checkin">
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-[#703816] border-t-transparent animate-spin" />
          </div>
        </GateMobileShell>
      }
    >
      <GateStaffCheckinHomePageInner />
    </React.Suspense>
  );
}
