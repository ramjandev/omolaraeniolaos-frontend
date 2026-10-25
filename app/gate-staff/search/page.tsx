'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search } from 'lucide-react';
import { GateMobileShell } from '@/components/gate-staff/GateMobileShell';
import { searchGateGuests, type GateGuestResult } from '@/lib/api/platform';

export default function GateStaffSearchGuestPage() {
  const router = useRouter();
  const [query, setQuery] = React.useState('');
  const [eventId, setEventId] = React.useState('');
  const [guests, setGuests] = React.useState<GateGuestResult[]>([]);
  const [searched, setSearched] = React.useState(false);

  React.useEffect(() => {
    setEventId(new URLSearchParams(window.location.search).get('eventId') || '');
  }, []);

  React.useEffect(() => {
    if (!eventId) return;
    const handle = window.setTimeout(() => {
      searchGateGuests(eventId, query)
        .then((rows) => {
          setGuests(rows);
          setSearched(true);
        })
        .catch(() => {
          setGuests([]);
          setSearched(true);
        });
    }, 250);
    return () => window.clearTimeout(handle);
  }, [eventId, query]);

  return (
    <GateMobileShell showHeader={false} activeTab="checkin">
      <div className="space-y-4 pt-1">
        
        {/* Top Header */}
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
            Find Guest
          </h1>
        </div>

        {/* Search Input Box */}
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Guest Instead"
            className="w-full bg-white border border-[#EAE5DC] rounded-2xl pl-4 pr-11 py-3.5 text-sm text-[#1F1916] placeholder:text-[#80756C] focus:outline-none focus:border-[#7A3B18]"
          />
          <Search className="w-5 h-5 text-[#80756C] stroke-[1.8] absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Found Guest Card matching mockup 08 */}
        {searched && guests.length > 0 ? (
          guests.map((guest) => (
            <div
              key={guest.id}
              className="bg-white rounded-3xl p-5 border border-[#EAE5DC] shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-3.5"
            >
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
                <span className="text-xs text-[#8A7E75] block">Check-in Status</span>
                <span className="text-sm font-semibold text-[#1F1916] block">
                  {guest.checkInStatus}
                </span>
              </div>

              {/* View Guest CTA Button */}
              <button
                type="button"
                onClick={() => {
                  sessionStorage.setItem('gate-last-guest', JSON.stringify(guest));
                  router.push(`/gate-staff/verify?status=${guest.checkInStatus === 'Checked In' ? 'already_checked_in' : 'valid'}`);
                }}
                className="w-full py-3.5 px-4 bg-[#211612] hover:bg-[#34241D] text-white rounded-2xl text-sm font-medium transition-colors shadow-xs active:scale-[0.99] mt-2"
              >
                View Guest
              </button>
            </div>
          ))
        ) : (
          /* Empty Search State matching mockup 08-1 */
          <div className="bg-white rounded-3xl p-6 border border-[#EAE5DC] shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-3">
            <div className="w-10 h-10 rounded-full border border-[#D5CFC7] flex items-center justify-center">
              <Search className="w-5 h-5 text-[#4A403A] stroke-[1.8]" />
            </div>
            <h3 className="font-semibold text-base text-[#1F1916]">
              No Guest Found
            </h3>
            <p className="text-xs text-[#70665F] leading-relaxed">
              Try searching with a different name, phone number, or invitation code.
            </p>
          </div>
        )}

      </div>
    </GateMobileShell>
  );
}
