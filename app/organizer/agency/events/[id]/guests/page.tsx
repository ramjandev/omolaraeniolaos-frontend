import { redirect } from 'next/navigation';

export default async function AgencyEventGuestsRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/organizer/agency/events/${id}`);
}
