import { redirect } from 'next/navigation';

export default function IndividualGuestsRedirect() {
  redirect('/organizer/individual/events');
}
