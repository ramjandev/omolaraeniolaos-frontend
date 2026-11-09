"use client";

import {
  BankTransferModal,
  CardPaymentModal,
  Logo,
  Modal,
  Radio,
  SuccessBody,
  formatTime,
  inputClass,
  naira,
} from "@/components/auth/onboarding";
import CommonSelect from "@/components/common/CommonSelect";
import { CommonHeader } from "@/components/shared/CommonHeader";
import { SignupPlanGrid } from "@/components/plans/SignupPlanGrid";
import { useGetPlansQuery } from "@/store/Plan/planApi";
import { ArrowRight, CalendarDays, Clock, CreditCard } from "lucide-react";
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
import CommonButton from "../common/CommonButton";

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
  const [skipEvent, setSkipEvent] = React.useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
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

    const currentEvent = eventData;
    const hasEvent = !skipEvent && Boolean(currentEvent?.eventName?.trim());

    const payload: RegisterIndividualPayload = {
      fullName: accountData.fullName,
      email: accountData.email,
      phone: `${accountData.countryCode}${accountData.phoneNumber}`,
      password: accountData.password,
      confirmPassword: accountData.confirmPassword || accountData.password,
      skipEvent: !hasEvent,
      ...(hasEvent && currentEvent
        ? {
            eventName: currentEvent.eventName.trim(),
            eventType: currentEvent.eventType || undefined,
            eventDate: currentEvent.eventDate || undefined,
            startTime: currentEvent.startTime || undefined,
            endTime: currentEvent.endTime || undefined,
            venueLocation: currentEvent.venueLocation || undefined,
            expectedGuests: currentEvent.expectedGuests
              ? Number(currentEvent.expectedGuests)
              : undefined,
          }
        : {}),
      planId: plan?.id,
      skipPayment: options?.skipPayment ?? false,
      paymentMethod:
        options?.paymentMethod ??
        (method === "card" ? "CARD" : "BANK_TRANSFER"),
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
      toast.success(
        hasEvent
          ? "Account and event setup completed successfully!"
          : "Account created successfully! You can create an event anytime from your dashboard.",
      );
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
    setSkipEvent(false);
    setEventData(data);
    setStep("plan");
  };

  const handleSkipEvent = () => {
    setSkipEvent(true);
    setEventData(null);
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
        {step === "event" && (
          <section className="mx-auto w-full max-w-[630px] rounded-[32px] border border-[#EEE9E0] bg-[#FDFCFA] p-6 sm:p-10">
            <CommonHeader
              variant="section"
              as="h1"
              title="Let's Set Up Your Event"
              subtitle="Start with the basics — or skip and create your event later from the dashboard."
            />

            <form
              className="mt-8 space-y-5"
              onSubmit={handleSubmit(onEventStepSubmit)}
            >
              <div>
                <label htmlFor="eventName" className={inputClass.label}>
                  Event Name <span aria-hidden="true">*</span>
                </label>
                <input
                  id="eventName"
                  {...register("eventName")}
                  placeholder="Enter your event name"
                  className={`${inputClass.input} `}
                />
                {errors.eventName && (
                  <p className={inputClass.error}>{errors.eventName.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="eventType" className={inputClass.label}>
                  Event Type <span aria-hidden="true">*</span>
                </label>
                <CommonSelect
                  id="eventType"
                  value={eventType || undefined}
                  placeholder="Select Option"
                  item={EVENT_TYPES.map((type) => ({
                    label: type,
                    value: type,
                  }))}
                  onValueChange={(value) =>
                    setValue("eventType", value, {
                      shouldValidate: true,
                      shouldDirty: true,
                    })
                  }
                />
                {errors.eventType && (
                  <p className={inputClass.error}>{errors.eventType.message}</p>
                )}
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="eventDate" className={inputClass.label}>
                    Event Date <span aria-hidden="true">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="eventDate"
                      type="date"
                      {...register("eventDate")}
                      className={inputClass.date}
                    />
                    <CalendarDays
                      className="pointer-events-none absolute right-3.5 top-1/2 h-5 w-5 -translate-y-1/2"
                      strokeWidth={1.6}
                    />
                  </div>
                  {errors.eventDate && (
                    <p className={inputClass.error}>
                      {errors.eventDate.message}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="guests" className={inputClass.label}>
                    Expected Guests
                  </label>
                  <input
                    id="guests"
                    type="number"
                    min={1}
                    inputMode="numeric"
                    {...register("expectedGuests")}
                    className={inputClass.input}
                    placeholder="e.g. 150"
                  />
                </div>
                <div>
                  <label htmlFor="startTime" className={inputClass.label}>
                    Start Time <span aria-hidden="true">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="startTime"
                      type="time"
                      {...register("startTime")}
                      className={inputClass.time}
                    />
                    <Clock
                      className="pointer-events-none absolute right-3.5 top-1/2 h-5 w-5 -translate-y-1/2"
                      strokeWidth={1.6}
                    />
                  </div>
                  {errors.startTime && (
                    <p className={inputClass.error}>
                      {errors.startTime.message}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="endTime" className={inputClass.label}>
                    End Time (Optional)
                  </label>
                  <div className="relative">
                    <input
                      id="endTime"
                      type="time"
                      {...register("endTime")}
                      className={inputClass.time}
                    />
                    <Clock
                      className="pointer-events-none absolute right-3.5 top-1/2 h-5 w-5 -translate-y-1/2"
                      strokeWidth={1.6}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="venueLocation" className={inputClass.label}>
                  Venue / Location <span aria-hidden="true">*</span>
                </label>
                <input
                  id="venueLocation"
                  {...register("venueLocation")}
                  placeholder="Enter venue or hall address"
                  className={`${inputClass.input} `}
                />
                {errors.venueLocation && (
                  <p className={inputClass.error}>
                    {errors.venueLocation.message}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between gap-3 pt-4">
                {onBack ? (
                  <CommonButton onClick={onBack} variant="outline" showLeftIcon>
                    Back
                  </CommonButton>
                ) : (
                  <span />
                )}
                <div className="flex items-center gap-3">
                  <CommonButton onClick={handleSkipEvent} variant="outline">
                    Skip for now
                  </CommonButton>

                  <CommonButton type="submit" showDefaultIcon>
                    Continue
                  </CommonButton>
                </div>
              </div>
            </form>
          </section>
        )}

        {step === "plan" && (
          <section className="mx-auto w-full max-w-[930px] rounded-[32px] border border-[#EEE9E0] bg-[#FDFCFA] p-6 sm:p-8">
            <CommonHeader
              variant="section"
              as="h1"
              title="Tailored Single-Event Package Pricing"
              subtitle="Whether you're starting small or scaling fast, we have an automation plan that fits."
            />

            <SignupPlanGrid
              className="mt-10"
              plans={plans}
              isLoading={plansLoading}
              isError={plansError}
              onRetry={refetchPlans}
              selectedId={planId}
              onSelect={(p) => setPlanId(p.id)}
            />

            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-[#EAE4DA] pt-5">
              <CommonButton
                onClick={() => setStep("event")}
                variant="outline"
                showLeftIcon
              >
                Back
              </CommonButton>
              <div className="flex flex-wrap items-center gap-3">
                <CommonButton
                  disabled={busy || isRegistering}
                  onClick={handleSkipToDashboard}
                  variant="outline"
                >
                  Continue without a plan
                </CommonButton>
                {!noPlansAvailable && (
                  <CommonButton
                    disabled={!plan}
                    onClick={() => setStep("checkout")}
                    showDefaultIcon
                  >
                    Continue
                  </CommonButton>
                )}
              </div>
            </div>
          </section>
        )}

        {step === "checkout" && (
          <section className="mx-auto w-full max-w-[930px] rounded-[32px] border border-[#EEE9E0] bg-[#FDFCFA] p-6 sm:p-8">
            <CommonHeader
              variant="section"
              as="h1"
              title="Complete Your Setup"
              subtitle="Select a package to activate your event and start inviting."
            />

            <div className="mt-10 grid gap-5 md:grid-cols-[0.85fr_1.15fr]">
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

                <CommonButton
                  disabled={busy}
                  onClick={() =>
                    method === "card" ? setModal("card") : createEvent()
                  }
                  className="mt-5 w-full!"
                  variant="black"
                  size="lg"
                >
                  {busy
                    ? skipEvent
                      ? "Creating account..."
                      : "Creating event..."
                    : skipEvent
                      ? `Pay ${naira(total)} & Continue`
                      : `Pay ${naira(total)} & Create Event`}
                </CommonButton>
              </div>
            </div>

            <div className="mt-8 border-t border-[#EAE4DA] pt-5">
              <CommonButton
                variant="outline"
                showLeftIcon
                onClick={() => setStep("plan")}
              >
                Back
              </CommonButton>
            </div>
          </section>
        )}
      </main>

      {modal === "created" && (
        <Modal label={skipEvent ? "Account ready" : "Event created"}>
          <SuccessBody
            title={
              skipEvent ? "Your Account Is Ready 🎉" : "Your Event Is Ready 🎉"
            }
            message={
              skipEvent
                ? "Your account has been created successfully. You can set up an event anytime from your dashboard."
                : `“${eventName}” has been created successfully. You are now ready to start inviting guests.`
            }
          />
          <div className="mt-8">
            <CommonButton type="button" variant="outline" size="lg" fullWidth onClick={goDashboard}>
              {skipEvent ? "Go to Dashboard" : "Go to Event Dashboard"}
            </CommonButton>
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
        <Modal label={skipEvent ? "Account activated" : "Event activated"}>
          <SuccessBody
            title={skipEvent ? "You Are All Set 🎉" : "Your Event Is Ready 🎉"}
            message={
              skipEvent
                ? "Your account is ready. Create your first event whenever you are."
                : `“${eventName}” has been created and activated. You are now ready to start inviting guests.`
            }
          />
          <CommonButton type="button" size="lg" fullWidth className="mt-8" onClick={goDashboard}>
            {skipEvent ? "Go to Dashboard" : "Go to Event Dashboard"}
          </CommonButton>
        </Modal>
      )}
    </div>
  );
}
