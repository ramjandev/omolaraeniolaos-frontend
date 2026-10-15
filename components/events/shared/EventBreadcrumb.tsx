'use client';

import * as React from 'react';
import Link from 'next/link';
import { eventsPath, type OrganizerKind } from '@/lib/organizer';
import { useGetEventByIdQuery } from '@/store/Event/eventAPI';

interface EventBreadcrumbProps {
  organizer: OrganizerKind;
  eventId: string;
  current: string;
}

export function EventBreadcrumb({ organizer, eventId, current }: EventBreadcrumbProps) {
  const { data } = useGetEventByIdQuery(eventId);
  const title = data?.data?.event?.title ?? 'Event';

  return (
    <nav aria-label="Breadcrumb" className="text-sm text-[#736B66] dark:text-muted-foreground">
      <ol className="flex flex-wrap items-center gap-1.5">
        <li>
          <Link href={eventsPath(organizer)} className="hover:text-[#261710]">
            Events
          </Link>
        </li>
        <li aria-hidden>/</li>
        <li className="max-w-[140px] truncate">
          <Link href={eventsPath(organizer, eventId)} className="hover:text-[#261710]" title={title}>
            {title}
          </Link>
        </li>
        <li aria-hidden>/</li>
        <li aria-current="page" className="text-[#7A3B18] dark:text-[#D4A373]">
          {current}
        </li>
      </ol>
    </nav>
  );
}
