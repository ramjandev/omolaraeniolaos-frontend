"use client";

import { AuthShowcase } from "@/components/auth/AuthShowcase";
import { Logo, inputClass } from "@/components/auth/onboarding";
import CommonButton from "@/components/common/CommonButton";
import { CommonHeader } from "@/components/shared/CommonHeader";
import { CheckCircle2, Mail } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  forgotPasswordSchema,
  ForgotPasswordFormData,
} from "@/lib/validations/authSchemas";
import { useForgotPasswordMutation } from "@/store/Auth/authApi";
import { toast } from "react-toastify";

function ForgotPasswordPage() {
  const searchParams = useSearchParams();
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const [submittedEmail, setSubmittedEmail] = React.useState<string | null>(
    null,
  );

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  React.useEffect(() => {
    const email = searchParams.get("email");
    if (email) setValue("email", email);
  }, [searchParams, setValue]);

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await forgotPassword({ email: data.email.trim() }).unwrap();
      setSubmittedEmail(data.email.trim());
      toast.success("If an account exists, password reset instructions have been sent.");
    } catch {
      setSubmittedEmail(data.email.trim());
      toast.info(
        "If an account with that email exists, reset instructions have been sent.",
      );
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white text-[#1F140E] antialiased">
      <div className="relative w-full lg:w-[49%] flex flex-col min-h-screen">
        <div className="px-6 sm:px-10 lg:px-20 pt-8">
          <Logo />
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-[480px]">
            {!submittedEmail ? (
              <>
                <CommonHeader
                  variant="hero"
                  as="h1"
                  title="Forgot Password?"
                  subtitle="Enter the email address tied to your McEniesVite account. We will send you a secure link to reset your password."
                />

                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="mt-9 space-y-5"
                >
                  <div>
                    <label htmlFor="email" className={inputClass.label}>
                      Email Address <span aria-hidden="true">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        {...register("email")}
                        placeholder="e.g. folashade@mceniesfete.com"
                        className={`${inputClass.input} pl-11 ${
                          errors.email
                            ? "border-red-500 focus:border-red-500"
                            : ""
                        }`}
                      />
                      <Mail
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-[#8C7A6B]"
                        strokeWidth={1.7}
                      />
                    </div>
                    {errors.email && (
                      <p className={inputClass.error}>{errors.email.message}</p>
                    )}
                  </div>

                  <CommonButton
                    type="submit"
                    size="lg"
                    fullWidth
                    showDefaultIcon={!isLoading}
                    disabled={isLoading}
                    isLoading={isLoading}
                    loadingText="Sending Instructions..."
                  >
                    Send Reset Link
                  </CommonButton>

                  <div className="pt-2 text-center">
                    <CommonButton to="/" variant="outline" showLeftIcon>
                      Back to Sign In
                    </CommonButton>
                  </div>
                </form>
              </>
            ) : (
              <div className="text-center">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#E7F6E7] text-[#2E9E3E]">
                  <CheckCircle2 className="h-10 w-10" strokeWidth={2} />
                </div>
                <h2 className="mt-6 font-serif text-[32px] font-semibold text-[#1F140E]">
                  Check Your Email
                </h2>
                <p className="mt-3 text-[16px] leading-7 text-[#6B625B]">
                  We sent reset instructions to{" "}
                  <strong className="text-[#1F140E]">{submittedEmail}</strong>.
                  Open the link in the email to create a new password. Check spam
                  if you do not see it within a few minutes.
                </p>

                <div className="mt-8">
                  <CommonButton to="/" size="lg" fullWidth>
                    Back to Sign In
                  </CommonButton>
                </div>
              </div>
            )}
          </div>
        </div>

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

      <AuthShowcase />
    </div>
  );
}

export default function ForgotPasswordRoute() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-white" />}>
      <ForgotPasswordPage />
    </React.Suspense>
  );
}
