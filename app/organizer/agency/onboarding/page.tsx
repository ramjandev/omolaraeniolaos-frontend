import * as React from 'react';
import { AppShell } from '@/components/shell/AppShell';
import { AgencyOnboardingWizard } from '@/components/onboarding/AgencyOnboardingWizard';

export const metadata = {
  title: 'Agency Workspace Onboarding | McEniesVite',
  description: 'Set up your agency profile, event portfolio, and team members',
};

export default function AgencyOnboardingPage() {
  return (
    <AppShell
      currentRole="organizer_agency"
      title="Agency Setup"
      subtitle="Complete your agency organization profile to unlock client portfolios."
    >
      <AgencyOnboardingWizard />
    </AppShell>
  );
}
