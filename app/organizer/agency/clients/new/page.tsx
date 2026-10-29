import { AppShell } from '@/components/shell/AppShell';
import { ClientForm } from '@/components/clients/ClientForm';

export const metadata = {
  title: 'Add Client | McEniesVite Agency',
};

export default function AddAgencyClientPage() {
  return (
    <AppShell currentRole="organizer_agency">
      <ClientForm />
    </AppShell>
  );
}
