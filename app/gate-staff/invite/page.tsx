'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

const API_ROOT = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

interface InvitationDetails {
  organizerName: string;
  eventTitle: string;
  eventDate: string | null;
  gateNumber: string;
  role: string;
  email: string;
  staffName: string;
}

function formatEventDate(value: string | null) {
  if (!value) return 'Date not set';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Date not set';
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

function GateStaffInvitation() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [details, setDetails] = React.useState<InvitationDetails | null>(null);
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(Boolean(token));

  React.useEffect(() => {
    if (!token) {
      setLoading(false);
      setError('Open the invitation link from your email.');
      return;
    }
    let mounted = true;
    async function load() {
      try {
        const response = await fetch(`${API_ROOT}/individual/gate/invitation?token=${encodeURIComponent(token)}`, {
          cache: 'no-store',
        });
        const json = await response.json();
        if (!response.ok) {
          throw new Error(json?.message || 'This invitation link is invalid or expired');
        }
        if (mounted) setDetails(json.data || json);
      } catch (loadError) {
        if (mounted) setError(loadError instanceof Error ? loadError.message : 'This invitation could not be opened');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    void load();
    return () => {
      mounted = false;
    };
  }, [token]);

  const loginHref = () => {
    const params = new URLSearchParams();
    if (details?.email) params.set('email', details.email);
    if (token) params.set('token', token);
    const query = params.toString();
    return query ? `/gate-staff/login?${query}` : '/gate-staff/login';
  };

  const accept = () => {
    router.push(loginHref());
  };

  return (
    <div className="min-h-screen bg-[#F0EDE6] sm:py-6 flex justify-center items-start">
      <div className="w-full max-w-[430px] min-h-screen sm:min-h-[880px] bg-[#FBFAF6] sm:rounded-[36px] sm:shadow-2xl flex flex-col p-6 sm:border sm:border-[#E8E4DC]">
        <div className="flex items-center gap-2.5 mb-6 pt-1">
          <div className="w-8 h-8 rounded-lg bg-[#7A3B18] flex items-center justify-center text-white font-serif font-bold text-base shadow-xs">
            M
          </div>
          <span className="font-serif font-semibold text-lg text-[#1F1916]">McEniesVite</span>
        </div>

        <div className="bg-white rounded-[32px] p-6 border border-[#EAE5DC] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-6">
          <div className="space-y-2">
            <h1 className="font-serif text-3xl font-medium tracking-tight text-[#1F1916]">
              You&apos;re Invited To Join An Event
            </h1>
            <p className="text-sm text-[#70665F] leading-relaxed">
              {details
                ? `${details.organizerName} has invited you to help manage guest entry at their event.`
                : 'Your organizer has invited you to help manage guest entry at their event.'}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#EAE5DC] space-y-4">
            <h2 className="font-semibold text-base text-[#1F1916]">
              {loading ? 'Loading invitation…' : details?.eventTitle || 'Invitation not available'}
            </h2>
            <div className="space-y-0.5">
              <span className="text-xs text-[#8A7E75] block">Date</span>
              <span className="text-sm font-semibold text-[#1F1916] block">{formatEventDate(details?.eventDate || null)}</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-xs text-[#8A7E75] block">Assigned gate</span>
              <span className="text-sm font-semibold text-[#1F1916] block">{details?.gateNumber || 'Not assigned yet'}</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-xs text-[#8A7E75] block">Role</span>
              <span className="text-sm font-semibold text-[#1F1916] block">{details?.role || 'Gate Staff'}</span>
            </div>
            {error && <p className="text-xs text-[#C2410C]">{error}</p>}
          </div>

          <div className="space-y-3 pt-1">
            <button
              type="button"
              disabled={!details}
              onClick={accept}
              className="w-full py-4 px-4 bg-[#7A3B18] hover:bg-[#683214] disabled:opacity-50 text-white rounded-2xl text-base font-medium transition-colors shadow-xs active:scale-[0.99] text-center"
            >
              Accept Invitation
            </button>
            <button
              type="button"
              onClick={() => router.push('/')}
              className="w-full py-4 px-4 bg-white border border-[#211612] hover:bg-[#F9F7F4] text-[#1F1916] rounded-2xl text-base font-medium transition-colors shadow-xs active:scale-[0.99] text-center"
            >
              Decline
            </button>
          </div>

          <div className="text-center pt-2">
            <Link href={loginHref()} className="text-xs text-[#70665F] hover:text-[#1F1916] transition-colors">
              Already have an account? <span className="underline underline-offset-2 font-medium text-[#1F1916]">Log in to accept</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GateStaffInvitationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F0EDE6]" />}>
      <GateStaffInvitation />
    </Suspense>
  );
}
