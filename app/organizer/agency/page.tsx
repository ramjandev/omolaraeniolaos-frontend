import * as React from 'react';
import Link from 'next/link';
import {
  Briefcase,
  Users,
  CalendarRange,
  DollarSign,
  ArrowRight,
  Calendar,
} from 'lucide-react';
import { AppShell } from '@/components/shell/AppShell';
import { StatsMetricCard } from '@/components/shared/StatsMetricCard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  MOCK_AGENCY_CLIENTS,
  MOCK_AGENCY_TEAM,
  MOCK_AGENCY_METRICS,
  MOCK_AGENCY_EVENTS,
} from '@/lib/mock-data/agency';

export const metadata = {
  title: 'Agency Dashboard | McEniesVite',
  description: 'Enterprise event operations, multi-client productions and crew management',
};

export default function AgencyDashboardPage() {
  const primaryClient = MOCK_AGENCY_CLIENTS[0]; // Amara Okafor (Oak & Ivory)
  const activeEvents = MOCK_AGENCY_EVENTS.slice(0, 3);

  return (
    <AppShell
      currentRole="organizer_agency"
      title="Agency Dashboard"
      subtitle="Multi-client event operations, production schedules, and crew allocations."
      primaryAction={{
        label: '+ Create Event',
        href: '/organizer/agency/events/create',
      }}
    >
      <div className="space-y-8 w-full">
        {/* KPI Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsMetricCard
            title="Managed Retainers"
            value={MOCK_AGENCY_METRICS.totalRetainerRevenue}
            change={MOCK_AGENCY_METRICS.revenueChange}
            isPositive={true}
            icon={DollarSign}
          />
          <StatsMetricCard
            title="Client Accounts"
            value={MOCK_AGENCY_CLIENTS.length}
            description="Active corporate retainers"
            icon={Briefcase}
          />
          <StatsMetricCard
            title="Active Productions"
            value={MOCK_AGENCY_EVENTS.filter((e) => e.status === 'Active').length}
            badge="Live Ops"
            icon={CalendarRange}
          />
          <StatsMetricCard
            title="Agency Producers"
            value={MOCK_AGENCY_TEAM.length}
            description="Producers & coordinators"
            icon={Users}
          />
        </div>

        {/* Featured Client Spotlight Card (Amara Okafor · Oak & Ivory) */}
        <Card className="rounded-2xl border-2 border-[#6E3B1C]/20 bg-gradient-to-r from-[#FDF9F4] to-card dark:from-[#261710]/30 dark:to-card p-6 shadow-xs overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16 rounded-2xl border-2 border-[#D4A373]/40">
                <AvatarImage src={primaryClient.logo} alt={primaryClient.name} />
                <AvatarFallback className="text-base font-bold bg-[#6E3B1C]/10 text-[#6E3B1C]">
                  {primaryClient.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-serif font-bold text-lg text-foreground">
                    {primaryClient.name}
                  </h3>
                  <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-300 text-[10px] font-semibold">
                    Key Client
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{primaryClient.type}</p>
                <p className="text-xs text-muted-foreground">
                  {primaryClient.contactEmail} · {primaryClient.contactPhone}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                asChild
                variant="outline"
                className="h-9 px-4 text-xs rounded-xl border-border/80 hover:bg-muted"
              >
                <Link href={`/organizer/agency/clients/${primaryClient.id}`}>
                  View Client Details
                </Link>
              </Button>
              <Button
                asChild
                className="h-9 px-5 text-xs font-semibold rounded-xl bg-[#6E3B1C] hover:bg-[#5C3117] text-white shadow-xs"
              >
                <Link href={`/organizer/agency/events/create?clientId=${primaryClient.id}`}>
                  + Create Event for Client
                </Link>
              </Button>
            </div>
          </div>
        </Card>

        {/* Live Client Productions Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif font-bold text-lg text-foreground">
                Active Client Productions
              </h2>
              <p className="text-xs text-muted-foreground">
                High-priority events currently under production and gate dispatch
              </p>
            </div>

            <Button asChild variant="ghost" size="sm" className="text-xs text-[#6E3B1C] gap-1">
              <Link href="/organizer/agency/events">
                <span>View All Events</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {activeEvents.map((ev) => (
              <Card
                key={ev.id}
                className="group rounded-2xl border-border/80 bg-card overflow-hidden hover:border-[#6E3B1C]/40 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-40 w-full overflow-hidden bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={ev.image}
                      alt={ev.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 bg-white/90 text-foreground text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs">
                      {ev.type}
                    </div>
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-emerald-500 text-white text-[10px] font-semibold">
                        {ev.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <h3 className="font-serif font-bold text-base text-foreground line-clamp-1 group-hover:text-[#6E3B1C] transition-colors">
                      {ev.title}
                    </h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#6E3B1C]" />
                      <span>{ev.date}</span>
                    </p>
                    <p className="text-[11px] text-muted-foreground line-clamp-1">
                      Client: <strong>{ev.client}</strong>
                    </p>

                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="font-semibold text-foreground">{ev.confirmedRatio}</span>
                        <span className="text-muted-foreground">{ev.daysLeftText}</span>
                      </div>
                      <Progress value={ev.progressPercent} className="h-1.5" />
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <Button
                    asChild
                    variant="outline"
                    className="w-full h-8 text-xs rounded-xl hover:bg-[#6E3B1C] hover:text-white hover:border-[#6E3B1C] transition-colors"
                  >
                    <Link href={`/organizer/agency/events/${ev.id}/guests`}>
                      Manage Roster &amp; VIPs →
                    </Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Client Accounts & Crew Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Client Accounts Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-base text-foreground">
                  Retainer Client Portfolio
                </h3>
                <p className="text-xs text-muted-foreground">
                  Key accounts under active agency management
                </p>
              </div>
              <Button asChild variant="ghost" size="sm" className="text-xs text-[#6E3B1C]">
                <Link href="/organizer/agency/clients">Manage Clients</Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {MOCK_AGENCY_CLIENTS.map((client) => (
                <Card
                  key={client.id}
                  className="rounded-2xl border-border/80 bg-card p-5 space-y-3 hover:border-border transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10 rounded-xl border border-border">
                        <AvatarImage src={client.logo} alt={client.name} />
                        <AvatarFallback className="font-bold text-xs bg-[#6E3B1C]/10 text-[#6E3B1C]">
                          {client.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold text-sm text-foreground">{client.name}</h4>
                        <p className="text-[11px] text-muted-foreground">{client.organization}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-300">
                      {client.status}
                    </Badge>
                  </div>

                  <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      {client.activeEventsCount} Active Events
                    </span>
                    <Button asChild size="sm" variant="ghost" className="h-6 text-[11px] text-[#6E3B1C] px-2">
                      <Link href={`/organizer/agency/clients/${client.id}`}>Details →</Link>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Assigned Crew Column */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-base text-foreground">
                  Production Team
                </h3>
                <p className="text-xs text-muted-foreground">Active producers</p>
              </div>
              <Button asChild variant="ghost" size="sm" className="text-xs text-[#6E3B1C]">
                <Link href="/organizer/agency/team">All Team</Link>
              </Button>
            </div>

            <Card className="rounded-2xl border-border/80 bg-card p-4 divide-y divide-border/60">
              {MOCK_AGENCY_TEAM.map((member) => (
                <div key={member.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-9 h-9 rounded-xl border border-border">
                      <AvatarImage src={member.avatar} alt={member.name} />
                      <AvatarFallback className="font-bold text-xs bg-[#6E3B1C]/10 text-[#6E3B1C]">
                        {member.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-xs text-foreground">{member.name}</p>
                      <p className="text-[11px] text-muted-foreground">{member.role}</p>
                    </div>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
              ))}
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
