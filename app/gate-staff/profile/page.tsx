'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Pencil } from 'lucide-react';
import { GateMobileShell } from '@/components/gate-staff/GateMobileShell';

export default function GateStaffProfilePage() {
  const router = useRouter();

  return (
    <GateMobileShell showHeader={false} activeTab="profile">
      <div className="space-y-4 pt-1">
        
        {/* Title */}
        <h1 className="font-serif text-3xl font-medium tracking-tight text-[#1F1916] mb-2">
          My Profile
        </h1>

        {/* Staff Profile Card matching mockup 10 */}
        <div className="bg-white rounded-3xl p-5 border border-[#EAE5DC] shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-4 relative">
          
          {/* Top row with avatar + name + edit icon */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full overflow-hidden border border-[#D5CFC7] bg-[#E8E2D8] flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/gate/Profile.png"
                  alt="Staff portrait"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-0.5">
                <h2 className="font-semibold text-lg text-[#1F1916]">
                  Tomi Adeyemi
                </h2>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#2A6E3B] inline-block" />
                  <span className="text-xs text-[#2A6E3B] font-medium">
                    Gate Staff
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              aria-label="Edit Profile"
              className="text-[#1F1916] hover:text-[#7A3B18] p-1"
            >
              <Pencil className="w-4 h-4 stroke-[1.8]" />
            </button>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-[#8A7E75] block">Email</span>
            <span className="text-sm font-semibold text-[#1F1916] block">
              tomi.adeyemi@example.com
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-[#8A7E75] block">Phone number</span>
            <span className="text-sm font-semibold text-[#1F1916] block">
              +234 803 555 0142
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-[#8A7E75] block">Assigned Role</span>
            <span className="text-sm font-semibold text-[#1F1916] block">
              Gate Staff
            </span>
          </div>
        </div>

        {/* Change Password Button */}
        <button
          type="button"
          onClick={() => alert('Change password feature is available in account settings')}
          className="w-full py-3.5 px-4 bg-[#211612] hover:bg-[#34241D] text-white rounded-2xl text-sm font-medium transition-colors shadow-xs active:scale-[0.99]"
        >
          Change Password
        </button>

        {/* Current Assignments Section */}
        <div className="space-y-3 pt-2">
          <h3 className="font-semibold text-sm text-[#1F1916]">
            Current Assignments
          </h3>

          <div className="bg-white rounded-3xl p-5 border border-[#EAE5DC] shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-3">
            <h4 className="font-semibold text-base text-[#1F1916]">
              The Grand Royal Gala & Investiture
            </h4>

            <div className="space-y-0.5">
              <span className="text-xs text-[#8A7E75] block">Assigned gate</span>
              <span className="text-sm font-semibold text-[#1F1916] block">
                Main Entrance
              </span>
            </div>

            <div className="space-y-0.5">
              <span className="text-xs text-[#8A7E75] block">Date</span>
              <span className="text-sm font-semibold text-[#1F1916] block">
                24 October 2026
              </span>
            </div>

            <p className="text-[11px] font-semibold text-[#8A7E75] tracking-wider uppercase pt-1">
              READ-ONLY ASSIGNMENT
            </p>
          </div>
        </div>

        {/* Log Out Outline Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => router.push('/gate-staff/login')}
            className="w-full py-3.5 px-4 bg-transparent border border-[#7A3B18] text-[#7A3B18] hover:bg-[#F8F1EB] rounded-2xl text-sm font-semibold transition-colors active:scale-[0.99] text-center"
          >
            Log Out
          </button>
        </div>

      </div>
    </GateMobileShell>
  );
}
