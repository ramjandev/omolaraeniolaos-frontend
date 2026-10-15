import { AppShell } from '@/components/shell/AppShell';
import { CreateEventForm } from '@/components/events/CreateEventForm';

export const metadata = {
  title: 'Create Event | McEniesVite Agency',
  description: 'Set up the essentials now—you can add guests and experiences later.',
};

export default function AgencyCreateEventPage() {
  return (
    <AppShell currentRole="organizer_agency">
      <CreateEventForm organizer="agency" />
    </AppShell>
  );
}
