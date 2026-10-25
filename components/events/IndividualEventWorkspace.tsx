"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { eventsPath } from "@/lib/organizer";
import {
  basicsSchema,
  detailsSchema,
  experienceSchema,
  guestsStepSchema,
  invitationSchema,
  type BasicsFormValues,
  type DetailsFormValues,
  type ExperienceFormValues,
  type InvitationFormValues,
} from "@/lib/validations/eventWizardSchemas";
import { useGetMeQuery } from "@/store/Auth/authApi";
import {
  useBulkAddGuestsMutation,
  useCreateEventMutation,
} from "@/store/Event/eventAPI";
import type { AddGuestPayload } from "@/store/Event/types/eventTypes";
import {
  clearEventWizard,
  initialEventWizardState,
  saveBasics,
  saveDetails,
  saveExperience,
  saveInvitation,
  setGuests,
  setActiveStep as setWizardStep,
  type WizardGuest,
} from "@/store/eventSlice/eventSlice";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlanPaymentFlow } from "@/components/payments/PlanPaymentFlow";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Eye,
  MapPin,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { ExperienceStep } from "./ExperienceStep";
import { GuestListManager } from "./GuestListManager";
import { EventBanner } from "./shared/EventBanner";
import {
  countdownTo,
  formatEventDate,
  formatEventTime,
} from "./shared/event-format";

function preferFilled<T extends object>(saved: T, current: Partial<T>): T {
  const next = { ...saved };
  for (const key of Object.keys(current) as (keyof T)[]) {
    const value = current[key];
    if (typeof value === "string") {
      if (value.trim()) next[key] = value as T[keyof T];
    } else if (value !== undefined && value !== null) {
      next[key] = value as T[keyof T];
    }
  }
  return next;
}

function paymentReturnKey() {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const status = (params.get("status") || params.get("payment_status") || "").toLowerCase();
  const paid = status === "successful" || status === "completed" || params.get("payment_success") === "true";
  if (!paid) return null;
  const tx = params.get("tx_ref") || params.get("transaction_id") || "return";
  return `event-created-after-payment:${tx}`;
}

function formatInviteDate(value: string) {
  if (!value) return "";
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatInviteTime(value: string) {
  if (!value) return "";
  const [hours, minutes] = value.split(":");
  const date = new Date();
  date.setHours(Number(hours), Number(minutes || 0), 0, 0);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function firstFilled(...values: Array<string | undefined>) {
  return values.find((value) => value && value.trim())?.trim() ?? "";
}

function toGuestPayload(guest: WizardGuest): AddGuestPayload {
  return {
    name: guest.name,
    phone: guest.phone,
    email: guest.email || undefined,
    type: guest.group,
    inviteThrough: "WhatsApp",
    rsvpStatus:
      guest.rsvpStatus === "Accepted"
        ? "Confirmed"
        : guest.rsvpStatus === "Pending"
          ? "Awaiting Response"
          : guest.rsvpStatus,
  };
}

export type StepKey =
  | "basics"
  | "details"
  | "guests"
  | "invitation"
  | "experience"
  | "payment";

export interface InvitationTemplateItem {
  id: string;
  name: string;
  tag: string;
  category:
    | "Wedding"
    | "Gala & Formal"
    | "Celebration"
    | "Corporate"
    | "Minimal";
  names: string;
  dateText: string;
  venueText: string;
}

const INVITATION_TEMPLATES: InvitationTemplateItem[] = [
  {
    id: "tpl-1",
    name: "Heritage Elegance",
    tag: "Traditional",
    category: "Wedding",
    names: "Robert & Marie",
    dateText: "14/04/22",
    venueText: "ST. Peter's Church, Agra, India",
  },
  {
    id: "tpl-2",
    name: "Heritage Elegance",
    tag: "Traditional",
    category: "Gala & Formal",
    names: "Robert & Marie",
    dateText: "14/04/22",
    venueText: "ST. Peter's Church, Agra, India",
  },
  {
    id: "tpl-3",
    name: "Heritage Elegance",
    tag: "Traditional",
    category: "Celebration",
    names: "Robert & Marie",
    dateText: "14/04/22",
    venueText: "ST. Peter's Church, Agra, India",
  },
  {
    id: "tpl-4",
    name: "Heritage Elegance",
    tag: "Traditional",
    category: "Wedding",
    names: "Robert & Marie",
    dateText: "14/04/22",
    venueText: "ST. Peter's Church, Agra, India",
  },
  {
    id: "tpl-5",
    name: "Heritage Elegance",
    tag: "Traditional",
    category: "Gala & Formal",
    names: "Robert & Marie",
    dateText: "14/04/22",
    venueText: "ST. Peter's Church, Agra, India",
  },
  {
    id: "tpl-6",
    name: "Heritage Elegance",
    tag: "Traditional",
    category: "Minimal",
    names: "Robert & Marie",
    dateText: "14/04/22",
    venueText: "ST. Peter's Church, Agra, India",
  },
  {
    id: "tpl-7",
    name: "Heritage Elegance",
    tag: "Traditional",
    category: "Celebration",
    names: "Robert & Marie",
    dateText: "14/04/22",
    venueText: "ST. Peter's Church, Agra, India",
  },
  {
    id: "tpl-8",
    name: "Heritage Elegance",
    tag: "Traditional",
    category: "Corporate",
    names: "Robert & Marie",
    dateText: "14/04/22",
    venueText: "ST. Peter's Church, Agra, India",
  },
  {
    id: "tpl-9",
    name: "Heritage Elegance",
    tag: "Traditional",
    category: "Minimal",
    names: "Robert & Marie",
    dateText: "14/04/22",
    venueText: "ST. Peter's Church, Agra, India",
  },
];

export function IndividualEventWorkspace({
  initialStep,
  startNew = false,
}: {
  initialStep?: StepKey;
  startNew?: boolean;
}) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const wizard = useAppSelector((state) => state.event);
  const wizardReady = useAppSelector(
    (state) =>
      (state.event as { _persist?: { rehydrated?: boolean } })._persist
        ?.rehydrated === true,
  );
  const { data: profile } = useGetMeQuery();
  const planPaid = profile?.data?.plan?.isPaid === true;
  const activeStep = wizard.activeStep;
  const setActiveStep = (step: StepKey) => dispatch(setWizardStep(step));

  React.useEffect(() => {
    if (initialStep) dispatch(setWizardStep(initialStep));
  }, [dispatch, initialStep]);

  React.useEffect(() => {
    if (planPaid && activeStep === "payment" && !paymentReturnKey()) {
      dispatch(setWizardStep("experience"));
    }
  }, [activeStep, dispatch, planPaid]);

  const basicsForm = useForm<BasicsFormValues>({
    resolver: zodResolver(basicsSchema),
    defaultValues: wizard.basics,
  });
  const detailsForm = useForm<DetailsFormValues>({
    resolver: zodResolver(detailsSchema),
    defaultValues: wizard.details,
  });
  const invitationForm = useForm<InvitationFormValues>({
    resolver: zodResolver(invitationSchema),
    defaultValues: wizard.invitation,
  });
  const savedExperience = wizard.experience;
  const experienceForm = useForm<ExperienceFormValues>({
    resolver: zodResolver(experienceSchema),
    defaultValues: Array.isArray(savedExperience.languages)
      ? {
          ...initialEventWizardState.experience,
          ...savedExperience,
        }
      : initialEventWizardState.experience,
  });
  const guestStepForm = useForm<{
    guests: { id: string; name: string; phone: string }[];
  }>({
    resolver: zodResolver(guestsStepSchema),
    values: {
      guests: wizard.guests.map((guest) => ({
        id: guest.id,
        name: guest.name,
        phone: guest.phone,
      })),
    },
  });
  const freshStart = React.useRef(false);
  const formsSynced = React.useRef(false);

  React.useEffect(() => {
    if (!wizardReady || formsSynced.current || freshStart.current) return;
    formsSynced.current = true;
    basicsForm.reset(wizard.basics);
    detailsForm.reset(wizard.details);
    invitationForm.reset(wizard.invitation);
    experienceForm.reset(
      Array.isArray(wizard.experience.languages)
        ? { ...initialEventWizardState.experience, ...wizard.experience }
        : initialEventWizardState.experience,
    );
  }, [basicsForm, detailsForm, experienceForm, invitationForm, wizard, wizardReady]);

  React.useEffect(() => {
    if (!startNew || !wizardReady || freshStart.current) return;
    freshStart.current = true;
    dispatch(clearEventWizard());
    basicsForm.reset(initialEventWizardState.basics);
    detailsForm.reset(initialEventWizardState.details);
    invitationForm.reset(initialEventWizardState.invitation);
    experienceForm.reset(initialEventWizardState.experience);
    router.replace("/organizer/individual/events/create");
  }, [
    basicsForm,
    detailsForm,
    dispatch,
    experienceForm,
    invitationForm,
    router,
    startNew,
    wizardReady,
  ]);

  const [createEvent, { isLoading: isCreatingEvent }] =
    useCreateEventMutation();
  const [bulkAddGuests] = useBulkAddGuestsMutation();

  const [invitationFilter, setInvitationFilter] =
    React.useState("All Template");
  const [previewTemplate, setPreviewTemplate] =
    React.useState<InvitationTemplateItem | null>(null);
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = React.useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = React.useState(false);
  const [isReadySuccessOpen, setIsReadySuccessOpen] = React.useState(false);
  const [finishedEventId, setFinishedEventId] = React.useState<string | null>(
    null,
  );
  const [finishedTitle, setFinishedTitle] = React.useState("");
  const finishedEventRef = React.useRef<string | null>(null);
  const wizardRef = React.useRef(wizard);
  wizardRef.current = wizard;
  const paymentCreateStarted = React.useRef(false);

  const eventName = basicsForm.watch("eventName") || wizard.basics.eventName;
  const eventType = basicsForm.watch("eventType") || wizard.basics.eventType;
  const eventDate = basicsForm.watch("eventDate") || wizard.basics.eventDate;
  const expectedGuests =
    basicsForm.watch("expectedGuests") || wizard.basics.expectedGuests;
  const startTime = basicsForm.watch("startTime") || wizard.basics.startTime;
  const eventStart = eventDate ? `${eventDate}T${startTime || "00:00"}` : "";
  const guestCapacity = Math.max(1, Number.parseInt(expectedGuests, 10) || 120);
  const fullVenueAddress =
    detailsForm.watch("fullVenueAddress") || wizard.details.fullVenueAddress;
  const parkingInfo =
    detailsForm.watch("parkingInfo") || wizard.details.parkingInfo;
  const dressCode = detailsForm.watch("dressCode") || wizard.details.dressCode;
  const additionalNotes =
    detailsForm.watch("additionalNotes") || wizard.details.additionalNotes;
  const selectedTemplateId = invitationForm.watch("selectedTemplateId");
  const customTitle = invitationForm.watch("customTitle");
  const customSubHeader = invitationForm.watch("customSubHeader");
  const customDate = invitationForm.watch("customDate");
  const customTime = invitationForm.watch("customTime");
  const customVenue = invitationForm.watch("customVenue");
  const customMessage = invitationForm.watch("customMessage");

  const fieldError = (message?: string) =>
    message ? <p className="text-xs text-[#B33927]">{message}</p> : null;

  const createEventFromWizard = async () => {
    const saved = wizardRef.current;
    const basicsInput = preferFilled(saved.basics, basicsForm.getValues());
    const detailsInput = preferFilled(saved.details, detailsForm.getValues());
    if (basicsInput.eventName === "Please fill out this field.") {
      basicsInput.eventName = saved.basics.eventName === "Please fill out this field." ? "" : saved.basics.eventName;
    }
    const basicsResult = basicsSchema.safeParse(basicsInput);
    const detailsResult = detailsSchema.safeParse(detailsInput);
    if (!basicsResult.success || !detailsResult.success) {
      toast.error(
        "Finish the basics and details steps before creating the event.",
      );
      setActiveStep(basicsResult.success ? "details" : "basics");
      throw new Error("Finish the basics and details steps before creating the event.");
    }
    const basics = basicsResult.data;
    const details = detailsResult.data;
    const created = await createEvent({
      title: basics.eventName.trim(),
      category: basics.eventType,
      startDate: new Date(
        `${basics.eventDate}T${basics.startTime || "00:00"}`,
      ).toISOString(),
      endDate: basics.endTime
        ? new Date(`${basics.eventDate}T${basics.endTime}`).toISOString()
        : undefined,
      capacity: Number.parseInt(basics.expectedGuests, 10) || guestCapacity,
      venueName: basics.venue || undefined,
      address: details.fullVenueAddress || undefined,
      description: details.additionalNotes || undefined,
    }).unwrap();
    const eventId = created.data?.id;
    if (!eventId) throw new Error("Event was not created");
    if (saved.guests.length > 0) {
      try {
        await bulkAddGuests({
          eventId,
          data: { guests: saved.guests.map(toGuestPayload) },
        }).unwrap();
      } catch {
        toast.error("The event was created, but the guest list could not be saved.");
      }
    }
    finishedEventRef.current = eventId;
    setFinishedEventId(eventId);
    setFinishedTitle(basics.eventName.trim());
    dispatch(clearEventWizard());
    setIsReadySuccessOpen(true);
    const returnKey = paymentReturnKey();
    if (returnKey) {
      sessionStorage.setItem(returnKey, JSON.stringify({ eventId, title: basics.eventName.trim() }));
    }
  };

  const createEventRef = React.useRef(createEventFromWizard);
  createEventRef.current = createEventFromWizard;

  React.useEffect(() => {
    if (!wizardReady) return;
    const key = paymentReturnKey();
    if (!key || paymentCreateStarted.current) return;
    const existing = sessionStorage.getItem(key);
    if (existing) {
      try {
        const saved = JSON.parse(existing) as { eventId?: string; title?: string };
        if (saved.eventId) {
          finishedEventRef.current = saved.eventId;
          setFinishedEventId(saved.eventId);
          setFinishedTitle(saved.title || "Your event");
          setIsReadySuccessOpen(true);
        }
      } catch {
        sessionStorage.removeItem(key);
      }
      return;
    }
    paymentCreateStarted.current = true;
    setIsProcessingPayment(true);
    void createEventRef.current()
      .catch(() => {
        paymentCreateStarted.current = false;
      })
      .finally(() => setIsProcessingPayment(false));
  }, [wizardReady]);

  const continueBasics = basicsForm.handleSubmit((values) => {
    dispatch(saveBasics(values));
    setActiveStep("details");
  });

  const continueDetails = detailsForm.handleSubmit((values) => {
    dispatch(saveDetails(values));
    setActiveStep("guests");
  });

  const continueGuests = guestStepForm.handleSubmit(
    () => {
      setActiveStep("invitation");
    },
    () => {
      toast.error("Add at least one guest before you continue.");
    },
  );

  const continueInvitation = invitationForm.handleSubmit(
    (values) => {
      dispatch(saveInvitation(values));
      setIsCustomizeModalOpen(false);
      setActiveStep("experience");
    },
    () => openCustomize(),
  );

  const seedInvitationFromEvent = () => {
    const current = invitationForm.getValues();
    invitationForm.reset({
      selectedTemplateId: firstFilled(
        current.selectedTemplateId,
        wizard.invitation.selectedTemplateId,
        "tpl-1",
      ),
      customTitle: firstFilled(
        current.customTitle,
        wizard.invitation.customTitle,
        wizard.basics.eventName,
      ),
      customSubHeader: firstFilled(
        current.customSubHeader,
        wizard.invitation.customSubHeader,
      ),
      customDate: firstFilled(
        current.customDate,
        wizard.invitation.customDate,
        formatInviteDate(wizard.basics.eventDate),
      ),
      customTime: firstFilled(
        current.customTime,
        wizard.invitation.customTime,
        formatInviteTime(wizard.basics.startTime),
      ),
      customVenue: firstFilled(
        current.customVenue,
        wizard.invitation.customVenue,
        wizard.details.fullVenueAddress,
        wizard.basics.venue,
      ),
      customMessage: firstFilled(
        current.customMessage,
        wizard.invitation.customMessage,
        wizard.details.additionalNotes,
      ),
    });
  };

  const openCustomize = () => {
    seedInvitationFromEvent();
    setIsCustomizeModalOpen(true);
  };

  const continueExperience = experienceForm.handleSubmit(async (values) => {
    dispatch(saveBasics(preferFilled(wizardRef.current.basics, basicsForm.getValues())));
    dispatch(saveDetails(preferFilled(wizardRef.current.details, detailsForm.getValues())));
    dispatch(saveExperience(values));
    if (!planPaid) {
      setActiveStep("payment");
      return;
    }
    setIsProcessingPayment(true);
    try {
      await createEventFromWizard();
    } catch {
      // baseAPI surfaces the server error as a toast
    } finally {
      setIsProcessingPayment(false);
    }
  });

  return (
    <div className="w-full space-y-6">
      <EventBanner
        title={eventName.trim() || "Untitled Event"}
        category={eventType}
        status="draft"
        countdown={countdownTo(eventStart)}
        meta={{
          date: formatEventDate(eventStart) || "Date not set",
          time: formatEventTime(eventStart) || undefined,
          guests: expectedGuests || undefined,
        }}
      />
      {isProcessingPayment && (
        <p className="text-sm text-[#736B66]">Creating your event…</p>
      )}

      {/* Horizontal Connected Stepper matching Figma (Basics -> Details -> Guests -> Invitation -> Experience -> Payment) */}
      <div className="relative flex items-center justify-center pt-2 pb-4">
        <div className="absolute inset-x-12 top-1/2 -translate-y-1/2 h-0.5 bg-[#E5DFD7] dark:bg-border -z-0" />

        <div className="relative z-10 flex items-center gap-2 md:gap-4 overflow-x-auto px-4 max-w-full">
          {/* Step 1: Basics */}
          <button
            type="button"
            onClick={() => setActiveStep("basics")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
              activeStep === "basics"
                ? "bg-[#2D5A46] text-white shadow-sm ring-4 ring-[#2D5A46]/20"
                : [
                      "details",
                      "guests",
                      "invitation",
                      "experience",
                      "payment",
                    ].includes(activeStep)
                  ? "bg-[#2D5A46] text-white shadow-xs"
                  : "bg-white dark:bg-card border border-[#DED7CC] text-muted-foreground"
            }`}
          >
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Basics</span>
          </button>

          {/* Step 2: Details */}
          <button
            type="button"
            onClick={() => setActiveStep("details")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
              activeStep === "details"
                ? "bg-[#6E3B1C] text-white shadow-sm ring-4 ring-[#6E3B1C]/20"
                : ["guests", "invitation", "experience", "payment"].includes(
                      activeStep,
                    )
                  ? "bg-[#2D5A46] text-white shadow-xs"
                  : "bg-white dark:bg-card border border-[#DED7CC] text-muted-foreground"
            }`}
          >
            {["guests", "invitation", "experience", "payment"].includes(
              activeStep,
            ) ? (
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            ) : (
              <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold">
                2
              </span>
            )}
            <span>Details</span>
          </button>

          {/* Step 3: Guests */}
          <button
            type="button"
            onClick={() => setActiveStep("guests")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
              activeStep === "guests"
                ? "bg-[#6E3B1C] text-white shadow-sm ring-4 ring-[#6E3B1C]/20"
                : ["invitation", "experience", "payment"].includes(activeStep)
                  ? "bg-[#2D5A46] text-white shadow-xs"
                  : "bg-white dark:bg-card border border-[#DED7CC] text-muted-foreground"
            }`}
          >
            {["invitation", "experience", "payment"].includes(activeStep) ? (
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            ) : (
              <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold">
                3
              </span>
            )}
            <span>Guests</span>
          </button>

          {/* Step 4: Invitation */}
          <button
            type="button"
            onClick={() => setActiveStep("invitation")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
              activeStep === "invitation"
                ? "bg-[#6E3B1C] text-white shadow-sm ring-4 ring-[#6E3B1C]/20"
                : ["experience", "payment"].includes(activeStep)
                  ? "bg-[#2D5A46] text-white shadow-xs"
                  : "bg-white dark:bg-card border border-[#DED7CC] text-muted-foreground"
            }`}
          >
            {["experience", "payment"].includes(activeStep) ? (
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            ) : (
              <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold">
                4
              </span>
            )}
            <span>Invitation</span>
          </button>

          {/* Step 5: Experience */}
          <button
            type="button"
            onClick={() => setActiveStep("experience")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
              activeStep === "experience"
                ? "bg-[#6E3B1C] text-white shadow-sm ring-4 ring-[#6E3B1C]/20"
                : ["payment"].includes(activeStep)
                  ? "bg-[#2D5A46] text-white shadow-xs"
                  : "bg-white dark:bg-card border border-[#DED7CC] text-muted-foreground"
            }`}
          >
            {["payment"].includes(activeStep) ? (
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            ) : (
              <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold">
                5
              </span>
            )}
            <span>Experience</span>
          </button>

          {/* Payment is shown only when this individual has not paid for a plan. */}
          {!planPaid && (
          <button
            type="button"
            onClick={() => setActiveStep("payment")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
              activeStep === "payment"
                ? "bg-[#6E3B1C] text-white shadow-sm ring-4 ring-[#6E3B1C]/20"
                : "bg-white dark:bg-card border border-[#DED7CC] text-muted-foreground"
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold">
              7
            </span>
            <span>Payment</span>
          </button>
          )}
        </div>
      </div>

      {/* STEP 1: BASICS FORM */}
      {activeStep === "basics" && (
        <Card className="rounded-3xl border border-[#EBE3D9] dark:border-border bg-card p-6 md:p-10 shadow-2xs">
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="font-serif font-bold text-xl md:text-2xl text-[#1F140E] dark:text-foreground">
                Set Event Basics
              </h2>
              <p className="text-xs text-[#736B66] dark:text-muted-foreground">
                Enter core details to start building your personalized event
                experience.
              </p>
            </div>

            <form
              onSubmit={continueBasics}
              noValidate
              className="space-y-5 pt-2"
            >
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-foreground">
                  Event Name <span className="text-rose-500">*</span>
                </Label>
                <Input
                  placeholder="e.g. The Grand Royal Gala & Investiture"
                  className="h-11 text-xs rounded-xl bg-[#FAF8F5] dark:bg-muted/40 border-[#EBE3D9] dark:border-border px-4"
                  {...basicsForm.register("eventName")}
                />
                {fieldError(basicsForm.formState.errors.eventName?.message)}
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-foreground">
                  Event Type <span className="text-rose-500">*</span>
                </Label>
                <div className="relative">
                  <select
                    className="w-full h-11 px-4 pr-10 rounded-xl bg-[#FAF8F5] dark:bg-muted/40 border border-[#EBE3D9] dark:border-border text-xs text-foreground appearance-none cursor-pointer"
                    {...basicsForm.register("eventType")}
                  >
                    <option value="Gala">Gala &amp; Investiture</option>
                    <option value="Wedding">Wedding</option>
                    <option value="Conference">Conference</option>
                    <option value="Private Dinner">Private Dinner</option>
                    <option value="Birthday">Birthday Celebration</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                {fieldError(basicsForm.formState.errors.eventType?.message)}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-foreground">
                    Event Date <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    type="date"
                    className="h-11 text-xs rounded-xl bg-[#FAF8F5] dark:bg-muted/40 border-[#EBE3D9] dark:border-border px-4"
                    {...basicsForm.register("eventDate")}
                  />
                  {fieldError(basicsForm.formState.errors.eventDate?.message)}
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-foreground">
                    Expected Guests
                  </Label>
                  <Input
                    type="number"
                    placeholder="e.g. 150"
                    className="h-11 text-xs rounded-xl bg-[#FAF8F5] dark:bg-muted/40 border-[#EBE3D9] dark:border-border px-4"
                    {...basicsForm.register("expectedGuests")}
                  />
                  {fieldError(
                    basicsForm.formState.errors.expectedGuests?.message,
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-foreground">
                    Start Time <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    type="time"
                    className="h-11 text-xs rounded-xl bg-[#FAF8F5] dark:bg-muted/40 border-[#EBE3D9] dark:border-border px-4"
                    {...basicsForm.register("startTime")}
                  />
                  {fieldError(basicsForm.formState.errors.startTime?.message)}
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-foreground">
                    End Time (Optional)
                  </Label>
                  <Input
                    type="time"
                    className="h-11 text-xs rounded-xl bg-[#FAF8F5] dark:bg-muted/40 border-[#EBE3D9] dark:border-border px-4"
                    {...basicsForm.register("endTime")}
                  />
                  {fieldError(basicsForm.formState.errors.endTime?.message)}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-foreground">
                  Venue / Location <span className="text-rose-500">*</span>
                </Label>
                <Input
                  placeholder="e.g. The Monarch Event Centre, Victoria Island, Lagos"
                  className="h-11 text-xs rounded-xl bg-[#FAF8F5] dark:bg-muted/40 border-[#EBE3D9] dark:border-border px-4"
                  {...basicsForm.register("venue")}
                />
                {fieldError(basicsForm.formState.errors.venue?.message)}
              </div>

              <div className="pt-4 flex justify-end">
                <Button
                  type="submit"
                  className="h-11 px-8 text-xs font-semibold rounded-xl bg-[#6E3B1C] hover:bg-[#5C3117] text-white shadow-xs"
                >
                  <span>Save &amp; Continue to Details</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </form>
          </div>
        </Card>
      )}

      {/* STEP 2: DETAILS WITH LIVE GUEST PREVIEW matching media_1791786529012_0b9b48bc.png */}
      {activeStep === "details" && (
        <Card className="rounded-3xl border border-[#EBE3D9] dark:border-border bg-card p-6 md:p-10 shadow-2xs">
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="font-serif font-bold text-xl md:text-2xl text-[#1F140E] dark:text-foreground">
                Tell Your Guests What They Need To Know
              </h2>
              <p className="text-xs text-[#736B66] dark:text-muted-foreground">
                Add helpful details to ensure everyone has a smooth experience.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-2 items-start">
              {/* Form Fields (Left Column) */}
              <form
                onSubmit={continueDetails}
                noValidate
                className="lg:col-span-7 space-y-5"
              >
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-foreground">
                    Full Venue Address <span className="text-rose-500">*</span>
                  </Label>
                  <textarea
                    rows={3}
                    placeholder="Enter Full Venue Address"
                    className="w-full p-3.5 rounded-2xl text-xs bg-[#FAF8F5] dark:bg-muted/40 border border-[#EBE3D9] dark:border-border text-foreground focus:outline-none focus:ring-2 focus:ring-[#6E3B1C]/20 resize-none"
                    {...detailsForm.register("fullVenueAddress")}
                  />
                  {fieldError(
                    detailsForm.formState.errors.fullVenueAddress?.message,
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-foreground">
                    Parking Information <span className="text-rose-500">*</span>
                  </Label>
                  <textarea
                    rows={3}
                    placeholder="Enter Parking Information"
                    className="w-full p-3.5 rounded-2xl text-xs bg-[#FAF8F5] dark:bg-muted/40 border border-[#EBE3D9] dark:border-border text-foreground focus:outline-none focus:ring-2 focus:ring-[#6E3B1C]/20 resize-none"
                    {...detailsForm.register("parkingInfo")}
                  />
                  {fieldError(
                    detailsForm.formState.errors.parkingInfo?.message,
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-foreground">
                    Dress Code <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    placeholder="Enter Dress Code"
                    className="h-11 text-xs rounded-xl bg-[#FAF8F5] dark:bg-muted/40 border-[#EBE3D9] dark:border-border px-4"
                    {...detailsForm.register("dressCode")}
                  />
                  {fieldError(detailsForm.formState.errors.dressCode?.message)}
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-foreground">
                    Additional Notes*
                  </Label>
                  <textarea
                    rows={3}
                    placeholder="Enter Additional Notes"
                    className="w-full p-3.5 rounded-2xl text-xs bg-[#FAF8F5] dark:bg-muted/40 border border-[#EBE3D9] dark:border-border text-foreground focus:outline-none focus:ring-2 focus:ring-[#6E3B1C]/20 resize-none"
                    {...detailsForm.register("additionalNotes")}
                  />
                  {fieldError(
                    detailsForm.formState.errors.additionalNotes?.message,
                  )}
                </div>

                <div className="pt-4 flex items-center justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveStep("basics")}
                    className="h-11 px-6 text-xs rounded-xl"
                  >
                    ← Back to Basics
                  </Button>
                  <Button
                    type="submit"
                    className="h-11 px-8 text-xs font-semibold rounded-xl bg-[#6E3B1C] hover:bg-[#5C3117] text-white shadow-xs"
                  >
                    <span>Save &amp; Continue to Guests</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </form>

              {/* Guest Preview Card (Right Column) matching screenshot */}
              <div className="lg:col-span-5 sticky top-6">
                <div className="rounded-3xl border border-[#E8DACB] bg-[#FFFDFB] dark:bg-card p-6 shadow-sm space-y-5">
                  <div className="flex items-center gap-2 text-sm font-serif font-bold text-[#1F140E] dark:text-foreground">
                    <span>🎴</span>
                    <span>Guest Preview</span>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div className="flex items-start gap-2.5 text-foreground leading-relaxed">
                      <MapPin className="w-4 h-4 text-[#6E3B1C] shrink-0 mt-0.5" />
                      <span>
                        {fullVenueAddress || "No venue specified yet."}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <p className="font-semibold text-foreground">Parking</p>
                      <p className="text-muted-foreground leading-relaxed">
                        {parkingInfo || "Parking information will appear here."}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="font-semibold text-foreground">
                        Dress Code
                      </p>
                      <p className="text-muted-foreground leading-relaxed">
                        {dressCode || "Dress code will appear here."}
                      </p>
                    </div>

                    {additionalNotes && (
                      <div className="p-4 rounded-2xl bg-[#FCEDE6] border border-[#F5D5C6] text-[#6E3B1C] text-xs leading-relaxed text-center font-medium">
                        {additionalNotes}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* STEP 3: ADD YOUR GUESTS matching media_1791786578945_e49486c9.png */}
      {activeStep === "guests" && (
        <div className="space-y-6">
          <GuestListManager
            guests={wizard.guests}
            capacity={guestCapacity}
            eventName={eventName}
            onChange={(next) => dispatch(setGuests(next))}
          />
          {fieldError(
            guestStepForm.formState.errors.guests?.message ||
              guestStepForm.formState.errors.guests?.root?.message,
          )}
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setActiveStep("details")}
              className="text-xs rounded-xl"
            >
              ← Back to Details
            </Button>
            <Button
              type="button"
              onClick={() => void continueGuests()}
              className="text-xs bg-[#6E3B1C] hover:bg-[#5C3117] text-white rounded-xl px-6"
            >
              Proceed to Invitation →
            </Button>
          </div>
        </div>
      )}

      {/* STEP 4: CHOOSE INVITATION STYLE matching media_1791786529508_aa42339e.png */}
      {activeStep === "invitation" && (
        <div className="space-y-6">
          <div className="space-y-1.5">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#1F140E] dark:text-foreground tracking-tight">
              Choose An Invitation Style
            </h2>
            <p className="text-xs md:text-sm text-[#736B66] dark:text-muted-foreground max-w-2xl leading-relaxed">
              Start with a design that fits your event. You can personalize all
              the details, colors, and imagery in the next step.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {(
              [
                "All Template",
                "Wedding",
                "Gala & Formal",
                "Celebration",
                "Corporate",
                "Minimal",
              ] as const
            ).map((cat) => {
              const isActive = invitationFilter === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setInvitationFilter(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#1A1009] dark:bg-white text-white dark:text-[#1A1009] shadow-xs"
                      : "bg-card border border-[#E5DFD7] text-[#736B66] hover:text-foreground"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* 3-Column Template Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
            {INVITATION_TEMPLATES.filter((tpl) =>
              invitationFilter === "All Template"
                ? true
                : tpl.category === invitationFilter,
            ).map((tpl) => (
              <div
                key={tpl.id}
                className={`rounded-3xl border bg-card p-5 space-y-4 shadow-2xs flex flex-col justify-between ${
                  selectedTemplateId === tpl.id
                    ? "border-[#6E3B1C] ring-2 ring-[#6E3B1C]/20"
                    : "border-[#EBE3D9] dark:border-border"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-bold text-sm md:text-base text-[#1F140E] dark:text-foreground">
                    {tpl.name}
                  </h3>
                  <span className="text-[11px] font-medium px-3 py-0.5 rounded-full bg-[#E8F0EC] text-[#2D5A46]">
                    {tpl.tag}
                  </span>
                </div>

                {/* Floral / Formal Card Canvas */}
                <div className="relative rounded-2xl bg-[#FFFDF9] dark:bg-[#1C140E] border border-[#E8DFC8] p-5 shadow-xs flex flex-col items-center justify-between text-center overflow-hidden min-h-[300px]">
                  <div className="w-full h-full border border-[#C5A880]/70 rounded-xl p-3 flex flex-col items-center justify-between bg-white/60 dark:bg-black/20">
                    <div className="space-y-1 pt-1">
                      <p className="font-serif text-[10px] uppercase tracking-widest text-[#7C6651]">
                        Join Us For
                      </p>
                      <p className="font-serif italic font-bold text-base text-[#2E1F14] dark:text-[#F7EFE6]">
                        Robert &amp; Marie
                      </p>
                      <p className="font-serif text-xs font-semibold text-[#B5996B] tracking-wider">
                        14 / 04 / 22
                      </p>
                      <p className="font-serif text-[10px] font-medium text-[#4A3B2C] dark:text-muted-foreground leading-snug">
                        ST. Peter&apos;s Church, Agra, India
                      </p>
                    </div>

                    {/* Rose Floral SVG Cluster */}
                    <div className="relative w-full h-14 mt-2 flex items-center justify-center">
                      <svg
                        viewBox="0 0 200 65"
                        className="w-full h-full"
                        fill="none"
                      >
                        <circle cx="100" cy="38" r="18" fill="#D84E20" />
                        <circle
                          cx="64"
                          cy="42"
                          r="14"
                          fill="#FBF3E8"
                          stroke="#E5D5C0"
                        />
                        <circle
                          cx="136"
                          cy="42"
                          r="14"
                          fill="#FBF3E8"
                          stroke="#E5D5C0"
                        />
                        <circle cx="78" cy="48" r="8" fill="#E56534" />
                        <circle cx="122" cy="48" r="8" fill="#E56534" />
                        <path
                          d="M35 48 C22 36 12 42 2 45 C15 52 30 55 42 50 Z"
                          fill="#4A7C59"
                        />
                        <path
                          d="M165 48 C178 36 188 42 198 45 C185 52 170 55 158 50 Z"
                          fill="#4A7C59"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => setPreviewTemplate(tpl)}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview</span>
                  </button>

                  <Button
                    type="button"
                    onClick={() => {
                      invitationForm.setValue("selectedTemplateId", tpl.id, {
                        shouldValidate: true,
                      });
                      openCustomize();
                    }}
                    className="bg-[#1A1009] hover:bg-[#332218] text-white text-xs px-4 h-9 rounded-xl font-semibold shadow-xs"
                  >
                    Use Template
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setActiveStep("guests")}
              className="text-xs rounded-xl"
            >
              ← Back to Guests
            </Button>
            <Button
              type="button"
              onClick={() => void continueInvitation()}
              className="text-xs bg-[#6E3B1C] hover:bg-[#5C3117] text-white rounded-xl px-6"
            >
              Proceed to Experience →
            </Button>
          </div>
        </div>
      )}

      {activeStep === "experience" && (
        <ExperienceStep
          form={experienceForm}
          disabled={isProcessingPayment || isCreatingEvent}
          continueLabel={
            isProcessingPayment
              ? "Creating event…"
              : planPaid
                ? "Create Event"
                : "Continue to Plans →"
          }
          onContinue={() => void continueExperience()}
        />
      )}

      {activeStep === "payment" && !planPaid && (
        <PlanPaymentFlow
          notice={
            eventName
              ? `${eventName} will begin promptly at ${formatInviteTime(startTime) || "the scheduled time"}.`
              : undefined
          }
          redirectPath="/organizer/individual/events/create?step=payment"
          onBack={() => setActiveStep("experience")}
          onPaid={async () => {
            setIsProcessingPayment(true);
            try {
              await createEventFromWizard();
            } finally {
              setIsProcessingPayment(false);
            }
          }}
        />
      )}

      {/* MODAL 1: TEMPLATE PREVIEW PHONE MODAL matching media_1791786591403_9b130538.png */}
      <Dialog
        open={!!previewTemplate}
        onOpenChange={() => setPreviewTemplate(null)}
      >
        <DialogContent className="sm:max-w-xl rounded-3xl p-6 space-y-4 max-h-[92vh] overflow-y-auto">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <DialogTitle className="font-serif font-bold text-lg text-foreground">
                {previewTemplate?.name || "Heritage Elegance"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Traditional - Wedding &amp; Gala
              </DialogDescription>
            </div>
            <Button
              onClick={() => {
                setPreviewTemplate(null);
                openCustomize();
              }}
              className="bg-[#6E3B1C] hover:bg-[#5C3117] text-white text-xs h-9 rounded-xl px-4"
            >
              Use This Template
            </Button>
          </div>

          {/* Mobile WhatsApp Mockup */}
          <div className="w-full max-w-sm mx-auto rounded-3xl border-4 border-stone-800 bg-[#EFEAE2] overflow-hidden shadow-2xl">
            {/* WhatsApp Header */}
            <div className="bg-[#075E54] text-white p-3 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[#E8DFC8] text-[#1F140E] flex items-center justify-center text-xs font-bold">
                M
              </div>
              <div className="flex-1 text-left">
                <p className="text-xs font-bold leading-tight">McEniesVite</p>
                <p className="text-[10px] text-white/70">
                  VIP Wedding Assistant
                </p>
              </div>
            </div>

            {/* Chat Body */}
            <div className="p-3 space-y-3 min-h-[360px] bg-[radial-gradient(#d1c7b7_1px,transparent_1px)] [background-size:16px_16px]">
              <div className="p-2 rounded-xl bg-white/90 text-center text-[10px] text-[#6E3B1C] border border-[#E8DACB]">
                Messages are end-to-end encrypted and powered by McEniesVite
                Concierge.
              </div>

              {/* Message Bubble Card */}
              <div className="bg-white rounded-2xl p-3 shadow-xs space-y-2 border border-stone-200">
                <div className="relative rounded-xl border border-[#C5A880] p-3 text-center bg-[#FFFDF9]">
                  <p className="font-serif text-[10px] uppercase tracking-wider text-[#7C6651]">
                    The Wedding Of
                  </p>
                  <p className="font-serif italic font-bold text-sm text-[#2E1F14]">
                    Robert &amp; Marie
                  </p>
                  <p className="font-serif text-[10px] text-[#B5996B]">
                    14/04/22
                  </p>
                  <p className="text-[9px] text-stone-500">
                    ST. Peter&apos;s Church
                  </p>
                </div>

                <div className="text-[11px] space-y-1 text-foreground">
                  <p className="font-bold text-[#6E3B1C]">
                    Distinguished Chief Adeleke Adebayo
                  </p>
                  <p className="text-muted-foreground leading-tight">
                    You are cordially invited to *The Grand Royal Gala &amp;
                    Investiture*.
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    📅 Date &amp; Time: Saturday, 12th December 2026 at 4:00 PM
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    📌 Venue: The Monarch Event Centre
                  </p>
                </div>
                <div className="text-right text-[9px] text-stone-400">
                  10:00 AM
                </div>
              </div>
            </div>

            {/* Chat Bar */}
            <div className="p-2 bg-[#F0F0F0] border-t flex items-center gap-2">
              <input
                disabled
                placeholder="Type reply..."
                className="flex-1 h-8 px-3 rounded-full bg-white text-xs text-stone-600 border"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
            <span>
              ⓘ This shows exactly how your guests receive the interactive
              message on WhatsApp.
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPreviewTemplate(null)}
              className="text-xs"
            >
              Close Preview
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL 2: CUSTOMIZE INVITATION DETAILS matching media_1791786591277_406037a8.png */}
      <Dialog
        open={isCustomizeModalOpen}
        onOpenChange={setIsCustomizeModalOpen}
      >
        <DialogContent className="sm:max-w-4xl rounded-3xl p-6 md:p-8 space-y-4 max-h-[92vh] overflow-y-auto">
          <div className="flex items-center justify-between border-b pb-3">
            <DialogTitle className="font-serif font-bold text-xl text-foreground">
              Customize Invitation Details
            </DialogTitle>
            <button
              onClick={() => setIsCustomizeModalOpen(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start pt-2">
            {/* Left: Mobile Phone Preview */}
            <div className="md:col-span-5 w-full max-w-sm mx-auto rounded-3xl border-4 border-stone-800 bg-[#EFEAE2] overflow-hidden shadow-2xl">
              <div className="bg-[#075E54] text-white p-3 flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-[#E8DFC8] text-[#1F140E] flex items-center justify-center text-xs font-bold">
                  M
                </div>
                <div className="flex-1 text-left">
                  <p className="text-xs font-bold leading-tight">McEniesVite</p>
                  <p className="text-[10px] text-white/70">
                    VIP Wedding Assistant
                  </p>
                </div>
              </div>

              <div className="p-3 space-y-3 min-h-[380px] bg-[radial-gradient(#d1c7b7_1px,transparent_1px)] [background-size:16px_16px]">
                <div className="p-2 rounded-xl bg-white/90 text-center text-[10px] text-[#6E3B1C] border border-[#E8DACB]">
                  Messages are end-to-end encrypted and powered by McEniesVite
                  Concierge.
                </div>

                <div className="bg-white rounded-2xl p-3 shadow-xs space-y-2 border border-stone-200">
                  <div className="relative rounded-xl border border-[#C5A880] p-3 text-center bg-[#FFFDF9]">
                    <p className="font-serif text-[10px] uppercase tracking-wider text-[#7C6651]">
                      {customSubHeader || "Royal Investiture & Gala"}
                    </p>
                    <p className="font-serif italic font-bold text-sm text-[#2E1F14]">
                      {customTitle || "Event Title"}
                    </p>
                  </div>

                  <div className="text-[11px] space-y-1 text-foreground">
                    <p className="font-bold text-[#6E3B1C]">
                      Distinguished Chief Adeleke Adebayo
                    </p>
                    <p className="text-muted-foreground leading-tight">
                      You are cordially invited to *{customTitle}*.
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      📅 Date &amp; Time: {customDate} at {customTime}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      📌 Venue: {customVenue}
                    </p>
                    <p className="text-[10px] text-muted-foreground italic pt-1">
                      {customMessage}
                    </p>
                  </div>
                  <div className="text-right text-[9px] text-stone-400">
                    10:00 AM
                  </div>
                </div>
              </div>

              <div className="p-2 bg-[#F0F0F0] border-t flex items-center gap-2">
                <input
                  disabled
                  placeholder="Type reply..."
                  className="flex-1 h-8 px-3 rounded-full bg-white text-xs text-stone-600 border"
                />
              </div>
            </div>

            {/* Right: Customization Inputs */}
            <div className="md:col-span-7 space-y-4">
              <div className="p-4 rounded-2xl bg-[#FCEDE6] border border-[#F5D5C6] space-y-1">
                <p className="font-bold text-xs text-[#6E3B1C]">
                  Live Personalization Engine
                </p>
                <p className="text-[11px] text-[#6E3B1C]/80">
                  Modify the fields below to see real-time updates on your
                  template card.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Event name</Label>
                <Input
                  className="h-10 text-xs rounded-xl"
                  {...invitationForm.register("customTitle")}
                />
                {fieldError(
                  invitationForm.formState.errors.customTitle?.message,
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">
                  Sub Header (Optional)
                </Label>
                <Input
                  className="h-10 text-xs rounded-xl"
                  {...invitationForm.register("customSubHeader")}
                />
                {fieldError(
                  invitationForm.formState.errors.customSubHeader?.message,
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Event Date*</Label>
                  <Input
                    className="h-10 text-xs rounded-xl"
                    {...invitationForm.register("customDate")}
                  />
                  {fieldError(
                    invitationForm.formState.errors.customDate?.message,
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Start Time*</Label>
                  <Input
                    className="h-10 text-xs rounded-xl"
                    {...invitationForm.register("customTime")}
                  />
                  {fieldError(
                    invitationForm.formState.errors.customTime?.message,
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">
                  Venue / Location *
                </Label>
                <Input
                  className="h-10 text-xs rounded-xl"
                  {...invitationForm.register("customVenue")}
                />
                {fieldError(
                  invitationForm.formState.errors.customVenue?.message,
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">
                  Invitation Message*
                </Label>
                <textarea
                  rows={3}
                  className="w-full p-3 rounded-xl text-xs border border-input bg-card text-foreground resize-none"
                  {...invitationForm.register("customMessage")}
                />
                {fieldError(
                  invitationForm.formState.errors.customMessage?.message,
                )}
              </div>

              <div className="pt-3 flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={() => setIsCustomizeModalOpen(false)}
                  className="text-xs rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={() => void continueInvitation()}
                  className="text-xs bg-[#6E3B1C] hover:bg-[#5C3117] text-white rounded-xl px-6"
                >
                  Save &amp; Continue →
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL 4: YOUR EVENT IS READY SUCCESS MODAL matching uploaded_media_2_1791786558314.png */}
      <Dialog open={isReadySuccessOpen} onOpenChange={setIsReadySuccessOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl p-8 text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-[#2D5A46] text-white mx-auto flex items-center justify-center text-2xl shadow-md">
            ✓
          </div>

          <div className="space-y-2">
            <h2 className="font-serif font-bold text-2xl text-foreground flex items-center justify-center gap-2">
              <span>Your Event Is Ready</span>
              <span>🎉</span>
            </h2>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
              &quot;{finishedTitle}&quot; has been created successfully. You are
              now ready to start inviting guests.
            </p>
          </div>

          <div className="pt-4">
            <Button
              type="button"
              onClick={() => {
                const eventId = finishedEventRef.current || finishedEventId;
                setIsReadySuccessOpen(false);
                router.push(eventsPath("individual", eventId ?? undefined));
              }}
              variant="outline"
              className="w-full h-11 text-xs font-bold rounded-full border-foreground text-foreground hover:bg-muted"
            >
              Go to Event Dashboard
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
