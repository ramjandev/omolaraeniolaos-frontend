'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { inputClass } from '@/components/auth/onboarding';
import CommonButton from '@/components/common/CommonButton';
import CommonSelect from '@/components/common/CommonSelect';
import { CommonHeader } from '@/components/shared/CommonHeader';
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
    watch,
    setValue,
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
    }
  });

  const errorText = (message?: string) =>
    message ? <p className="mt-1.5 text-xs text-[#B33927]">{message}</p> : null;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5">
      <CommonHeader
        variant="section"
        as="h1"
        title="Create Event"
        subtitle="Set up the essentials now—you can add guests and experiences later."
      />

      <form
        onSubmit={submit}
        noValidate
        className="space-y-4 rounded-2xl border border-[#E8E3DD] bg-white p-5 shadow-xs md:p-6 dark:border-border dark:bg-card"
      >
        <h2 className="font-sans text-lg font-medium text-[#261710] dark:text-foreground">Event details</h2>

        <div>
          <label htmlFor="event-title" className={inputClass.label}>
            Event name*
          </label>
          <input id="event-title" className={inputClass.input} placeholder="Enter event name" {...register('title')} />
          {errorText(errors.title?.message)}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="event-type" className={inputClass.label}>
              Event type
            </label>
            <CommonSelect
              id="event-type"
              value={watch('category')}
              item={EVENT_TYPES.map((type) => ({ label: type, value: type }))}
              w="100%"
              onValueChange={(value) => setValue('category', value, { shouldValidate: true })}
              className={inputClass.select}
            />
          </div>
          <div>
            <label htmlFor="event-capacity" className={inputClass.label}>
              Expected guests*
            </label>
            <input id="event-capacity" type="number" min={1} className={inputClass.input} {...register('capacity')} />
            {errorText(errors.capacity?.message)}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="event-date" className={inputClass.label}>
              Event date*
            </label>
            <input id="event-date" type="date" min={todayIso()} className={inputClass.date} {...register('date')} />
            {errorText(errors.date?.message)}
          </div>
          <div>
            <label htmlFor="event-time" className={inputClass.label}>
              Start time*
            </label>
            <input id="event-time" type="time" className={inputClass.time} {...register('startTime')} />
            {errorText(errors.startTime?.message)}
          </div>
        </div>

        <div>
          <label htmlFor="event-venue" className={inputClass.label}>
            Venue or location*
          </label>
          <input id="event-venue" className={inputClass.input} placeholder="Enter venue or location" {...register('venueName')} />
          {errorText(errors.venueName?.message)}
        </div>

        <div>
          <label htmlFor="event-notes" className={inputClass.label}>
            Event notes (optional)
          </label>
          <textarea
            id="event-notes"
            rows={3}
            className={inputClass.textarea}
            placeholder="Add a short planning note"
            {...register('description')}
          />
          {errorText(errors.description?.message)}
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-[#EFEAE4] pt-4 sm:flex-row sm:justify-between dark:border-border">
          <CommonButton to={eventsPath(organizer)} variant="outline" size="md">
            Cancel
          </CommonButton>
          <CommonButton
            type="submit"
            size="md"
            disabled={isLoading}
            isLoading={isLoading}
            loadingText="Creating…"
          >
            Create Event
          </CommonButton>
        </div>
      </form>
    </div>
  );
}
