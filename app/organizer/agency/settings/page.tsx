import * as React from 'react';
import { AppShell } from '@/components/shell/AppShell';
import { AgencySettingsView } from '@/components/settings/AgencySettingsView';

export const metadata = {
  title: 'Settings | McEniesVite Agency',
  description: 'Manage your agency account, notifications, and security preferences',
};

export default function AgencySettingsPage() {
  return (
    <AppShell
      currentRole="organizer_agency"
      title="Settings"
      subtitle="Manage your account and event preferences."
    >
      <AgencySettingsView />
    </AppShell>
  );
}
