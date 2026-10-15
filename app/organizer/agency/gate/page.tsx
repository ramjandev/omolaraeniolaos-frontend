import * as React from 'react';
import Link from 'next/link';
import {
  Scan,
  ShieldCheck,
  Smartphone,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { AppShell } from '@/components/shell/AppShell';
import { StatsMetricCard } from '@/components/shared/StatsMetricCard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const metadata = {
  title: 'Gate Management & Scanners | McEniesVite Agency',
  description: 'Manage gate staff scanner devices, QR check-in gates, and live entry logs across client productions',
};

export default function AgencyGatePage() {
  const gates = [
    {
      id: 'gate-1',
      name: 'Eko Convention Centre - Gate A (VVIP / VIP)',
      event: 'The Grand Royal Gala & Investiture',
      staff: 'Kelechi Nwosu · Producer',
      status: 'Active Live',
      checkedIn: 48,
      capacity: 60,
    },
    {
      id: 'gate-2',
      name: 'Eko Convention Centre - Gate B (General Entrance)',
      event: 'The Grand Royal Gala & Investiture',
      staff: 'Marcus Chen · Coordinator',
      status: 'Active Live',
      checkedIn: 12,
      capacity: 40,
    },
    {
      id: 'gate-3',
      name: 'Ikeja Golf Club - Pavilion Gate',
      event: 'Adeyemi Family Reunion',
      staff: 'Femi Adebayo · Ops Lead',
      status: 'Standby',
      checkedIn: 0,
      capacity: 80,
    },
  ];

  return (
    <AppShell
      currentRole="organizer_agency"
      title="Gate Management & Scanner Ops"
      subtitle="Multi-device live QR verification, synchronized entry protocol, and real-time gate staff dispatch."
      primaryAction={{
        label: '+ Provision Scanner',
        href: '#',
      }}
    >
      <div className="space-y-8">
        {/* KPI Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsMetricCard
            title="Active Scanners"
            value="4 Devices"
            badge="Live Sync"
            icon={Smartphone}
          />
          <StatsMetricCard
            title="Total Checked In"
            value="60 Guests"
            change="100% Valid QR"
            isPositive={true}
            icon={CheckCircle2}
          />
          <StatsMetricCard
            title="Duplicate QR Flagged"
            value="0"
            description="Zero fraudulent scans"
            icon={ShieldCheck}
          />
          <StatsMetricCard
            title="Avg Scan Speed"
            value="1.2s / guest"
            description="Sub-second verification"
            icon={Scan}
          />
        </div>

        {/* Gate List */}
        <Card className="rounded-2xl border-border/80 bg-card shadow-xs overflow-hidden">
          <div className="p-5 border-b border-border/80 flex items-center justify-between">
            <div>
              <h3 className="font-serif font-bold text-base text-foreground">
                Active Production Gates
              </h3>
              <p className="text-xs text-muted-foreground">
                Live entrance gates transmitting verified check-in data to the agency dashboard.
              </p>
            </div>
            <Button size="sm" variant="outline" className="text-xs gap-1.5 rounded-xl">
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sync All</span>
            </Button>
          </div>

          <div className="divide-y divide-border/60">
            {gates.map((g) => (
              <div key={g.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-muted/20 transition-colors">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#6E3B1C]/10 text-[#6E3B1C] flex items-center justify-center shrink-0">
                    <Scan className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-foreground">{g.name}</h4>
                    <p className="text-xs text-[#6E3B1C] font-medium">{g.event}</p>
                    <p className="text-[11px] text-muted-foreground pt-0.5">Staff: {g.staff}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-xs">
                  <div>
                    <span className="text-muted-foreground">Throughput:</span>
                    <p className="font-mono font-bold text-foreground">{g.checkedIn} / {g.capacity}</p>
                  </div>

                  <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-300 font-semibold text-[10px]">
                    {g.status}
                  </Badge>

                  <Button asChild size="sm" variant="outline" className="text-xs rounded-xl h-8">
                    <Link href="/organizer/agency/events">
                      Live Queue
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
