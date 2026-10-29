'use client';

import * as React from 'react';
import { Download } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { getAgencyReport, type AgencyReport } from '@/lib/api/agency-dashboard';

const RANGES = [
  { id: 'this_month', label: 'This Month' },
  { id: 'last_month', label: 'Last Month' },
  { id: 'last_3_months', label: 'Last 3 Months' },
  { id: 'this_year', label: 'This Year' },
  { id: 'custom', label: 'Custom' },
] as const;

const TYPE_COLORS = ['#6E3B1C', '#C4A574', '#8C7D73', '#3F342C', '#E7D3C4'];

function money(value: number, currency: string) {
  const amount = Number(value) || 0;
  const prefix = currency === 'NGN' ? '₦' : '$';
  if (Math.abs(amount) >= 1000) {
    const compact = amount / 1000;
    const digits = compact >= 100 ? 0 : 1;
    return `${prefix}${compact.toFixed(digits).replace(/\.0$/, '')}K`;
  }
  return `${prefix}${amount.toLocaleString('en-US')}`;
}

function count(value: number) {
  return (Number(value) || 0).toLocaleString('en-US');
}

export function AgencyReports() {
  const [range, setRange] = React.useState<(typeof RANGES)[number]['id']>('this_month');
  const [from, setFrom] = React.useState('');
  const [to, setTo] = React.useState('');
  const [eventId, setEventId] = React.useState('');
  const [clientId, setClientId] = React.useState('');
  const [report, setReport] = React.useState<AgencyReport | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    getAgencyReport({
      range,
      from: range === 'custom' ? from : undefined,
      to: range === 'custom' ? to : undefined,
      eventId: eventId || undefined,
      clientId: clientId || undefined,
    })
      .then((data) => {
        if (active) setReport(data);
      })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : 'Reports could not be loaded');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [clientId, eventId, from, range, to]);

  const metrics = report?.metrics;
  const currency = report?.currency || 'USD';
  const period = report?.periodLabel || '';

  const exportReport = () => {
    if (!report) return;
    const lines = [
      'Metric,Value',
      `Total Events,${metrics?.totalEvents ?? 0}`,
      `Active Events,${metrics?.activeEvents ?? 0}`,
      `Total Guests,${metrics?.totalGuests ?? 0}`,
      `RSVP Rate,${metrics?.rsvpRate ?? 0}%`,
      `Confirmed Guests,${metrics?.confirmedGuests ?? 0}`,
      `Events Completed,${metrics?.eventsCompleted ?? 0}`,
      `Total Revenue,${metrics?.totalRevenue ?? 0}`,
      `Average Guests,${metrics?.avgGuests ?? 0}`,
      '',
      'Month,Active,Completed,Created,Revenue',
      ...report.performance.map((row, index) =>
        `${row.month},${row.active},${row.completed},${row.created},${report.revenue[index]?.amount ?? 0}`,
      ),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'agency-report.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="font-serif text-4xl font-medium text-[#1F140E]">Reports</h1>
          <p className="mt-1 text-sm text-[#736B66]">Agency-wide event performance and business analytics</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap rounded-xl border border-[#E7E1DA] bg-white p-1">
            {RANGES.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setRange(item.id)}
                className={`rounded-lg px-3 py-1.5 text-xs ${
                  range === item.id ? 'bg-[#F7F1EA] font-medium text-[#1F140E]' : 'text-[#736B66]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <select
            value={eventId}
            onChange={(event) => setEventId(event.target.value)}
            className="h-9 rounded-xl border border-[#E7E1DA] bg-white px-3 text-xs text-[#3F342C]"
          >
            <option value="">All Events</option>
            {report?.filters.events.map((event) => (
              <option key={event.id} value={event.id}>{event.title}</option>
            ))}
          </select>
          <select
            value={clientId}
            onChange={(event) => setClientId(event.target.value)}
            className="h-9 rounded-xl border border-[#E7E1DA] bg-white px-3 text-xs text-[#3F342C]"
          >
            <option value="">All Clients</option>
            {report?.filters.clients.map((client) => (
              <option key={client.id} value={client.id}>{client.name}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={exportReport}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-[#241710] px-3 text-xs font-medium text-white"
          >
            <Download className="size-3.5" />
            Export Report
          </button>
        </div>
      </div>

      {range === 'custom' && (
        <div className="flex flex-wrap gap-2">
          <input type="date" value={from} onChange={(event) => setFrom(event.target.value)} className="h-9 rounded-xl border border-[#E7E1DA] bg-white px-3 text-xs" />
          <input type="date" value={to} onChange={(event) => setTo(event.target.value)} className="h-9 rounded-xl border border-[#E7E1DA] bg-white px-3 text-xs" />
        </div>
      )}

      {loading && <p className="text-sm text-[#736B66]">Loading reports…</p>}
      {error && <p className="text-sm text-[#B33927]">{error}</p>}

      {report && metrics && (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Metric value={count(metrics.totalEvents)} label="Total Events" hint={period} />
            <Metric value={count(metrics.activeEvents)} label="Active Events" hint="Currently running" />
            <Metric value={count(metrics.totalGuests)} label="Total Guests" hint="Across all events" />
            <Metric value={`${metrics.rsvpRate}%`} label="RSVP Rate" hint="Overall response rate" />
            <Metric value={count(metrics.confirmedGuests)} label="Confirmed Guests" hint="RSVPs accepted" />
            <Metric value={count(metrics.eventsCompleted)} label="Events Completed" hint="This period" />
            <Metric value={money(metrics.totalRevenue, currency)} label="Total Revenue" hint={period} />
            <Metric value={count(metrics.avgGuests)} label="Avg Guests / Event" hint="Across all events" />
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <ChartCard title="Event Performance Over Time">
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={report.performance}>
                  <CartesianGrid stroke="#F1EBE4" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#8C7D73' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#8C7D73' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="active" name="Active" stroke="#2F6B4F" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="completed" name="Completed" stroke="#1F140E" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="created" name="Created" stroke="#C4A574" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="RSVP Performance" extra={`Overall rate: ${metrics.rsvpRate}%`}>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={report.rsvp}>
                  <CartesianGrid stroke="#F1EBE4" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#8C7D73' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#8C7D73' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="confirmed" name="Confirmed" stackId="rsvp" fill="#2F6B4F" />
                  <Bar dataKey="declined" name="Declined" stackId="rsvp" fill="#8C3A32" />
                  <Bar dataKey="noResponse" name="No Response" stackId="rsvp" fill="#6E3B1C" />
                  <Bar dataKey="pending" name="Pending" stackId="rsvp" fill="#D7B59A" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Guest Attendance" extra={`Attendance rate: ${metrics.attendanceRate}%`}>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={report.attendance}>
                  <CartesianGrid stroke="#F1EBE4" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#8C7D73' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#8C7D73' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="attended" name="Attended" fill="#C4A574" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="confirmed" name="Confirmed" fill="#8C5A32" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="invited" name="Invited" fill="#6E3B1C" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Event Performance by Client">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={report.byClient} layout="vertical" margin={{ left: 16 }}>
                  <CartesianGrid stroke="#F1EBE4" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#8C7D73' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 11, fill: '#3F342C' }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="count" name="Events" fill="#6E3B1C" radius={[0, 4, 4, 0]} barSize={14} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
            <ChartCard title="Revenue Overview" extra={`Total: ${money(metrics.totalRevenue, currency)}  Avg/event: ${money(metrics.avgRevenue, currency)}`}>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={report.revenue}>
                  <CartesianGrid stroke="#F1EBE4" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#8C7D73' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#8C7D73' }} axisLine={false} tickLine={false} tickFormatter={(value) => money(Number(value), currency)} />
                  <Tooltip formatter={(value) => money(Number(value), currency)} />
                  <Line type="monotone" dataKey="amount" name="Revenue" stroke="#6E3B1C" strokeWidth={2} dot={{ r: 3, fill: '#6E3B1C' }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Event Types">
              <div className="grid items-center gap-4 sm:grid-cols-[180px_1fr]">
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={report.eventTypes} dataKey="value" nameKey="name" innerRadius={52} outerRadius={78} paddingAngle={2}>
                      {report.eventTypes.map((entry, index) => (
                        <Cell key={entry.name} fill={TYPE_COLORS[index % TYPE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <ul className="space-y-2 text-sm">
                  {report.eventTypes.map((entry, index) => (
                    <li key={entry.name} className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-2 text-[#3F342C]">
                        <span className="size-2.5 rounded-full" style={{ background: TYPE_COLORS[index % TYPE_COLORS.length] }} />
                        {entry.name}
                      </span>
                      <span className="font-medium text-[#1F140E]">{entry.percent}%</span>
                    </li>
                  ))}
                </ul>
              </div>
            </ChartCard>
          </div>
        </>
      )}
    </div>
  );
}

function Metric({ value, label, hint }: { value: string; label: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-[#EBE3D9] bg-white px-4 py-4">
      <p className="text-xs text-[#8C7D73]">{label}</p>
      <p className="mt-2 font-serif text-3xl text-[#6E3B1C]">{value}</p>
      <p className="mt-1 text-xs text-[#A39890]">{hint}</p>
    </div>
  );
}

function ChartCard({ title, extra, children }: { title: string; extra?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-[#EBE3D9] bg-white p-4">
      <div className="mb-2 flex items-start justify-between gap-3">
        <h2 className="text-sm font-semibold text-[#1F140E]">{title}</h2>
        {extra ? <p className="text-xs text-[#8C7D73]">{extra}</p> : null}
      </div>
      {children}
    </section>
  );
}
