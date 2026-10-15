import { UniversalSignIn } from '@/components/auth/UniversalSignIn';

export const metadata = {
  title: 'Welcome to McEniesFête | Events Made Effortless',
  description: 'Manage your events, guests, invitations, and event-day experience all in one place.',
};

export default function HomePage() {
  return <UniversalSignIn />;
}
