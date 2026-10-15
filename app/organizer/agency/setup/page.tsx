import { redirect } from 'next/navigation';

export default function AgencySetupRedirect() {
  redirect('/organizer/agency/onboarding');
}
