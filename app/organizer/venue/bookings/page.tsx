'use client';

import * as React from 'react';
import { Plus, Search } from 'lucide-react';
import { AppShell } from '@/components/shell/AppShell';
import { MOCK_VENUE_BOOKINGS } from '@/lib/mock-data/venue';

export default function VenueBookingsPage() {
  const [search, setSearch] = React.useState('');

  const filtered = MOCK_VENUE_BOOKINGS.filter((b) =>
    b.event.toLowerCase().includes(search.toLowerCase()) ||
    b.space.toLowerCase().includes(search.toLowerCase()) ||
    b.organizer.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell currentRole="organizer_venue">
      <div className="space-y-6 w-full pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1F140E] tracking-tight">
              Venue Bookings & Calendar
            </h1>
            <p className="text-xs sm:text-sm text-[#71717A] mt-1 font-sans">
              Confirmed hall reservations, tentative holds, and guest capacities.
            </p>
          </div>

          <button
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1F140E] text-white hover:bg-[#342217] text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Booking</span>
          </button>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-[#EFECE6] shadow-2xs space-y-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 text-[#8C7A6B] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search bookings..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-[#E5E0D8] bg-[#FAF8F5]/60 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6E3B1C] text-[#1F140E] placeholder:text-[#8C7A6B] transition-all"
            />
          </div>

          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#EFECE6] text-[#8C7A6B] font-medium">
                  <th className="py-3 px-3">Event</th>
                  <th className="py-3 px-3">Venue / Space</th>
                  <th className="py-3 px-3">Date & Time</th>
                  <th className="py-3 px-3">Organizer</th>
                  <th className="py-3 px-3 text-right">Guests</th>
                  <th className="py-3 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4F1EB]">
                {filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-[#FAF8F5]/60 transition-colors">
                    <td className="py-3.5 px-3">
                      <div className="font-semibold text-[#1F140E]">{b.event}</div>
                      <span className="inline-block mt-0.5 text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#FAF4EF] text-[#6E3B1C]">
                        {b.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-medium text-[#1F140E]">{b.space}</td>
                    <td className="py-3.5 px-3 text-[#71717A]">
                      <div className="text-[#1F140E] font-medium">{b.date}</div>
                      <div className="text-[11px] text-[#8C7A6B]">{b.time}</div>
                    </td>
                    <td className="py-3.5 px-3 text-[#1F140E]">{b.organizer}</td>
                    <td className="py-3.5 px-3 text-right font-medium text-[#1F140E]">{b.guests}</td>
                    <td className="py-3.5 px-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ${
                          b.status === 'Confirmed'
                            ? 'bg-emerald-50 text-emerald-700'
                            : b.status === 'Tentative'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-blue-50 text-blue-700'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            b.status === 'Confirmed'
                              ? 'bg-emerald-500'
                              : b.status === 'Tentative'
                              ? 'bg-amber-500'
                              : 'bg-blue-500'
                          }`}
                        />
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
