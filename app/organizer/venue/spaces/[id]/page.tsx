'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  ChevronRight,
  ChevronLeft,
  MapPin,
  Users,
  Plus,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { AppShell } from '@/components/shell/AppShell';
import {
  MOCK_VENUE_SPACES,
  MOCK_VENUE_BOOKINGS,
  VenueSpace,
} from '@/lib/mock-data/venue';

type VenueDetailTab = 'Overview' | 'Spaces' | 'Bookings' | 'Availability';

export default function SingleVenueDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: venueId } = React.use(params);

  const venue: VenueSpace =
    MOCK_VENUE_SPACES.find((v) => v.id === venueId) || MOCK_VENUE_SPACES[0];

  const [activeTab, setActiveTab] =
    React.useState<VenueDetailTab>('Overview');

  // Bookings specifically for this venue/space
  const venueBookings = MOCK_VENUE_BOOKINGS.filter((b) =>
    b.space.toLowerCase().includes(venue.name.toLowerCase().split(' ')[0])
  );

  return (
    <AppShell currentRole="organizer_venue">
      <div className="space-y-7 w-full pb-12">
        {/* Header row with Location & Action Button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1F140E] tracking-tight">
              {venue.name}
            </h1>
            <p className="text-xs sm:text-sm text-[#8C7A6B] flex items-center gap-1.5 mt-1 font-sans">
              <MapPin className="w-3.5 h-3.5 text-[#8C7A6B]" />
              <span>{venue.address}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/organizer/venue/spaces"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1F140E] text-white hover:bg-[#342217] text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Venue</span>
            </Link>
          </div>
        </div>

        {/* Hero Image Banner with Badges matching Figma */}
        <div className="relative h-72 sm:h-80 md:h-96 w-full rounded-2xl overflow-hidden shadow-2xs border border-[#EFECE6]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={venue.image}
            alt={venue.name}
            className="w-full h-full object-cover"
          />
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-black/20" />

          {/* Top-left badges overlay */}
          <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
            <span
              className={`text-xs font-semibold px-3 py-1 rounded-full shadow-md ${
                venue.status === 'Occupied'
                  ? 'bg-[#1F140E]/90 text-white backdrop-blur-md'
                  : 'bg-emerald-600 text-white backdrop-blur-md'
              }`}
            >
              {venue.status}
            </span>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/90 text-[#1F140E] backdrop-blur-md shadow-md">
              {venue.type}
            </span>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/90 text-white backdrop-blur-md shadow-md">
              Active
            </span>
          </div>

          {/* Bottom-right capacity pill */}
          <div className="absolute bottom-4 right-4">
            <span className="text-xs font-semibold px-3.5 py-1.5 rounded-full bg-[#1F140E]/85 text-white backdrop-blur-md shadow-md flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#D4A373]" />
              <span>{venue.capacity} capacity</span>
            </span>
          </div>
        </div>

        {/* 4 KPI Metric Cards matching Figma */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-[#EFECE6] shadow-2xs">
            <span className="text-3xl font-bold font-sans text-[#1F140E]">
              {venue.capacity}
            </span>
            <p className="text-sm font-semibold text-[#1F140E] mt-2">Total Capacity</p>
            <p className="text-xs text-[#8C7A6B]">Maximum attendees</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#EFECE6] shadow-2xs">
            <span className="text-3xl font-bold font-sans text-[#1F140E]">
              {venue.spacesCount}
            </span>
            <p className="text-sm font-semibold text-[#1F140E] mt-2">Spaces / Areas</p>
            <p className="text-xs text-[#8C7A6B]">Sub-divided zones</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#EFECE6] shadow-2xs">
            <span className="text-3xl font-bold font-sans text-[#1F140E]">
              {venueBookings.length > 0 ? venueBookings.length : 2}
            </span>
            <p className="text-sm font-semibold text-[#1F140E] mt-2">Upcoming Bookings</p>
            <p className="text-xs text-[#8C7A6B]">Scheduled this month</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#EFECE6] shadow-2xs">
            <span className="text-3xl font-bold font-sans text-[#1F140E]">
              {venue.utilization}%
            </span>
            <p className="text-sm font-semibold text-[#1F140E] mt-2">Utilization</p>
            <p className="text-xs text-[#8C7A6B]">Occupancy rate</p>
          </div>
        </div>

        {/* Tabs Bar matching Figma */}
        <div className="flex items-center gap-2 border-b border-[#EFECE6] pb-1">
          {[
            { id: 'Overview', label: 'Overview' },
            { id: 'Spaces', label: `Spaces (${venue.spacesCount})` },
            { id: 'Bookings', label: `Bookings (${venueBookings.length > 0 ? venueBookings.length : 2})` },
            { id: 'Availability', label: 'Availability' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as VenueDetailTab)}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-[#1F140E] text-white shadow-2xs'
                  : 'text-[#71717A] hover:text-[#1F140E] hover:bg-[#FAF8F5]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 2-Column Split matching Figma */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (2 spans): About, Amenities, Seating */}
          <div className="lg:col-span-2 space-y-6">
            {/* About this venue */}
            <div className="p-6 rounded-2xl bg-white border border-[#EFECE6] shadow-2xs space-y-3">
              <h3 className="text-base font-bold text-[#1F140E]">About this venue</h3>
              <p className="text-xs leading-relaxed text-[#71717A]">
                {venue.description ||
                  'Our premier ballroom features soaring 7-meter ceilings, crystal chandeliers, state-of-the-art audiovisual systems, and flexible partition walls. Ideal for grand galas, corporate annual meetings, state banquets, and high-profile luxury weddings.'}
              </p>
            </div>

            {/* Amenities Pills matching Figma */}
            <div className="p-6 rounded-2xl bg-white border border-[#EFECE6] shadow-2xs space-y-4">
              <h3 className="text-base font-bold text-[#1F140E]">Amenities</h3>
              <div className="flex flex-wrap gap-2.5">
                {venue.amenities.map((amenity) => (
                  <span
                    key={amenity}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#E8E4DD] text-xs font-medium text-[#1F140E]"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#6E3B1C]" />
                    <span>{amenity}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Seating at a glance */}
            <div className="p-6 rounded-2xl bg-white border border-[#EFECE6] shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#1F140E]">Seating at a glance</h3>
                  <p className="text-xs text-[#8C7A6B]">
                    Live table setup and guest seat allocation
                  </p>
                </div>
                <Link
                  href="/organizer/venue/tables"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#6E3B1C] hover:text-[#522B14] transition-colors"
                >
                  <span>Manage Seating Layout</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-1">
                <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EFECE6] text-center">
                  <span className="text-2xl font-bold font-sans text-[#1F140E]">102</span>
                  <p className="text-[11px] font-medium text-[#8C7A6B] mt-0.5">
                    Configured Seats
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100 text-center">
                  <span className="text-2xl font-bold font-sans text-emerald-700">42</span>
                  <p className="text-[11px] font-medium text-emerald-600 mt-0.5">
                    Available Seats
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-100 text-center">
                  <span className="text-2xl font-bold font-sans text-amber-700">60</span>
                  <p className="text-[11px] font-medium text-amber-600 mt-0.5">
                    Reserved Seats
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (1 span): Calendar & Next Bookings */}
          <div className="space-y-6">
            {/* Booking Calendar Card */}
            <div className="p-6 rounded-2xl bg-white border border-[#EFECE6] shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-[#1F140E]">Booking Calendar</h3>
                <div className="flex items-center gap-1 text-xs font-semibold text-[#1F140E]">
                  <button
                    type="button"
                    className="p-1 rounded-md hover:bg-[#FAF8F5] text-[#8C7A6B]"
                    aria-label="Previous"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span>Oct 2026</span>
                  <button
                    type="button"
                    className="p-1 rounded-md hover:bg-[#FAF8F5] text-[#8C7A6B]"
                    aria-label="Next"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div>
                <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-[#8C7A6B] mb-2">
                  <span>Su</span>
                  <span>Mo</span>
                  <span>Tu</span>
                  <span>We</span>
                  <span>Th</span>
                  <span>Fr</span>
                  <span>Sa</span>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center text-xs">
                  <div className="py-1.5 text-[#D4CFC7]">27</div>
                  <div className="py-1.5 text-[#D4CFC7]">28</div>
                  <div className="py-1.5 text-[#D4CFC7]">29</div>
                  <div className="py-1.5 text-[#D4CFC7]">30</div>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
                    const is24 = day === 24;
                    return (
                      <div
                        key={day}
                        className={`py-1.5 rounded-lg text-xs font-medium ${
                          is24
                            ? 'bg-[#6E3B1C] text-white font-bold'
                            : 'text-[#1F140E] hover:bg-[#FAF8F5]'
                        }`}
                      >
                        {day}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Next Bookings Card */}
            <div className="p-6 rounded-2xl bg-white border border-[#EFECE6] shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-[#1F140E]">Next bookings</h3>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#FAF4EF] text-[#6E3B1C]">
                  2 events
                </span>
              </div>

              <div className="divide-y divide-[#F4F1EB]">
                <div className="py-3.5 first:pt-0 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-[#1F140E]">
                      The Grand Royal Gala & In...
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                      Confirmed
                    </span>
                  </div>
                  <p className="text-[11px] text-[#8C7A6B]">24 Oct 2026 · 6:00 PM</p>
                  <p className="text-[11px] text-[#71717A]">Chief Babatunde Alabi · 350 guests</p>
                </div>

                <div className="py-3.5 last:pb-0 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-[#1F140E]">
                      NGO Annual Charity Dinner
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                      Awaiting
                    </span>
                  </div>
                  <p className="text-[11px] text-[#8C7A6B]">10 Nov 2026 · 7:00 PM</p>
                  <p className="text-[11px] text-[#71717A]">Hope Foundation · 200 guests</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
