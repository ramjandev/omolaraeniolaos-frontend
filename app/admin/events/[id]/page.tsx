'use client';

import * as React from 'react';
import { Flag, Calendar, Clock, Users } from 'lucide-react';
import { AppShell } from '@/components/shell/AppShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AdminEventDetailPage() {
  return (
    <AppShell currentRole="admin">
      <div className="space-y-6">
        {/* Top Flag Action */}
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

        {/* Hero Banner with Background Image & Countdown Timer */}
        <div className="relative rounded-2xl overflow-hidden min-h-[190px] p-6 flex flex-col justify-between shadow-xs border border-border/60 bg-[#4A2016]/90">
          {/* Subtle textured overlay / decorative background */}
          <div
            className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-30"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=1200&q=80')`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />

          {/* Banner Content (Relative on top of overlay) */}
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-serif font-semibold text-white tracking-tight drop-shadow-sm">
                  The Grand Royal Gala & Investiture
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white/20 backdrop-blur-md text-white border border-white/30">
                  Draft
                </span>
              </div>
              <p className="text-xs sm:text-sm text-white/80 font-sans">
                Premium Events Ng · Gala
              </p>
            </div>

            {/* Countdown Glass Card */}
            <div className="px-5 py-3 rounded-xl bg-black/40 backdrop-blur-md border border-white/15 text-white flex items-center gap-4 shrink-0 shadow-lg">
              <div className="text-center">
                <span className="text-xl sm:text-2xl font-serif font-bold block leading-none">38</span>
                <span className="text-[10px] text-white/70 uppercase tracking-wider">Days</span>
              </div>
              <span className="text-white/30 text-lg">|</span>
              <div className="text-center">
                <span className="text-xl sm:text-2xl font-serif font-bold block leading-none">05</span>
                <span className="text-[10px] text-white/70 uppercase tracking-wider">Hour</span>
              </div>
              <span className="text-white/30 text-lg">|</span>
              <div className="text-center">
                <span className="text-xl sm:text-2xl font-serif font-bold block leading-none">25</span>
                <span className="text-[10px] text-white/70 uppercase tracking-wider">Min</span>
              </div>
            </div>
          </div>

          {/* Floating Pill Details Tag */}
          <div className="relative z-10 pt-4 flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-4 px-4 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-white/80" />
                <span>24 October 2026</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-white/80" />
                <span>24 October 2026</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-white/80" />
                <span>24 October 2026</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Metric Cards matching Event Details Page-8.png */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-border/80 shadow-2xs">
            <CardContent className="p-5 space-y-1">
              <span className="text-3xl font-serif font-semibold text-foreground block">
                142
              </span>
              <p className="text-xs font-semibold text-foreground pt-1">Total Invitees</p>
              <p className="text-[11px] text-muted-foreground">All invited guests</p>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-2xs">
            <CardContent className="p-5 space-y-1">
              <span className="text-3xl font-serif font-semibold text-foreground block">
                89
              </span>
              <p className="text-xs font-semibold text-foreground pt-1">Confirmed</p>
              <p className="text-[11px] text-muted-foreground">RSVP confirmed guests</p>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-2xs">
            <CardContent className="p-5 space-y-1">
              <span className="text-3xl font-serif font-semibold text-foreground block">
                --
              </span>
              <p className="text-xs font-semibold text-foreground pt-1">Checked In</p>
              <p className="text-[11px] text-muted-foreground">Gate scan confirmed</p>
            </CardContent>
          </Card>
        </div>

        {/* Bottom 2 Cards: RSVP Breakdown & Event Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Card Left: RSVP Status Breakdown */}
          <Card className="border-border/80 shadow-2xs">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold">
                RSVP Status Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-1">
              {/* Confirmed */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground">Confirmed</span>
                  <span className="font-semibold text-foreground">89 (59%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-[#2D6A4F] rounded-full" style={{ width: '59%' }} />
                </div>
              </div>

              {/* Tentative */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground">Tentative</span>
                  <span className="font-semibold text-foreground">23 (15%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-[#78350F] rounded-full" style={{ width: '15%' }} />
                </div>
              </div>

              {/* Declined */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground">Declined</span>
                  <span className="font-semibold text-foreground">18 (12%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-[#B91C1C] rounded-full" style={{ width: '12%' }} />
                </div>
              </div>

              {/* No Response */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground">No Response</span>
                  <span className="font-semibold text-foreground">20 (13%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-[#71717A] rounded-full" style={{ width: '13%' }} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card Right: Event Details */}
          <Card className="border-border/80 shadow-2xs">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold">
                Event Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-1 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Organizer</span>
                <span className="font-semibold text-foreground">Premium Events Ng</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Organizer Type</span>
                <span className="font-semibold text-foreground">Agency</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Event Date</span>
                <span className="font-semibold text-foreground">24 Oct 2026</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Event Type</span>
                <span className="font-semibold text-foreground">Gala</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Location</span>
                <span className="font-semibold text-foreground">The Monarch Event Centre</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-muted-foreground">Billing</span>
                <span className="font-semibold text-foreground">Included in subscription</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
