'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { Flag, Calendar, Clock, Users } from 'lucide-react';
import { AppShell } from '@/components/shell/AppShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getAdminEventDetail, type AdminEventDetail } from '@/lib/api/admin-dashboard';

const BAR_COLORS: Record<string, string> = {
  Confirmed: '#2D6A4F',
  Tentative: '#78350F',
  Declined: '#B91C1C',
  'No Response': '#71717A',
};

function formatDate(value?: string | null) {
  if (!value) return 'Date not set';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatTime(value?: string | null) {
  if (!value) return 'Time not set';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function statusLabel(status: string) {
  const value = status.replaceAll('_', ' ').toLowerCase();
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function AdminEventDetailPage() {
  const params = useParams();
  const eventId = String(params?.id || '');
  const [detail, setDetail] = React.useState<AdminEventDetail | null>(null);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    if (!eventId) return;
    let active = true;
    getAdminEventDetail(eventId)
      .then((result) => {
        if (active) setDetail(result);
      })
      .catch((err: unknown) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'This event could not be loaded');
      });
    return () => {
      active = false;
    };
  }, [eventId]);

  const event = detail?.event;
  const countdown = event?.countdown;
  const cover = event?.coverImageUrl
    || 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=1200&q=80';

  return (
    <AppShell currentRole="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-end">
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-8 gap-1.5 border-border/80 text-foreground hover:bg-muted"
          >
            <Flag className="w-3.5 h-3.5" />
            <span>Flag</span>
          </Button>
        </div>

        {error && (
          <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        <div className="relative rounded-2xl overflow-hidden min-h-[190px] p-6 flex flex-col justify-between shadow-xs border border-border/60 bg-[#4A2016]/90">
          <div
            className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-30"
            style={{ backgroundImage: `url('${cover}')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />

          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-serif font-semibold text-white tracking-tight drop-shadow-sm">
                  {event?.title || 'Loading event'}
                </h1>
                {event?.status && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white/20 backdrop-blur-md text-white border border-white/30">
                    {statusLabel(event.status)}
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-white/80 font-sans">
                {detail?.eventDetails.organizer || 'Organizer'} · {event?.category || 'Event'}
              </p>
            </div>

            <div className="px-5 py-3 rounded-xl bg-black/40 backdrop-blur-md border border-white/15 text-white flex items-center gap-4 shrink-0 shadow-lg">
              <div className="text-center">
                <span className="text-xl sm:text-2xl font-serif font-bold block leading-none">
                  {String(countdown?.days ?? 0).padStart(2, '0')}
                </span>
                <span className="text-[10px] text-white/70 uppercase tracking-wider">Days</span>
              </div>
              <span className="text-white/30 text-lg">|</span>
              <div className="text-center">
                <span className="text-xl sm:text-2xl font-serif font-bold block leading-none">
                  {String(countdown?.hours ?? 0).padStart(2, '0')}
                </span>
                <span className="text-[10px] text-white/70 uppercase tracking-wider">Hour</span>
              </div>
              <span className="text-white/30 text-lg">|</span>
              <div className="text-center">
                <span className="text-xl sm:text-2xl font-serif font-bold block leading-none">
                  {String(countdown?.minutes ?? 0).padStart(2, '0')}
                </span>
                <span className="text-[10px] text-white/70 uppercase tracking-wider">Min</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-4 flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-4 px-4 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-white/80" />
                <span>{formatDate(event?.startDate)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-white/80" />
                <span>{formatTime(event?.startDate)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-white/80" />
                <span>{detail?.summary.totalInvitees.value ?? 0} guests</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-border/80 shadow-2xs">
            <CardContent className="p-5 space-y-1">
              <span className="text-3xl font-serif font-semibold text-foreground block">
                {detail?.summary.totalInvitees.value ?? '—'}
              </span>
              <p className="text-xs font-semibold text-foreground pt-1">Total Invitees</p>
              <p className="text-[11px] text-muted-foreground">All invited guests</p>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-2xs">
            <CardContent className="p-5 space-y-1">
              <span className="text-3xl font-serif font-semibold text-foreground block">
                {detail?.summary.confirmed.value ?? '—'}
              </span>
              <p className="text-xs font-semibold text-foreground pt-1">Confirmed</p>
              <p className="text-[11px] text-muted-foreground">RSVP confirmed guests</p>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-2xs">
            <CardContent className="p-5 space-y-1">
              <span className="text-3xl font-serif font-semibold text-foreground block">
                {detail?.summary.checkedIn.value ?? '—'}
              </span>
              <p className="text-xs font-semibold text-foreground pt-1">Checked In</p>
              <p className="text-[11px] text-muted-foreground">Gate scan confirmed</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card className="border-border/80 shadow-2xs">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold">RSVP Status Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-1">
              {(detail?.rsvpStatusBreakdown || []).map((row) => (
                <div key={row.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground">{row.label}</span>
                    <span className="font-semibold text-foreground">
                      {row.count} ({row.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${row.percentage}%`,
                        backgroundColor: BAR_COLORS[row.label] || '#71717A',
                      }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-2xs">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold">Event Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-1 text-xs">
              {[
                ['Organizer', detail?.eventDetails.organizer || '—'],
                ['Organizer Type', detail?.eventDetails.organizerType || '—'],
                ['Event Date', formatDate(detail?.eventDetails.eventDate)],
                ['Event Type', detail?.eventDetails.eventType || '—'],
                ['Location', detail?.eventDetails.location || 'Not set'],
                ['Billing', detail?.eventDetails.billing || '—'],
              ].map(([label, value], index, list) => (
                <div
                  key={label}
                  className={`flex items-center justify-between py-1 ${
                    index < list.length - 1 ? 'border-b border-border/40' : ''
                  }`}
                >
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-semibold text-foreground">{value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
