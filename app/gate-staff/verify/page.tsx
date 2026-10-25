'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { GateMobileShell } from '@/components/gate-staff/GateMobileShell';

function GateStaffVerificationPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const statusParam = searchParams.get('status') || 'valid';

  // State to toggle between the 4 verification screens:
  // - 'valid': 06 · Guest verification.png
  // - 'not_confirmed': 06 · Guest verification-1.png
  // - 'already_checked_in': 06 · Guest verification-2.png
  // - 'unverified': 06 · Guest verification-3.png
  type VerificationType =
    | 'valid'
    | 'not_confirmed'
    | 'already_checked_in'
    | 'unverified';
  const verificationTypes: readonly VerificationType[] = [
    'valid',
    'not_confirmed',
    'already_checked_in',
    'unverified',
  ];
  const initialVerificationType: VerificationType = verificationTypes.includes(
    statusParam as VerificationType,
  )
    ? (statusParam as VerificationType)
    : 'valid';
  const [verificationType, setVerificationType] =
    React.useState<VerificationType>(initialVerificationType);
  const [guest, setGuest] = React.useState({
    name: 'Guest',
    guestType: 'General',
    partySize: 1,
    rsvpStatus: 'Confirmed',
    gate: 'Gate 1',
    checkedInAt: '',
  });

  React.useEffect(() => {
    const stored = sessionStorage.getItem('gate-last-guest');
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as Partial<typeof guest>;
      setGuest((current) => ({ ...current, ...parsed }));
    } catch {
      sessionStorage.removeItem('gate-last-guest');
    }
  }, []);

  return (
    <GateMobileShell showHeader={false} activeTab="checkin">
      <div className="space-y-4 pt-1">
        
        {/* Top Back Header */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/gate-staff/scanner')}
            aria-label="Back"
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#1F1916] hover:bg-[#EFEAE2] transition-colors"
          >
            <ArrowLeft className="w-5 h-5 stroke-[1.8]" />
          </button>
          <h1 className="font-serif text-2xl font-medium tracking-tight text-[#1F1916]">
            Guest Verification
          </h1>
        </div>

        {/* Guest Details White Card */}
        <div className="bg-white rounded-3xl p-5 border border-[#EAE5DC] shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-3.5">
          <h2 className="font-semibold text-lg text-[#1F1916]">
            {guest.name}
          </h2>

          <div className="space-y-1">
            <span className="text-xs text-[#8A7E75] block">Guest Type</span>
            <span className="text-sm font-semibold text-[#1F1916] block">
              {guest.guestType}
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-[#8A7E75] block">Party Size</span>
            <span className="text-sm font-semibold text-[#1F1916] block">
              {guest.partySize}
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-[#8A7E75] block">RSVP Status</span>
            <span className="text-sm font-semibold text-[#1F1916] block">
              {guest.rsvpStatus}
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-[#8A7E75] block">Invitation</span>
            <span className="text-sm font-semibold text-[#1F1916] block">
              Valid
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-[#8A7E75] block">Seating</span>
            <span className="text-sm font-semibold text-[#1F1916] block">
              Not assigned
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-[#8A7E75] block">Seats</span>
            <span className="text-sm font-semibold text-[#1F1916] block">
              Not assigned
            </span>
          </div>
        </div>

        {/* Verification Status Cards */}

        {/* Case 1: Valid & Ready for Check-in */}
        {verificationType === 'valid' && (
          <div className="space-y-4">
            <div className="bg-[#FAF8F5] rounded-2xl p-4 border border-[#ECE7DE] space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2A6E3B] inline-block" />
                <span className="text-xs font-semibold text-[#2A6E3B]">
                  Ready for Check-in
                </span>
              </div>
              <p className="text-xs text-[#60554E] leading-relaxed">
                This guest has a valid invitation and is eligible for entry.
              </p>
            </div>

            <div className="space-y-2.5 pt-1">
              <button
                type="button"
                onClick={() => router.push('/gate-staff/success')}
                className="w-full py-4 px-4 bg-[#7A3B18] hover:bg-[#683214] text-white rounded-2xl text-base font-medium transition-colors shadow-xs"
              >
                Check In Guest
              </button>
              <button
                type="button"
                onClick={() => router.push('/gate-staff/scanner')}
                className="w-full py-4 px-4 bg-[#211612] hover:bg-[#34241D] text-white rounded-2xl text-base font-medium transition-colors shadow-xs"
              >
                Cancel / Back to Scan
              </button>
            </div>
          </div>
        )}

        {/* Case 2: RSVP Not Confirmed (Mockup 06-1) */}
        {verificationType === 'not_confirmed' && (
          <div className="space-y-4">
            <div className="bg-[#FAF8F5] rounded-2xl p-4 border border-[#ECE7DE] space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2A6E3B] inline-block" />
                <span className="text-xs font-semibold text-[#2A6E3B]">
                  Ready for Check-in
                </span>
              </div>
              <p className="text-xs text-[#60554E] leading-relaxed">
                This guest has a valid invitation and is eligible for entry.
              </p>
            </div>

            <div className="bg-[#FFF8F0] rounded-2xl p-4 border border-[#F5E2CC] space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#B04A26] inline-block" />
                <span className="text-xs font-semibold text-[#B04A26]">
                  RSVP Not Confirmed
                </span>
              </div>
              <p className="text-xs text-[#60554E] leading-relaxed">
                This guest has a valid invitation, but their RSVP has not been confirmed. Organizer approval may be required before entry.
              </p>

              <div className="space-y-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => alert('Dialing Event Lead / Host')}
                  className="w-full py-3.5 px-4 bg-[#211612] hover:bg-[#34241D] text-white rounded-2xl text-sm font-medium transition-colors shadow-xs"
                >
                  Contact Organizer
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/gate-staff/success')}
                  className="w-full py-3.5 px-4 bg-[#7A3B18] hover:bg-[#683214] text-white rounded-2xl text-sm font-medium transition-colors shadow-xs"
                >
                  Continue with Authorization
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Case 3: Already Checked In (Mockup 06-2) */}
        {verificationType === 'already_checked_in' && (
          <div className="space-y-4">
            <div className="bg-[#FAF8F5] rounded-2xl p-4 border border-[#ECE7DE] space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2A6E3B] inline-block" />
                <span className="text-xs font-semibold text-[#2A6E3B]">
                  Ready for Check-in
                </span>
              </div>
              <p className="text-xs text-[#60554E] leading-relaxed">
                This guest has a valid invitation and is eligible for entry.
              </p>
            </div>

            <div className="bg-[#FFF8F0] rounded-2xl p-4 border border-[#F5E2CC] space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#B04A26] inline-block" />
                <span className="text-xs font-semibold text-[#B04A26]">
                  Already Checked In
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-[#8A7E75] block">Check-in time</span>
                  <span className="font-semibold text-[#1F1916]">{guest.checkedInAt ? new Date(guest.checkedInAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : 'Earlier today'}</span>
                </div>
                <div>
                  <span className="text-[#8A7E75] block">Gate</span>
                  <span className="font-semibold text-[#1F1916]">{guest.gate}</span>
                </div>
                <div>
                  <span className="text-[#8A7E75] block">Staff member</span>
                  <span className="font-semibold text-[#1F1916]">{guest.name}</span>
                </div>
              </div>

              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  disabled
                  className="w-full py-3.5 px-4 bg-[#DCC8BA] text-[#8C7A6E] rounded-2xl text-sm font-medium cursor-not-allowed"
                >
                  Check In Guest
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/gate-staff/scanner')}
                  className="w-full py-3.5 px-4 bg-[#211612] hover:bg-[#34241D] text-white rounded-2xl text-sm font-medium transition-colors shadow-xs"
                >
                  Back to Scan
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Case 4: Guest could not be verified (Mockup 06-3) */}
        {verificationType === 'unverified' && (
          <div className="space-y-4">
            <div className="bg-[#FAF8F5] rounded-2xl p-4 border border-[#ECE7DE] space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2A6E3B] inline-block" />
                <span className="text-xs font-semibold text-[#2A6E3B]">
                  Ready for Check-in
                </span>
              </div>
              <p className="text-xs text-[#60554E] leading-relaxed">
                This guest has a valid invitation and is eligible for entry.
              </p>
            </div>

            <div className="bg-[#FFF8F0] rounded-2xl p-4 border border-[#F5E2CC] space-y-3">
              <h3 className="font-semibold text-sm text-[#1F1916]">
                Guest could not be verified
              </h3>
              <p className="text-xs text-[#60554E]">
                Retry the scan or search the guest list.
              </p>

              <div className="space-y-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => router.push('/gate-staff/scanner')}
                  className="w-full py-3.5 px-4 bg-[#211612] hover:bg-[#34241D] text-white rounded-2xl text-sm font-medium transition-colors shadow-xs"
                >
                  Retry Scan
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/gate-staff/search')}
                  className="w-full py-3.5 px-4 bg-white border border-[#D5CFC7] hover:bg-[#FAF8F5] text-[#1F1916] rounded-2xl text-sm font-medium transition-colors shadow-xs"
                >
                  Search Guest
                </button>
              </div>
            </div>
          </div>
        )}

        {/* State preview switcher pill buttons */}
        <div className="pt-2 flex flex-wrap gap-1.5 border-t border-[#ECE7DE]">
          <span className="text-[10px] text-[#80756C] w-full block">Preview verification state:</span>
          <button
            type="button"
            onClick={() => setVerificationType('valid')}
            className={`px-2 py-0.5 text-[11px] rounded-lg border ${
              verificationType === 'valid' ? 'bg-[#7A3B18] text-white' : 'bg-white text-[#5C534D]'
            }`}
          >
            Valid
          </button>
          <button
            type="button"
            onClick={() => setVerificationType('not_confirmed')}
            className={`px-2 py-0.5 text-[11px] rounded-lg border ${
              verificationType === 'not_confirmed' ? 'bg-[#7A3B18] text-white' : 'bg-white text-[#5C534D]'
            }`}
          >
            RSVP Pending
          </button>
          <button
            type="button"
            onClick={() => setVerificationType('already_checked_in')}
            className={`px-2 py-0.5 text-[11px] rounded-lg border ${
              verificationType === 'already_checked_in' ? 'bg-[#7A3B18] text-white' : 'bg-white text-[#5C534D]'
            }`}
          >
            Already Checked
          </button>
          <button
            type="button"
            onClick={() => setVerificationType('unverified')}
            className={`px-2 py-0.5 text-[11px] rounded-lg border ${
              verificationType === 'unverified' ? 'bg-[#7A3B18] text-white' : 'bg-white text-[#5C534D]'
            }`}
          >
            Unverified
          </button>
        </div>

      </div>
    </GateMobileShell>
  );
}

export default function GateStaffVerificationPage() {
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
      <GateStaffVerificationPageInner />
    </React.Suspense>
  );
}
