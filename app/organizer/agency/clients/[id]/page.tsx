import * as React from 'react';
import { AppShell } from '@/components/shell/AppShell';
import { ClientDetailsView } from '@/components/clients/ClientDetailsView';
import { MOCK_AGENCY_CLIENTS } from '@/lib/mock-data/agency';

export const metadata = {
  title: 'Client Details | McEniesVite Agency',
  description: 'View client profile, associated events, and production history',
};

export default async function ClientDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client =
    MOCK_AGENCY_CLIENTS.find((c) => c.id === id) ||
    MOCK_AGENCY_CLIENTS.find((c) => c.id === 'amara-okafor') ||
    MOCK_AGENCY_CLIENTS[0];

  return (
    <AppShell
      currentRole="organizer_agency"
      title="Client Details"
      subtitle="Corporate portfolio, contracted productions, and key stakeholders."
    >
      <ClientDetailsView client={client} />
    </AppShell>
  );
}
