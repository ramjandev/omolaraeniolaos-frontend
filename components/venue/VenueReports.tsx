'use client';

import * as React from 'react';
import { Bell, CalendarDays, Download, LineChart, Users } from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { getVenueReport, type VenueReport } from '@/lib/api/venue-reports';

const RANGES = [
  { id: '3', label: 'Last 3 months' },
  { id: '6', label: 'Last 6 months' },
  { id: '12', label: 'Last 12 months' },
];

const SERIES_COLORS = ['#7D9B76', '#6E95C4', '#C4A574', '#8C7D73', '#6E3B1C'];

export function VenueReports() {
  const [range, setRange] = React.useState('3');
  const [spaceId, setSpaceId] = React.useState('');
  const [tab, setTab] = React.useState<'trends' | 'venues' | 'events'>('trends');
  const [report, setReport] = React.useState<VenueReport | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    getVenueReport(range, spaceId || undefined)
      .then((data) => {
        if (active) setReport(data);
      })
      .catch((err: unknown) => {
        if (active) {
          setReport(null);
          setError(err instanceof Error ? err.message : 'Reports could not be loaded');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [range, spaceId]);

  const period = report?.periodLabel || RANGES.find((item) => item.id === range)?.label || 'Last 3 months';

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="font-serif text-4xl font-medium text-[#1F140E]">Reports & Analytics</h1>
          <p className="mt-1 text-sm text-[#736B66]">Venue usage, booking trends, and capacity performance.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={spaceId}
            onChange={(event) => setSpaceId(event.target.value)}
            className="h-10 rounded-xl border border-[#E4DDD6] bg-white px-3 text-sm text-[#3F342C]"
          >
            <option value="">All Venues</option>
            {(report?.spaces || []).map((space) => (
              <option key={space.id} value={space.id}>
                {space.name}
              </option>
            ))}
          </select>
          <select
            value={range}
            onChange={(event) => setRange(event.target.value)}
            className="h-10 rounded-xl border border-[#E4DDD6] bg-white px-3 text-sm text-[#3F342C]"
          >
            {RANGES.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => report && exportReport(report)}
            disabled={!report}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#E4DDD6] bg-white px-3 text-sm font-medium text-[#3F342C] disabled:opacity-50"
          >
            <Download className="size-4" />
            Export
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          icon={<CalendarDays className="size-4" />}
          value={loading ? '—' : formatCount(report?.metrics.totalBookings ?? 0)}
          label="Total Bookings"
          hint={period.toLowerCase()}
          change={report?.metrics.bookingsChange}
        />
        <Metric
          icon={<Bell className="size-4" />}
          value={loading ? '—' : formatCount(report?.metrics.upcoming ?? 0)}
          label="Upcoming Events"
          hint="Next 30 days"
          change={report?.metrics.upcomingChange}
        />
        <Metric
          icon={<LineChart className="size-4" />}
          value={loading ? '—' : `${report?.metrics.utilization ?? 0}%`}
          label="Avg. Venue Utilization"
          hint={spaceId ? 'Selected venue' : 'Across all active venues'}
          change={report?.metrics.utilizationChange}
        />
        <Metric
          icon={<Users className="size-4" />}
          value={loading ? '—' : formatCount(report?.metrics.guests ?? 0)}
          label="Total Guests Hosted"
          hint="Confirmed attendees"
          change={report?.metrics.guestsChange}
        />
      </div>

      {error ? <p className="text-sm text-[#B33927]">{error}</p> : null}

      <div className="flex gap-6 border-b border-[#EFEAE4] text-sm">
        {(
          [
            ['trends', 'Booking Trends'],
            ['venues', 'Venue Performance'],
            ['events', 'Event Breakdown'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`-mb-px border-b-2 pb-3 font-medium ${
              tab === id ? 'border-[#6E3B1C] text-[#6E3B1C]' : 'border-transparent text-[#8C7D73]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'trends' && (
        <div className="space-y-4">
          <div className="grid gap-4 xl:grid-cols-2">
            <ChartCard title="Bookings over time" subtitle="Confirmed + tentative bookings per month">
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={report?.bookingsOverTime || []}>
                  <CartesianGrid vertical={false} stroke="#F3EEE8" />
                  <XAxis dataKey="month" tick={{ fill: '#8C7D73', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fill: '#8C7D73', fontSize: 12 }} axisLine={false} tickLine={false} width={32} />
                  <Tooltip />
                  <Area type="monotone" dataKey="count" name="Bookings" stroke="#6E3B1C" fill="#E7D3C4" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Guest volume over time" subtitle="Total confirmed guests per month across all venues">
              {(report?.guestSeries.length || 0) === 0 ? (
                <EmptyChart label="Guest volume appears after a venue has confirmed guests." />
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={210}>
                    <RechartsLineChart data={report?.guestVolume || []}>
                      <CartesianGrid vertical={false} stroke="#F3EEE8" />
                      <XAxis dataKey="month" tick={{ fill: '#8C7D73', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis allowDecimals={false} tick={{ fill: '#8C7D73', fontSize: 12 }} axisLine={false} tickLine={false} width={36} />
                      <Tooltip />
                      {(report?.guestSeries || []).map((name, index) => (
                        <Line
                          key={name}
                          type="monotone"
                          dataKey={name}
                          stroke={SERIES_COLORS[index % SERIES_COLORS.length]}
                          strokeWidth={2}
                          dot={false}
                        />
                      ))}
                    </RechartsLineChart>
                  </ResponsiveContainer>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#736B66]">
                    {(report?.guestSeries || []).map((name, index) => (
                      <span key={name} className="inline-flex items-center gap-1.5">
                        <span
                          className="size-2 rounded-full"
                          style={{ backgroundColor: SERIES_COLORS[index % SERIES_COLORS.length] }}
                        />
                        {name}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </ChartCard>
          </div>
          <UtilizationCard rows={report?.utilization || []} />
        </div>
      )}

      {tab === 'venues' && (
        <div className="overflow-hidden rounded-2xl border border-[#EBE3D9] bg-white">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-xs text-[#8C7D73]">
              <tr className="border-b border-[#EFEAE4]">
                <th className="px-5 py-3 font-medium">Venue</th>
                <th className="px-3 py-3 font-medium">Bookings</th>
                <th className="px-3 py-3 font-medium">Guests</th>
                <th className="px-3 py-3 font-medium">Upcoming</th>
                <th className="px-5 py-3 font-medium">Utilization</th>
              </tr>
            </thead>
            <tbody>
              {(report?.utilization || []).length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-[#736B66]">
                    Add a venue to see performance for this period.
                  </td>
                </tr>
              ) : (
                (report?.utilization || []).map((row) => (
                  <tr key={row.id} className="border-b border-[#F4EFEA] last:border-0">
                    <td className="px-5 py-4 font-medium text-[#1F140E]">{row.name}</td>
                    <td className="px-3 py-4 text-[#3F342C]">{row.bookings}</td>
                    <td className="px-3 py-4 text-[#3F342C]">{formatCount(row.guests)}</td>
                    <td className="px-3 py-4 text-[#3F342C]">{row.upcoming}</td>
                    <td className="px-5 py-4 text-[#3F342C]">{row.utilization}%</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'events' && (
        <div className="rounded-2xl border border-[#EBE3D9] bg-white p-5">
          <h2 className="font-serif text-2xl text-[#1F140E]">Event breakdown</h2>
          <p className="mt-1 text-sm text-[#8C7D73]">Bookings grouped by event type for {period.toLowerCase()}.</p>
          <div className="mt-5 space-y-4">
            {(report?.breakdown || []).length === 0 ? (
              <p className="text-sm text-[#736B66]">No events in this period.</p>
            ) : (
              (report?.breakdown || []).map((item) => (
                <div key={item.name}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium text-[#1F140E]">{item.name}</span>
                    <span className="text-[#736B66]">
                      {item.bookings} bookings · {formatCount(item.guests)} guests · {item.share}%
                    </span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-[#F3EEE8]">
                    <div className="h-full rounded-full bg-[#6E3B1C]" style={{ width: `${item.share}%` }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Metric({
  icon,
  value,
  label,
  hint,
  change,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  hint: string;
  change?: number | null;
}) {
  const positive = (change ?? 0) >= 0;
  return (
    <div className="rounded-2xl border border-[#EBE3D9] bg-white p-4">
      <div className="flex items-start justify-between">
        <span className="grid size-9 place-items-center rounded-xl bg-[#F6F1EA] text-[#6E3B1C]">{icon}</span>
        {change === null || change === undefined ? null : (
          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${positive ? 'bg-[#E8F6EC] text-[#2F7D4A]' : 'bg-[#FDECEC] text-[#B33927]'}`}>
            {positive ? '+' : ''}
            {change}%
          </span>
        )}
      </div>
      <p className="mt-4 font-serif text-4xl text-[#6E3B1C]">{value}</p>
      <p className="mt-1 text-sm font-medium text-[#1F140E]">{label}</p>
      <p className="text-xs text-[#8C7D73]">{hint}</p>
    </div>
  );
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[#EBE3D9] bg-white p-5">
      <h2 className="font-serif text-2xl text-[#1F140E]">{title}</h2>
      <p className="mt-1 text-sm text-[#8C7D73]">{subtitle}</p>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function EmptyChart({ label }: { label: string }) {
  return <div className="grid h-[240px] place-items-center text-sm text-[#8C7D73]">{label}</div>;
}

function UtilizationCard({ rows }: { rows: VenueReport['utilization'] }) {
  return (
    <div className="rounded-2xl border border-[#EBE3D9] bg-white p-5">
      <h2 className="font-serif text-2xl text-[#1F140E]">Venue utilization</h2>
      <p className="mt-1 text-sm text-[#8C7D73]">Average utilization rate across the portfolio for the selected period.</p>
      <div className="mt-5 space-y-4">
        {rows.length === 0 ? (
          <p className="text-sm text-[#736B66]">Add a venue to see utilization.</p>
        ) : (
          rows.map((row, index) => (
            <div key={row.id} className="grid grid-cols-[160px_1fr_48px] items-center gap-3">
              <div>
                <p className="text-sm font-medium text-[#1F140E]">{row.name}</p>
                <p className="text-xs text-[#8C7D73]">{row.bookings} bookings</p>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-[#F3EEE8]">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min(100, row.utilization)}%`,
                    backgroundColor: index === 0 && row.utilization >= 80 ? '#D64545' : '#8C5A32',
                  }}
                />
              </div>
              <p className="text-right text-sm font-medium text-[#1F140E]">{row.utilization}%</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function formatCount(value: number) {
  return (Number(value) || 0).toLocaleString('en-US');
}

function exportReport(report: VenueReport) {
  const lines = [
    ['Period', report.periodLabel],
    ['Total Bookings', String(report.metrics.totalBookings)],
    ['Upcoming Events', String(report.metrics.upcoming)],
    ['Avg Utilization', `${report.metrics.utilization}%`],
    ['Guests Hosted', String(report.metrics.guests)],
    [],
    ['Month', 'Bookings'],
    ...report.bookingsOverTime.map((row) => [row.month, String(row.count)]),
    [],
    ['Venue', 'Bookings', 'Guests', 'Utilization'],
    ...report.utilization.map((row) => [row.name, String(row.bookings), String(row.guests), `${row.utilization}%`]),
  ];
  const csv = lines.map((line) => line.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'venue-reports.csv';
  link.click();
  URL.revokeObjectURL(url);
}
