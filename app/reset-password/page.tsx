"use client";

import { AuthShowcase } from "@/components/auth/AuthShowcase";
import { Logo, inputClass } from "@/components/auth/onboarding";
import CommonButton from "@/components/common/CommonButton";
import { CommonHeader } from "@/components/shared/CommonHeader";
import { CheckCircle2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useResetPasswordMutation } from "@/store/Auth/authApi";
import { getApiErrorMessage } from "@/store/Auth/types/authTypes";
import { toast } from "react-toastify";

const newPasswordSchema = z
  .object({
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type NewPasswordFormData = z.infer<typeof newPasswordSchema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = (
    searchParams?.get("token") ||
    searchParams?.get("code") ||
    ""
  ).trim();

  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NewPasswordFormData>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: NewPasswordFormData) => {
    if (!token) {
      toast.error("This reset link is missing or invalid. Please request a new one.");
      return;
    }

    try {
      await resetPassword({
        token,
        newPassword: data.newPassword,
      }).unwrap();

      setIsSuccess(true);
      toast.success("Password updated successfully. You may now sign in.");
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (err: unknown) {
      toast.error(
        getApiErrorMessage(
          err,
          "Failed to reset password. Please request a new reset link and try again.",
        ),
      );
    }
  };

  if (!token && !isSuccess) {
    return (
      <div className="w-full max-w-[480px] text-center">
        <CommonHeader
          variant="hero"
          as="h1"
          title="Reset Link Required"
          subtitle="Open the secure link from your email to create a new password. If the link expired, request a new one."
        />
        <div className="mt-8 space-y-3">
          <CommonButton to="/forgot-password" size="lg" fullWidth>
            Request Reset Link
          </CommonButton>
          <CommonButton to="/" variant="outline" showLeftIcon fullWidth>
            Back to Sign In
          </CommonButton>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[480px]">
      {!isSuccess ? (
        <>
          <CommonHeader
            variant="hero"
            as="h1"
            title="Create New Password"
            subtitle="Choose a secure new password for your McEniesVite account."
          />

          <form onSubmit={handleSubmit(onSubmit)} className="mt-9 space-y-5">
            <div>
              <label htmlFor="newPassword" className={inputClass.label}>
                New Password <span aria-hidden="true">*</span>
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  {...register("newPassword")}
                  placeholder="Min. 8 characters"
                  className={`${inputClass.input} pr-12 ${
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
                <p className={inputClass.error}>{errors.newPassword.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className={inputClass.label}>
                Confirm New Password <span aria-hidden="true">*</span>
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  {...register("confirmPassword")}
                  placeholder="Repeat new password"
                  className={`${inputClass.input} pr-12 ${
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
                <p className={inputClass.error}>
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <CommonButton
              type="submit"
              size="lg"
              fullWidth
              showDefaultIcon={!isLoading}
              disabled={isLoading}
              isLoading={isLoading}
              loadingText="Updating Password..."
            >
              Reset & Save Password
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
            Password Reset Complete
          </h2>
          <p className="mt-3 text-[16px] leading-7 text-[#6B625B]">
            Your password has been securely reset. Redirecting you to sign in...
          </p>

          <div className="mt-8">
            <CommonButton to="/" size="lg" fullWidth>
              Sign In Now
            </CommonButton>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white text-[#1F140E] antialiased">
      <div className="relative w-full lg:w-[49%] flex flex-col min-h-screen">
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

        <p className="pb-10 text-center text-[15px] text-[#6B625B]">
          Remember your password?{" "}
          <Link
            href="/"
            className="font-medium text-[#1F140E] underline underline-offset-2 hover:text-[#7A3B18] transition-colors"
          >
            Sign In
          </Link>
        </p>
      </div>

      <AuthShowcase />
    </div>
  );
}
