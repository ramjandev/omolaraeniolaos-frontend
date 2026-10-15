"use client";

import {
  BankTransferModal,
  CardPaymentModal,
  Logo,
  Modal,
  Radio,
  SuccessBody,
  brownButton,
  darkButton,
  fieldClass,
  formatTime,
  labelClass,
  naira,
  outlineButton,
  pickerInput,
  titleClass,
} from "@/components/auth/onboarding-ui";
import { SignupPlanGrid } from "@/components/plans/SignupPlanGrid";
import { useGetPlansQuery } from "@/store/Plan/planApi";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  ChevronDown,
  Clock,
  CreditCard,
} from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  individualEventSetupSchema,
  IndividualEventSetupFormData,
  IndividualAccountDetailsFormData,
} from "@/lib/validations/authSchemas";
import { useRegisterIndividualMutation } from "@/store/Auth/authApi";
import { useAppDispatch } from "@/store/store";
import { setCredentials } from "@/store/Auth/authSlice";
import { RegisterIndividualPayload } from "@/store/Auth/types/authTypes";
import { toast } from "react-toastify";

/* ───────────────────────── Config ───────────────────────── */

const DASHBOARD_URL = "/organizer/individual";

const EVENT_TYPES = [
  "Wedding",
  "Birthday",
  "Anniversary",
  "Baby Shower",
  "Graduation",
  "Corporate Event",
  "Conference",
  "Other",
];

/* ───────────────────────── Main component ───────────────────────── */

type Step = "event" | "plan" | "checkout";
type ModalState = null | "created" | "card" | "bank" | "activated";

export interface IndividualOnboardingProps {
  onBack?: () => void;
  accountData?: IndividualAccountDetailsFormData;
}

export function IndividualOnboarding({
  onBack,
  accountData,
}: IndividualOnboardingProps = {}) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [registerIndividual, { isLoading: isRegistering }] =
    useRegisterIndividualMutation();

  const [step, setStep] = React.useState<Step>("event");
  const [eventData, setEventData] =
    React.useState<IndividualEventSetupFormData | null>(null);

  // Form setup with Zod & React Hook Form
  const {
    register,
    handleSubmit,
    watch,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<IndividualEventSetupFormData>({
    resolver: zodResolver(individualEventSetupSchema),
    defaultValues: {
      eventName: "",
      eventType: "",
      eventDate: "",
      expectedGuests: "",
      startTime: "",
      endTime: "",
      venueLocation: "",
    },
  });

  const eventName = watch("eventName");
  const eventType = watch("eventType");
  const startTime = watch("startTime");

  // Plan + payment
  const {
    data: plansResponse,
    isLoading: plansLoading,
    isError: plansError,
    refetch: refetchPlans,
  } = useGetPlansQuery("Individual");
  const plans = plansResponse?.data ?? [];
  const [planId, setPlanId] = React.useState<string | null>(null);
  const [method, setMethod] = React.useState<"card" | "bank">("card");
  const [modal, setModal] = React.useState<ModalState>(null);
  const [busy, setBusy] = React.useState(false);

  const plan = plans.find((p) => p.id === planId) ?? null;
  const total = plan?.price ?? 0;
  const noPlansAvailable = !plansLoading && !plansError && plans.length === 0;

  const goDashboard = () => router.push(DASHBOARD_URL);

  const performRegistration = async (options?: {
    skipPayment?: boolean;
    paymentMethod?: string;
  }) => {
    if (!accountData?.email || !accountData?.password) {
      toast.error("Please complete your account details before continuing.");
      return false;
    }

    const currentEvent = eventData || getValues();
    const payload: RegisterIndividualPayload = {
      fullName: accountData.fullName,
      email: accountData.email,
      phone: `${accountData.countryCode}${accountData.phoneNumber}`,
      password: accountData.password,
      confirmPassword: accountData.confirmPassword || accountData.password,
      eventName: currentEvent.eventName || "Grand Event",
      eventType: currentEvent.eventType || "Wedding",
      eventDate: currentEvent.eventDate || new Date().toISOString().split("T")[0],
      startTime: currentEvent.startTime || "10:00",
      endTime: currentEvent.endTime || undefined,
      venueLocation: currentEvent.venueLocation || "Lagos, Nigeria",
      expectedGuests: currentEvent.expectedGuests
        ? Number(currentEvent.expectedGuests)
        : 150,
      planId: plan?.id,
      skipPayment: options?.skipPayment ?? false,
      paymentMethod:
        options?.paymentMethod ?? (method === "card" ? "CARD" : "BANK_TRANSFER"),
    };

    try {
      const res = await registerIndividual(payload).unwrap();
      const token = res.data.accessToken;
      const user = res.data.user;
      if (token) {
        dispatch(
          setCredentials({
            user,
            accessToken: token,
            refreshToken: res.data.refreshToken,
          }),
        );
      }
      toast.success("Account and event setup completed successfully!");
      return true;
    } catch (error: unknown) {
      const errMsg =
        typeof error === "object" &&
        error !== null &&
        "data" in error &&
        typeof error.data === "object" &&
        error.data !== null &&
        "message" in error.data &&
        typeof error.data.message === "string"
          ? error.data.message
          : "We could not complete registration. Please try again.";
      toast.error(errMsg);
      return false;
    }
  };

  const onEventStepSubmit = (data: IndividualEventSetupFormData) => {
    setEventData(data);
    setStep("plan");
  };

  const handleSkipToDashboard = async () => {
    setBusy(true);
    const completed = await performRegistration({ skipPayment: true });
    setBusy(false);
    if (completed) goDashboard();
  };

  const createEvent = async () => {
    setBusy(true);
    const completed = await performRegistration({
      paymentMethod: "BANK_TRANSFER",
    });
    setBusy(false);
    if (completed) setModal("created");
  };

  const payByCard = async () => {
    setBusy(true);
    const completed = await performRegistration({ paymentMethod: "CARD" });
    setBusy(false);
    if (completed) setModal("activated");
  };

  return (
    <div className="min-h-screen w-full bg-[#FBFAF6] text-[#1F140E] antialiased">
      {/* Header */}
      <header className="flex items-start justify-between px-6 pt-8 sm:px-10 lg:px-20">
        <Logo />
        {step !== "event" && (
          <button
            type="button"
            onClick={handleSkipToDashboard}
            disabled={busy || isRegistering}
            className="mt-6 inline-flex items-center gap-1.5 text-[17px] text-[#7A3B18] underline underline-offset-4 hover:text-[#4A240E] cursor-pointer disabled:opacity-50"
          >
            Skip to Dashboard <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </header>

      <main className="px-4 pb-16 pt-8 sm:pt-12">
        {/* ───── Step 1: event basics ───── */}
        {step === "event" && (
          <section className="mx-auto w-full max-w-[630px] rounded-[32px] border border-[#EEE9E0] bg-[#FDFCFA] p-6 sm:p-10">
            <h1 className={titleClass}>Let&apos;s Set Up Your Event</h1>
            <p className="mt-1 text-[17px] text-[#6B625B]">
              Start with the basics. You can add more details later.
            </p>

            <form
              className="mt-8 space-y-5"
              onSubmit={handleSubmit(onEventStepSubmit)}
            >
              <div>
                <label htmlFor="eventName" className={labelClass}>
                  Event Name <span aria-hidden="true">*</span>
                </label>
                <input
                  id="eventName"
                  {...register("eventName")}
                  placeholder="Enter your event name"
                  className={`${fieldClass} ${errors.eventName ? "border-red-500 focus:border-red-500" : ""}`}
                />
                {errors.eventName && (
                  <p className="mt-1 text-xs text-red-600 font-medium">
                    {errors.eventName.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="eventType" className={labelClass}>
                  Event Type <span aria-hidden="true">*</span>
                </label>
                <div className="relative">
                  <select
                    id="eventType"
                    {...register("eventType")}
                    className={`${fieldClass} appearance-none pr-11 cursor-pointer ${
                      eventType ? "" : "text-[#6B625B]"
                    } ${errors.eventType ? "border-red-500 focus:border-red-500" : ""}`}
                  >
                    <option value="" disabled>
                      Select Option
                    </option>
                    {EVENT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="pointer-events-none absolute right-3.5 top-1/2 h-5 w-5 -translate-y-1/2"
                    strokeWidth={1.6}
                  />
                </div>
                {errors.eventType && (
                  <p className="mt-1 text-xs text-red-600 font-medium">
                    {errors.eventType.message}
                  </p>
                )}
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="eventDate" className={labelClass}>
                    Event Date <span aria-hidden="true">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="eventDate"
                      type="date"
                      {...register("eventDate")}
                      className={`${pickerInput} ${errors.eventDate ? "border-red-500 focus:border-red-500" : ""}`}
                    />
                    <CalendarDays
                      className="pointer-events-none absolute right-3.5 top-1/2 h-5 w-5 -translate-y-1/2"
                      strokeWidth={1.6}
                    />
                  </div>
                  {errors.eventDate && (
                    <p className="mt-1 text-xs text-red-600 font-medium">
                      {errors.eventDate.message}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="guests" className={labelClass}>
                    Expected Guests
                  </label>
                  <input
                    id="guests"
                    type="number"
                    min={1}
                    inputMode="numeric"
                    {...register("expectedGuests")}
                    className={fieldClass}
                    placeholder="e.g. 150"
                  />
                </div>
                <div>
                  <label htmlFor="startTime" className={labelClass}>
                    Start Time <span aria-hidden="true">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="startTime"
                      type="time"
                      {...register("startTime")}
                      className={`${pickerInput} ${errors.startTime ? "border-red-500 focus:border-red-500" : ""}`}
                    />
                    <Clock
                      className="pointer-events-none absolute right-3.5 top-1/2 h-5 w-5 -translate-y-1/2"
                      strokeWidth={1.6}
                    />
                  </div>
                  {errors.startTime && (
                    <p className="mt-1 text-xs text-red-600 font-medium">
                      {errors.startTime.message}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="endTime" className={labelClass}>
                    End Time (Optional)
                  </label>
                  <div className="relative">
                    <input
                      id="endTime"
                      type="time"
                      {...register("endTime")}
                      className={pickerInput}
                    />
                    <Clock
                      className="pointer-events-none absolute right-3.5 top-1/2 h-5 w-5 -translate-y-1/2"
                      strokeWidth={1.6}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="venueLocation" className={labelClass}>
                  Venue / Location <span aria-hidden="true">*</span>
                </label>
                <input
                  id="venueLocation"
                  {...register("venueLocation")}
                  placeholder="Enter venue or hall address"
                  className={`${fieldClass} ${errors.venueLocation ? "border-red-500 focus:border-red-500" : ""}`}
                />
                {errors.venueLocation && (
                  <p className="mt-1 text-xs text-red-600 font-medium">
                    {errors.venueLocation.message}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-4">
                {onBack ? (
                  <button
                    type="button"
                    onClick={onBack}
                    className="inline-flex items-center gap-2 text-[17px] font-medium text-[#3A2C25] hover:text-[#7A3B18] transition-colors"
                  >
                    <ArrowLeft className="h-5 w-5" /> Back
                  </button>
                ) : <span />}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`${brownButton} h-[52px] px-9 text-[19px] group`}
                >
                  Continue{" "}
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </form>
          </section>
        )}

        {/* ───── Step 2: pricing ───── */}
        {step === "plan" && (
          <section className="mx-auto w-full max-w-[930px] rounded-[32px] border border-[#EEE9E0] bg-[#FDFCFA] p-6 sm:p-8">
            <h1 className={titleClass}>
              Tailored Single-Event Package Pricing
            </h1>
            <p className="mt-1 text-[17px] text-[#6B625B]">
              Whether you&apos;re starting small or scaling fast, we have an
              automation plan that fits.
            </p>

            <SignupPlanGrid
              className="mt-10"
              plans={plans}
              isLoading={plansLoading}
              isError={plansError}
              onRetry={refetchPlans}
              selectedId={planId}
              onSelect={(p) => setPlanId(p.id)}
            />

            <div className="mt-8 flex items-center justify-between border-t border-[#EAE4DA] pt-5">
              <button
                type="button"
                onClick={() => setStep("event")}
                className={`${outlineButton} h-[46px] px-5 text-[16px]`}
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              {noPlansAvailable ? (
                <button
                  type="button"
                  disabled={busy || isRegistering}
                  onClick={handleSkipToDashboard}
                  className={`${brownButton} h-[46px] px-6 text-[16px]`}
                >
                  Continue without a plan <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={!plan}
                  onClick={() => setStep("checkout")}
                  className={`${brownButton} h-[46px] px-6 text-[16px]`}
                >
                  Continue <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </section>
        )}

        {/* ───── Step 3: checkout ───── */}
        {step === "checkout" && (
          <section className="mx-auto w-full max-w-[930px] rounded-[32px] border border-[#EEE9E0] bg-[#FDFCFA] p-6 sm:p-8">
            <h1 className={titleClass}>Complete Your Setup</h1>
            <p className="mt-1 text-[17px] text-[#6B625B]">
              Select a package to activate your event and start inviting.
            </p>

            <div className="mt-10 grid gap-5 md:grid-cols-[0.85fr_1.15fr]">
              {/* Left column */}
              <div className="space-y-4">
                <div className="rounded-2xl border border-[#EAE4DA] bg-white p-5">
                  <h2 className="border-b border-[#EFEAE2] pb-3 text-[22px] font-medium text-[#4A3F3A]">
                    Order Summary
                  </h2>
                  <dl className="mt-3 space-y-3 border-b border-[#EFEAE2] pb-4 text-[15px]">
                    <div className="flex justify-between">
                      <dt className="text-[#3A2C25]">{plan?.planName}</dt>
                      <dd className="text-[#3A2C25]">{naira(total)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-[#6B625B]">Platform Fee</dt>
                      <dd className="text-[#3A2C25]">Included</dd>
                    </div>
                  </dl>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-[22px] text-[#4A3F3A]">Total</span>
                    <span className="text-[19px] font-semibold text-[#7A3B18]">
                      {naira(total)}
                    </span>
                  </div>
                </div>

                <p className="rounded-2xl border border-[#F3DDD0] bg-[#FCF1EA] px-5 py-4 text-center text-[15px] leading-6 text-[#A0644A]">
                  {eventName ? `“${eventName}”` : "Your event"} will begin
                  promptly at {formatTime(startTime) || "the scheduled time"}.
                </p>
              </div>

              {/* Right column */}
              <div className="rounded-2xl border border-[#EAE4DA] bg-white p-5">
                <h2 className="border-b border-[#EFEAE2] pb-3 text-[22px] font-medium text-[#4A3F3A]">
                  Payment Method
                </h2>

                <div
                  role="radiogroup"
                  aria-label="Payment method"
                  className="mt-4 space-y-3"
                >
                  <button
                    type="button"
                    role="radio"
                    aria-checked={method === "card"}
                    onClick={() => setMethod("card")}
                    className={`flex h-[54px] w-full items-center gap-3 rounded-2xl border px-4 text-left text-[17px] transition-all ${
                      method === "card"
                        ? "border-[#F0D9CB] bg-[#FCF1EA] font-medium text-[#3A2C25] shadow-[0_3px_8px_rgba(122,59,24,0.2)]"
                        : "border-[#E5E0D8] bg-white text-[#6B625B]"
                    }`}
                  >
                    <Radio checked={method === "card"} />
                    <span className="flex-1">Credit / Debit Card</span>
                    <CreditCard
                      className="h-6 w-6 text-[#8C7A6B]"
                      strokeWidth={1.5}
                    />
                  </button>

                  <button
                    type="button"
                    role="radio"
                    aria-checked={method === "bank"}
                    onClick={() => setMethod("bank")}
                    className={`flex h-[54px] w-full items-center gap-3 rounded-2xl border px-4 text-left text-[17px] transition-all ${
                      method === "bank"
                        ? "border-[#F0D9CB] bg-[#FCF1EA] font-medium text-[#3A2C25] shadow-[0_3px_8px_rgba(122,59,24,0.2)]"
                        : "border-[#E5E0D8] bg-white text-[#6B625B]"
                    }`}
                  >
                    <Radio checked={method === "bank"} />
                    <span className="flex-1">Bank Transfer</span>
                  </button>
                </div>

                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    method === "card" ? setModal("card") : createEvent()
                  }
                  className={`${darkButton} mt-5 h-[54px] w-full text-[18px]`}
                >
                  {busy
                    ? "Creating event..."
                    : `Pay ${naira(total)} & Create Event`}
                </button>
              </div>
            </div>

            <div className="mt-8 border-t border-[#EAE4DA] pt-5">
              <button
                type="button"
                onClick={() => setStep("plan")}
                className={`${outlineButton} h-[46px] px-5 text-[16px]`}
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
            </div>
          </section>
        )}
      </main>

      {/* ───── Modals ───── */}
      {modal === "created" && (
        <Modal label="Event created">
          <SuccessBody
            title="Your Event Is Ready 🎉"
            message={`“${eventName}” has been created successfully. You are now ready to start inviting guests.`}
          />
          <div className="mt-8 space-y-3">
            <button
              type="button"
              onClick={() => setModal("bank")}
              className={`${brownButton} h-[52px] w-full text-[18px]`}
            >
              Pay {naira(total)} &amp; Activate
            </button>
            <button
              type="button"
              onClick={goDashboard}
              className={`${outlineButton} h-[52px] w-full text-[18px]`}
            >
              Go to Event Dashboard
            </button>
          </div>
        </Modal>
      )}

      {modal === "card" && (
        <CardPaymentModal
          total={total}
          busy={busy}
          onClose={() => !busy && setModal(null)}
          onSubmit={payByCard}
        />
      )}

      {modal === "bank" && (
        <BankTransferModal
          total={total}
          onClose={() => setModal("created")}
          onDone={goDashboard}
        />
      )}

      {modal === "activated" && (
        <Modal label="Event activated">
          <SuccessBody
            title="Your Event Is Ready 🎉"
            message={`“${eventName}” has been created and activated. You are now ready to start inviting guests.`}
          />
          <button
            type="button"
            onClick={goDashboard}
            className={`${brownButton} mt-8 h-[52px] w-full text-[18px]`}
          >
            Go to Event Dashboard
          </button>
        </Modal>
      )}
    </div>
  );
}
