import { GateManagementScreen } from '@/components/organizer/GateManagementScreen';

export const metadata = {
  title: 'Gate Management | McEniesVite Agency',
  description: 'Manage gate staff, assignments, and live entry for agency events',
};

export default function AgencyGatePage() {
  return <GateManagementScreen role="organizer_agency" />;
}
