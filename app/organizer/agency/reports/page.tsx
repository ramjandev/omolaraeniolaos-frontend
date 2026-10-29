import { AppShell } from '@/components/shell/AppShell';
import { AgencyReports } from '@/components/agency/AgencyReports';

export const metadata = {
  title: 'Reports | McEniesVite Agency',
  description: 'Agency-wide event performance and business analytics',
};

export default function AgencyReportsPage() {
  return (
    <AppShell currentRole="organizer_agency">
      <AgencyReports />
    </AppShell>
  );
}
