"use client";

import {
  BankTransferModal,
  CardPaymentModal,
  Logo,
  Modal,
  Radio,
  SuccessBody,
  inputClass,
  naira,
} from "@/components/auth/onboarding";
import CommonButton from "@/components/common/CommonButton";
import CommonSelect from "@/components/common/CommonSelect";
import { CommonHeader } from "@/components/shared/CommonHeader";
import { SignupPlanGrid } from "@/components/plans/SignupPlanGrid";
import { useGetPlansQuery } from "@/store/Plan/planApi";
import {
  ANNUAL_DISCOUNT,
  planChargeTotal,
  registrationBillingCycle,
  supportsAnnualBilling,
} from "@/lib/planPricing";
import {
  ArrowRight,
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
      <CommonButton type="button" variant="outline" showLeftIcon onClick={onBack}>
        Back
      </CommonButton>
      {children}
    </div>
  );
}

function ContinueButton({
  children = "Continue",
  type = "submit",
  ...rest
}: Omit<React.ComponentProps<typeof CommonButton>, "children"> & {
  children?: React.ReactNode;
}) {
  return (
    <CommonButton type={type} size="lg" showDefaultIcon {...rest}>
      {children}
    </CommonButton>
  );
}

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

  const [businessName, setBusinessName] = React.useState("Lumina Event Studio");
  const [logo, setLogo] = React.useState<string | null>(null);
  const [logoError, setLogoError] = React.useState<string | null>(null);
  const [businessType, setBusinessType] = React.useState("Event Hall Operator");
  const fileRef = React.useRef<HTMLInputElement>(null);

  const [venueName, setVenueName] = React.useState("");
  const [venueType, setVenueType] = React.useState("Ballroom");
  const [totalCapacity, setTotalCapacity] = React.useState("");
  const [venueAddress, setVenueAddress] = React.useState("");
  const [description, setDescription] = React.useState("");

  const [spaces, setSpaces] = React.useState<SpaceItem[]>([
    {
      id: "1",
      name: "",
      capacity: "",
      type: "Ballroom",
      operatingHours: "09:00-01:00",
    },
  ]);

  const [invites, setInvites] = React.useState<TeamMember[]>([
    { email: "alex@luminaevents.co", role: "Event Planner" },
    { email: "marcus@luminaevents.co", role: "Coordinator" },
  ]);
  const [inviteEmail, setInviteEmail] = React.useState("");
  const [inviteRole, setInviteRole] = React.useState<TeamRole>("Event Planner");
  const [inviteError, setInviteError] = React.useState<string | null>(null);

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

      <main className="px-4 py-8 sm:py-12">
        <section
          className={`w-full ${cardWidth} mx-auto rounded-[32px] border border-[#EEE9E0] bg-[#FDFCFA] p-6 sm:p-10 shadow-sm`}
        >
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
                <CommonHeader
                  className="mt-4"
                  variant="section"
                  as="h1"
                  title="Business Information"
                  subtitle="Tell us about your business or hospitality group for venue management records."
                />
              </div>

              <div>
                <label htmlFor="businessName" className={inputClass.label}>
                  Owner/Business Name <span className="text-[#7A3B18]">*</span>
                </label>
                <input
                  id="businessName"
                  required
                  placeholder="Lumina Event Studio"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className={inputClass.input}
                />
              </div>

              <div>
                <label className={inputClass.label}>Logo (Optional)</label>
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
                <label htmlFor="businessType" className={inputClass.label}>
                  Business Type <span className="text-[#7A3B18]">*</span>
                </label>
                <CommonSelect
                  id="businessType"
                  value={businessType || undefined}
                  placeholder="Select business type"
                  item={BUSINESS_TYPES.map((type) => ({
                    label: type,
                    value: type,
                  }))}
                  onValueChange={setBusinessType}
                />
              </div>

              <StepFooter onBack={() => onBack?.()}>
                <ContinueButton />
              </StepFooter>
            </form>
          )}

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
                  <CommonHeader
                    className="mt-4"
                    variant="section"
                    as="h1"
                    title="Create First Venue"
                    subtitle="Add primary venue details. You can create additional venues later in your portal."
                  />
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
                <label htmlFor="venueName" className={inputClass.label}>
                  Venue Name <span className="text-[#7A3B18]">*</span>
                </label>
                <input
                  id="venueName"
                  required
                  placeholder="Enter venue name"
                  value={venueName}
                  onChange={(e) => setVenueName(e.target.value)}
                  className={inputClass.input}
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="venueType" className={inputClass.label}>
                    Venue Type <span className="text-[#7A3B18]">*</span>
                  </label>
                  <CommonSelect
                    id="venueType"
                    value={venueType || undefined}
                    placeholder="Select venue type"
                    item={VENUE_TYPES.map((type) => ({
                      label: type,
                      value: type,
                    }))}
                    onValueChange={setVenueType}
                  />
                </div>
                <div>
                  <label htmlFor="totalCapacity" className={inputClass.label}>
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
                    className={inputClass.input}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="venueAddress" className={inputClass.label}>
                  Full Address <span className="text-[#7A3B18]">*</span>
                </label>
                <input
                  id="venueAddress"
                  required
                  placeholder="Enter venue address"
                  value={venueAddress}
                  onChange={(e) => setVenueAddress(e.target.value)}
                  className={inputClass.input}
                />
              </div>

              <div>
                <label htmlFor="description" className={inputClass.label}>
                  Description <span className="text-[#7A3B18]">*</span>
                </label>
                <textarea
                  id="description"
                  required
                  rows={4}
                  placeholder="write something about your venue"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={inputClass.textarea}
                />
              </div>

              <StepFooter onBack={() => setStep("business")}>
                <ContinueButton />
              </StepFooter>
            </form>
          )}

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
                  <CommonHeader
                    className="mt-4"
                    variant="section"
                    as="h1"
                    title="Add Spaces & Halls"
                    subtitle="Divide your venue into specialized spaces, halls, or event suites."
                  />
                </div>
                <div className="flex flex-col items-end gap-3">
                  <button
                    type="button"
                    onClick={() => setStep("team")}
                    className="text-[15px] text-[#8C7A6B] hover:text-[#1F140E] transition-colors"
                  >
                    Skip for now
                  </button>
                  <CommonButton
                    type="button"
                    variant="black"
                    size="md"
                    leftIcon={<Plus />}
                    onClick={addSpace}
                  >
                    Add Space
                  </CommonButton>
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
                        <label className={inputClass.label}>Space Name</label>
                        <input
                          placeholder="enter space name"
                          value={sp.name}
                          onChange={(e) =>
                            updateSpace(sp.id, { name: e.target.value })
                          }
                          className={inputClass.input}
                        />
                      </div>
                      <div>
                        <label className={inputClass.label}>Max Capacity</label>
                        <input
                          placeholder="00"
                          type="number"
                          min={1}
                          value={sp.capacity}
                          onChange={(e) =>
                            updateSpace(sp.id, { capacity: e.target.value })
                          }
                          className={inputClass.input}
                        />
                      </div>
                      <div>
                        <label className={inputClass.label}>Space Type</label>
                        <CommonSelect
                          id={`sp-type-${sp.id}`}
                          value={sp.type || undefined}
                          placeholder="Select space type"
                          item={SPACE_TYPES.map((type) => ({
                            label: type,
                            value: type,
                          }))}
                          onValueChange={(value) =>
                            updateSpace(sp.id, { type: value })
                          }
                        />
                      </div>
                      <div>
                        <label className={inputClass.label}>Operating Hours</label>
                        <input
                          placeholder="09:00-01:00"
                          value={sp.operatingHours}
                          onChange={(e) =>
                            updateSpace(sp.id, {
                              operatingHours: e.target.value,
                            })
                          }
                          className={inputClass.input}
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

          {step === "team" && (
            <div className="space-y-6">
              <div>
                <StepBadge n={4} />
                <CommonHeader
                  className="mt-4"
                  variant="section"
                  as="h1"
                  title="Build your team"
                  subtitle="Invite team members who will help manage clients, venues, and event execution."
                />
              </div>

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
                    className={inputClass.input}
                  />
                  <CommonSelect
                    id="teamRole"
                    value={inviteRole}
                    item={TEAM_ROLES.map((role) => ({
                      label: role,
                      value: role,
                    }))}
                    onValueChange={(value) => setInviteRole(value as TeamRole)}
                  />
                </div>
                {inviteError && (
                  <p className="text-[13px] text-[#B02A37]">{inviteError}</p>
                )}
                <div>
                  <CommonButton type="submit" variant="black" size="md" leftIcon={<Plus />}>
                    Add Member
                  </CommonButton>
                </div>
              </form>

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

          {step === "plan" && (
            <div className="space-y-8">
              <div>
                <StepBadge n={5} />
                <CommonHeader
                  className="mt-4"
                  variant="section"
                  as="h1"
                  title="Choose A Plan That Fits Your Agency"
                  subtitle="Simple transparent pricing. Upgrade or downgrade anytime as your team grows."
                />
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

          {step === "checkout" && (
            <div className="space-y-6">
              <div>
                <CommonHeader
                  variant="section"
                  as="h1"
                  title="Complete Your Setup"
                  subtitle="Select a package to activate your event and start inviting."
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
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

                  <CommonButton
                    type="button"
                    variant="black"
                    size="xl"
                    fullWidth
                    className="mt-4"
                    disabled={busy}
                    isLoading={busy}
                    loadingText="Processing..."
                    onClick={() =>
                      method === "card" ? setModal("card") : createVenue()
                    }
                  >
                    {`Pay ${total === 0 ? "₦00" : naira(total)} & Create Event`}
                  </CommonButton>
                </div>
              </div>

              <div className="mt-8 border-t border-[#EAE4DA] pt-5">
                <CommonButton type="button" variant="outline" showLeftIcon onClick={() => setStep("plan")}>
                  Back
                </CommonButton>
              </div>
            </div>
          )}
        </section>
      </main>

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
            <CommonButton type="button" size="lg" fullWidth onClick={() => setModal("card")}>
              Pay ₦35,000 & Activate
            </CommonButton>
            <CommonButton type="button" variant="outline" size="lg" fullWidth onClick={goDashboard}>
              Go to Event Dashboard
            </CommonButton>
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
            <CommonButton type="button" size="lg" fullWidth onClick={goDashboard}>
              Go to Event Dashboard
            </CommonButton>
          </div>
        </Modal>
      )}
    </div>
  );
}
