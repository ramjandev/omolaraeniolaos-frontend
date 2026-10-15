'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';
import { GateMobileShell } from '@/components/gate-staff/GateMobileShell';

export default function GateStaffSuccessPage() {
  const router = useRouter();

  return (
    <GateMobileShell showHeader={false} activeTab="checkin">
      <div className="flex flex-col items-center pt-8 text-center space-y-6">
        
        {/* Large Green Check Circle matching mockup 07 */}
        <div className="w-24 h-24 rounded-full bg-[#E5F2E8] flex items-center justify-center shadow-xs">
          <Check className="w-12 h-12 text-[#2A6E3B] stroke-[2.5]" />
        </div>

        {/* Title & Subtitle */}
        <div className="space-y-2">
          <h1 className="font-serif text-3xl font-medium tracking-tight text-[#1F1916]">
            Guest Checked In Successfully
          </h1>
          <p className="text-sm text-[#70665F]">
            Adeleke Adebayo and their party have been checked in.
          </p>
        </div>

        {/* Guest Summary Card */}
        <div className="w-full bg-white rounded-3xl p-5 border border-[#EAE5DC] shadow-[0_2px_8px_rgba(0,0,0,0.02)] text-left space-y-3">
          <h2 className="font-semibold text-base text-[#1F1916]">
            Adeleke Adebayo
          </h2>

          <div className="space-y-0.5">
            <span className="text-xs text-[#8A7E75] block">Party size</span>
            <span className="text-sm font-semibold text-[#1F1916] block">2</span>
          </div>

          <div className="space-y-0.5">
            <span className="text-xs text-[#8A7E75] block">Gate</span>
            <span className="text-sm font-semibold text-[#1F1916] block">Main Entrance</span>
          </div>

          <div className="space-y-0.5">
            <span className="text-xs text-[#8A7E75] block">Time</span>
            <span className="text-sm font-semibold text-[#1F1916] block">10:45 AM</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full space-y-3 pt-2">
          {/* Brown Button: Scan Next Guest */}
          <button
            type="button"
            onClick={() => router.push('/gate-staff/scanner')}
            className="w-full py-4 px-4 bg-[#7A3B18] hover:bg-[#683214] text-white rounded-2xl text-base font-medium transition-colors shadow-xs active:scale-[0.99]"
          >
            Scan Next Guest
          </button>

          {/* Dark Charcoal Button: View Check-in Details */}
          <button
            type="button"
            onClick={() => router.push('/gate-staff/history')}
            className="w-full py-4 px-4 bg-[#211612] hover:bg-[#34241D] text-white rounded-2xl text-base font-medium transition-colors shadow-xs active:scale-[0.99]"
          >
            View Check-in Details
          </button>
        </div>

      </div>
    </GateMobileShell>
  );
}
