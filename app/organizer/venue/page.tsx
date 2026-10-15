'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Calendar,
  CalendarDays,
  Plus,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  ArrowRight,
  SlidersHorizontal,
} from 'lucide-react';
import { AppShell } from '@/components/shell/AppShell';
import {
  MOCK_VENUE_SPACES,
  MOCK_VENUE_BOOKINGS,
} from '@/lib/mock-data/venue';

type BookingFilter =
  | 'All'
  | 'Confirmed'
  | 'Tentative'
  | 'Awaiting'
  | 'Cancelled';

export default function VenueDashboardPage() {
  const [activeTab, setActiveTab] = React.useState<BookingFilter>('All');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('All');

  // Filter bookings based on activeTab, search, and category
  const filteredBookings = React.useMemo(() => {
    return MOCK_VENUE_BOOKINGS.filter((booking) => {
      const matchesTab = activeTab === 'All' ? true : booking.status === activeTab;
      const matchesCategory = selectedCategory === 'All' ? true : booking.category === selectedCategory;
      const matchesSearch =
        booking.event.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.space.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.organizer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesCategory && matchesSearch;
    });
  }, [activeTab, searchQuery, selectedCategory]);

  const confirmedCount = MOCK_VENUE_BOOKINGS.filter((b) => b.status === 'Confirmed').length;
  const tentativeCount = MOCK_VENUE_BOOKINGS.filter((b) => b.status === 'Tentative').length;
  const awaitingCount = MOCK_VENUE_BOOKINGS.filter((b) => b.status === 'Awaiting').length;

  return (
    <AppShell currentRole="organizer_venue">
      <div className="space-y-7 w-full pb-12">
        {/* Top Header Row matching Figma: "Good morning, Adaeze" */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1F140E] tracking-tight">
              Good morning, Adaeze
            </h1>
            <p className="text-xs sm:text-sm text-[#71717A] mt-1 font-sans">
              5 venues · 6 upcoming bookings · 1 event today
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-[#E5E0D8] text-xs font-medium text-[#1F140E] shadow-2xs hover:bg-[#FAF8F5] transition-colors"
            >
              <Calendar className="w-3.5 h-3.5 text-[#6E3B1C]" />
              <span>Oct 2026</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#8C7A6B]" />
            </button>
          </div>
        </div>

        {/* 4 KPI Metric Cards matching Figma */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Venues */}
          <div className="p-5 rounded-2xl bg-white border border-[#EFECE6] shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold font-sans text-[#1F140E]">5</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#F4F4F5] text-[#71717A]">
                + 0%
              </span>
            </div>
            <div className="mt-2">
              <p className="text-sm font-semibold text-[#1F140E]">Total Venues</p>
              <p className="text-xs text-[#8C7A6B]">Active spaces</p>
            </div>
          </div>

          {/* Card 2: Upcoming Events */}
          <div className="p-5 rounded-2xl bg-white border border-[#EFECE6] shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold font-sans text-[#1F140E]">6</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                + 18%
              </span>
            </div>
            <div className="mt-2">
              <p className="text-sm font-semibold text-[#1F140E]">Upcoming Events</p>
              <p className="text-xs text-[#8C7A6B]">Next 30 days</p>
            </div>
          </div>

          {/* Card 3: Today's Events */}
          <div className="p-5 rounded-2xl bg-white border border-[#EFECE6] shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold font-sans text-[#1F140E]">1</span>
            </div>
            <div className="mt-2">
              <p className="text-sm font-semibold text-[#1F140E]">Today&apos;s Events</p>
              <p className="text-xs text-[#8C7A6B]">Happening today</p>
            </div>
          </div>

          {/* Card 4: Available Spaces */}
          <div className="p-5 rounded-2xl bg-white border border-[#EFECE6] shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold font-sans text-[#1F140E]">3</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                + 5%
              </span>
            </div>
            <div className="mt-2">
              <p className="text-sm font-semibold text-[#1F140E]">Available Spaces</p>
              <p className="text-xs text-[#8C7A6B]">Open right now</p>
            </div>
          </div>
        </div>

        {/* 4 Quick Action Buttons matching Figma */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Link
            href="/organizer/venue/spaces"
            className="flex items-center gap-3 p-3.5 rounded-xl bg-white border border-[#E8E4DD] hover:border-[#6E3B1C] hover:bg-[#FAF8F5] transition-all shadow-2xs group"
          >
            <div className="w-8 h-8 rounded-lg bg-[#FAF4EF] text-[#6E3B1C] flex items-center justify-center shrink-0 group-hover:bg-[#6E3B1C] group-hover:text-white transition-colors">
              <Plus className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-[#1F140E]">Add Venue / Space</span>
          </Link>

          <Link
            href="/organizer/venue/bookings"
            className="flex items-center gap-3 p-3.5 rounded-xl bg-white border border-[#E8E4DD] hover:border-[#6E3B1C] hover:bg-[#FAF8F5] transition-all shadow-2xs group"
          >
            <div className="w-8 h-8 rounded-lg bg-[#FAF4EF] text-[#6E3B1C] flex items-center justify-center shrink-0 group-hover:bg-[#6E3B1C] group-hover:text-white transition-colors">
              <Plus className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-[#1F140E]">Create Booking</span>
          </Link>

          <Link
            href="/organizer/venue/bookings"
            className="flex items-center gap-3 p-3.5 rounded-xl bg-white border border-[#E8E4DD] hover:border-[#6E3B1C] hover:bg-[#FAF8F5] transition-all shadow-2xs group"
          >
            <div className="w-8 h-8 rounded-lg bg-[#FAF4EF] text-[#6E3B1C] flex items-center justify-center shrink-0 group-hover:bg-[#6E3B1C] group-hover:text-white transition-colors">
              <CalendarDays className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-[#1F140E]">View Calendar</span>
          </Link>

          <Link
            href="/organizer/venue/availability"
            className="flex items-center gap-3 p-3.5 rounded-xl bg-white border border-[#E8E4DD] hover:border-[#6E3B1C] hover:bg-[#FAF8F5] transition-all shadow-2xs group"
          >
            <div className="w-8 h-8 rounded-lg bg-[#FAF4EF] text-[#6E3B1C] flex items-center justify-center shrink-0 group-hover:bg-[#6E3B1C] group-hover:text-white transition-colors">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-[#1F140E]">Manage Availability</span>
          </Link>
        </div>

        {/* Upcoming Bookings Table Card */}
        <div className="p-6 rounded-2xl bg-white border border-[#EFECE6] shadow-2xs space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-[#1F140E]">Upcoming Bookings</h2>
              <p className="text-xs text-[#8C7A6B] mt-0.5">
                Manage venue reservations and upcoming events
              </p>
            </div>

            <Link
              href="/organizer/venue/bookings"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#6E3B1C] hover:text-[#522B14] transition-colors self-start md:self-auto"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Filter Tabs matching Figma: All (6), Confirmed (4), Tentative (1), Awaiting (1), Cancelled (0) */}
          <div className="flex flex-wrap items-center gap-2 border-b border-[#EFECE6] pb-3">
            {[
              { id: 'All', label: `All (${MOCK_VENUE_BOOKINGS.length})` },
              { id: 'Confirmed', label: `Confirmed (${confirmedCount})` },
              { id: 'Tentative', label: `Tentative (${tentativeCount})` },
              { id: 'Awaiting', label: `Awaiting (${awaitingCount})` },
              { id: 'Cancelled', label: 'Cancelled (0)' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as BookingFilter)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#1F140E] text-white shadow-2xs'
                    : 'text-[#71717A] hover:text-[#1F140E] hover:bg-[#FAF8F5]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Toolbar: Search & Category */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 text-[#8C7A6B] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-[#E5E0D8] bg-[#FAF8F5]/60 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#6E3B1C] text-[#1F140E] placeholder:text-[#8C7A6B] transition-all"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl border border-[#E5E0D8] bg-white text-[#1F140E] focus:outline-none focus:ring-1 focus:ring-[#6E3B1C]"
              >
                <option value="All">Category: All</option>
                <option value="Gala">Gala</option>
                <option value="Corporate">Corporate</option>
                <option value="Wedding">Wedding</option>
                <option value="Charity">Charity</option>
                <option value="Private">Private</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#EFECE6] text-[#8C7A6B] font-medium">
                  <th className="py-3 px-3 font-medium">Event</th>
                  <th className="py-3 px-3 font-medium">Venue / Space</th>
                  <th className="py-3 px-3 font-medium">Date & Time</th>
                  <th className="py-3 px-3 font-medium">Organizer</th>
                  <th className="py-3 px-3 font-medium text-right">Guests</th>
                  <th className="py-3 px-3 font-medium text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4F1EB]">
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-[#FAF8F5]/60 transition-colors">
                    <td className="py-3.5 px-3">
                      <div className="font-semibold text-[#1F140E]">{booking.event}</div>
                      <span className="inline-block mt-0.5 text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#FAF4EF] text-[#6E3B1C]">
                        {booking.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-medium text-[#1F140E]">
                      {booking.space}
                    </td>
                    <td className="py-3.5 px-3 text-[#71717A]">
                      <div className="text-[#1F140E] font-medium">{booking.date}</div>
                      <div className="text-[11px] text-[#8C7A6B]">{booking.time}</div>
                    </td>
                    <td className="py-3.5 px-3 text-[#1F140E]">
                      {booking.organizer}
                    </td>
                    <td className="py-3.5 px-3 text-right font-medium text-[#1F140E]">
                      {booking.guests}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ${
                          booking.status === 'Confirmed'
                            ? 'bg-emerald-50 text-emerald-700'
                            : booking.status === 'Tentative'
                            ? 'bg-amber-50 text-amber-700'
                            : booking.status === 'Awaiting'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-zinc-100 text-zinc-600'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            booking.status === 'Confirmed'
                              ? 'bg-emerald-500'
                              : booking.status === 'Tentative'
                              ? 'bg-amber-500'
                              : booking.status === 'Awaiting'
                              ? 'bg-blue-500'
                              : 'bg-zinc-400'
                          }`}
                        />
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 2-Column Split: Left Venue Availability, Right Booking Calendar */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Venue Availability */}
          <div className="p-6 rounded-2xl bg-white border border-[#EFECE6] shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#1F140E]">Venue Availability</h3>
                <p className="text-xs text-[#8C7A6B]">Current occupancy status & upcoming schedules</p>
              </div>
              <Link
                href="/organizer/venue/spaces"
                className="text-xs font-semibold text-[#6E3B1C] hover:text-[#522B14] transition-colors"
              >
                Manage →
              </Link>
            </div>

            <div className="divide-y divide-[#F4F1EB] pt-1">
              {MOCK_VENUE_SPACES.map((space) => (
                <div key={space.id} className="py-3.5 first:pt-0 last:pb-0 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#1F140E]">{space.name}</span>
                      <span className="text-[11px] text-[#8C7A6B]">· {space.capacity} cap.</span>
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        space.status === 'Occupied'
                          ? 'bg-[#1F140E] text-white'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {space.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#8C7A6B]">
                    <span>
                      {space.nextBooking ? `Next: ${space.nextBooking.date}, ${space.nextBooking.time}` : 'No upcoming bookings'}
                    </span>
                    <span className="font-medium text-[#1F140E]">{space.utilization}%</span>
                  </div>

                  {/* Brown Progress Bar */}
                  <div className="w-full h-2 rounded-full bg-[#EFECE6] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#6E3B1C] transition-all duration-300"
                      style={{ width: `${space.utilization}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Booking Calendar */}
          <div className="p-6 rounded-2xl bg-white border border-[#EFECE6] shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#1F140E]">Booking Calendar</h3>
                <p className="text-xs text-[#8C7A6B]">Events slated across all spaces</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1F140E]">
                <button
                  type="button"
                  className="p-1 rounded-md hover:bg-[#FAF8F5] text-[#8C7A6B]"
                  aria-label="Previous Month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span>October 2026</span>
                <button
                  type="button"
                  className="p-1 rounded-md hover:bg-[#FAF8F5] text-[#8C7A6B]"
                  aria-label="Next Month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Calendar Grid matching Figma */}
            <div className="pt-2">
              <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-[#8C7A6B] mb-2">
                <span>Su</span>
                <span>Mo</span>
                <span>Tu</span>
                <span>We</span>
                <span>Th</span>
                <span>Fr</span>
                <span>Sa</span>
              </div>

              {/* October 2026: Oct 1 is Thursday -> 4 empty cells before 1 */}
              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {/* Empty cells Sun - Wed */}
                <div className="py-2 text-[#D4CFC7]">27</div>
                <div className="py-2 text-[#D4CFC7]">28</div>
                <div className="py-2 text-[#D4CFC7]">29</div>
                <div className="py-2 text-[#D4CFC7]">30</div>

                {/* Days 1 to 31 */}
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
                  const is24 = day === 24;
                  const is28 = day === 28;
                  const is31 = day === 31;
                  const hasDot = is28 || is31;

                  return (
                    <div
                      key={day}
                      className={`relative py-2 flex flex-col items-center justify-center rounded-xl text-xs font-medium cursor-pointer transition-colors ${
                        is24
                          ? 'bg-[#6E3B1C] text-white font-bold shadow-xs'
                          : 'text-[#1F140E] hover:bg-[#FAF8F5]'
                      }`}
                    >
                      <span>{day}</span>
                      {hasDot && !is24 && (
                        <span className="w-1 h-1 rounded-full bg-[#6E3B1C] mt-0.5 absolute bottom-1" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Scheduled Events Legend under Calendar */}
            <div className="pt-4 border-t border-[#EFECE6] space-y-2">
              <p className="text-[11px] font-semibold text-[#8C7A6B] uppercase tracking-wider">
                Scheduled in October
              </p>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center gap-2 text-[#1F140E]">
                  <span className="w-2 h-2 rounded-full bg-[#6E3B1C] shrink-0" />
                  <span className="font-medium">The Grand Royal Gala</span>
                  <span className="text-[#8C7A6B] text-[11px]">(24 Oct)</span>
                </div>
                <div className="flex items-center gap-2 text-[#1F140E]">
                  <span className="w-2 h-2 rounded-full bg-amber-600 shrink-0" />
                  <span className="font-medium">Lagos Business Summit</span>
                  <span className="text-[#8C7A6B] text-[11px]">(28 Oct)</span>
                </div>
                <div className="flex items-center gap-2 text-[#1F140E]">
                  <span className="w-2 h-2 rounded-full bg-[#6E3B1C] shrink-0" />
                  <span className="font-medium">VIP Cocktail Reception</span>
                  <span className="text-[#8C7A6B] text-[11px]">(31 Oct)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Venue Performance Card matching Figma bottom section */}
        <div className="p-6 rounded-2xl bg-white border border-[#EFECE6] shadow-2xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-[#1F140E]">Venue Performance</h3>
            <p className="text-xs text-[#8C7A6B]">Monthly booking trends & utilization breakdown</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-2">
            {/* Left Chart: Bookings Over Time (May - Oct) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#1F140E]">Bookings over time</span>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  +300% growth
                </span>
              </div>

              {/* Line chart visualization */}
              <div className="h-44 w-full flex flex-col justify-end pt-4 pb-2">
                <svg className="w-full h-32 overflow-visible" viewBox="0 0 400 120">
                  <defs>
                    <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6E3B1C" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#6E3B1C" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  {/* Grid lines */}
                  <line x1="0" y1="20" x2="400" y2="20" stroke="#F4F1EB" strokeDasharray="3 3" />
                  <line x1="0" y1="60" x2="400" y2="60" stroke="#F4F1EB" strokeDasharray="3 3" />
                  <line x1="0" y1="100" x2="400" y2="100" stroke="#F4F1EB" />

                  {/* Shaded Area */}
                  <polygon
                    points="20,95 85,82 155,70 225,55 295,42 375,18 375,100 20,100"
                    fill="url(#curveGradient)"
                  />

                  {/* Curve Path */}
                  <path
                    d="M 20 95 C 55 90, 65 84, 85 82 C 120 78, 135 72, 155 70 C 190 66, 205 58, 225 55 C 260 50, 275 44, 295 42 C 335 38, 355 22, 375 18"
                    fill="none"
                    stroke="#6E3B1C"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />

                  {/* Data Points */}
                  {[
                    { cx: 20, cy: 95, val: '6' },
                    { cx: 85, cy: 82, val: '9' },
                    { cx: 155, cy: 70, val: '12' },
                    { cx: 225, cy: 55, val: '15' },
                    { cx: 295, cy: 42, val: '18' },
                    { cx: 375, cy: 18, val: '24' },
                  ].map((pt, idx) => (
                    <g key={idx}>
                      <circle cx={pt.cx} cy={pt.cy} r="4" fill="#ffffff" stroke="#6E3B1C" strokeWidth="2.5" />
                    </g>
                  ))}
                </svg>

                {/* X-Axis labels */}
                <div className="flex justify-between text-[11px] font-medium text-[#8C7A6B] pt-2 border-t border-[#EFECE6]">
                  <span>May (6)</span>
                  <span>Jun (9)</span>
                  <span>Jul (12)</span>
                  <span>Aug (15)</span>
                  <span>Sep (18)</span>
                  <span className="font-semibold text-[#1F140E]">Oct (24)</span>
                </div>
              </div>
            </div>

            {/* Right Chart: Venue Utilization (%) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#1F140E]">Venue utilization (%)</span>
                <span className="text-xs text-[#8C7A6B]">Average: 74%</span>
              </div>

              {/* Bar chart visualization */}
              <div className="space-y-2.5 pt-1">
                {[
                  { name: 'Grand Ballroom A', pct: 82 },
                  { name: 'Conference Hall B', pct: 65 },
                  { name: 'Garden Terrace', pct: 74 },
                  { name: 'Auditorium C', pct: 58 },
                  { name: 'Executive Lounge', pct: 91 },
                ].map((item) => (
                  <div key={item.name} className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#1F140E] font-medium">{item.name}</span>
                      <span className="text-[#8C7A6B] font-semibold">{item.pct}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#EFECE6] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#6E3B1C]"
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Most booked spaces ranking at bottom */}
          <div className="pt-4 border-t border-[#EFECE6] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-xs font-semibold text-[#8C7A6B] uppercase tracking-wider">
              Most booked spaces:
            </span>
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5 font-medium text-[#1F140E]">
                <span className="font-bold text-[#6E3B1C]">#1</span>
                <span>Executive Lounge</span>
                <span className="text-[11px] text-[#8C7A6B] font-semibold">(91%)</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium text-[#1F140E]">
                <span className="font-bold text-[#6E3B1C]">#2</span>
                <span>Grand Ballroom A</span>
                <span className="text-[11px] text-[#8C7A6B] font-semibold">(82%)</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium text-[#1F140E]">
                <span className="font-bold text-[#6E3B1C]">#3</span>
                <span>Garden Terrace</span>
                <span className="text-[11px] text-[#8C7A6B] font-semibold">(74%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
