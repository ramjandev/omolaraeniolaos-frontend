import { AppShell } from '@/components/shell/AppShell';
import {
  IndividualEventWorkspace,
  type StepKey,
} from '@/components/events/IndividualEventWorkspace';

export const metadata = {
  title: 'Create Event | McEniesVite Venue',
  description: 'Set up a venue event with the hall, client, and team.',
};

interface PageProps {
  searchParams?: Promise<{ step?: string; new?: string }>;
}

export default async function VenueCreateEventPage({ searchParams }: PageProps) {
  const resolved = searchParams ? await searchParams : undefined;
  const step = resolved?.step;
  const validSteps: readonly StepKey[] = [
    'basics',
    'details',
    'guests',
    'invitation',
    'experience',
    'payment',
    'review',
  ];
  const initialStep: StepKey | undefined =
    step && validSteps.includes(step as StepKey) ? (step as StepKey) : undefined;

  return (
    <AppShell
      currentRole="organizer_venue"
      title="Event Setup"
      subtitle="Choose the venue and team, then set up the guest list and experience."
    >
      <IndividualEventWorkspace kind="venue" initialStep={initialStep} startNew={resolved?.new === '1'} />
    </AppShell>
  );
}
