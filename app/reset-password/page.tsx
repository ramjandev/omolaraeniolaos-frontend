"use client";

import { AuthShowcase } from "@/components/auth/AuthShowcase";
import { Logo } from "@/components/auth/onboarding-ui";
import { ArrowLeft, ArrowRight, CheckCircle2, Eye, EyeOff, KeyRound } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  resetPasswordSchema,
  ResetPasswordFormData,
} from "@/lib/validations/authSchemas";
import { useResetPasswordMutation } from "@/store/Auth/authApi";
import { toast } from "react-toastify";

const fieldClass =
  "w-full h-12 px-3 text-[15px] rounded-xl border border-[#E8E2D8] bg-[#FAF8F4] text-[#1F140E] " +
  "placeholder:text-[#B3AAA1] outline-none transition focus:bg-white focus:border-[#703816] focus:ring-2 focus:ring-[#703816]/15";

const labelClass = "block mb-2 text-[15px] text-[#1F140E]";

const primaryButtonClass =
  "w-full h-[52px] px-5 rounded-xl bg-[#7A3B18] hover:bg-[#632F13] text-white text-base font-medium " +
  "shadow-[0_2px_0_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.12)] transition-colors cursor-pointer " +
  "disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7A3B18]";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams?.get("token") || searchParams?.get("code") || "";

  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: tokenFromUrl,
      newPassword: "",
      confirmPassword: "",
    },
  });

  React.useEffect(() => {
    if (tokenFromUrl) {
      setValue("token", tokenFromUrl, { shouldValidate: true });
    }
  }, [tokenFromUrl, setValue]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      await resetPassword({
        token: data.token,
        newPassword: data.newPassword,
      }).unwrap();

      setIsSuccess(true);
      toast.success("Password updated successfully! You may now sign in.");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      const errMsg =
        err?.data?.message ||
        err?.message ||
        "Failed to reset password. Please verify your token and try again.";
      toast.error(errMsg);
    }
  };

  return (
    <div className="w-full max-w-[480px]">
      {!isSuccess ? (
        <>
          <div className="text-center">
            <h1 className="font-[family-name:var(--font-display,serif)] text-[36px] sm:text-[44px] font-semibold leading-[1.15] tracking-tight text-[#1F140E]">
              Create New Password
            </h1>
            <p className="mt-3 text-base sm:text-[17px] leading-7 text-[#6B625B]">
              Enter the reset token received in your email and choose a secure new password.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-9 space-y-5">
            <div>
              <label htmlFor="token" className={labelClass}>
                Reset Token / Code <span aria-hidden="true">*</span>
              </label>
              <div className="relative">
                <input
                  id="token"
                  type="text"
                  autoComplete="one-time-code"
                  {...register("token")}
                  placeholder="Paste your reset token"
                  className={`${fieldClass} pl-11 ${
                    errors.token ? "border-red-500 focus:border-red-500" : ""
                  }`}
                />
                <KeyRound
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-[#8C7A6B]"
                  strokeWidth={1.7}
                />
              </div>
              {errors.token && (
                <p className="mt-1.5 text-xs text-red-600 font-medium">
                  {errors.token.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="newPassword" className={labelClass}>
                New Password <span aria-hidden="true">*</span>
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  {...register("newPassword")}
                  placeholder="Min. 8 characters"
                  className={`${fieldClass} pr-12 ${
                    errors.newPassword ? "border-red-500 focus:border-red-500" : ""
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#1F140E] hover:text-[#703816] transition-colors cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <Eye className="w-[22px] h-[22px]" strokeWidth={1.6} />
                  ) : (
                    <EyeOff className="w-[22px] h-[22px]" strokeWidth={1.6} />
                  )}
                </button>
              </div>
              {errors.newPassword && (
                <p className="mt-1.5 text-xs text-red-600 font-medium">
                  {errors.newPassword.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className={labelClass}>
                Confirm New Password <span aria-hidden="true">*</span>
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  {...register("confirmPassword")}
                  placeholder="Repeat new password"
                  className={`${fieldClass} pr-12 ${
                    errors.confirmPassword
                      ? "border-red-500 focus:border-red-500"
                      : ""
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#1F140E] hover:text-[#703816] transition-colors cursor-pointer"
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <Eye className="w-[22px] h-[22px]" strokeWidth={1.6} />
                  ) : (
                    <EyeOff className="w-[22px] h-[22px]" strokeWidth={1.6} />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1.5 text-xs text-red-600 font-medium">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`${primaryButtonClass} group`}
            >
              <span>
                {isLoading ? "Updating Password..." : "Reset & Save Password"}
              </span>
              {!isLoading && (
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              )}
            </button>

            <div className="pt-2 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-[14px] text-[#6B625B] hover:text-[#7A3B18] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Sign In
              </Link>
            </div>
          </form>
        </>
      ) : (
        <div className="text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#E7F6E7] text-[#2E9E3E]">
            <CheckCircle2 className="h-10 w-10" strokeWidth={2} />
          </div>
          <h2 className="mt-6 font-[family-name:var(--font-display,serif)] text-[32px] font-semibold text-[#1F140E]">
            Password Reset Complete
          </h2>
          <p className="mt-3 text-[16px] leading-7 text-[#6B625B]">
            Your password has been securely reset. Redirecting you to sign in...
          </p>

          <div className="mt-8">
            <Link href="/login" className={primaryButtonClass}>
              Sign In Now
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white text-[#1F140E] antialiased">
      {/* ───────── Left: form ───────── */}
      <div className="relative w-full lg:w-[49%] flex flex-col min-h-screen">
        {/* Brand */}
        <div className="px-6 sm:px-10 lg:px-20 pt-8">
          <Logo />
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-10">
          <React.Suspense
            fallback={
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 rounded-full border-2 border-[#703816] border-t-transparent animate-spin" />
              </div>
            }
          >
            <ResetPasswordForm />
          </React.Suspense>
        </div>

        {/* Footer */}
        <p className="pb-10 text-center text-[15px] text-[#6B625B]">
          Remember your password?{" "}
          <Link
            href="/login"
            className="font-medium text-[#1F140E] underline underline-offset-2 hover:text-[#7A3B18] transition-colors"
          >
            Sign In
          </Link>
        </p>
      </div>

      {/* ───────── Right: artwork + glass card ───────── */}
      <AuthShowcase />
    </div>
  );
}
