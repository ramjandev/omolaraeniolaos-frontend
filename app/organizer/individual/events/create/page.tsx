import * as React from 'react';
import { AppShell } from '@/components/shell/AppShell';
import {
  IndividualEventWorkspace,
  type StepKey,
} from '@/components/events/IndividualEventWorkspace';

export const metadata = {
  title: 'Let\'s Set Up Your Event | McEniesVite Organizer',
  description: 'Setup and publish your event with step-by-step guidance',
};

interface PageProps {
  searchParams?: Promise<{ step?: string; new?: string }>;
}

export default async function CreateEventPage({ searchParams }: PageProps) {
  const resolved = searchParams ? await searchParams : undefined;
  const step = resolved?.step;
  const validSteps: readonly StepKey[] = [
    'basics',
    'details',
    'guests',
    'invitation',
    'experience',
    'payment',
  ];
  const initialStep: StepKey | undefined =
    step && validSteps.includes(step as StepKey) ? (step as StepKey) : undefined;

  const startNew = resolved?.new === '1';

  return (
    <AppShell
      currentRole="organizer_individual"
      title="Event Setup"
      subtitle="Follow the step-by-step setup to configure your event details, guest roster, and experiences."
    >
      <IndividualEventWorkspace initialStep={initialStep} startNew={startNew} />
    </AppShell>
  );
}

