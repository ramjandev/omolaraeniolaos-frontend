'use client';

import * as React from 'react';
import { AppShell } from '@/components/shell/AppShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronDown } from 'lucide-react';
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

const GROWTH_DATA = [
  { month: 'Jan', individual: 14, agency: 2, venue: 4 },
  { month: 'Feb', individual: 23, agency: 5, venue: 12 },
  { month: 'Mar', individual: 31, agency: 9, venue: 20 },
  { month: 'Apr', individual: 36, agency: 15, venue: 26 },
  { month: 'May', individual: 43, agency: 22, venue: 30 },
  { month: 'Jun', individual: 48, agency: 26, venue: 38 },
];

const EVENTS_CREATED_DATA = [
  { month: 'Jan', count: 110 },
  { month: 'Feb', count: 210 },
  { month: 'Mar', count: 110 },
  { month: 'Apr', count: 205 },
  { month: 'May', count: 170 },
  { month: 'Jun', count: 220 },
];

const VOICE_ADOPTION_DATA = [
  { name: 'Button', value: 52, color: '#2D5A43' },
  { name: 'Voice Note', value: 32, color: '#5C2818' },
  { name: 'Text Reply', value: 16, color: '#D4A373' },
];

export default function AdminAnalyticsPage() {
  const [timeRangeGrowth, setTimeRangeGrowth] = React.useState('6m');
  const [timeRangeEvents, setTimeRangeEvents] = React.useState('6m');

  return (
    <AppShell currentRole="admin">
      <div className="space-y-6">
        {/* Header matching Event Details Page-3.png */}
        <div className="space-y-1">
          <h1 className="text-2xl font-serif font-semibold tracking-tight text-foreground">
            Analytics
          </h1>
          <p className="text-xs text-muted-foreground">
            Platform-wide usage and growth
          </p>
        </div>

        {/* 6 Top Metric Cards (3 cols x 2 rows) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Card 1: New Organizers */}
          <Card className="border-border/80 shadow-2xs">
            <CardContent className="p-5 space-y-1">
              <span className="text-3xl font-serif font-semibold text-[#6D3A1B] dark:text-[#D4A373] block">
                7
              </span>
              <p className="text-xs font-semibold text-foreground pt-1">New Organizers</p>
              <p className="text-[11px] text-muted-foreground">September 2026</p>
            </CardContent>
          </Card>

          {/* Card 2: Events Created */}
          <Card className="border-border/80 shadow-2xs">
            <CardContent className="p-5 space-y-1">
              <span className="text-3xl font-serif font-semibold text-[#6D3A1B] dark:text-[#D4A373] block">
                58
              </span>
              <p className="text-xs font-semibold text-foreground pt-1">Events Created</p>
              <p className="text-[11px] text-muted-foreground">September 2026</p>
            </CardContent>
          </Card>

          {/* Card 3: RSVPs Processed */}
          <Card className="border-border/80 shadow-2xs">
            <CardContent className="p-5 space-y-1">
              <span className="text-3xl font-serif font-semibold text-[#6D3A1B] dark:text-[#D4A373] block">
                6,840
              </span>
              <p className="text-xs font-semibold text-foreground pt-1">RSVPs Processed</p>
              <p className="text-[11px] text-muted-foreground">September 2026</p>
            </CardContent>
          </Card>

          {/* Card 4: WhatsApp Messages Sent */}
          <Card className="border-border/80 shadow-2xs">
            <CardContent className="p-5 space-y-1">
              <span className="text-3xl font-serif font-semibold text-[#6D3A1B] dark:text-[#D4A373] block">
                31.4K
              </span>
              <p className="text-xs font-semibold text-foreground pt-1">WhatsApp Messages Sent</p>
              <p className="text-[11px] text-muted-foreground">September 2026</p>
            </CardContent>
          </Card>

          {/* Card 5: Voice RSVP Usage */}
          <Card className="border-border/80 shadow-2xs">
            <CardContent className="p-5 space-y-1">
              <span className="text-3xl font-serif font-semibold text-[#6D3A1B] dark:text-[#D4A373] block">
                47%
              </span>
              <p className="text-xs font-semibold text-foreground pt-1">Voice RSVP Usage</p>
              <p className="text-[11px] text-muted-foreground">Of total responses</p>
            </CardContent>
          </Card>

          {/* Card 6: Check-in Volume */}
          <Card className="border-border/80 shadow-2xs">
            <CardContent className="p-5 space-y-1">
              <span className="text-3xl font-serif font-semibold text-[#6D3A1B] dark:text-[#D4A373] block">
                3,210
              </span>
              <p className="text-xs font-semibold text-foreground pt-1">Check-in Volume</p>
              <p className="text-[11px] text-muted-foreground">Across all events</p>
            </CardContent>
          </Card>
        </div>

        {/* Middle Row: Organizer Growth & Events Created Over Time */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Card Left: Organizer Growth */}
          <Card className="border-border/80 shadow-2xs">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">Organizer Growth</CardTitle>
                <div className="relative">
                  <select
                    aria-label="Growth Time Range"
                    value={timeRangeGrowth}
                    onChange={(e) => setTimeRangeGrowth(e.target.value)}
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
                  <LineChart data={GROWTH_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-border/50" />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={11} />
                    <YAxis tickLine={false} axisLine={false} fontSize={11} domain={[0, 50]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--card)',
                        borderColor: 'var(--border)',
                        borderRadius: '0.5rem',
                        fontSize: '12px',
                      }}
                    />
                    <Line type="monotone" dataKey="individual" stroke="#60A5FA" strokeWidth={2} dot={{ r: 4, fill: '#60A5FA' }} />
                    <Line type="monotone" dataKey="agency" stroke="#F97316" strokeWidth={2} dot={{ r: 4, fill: '#F97316' }} />
                    <Line type="monotone" dataKey="venue" stroke="#34D399" strokeWidth={2} dot={{ r: 4, fill: '#34D399' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              {/* Chart Legend */}
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

          {/* Card Right: Events Created Over Time */}
          <Card className="border-border/80 shadow-2xs">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">Events Created Over Time</CardTitle>
                <div className="relative">
                  <select
                    aria-label="Events Time Range"
                    value={timeRangeEvents}
                    onChange={(e) => setTimeRangeEvents(e.target.value)}
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
                  <BarChart data={EVENTS_CREATED_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-border/50" />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={11} />
                    <YAxis tickLine={false} axisLine={false} fontSize={11} domain={[0, 250]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--card)',
                        borderColor: 'var(--border)',
                        borderRadius: '0.5rem',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="count" fill="#4A2016" radius={[6, 6, 0, 0]} maxBarSize={36} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="pt-3" />
            </CardContent>
          </Card>
        </div>

        {/* Bottom Card: Voice RSVP Adoption */}
        <Card className="border-border/80 shadow-2xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Voice RSVP Adoption</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="relative h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={VOICE_ADOPTION_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={75}
                    outerRadius={105}
                    paddingAngle={2}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                  >
                    {VOICE_ADOPTION_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      borderColor: 'var(--border)',
                      borderRadius: '0.5rem',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Center Donut Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-serif font-bold text-foreground">32%</span>
                <span className="text-xs text-muted-foreground font-sans">Voice Notes</span>
              </div>
            </div>

            {/* Bottom Legend */}
            <div className="flex items-center justify-center gap-6 pt-4 text-xs">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <span className="font-medium text-foreground">Button:</span>
                <span className="font-semibold text-foreground">52%</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <span className="font-medium text-foreground">Voice Note:</span>
                <span className="font-semibold text-foreground">32%</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <span className="font-medium text-foreground">Text Reply:</span>
                <span className="font-semibold text-foreground">16%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
