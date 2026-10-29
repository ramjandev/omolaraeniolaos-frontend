import { BillingScreen } from '@/components/organizer/BillingScreen';

export const metadata = {
  title: 'Billing | McEniesVite Venue',
  description: 'Manage the venue subscription and billing history',
};

export default function VenueBillingPage() {
  return <BillingScreen role="organizer_venue" planType="Venue" />;
}
