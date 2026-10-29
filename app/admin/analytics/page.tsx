'use client';

import * as React from 'react';
import { AppShell } from '@/components/shell/AppShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronDown } from 'lucide-react';
import {
  getAllAnalytics,
  getAnalyticsOverview,
  getEventsCreatedSeries,
  getOrganizerGrowth,
  getVoiceRsvpAdoption,
  type AnalyticsOverview,
  type EventsCreatedPoint,
  type OrganizerGrowthPoint,
  type VoiceRsvpAdoption,
} from '@/lib/api/admin-dashboard';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

const VOICE_COLORS = {
  Button: '#2D5A43',
  'Voice Note': '#5C2818',
  'Text Reply': '#D4A373',
};

function formatCount(value: number) {
  const count = Number(value) || 0;
  if (Math.abs(count) >= 1000) {
    return `${(count / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  }
  return count.toLocaleString('en-NG');
}

function rangeParam(value: string): '6_months' | '12_months' {
  return value === '12m' ? '12_months' : '6_months';
}

export default function AdminAnalyticsPage() {
  const [timeRangeGrowth, setTimeRangeGrowth] = React.useState('6m');
  const [timeRangeEvents, setTimeRangeEvents] = React.useState('6m');
  const [overview, setOverview] = React.useState<AnalyticsOverview | null>(null);
  const [growth, setGrowth] = React.useState<OrganizerGrowthPoint[]>([]);
  const [events, setEvents] = React.useState<EventsCreatedPoint[]>([]);
  const [voice, setVoice] = React.useState<VoiceRsvpAdoption | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  const monthLabel = overview?.periodLabel || new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

  React.useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    const growthRange = rangeParam(timeRangeGrowth);
    const eventsRange = rangeParam(timeRangeEvents);

    const request =
      growthRange === eventsRange
        ? getAllAnalytics(growthRange).then((data) => ({
            overview: data.overview,
            voice: data.voiceRsvpAdoption,
            growth: data.organizerGrowth?.data || [],
            events: data.eventsCreated?.data || [],
          }))
        : Promise.all([
            getAnalyticsOverview(),
            getVoiceRsvpAdoption(),
            getOrganizerGrowth(growthRange),
            getEventsCreatedSeries(eventsRange),
          ]).then(([overviewData, voiceData, growthData, eventsData]) => ({
            overview: overviewData,
            voice: voiceData,
            growth: growthData?.data || [],
            events: eventsData?.data || [],
          }));

    request
      .then((data) => {
        if (!active) return;
        setOverview(data.overview);
        setVoice(data.voice);
        setGrowth(data.growth);
        setEvents(data.events);
      })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : 'Analytics could not be loaded');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [timeRangeGrowth, timeRangeEvents]);

  const voiceSlices = voice
    ? [
        { name: 'Button', value: voice.breakdown.button.percentage, color: VOICE_COLORS.Button },
        { name: 'Voice Note', value: voice.breakdown.voiceNote.percentage, color: VOICE_COLORS['Voice Note'] },
        { name: 'Text Reply', value: voice.breakdown.textReply.percentage, color: VOICE_COLORS['Text Reply'] },
      ].filter((slice) => slice.value > 0)
    : [];

  const cards = [
    { value: overview ? formatCount(overview.newOrganizers.count) : '—', label: 'New Organizers', hint: monthLabel },
    { value: overview ? formatCount(overview.eventsCreated.count) : '—', label: 'Events Created', hint: monthLabel },
    { value: overview ? formatCount(overview.rsvpsProcessed.count) : '—', label: 'RSVPs Processed', hint: monthLabel },
    { value: overview ? formatCount(overview.whatsappMessagesSent.count) : '—', label: 'WhatsApp Messages Sent', hint: monthLabel },
    { value: overview ? `${overview.voiceRsvpUsage.percentage}%` : '—', label: 'Voice RSVP Usage', hint: 'Of total responses' },
    { value: overview ? formatCount(overview.checkInVolume.count) : '—', label: 'Check-in Volume', hint: 'Across all events' },
  ];

  return (
    <AppShell currentRole="admin">
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-serif font-semibold tracking-tight text-foreground">
            Analytics
          </h1>
          <p className="text-xs text-muted-foreground">
            Platform-wide usage and growth
          </p>
        </div>

        {loading && !overview && (
          <p className="text-xs text-muted-foreground">Loading analytics from the platform…</p>
        )}

        {error && (
          <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((card) => (
            <Card key={card.label} className="border-border/80 shadow-2xs">
              <CardContent className="p-5 space-y-1">
                <span className="text-3xl font-serif font-semibold text-[#6D3A1B] dark:text-[#D4A373] block">
                  {card.value}
                </span>
                <p className="text-xs font-semibold text-foreground pt-1">{card.label}</p>
                <p className="text-[11px] text-muted-foreground">{card.hint}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card className="border-border/80 shadow-2xs">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">Organizer Growth</CardTitle>
                <div className="relative">
                  <select
                    aria-label="Growth Time Range"
                    value={timeRangeGrowth}
                    onChange={(event) => setTimeRangeGrowth(event.target.value)}
                    className="appearance-none pl-3 pr-7 py-1 text-xs rounded-lg border border-border/80 bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 cursor-pointer"
                  >
                    <option value="6m">Last 6 month</option>
                    <option value="12m">Last 12 month</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground pointer-events-none absolute right-2 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={growth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-border/50" />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={11} />
                    <YAxis tickLine={false} axisLine={false} fontSize={11} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--card)',
                        borderColor: 'var(--border)',
                        borderRadius: '0.5rem',
                        fontSize: '12px',
                      }}
                    />
                    <Line type="monotone" dataKey="individual" name="Individual" stroke="#60A5FA" strokeWidth={2} dot={{ r: 4, fill: '#60A5FA' }} />
                    <Line type="monotone" dataKey="agency" name="Agency" stroke="#F97316" strokeWidth={2} dot={{ r: 4, fill: '#F97316' }} />
                    <Line type="monotone" dataKey="venue" name="Venue" stroke="#34D399" strokeWidth={2} dot={{ r: 4, fill: '#34D399' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-center gap-6 pt-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#60A5FA]" />
                  <span>Individual</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F97316]" />
                  <span>Agency</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#34D399]" />
                  <span>Venue</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-2xs">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">Events Created Over Time</CardTitle>
                <div className="relative">
                  <select
                    aria-label="Events Time Range"
                    value={timeRangeEvents}
                    onChange={(event) => setTimeRangeEvents(event.target.value)}
                    className="appearance-none pl-3 pr-7 py-1 text-xs rounded-lg border border-border/80 bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 cursor-pointer"
                  >
                    <option value="6m">Last 6 month</option>
                    <option value="12m">Last 12 month</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground pointer-events-none absolute right-2 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={events} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-border/50" />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={11} />
                    <YAxis tickLine={false} axisLine={false} fontSize={11} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--card)',
                        borderColor: 'var(--border)',
                        borderRadius: '0.5rem',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="eventsCount" name="Events" fill="#4A2016" radius={[6, 6, 0, 0]} maxBarSize={36} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/80 shadow-2xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Voice RSVP Adoption</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="relative h-64 w-full flex items-center justify-center">
              {voice && voice.totalResponses === 0 ? (
                <p className="text-xs text-muted-foreground">No RSVP responses yet.</p>
              ) : voiceSlices.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={voiceSlices}
                      cx="50%"
                      cy="50%"
                      innerRadius={75}
                      outerRadius={105}
                      paddingAngle={2}
                      dataKey="value"
                      startAngle={90}
                      endAngle={-270}
                    >
                      {voiceSlices.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [`${value}%`, 'Share']}
                      contentStyle={{
                        backgroundColor: 'var(--card)',
                        borderColor: 'var(--border)',
                        borderRadius: '0.5rem',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : null}

              {voice && voice.totalResponses > 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-serif font-bold text-foreground">
                    {voice.breakdown.voiceNote.percentage}%
                  </span>
                  <span className="text-xs text-muted-foreground font-sans">Voice Notes</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-4 text-xs">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: VOICE_COLORS.Button }} />
                <span className="font-medium text-foreground">Button:</span>
                <span className="font-semibold text-foreground">
                  {voice ? `${voice.breakdown.button.count} · ${voice.breakdown.button.percentage}%` : '—'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: VOICE_COLORS['Voice Note'] }} />
                <span className="font-medium text-foreground">Voice Note:</span>
                <span className="font-semibold text-foreground">
                  {voice ? `${voice.breakdown.voiceNote.count} · ${voice.breakdown.voiceNote.percentage}%` : '—'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: VOICE_COLORS['Text Reply'] }} />
                <span className="font-medium text-foreground">Text Reply:</span>
                <span className="font-semibold text-foreground">
                  {voice ? `${voice.breakdown.textReply.count} · ${voice.breakdown.textReply.percentage}%` : '—'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
