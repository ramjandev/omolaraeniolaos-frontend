'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { GateMobileShell } from '@/components/gate-staff/GateMobileShell';
import { getGateWorkspace, type GateWorkspace } from '@/lib/api/platform';

function formatWhen(value?: string) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function GateStaffCheckinHomePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get('eventId') || '';
  const [workspace, setWorkspace] = React.useState<GateWorkspace | null>(null);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    let mounted = true;
    getGateWorkspace()
      .then((data) => {
        if (mounted) setWorkspace(data);
      })
      .catch(() => {
        if (mounted) setError('Sign in as gate staff to open this event.');
      });
    return () => {
      mounted = false;
    };
  }, []);

  const event = workspace?.events.find((item) => item.id === eventId) || workspace?.events[0];
  const recentCheckins = (workspace?.scans || []).filter(
    (scan) => scan.status === 'VALID' && (!event || scan.eventId === event.id),
  );
  const expected = event?.expected ?? 0;
  const checkedIn = event?.checkedIn ?? 0;
  const remaining = Math.max(0, expected - checkedIn);

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
            {event?.title || 'No assigned event'}
          </h1>
          <p className="text-xs sm:text-sm text-[#70665F]">
            {error || (event ? `${formatWhen(event.startDate)} · ${event.gate}` : 'Ask your organizer to assign you to a gate.')}
          </p>
        </div>

        {/* Live Pill */}
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full inline-block ${event?.status === 'Live' ? 'bg-[#2A6E3B] animate-pulse' : 'bg-[#8C4B24]'}`} />
          <span className={`text-xs font-semibold ${event?.status === 'Live' ? 'text-[#2A6E3B]' : 'text-[#8C4B24]'}`}>
            {event?.status || 'Upcoming'}
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
            onClick={() => router.push(`/gate-staff/scanner?eventId=${event?.id || ''}&gate=${encodeURIComponent(event?.gate || 'Gate 1')}&staffId=${workspace?.staff.profileId || ''}`)}
            className="w-full py-4 px-4 bg-[#7A3B18] hover:bg-[#683214] active:scale-[0.99] text-white rounded-2xl text-base font-medium transition-colors shadow-xs text-center"
          >
            Scan Guest QR
          </button>

          {/* Dark Charcoal Button: Search Guest */}
          <button
            type="button"
            onClick={() => router.push(`/gate-staff/search?eventId=${event?.id || ''}`)}
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
              href={`/gate-staff/history?eventId=${event?.id || ''}`}
              className="text-xs font-medium text-[#7A3B18] hover:underline"
            >
              Check-in History
            </Link>
          </div>

          <div className="space-y-2.5">
            {recentCheckins.length === 0 && (
              <p className="text-xs text-[#70665F]">No guests have been checked in at your gate yet.</p>
            )}
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
                  {formatWhen(guest.scannedAt)}
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
