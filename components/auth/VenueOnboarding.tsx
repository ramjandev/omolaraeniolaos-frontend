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
  labelClass,
  naira,
  outlineButton,
  titleClass,
} from "@/components/auth/onboarding-ui";
import { SignupPlanGrid } from "@/components/plans/SignupPlanGrid";
import { useGetPlansQuery } from "@/store/Plan/planApi";
import {
  ANNUAL_DISCOUNT,
  planChargeTotal,
  registrationBillingCycle,
  supportsAnnualBilling,
} from "@/lib/planPricing";
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  CreditCard,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import type { IndividualAccountDetailsFormData } from "@/lib/validations/authSchemas";
import { useRegisterVenueMutation } from "@/store/Auth/authApi";
import { setCredentials } from "@/store/Auth/authSlice";
import { useAppDispatch } from "@/store/store";
import {
  getApiErrorMessage,
  RegisterVenuePayload,
} from "@/store/Auth/types/authTypes";
import { toast } from "react-toastify";

/* ───────────────────────── Config ───────────────────────── */

const DASHBOARD_URL = "/organizer/venue";

const BUSINESS_TYPES = [
  "Event Hall Operator",
  "Hotel & Hospitality Group",
  "Banquet & Conference Center",
  "Private Estate & Villa",
  "Boutique Event Space",
  "Multi-Venue Enterprise",
  "Other",
] as const;

const VENUE_TYPES = [
  "Ballroom",
  "Banquet Hall",
  "Conference Center",
  "Lawn & Garden",
  "Rooftop Terrace",
  "Auditorium",
  "Exhibition Center",
  "Private Villa",
] as const;

const SPACE_TYPES = [
  "Ballroom",
  "Main Hall",
  "VIP Lounge",
  "Garden / Terrace",
  "Meeting Room",
  "Banquet Suite",
  "Poolside",
  "Rooftop",
] as const;

const TEAM_ROLES = [
  "Event Planner",
  "Venue Manager",
  "Coordinator",
  "Front Desk",
  "Gate Staff",
] as const;
type TeamRole = (typeof TEAM_ROLES)[number];

const ROLE_PILL: Record<TeamRole, string> = {
  "Event Planner": "bg-[#E9F0FF] text-[#3B5BA9]",
  "Venue Manager": "bg-[#F1E7FA] text-[#6B3FA0]",
  Coordinator: "bg-[#FDF1D9] text-[#8A5A00]",
  "Front Desk": "bg-[#E2F7E6] text-[#246A38]",
  "Gate Staff": "bg-[#EDEDED] text-[#555555]",
};

interface SpaceItem {
  id: string;
  name: string;
  capacity: string;
  type: string;
  operatingHours: string;
}

interface TeamMember {
  email: string;
  role: TeamRole;
}

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

/* ───────────────────────── Small pieces ───────────────────────── */

function StepBadge({ n }: { n: number }) {
  return (
    <span className="inline-block rounded-xl bg-[#FCF1EA] px-3.5 py-1.5 text-[14px] font-semibold uppercase tracking-wider text-[#7A3B18]">
      Step {n} of 6
    </span>
  );
}

function StepFooter({
  onBack,
  children,
}: {
  onBack: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-8 flex items-center justify-between border-t border-[#EAE4DA] pt-5">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-[17px] font-medium text-[#3A2C25] hover:text-[#7A3B18] transition-colors"
      >
        <ArrowLeft className="h-5 w-5" /> Back
      </button>
      {children}
    </div>
  );
}

function ContinueButton({
  children = "Continue",
  type = "submit",
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      className={`${brownButton} h-[52px] px-7 text-[18px] group`}
      {...rest}
    >
      {children}{" "}
      <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
    </button>
  );
}

function Select({
  id,
  value,
  onChange,
  options,
  placeholder,
  required,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div className="relative">
      <select
        id={id}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${fieldClass} appearance-none pr-10 cursor-pointer ${value ? "" : "text-[#B3AAA1]"}`}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((o) => (
          <option key={o} value={o} className="text-[#1F140E]">
            {o}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8C7A6B]"
        strokeWidth={1.6}
      />
    </div>
  );
}

/* ───────────────────────── Main component ───────────────────────── */

type Step = "business" | "venue" | "spaces" | "team" | "plan" | "checkout";
type ModalState = null | "card" | "bank" | "created" | "activated";

export function VenueOnboarding({
  onBack,
  accountData,
}: {
  onBack?: () => void;
  accountData?: IndividualAccountDetailsFormData;
}) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [registerVenue, { isLoading: isRegistering }] = useRegisterVenueMutation();
  const [step, setStep] = React.useState<Step>("business");

  // Step 1: Business Information
  const [businessName, setBusinessName] = React.useState("Lumina Event Studio");
  const [logo, setLogo] = React.useState<string | null>(null);
  const [logoError, setLogoError] = React.useState<string | null>(null);
  const [businessType, setBusinessType] = React.useState("Event Hall Operator");
  const fileRef = React.useRef<HTMLInputElement>(null);

  // Step 2: Create First Venue
  const [venueName, setVenueName] = React.useState("");
  const [venueType, setVenueType] = React.useState("Ballroom");
  const [totalCapacity, setTotalCapacity] = React.useState("");
  const [venueAddress, setVenueAddress] = React.useState("");
  const [description, setDescription] = React.useState("");

  // Step 3: Add Spaces & Halls
  const [spaces, setSpaces] = React.useState<SpaceItem[]>([
    {
      id: "1",
      name: "",
      capacity: "",
      type: "Ballroom",
      operatingHours: "09:00-01:00",
    },
  ]);

  // Step 4: Build your team
  const [invites, setInvites] = React.useState<TeamMember[]>([
    { email: "alex@luminaevents.co", role: "Event Planner" },
    { email: "marcus@luminaevents.co", role: "Coordinator" },
  ]);
  const [inviteEmail, setInviteEmail] = React.useState("");
  const [inviteRole, setInviteRole] = React.useState<TeamRole>("Event Planner");
  const [inviteError, setInviteError] = React.useState<string | null>(null);

  // Step 5: Choose A Plan + Checkout
  const {
    data: plansResponse,
    isLoading: plansLoading,
    isError: plansError,
    refetch: refetchPlans,
  } = useGetPlansQuery("Venue");
  const plans = plansResponse?.data ?? [];
  const [planId, setPlanId] = React.useState<string | null>(null);
  const [annual, setAnnual] = React.useState(false);
  const [method, setMethod] = React.useState<"card" | "bank">("card");
  const [modal, setModal] = React.useState<ModalState>(null);
  const [busy, setBusy] = React.useState(false);

  const selectedPlan = plans.find((p) => p.id === planId) ?? null;
  const total = selectedPlan ? planChargeTotal(selectedPlan, annual) : 0;
  const annualAvailable = plans.some(supportsAnnualBilling);
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
    if (!businessName.trim() || !businessType) {
      toast.error("Please complete your venue business details before continuing.");
      return false;
    }

    const payload: RegisterVenuePayload = {
      fullName: accountData.fullName,
      email: accountData.email,
      phone: `${accountData.countryCode}${accountData.phoneNumber}`,
      password: accountData.password,
      confirmPassword: accountData.confirmPassword || accountData.password,
      businessName: businessName.trim(),
      businessType,
      venueName: venueName.trim() || undefined,
      venueType: venueType || undefined,
      capacity: totalCapacity ? Number(totalCapacity) : undefined,
      address: venueAddress.trim() || undefined,
      description: description.trim() || undefined,
      spaces: spaces
        .filter((space) => space.name.trim())
        .map((space) => ({
          name: space.name.trim(),
          capacity: space.capacity ? Number(space.capacity) : undefined,
          type: space.type || undefined,
          operatingHours: space.operatingHours || undefined,
        })),
      invitedMembers: invites.length ? invites : undefined,
      planId: selectedPlan?.id,
      billingCycle: selectedPlan ? registrationBillingCycle(selectedPlan, annual) : undefined,
      skipPayment: options?.skipPayment ?? false,
      paymentMethod:
        options?.paymentMethod ?? (method === "card" ? "CARD" : "BANK_TRANSFER"),
    };

    if (logo && /^https?:\/\//.test(logo)) {
      payload.logoUrl = logo;
    }

    try {
      const res = await registerVenue(payload).unwrap();
      const token = res.data.accessToken;
      if (token) {
        dispatch(
          setCredentials({
            user: res.data.user,
            accessToken: token,
            refreshToken: res.data.refreshToken,
          }),
        );
      }
      toast.success("Venue workspace created successfully!");
      return true;
    } catch (error: unknown) {
      toast.error(
        getApiErrorMessage(
          error,
          "We could not complete venue registration. Please try again.",
        ),
      );
      return false;
    }
  };

  /* Logo helpers */
  const onLogoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!/^image\/(png|jpe?g|svg\+xml)$/.test(file.type)) {
      setLogoError("Use a PNG, JPG or SVG file.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setLogoError("That file is over 2MB.");
      return;
    }
    setLogoError(null);
    const reader = new FileReader();
    reader.onload = () => setLogo(String(reader.result));
    reader.readAsDataURL(file);
  };

  const useSampleLogo = () => {
    const initials =
      businessName
        .trim()
        .split(/\s+/)
        .map((w) => w[0] ?? "")
        .join("")
        .replace(/[^A-Za-z0-9]/g, "")
        .slice(0, 2)
        .toUpperCase() || "LE";
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="400" height="400" rx="32" fill="#2A1A14"/><text x="50%" y="54%" font-family="Georgia,serif" font-size="160" font-style="italic" fill="#D9B77A" text-anchor="middle" dominant-baseline="middle">${initials}</text></svg>`;
    setLogoError(null);
    setLogo(`data:image/svg+xml;utf8,${encodeURIComponent(svg)}`);
  };

  /* Spaces helpers */
  const addSpace = () => {
    const nextId = String(Date.now());
    setSpaces((prev) => [
      ...prev,
      {
        id: nextId,
        name: "",
        capacity: "",
        type: "Ballroom",
        operatingHours: "09:00-01:00",
      },
    ]);
  };

  const removeSpace = (id: string) => {
    if (spaces.length <= 1) return;
    setSpaces((prev) => prev.filter((s) => s.id !== id));
  };

  const updateSpace = (id: string, patch: Partial<SpaceItem>) => {
    setSpaces((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    );
  };

  /* Team helpers */
  const addInvite = (e: React.FormEvent) => {
    e.preventDefault();
    const email = inviteEmail.trim().toLowerCase();
    if (!isEmail(email)) return setInviteError("Enter a valid email address.");
    if (invites.some((i) => i.email === email))
      return setInviteError("That person is already invited.");
    setInvites((list) => [...list, { email, role: inviteRole }]);
    setInviteEmail("");
    setInviteError(null);
  };

  const removeInvite = (email: string) => {
    setInvites((list) => list.filter((i) => i.email !== email));
  };

  /* Payment helpers */
  const handleSkipToDashboard = async () => {
    setBusy(true);
    const completed = await performRegistration({ skipPayment: true });
    setBusy(false);
    if (completed) goDashboard();
  };

  const createVenue = async () => {
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

  const showSkipToDashboard =
    step === "team" || step === "plan" || step === "checkout";

  const cardWidth =
    step === "plan"
      ? "max-w-[1240px]"
      : step === "checkout"
        ? "max-w-[930px]"
        : "max-w-[720px]";

  return (
    <div className="min-h-screen w-full bg-[#FBFAF6] text-[#1F140E] antialiased">
      {/* ───── Header ───── */}
      <header className="flex items-start justify-between px-6 pt-8 sm:px-10 lg:px-20">
        <Logo />
        {showSkipToDashboard && (
          <button
            type="button"
            onClick={handleSkipToDashboard}
            disabled={busy}
            className="mt-2 sm:mt-6 inline-flex items-center gap-1.5 text-[16px] text-[#7A3B18] hover:text-[#4A240E] transition-colors cursor-pointer disabled:opacity-50"
          >
            Skip to Dashboard <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </header>

      {/* ───── Main Wizard Content ───── */}
      <main className="px-4 py-8 sm:py-12">
        <section
          className={`w-full ${cardWidth} mx-auto rounded-[32px] border border-[#EEE9E0] bg-[#FDFCFA] p-6 sm:p-10 shadow-sm`}
        >
          {/* ═════════ Step 1: Business Information ═════════ */}
          {step === "business" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setStep("venue");
              }}
              className="space-y-6"
            >
              <div>
                <StepBadge n={1} />
                <h1 className={`${titleClass} mt-4`}>Business Information</h1>
                <p className="mt-1 text-[16px] text-[#6B625B]">
                  Tell us about your business or hospitality group for venue
                  management records.
                </p>
              </div>

              <div>
                <label htmlFor="businessName" className={labelClass}>
                  Owner/Business Name <span className="text-[#7A3B18]">*</span>
                </label>
                <input
                  id="businessName"
                  required
                  placeholder="Lumina Event Studio"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className={fieldClass}
                />
              </div>

              <div>
                <label className={labelClass}>Logo (Optional)</label>
                <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                  <div className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border-2 border-dashed border-[#E8E2D8] bg-[#FAF8F4] overflow-hidden text-[#B3AAA1]">
                    {logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={logo}
                        alt="Logo preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-xs font-semibold tracking-wider">
                        LOGO
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <input
                        ref={fileRef}
                        type="file"
                        accept="image/png,image/jpeg,image/svg+xml"
                        onChange={onLogoFile}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#FAF8F4] border border-[#E8E2D8] px-4 py-2.5 text-[15px] font-medium text-[#1F140E] hover:bg-[#F2ECE4] transition-colors"
                      >
                        <Upload className="h-4 w-4" /> Upload Image
                      </button>
                      <button
                        type="button"
                        onClick={useSampleLogo}
                        className="text-[14px] font-medium text-[#7A3B18] hover:underline"
                      >
                        Use Sample Logo
                      </button>
                    </div>
                    <p className="text-[13px] text-[#8C7A6B]">
                      PNG, JPG or SVG up to 2MB. Recommended 400x400px.
                    </p>
                    {logoError && (
                      <p className="text-[13px] text-[#B02A37]">{logoError}</p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="businessType" className={labelClass}>
                  Business Type <span className="text-[#7A3B18]">*</span>
                </label>
                <Select
                  id="businessType"
                  required
                  value={businessType}
                  onChange={setBusinessType}
                  options={BUSINESS_TYPES}
                />
              </div>

              <StepFooter onBack={() => onBack?.()}>
                <ContinueButton />
              </StepFooter>
            </form>
          )}

          {/* ═════════ Step 2: Create First Venue ═════════ */}
          {step === "venue" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setStep("spaces");
              }}
              className="space-y-6"
            >
              <div className="flex items-start justify-between">
                <div>
                  <StepBadge n={2} />
                  <h1 className={`${titleClass} mt-4`}>Create First Venue</h1>
                  <p className="mt-1 text-[16px] text-[#6B625B]">
                    Add primary venue details. You can create additional venues
                    later in your portal.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setStep("spaces")}
                  className="text-[15px] text-[#8C7A6B] hover:text-[#1F140E] transition-colors"
                >
                  Skip for now
                </button>
              </div>

              <div>
                <label htmlFor="venueName" className={labelClass}>
                  Venue Name <span className="text-[#7A3B18]">*</span>
                </label>
                <input
                  id="venueName"
                  required
                  placeholder="Enter venue name"
                  value={venueName}
                  onChange={(e) => setVenueName(e.target.value)}
                  className={fieldClass}
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="venueType" className={labelClass}>
                    Venue Type <span className="text-[#7A3B18]">*</span>
                  </label>
                  <Select
                    id="venueType"
                    required
                    value={venueType}
                    onChange={setVenueType}
                    options={VENUE_TYPES}
                  />
                </div>
                <div>
                  <label htmlFor="totalCapacity" className={labelClass}>
                    Total Capacity(guests)*
                  </label>
                  <input
                    id="totalCapacity"
                    required
                    placeholder="00"
                    type="number"
                    min={1}
                    value={totalCapacity}
                    onChange={(e) => setTotalCapacity(e.target.value)}
                    className={fieldClass}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="venueAddress" className={labelClass}>
                  Full Address <span className="text-[#7A3B18]">*</span>
                </label>
                <input
                  id="venueAddress"
                  required
                  placeholder="Enter venue address"
                  value={venueAddress}
                  onChange={(e) => setVenueAddress(e.target.value)}
                  className={fieldClass}
                />
              </div>

              <div>
                <label htmlFor="description" className={labelClass}>
                  Description <span className="text-[#7A3B18]">*</span>
                </label>
                <textarea
                  id="description"
                  required
                  rows={4}
                  placeholder="write something about your venue"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-[#E8E2D8] bg-[#FAF8F4] p-3 text-[15px] text-[#1F140E] placeholder:text-[#B3AAA1] outline-none transition focus:border-[#703816] focus:bg-white focus:ring-2 focus:ring-[#703816]/15"
                />
              </div>

              <StepFooter onBack={() => setStep("business")}>
                <ContinueButton />
              </StepFooter>
            </form>
          )}

          {/* ═════════ Step 3: Add Spaces & Halls ═════════ */}
          {step === "spaces" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setStep("team");
              }}
              className="space-y-6"
            >
              <div className="flex items-start justify-between">
                <div>
                  <StepBadge n={3} />
                  <h1 className={`${titleClass} mt-4`}>Add Spaces & Halls</h1>
                  <p className="mt-1 text-[16px] text-[#6B625B]">
                    Divide your venue into specialized spaces, halls, or event
                    suites.
                  </p>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <button
                    type="button"
                    onClick={() => setStep("team")}
                    className="text-[15px] text-[#8C7A6B] hover:text-[#1F140E] transition-colors"
                  >
                    Skip for now
                  </button>
                  <button
                    type="button"
                    onClick={addSpace}
                    className={`${darkButton} h-11 px-4 text-[15px] flex items-center gap-2`}
                  >
                    <Plus className="h-4 w-4" /> Add Space
                  </button>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                {spaces.map((sp, idx) => (
                  <div
                    key={sp.id}
                    className="rounded-2xl border border-[#EEE9E0] bg-[#FAF8F4] p-5 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[17px] font-semibold text-[#7A3B18]">
                        Space #{idx + 1}
                      </span>
                      {spaces.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSpace(sp.id)}
                          className="text-[#8C7A6B] hover:text-[#B02A37] transition-colors p-1"
                          title="Delete space"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      )}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className={labelClass}>Space Name</label>
                        <input
                          placeholder="enter space name"
                          value={sp.name}
                          onChange={(e) =>
                            updateSpace(sp.id, { name: e.target.value })
                          }
                          className={fieldClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Max Capacity</label>
                        <input
                          placeholder="00"
                          type="number"
                          min={1}
                          value={sp.capacity}
                          onChange={(e) =>
                            updateSpace(sp.id, { capacity: e.target.value })
                          }
                          className={fieldClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Space Type</label>
                        <Select
                          id={`sp-type-${sp.id}`}
                          value={sp.type}
                          onChange={(v) => updateSpace(sp.id, { type: v })}
                          options={SPACE_TYPES}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Operating Hours</label>
                        <input
                          placeholder="09:00-01:00"
                          value={sp.operatingHours}
                          onChange={(e) =>
                            updateSpace(sp.id, {
                              operatingHours: e.target.value,
                            })
                          }
                          className={fieldClass}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <StepFooter onBack={() => setStep("venue")}>
                <ContinueButton />
              </StepFooter>
            </form>
          )}

          {/* ═════════ Step 4: Build your team ═════════ */}
          {step === "team" && (
            <div className="space-y-6">
              <div>
                <StepBadge n={4} />
                <h1 className={`${titleClass} mt-4`}>Build your team</h1>
                <p className="mt-1 text-[16px] text-[#6B625B]">
                  Invite team members who will help manage clients, venues, and
                  event execution.
                </p>
              </div>

              {/* Invite Card */}
              <form
                onSubmit={addInvite}
                className="rounded-2xl border border-[#EEE9E0] bg-[#FAF8F4] p-5 space-y-4"
              >
                <span className="block text-[13px] font-semibold tracking-wider uppercase text-[#8C7A6B]">
                  Invite Team Member
                </span>
                <div className="grid gap-3 sm:grid-cols-[1fr_200px]">
                  <input
                    type="email"
                    placeholder="colleague@agency.com"
                    value={inviteEmail}
                    onChange={(e) => {
                      setInviteEmail(e.target.value);
                      if (inviteError) setInviteError(null);
                    }}
                    className={fieldClass}
                  />
                  <Select
                    id="teamRole"
                    value={inviteRole}
                    onChange={(v) => setInviteRole(v as TeamRole)}
                    options={TEAM_ROLES}
                  />
                </div>
                {inviteError && (
                  <p className="text-[13px] text-[#B02A37]">{inviteError}</p>
                )}
                <div>
                  <button
                    type="submit"
                    className={`${darkButton} h-11 px-5 text-[15px] flex items-center gap-2`}
                  >
                    <Plus className="h-4 w-4" /> Add Member
                  </button>
                </div>
              </form>

              {/* Pending Invites */}
              <div className="space-y-3 pt-2">
                <div>
                  <h3 className="text-[16px] font-semibold text-[#1F140E]">
                    Pending Invitation ({invites.length})
                  </h3>
                  <p className="text-[13px] text-[#8C7A6B]">
                    Can be modified anytime
                  </p>
                </div>

                <div className="space-y-2">
                  {invites.map((inv) => {
                    const initials = inv.email.slice(0, 2).toUpperCase();
                    return (
                      <div
                        key={inv.email}
                        className="flex items-center justify-between rounded-xl border border-[#EEE9E0] bg-white px-4 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FAF8F4] text-[14px] font-semibold text-[#6B625B] border border-[#E8E2D8]">
                            {initials}
                          </span>
                          <div>
                            <p className="text-[15px] font-medium text-[#1F140E]">
                              {inv.email}
                            </p>
                            <p className="text-[12px] text-[#8C7A6B]">
                              Invitation Pending
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span
                            className={`rounded-lg px-3 py-1 text-[13px] font-medium ${ROLE_PILL[inv.role]}`}
                          >
                            {inv.role}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeInvite(inv.email)}
                            className="text-[#8C7A6B] hover:text-[#B02A37] transition-colors p-1"
                            title="Remove invitation"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <StepFooter onBack={() => setStep("spaces")}>
                <ContinueButton onClick={() => setStep("plan")}>
                  Save &amp; Continue
                </ContinueButton>
              </StepFooter>
            </div>
          )}

          {/* ═════════ Step 5: Choose A Plan ═════════ */}
          {step === "plan" && (
            <div className="space-y-8">
              <div>
                <StepBadge n={5} />
                <h1 className={`${titleClass} mt-4`}>
                  Choose A Plan That Fits Your Agency
                </h1>
                <p className="mt-1 text-[16px] text-[#6B625B]">
                  Simple transparent pricing. Upgrade or downgrade anytime as
                  your team grows.
                </p>
              </div>

              {annualAvailable && (
                <div className="flex items-center gap-3">
                  <span className="text-[15px] font-medium text-[#1F140E]">
                    Annual Billing
                  </span>
                  <span className="rounded-md bg-[#E2F7E6] px-2 py-0.5 text-[12px] font-semibold text-[#246A38]">
                    Save {ANNUAL_DISCOUNT * 100}%
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={annual}
                    aria-label="Annual billing"
                    onClick={() => setAnnual((a) => !a)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      annual ? "bg-[#7A3B18]" : "bg-[#D8D2C7]"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        annual ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              )}

              <SignupPlanGrid
                plans={plans}
                isLoading={plansLoading}
                isError={plansError}
                onRetry={refetchPlans}
                selectedId={planId}
                onSelect={(p) => {
                  setPlanId(p.id);
                  setStep("checkout");
                }}
                annual={annual}
              />

              <StepFooter onBack={() => setStep("team")}>
                {noPlansAvailable ? (
                  <ContinueButton onClick={handleSkipToDashboard} disabled={busy || isRegistering}>
                    Continue without a plan
                  </ContinueButton>
                ) : (
                  <ContinueButton onClick={() => setStep("checkout")} disabled={!selectedPlan} />
                )}
              </StepFooter>
            </div>
          )}

          {/* ═════════ Step 6: Checkout / Complete Setup ═════════ */}
          {step === "checkout" && (
            <div className="space-y-6">
              <div>
                <h1 className={titleClass}>Complete Your Setup</h1>
                <p className="mt-1 text-[16px] text-[#6B625B]">
                  Select a package to activate your event and start inviting.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Order Summary */}
                <div className="rounded-[24px] border border-[#EEE9E0] bg-[#FAF8F4] p-6 space-y-5">
                  <h2 className="text-[18px] font-bold text-[#1F140E]">
                    Order Summary
                  </h2>
                  <div className="space-y-2.5 text-[15px]">
                    <div className="flex justify-between text-[#1F140E]">
                      <span>{selectedPlan?.planName}</span>
                      <span className="font-semibold">
                        {total === 0 ? "₦00" : naira(total)}
                      </span>
                    </div>
                    <div className="flex justify-between text-[#8C7A6B]">
                      <span>Platform Fee</span>
                      <span className="text-[#246A38] font-medium">Included</span>
                    </div>
                  </div>
                  <div className="border-t border-[#EAE4DA] pt-4 flex justify-between text-[18px] font-bold text-[#1F140E]">
                    <span>Total</span>
                    <span className="text-[#7A3B18]">
                      {total === 0 ? "₦00" : naira(total)}
                    </span>
                  </div>

                  <div className="rounded-xl bg-[#FCF1EA] p-3 text-[13px] text-[#7A3B18] leading-relaxed">
                    The red carpet reception and welcome cocktails will begin
                    promptly at 2:00 PM.
                  </div>
                </div>

                {/* Payment Method */}
                <div className="rounded-[24px] border border-[#EEE9E0] bg-white p-6 space-y-4">
                  <h2 className="text-[18px] font-bold text-[#1F140E]">
                    Payment Method
                  </h2>

                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => setMethod("card")}
                      className={`flex h-14 w-full items-center justify-between rounded-xl border px-4 text-left transition-all ${
                        method === "card"
                          ? "border-[#F0D9CB] bg-[#FCF1EA] text-[#3A2C25] shadow-sm"
                          : "border-[#E8E2D8] bg-white text-[#6B625B]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Radio checked={method === "card"} />
                        <span className="text-[15px] font-medium">
                          Credit / Debit Card
                        </span>
                      </div>
                      <CreditCard className="h-5 w-5 text-[#8C7A6B]" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setMethod("bank")}
                      className={`flex h-14 w-full items-center gap-3 rounded-xl border px-4 text-left transition-all ${
                        method === "bank"
                          ? "border-[#F0D9CB] bg-[#FCF1EA] text-[#3A2C25] shadow-sm"
                          : "border-[#E8E2D8] bg-white text-[#6B625B]"
                      }`}
                    >
                      <Radio checked={method === "bank"} />
                      <span className="text-[15px] font-medium">
                        Bank Transfer
                      </span>
                    </button>
                  </div>

                  <button
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      method === "card" ? setModal("card") : createVenue()
                    }
                    className={`${darkButton} mt-4 h-14 w-full text-[17px]`}
                  >
                    {busy
                      ? "Processing..."
                      : `Pay ${total === 0 ? "₦00" : naira(total)} & Create Event`}
                  </button>
                </div>
              </div>

              <div className="mt-8 border-t border-[#EAE4DA] pt-5">
                <button
                  type="button"
                  onClick={() => setStep("plan")}
                  className={`${outlineButton} h-11 px-5 text-[15px]`}
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* ───── Modals ───── */}
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

      {modal === "created" && (
        <Modal label="Venue Created">
          <SuccessBody
            title="Your Event Is Ready 🎉"
            message={`"${venueName || businessName}" has been created successfully. You are now ready to start inviting guests.`}
          />
          <div className="mt-8 space-y-3">
            <button
              type="button"
              onClick={() => setModal("card")}
              className={`${brownButton} h-[52px] w-full text-[17px]`}
            >
              Pay ₦35,000 &amp; Activate
            </button>
            <button
              type="button"
              onClick={goDashboard}
              className={`${outlineButton} h-[52px] w-full text-[17px]`}
            >
              Go to Event Dashboard
            </button>
          </div>
        </Modal>
      )}

      {modal === "activated" && (
        <Modal label="Venue Activated">
          <SuccessBody
            title="Your Event Is Ready 🎉"
            message={`"${venueName || businessName}" has been created successfully. You are now ready to start inviting guests.`}
          />
          <div className="mt-8 space-y-3">
            <button
              type="button"
              onClick={goDashboard}
              className={`${brownButton} h-[52px] w-full text-[17px]`}
            >
              Go to Event Dashboard
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
