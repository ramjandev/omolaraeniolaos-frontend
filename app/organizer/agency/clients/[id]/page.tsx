import * as React from 'react';
import { AppShell } from '@/components/shell/AppShell';
import { ClientDetailsView } from '@/components/clients/ClientDetailsView';

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

  return (
    <AppShell currentRole="organizer_agency">
      <ClientDetailsView clientId={id} />
    </AppShell>
  );
}
