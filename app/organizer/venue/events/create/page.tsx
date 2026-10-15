import { AppShell } from '@/components/shell/AppShell';
import { CreateEventForm } from '@/components/events/CreateEventForm';

export const metadata = {
  title: 'Create Event | McEniesVite Venue',
  description: 'Set up the essentials now—you can add guests and experiences later.',
};

export default function VenueCreateEventPage() {
  return (
    <AppShell currentRole="organizer_venue">
      <CreateEventForm organizer="venue" />
    </AppShell>
  );
}
