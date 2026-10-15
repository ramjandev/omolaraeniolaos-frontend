import * as React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { AppShell } from '@/components/shell/AppShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { OrganizerBreakdownChart } from '@/components/admin/OrganizerBreakdownChart';
import { RevenueByTypeTable } from '@/components/admin/RevenueByTypeTable';
import { ActiveEventsAdminTable } from '@/components/admin/ActiveEventsAdminTable';

export const metadata = {
  title: 'Platform Dashboard | Admin',
  description: 'Platform-wide overview, revenue analytics, and active events monitoring',
};

export default function AdminDashboardPage() {
  return (
    <AppShell currentRole="admin">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-serif font-semibold tracking-tight text-foreground">
            Platform Dashboard
          </h1>
          <p className="text-xs text-muted-foreground">
            Platform-wide overview · Monday, 21 September 2026
          </p>
        </div>

        {/* 4 Top KPI Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Organizers */}
          <Card className="border-border/80 shadow-2xs">
            <CardContent className="p-5 space-y-1">
              <span className="text-3xl font-serif font-semibold text-foreground block">
                142
              </span>
              <p className="text-xs font-semibold text-foreground pt-1">Total Organizers</p>
              <p className="text-[11px] text-muted-foreground">
                98 Individual · 31 Agency · 13 Venue
              </p>
            </CardContent>
          </Card>

          {/* Card 2: Active Events */}
          <Card className="border-border/80 shadow-2xs">
            <CardContent className="p-5 space-y-1">
              <span className="text-3xl font-serif font-semibold text-foreground block">
                847
              </span>
              <p className="text-xs font-semibold text-foreground pt-1">Active Events</p>
              <p className="text-[11px] text-muted-foreground">Currently live or upcoming</p>
            </CardContent>
          </Card>

          {/* Card 3: Completed Events */}
          <Card className="border-border/80 shadow-2xs">
            <CardContent className="p-5 space-y-1">
              <span className="text-3xl font-serif font-semibold text-foreground block">
                2,341
              </span>
              <p className="text-xs font-semibold text-foreground pt-1">Completed Events</p>
              <p className="text-[11px] text-muted-foreground">Lifetime platform total</p>
            </CardContent>
          </Card>

          {/* Card 4: Platform Revenue */}
          <Card className="border-border/80 shadow-2xs">
            <CardContent className="p-5 space-y-1">
              <span className="text-3xl font-serif font-semibold text-[#8B4513] dark:text-[#D4A373] block">
                ₦4.2M
              </span>
              <p className="text-xs font-semibold text-foreground pt-1">Platform Revenue</p>
              <p className="text-[11px] text-muted-foreground">September 2026</p>
            </CardContent>
          </Card>
        </div>

        {/* Middle Row: Organizer Breakdown & Revenue by Organizer Type */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Organizer Breakdown (Left Column, 5 cols) */}
          <div className="lg:col-span-5">
            <Card className="border-border/80 shadow-2xs h-full flex flex-col justify-between">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold">
                      Organizer Breakdown
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Distribution by organizer type
                    </CardDescription>
                  </div>
                  <Link
                    href="/admin/organizers"
                    className="text-xs font-medium text-muted-foreground hover:text-foreground flex items-center gap-0.5"
                  >
                    <span>All orgs</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="pt-2 flex-1 flex flex-col justify-center">
                <OrganizerBreakdownChart />
              </CardContent>
            </Card>
          </div>

          {/* Revenue by Organizer Type (Right Column, 7 cols) */}
          <div className="lg:col-span-7">
            <Card className="border-border/80 shadow-2xs h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">
                  Revenue by Organizer Type
                </CardTitle>
                <CardDescription className="text-xs">
                  September 2026 · full breakdown on Revenue & Plans
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <RevenueByTypeTable />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Section: Active Events Table */}
        <div className="pt-2">
          <ActiveEventsAdminTable />
        </div>
      </div>
    </AppShell>
  );
}
