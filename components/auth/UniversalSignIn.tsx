"use client";

import { Logo } from "@/components/auth/onboarding-ui";
import { UserRole } from "@/types/roles";
import { ChevronDown, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { loginSchema, LoginFormData } from "@/lib/validations/authSchemas";
import { useLoginUserMutation } from "@/store/Auth/authApi";
import { useAppDispatch } from "@/store/store";
import { setCredentials } from "@/store/Auth/authSlice";

const roleRoutes: Record<UserRole, string> = {
  organizer_individual: "/organizer/individual",
  organizer_agency: "/organizer/agency",
  organizer_venue: "/organizer/venue",
  admin: "/admin",
  gate_staff: "/gate-staff",
  guest: "/guest",
};

const apiRoleMap: Record<string, UserRole> = {
  ADMIN: "admin",
  INDIVIDUAL: "organizer_individual",
  AGENCY: "organizer_agency",
  VENUE: "organizer_venue",
  GATE: "gate_staff",
  GUEST: "guest",
};

const showcase = [
  {
    emoji: "💌",
    title: "RSVP Made Effortless",
    stats: [
      { value: "186", label: "Guests responded" },
      { value: "94%", label: "RSVP rate" },
      { value: "42", label: "Responses today" },
    ],
  },
  {
    emoji: "📋",
    title: "Guest Lists, Organised",
    stats: [
      { value: "212", label: "Guests invited" },
      { value: "18", label: "Tables assigned" },
      { value: "7", label: "Dietary notes" },
    ],
  },
  {
    emoji: "✅",
    title: "Smooth Event-Day Check-in",
    stats: [
      { value: "164", label: "Guests checked in" },
      { value: "98%", label: "Scan success" },
      { value: "12s", label: "Avg. check-in time" },
    ],
  },
];

const fieldClass =
  "w-full h-12 px-3 text-[15px] rounded-xl border border-[#E8E2D8] bg-[#FAF8F4] text-[#1F140E] " +
  "placeholder:text-[#B3AAA1] outline-none transition focus:bg-white focus:border-[#703816] focus:ring-2 focus:ring-[#703816]/15";

export function UniversalSignIn() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [loginUser, { isLoading: isApiLoading }] = useLoginUserMutation();

  const [showPassword, setShowPassword] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // React Hook Form with Zod validation
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Showcase card
  const [slide, setSlide] = React.useState(0);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const cardRef = React.useRef<HTMLDivElement>(null);
  const active = showcase[slide];

  React.useEffect(() => {
    const close = (e: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node))
        setMenuOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);

    try {
      const response = await loginUser({
        email: data.email,
        password: data.password,
      }).unwrap();

      const token = response.data.accessToken;
      const refreshToken = response.data.refreshToken;
      const user = response.data.user;

      if (token) {
        dispatch(
          setCredentials({
            accessToken: token,
            refreshToken,
            user,
          }),
        );
        toast.success(`Welcome back, ${user?.fullName || "Organizer"}!`);
      }

      const normalizedRole = apiRoleMap[user.role] ?? "organizer_individual";
      router.push(roleRoutes[normalizedRole]);
    } catch (error: unknown) {
      const apiError = error as { data?: { message?: string }; message?: string };
      toast.error(
        apiError.data?.message ||
          apiError.message ||
          "Invalid email or password.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const loading = isSubmitting || isApiLoading;

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white text-[#1F140E] antialiased">
      {/* ───────── Left: form ───────── */}
      <div className="relative w-full lg:w-[49%] flex flex-col min-h-screen">
        {/* Brand */}
        <div className="px-6 sm:px-10 lg:px-20 pt-8">
          <Logo />
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-[430px]">
            <div className="text-center">
              <h1 className="font-[family-name:var(--font-display,serif)] text-[44px] sm:text-[48px] font-semibold leading-tight tracking-tight">
                Welcome Back
              </h1>
              <p className="mt-3 mx-auto max-w-[380px] text-base sm:text-[17px] leading-8 text-[#6B625B]">
                Manage your events, guests, invitations, and event-day
                experience all in one place.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-10 space-y-5">
              <div>
                <label htmlFor="email" className="block mb-2 text-[15px]">
                  Email <span aria-hidden="true">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...register("email")}
                  placeholder="Enter your email address"
                  className={`${fieldClass} ${errors.email ? "border-red-500 focus:border-red-500" : ""}`}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-500 font-medium">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block mb-2 text-[15px]">
                  Password <span aria-hidden="true">*</span>
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    {...register("password")}
                    placeholder="Enter your Password"
                    className={`${fieldClass} pr-12 ${errors.password ? "border-red-500 focus:border-red-500" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#1F140E] hover:text-[#703816] transition-colors cursor-pointer"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <Eye className="w-[22px] h-[22px]" strokeWidth={1.6} />
                    ) : (
                      <EyeOff className="w-[22px] h-[22px]" strokeWidth={1.6} />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-500 font-medium">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="text-center">
                <Link
                  href="/forgot-password"
                  className="text-[13px] text-[#D99A5B] hover:text-[#703816] transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-[52px] rounded-xl bg-[#7A3B18] hover:bg-[#632F13] text-white text-base font-medium
                           shadow-[0_2px_0_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.12)]
                           transition-colors cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed
                           focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7A3B18]"
              >
                {loading ? "Signing in..." : "Log In"}
              </button>

            </form>
          </div>
        </div>

        {/* Footer */}
        <p className="pb-10 text-center text-[15px] text-[#6B625B]">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-medium text-[#1F140E] underline underline-offset-2 hover:text-[#703816] transition-colors"
          >
            Sign Up
          </Link>
        </p>
      </div>

      {/* ───────── Right: artwork + glass card ───────── */}
      <div className="hidden lg:flex flex-1 relative min-h-screen items-center justify-center px-12">
        <div
          className="absolute inset-y-0 -left-3 right-0 z-0 overflow-hidden bg-[#362114]"
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(90deg, transparent 0 22%, rgba(32,74,66,.85) 22% 28%, transparent 28% 52%, rgba(32,74,66,.75) 52% 58%, transparent 58% 84%, rgba(32,74,66,.8) 84% 90%, transparent 90%),
                linear-gradient(180deg, rgba(120,60,24,.5) 0 18%, transparent 18% 40%, rgba(236,225,200,.7) 40% 62%, rgba(150,95,40,.55) 62% 100%),
                radial-gradient(ellipse at 30% 30%, rgba(210,140,70,.6) 0%, transparent 50%),
                radial-gradient(ellipse at 75% 70%, rgba(24,56,48,.85) 0%, transparent 55%)
              `,
            }}
          />
          <div
            className="absolute inset-0 opacity-25 mix-blend-overlay"
            style={{
              backgroundImage:
                "radial-gradient(#FFF 1px, transparent 1px), radial-gradient(#FFF 1px, #000 1px)",
              backgroundSize: "20px 20px",
              backgroundPosition: "0 0, 10px 10px",
            }}
          />
        </div>

        {/* Floating glass card */}
        <div ref={cardRef} className="relative z-10 w-full max-w-[458px] text-white">
          <div className="flex items-center justify-between">
            <div className="flex h-[86px] w-full items-center justify-between rounded-2xl border border-white/70 bg-white/95 px-6 text-earthstone shadow-[0_8px_0_rgba(35,24,20,0.24)] backdrop-blur-md">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl" role="img" aria-label="card-icon">
                {active.emoji}
              </span>
              <span className="text-base font-semibold tracking-tight">
                {active.title}
              </span>
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                className="inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
                aria-expanded={menuOpen}
              >
                Features
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 rounded-2xl bg-white p-1.5 shadow-xl border border-[#EEE9E0] text-xs z-20">
                  {showcase.map((s, i) => (
                    <button
                      key={s.title}
                      type="button"
                      onClick={() => {
                        setSlide(i);
                        setMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl flex items-center gap-2 transition-colors cursor-pointer ${
                        slide === i
                          ? "bg-[#FAF7F2] font-semibold text-[#703816]"
                          : "hover:bg-[#FAF7F2] text-[#4A4036]"
                      }`}
                    >
                      <span>{s.emoji}</span>
                      <span className="truncate">{s.title}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            </div>
          </div>

          <div className="mt-8 grid gap-3">
            {active.stats.map((st) => (
              <div
                key={st.label}
                className="flex h-[53px] items-center gap-2 rounded-xl border border-white/60 bg-white/10 px-4 backdrop-blur-sm"
              >
                <div className="text-2xl font-semibold text-white">
                  {st.value}
                </div>
                <div className="text-sm text-white/90">
                  {st.label}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 flex justify-center gap-1.5">
            {showcase.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSlide(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  slide === i ? "w-6 bg-[#703816]" : "w-1.5 bg-[#DDD5CA]"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
