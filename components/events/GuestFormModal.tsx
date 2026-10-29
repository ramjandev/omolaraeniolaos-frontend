'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { isExcelShortNumber, isWhatsAppPhone, normalizeWhatsAppPhone } from '@/lib/phone';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { brownButton, fieldClass, labelClass } from '@/components/auth/onboarding-ui';
import type { AddGuestPayload, EventGuest } from '@/store/Event/types/eventTypes';
import { GUEST_TYPES, INVITE_CHANNELS } from './shared/guest-options';

const guestSchema = z.object({
  name: z.string().trim().min(2, 'Enter the guest name'),
  phone: z
    .string()
    .transform((value) => normalizeWhatsAppPhone(value))
    .refine((value) => !isExcelShortNumber(value), 'Excel shortened this number. Type it as +234 801 234 5678.')
    .refine(isWhatsAppPhone, 'Include the country code, for example +234 801 234 5678. Extra spaces are removed.'),
  email: z.union([z.literal(''), z.string().trim().email('Enter a valid email')]),
  type: z.enum(GUEST_TYPES),
  inviteThrough: z.enum(INVITE_CHANNELS),
});

type GuestFormInput = z.input<typeof guestSchema>;
type GuestFormValues = z.output<typeof guestSchema>;

function toFormValues(guest?: EventGuest | null): GuestFormInput {
  const type = GUEST_TYPES.find((t) => t === guest?.type) ?? 'General';
  const channel = INVITE_CHANNELS.find((c) => c === guest?.inviteThrough) ?? 'WhatsApp';
  return {
    name: guest?.name ?? '',
    phone: guest?.phone ?? '',
    email: guest?.email ?? '',
    type,
    inviteThrough: channel,
  };
}

interface GuestFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guest?: EventGuest | null;
  busy?: boolean;
  /** Live events send the invitation as soon as the guest is saved. */
  sendOnAdd?: boolean;
  onSubmit: (payload: AddGuestPayload) => Promise<void>;
}

export function GuestFormModal({
  open,
  onOpenChange,
  guest,
  busy = false,
  sendOnAdd = false,
  onSubmit,
}: GuestFormModalProps) {
  const isEdit = Boolean(guest);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GuestFormInput, unknown, GuestFormValues>({
    resolver: zodResolver(guestSchema),
    defaultValues: toFormValues(guest),
  });

  React.useEffect(() => {
    if (open) reset(toFormValues(guest));
  }, [open, guest, reset]);

  const submit = handleSubmit(async (values) => {
    await onSubmit({
      name: values.name,
      phone: values.phone,
      email: values.email || undefined,
      type: values.type,
      inviteThrough: values.inviteThrough,
    });
  });

  const errorText = (message?: string) =>
    message ? <p className="mt-1.5 text-xs text-[#B33927]">{message}</p> : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        onInteractOutside={(e) => e.preventDefault()}
        className="max-h-[92vh] overflow-y-auto rounded-3xl border border-[#EBE3D9] bg-white p-6 shadow-2xl sm:max-w-[560px] sm:p-7 dark:border-border dark:bg-card"
      >
        <div className="flex items-center justify-between">
          <DialogTitle className="font-sans text-xl font-medium text-[#1F140E] dark:text-foreground">
            {isEdit ? 'Edit Guest' : 'Add Guest'}
          </DialogTitle>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-lg p-1 text-[#1F140E] transition-colors hover:bg-[#F2F1EF] dark:text-foreground"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>
        <DialogDescription className={isEdit || !sendOnAdd ? 'sr-only' : 'text-xs text-[#736B66]'}>
          {isEdit
            ? 'Update this guest’s details.'
            : sendOnAdd
              ? 'The guest is saved and the invitation is sent on the channel below.'
              : 'Add a guest to this event.'}
        </DialogDescription>

        <form onSubmit={submit} className="mt-2 space-y-4" noValidate>
          <div>
            <label htmlFor="guest-name" className={labelClass}>
              Full Name*
            </label>
            <input id="guest-name" className={fieldClass} placeholder="e.g. Chief & Mrs. Babatunde Alabi" {...register('name')} />
            {errorText(errors.name?.message)}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="guest-phone" className={labelClass}>
                Phone Number*
              </label>
              <input id="guest-phone" type="tel" className={fieldClass} placeholder="+234 802 345 6789" {...register('phone')} />
              {errorText(errors.phone?.message)}
            </div>
            <div>
              <label htmlFor="guest-email" className={labelClass}>
                Email Address
              </label>
              <input id="guest-email" type="email" className={fieldClass} placeholder="guest@email.com" {...register('email')} />
              {errorText(errors.email?.message)}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="guest-type" className={labelClass}>
                Guest Type
              </label>
              <select id="guest-type" className={fieldClass} {...register('type')}>
                {GUEST_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="guest-channel" className={labelClass}>
                Invite Through
              </label>
              <select id="guest-channel" className={fieldClass} {...register('inviteThrough')}>
                {INVITE_CHANNELS.map((channel) => (
                  <option key={channel} value={channel}>
                    {channel}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button type="submit" disabled={busy} className={`${brownButton} h-12 w-full text-base disabled:opacity-60`}>
            {busy ? 'Saving…' : isEdit ? 'Save Changes' : sendOnAdd ? 'Add & send invitation' : 'Add Guest'}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
