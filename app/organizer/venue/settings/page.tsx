import { SettingsScreen } from '@/components/organizer/SettingsScreen';

export const metadata = {
  title: 'Settings | McEniesVite Venue',
  description: 'Manage your venue account, notifications, and security preferences',
};

export default function VenueSettingsPage() {
  return <SettingsScreen role="organizer_venue" />;
}
