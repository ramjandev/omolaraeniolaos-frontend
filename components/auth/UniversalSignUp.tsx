"use client";

import { AgencyOnboarding } from "@/components/auth/AgencyOnboarding";
import { AuthShowcase } from "@/components/auth/AuthShowcase";
import { IndividualOnboarding } from "@/components/auth/IndividualOnboarding";
import { Logo, inputClass } from "@/components/auth/onboarding";
import { VenueOnboarding } from "@/components/auth/VenueOnboarding";
import CommonButton from "@/components/common/CommonButton";
import { CommonHeader } from "@/components/shared/CommonHeader";
import { Check, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  individualAccountDetailsSchema,
  IndividualAccountDetailsFormData,
} from "@/lib/validations/authSchemas";
import {
  COUNTRY_DIAL_CODES,
  DEFAULT_COUNTRY_ISO,
  countryFlag,
  findCountry,
} from "@/lib/countries";

export type OrganizerSignUpRole =
  | "organizer_individual"
  | "organizer_agency"
  | "organizer_venue";

interface UniversalSignUpProps {
  initialRole?: OrganizerSignUpRole;
}

const ROLE_OPTIONS: {
  role: OrganizerSignUpRole;
  label: string;
  icon: string;
}[] = [
  {
    role: "organizer_individual",
    label: "Individual Host",
    icon: "🧑‍💼",
  },
  {
    role: "organizer_agency",
    label: "Agency",
    icon: "💼",
  },
  {
    role: "organizer_venue",
    label: "Venue",
    icon: "🏛️",
  },
];

export function UniversalSignUp({ initialRole }: UniversalSignUpProps) {
  const searchParams = useSearchParams();

  const queryRole = searchParams?.get("role");
  const queryMappedRole = React.useMemo<OrganizerSignUpRole | null>(() => {
    if (queryRole === "agency") return "organizer_agency";
    if (queryRole === "venue") return "organizer_venue";
    if (queryRole === "individual") return "organizer_individual";
    return null;
  }, [queryRole]);

  const resolvedInitialRole: OrganizerSignUpRole =
    initialRole ?? queryMappedRole ?? "organizer_individual";
  const hasExplicitRole = Boolean(initialRole || queryMappedRole);

  const [activeRole, setActiveRole] =
    React.useState<OrganizerSignUpRole>(resolvedInitialRole);
  const [step, setStep] = React.useState<"role" | "details" | "onboarding">(
    hasExplicitRole ? "details" : "role",
  );

  const [accountData, setAccountData] =
    React.useState<IndividualAccountDetailsFormData | null>(null);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const [countryIso, setCountryIso] = React.useState(DEFAULT_COUNTRY_ISO);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<IndividualAccountDetailsFormData>({
    resolver: zodResolver(individualAccountDetailsSchema),
    defaultValues: {
      fullName: "",
      email: "",
      countryCode: "+234",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
    },
  });

  const selectedCountry =
    findCountry(countryIso) ?? findCountry(DEFAULT_COUNTRY_ISO)!;

  const onCountryChange = (iso: string) => {
    setCountryIso(iso);
    const country = findCountry(iso);
    if (country) {
      setValue("countryCode", country.dial, { shouldValidate: true });
    }
  };

  React.useEffect(() => {
    setActiveRole(resolvedInitialRole);
    if (hasExplicitRole) setStep((current) => (current === "role" ? "details" : current));
  }, [resolvedInitialRole, hasExplicitRole]);

  const nameLabel =
    activeRole === "organizer_individual" ? "Full Name" : "Your Name";
  const onDetailsSubmit = (data: IndividualAccountDetailsFormData) => {
    setAccountData(data);
    setStep("onboarding");
  };

  if (step === "onboarding") {
    if (activeRole === "organizer_venue") {
      return (
        <VenueOnboarding
          onBack={() => setStep("details")}
          accountData={accountData ?? undefined}
        />
      );
    }
    if (activeRole === "organizer_agency") {
      return (
        <AgencyOnboarding
          onBack={() => setStep("details")}
          accountData={accountData ?? undefined}
        />
      );
    }
    return (
      <IndividualOnboarding
        onBack={() => setStep("details")}
        accountData={accountData ?? undefined}
      />
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white text-[#1F140E] antialiased">
      <div className="relative w-full lg:w-[49%] flex flex-col min-h-screen">
        <div className="px-6 sm:px-10 lg:px-20 pt-8">
          <Logo />
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-[525px]">
            <CommonHeader
              variant="hero"
              as="h1"
              title={
                <>
                  Create Your
                  <br />
                  McEniesVite Account
                </>
              }
              subtitle="Bring your event and guest experience together in one place."
            />

            {step === "role" && (
              <div className="mt-10">
                <div
                  role="radiogroup"
                  aria-label="Account type"
                  className="space-y-3"
                >
                  {ROLE_OPTIONS.map(({ role, label, icon }) => {
                    const selected = activeRole === role;
                    return (
                      <button
                        key={role}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => setActiveRole(role)}
                        className={`w-full h-[58px] px-4 flex items-center gap-3 rounded-2xl border text-left text-[19px] transition-all
                          focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7A3B18] ${
                            selected
                              ? "bg-[#FCF1EA] border-[#F0D9CB] text-[#4A3A31] shadow-[0_3px_8px_rgba(122,59,24,0.18)]"
                              : "bg-[#F5F3F1] border-[#E9E5E1] text-[#6B625B] hover:bg-[#F0EDEA]"
                          }`}
                      >
                        <span
                          aria-hidden="true"
                          className="w-9 text-center text-[26px] leading-none"
                        >
                          {icon}
                        </span>
                        <span className="flex-1">{label}</span>
                        {selected && (
                          <span className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-[#7A3B18] text-white">
                            <Check className="w-4 h-4" strokeWidth={3} />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <CommonButton
                  type="button"
                  size="lg"
                  fullWidth
                  className="mt-9"
                  showDefaultIcon
                  onClick={() => setStep("details")}
                >
                  Continue
                </CommonButton>
              </div>
            )}

            {step === "details" && (
              <form onSubmit={handleSubmit(onDetailsSubmit)} className="mt-10 space-y-5">
                <div>
                  <label htmlFor="name" className={inputClass.label}>
                    {nameLabel} <span aria-hidden="true">*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    autoComplete="name"
                    {...register("fullName")}
                    placeholder="Enter your full name"
                    className={`${inputClass.input} ${errors.fullName ? "border-red-500 focus:border-red-500" : ""}`}
                  />
                  {errors.fullName && (
                    <p className={inputClass.error}>{errors.fullName.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className={inputClass.label}>
                    Email Address <span aria-hidden="true">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    {...register("email")}
                    placeholder="Enter your email address"
                    className={`${inputClass.input} ${errors.email ? "border-red-500 focus:border-red-500" : ""}`}
                  />
                  {errors.email && (
                    <p className={inputClass.error}>{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="phone" className={inputClass.label}>
                    WhatsApp Phone Number <span aria-hidden="true">*</span>
                  </label>
                  <div
                    className={`flex h-11 sm:h-12 rounded-[12px] border ${
                      errors.phoneNumber ? "border-red-500" : "border-[#E8E4E3]"
                    } bg-[#FDFBF7] overflow-hidden focus-within:border-[#703816] focus-within:ring-2 focus-within:ring-[#703816]/15 transition`}
                  >
                    <div className="relative shrink-0 bg-[#F3F0EB] border-r border-[#E8E4E3]">
                      <span className="flex h-full items-center gap-1.5 px-3 sm:px-3.5 text-sm sm:text-base pointer-events-none">
                        <span aria-hidden="true">
                          {countryFlag(selectedCountry.iso)}
                        </span>
                        {selectedCountry.dial}
                      </span>
                      <input type="hidden" {...register("countryCode")} />
                      <select
                        aria-label="Country code"
                        value={countryIso}
                        onChange={(e) => onCountryChange(e.target.value)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      >
                        {COUNTRY_DIAL_CODES.map((item) => (
                          <option key={item.iso} value={item.iso}>
                            {countryFlag(item.iso)} {item.name} ({item.dial})
                          </option>
                        ))}
                      </select>
                    </div>
                    <input
                      id="phone"
                      type="tel"
                      autoComplete="tel-national"
                      {...register("phoneNumber")}
                      placeholder="Write your phone number"
                      className="flex-1 min-w-0 px-3 text-sm sm:text-base bg-transparent outline-none placeholder:text-[#C2BCB1]"
                    />
                  </div>
                  {errors.phoneNumber && (
                    <p className={inputClass.error}>{errors.phoneNumber.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="password" className={inputClass.label}>
                    Create Password<span aria-hidden="true">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      {...register("password")}
                      placeholder="********"
                      className={`${inputClass.input} pr-12 ${errors.password ? "border-red-500 focus:border-red-500" : ""}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#1F140E] hover:text-[#703816] transition-colors"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <Eye className="w-[22px] h-[22px]" strokeWidth={1.6} />
                      ) : (
                        <EyeOff
                          className="w-[22px] h-[22px]"
                          strokeWidth={1.6}
                        />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className={inputClass.error}>{errors.password.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirm" className={inputClass.label}>
                    Confirm Password<span aria-hidden="true">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="confirm"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      {...register("confirmPassword")}
                      placeholder="********"
                      className={`${inputClass.input} pr-12 ${errors.confirmPassword ? "border-red-500 focus:border-red-500" : ""}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#1F140E] hover:text-[#703816] transition-colors"
                      aria-label={
                        showConfirmPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showConfirmPassword ? (
                        <Eye className="w-[22px] h-[22px]" strokeWidth={1.6} />
                      ) : (
                        <EyeOff
                          className="w-[22px] h-[22px]"
                          strokeWidth={1.6}
                        />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className={inputClass.error}>
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <CommonButton
                  type="submit"
                  size="lg"
                  fullWidth
                  className="mt-4"
                  showDefaultIcon={!isSubmitting}
                  disabled={isSubmitting}
                  isLoading={isSubmitting}
                  loadingText="Validating details..."
                >
                  Continue to Adaptive Profile Setup
                </CommonButton>

                <div className="text-center">
                  <CommonButton
                    type="button"
                    variant="outline"
                    showLeftIcon
                    onClick={() => setStep("role")}
                  >
                    Back to account type
                  </CommonButton>
                </div>
              </form>
            )}
          </div>
        </div>

        <p className="pb-10 text-center text-[15px] text-[#6B625B]">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-[#1F140E] underline underline-offset-2 hover:text-[#703816] transition-colors"
          >
            Sign In
          </Link>
        </p>
      </div>

      <AuthShowcase />
    </div>
  );
}
