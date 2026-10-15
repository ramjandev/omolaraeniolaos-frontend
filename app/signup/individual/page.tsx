import { redirect } from 'next/navigation';

export default function IndividualSignUpPage() {
  redirect('/signup?role=individual');
}
