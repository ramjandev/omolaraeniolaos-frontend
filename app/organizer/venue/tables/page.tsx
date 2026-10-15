'use client';

import * as React from 'react';
import {
  ChevronDown,
  ChevronUp,
  MapPin,
  Plus,
  Download,
  Edit2,
  Trash2,
} from 'lucide-react';
import { AppShell } from '@/components/shell/AppShell';
import { MOCK_SEATING_ZONES, TableZone } from '@/lib/mock-data/venue';

type TableStatus = 'Reserved' | 'Available' | 'Unavailable';

export default function VenueTablesPage() {
  const [zones, setZones] = React.useState<TableZone[]>(MOCK_SEATING_ZONES);
  const [expandedZones, setExpandedZones] = React.useState<Record<string, boolean>>({
    'z-1': true,
    'z-2': false,
    'z-3': false,
  });

  const toggleZone = (zoneId: string) => {
    setExpandedZones((prev) => ({
      ...prev,
      [zoneId]: !prev[zoneId],
    }));
  };

  const updateTableStatus = (
    zoneId: string,
    tableId: string,
    newStatus: TableStatus
  ) => {
    setZones((prevZones) =>
      prevZones.map((zone) => {
        if (zone.id !== zoneId) return zone;
        const updatedTables = zone.tables.map((t) =>
          t.id === tableId ? { ...t, status: newStatus } : t
        );
        const availableCount = updatedTables
          .filter((t) => t.status === 'Available')
          .reduce((sum, t) => sum + t.seats, 0);

        return {
          ...zone,
          tables: updatedTables,
          availableSeats: availableCount,
        };
      })
    );
  };

  // Aggregated totals across all zones
  const totalSeats = 102;
  const availableSeats = 42;
  const reservedSeats = 60;
  const unavailableSeats = 0;

  const availablePct = Math.round((availableSeats / totalSeats) * 100);
  const reservedPct = Math.round((reservedSeats / totalSeats) * 100);

  return (
    <AppShell currentRole="organizer_venue">
      <div className="space-y-7 w-full pb-12">
        {/* Header row: Main Hall Seating Layout + Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1F140E] tracking-tight">
              Main Hall Seating Layout
            </h1>
            <p className="text-xs sm:text-sm text-[#8C7A6B] flex items-center gap-1.5 mt-1 font-sans">
              <MapPin className="w-3.5 h-3.5 text-[#8C7A6B]" />
              <span>1 Eko Hotel Drive, Victoria Island, Lagos</span>
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#E5E0D8] text-xs font-semibold text-[#1F140E] hover:bg-[#FAF8F5] transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-[#6E3B1C]" />
              <span>Export Layout</span>
            </button>

            <button
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1F140E] text-white hover:bg-[#342217] text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Zone</span>
            </button>
          </div>
        </div>

        {/* 4 KPI Metric Cards matching Figma */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-[#EFECE6] shadow-2xs">
            <span className="text-3xl font-bold font-sans text-[#1F140E]">
              {totalSeats}
            </span>
            <p className="text-sm font-semibold text-[#1F140E] mt-2">Total Seats</p>
            <p className="text-xs text-[#8C7A6B]">Configured capacity</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#EFECE6] shadow-2xs">
            <span className="text-3xl font-bold font-sans text-emerald-700">
              {availableSeats}
            </span>
            <p className="text-sm font-semibold text-[#1F140E] mt-2">Available</p>
            <p className="text-xs text-emerald-600">Open for reservation</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#EFECE6] shadow-2xs">
            <span className="text-3xl font-bold font-sans text-amber-700">
              {reservedSeats}
            </span>
            <p className="text-sm font-semibold text-[#1F140E] mt-2">Reserved</p>
            <p className="text-xs text-amber-600">Confirmed attendee seats</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#EFECE6] shadow-2xs">
            <span className="text-3xl font-bold font-sans text-[#71717A]">
              {unavailableSeats}
            </span>
            <p className="text-sm font-semibold text-[#1F140E] mt-2">Unavailable</p>
            <p className="text-xs text-[#8C7A6B]">Out of service</p>
          </div>
        </div>

        {/* Capacity Overview Segmented Bar matching Figma */}
        <div className="p-6 rounded-2xl bg-white border border-[#EFECE6] shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#1F140E]">Capacity Overview</h3>
            <span className="text-xs font-semibold text-[#1F140E]">
              {totalSeats} total configured seats
            </span>
          </div>

          {/* Tri-color segmented progress bar */}
          <div className="w-full h-3 rounded-full bg-[#EFECE6] overflow-hidden flex">
            {/* Available Green */}
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${availablePct}%` }}
              title={`Available: ${availableSeats} (${availablePct}%)`}
            />
            {/* Reserved Amber/Red */}
            <div
              className="h-full bg-amber-500 transition-all duration-300"
              style={{ width: `${reservedPct}%` }}
              title={`Reserved: ${reservedSeats} (${reservedPct}%)`}
            />
            {/* Unavailable Gray */}
            <div
              className="h-full bg-[#D4CFC7] transition-all duration-300"
              style={{ width: '0%' }}
            />
          </div>

          {/* Legend below bar */}
          <div className="flex flex-wrap items-center gap-6 pt-1 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-[#1F140E] font-medium">Available: {availableSeats}</span>
              <span className="text-[#8C7A6B]">({availablePct}%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-[#1F140E] font-medium">Reserved: {reservedSeats}</span>
              <span className="text-[#8C7A6B]">({reservedPct}%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D4CFC7]" />
              <span className="text-[#1F140E] font-medium">Unavailable: {unavailableSeats}</span>
              <span className="text-[#8C7A6B]">(0%)</span>
            </div>
          </div>
        </div>

        {/* Zones & Tables Section matching Figma */}
        <div className="space-y-5">
          {zones.map((zone) => {
            const isExpanded = expandedZones[zone.id];

            return (
              <div
                key={zone.id}
                className="rounded-2xl bg-white border border-[#EFECE6] shadow-2xs overflow-hidden"
              >
                {/* Zone Header Bar */}
                <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F4F1EB] bg-[#FAF8F5]/30">
                  <div
                    className="flex items-center gap-3 cursor-pointer select-none"
                    onClick={() => toggleZone(zone.id)}
                  >
                    <button
                      type="button"
                      className="text-[#8C7A6B] hover:text-[#1F140E] transition-colors"
                      aria-label="Toggle Zone"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h3 className="text-base font-bold text-[#1F140E]">
                          Zone: {zone.name}
                        </h3>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                            zone.category === 'VIP'
                              ? 'bg-[#FAF4EF] text-[#6E3B1C] border border-[#F2E5D7]'
                              : zone.category === 'Standard'
                              ? 'bg-[#F4F4F5] text-[#52525B]'
                              : 'bg-blue-50 text-blue-700'
                          }`}
                        >
                          {zone.category}
                        </span>
                      </div>
                      <p className="text-xs text-[#8C7A6B] mt-0.5">
                        {zone.tableCount} tables · {zone.totalSeats} seats · {zone.availableSeats} available
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 self-end sm:self-auto">
                    <button
                      type="button"
                      className="p-1.5 rounded-lg text-[#8C7A6B] hover:text-[#1F140E] hover:bg-[#FAF8F5] transition-colors"
                      title="Edit Zone"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      className="p-1.5 rounded-lg text-[#8C7A6B] hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete Zone"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Zone Tables Grid (Expanded content) */}
                {isExpanded && (
                  <div className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                      {zone.tables.map((table) => (
                        <div
                          key={table.id}
                          className="p-4 rounded-xl bg-white border border-[#E8E4DD] shadow-2xs hover:border-[#6E3B1C] transition-all flex flex-col justify-between space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-base text-[#1F140E]">
                              {table.tableNumber}
                            </span>
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                                table.category === 'VIP'
                                  ? 'bg-[#FAF4EF] text-[#6E3B1C]'
                                  : 'bg-[#F4F4F5] text-[#52525B]'
                              }`}
                            >
                              {table.category}
                            </span>
                          </div>

                          <div className="text-xs text-[#8C7A6B]">
                            <span>{table.seats} seats</span>
                          </div>

                          {/* Status Dropdown Pill matching Figma: ● Reserved ⌵ */}
                          <div className="pt-1 border-t border-[#F4F1EB]">
                            <select
                              value={table.status}
                              onChange={(e) =>
                                updateTableStatus(
                                  zone.id,
                                  table.id,
                                  e.target.value as TableStatus
                                )
                              }
                              className={`w-full py-1.5 px-2.5 text-xs font-semibold rounded-lg border appearance-none cursor-pointer focus:outline-none transition-colors ${
                                table.status === 'Reserved'
                                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                                  : table.status === 'Available'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : 'bg-zinc-100 text-zinc-700 border-zinc-200'
                              }`}
                            >
                              <option value="Reserved">● Reserved</option>
                              <option value="Available">● Available</option>
                              <option value="Unavailable">● Unavailable</option>
                            </select>
                          </div>
                        </div>
                      ))}

                      {/* + Add Table Dashed Card matching Figma */}
                      <div className="p-4 rounded-xl border-2 border-dashed border-[#D4CFC7] bg-[#FAF8F5]/40 hover:bg-[#FAF8F5] transition-all flex flex-col items-center justify-center text-center cursor-pointer min-h-[120px] group">
                        <div className="w-8 h-8 rounded-full bg-white border border-[#E5E0D8] text-[#6E3B1C] flex items-center justify-center mb-1 group-hover:bg-[#6E3B1C] group-hover:text-white transition-all shadow-2xs">
                          <Plus className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-semibold text-[#1F140E]">Add Table</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
