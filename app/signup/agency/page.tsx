import { redirect } from 'next/navigation';

export default function AgencySignUpPage() {
  redirect('/signup?role=agency');
}
