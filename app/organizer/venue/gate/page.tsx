'use client';

import * as React from 'react';
import Link from 'next/link';
import { Scan } from 'lucide-react';
import { AppShell } from '@/components/shell/AppShell';

export default function VenueGateManagementPage() {
  return (
    <AppShell currentRole="organizer_venue">
      <div className="space-y-6 w-full pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1F140E] tracking-tight">
              Gate Management & Access Control
            </h1>
            <p className="text-xs sm:text-sm text-[#71717A] mt-1 font-sans">
              Monitor active venue turnstiles, parking barriers, and security ingress lanes.
            </p>
          </div>

          <Link
            href="/gate-staff/scanner"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1F140E] text-white hover:bg-[#342217] text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
          >
            <Scan className="w-3.5 h-3.5" />
            <span>Launch Live Scanner</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-[#EFECE6] shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-[#1F140E]">Main Entrance Turnstiles</h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                Active
              </span>
            </div>
            <p className="text-xs text-[#8C7A6B]">4 lanes operating · 1,420 scanned today</p>
            <div className="w-full h-2 rounded-full bg-[#EFECE6] overflow-hidden">
              <div className="h-full rounded-full bg-emerald-500 w-[78%]" />
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#EFECE6] shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-[#1F140E]">VIP Valet & Red Carpet Gate</h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                Active
              </span>
            </div>
            <p className="text-xs text-[#8C7A6B]">Dedicated concierge scan point · 185 guests</p>
            <div className="w-full h-2 rounded-full bg-[#EFECE6] overflow-hidden">
              <div className="h-full rounded-full bg-[#6E3B1C] w-[92%]" />
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#EFECE6] shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-[#1F140E]">Service & Catering Loading Bay</h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                Authorized Only
              </span>
            </div>
            <p className="text-xs text-[#8C7A6B]">Logistics QR pass required · 12 vehicles checked</p>
            <div className="w-full h-2 rounded-full bg-[#EFECE6] overflow-hidden">
              <div className="h-full rounded-full bg-blue-500 w-[45%]" />
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
