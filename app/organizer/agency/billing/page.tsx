import { BillingScreen } from '@/components/organizer/BillingScreen';

export const metadata = {
  title: 'Billing | McEniesVite Agency',
  description: 'Manage the agency subscription and billing history',
};

export default function AgencyBillingPage() {
  return <BillingScreen role="organizer_agency" planType="Agency" />;
}
