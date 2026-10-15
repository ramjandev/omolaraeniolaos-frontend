import * as React from 'react';
import { AppShell } from '@/components/shell/AppShell';
import { AgencyPricingPlans } from '@/components/pricing/AgencyPricingPlans';

export const metadata = {
  title: 'Agency Pricing & Plans | McEniesVite',
  description: 'Select an agency subscription tier tailored to your team scale and client volume',
};

export default function AgencyPricingPage() {
  return (
    <AppShell
      currentRole="organizer_agency"
      title="Agency Subscription Plans"
      subtitle="Scalable packages for event production teams, multi-client portals, and live check-in protocols."
    >
      <AgencyPricingPlans />
    </AppShell>
  );
}
