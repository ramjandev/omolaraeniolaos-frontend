'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { MapPin } from 'lucide-react';
import { GateMobileShell } from '@/components/gate-staff/GateMobileShell';
import { getGateWorkspace, type GateWorkspace } from '@/lib/api/platform';

function formatEventDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function GateStaffMyEventsPage() {
  const router = useRouter();
  const [events, setEvents] = React.useState<GateWorkspace['events']>([]);
  const [message, setMessage] = React.useState('Loading your events…');

  const loadEvents = React.useCallback(() => {
    setMessage('Loading your events…');
    return getGateWorkspace()
      .then((workspace) => {
        const rows = workspace.events || [];
        setEvents(rows);
        setMessage(rows.length ? '' : 'No events are assigned to you yet.');
      })
      .catch(() => {
        setEvents([]);
        const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
        if (!token) {
          window.location.assign('/gate-staff/login');
          return;
        }
        setMessage('Your assignments could not be loaded. Sign in again from the gate staff login page.');
      });
  }, []);

  React.useEffect(() => {
    void loadEvents();
    const onFocus = () => {
      void loadEvents();
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [loadEvents]);

  return (
    <GateMobileShell showHeader={true} activeTab="events">
      <div className="space-y-1 mb-5">
        <h1 className="font-serif text-3xl font-medium tracking-tight text-[#1F1916]">
          My Events
        </h1>
        <p className="text-sm text-[#70665F]">
          View your assigned events and manage guest check-in.
        </p>
      </div>

      {message && (
        <p className="text-sm text-[#70665F]">{message}</p>
      )}

      <div className="space-y-4">
        {events.map((evt) => (
          <div
            key={evt.id}
            className="bg-white rounded-3xl p-5 border border-[#EAE5DC] shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-4"
          >
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full inline-block ${evt.status === 'Live' ? 'bg-[#2A6E3B]' : 'bg-[#B04A26]'}`} />
              <span className="text-sm font-medium text-[#7A3B18]">
                {evt.status}
              </span>
            </div>

            <h2 className="font-semibold text-lg text-[#1F1916] leading-snug">
              {evt.title}
            </h2>

            <div className="space-y-1">
              <span className="text-xs text-[#8A7E75] block">Date</span>
              <span className="text-sm font-medium text-[#2C2420] block">
                {formatEventDate(evt.startDate)}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm text-[#4A403A]">
              <MapPin className="w-4 h-4 text-[#7A3B18] stroke-[2]" />
              <span className="font-normal">{evt.gate}</span>
            </div>

            <p className="text-xs text-[#8A7E75]">
              Organizer: {evt.organizer}
            </p>

            <button
              type="button"
              onClick={() => router.push(`/gate-staff/checkin?eventId=${evt.id}`)}
              className="w-full py-3.5 px-4 bg-[#211612] hover:bg-[#34241D] text-white rounded-2xl text-sm font-medium transition-colors shadow-xs active:scale-[0.99]"
            >
              Open Event
            </button>
          </div>
        ))}
      </div>
    </GateMobileShell>
  );
}
