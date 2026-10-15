'use client';

import * as React from 'react';
import { CheckCircle2, Download } from 'lucide-react';
import { AppShell } from '@/components/shell/AppShell';

export default function VenueBillingPage() {
  return (
    <AppShell currentRole="organizer_venue">
      <div className="space-y-6 w-full pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1F140E] tracking-tight">
              Venue Billing & Subscription
            </h1>
            <p className="text-xs sm:text-sm text-[#71717A] mt-1 font-sans">
              Manage your venue institution subscription, rental deposit payouts, and invoices.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Plan card */}
          <div className="p-6 rounded-2xl bg-[#1A1009] text-white border border-[#3E2314] shadow-md space-y-4 md:col-span-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#D4A373] uppercase tracking-wider">
                Current Tier
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                Active
              </span>
            </div>
            <div>
              <h3 className="text-2xl font-bold font-serif text-white">Venue Enterprise</h3>
              <p className="text-xs text-[#D4A373] mt-1">Multi-hall management & live turnstiles</p>
            </div>
            <div className="pt-2 text-xs space-y-2 text-[#FAF6F0]/80">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#D4A373]" />
                <span>Unlimited Venues & Spaces</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#D4A373]" />
                <span>Interactive Floor & Seating Builder</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#D4A373]" />
                <span>Real-Time Turnstile Scanner Sync</span>
              </div>
            </div>
          </div>

          {/* Invoices */}
          <div className="p-6 rounded-2xl bg-white border border-[#EFECE6] shadow-2xs space-y-4 md:col-span-2">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#1F140E]">Recent Invoices</h3>
              <button
                type="button"
                className="text-xs font-semibold text-[#6E3B1C] hover:text-[#522B14] transition-colors"
              >
                Download All (CSV)
              </button>
            </div>

            <div className="divide-y divide-[#F4F1EB] text-xs">
              {[
                { inv: 'INV-2026-1001', date: '01 Oct 2026', amount: '₦ 450,000', status: 'Paid' },
                { inv: 'INV-2026-0901', date: '01 Sep 2026', amount: '₦ 450,000', status: 'Paid' },
                { inv: 'INV-2026-0801', date: '01 Aug 2026', amount: '₦ 450,000', status: 'Paid' },
              ].map((item) => (
                <div key={item.inv} className="py-3 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-[#1F140E]">{item.inv}</span>
                    <p className="text-[11px] text-[#8C7A6B]">{item.date}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-[#1F140E]">{item.amount}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                      {item.status}
                    </span>
                    <button
                      type="button"
                      className="p-1 rounded hover:bg-[#FAF8F5] text-[#8C7A6B]"
                      title="Download Invoice"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
