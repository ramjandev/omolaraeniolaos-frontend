import * as React from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Users,
  Calendar,
  Download,
  CheckCircle2,
} from 'lucide-react';
import { AppShell } from '@/components/shell/AppShell';
import { StatsMetricCard } from '@/components/shared/StatsMetricCard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MOCK_AGENCY_EVENTS } from '@/lib/mock-data/agency';

export const metadata = {
  title: 'Agency Reports & Analytics | McEniesVite',
  description: 'Production efficiency metrics, guest attendance trends, and client performance reports',
};

export default function AgencyReportsPage() {
  return (
    <AppShell
      currentRole="organizer_agency"
      title="Agency Reports & Analytics"
      subtitle="Performance benchmarks, RSVP fulfillment rates, and gate throughput statistics across client productions."
    >
      <div className="space-y-8">
        {/* KPI Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsMetricCard
            title="Avg RSVP Acceptance"
            value="88.4%"
            change="+4.2% vs benchmark"
            isPositive={true}
            icon={CheckCircle2}
          />
          <StatsMetricCard
            title="Peak Gate Throughput"
            value="142 / min"
            description="Multi-scanner sync rate"
            icon={TrendingUp}
          />
          <StatsMetricCard
            title="Active Client Events"
            value="3 Active"
            description="Under live coordination"
            icon={Calendar}
          />
          <StatsMetricCard
            title="Total Managed Attendees"
            value="1,840"
            change="+320 this month"
            isPositive={true}
            icon={Users}
          />
        </div>

        {/* Productions Analytics Summary */}
        <Card className="rounded-2xl border-border/80 bg-card shadow-xs overflow-hidden">
          <div className="p-5 border-b border-border/80 flex items-center justify-between">
            <h3 className="font-serif font-bold text-base text-foreground">
              Client Production Performance Ledger
            </h3>
            <Button size="sm" variant="outline" className="text-xs gap-1.5 rounded-xl">
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/40 border-b border-border text-muted-foreground font-semibold">
                <tr>
                  <th className="py-3 px-4">Event Production</th>
                  <th className="py-3 px-4">Client Portfolio</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Confirmed / Total</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {MOCK_AGENCY_EVENTS.map((ev) => (
                  <tr key={ev.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-foreground">
                      {ev.title}
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground">{ev.client}</td>
                    <td className="py-3.5 px-4">
                      <Badge
                        className={`text-[10px] font-semibold ${
                          ev.status === 'Active'
                            ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-300'
                            : ev.status === 'Draft'
                            ? 'bg-amber-500/10 text-amber-600 border border-amber-300'
                            : 'bg-muted text-muted-foreground border'
                        }`}
                      >
                        {ev.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-foreground">
                      {ev.confirmedRatio}
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground">{ev.date}</td>
                    <td className="py-3.5 px-4 text-right">
                      <Button asChild size="sm" variant="ghost" className="h-7 text-xs text-[#6E3B1C]">
                        <Link href={`/organizer/agency/events/${ev.id}/guests`}>
                          View Roster →
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
