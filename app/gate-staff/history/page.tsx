'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { GateMobileShell } from '@/components/gate-staff/GateMobileShell';
import { getGateWorkspace, type GateWorkspace } from '@/lib/api/platform';

function formatWhen(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function GateStaffHistoryPage() {
  const router = useRouter();
  const [filterQuery, setFilterQuery] = React.useState('');
  const [scans, setScans] = React.useState<GateWorkspace['scans']>([]);

  React.useEffect(() => {
    const eventId = new URLSearchParams(window.location.search).get('eventId');
    getGateWorkspace()
      .then((workspace) => {
        const rows = workspace.scans.filter((scan) => scan.status === 'VALID' && (!eventId || scan.eventId === eventId));
        setScans(rows);
      })
      .catch(() => setScans([]));
  }, []);

  const filtered = scans.filter((scan) => scan.name.toLowerCase().includes(filterQuery.toLowerCase()));
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const todayCount = scans.filter((scan) => new Date(scan.scannedAt).getTime() >= startOfToday.getTime()).length;

  return (
    <GateMobileShell showHeader={false} activeTab="history">
      <div className="space-y-4 pt-1">
        
        {/* Top Header matching mockup 09 */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Back"
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#1F1916] hover:bg-[#EFEAE2] transition-colors"
          >
            <ArrowLeft className="w-5 h-5 stroke-[1.8]" />
          </button>
          <h1 className="font-serif text-2xl font-medium tracking-tight text-[#1F1916]">
            Check-In History
          </h1>
        </div>

        <p className="text-xs text-[#70665F]">
          View guests who have entered through your assigned gate.
        </p>

        {/* 2 Stat Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 border border-[#EAE5DC] shadow-[0_2px_6px_rgba(0,0,0,0.02)]">
            <span className="text-xs text-[#80756C] block font-normal mb-2">
              Total Checked In
            </span>
            <span className="font-serif text-3xl font-semibold text-[#1F1916] block">
              {scans.length}
            </span>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-[#EAE5DC] shadow-[0_2px_6px_rgba(0,0,0,0.02)]">
            <span className="text-xs text-[#80756C] block font-normal mb-2">
              Today&apos;s Check-ins
            </span>
            <span className="font-serif text-3xl font-semibold text-[#1F1916] block">
              {todayCount}
            </span>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex items-center gap-2 pt-1">
          <div className="flex-1 bg-white border border-[#EAE5DC] rounded-2xl px-4 py-3 text-sm flex items-center">
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Search guests"
              className="w-full bg-transparent text-sm text-[#1F1916] placeholder:text-[#80756C] focus:outline-none"
            />
          </div>
          <button
            type="button"
            className="bg-white border border-[#EAE5DC] rounded-2xl px-4 py-3 text-xs font-medium text-[#1F1916] flex items-center gap-1.5 whitespace-nowrap shadow-xs"
          >
            <span>All status</span>
          </button>
        </div>

        {/* History List */}
        <div className="space-y-3 pt-1">
          {filtered.length === 0 && (
            <p className="text-xs text-[#70665F]">No check-ins at your gate yet.</p>
          )}
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl p-5 border border-[#EAE5DC] shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-2"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-base text-[#1F1916]">
                  {item.name}
                </h3>
              </div>

              <div className="flex items-center justify-between text-xs text-[#80756C]">
                <span>Party {item.partySize}</span>
                <span>{formatWhen(item.scannedAt)}</span>
              </div>

              <p className="text-xs text-[#4A403A]">
                {item.gate}
              </p>

              <div className="flex items-center gap-1.5 pt-1">
                <span className="w-2 h-2 rounded-full bg-[#2A6E3B] inline-block" />
                <span className="text-xs text-[#2A6E3B] font-medium">
                  Checked In
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </GateMobileShell>
  );
}
