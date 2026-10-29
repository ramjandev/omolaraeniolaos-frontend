import { AppShell } from '@/components/shell/AppShell';
import {
  IndividualEventWorkspace,
  type StepKey,
} from '@/components/events/IndividualEventWorkspace';

export const metadata = {
  title: 'Create Event | McEniesVite Agency',
  description: 'Set up an agency event with the same steps used for every organizer.',
};

interface PageProps {
  searchParams?: Promise<{ step?: string; new?: string; clientId?: string }>;
}

export default async function AgencyCreateEventPage({ searchParams }: PageProps) {
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
      currentRole="organizer_agency"
      title="Event Setup"
      subtitle="Follow the step-by-step setup to configure your event details, guest roster, and experiences."
    >
      <IndividualEventWorkspace
        kind="agency"
        initialStep={initialStep}
        startNew={resolved?.new === '1'}
        clientId={resolved?.clientId}
      />
    </AppShell>
  );
}
