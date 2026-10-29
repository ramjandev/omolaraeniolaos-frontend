'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { AppShell } from '@/components/shell/AppShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { OrganizerBreakdownChart } from '@/components/admin/OrganizerBreakdownChart';
import { RevenueByTypeTable } from '@/components/admin/RevenueByTypeTable';
import { ActiveEventsAdminTable } from '@/components/admin/ActiveEventsAdminTable';
import {
  formatNaira,
  getDashboardActiveEvents,
  getDashboardSummary,
  getOrganizerBreakdown,
  getRevenueByType,
  type DashboardEventsPage,
  type DashboardSummary,
  type OrganizerBreakdown,
  type RevenueByType,
} from '@/lib/api/admin-dashboard';

export function AdminDashboard() {
  const [summary, setSummary] = React.useState<DashboardSummary | null>(null);
  const [breakdown, setBreakdown] = React.useState<OrganizerBreakdown | null>(null);
  const [revenue, setRevenue] = React.useState<RevenueByType | null>(null);
  const [eventsPage, setEventsPage] = React.useState<DashboardEventsPage | null>(null);
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [error, setError] = React.useState('');
  const [loadingEvents, setLoadingEvents] = React.useState(true);

  React.useEffect(() => {
    let active = true;
    setError('');
    Promise.all([getDashboardSummary(), getOrganizerBreakdown(), getRevenueByType()])
      .then(([summaryData, breakdownData, revenueData]) => {
        if (!active) return;
        setSummary(summaryData);
        setBreakdown(breakdownData);
        setRevenue(revenueData);
      })
      .catch((err: unknown) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Dashboard data could not be loaded');
      });
    return () => {
      active = false;
    };
  }, []);

  React.useEffect(() => {
    let active = true;
    setLoadingEvents(true);
    getDashboardActiveEvents(page, limit)
      .then((result) => {
        if (active) setEventsPage(result);
      })
      .catch((err: unknown) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Active events could not be loaded');
      })
      .finally(() => {
        if (active) setLoadingEvents(false);
      });
    return () => {
      active = false;
    };
  }, [page, limit]);

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <AppShell currentRole="admin">
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-serif font-semibold tracking-tight text-foreground">
            Platform Dashboard
          </h1>
          <p className="text-xs text-muted-foreground">
            Platform-wide overview · {today}
          </p>
        </div>

        {error && (
          <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-border/80 shadow-2xs">
            <CardContent className="p-5 space-y-1">
              <span className="text-3xl font-serif font-semibold text-foreground block">
                {summary?.totalOrganizers ?? '—'}
              </span>
              <p className="text-xs font-semibold text-foreground pt-1">Total Organizers</p>
              <p className="text-[11px] text-muted-foreground">
                {summary
                  ? `${summary.breakdown.individual} Individual · ${summary.breakdown.agency} Agency · ${summary.breakdown.venue} Venue`
                  : 'Loading organizers'}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-2xs">
            <CardContent className="p-5 space-y-1">
              <span className="text-3xl font-serif font-semibold text-foreground block">
                {summary?.activeEvents ?? '—'}
              </span>
              <p className="text-xs font-semibold text-foreground pt-1">Active Events</p>
              <p className="text-[11px] text-muted-foreground">Currently live or upcoming</p>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-2xs">
            <CardContent className="p-5 space-y-1">
              <span className="text-3xl font-serif font-semibold text-foreground block">
                {summary?.completedEvents ?? '—'}
              </span>
              <p className="text-xs font-semibold text-foreground pt-1">Completed Events</p>
              <p className="text-[11px] text-muted-foreground">Lifetime platform total</p>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-2xs">
            <CardContent className="p-5 space-y-1">
              <span className="text-3xl font-serif font-semibold text-[#8B4513] dark:text-[#D4A373] block">
                {summary ? formatNaira(summary.totalRevenue) : '—'}
              </span>
              <p className="text-xs font-semibold text-foreground pt-1">Platform Revenue</p>
              <p className="text-[11px] text-muted-foreground">All paid orders</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-5">
            <Card className="border-border/80 shadow-2xs h-full flex flex-col justify-between">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold">Organizer Breakdown</CardTitle>
                    <CardDescription className="text-xs">Distribution by organizer type</CardDescription>
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
                <OrganizerBreakdownChart items={breakdown?.items || []} />
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-7">
            <Card className="border-border/80 shadow-2xs h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Revenue by Organizer Type</CardTitle>
                <CardDescription className="text-xs">
                  All paid orders on the platform
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <RevenueByTypeTable revenue={revenue} />
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="pt-2">
          <ActiveEventsAdminTable
            page={eventsPage}
            limit={limit}
            events={eventsPage?.data || []}
            loading={loadingEvents}
            onPageChange={setPage}
            onLimitChange={(nextLimit) => {
              setLimit(nextLimit);
              setPage(1);
            }}
          />
        </div>
      </div>
    </AppShell>
  );
}
