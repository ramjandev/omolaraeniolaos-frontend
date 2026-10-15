'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  MoreVertical,
  Eye,
  Edit2,
  Armchair,
  MapPin,
} from 'lucide-react';
import { AppShell } from '@/components/shell/AppShell';
import { MOCK_VENUE_SPACES } from '@/lib/mock-data/venue';

type VenueStatusFilter = 'All' | 'Available' | 'Occupied';

export default function VenueSpacesPage() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] =
    React.useState<VenueStatusFilter>('All');

  const filteredVenues = React.useMemo(() => {
    return MOCK_VENUE_SPACES.filter((space) => {
      const matchesSearch =
        space.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        space.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        space.type.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === 'All' ? true : space.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter]);

  return (
    <AppShell currentRole="organizer_venue">
      <div className="space-y-7 w-full pb-12">
        {/* Header matching Figma: "Venues & Spaces" + "+ Add Venue" */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1F140E] tracking-tight">
              Venues & Spaces
            </h1>
            <p className="text-xs sm:text-sm text-[#71717A] mt-1 font-sans">
              Manage your venues, spaces, availability, and seating.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1F140E] text-white hover:bg-[#342217] text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Venue</span>
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

          {/* Card 2: Total Spaces */}
          <div className="p-5 rounded-2xl bg-white border border-[#EFECE6] shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold font-sans text-[#1F140E]">14</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                + 18%
              </span>
            </div>
            <div className="mt-2">
              <p className="text-sm font-semibold text-[#1F140E]">Total Spaces</p>
              <p className="text-xs text-[#8C7A6B]">Configured areas</p>
            </div>
          </div>

          {/* Card 3: Available Now */}
          <div className="p-5 rounded-2xl bg-white border border-[#EFECE6] shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold font-sans text-[#1F140E]">2</span>
            </div>
            <div className="mt-2">
              <p className="text-sm font-semibold text-[#1F140E]">Available Now</p>
              <p className="text-xs text-[#8C7A6B]">Open for booking</p>
            </div>
          </div>

          {/* Card 4: Currently Occupied */}
          <div className="p-5 rounded-2xl bg-white border border-[#EFECE6] shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold font-sans text-[#1F140E]">3</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                ↑ 5%
              </span>
            </div>
            <div className="mt-2">
              <p className="text-sm font-semibold text-[#1F140E]">Currently Occupied</p>
              <p className="text-xs text-[#8C7A6B]">In active use</p>
            </div>
          </div>
        </div>

        {/* Search & Status Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 text-[#8C7A6B] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#E5E0D8] bg-white focus:outline-none focus:ring-1 focus:ring-[#6E3B1C] text-[#1F140E] placeholder:text-[#8C7A6B] shadow-2xs transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as VenueStatusFilter)
              }
              className="px-3.5 py-2 text-xs rounded-xl border border-[#E5E0D8] bg-white text-[#1F140E] focus:outline-none focus:ring-1 focus:ring-[#6E3B1C] shadow-2xs"
            >
              <option value="All">Status: All</option>
              <option value="Available">Available</option>
              <option value="Occupied">Occupied</option>
            </select>
          </div>
        </div>

        {/* Grid of Venue Cards matching Figma */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVenues.map((space) => (
            <div
              key={space.id}
              className="rounded-2xl bg-white border border-[#EFECE6] shadow-2xs overflow-hidden flex flex-col justify-between hover:shadow-xs hover:border-[#D4CFC7] transition-all"
            >
              {/* Image & Badges */}
              <div>
                <div className="h-48 w-full relative overflow-hidden bg-muted group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={space.image}
                    alt={space.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Status badge on top left */}
                  <div className="absolute top-3 left-3">
                    <span
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-2xs ${
                        space.status === 'Occupied'
                          ? 'bg-[#1F140E]/90 text-white backdrop-blur-xs'
                          : 'bg-emerald-600/90 text-white backdrop-blur-xs'
                      }`}
                    >
                      {space.status}
                    </span>
                  </div>

                  {/* Three-dots menu on top right */}
                  <div className="absolute top-3 right-3">
                    <button
                      type="button"
                      className="w-7 h-7 rounded-full bg-white/80 hover:bg-white text-[#1F140E] flex items-center justify-center backdrop-blur-xs shadow-2xs transition-colors"
                      aria-label="More options"
                    >
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 space-y-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-base text-[#1F140E] leading-snug">
                        {space.name}
                      </h3>
                      <p className="text-xs text-[#8C7A6B] flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-[#8C7A6B] shrink-0" />
                        <span className="truncate">{space.address}</span>
                      </p>
                    </div>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#FAF4EF] text-[#6E3B1C] border border-[#F2E5D7] shrink-0">
                      {space.type}
                    </span>
                  </div>

                  {/* Capacity & Spaces Specs */}
                  <div className="flex items-center justify-between text-xs text-[#8C7A6B] pt-1">
                    <span>
                      <strong className="text-[#1F140E] font-semibold">{space.capacity}</strong> cap.
                    </span>
                    <span>·</span>
                    <span>
                      <strong className="text-[#1F140E] font-semibold">{space.spacesCount}</strong> spaces
                    </span>
                    <span>·</span>
                    <span className="font-medium text-[#1F140E]">{space.utilization}%</span>
                  </div>

                  {/* Brown Progress Bar */}
                  <div className="w-full h-2 rounded-full bg-[#EFECE6] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#6E3B1C] transition-all"
                      style={{ width: `${space.utilization}%` }}
                    />
                  </div>

                  {/* Next Booking Box matching Figma */}
                  {space.nextBooking && (
                    <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EFECE6] space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-[#8C7A6B] font-medium">Next booking:</span>
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                            space.nextBooking.status === 'Confirmed'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {space.nextBooking.status}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-[#1F140E] truncate">
                        {space.nextBooking.event}
                      </p>
                      <p className="text-[11px] text-[#8C7A6B]">
                        {space.nextBooking.date}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Action Buttons: View, Edit, Seating */}
              <div className="p-5 pt-0 grid grid-cols-3 gap-2 border-t border-[#F4F1EB] mt-2 pt-3">
                <Link
                  href={`/organizer/venue/spaces/${space.id}`}
                  className="inline-flex items-center justify-center gap-1 py-2 px-2 rounded-xl bg-[#FAF8F5] hover:bg-[#F2ECE4] text-[#1F140E] text-xs font-semibold transition-colors border border-[#EFECE6]"
                >
                  <Eye className="w-3.5 h-3.5 text-[#8C7A6B]" />
                  <span>View</span>
                </Link>

                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-1 py-2 px-2 rounded-xl bg-[#FAF8F5] hover:bg-[#F2ECE4] text-[#1F140E] text-xs font-semibold transition-colors border border-[#EFECE6]"
                >
                  <Edit2 className="w-3.5 h-3.5 text-[#8C7A6B]" />
                  <span>Edit</span>
                </button>

                <Link
                  href="/organizer/venue/tables"
                  className="inline-flex items-center justify-center gap-1 py-2 px-2 rounded-xl bg-[#FAF8F5] hover:bg-[#F2ECE4] text-[#1F140E] text-xs font-semibold transition-colors border border-[#EFECE6]"
                >
                  <Armchair className="w-3.5 h-3.5 text-[#8C7A6B]" />
                  <span>Seating</span>
                </Link>
              </div>
            </div>
          ))}

          {/* 6th Card: Add New Venue (Dashed Card matching Figma) */}
          <div className="rounded-2xl border-2 border-dashed border-[#D4CFC7] bg-[#FAF8F5]/40 hover:bg-[#FAF8F5] transition-all p-8 flex flex-col items-center justify-center text-center min-h-[380px] cursor-pointer group">
            <div className="w-12 h-12 rounded-full bg-white border border-[#E5E0D8] text-[#6E3B1C] flex items-center justify-center mb-3 group-hover:bg-[#6E3B1C] group-hover:text-white transition-all shadow-2xs">
              <Plus className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-sm text-[#1F140E]">Add New Venue</h4>
            <p className="text-xs text-[#8C7A6B] max-w-[200px] mt-1">
              Create a new venue profile and configure spaces.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
