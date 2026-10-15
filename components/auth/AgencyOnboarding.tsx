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
  Check,
  ChevronDown,
  Plus,
  Upload,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import type { IndividualAccountDetailsFormData } from "@/lib/validations/authSchemas";
import { useRegisterAgencyMutation } from "@/store/Auth/authApi";
import { setCredentials } from "@/store/Auth/authSlice";
import { useAppDispatch } from "@/store/store";
import {
  getApiErrorMessage,
  RegisterAgencyPayload,
} from "@/store/Auth/types/authTypes";
import { toast } from "react-toastify";

/* ───────────────────────── Config ───────────────────────── */

const DASHBOARD_URL = "/organizer/agency";

const AGENCY_TYPES = [
  "Event Planning",
  "Wedding Planning",
  "Corporate Events",
  "Brand Activation & Experiential",
  "Entertainment & Talent",
  "Full-service Agency",
];
const EVENT_KINDS = [
  "Weddings",
  "Birthdays",
  "Corporate Events",
  "Conferences",
  "Private Parties",
  "Social Gatherings",
];
const VOLUMES = ["1-5 / year", "6-20 / year", "21-50 / year", "50+ / year"];
const TEAM_SIZES = ["Just me", "2-5 members", "6-15 members", "16+ members"];

const ROLES = ["Event Planner", "Coordinator", "Admin", "Viewer"] as const;
type Role = (typeof ROLES)[number];
const ROLE_PILL: Record<Role, string> = {
  "Event Planner": "bg-[#E9F0FF] text-[#3B5BA9]",
  Coordinator: "bg-[#FDF1D9] text-[#8A5A00]",
  Admin: "bg-[#F1E7FA] text-[#6B3FA0]",
  Viewer: "bg-[#EDEDED] text-[#555]",
};

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

/* ───────────────────────── Small pieces ───────────────────────── */

function StepBadge({ n }: { n: number }) {
  return (
    <span className="inline-block rounded-xl bg-[#FCF1EA] px-3.5 py-2 text-[15px] uppercase text-[#7A3B18]">
      Step {n} of 5
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
      className={`${brownButton} h-[52px] px-7 text-[19px] group`}
      {...rest}
    >
      {children}{" "}
      <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
    </button>
  );
}

function Chip({
  selected,
  onClick,
  children,
  multi,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  multi?: boolean;
}) {
  const base =
    "h-[52px] rounded-xl border px-4 text-left text-[16px] transition-colors cursor-pointer";
  const style = multi
    ? `flex items-center justify-between ${selected ? "border-[#D9C9B8] bg-[#FAF8F4] text-[#3A2C25]" : "border-[#E8E2D8] bg-[#FAF8F4] text-[#4A3F3A]"}`
    : selected
      ? "border-[#7A3B18] bg-[#FCF1EA] text-[#7A3B18]"
      : "border-[#E8E2D8] bg-[#FAF8F4] text-[#4A3F3A] hover:bg-[#F5F1EA]";
  return (
    <button
      type="button"
      role={multi ? "checkbox" : "radio"}
      aria-checked={selected}
      onClick={onClick}
      className={`${base} ${style}`}
    >
      <span>{children}</span>
      {multi && selected && (
        <Check className="h-5 w-5 text-[#7A3B18]" strokeWidth={2.5} />
      )}
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
  white,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
  placeholder?: string;
  required?: boolean;
  white?: boolean;
}) {
  return (
    <div className="relative">
      <select
        id={id}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${fieldClass} appearance-none pr-10 cursor-pointer ${white ? "bg-white" : ""} ${value ? "" : "text-[#6B625B]"}`}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3.5 top-1/2 h-5 w-5 -translate-y-1/2"
        strokeWidth={1.6}
      />
    </div>
  );
}

/* ───────────────────────── Main component ───────────────────────── */

type Step = "agency" | "work" | "team" | "plan" | "checkout";
type ModalState = null | "created" | "card" | "bank" | "activated";

export function AgencyOnboarding({
  onBack,
  accountData,
}: {
  onBack?: () => void;
  accountData?: IndividualAccountDetailsFormData;
}) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [registerAgency, { isLoading: isRegistering }] = useRegisterAgencyMutation();
  const [step, setStep] = React.useState<Step>("agency");

  // Step 1
  const [agencyName, setAgencyName] = React.useState("");
  const [logo, setLogo] = React.useState<string | null>(null);
  const [logoError, setLogoError] = React.useState<string | null>(null);
  const [agencyType, setAgencyType] = React.useState("");
  const [country, setCountry] = React.useState("");
  const [city, setCity] = React.useState("");
  const fileRef = React.useRef<HTMLInputElement>(null);

  // Step 2
  const [kinds, setKinds] = React.useState<string[]>([]);
  const [volume, setVolume] = React.useState("");
  const [teamSize, setTeamSize] = React.useState("");

  // Step 3
  const [invites, setInvites] = React.useState<{ email: string; role: Role }[]>(
    [],
  );
  const [inviteEmail, setInviteEmail] = React.useState("");
  const [inviteRole, setInviteRole] = React.useState<Role>("Event Planner");
  const [inviteError, setInviteError] = React.useState<string | null>(null);

  // Step 4 + 5
  const {
    data: plansResponse,
    isLoading: plansLoading,
    isError: plansError,
    refetch: refetchPlans,
  } = useGetPlansQuery("Agency");
  const plans = plansResponse?.data ?? [];
  const [planId, setPlanId] = React.useState<string | null>(null);
  const [annual, setAnnual] = React.useState(false);
  const [method, setMethod] = React.useState<"card" | "bank">("card");
  const [modal, setModal] = React.useState<ModalState>(null);
  const [busy, setBusy] = React.useState(false);

  const plan = plans.find((p) => p.id === planId) ?? null;
  const total = plan ? planChargeTotal(plan, annual) : 0;
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
    if (!agencyName.trim() || !agencyType) {
      toast.error("Please complete your agency details before continuing.");
      return false;
    }

    const payload: RegisterAgencyPayload = {
      fullName: accountData.fullName,
      email: accountData.email,
      phone: `${accountData.countryCode}${accountData.phoneNumber}`,
      password: accountData.password,
      confirmPassword: accountData.confirmPassword || accountData.password,
      agencyName: agencyName.trim(),
      agencyType,
      country: country || undefined,
      city: city || undefined,
      eventTypes: kinds.length ? kinds : undefined,
      eventsPerYear: volume || undefined,
      teamSize: teamSize || undefined,
      invitedMembers: invites.length ? invites : undefined,
      planId: plan?.id,
      billingCycle: plan ? registrationBillingCycle(plan, annual) : undefined,
      skipPayment: options?.skipPayment ?? false,
      paymentMethod:
        options?.paymentMethod ?? (method === "card" ? "CARD" : "BANK_TRANSFER"),
    };

    if (logo && /^https?:\/\//.test(logo)) {
      payload.logoUrl = logo;
    }

    try {
      const res = await registerAgency(payload).unwrap();
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
      toast.success("Agency workspace created successfully!");
      return true;
    } catch (error: unknown) {
      toast.error(
        getApiErrorMessage(
          error,
          "We could not complete agency registration. Please try again.",
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
    reader.readAsDataURL(file); // TODO: upload to storage and keep the URL instead
  };

  const useSampleLogo = () => {
    const initials =
      agencyName
        .trim()
        .split(/\s+/)
        .map((w) => w[0] ?? "")
        .join("")
        .replace(/[^A-Za-z0-9]/g, "")
        .slice(0, 2)
        .toUpperCase() || "MV";
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="400" height="400" rx="64" fill="#2A1A14"/><text x="50%" y="54%" font-family="Georgia,serif" font-size="170" font-style="italic" fill="#D9B77A" text-anchor="middle" dominant-baseline="middle">${initials}</text></svg>`;
    setLogoError(null);
    setLogo(`data:image/svg+xml;utf8,${encodeURIComponent(svg)}`);
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

  /* Payment helpers */
  const handleSkipToDashboard = async () => {
    setBusy(true);
    const completed = await performRegistration({ skipPayment: true });
    setBusy(false);
    if (completed) goDashboard();
  };

  const createWorkspace = async () => {
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

  const centered = step === "agency" || step === "work" || step === "team";
  const showSkipToDashboard =
    step === "team" || step === "plan" || step === "checkout";

  const cardWidth =
    step === "plan"
      ? "max-w-[1280px]"
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
            className="mt-6 inline-flex items-center gap-1.5 text-[17px] text-[#7A3B18] underline underline-offset-4 hover:text-[#4A240E] cursor-pointer disabled:opacity-50"
          >
            Skip to Dashboard <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </header>

      <main
        className={`px-4 pb-16 ${centered ? "flex min-h-[calc(100vh-120px)] items-center justify-center py-6" : "pt-8 sm:pt-12"}`}
      >
        <section
          className={`w-full ${cardWidth} mx-auto rounded-[32px] border border-[#EEE9E0] bg-[#FDFCFA] p-6 sm:p-8`}
        >
          {/* ───── Step 1: agency ───── */}
          {step === "agency" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setStep("work");
              }}
            >
              <StepBadge n={1} />
              <h1 className={`${titleClass} mt-6`}>
                Tell Us About Your Agency
              </h1>
              <p className="mt-1 text-[17px] text-[#6B625B]">
                Set up your agency workspace to manage clients, events, and your
                team.
              </p>

              <div className="mt-8">
                <label htmlFor="agencyName" className={labelClass}>
                  Agency Name <span aria-hidden="true">*</span>
                </label>
                <input
                  id="agencyName"
                  required
                  value={agencyName}
                  onChange={(e) => setAgencyName(e.target.value)}
                  placeholder="Lumina Event Studio"
                  className={`${fieldClass} h-[52px]`}
                />
              </div>

              <div className="mt-6">
                <p className={labelClass}>Agency Logo (Optional)</p>
                <div className="grid h-16 w-16 place-items-center overflow-hidden rounded-xl border border-dashed border-[#DDD5C9] bg-white text-[13px] uppercase text-[#8C7A6B]">
                  {logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={logo}
                      alt="Agency logo preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    "Logo"
                  )}
                </div>

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml"
                  onChange={onLogoFile}
                  className="sr-only"
                  aria-label="Upload agency logo"
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="mt-4 inline-flex h-[34px] items-center gap-2 rounded-lg bg-[#F5F2EC] px-3.5 text-[14px] text-[#3A2C25] hover:bg-[#EFEAE0] transition-colors"
                >
                  <Upload className="h-4 w-4" /> Upload Image
                </button>
                <div>
                  <button
                    type="button"
                    onClick={useSampleLogo}
                    className="mt-2 text-[14px] font-medium text-[#7A3B18] hover:underline"
                  >
                    Use Sample Logo
                  </button>
                </div>
                <p className="mt-1 text-[13px] text-[#8C7A6B]">
                  PNG, JPG or SVG up to 2MB. Recommended 400×400px.
                </p>
                {logoError && (
                  <p role="alert" className="mt-1 text-[13px] text-red-700">
                    {logoError}
                  </p>
                )}
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div>
                  <label htmlFor="agencyType" className={labelClass}>
                    Agency Type <span aria-hidden="true">*</span>
                  </label>
                  <Select
                    id="agencyType"
                    required
                    value={agencyType}
                    onChange={setAgencyType}
                    options={AGENCY_TYPES}
                    placeholder="Select type"
                  />
                </div>
                <div>
                  <label htmlFor="country" className={labelClass}>
                    Country
                  </label>
                  <input
                    id="country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="Nigeria"
                    autoComplete="country-name"
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label htmlFor="city" className={labelClass}>
                    City
                  </label>
                  <input
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Lagos"
                    autoComplete="address-level2"
                    className={fieldClass}
                  />
                </div>
              </div>

              <StepFooter onBack={() => onBack?.()}>
                <ContinueButton />
              </StepFooter>
            </form>
          )}

          {/* ───── Step 2: work ───── */}
          {step === "work" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setStep("team");
              }}
            >
              <StepBadge n={2} />
              <div>
                <button
                  type="button"
                  onClick={() => setStep("team")}
                  className="mt-1 text-[16px] text-[#8C7A6B] hover:text-[#7A3B18] transition-colors"
                >
                  Skip for now
                </button>
              </div>
              <h1 className={`${titleClass} mt-4`}>Tell Us About Your Work</h1>
              <p className="mt-1 text-[17px] text-[#6B625B]">
                Help us customize your workspace tools and client event
                templates.
              </p>

              <fieldset className="mt-8">
                <legend className="mb-3 text-[16px] text-[#4A3F3A]">
                  What types of events do you organize?{" "}
                  <span className="text-[#8C7A6B]">
                    (select all that apply)
                  </span>
                </legend>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {EVENT_KINDS.map((k) => (
                    <Chip
                      key={k}
                      multi
                      selected={kinds.includes(k)}
                      onClick={() =>
                        setKinds((list) =>
                          list.includes(k)
                            ? list.filter((x) => x !== k)
                            : [...list, k],
                        )
                      }
                    >
                      {k}
                    </Chip>
                  ))}
                </div>
              </fieldset>

              <div className="mt-8">
                <p className="mb-3 text-[16px] text-[#4A3F3A]">
                  How many events do you typically manage?
                </p>
                <div
                  role="radiogroup"
                  aria-label="Events per year"
                  className="grid grid-cols-2 gap-3 sm:grid-cols-4"
                >
                  {VOLUMES.map((v) => (
                    <Chip
                      key={v}
                      selected={volume === v}
                      onClick={() => setVolume(v)}
                    >
                      {v}
                    </Chip>
                  ))}
                </div>
              </div>

              <div className="mt-8">
                <p className="mb-3 text-[16px] text-[#4A3F3A]">
                  How large is your team?
                </p>
                <div
                  role="radiogroup"
                  aria-label="Team size"
                  className="grid grid-cols-2 gap-3 sm:grid-cols-4"
                >
                  {TEAM_SIZES.map((t) => (
                    <Chip
                      key={t}
                      selected={teamSize === t}
                      onClick={() => setTeamSize(t)}
                    >
                      {t}
                    </Chip>
                  ))}
                </div>
              </div>

              <StepFooter onBack={() => setStep("agency")}>
                <ContinueButton />
              </StepFooter>
            </form>
          )}

          {/* ───── Step 3: team ───── */}
          {step === "team" && (
            <div>
              <StepBadge n={3} />
              <h1 className="mt-6 text-[32px] font-semibold leading-tight tracking-tight text-[#2A1A14] sm:text-[36px]">
                Build your agency team
              </h1>
              <p className="mt-1 text-[17px] text-[#6B625B]">
                Invite team members who will help manage clients, venues, and
                event execution.
              </p>

              <form
                onSubmit={addInvite}
                noValidate
                className="mt-8 rounded-2xl border border-[#F0E8DA] bg-[#FEFAF3] p-5"
              >
                <h2 className="text-[16px] uppercase text-[#3A2C25]">
                  Invite Team Member
                </h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_250px]">
                  <input
                    type="email"
                    aria-label="Team member email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@agency.com"
                    className={`${fieldClass} h-[52px] bg-white`}
                  />
                  <Select
                    id="inviteRole"
                    value={inviteRole}
                    onChange={(v) => setInviteRole(v as Role)}
                    options={ROLES}
                    white
                  />
                </div>
                {inviteError && (
                  <p role="alert" className="mt-2 text-[14px] text-red-700">
                    {inviteError}
                  </p>
                )}
                <button
                  type="submit"
                  className={`${darkButton} mt-4 h-[52px] gap-2 px-6 text-[18px]`}
                >
                  <Plus className="h-5 w-5" /> Add Member
                </button>
              </form>

              <div className="mt-8">
                <h2 className="text-[18px] text-[#3A2C25]">
                  Pending Invitations ({invites.length})
                </h2>
                <p className="text-[14px] text-[#8C7A6B]">
                  Can be modified anytime
                </p>

                {invites.length === 0 ? (
                  <p className="mt-3 rounded-2xl border border-dashed border-[#E3DBCF] px-4 py-5 text-center text-[15px] text-[#8C7A6B]">
                    No invitations yet. Add a teammate above, or skip this for
                    now.
                  </p>
                ) : (
                  <ul className="mt-3 space-y-3">
                    {invites.map((inv) => (
                      <li
                        key={inv.email}
                        className="flex items-center gap-3 rounded-2xl border border-[#EAE4DA] bg-white px-3 py-3"
                      >
                        <span
                          aria-hidden="true"
                          className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#F3F0EB] text-[15px] text-[#6B625B]"
                        >
                          {inv.email.slice(0, 2).toUpperCase()}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[17px] text-[#2A1A14]">
                            {inv.email}
                          </p>
                          <p className="text-[14px] text-[#8C7A6B]">
                            Invitation Pending
                          </p>
                        </div>
                        <span
                          className={`rounded-md px-3 py-1.5 text-[14px] ${ROLE_PILL[inv.role]}`}
                        >
                          {inv.role}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setInvites((list) =>
                              list.filter((i) => i.email !== inv.email),
                            )
                          }
                          aria-label={`Remove ${inv.email}`}
                          className="p-1.5 text-[#8C7A6B] hover:text-[#7A3B18] transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <StepFooter onBack={() => setStep("work")}>
                <ContinueButton
                  type="button"
                  onClick={() => {
                    // TODO: send the pending invitations
                    setStep("plan");
                  }}
                >
                  Save &amp; Continue
                </ContinueButton>
              </StepFooter>
            </div>
          )}

          {/* ───── Step 4: plans ───── */}
          {step === "plan" && (
            <div>
              <h1 className={titleClass}>
                Choose A Plan That Fits Your Agency
              </h1>
              <p className="mt-1 text-[17px] text-[#6B625B]">
                Simple transparent pricing. Upgrade or downgrade anytime as your
                team grows.
              </p>

              {annualAvailable && (
                <div className="mt-8 inline-flex flex-col gap-2 rounded-xl border border-[#EEE9E0] bg-white px-3.5 py-3">
                  <span className="text-[16px] font-medium text-[#2A1A14]">
                    Annual Billing
                  </span>
                  <span className="w-fit rounded-md bg-[#DDF3E4] px-2 py-0.5 text-[13px] text-[#1F8A4C]">
                    Save {ANNUAL_DISCOUNT * 100}%
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={annual}
                    aria-label="Annual billing"
                    onClick={() => setAnnual((a) => !a)}
                    className={`relative h-6 w-11 rounded-full transition-colors ${annual ? "bg-[#7A3B18]" : "bg-[#A39A92]"}`}
                  >
                    <span
                      className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${annual ? "translate-x-5" : ""}`}
                    />
                  </button>
                </div>
              )}

              <SignupPlanGrid
                className="mt-8"
                plans={plans}
                isLoading={plansLoading}
                isError={plansError}
                onRetry={refetchPlans}
                selectedId={planId}
                onSelect={(p) => setPlanId(p.id)}
                annual={annual}
              />

              <div className="mt-8 flex items-center justify-between border-t border-[#EAE4DA] pt-5">
                <button
                  type="button"
                  onClick={() => setStep("team")}
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
            </div>
          )}

          {/* ───── Step 5: checkout ───── */}
          {step === "checkout" && (
            <div>
              <h1 className={titleClass}>Complete Your Setup</h1>
              <p className="mt-1 text-[17px] text-[#6B625B]">
                Select a plan to activate your agency workspace.
              </p>

              <div className="mt-10 grid gap-5 md:grid-cols-[0.85fr_1.15fr]">
                <div className="space-y-4">
                  <div className="rounded-2xl border border-[#EAE4DA] bg-white p-5">
                    <h2 className="border-b border-[#EFEAE2] pb-3 text-[22px] font-medium text-[#4A3F3A]">
                      Order Summary
                    </h2>
                    <dl className="mt-3 space-y-3 border-b border-[#EFEAE2] pb-4 text-[15px]">
                      <div className="flex justify-between gap-3">
                        <dt className="text-[#3A2C25]">
                          {`${plan?.planName ?? ""} (${plan && annual && supportsAnnualBilling(plan) ? "Annual" : plan?.billingCycle ?? ""})`}
                        </dt>
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
                    You can upgrade or downgrade your plan anytime from your
                    agency dashboard.
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
                    {(
                      [
                        { id: "card", label: "Credit / Debit Card" },
                        { id: "bank", label: "Bank Transfer" },
                      ] as const
                    ).map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        role="radio"
                        aria-checked={method === opt.id}
                        onClick={() => setMethod(opt.id)}
                        className={`flex h-[54px] w-full items-center gap-3 rounded-2xl border px-4 text-left text-[17px] transition-all ${
                          method === opt.id
                            ? "border-[#F0D9CB] bg-[#FCF1EA] font-medium text-[#3A2C25] shadow-[0_3px_8px_rgba(122,59,24,0.2)]"
                            : "border-[#E5E0D8] bg-white text-[#6B625B]"
                        }`}
                      >
                        <Radio checked={method === opt.id} />
                        <span className="flex-1">{opt.label}</span>
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      method === "card" ? setModal("card") : createWorkspace()
                    }
                    className={`${darkButton} mt-5 h-[54px] w-full text-[18px]`}
                  >
                    {busy ? "Setting up..." : `Pay ${naira(total)} & Activate`}
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
        <Modal label="Workspace created">
          <SuccessBody
            title="Your Workspace Is Ready 🎉"
            message={`“${agencyName}” has been created. Complete payment to activate your ${plan?.planName ?? ""} plan.`}
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
              Go to Agency Dashboard
            </button>
          </div>
        </Modal>
      )}

      {modal === "activated" && (
        <Modal label="Workspace activated">
          <SuccessBody
            title="Your Workspace Is Ready 🎉"
            message={`“${agencyName}” is set up and your ${plan?.planName ?? ""} plan is active. You can start managing clients and events.`}
          />
          <button
            type="button"
            onClick={goDashboard}
            className={`${brownButton} mt-8 h-[52px] w-full text-[18px]`}
          >
            Go to Agency Dashboard
          </button>
        </Modal>
      )}
    </div>
  );
}
