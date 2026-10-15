'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Calendar,
  Phone,
  Mail,
  Building,
  Clock,
  Plus,
  CalendarCheck,
  CheckCircle2,
  CalendarDays,
  FileText,
  User,
  ArrowRight,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AgencyClient } from '@/lib/mock-data/agency';

type Tab = 'overview' | 'events' | 'activity';

export function ClientDetailsView({ client }: { client: AgencyClient }) {
  const [currentTab, setCurrentTab] = React.useState<Tab>('overview');

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Hero Profile Card matching Client details.png */}
      <Card className="rounded-2xl border-border/80 bg-card shadow-xs overflow-hidden">
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <Avatar className="w-16 h-16 md:w-20 md:h-20 rounded-2xl border-2 border-[#D4A373]/30 shadow-xs">
                <AvatarImage src={client.logo} alt={client.name} />
                <AvatarFallback className="rounded-2xl text-lg font-bold bg-[#6E3B1C]/10 text-[#6E3B1C]">
                  {client.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h1 className="font-serif font-bold text-xl md:text-2xl text-foreground">
                    {client.name}
                  </h1>
                  <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-300 dark:border-emerald-800 text-[11px] font-semibold px-2.5 py-0.5 rounded-lg capitalize">
                    {client.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground font-medium">
                  {client.type}
                </p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-1">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#6E3B1C]" />
                    {client.contactEmail}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#6E3B1C]" />
                    {client.contactPhone}
                  </span>
                </div>
              </div>
            </div>

            <Button
              asChild
              className="h-10 px-6 text-xs font-semibold rounded-xl bg-[#6E3B1C] hover:bg-[#5C3117] text-white shadow-xs shrink-0"
            >
              <Link href={`/organizer/agency/events/create?clientId=${client.id}`}>
                <Plus className="w-4 h-4 mr-1.5" />
                <span>+ Create Event</span>
              </Link>
            </Button>
          </div>

          {/* Sub-tabs Bar: Overview, Events, Activity */}
          <div className="flex items-center gap-6 border-b border-border/80 mt-8 -mb-2">
            <button
              type="button"
              onClick={() => setCurrentTab('overview')}
              className={`pb-3 text-xs font-semibold transition-colors relative cursor-pointer ${
                currentTab === 'overview'
                  ? 'text-[#6E3B1C]'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Overview
              {currentTab === 'overview' && (
                <div className="absolute bottom-0 inset-x-0 h-0.5 bg-[#6E3B1C] rounded-full" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setCurrentTab('events')}
              className={`pb-3 text-xs font-semibold transition-colors relative cursor-pointer ${
                currentTab === 'events'
                  ? 'text-[#6E3B1C]'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Events ({client.events?.length || 5})
              {currentTab === 'events' && (
                <div className="absolute bottom-0 inset-x-0 h-0.5 bg-[#6E3B1C] rounded-full" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setCurrentTab('activity')}
              className={`pb-3 text-xs font-semibold transition-colors relative cursor-pointer ${
                currentTab === 'activity'
                  ? 'text-[#6E3B1C]'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Activity
              {currentTab === 'activity' && (
                <div className="absolute bottom-0 inset-x-0 h-0.5 bg-[#6E3B1C] rounded-full" />
              )}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Tab 1: Overview matching Client details.png */}
      {currentTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Metrics & Contact Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Metric Cards Row */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="rounded-2xl border-border/80 bg-card p-5 space-y-1">
                <span className="text-2xl md:text-3xl font-serif font-bold text-foreground">
                  {client.events?.length || client.activeEventsCount + client.completedEventsCount || 5}
                </span>
                <p className="text-xs text-muted-foreground">Total events</p>
              </Card>

              <Card className="rounded-2xl border-border/80 bg-card p-5 space-y-1">
                <span className="text-2xl md:text-3xl font-serif font-bold text-[#6E3B1C]">
                  {client.upcomingEventsCount || 2}
                </span>
                <p className="text-xs text-muted-foreground">Upcoming</p>
              </Card>

              <Card className="rounded-2xl border-border/80 bg-card p-5 space-y-1">
                <span className="text-2xl md:text-3xl font-serif font-bold text-foreground">
                  {client.completedEventsCount || 3}
                </span>
                <p className="text-xs text-muted-foreground">Completed</p>
              </Card>
            </div>

            {/* Contact Details Card */}
            <Card className="rounded-2xl border-border/80 bg-card shadow-xs">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-serif font-bold text-base text-foreground">
                  Contact details
                </h3>

                <div className="divide-y divide-border/60 text-xs">
                  <div className="py-3 flex items-center justify-between">
                    <span className="text-muted-foreground">Email</span>
                    <span className="font-medium text-foreground">{client.contactEmail}</span>
                  </div>

                  <div className="py-3 flex items-center justify-between">
                    <span className="text-muted-foreground">Phone</span>
                    <span className="font-medium text-foreground">{client.contactPhone}</span>
                  </div>

                  <div className="py-3 flex items-center justify-between">
                    <span className="text-muted-foreground">Organization</span>
                    <span className="font-medium text-foreground">{client.organization}</span>
                  </div>

                  <div className="py-3 flex items-center justify-between">
                    <span className="text-muted-foreground">Client since</span>
                    <span className="font-medium text-foreground">{client.clientSince}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Recent Activity Timeline */}
          <div className="space-y-4">
            <Card className="rounded-2xl border-border/80 bg-card shadow-xs">
              <CardContent className="p-6 space-y-5">
                <h3 className="font-serif font-bold text-base text-foreground">
                  Recent activity
                </h3>

                <div className="space-y-4 relative before:absolute before:inset-y-2 before:left-3.5 before:w-0.5 before:bg-border/60">
                  {client.activities && client.activities.length > 0 ? (
                    client.activities.map((act) => (
                      <div key={act.id} className="relative flex items-start gap-4">
                        <div className="w-7 h-7 rounded-full bg-[#6E3B1C]/10 text-[#6E3B1C] flex items-center justify-center shrink-0 z-10">
                          {act.iconType === 'calendar' ? (
                            <Calendar className="w-3.5 h-3.5" />
                          ) : act.iconType === 'user' ? (
                            <User className="w-3.5 h-3.5" />
                          ) : act.iconType === 'check' ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : (
                            <FileText className="w-3.5 h-3.5" />
                          )}
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-xs font-semibold text-foreground">
                            {act.title}
                          </p>
                          <p className="text-[11px] text-muted-foreground leading-tight">
                            {act.description}
                          </p>
                          <span className="text-[10px] text-muted-foreground/70 block pt-0.5">
                            {act.timestamp}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground">No recent activity recorded.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Tab 2: Events matching Client details-1.png */}
      {currentTab === 'events' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif font-bold text-lg text-foreground">Client Productions</h2>
              <p className="text-xs text-muted-foreground">All upcoming and archived events for {client.name}</p>
            </div>
            <Button asChild size="sm" className="bg-[#6E3B1C] text-white hover:bg-[#5C3117] text-xs">
              <Link href={`/organizer/agency/events/create?clientId=${client.id}`}>
                + New Event
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {client.events?.map((ev) => (
              <Card
                key={ev.id}
                className="rounded-2xl border-border/80 bg-card overflow-hidden hover:border-[#6E3B1C]/40 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {ev.image && (
                    <div className="relative h-40 w-full overflow-hidden bg-muted">
                      <img
                        src={ev.image}
                        alt={ev.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 right-3">
                        <Badge
                          className={`text-[10px] font-semibold ${
                            ev.status === 'Planning'
                              ? 'bg-amber-500 text-white'
                              : ev.status === 'Confirmed'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-600 text-white'
                          }`}
                        >
                          {ev.status}
                        </Badge>
                      </div>
                    </div>
                  )}

                  <div className="p-5 space-y-3">
                    <div>
                      <span className="text-[11px] font-semibold text-[#6E3B1C] uppercase tracking-wider">
                        {ev.type}
                      </span>
                      <h3 className="font-serif font-bold text-base text-foreground mt-0.5 line-clamp-1">
                        {ev.title}
                      </h3>
                    </div>

                    <div className="space-y-1.5 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#6E3B1C]" />
                        <span>{ev.date}</span>
                      </div>
                      <div className="flex items-center gap-1.5 line-clamp-1">
                        <MapPin className="w-3.5 h-3.5 text-[#6E3B1C]" />
                        <span>{ev.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[#6E3B1C]" />
                        <span>{ev.guestsCount} Guests planned</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <Button
                    asChild
                    variant="outline"
                    className="w-full h-9 text-xs rounded-xl hover:bg-[#6E3B1C] hover:text-white hover:border-[#6E3B1C] transition-colors justify-between"
                  >
                    <Link href="/organizer/agency/events">
                      <span>View Guest List</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Full Activity Log */}
      {currentTab === 'activity' && (
        <Card className="rounded-2xl border-border/80 bg-card p-6">
          <div className="space-y-4">
            <h3 className="font-serif font-bold text-base text-foreground">
              Audit Trail &amp; Production History
            </h3>
            <p className="text-xs text-muted-foreground">
              Complete historical log of contracts, event launches, and client notifications.
            </p>

            <div className="divide-y divide-border/60 pt-2 text-xs">
              {client.activities?.map((act) => (
                <div key={act.id} className="py-3.5 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground">{act.title}</p>
                    <p className="text-muted-foreground">{act.description}</p>
                  </div>
                  <span className="text-[11px] text-muted-foreground/80 font-mono">
                    {act.timestamp}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
