import { SettingsScreen } from '@/components/organizer/SettingsScreen';

export const metadata = {
  title: 'Settings | McEniesVite Agency',
  description: 'Manage your agency account, notifications, and security preferences',
};

export default function AgencySettingsPage() {
  return <SettingsScreen role="organizer_agency" />;
}
