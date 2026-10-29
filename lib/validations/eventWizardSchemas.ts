import { z } from "zod";
import { isExcelShortNumber, isWhatsAppPhone, normalizeWhatsAppPhone } from "@/lib/phone";
import { EVENT_TYPES, GUEST_GROUPS } from "@/store/eventSlice/eventSlice";

const todayIso = () => new Date().toISOString().slice(0, 10);

export function basicsSchemaFor(kind: "individual" | "agency" | "venue" = "individual") {
  return z
    .object({
      audience: z.enum(["agency", "client"]),
      clientName: z.string(),
      clientId: z.string(),
      clientFirstName: z.string(),
      clientLastName: z.string(),
      clientEmail: z.string(),
      clientPhone: z.string(),
      clientOrganization: z.string(),
      teamIds: z.array(z.string()),
      addTeam: z.boolean(),
      teamName: z.string(),
      teamRole: z.string(),
      teamEmail: z.string(),
      teamPhone: z.string(),
      spaceId: z.string(),
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
    .superRefine((value, ctx) => {
      if (value.endTime && value.endTime <= value.startTime) {
        ctx.addIssue({
          code: "custom",
          message: "End time must be after the start time",
          path: ["endTime"],
        });
      }
      if (kind === "agency" && value.audience === "client") {
        const adding = value.clientId === "__new__";
        if (!value.clientId) {
          ctx.addIssue({
            code: "custom",
            message: "Select a previous client or add a new one",
            path: ["clientId"],
          });
        }
        if (adding && value.clientFirstName.trim().length < 2) {
          ctx.addIssue({ code: "custom", message: "Enter the first name", path: ["clientFirstName"] });
        }
        if (adding && !value.clientLastName.trim()) {
          ctx.addIssue({ code: "custom", message: "Enter the last name", path: ["clientLastName"] });
        }
        if (adding && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.clientEmail.trim())) {
          ctx.addIssue({ code: "custom", message: "Enter a valid email address", path: ["clientEmail"] });
        }
      }
      if (kind === "venue") {
        if (!value.spaceId) {
          ctx.addIssue({ code: "custom", message: "Select a venue", path: ["spaceId"] });
        }
        if (value.clientName.trim().length < 2) {
          ctx.addIssue({ code: "custom", message: "Enter the client name", path: ["clientName"] });
        }
        if (value.teamIds.length === 0 && !value.addTeam) {
          ctx.addIssue({ code: "custom", message: "Select a team member or add a new one", path: ["teamIds"] });
        }
      }
      if ((kind === "agency" || kind === "venue") && value.addTeam) {
        if (value.teamName.trim().length < 2) {
          ctx.addIssue({ code: "custom", message: "Enter the full name", path: ["teamName"] });
        }
        if (value.teamRole !== "Admin" && value.teamRole !== "Gate Staff") {
          ctx.addIssue({ code: "custom", message: "Select a role", path: ["teamRole"] });
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.teamEmail.trim())) {
          ctx.addIssue({ code: "custom", message: "Enter a valid email address", path: ["teamEmail"] });
        }
      }
    });
}

export const basicsSchema = basicsSchemaFor("individual");

export type BasicsFormValues = z.infer<ReturnType<typeof basicsSchemaFor>>;

export const detailsSchema = z.object({
  fullVenueAddress: z.string().trim().min(5, "Enter the full venue address"),
  parkingInfo: z.string().trim().min(2, "Add parking information"),
  dressCode: z.string().trim().min(2, "Enter the dress code"),
  additionalNotes: z.string().trim().min(2, "Add a note for your guests"),
});

export type DetailsFormValues = z.infer<typeof detailsSchema>;

export const guestEntrySchema = z.object({
  name: z.string().trim().min(2, "Enter the guest name"),
  email: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      "Enter a valid email",
    ),
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
