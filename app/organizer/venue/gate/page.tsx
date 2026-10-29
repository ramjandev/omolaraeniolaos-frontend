import { GateManagementScreen } from '@/components/organizer/GateManagementScreen';

export const metadata = {
  title: 'Gate Management | McEniesVite Venue',
  description: 'Manage gate staff, assignments, and live entry for venue events',
};

export default function VenueGatePage() {
  return <GateManagementScreen role="organizer_venue" />;
}
