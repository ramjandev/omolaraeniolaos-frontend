'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { brownButton, fieldClass, labelClass } from '@/components/auth/onboarding-ui';
import { eventsPath, type OrganizerKind } from '@/lib/organizer';
import { useCreateEventMutation } from '@/store/Event/eventAPI';

export const EVENT_TYPES = [
  'Gala',
  'Wedding',
  'Birthday',
  'Conference',
  'Corporate',
  'Family Event',
  'Networking',
  'Social',
  'Other',
] as const;

const todayIso = () => new Date().toISOString().slice(0, 10);

const createEventSchema = z.object({
  title: z.string().trim().min(3, 'Enter an event name'),
  category: z.enum(EVENT_TYPES),
  date: z
    .string()
    .min(1, 'Choose the event date')
    .refine((value) => value >= todayIso(), 'Choose a date from today onwards'),
  startTime: z.string().min(1, 'Choose a start time'),
  capacity: z.coerce.number().int().min(1, 'At least 1 guest').max(100_000, 'That’s too many guests'),
  venueName: z.string().trim().min(2, 'Enter the venue or location'),
  description: z.string().trim().max(500, 'Keep notes under 500 characters'),
});

type CreateEventInput = z.input<typeof createEventSchema>;
type CreateEventValues = z.output<typeof createEventSchema>;

export function CreateEventForm({ organizer }: { organizer: OrganizerKind }) {
  const router = useRouter();
  const [createEvent, { isLoading }] = useCreateEventMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateEventInput, unknown, CreateEventValues>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      title: '',
      category: 'Gala',
      date: '',
      startTime: '18:00',
      capacity: 100,
      venueName: '',
      description: '',
    },
  });

  const submit = handleSubmit(async (values) => {
    try {
      const result = await createEvent({
        title: values.title,
        category: values.category,
        startDate: new Date(`${values.date}T${values.startTime}`).toISOString(),
        capacity: values.capacity,
        venueName: values.venueName,
        description: values.description || undefined,
      }).unwrap();
      router.push(eventsPath(organizer, result.data?.id));
    } catch {
      // baseAPI surfaces the server error as a toast
    }
  });

  const errorText = (message?: string) =>
    message ? <p className="mt-1.5 text-xs text-[#B33927]">{message}</p> : null;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5">
      <div className="space-y-1">
        <h1 className="font-serif text-4xl font-normal tracking-tight text-[#1F140E] dark:text-[#FBF8F5]">
          Create Event
        </h1>
        <p className="text-sm text-[#736B66] dark:text-muted-foreground">
          Set up the essentials now—you can add guests and experiences later.
        </p>
      </div>

      <form
        onSubmit={submit}
        noValidate
        className="space-y-4 rounded-2xl border border-[#E8E3DD] bg-white p-5 shadow-xs md:p-6 dark:border-border dark:bg-card"
      >
        <h2 className="font-sans text-lg font-medium text-[#261710] dark:text-foreground">Event details</h2>

        <div>
          <label htmlFor="event-title" className={labelClass}>
            Event name*
          </label>
          <input id="event-title" className={fieldClass} placeholder="Enter event name" {...register('title')} />
          {errorText(errors.title?.message)}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="event-type" className={labelClass}>
              Event type
            </label>
            <select id="event-type" className={fieldClass} {...register('category')}>
              {EVENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="event-capacity" className={labelClass}>
              Expected guests*
            </label>
            <input id="event-capacity" type="number" min={1} className={fieldClass} {...register('capacity')} />
            {errorText(errors.capacity?.message)}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="event-date" className={labelClass}>
              Event date*
            </label>
            <input id="event-date" type="date" min={todayIso()} className={fieldClass} {...register('date')} />
            {errorText(errors.date?.message)}
          </div>
          <div>
            <label htmlFor="event-time" className={labelClass}>
              Start time*
            </label>
            <input id="event-time" type="time" className={fieldClass} {...register('startTime')} />
            {errorText(errors.startTime?.message)}
          </div>
        </div>

        <div>
          <label htmlFor="event-venue" className={labelClass}>
            Venue or location*
          </label>
          <input id="event-venue" className={fieldClass} placeholder="Enter venue or location" {...register('venueName')} />
          {errorText(errors.venueName?.message)}
        </div>

        <div>
          <label htmlFor="event-notes" className={labelClass}>
            Event notes (optional)
          </label>
          <textarea
            id="event-notes"
            rows={3}
            className={`${fieldClass} h-auto py-3`}
            placeholder="Add a short planning note"
            {...register('description')}
          />
          {errorText(errors.description?.message)}
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-[#EFEAE4] pt-4 sm:flex-row sm:justify-between dark:border-border">
          <Link
            href={eventsPath(organizer)}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-[#231713] px-8 text-sm font-medium text-[#231713] hover:bg-[#FAF8F4] dark:border-border dark:text-foreground"
          >
            Cancel
          </Link>
          <button type="submit" disabled={isLoading} className={`${brownButton} h-11 px-8 text-sm disabled:opacity-60`}>
            {isLoading ? 'Creating…' : 'Create Event'}
          </button>
        </div>
      </form>
    </div>
  );
}
