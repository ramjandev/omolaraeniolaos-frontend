import { AppShell } from '@/components/shell/AppShell';
import { VenueReports } from '@/components/venue/VenueReports';

export const metadata = {
  title: 'Reports | McEniesVite Venue',
  description: 'Venue usage, booking trends, and capacity performance.',
};

export default function VenueReportsPage() {
  return (
    <AppShell currentRole="organizer_venue">
      <VenueReports />
    </AppShell>
  );
}
