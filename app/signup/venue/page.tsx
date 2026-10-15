import { redirect } from 'next/navigation';

export default function VenueSignUpPage() {
  redirect('/signup?role=venue');
}
