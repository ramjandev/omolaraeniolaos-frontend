'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function GateStaffInvitationPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#F0EDE6] sm:py-6 flex justify-center items-start">
      {/* Mobile Container */}
      <div className="w-full max-w-[430px] min-h-screen sm:min-h-[880px] bg-[#FBFAF6] sm:rounded-[36px] sm:shadow-2xl flex flex-col p-6 sm:border sm:border-[#E8E4DC]">
        
        {/* Brand Header */}
        <div className="flex items-center gap-2.5 mb-6 pt-1">
          <div className="w-8 h-8 rounded-lg bg-[#7A3B18] flex items-center justify-center text-white font-serif font-bold text-base shadow-xs">
            M
          </div>
          <span className="font-serif font-semibold text-lg text-[#1F1916]">
            McEniesVite
          </span>
        </div>

        {/* Outer White Card Container matching 01 · Staff invitation.png */}
        <div className="bg-white rounded-[32px] p-6 border border-[#EAE5DC] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-6">
          
          {/* Header Title & Subtitle */}
          <div className="space-y-2">
            <h1 className="font-serif text-3xl font-medium tracking-tight text-[#1F1916]">
              You&apos;re Invited To Join An Event
            </h1>
            <p className="text-sm text-[#70665F] leading-relaxed">
              [Organizer Name] has invited you to help manage guest entry at their event.
            </p>
          </div>

          {/* Inner Event Details Card */}
          <div className="bg-white rounded-2xl p-5 border border-[#EAE5DC] space-y-4">
            <h2 className="font-semibold text-base text-[#1F1916]">
              The Grand Royal Gala & Investiture
            </h2>

            <div className="space-y-0.5">
              <span className="text-xs text-[#8A7E75] block">Date</span>
              <span className="text-sm font-semibold text-[#1F1916] block">
                24 October 2026
              </span>
            </div>

            <div className="space-y-0.5">
              <span className="text-xs text-[#8A7E75] block">Assigned gate</span>
              <span className="text-sm font-semibold text-[#1F1916] block">
                Main Entrance
              </span>
            </div>

            <div className="space-y-0.5">
              <span className="text-xs text-[#8A7E75] block">Role</span>
              <span className="text-sm font-semibold text-[#1F1916] block">
                Gate Staff
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-1">
            {/* Accept Invitation (Brown) */}
            <button
              type="button"
              onClick={() => router.push('/gate-staff/login')}
              className="w-full py-4 px-4 bg-[#7A3B18] hover:bg-[#683214] text-white rounded-2xl text-base font-medium transition-colors shadow-xs active:scale-[0.99] text-center"
            >
              Accept Invitation
            </button>

            {/* Decline (White with dark border) */}
            <button
              type="button"
              onClick={() => router.push('/')}
              className="w-full py-4 px-4 bg-white border border-[#211612] hover:bg-[#F9F7F4] text-[#1F1916] rounded-2xl text-base font-medium transition-colors shadow-xs active:scale-[0.99] text-center"
            >
              Decline
            </button>
          </div>

          {/* Footer link to Login */}
          <div className="text-center pt-2">
            <Link
              href="/gate-staff/login"
              className="text-xs text-[#70665F] hover:text-[#1F1916] transition-colors"
            >
              Already have an account? <span className="underline underline-offset-2 font-medium text-[#1F1916]">Log in to accept</span>
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
