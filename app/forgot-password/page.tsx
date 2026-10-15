"use client";

import { AuthShowcase } from "@/components/auth/AuthShowcase";
import { Logo } from "@/components/auth/onboarding-ui";
import { ArrowLeft, ArrowRight, CheckCircle2, Mail } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  forgotPasswordSchema,
  ForgotPasswordFormData,
} from "@/lib/validations/authSchemas";
import { useForgotPasswordMutation } from "@/store/Auth/authApi";
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

export default function ForgotPasswordPage() {
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const [submittedEmail, setSubmittedEmail] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await forgotPassword({ email: data.email }).unwrap();
      setSubmittedEmail(data.email);
      toast.success("Password reset instructions have been dispatched.");
    } catch (err: any) {
      // Even if backend fails or email not found, gracefully notify the user per standard security practices
      const msg =
        err?.data?.message ||
        "If an account with that email exists, reset instructions have been sent.";
      setSubmittedEmail(data.email);
      toast.info(msg);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white text-[#1F140E] antialiased">
      {/* ───────── Left: form ───────── */}
      <div className="relative w-full lg:w-[49%] flex flex-col min-h-screen">
        {/* Brand */}
        <div className="px-6 sm:px-10 lg:px-20 pt-8">
          <Logo />
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-[480px]">
            {!submittedEmail ? (
              <>
                <div className="text-center">
                  <h1 className="font-[family-name:var(--font-display,serif)] text-[36px] sm:text-[44px] font-semibold leading-[1.15] tracking-tight text-[#1F140E]">
                    Forgot Password?
                  </h1>
                  <p className="mt-3 text-base sm:text-[17px] leading-7 text-[#6B625B]">
                    Enter the email address tied to your McEniesVite organizer account.
                    We will send you a secure link to reset your credentials.
                  </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="mt-9 space-y-5">
                  <div>
                    <label htmlFor="email" className={labelClass}>
                      Email Address <span aria-hidden="true">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        {...register("email")}
                        placeholder="e.g. folashade@mceniesfete.com"
                        className={`${fieldClass} pl-11 ${
                          errors.email ? "border-red-500 focus:border-red-500" : ""
                        }`}
                      />
                      <Mail
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-[#8C7A6B]"
                        strokeWidth={1.7}
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1.5 text-xs text-red-600 font-medium">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`${primaryButtonClass} group`}
                  >
                    <span>{isLoading ? "Sending Instructions..." : "Send Reset Link"}</span>
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
                  Instructions Sent
                </h2>
                <p className="mt-3 text-[16px] leading-7 text-[#6B625B]">
                  We sent instructions to{" "}
                  <strong className="text-[#1F140E]">{submittedEmail}</strong>. If an
                  account exists under this address, check your spam or inbox folders.
                </p>

                <div className="mt-8 space-y-3">
                  <Link
                    href={`/reset-password?email=${encodeURIComponent(submittedEmail)}`}
                    className={primaryButtonClass}
                  >
                    Enter Reset Token / Code
                  </Link>

                  <Link
                    href="/login"
                    className="inline-flex w-full h-[52px] items-center justify-center rounded-xl border border-[#E8E2D8] bg-white text-[#1F140E] text-base font-medium hover:bg-[#FAF8F4] transition-colors"
                  >
                    Back to Log In
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="pb-10 text-center text-[15px] text-[#6B625B]">
          Need immediate support?{" "}
          <Link
            href="/contact"
            className="font-medium text-[#1F140E] underline underline-offset-2 hover:text-[#7A3B18] transition-colors"
          >
            Contact Event Support
          </Link>
        </p>
      </div>

      {/* ───────── Right: artwork + glass card ───────── */}
      <AuthShowcase />
    </div>
  );
}
