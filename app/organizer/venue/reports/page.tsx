import * as React from 'react';
import { AppShell } from '@/components/shell/AppShell';
import { StatsMetricCard } from '@/components/shared/StatsMetricCard';

export default function VenueReportsPage() {
  return (
    <AppShell
      currentRole="organizer_venue"
      title="Occupancy & Revenue Reports"
      subtitle="Historical rental data, seasonal peak analyses, and utility consumption."
      primaryAction={{
        label: 'Export PDF Report',
        href: '/organizer/venue/reports',
      }}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatsMetricCard title="Average Daily Rate" value="$4,850" change="+12% YoY" isPositive={true} />
          <StatsMetricCard title="Annual Booked Days" value="248 Days" description="68% total calendar" />
          <StatsMetricCard title="Average Turnover Time" value="4.5 Hours" description="Load-in to strike" />
        </div>
      </div>
    </AppShell>
  );
}
