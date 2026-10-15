import { z } from "zod";
import { isExcelShortNumber, isWhatsAppPhone, normalizeWhatsAppPhone } from "@/lib/phone";
import { EVENT_TYPES, GUEST_GROUPS } from "@/store/eventSlice/eventSlice";

const todayIso = () => new Date().toISOString().slice(0, 10);

export const basicsSchema = z
  .object({
    eventName: z.string().trim().min(2, "Enter an event name"),
    eventType: z.enum(EVENT_TYPES, { message: "Choose an event type" }),
    eventDate: z
      .string()
      .min(1, "Choose the event date")
      .refine((value) => value >= todayIso(), "Choose a date from today onwards"),
    expectedGuests: z
      .string()
      .refine(
        (value) => value.trim() === "" || (/^\d+$/.test(value) && Number(value) >= 1 && Number(value) <= 100000),
        "Enter a guest count between 1 and 100,000",
      ),
    startTime: z.string().min(1, "Choose a start time"),
    endTime: z.string(),
    venue: z.string().trim().min(2, "Enter the venue or location"),
  })
  .refine((value) => !value.endTime || value.endTime > value.startTime, {
    message: "End time must be after the start time",
    path: ["endTime"],
  });

export type BasicsFormValues = z.infer<typeof basicsSchema>;

export const detailsSchema = z.object({
  fullVenueAddress: z.string().trim().min(5, "Enter the full venue address"),
  parkingInfo: z.string().trim().min(2, "Add parking information"),
  dressCode: z.string().trim().min(2, "Enter the dress code"),
  additionalNotes: z.string().trim().min(2, "Add a note for your guests"),
});

export type DetailsFormValues = z.infer<typeof detailsSchema>;

export const guestEntrySchema = z.object({
  name: z.string().trim().min(2, "Enter the guest name"),
  group: z.enum(GUEST_GROUPS, { message: "Choose a guest group" }),
  phone: z
    .string()
    .transform((value) => normalizeWhatsAppPhone(value))
    .refine(
      (value) => !isExcelShortNumber(value),
      "Excel shortened this number. Type it as +234 801 234 5678.",
    )
    .refine(
      isWhatsAppPhone,
      "Include the country code, for example +234 801 234 5678. Extra spaces are removed.",
    ),
});

export type GuestEntryValues = z.infer<typeof guestEntrySchema>;

export const guestsStepSchema = z.object({
  guests: z
    .array(
      z.object({
        id: z.string(),
        name: z.string().min(1),
        phone: z.string().min(1),
      }),
    )
    .min(1, "Add at least one guest before you continue"),
});

export const invitationSchema = z.object({
  selectedTemplateId: z.string().min(1, "Choose an invitation template"),
  customTitle: z.string().trim().min(2, "Enter the invitation title"),
  customSubHeader: z.string().trim(),
  customDate: z.string().trim().min(2, "Enter the invitation date"),
  customTime: z.string().trim().min(2, "Enter the invitation time"),
  customVenue: z.string().trim().min(2, "Enter the venue"),
  customMessage: z.string().trim().min(2, "Write the invitation message"),
});

export type InvitationFormValues = z.infer<typeof invitationSchema>;

export const experienceSchema = z
  .object({
    languages: z.array(z.string()).min(1, "Keep at least one language"),
    methodOneClick: z.boolean(),
    methodText: z.boolean(),
    methodVoice: z.boolean(),
    collectPartySize: z.boolean(),
    collectAccessibility: z.boolean(),
    collectProtocol: z.boolean(),
    collectDietary: z.boolean(),
    collectRelationship: z.boolean(),
    collectSeating: z.boolean(),
    allowConfirmed: z.boolean(),
    allowTentative: z.boolean(),
    allowDeclined: z.boolean(),
    confirmedMessage: z.string().trim().min(2, "Write the confirmed response"),
    tentativeMessage: z.string().trim(),
    declinedMessage: z.string().trim().min(2, "Write the declined response"),
    sendTentativeReminder: z.boolean(),
    reminderLead: z.enum(["1 day before", "3 days before", "5 days before", "7 days before"]),
    rsvpDeadline: z.string(),
    allowResponseUpdate: z.boolean(),
  })
  .superRefine((value, ctx) => {
    if (!value.methodOneClick && !value.methodText && !value.methodVoice) {
      ctx.addIssue({
        code: "custom",
        message: "Choose at least one RSVP method",
        path: ["methodOneClick"],
      });
    }
    if (value.allowTentative && value.tentativeMessage.trim().length < 2) {
      ctx.addIssue({
        code: "custom",
        message: "Write the tentative response",
        path: ["tentativeMessage"],
      });
    }
    if (value.sendTentativeReminder && !value.rsvpDeadline) {
      ctx.addIssue({
        code: "custom",
        message: "Choose the RSVP deadline",
        path: ["rsvpDeadline"],
      });
    }
  });

export type ExperienceFormValues = z.infer<typeof experienceSchema>;

export const cardPaymentSchema = z.object({
  cardNumber: z
    .string()
    .trim()
    .min(13, "Enter the card number")
    .regex(/^[\d\s]+$/, "Use digits only")
    .refine((value) => value.replace(/\s/g, "").length >= 13 && value.replace(/\s/g, "").length <= 19, "Enter a valid card number"),
  expiryDate: z
    .string()
    .trim()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Use mm/yy, for example 12/28"),
  cvv: z.string().trim().regex(/^\d{3,4}$/, "Enter the 3 or 4 digit CVV"),
});

export type CardPaymentValues = z.infer<typeof cardPaymentSchema>;
