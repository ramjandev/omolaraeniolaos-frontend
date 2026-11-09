"use client";

import { AuthShowcase } from "@/components/auth/AuthShowcase";
import { Logo, inputClass } from "@/components/auth/onboarding";
import { CommonHeader } from "@/components/shared/CommonHeader";
import { UserRole } from "@/types/roles";
import { Eye, EyeOff } from "lucide-react";
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
import CommonButton from "../common/CommonButton";
 import { useState } from "react";
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

export { inputClass };

export function UniversalSignIn() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [loginUser, { isLoading: isApiLoading }] = useLoginUserMutation();

  const [showPassword, setShowPassword] =useState(false);
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

  const onSubmit = async (data: LoginFormData) => {

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
      const apiError = error as {
        data?: { message?: string };
        message?: string;
      };
      toast.error(
        apiError.data?.message ||
          apiError.message ||
          "Invalid email or password.",
      );
    } finally {
    }
  };


  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white text-[#1F140E] antialiased">
      <div className="relative w-full lg:w-[49%] flex flex-col min-h-screen ">
        <div className="px-6 sm:px-10 lg:px-20 pt-8">
          <Logo />
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-[430px]">
            <CommonHeader
              title="Welcome Back"
              subtitle="Manage your events, guests, invitations, and event-day experience all in one place."
              subtitleClassName="max-w-[380px]"
            />

            <form onSubmit={handleSubmit(onSubmit)} className="mt-10 space-y-5">
              <div>
                <label htmlFor="email" className={inputClass.label}>
                  Email <span aria-hidden="true">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...register("email")}
                  placeholder="Enter your email address"
                  className={inputClass.input}
                />
                {errors.email && (
                  <p className={inputClass.error}>{errors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className={inputClass.label}>
                  Password <span aria-hidden="true">*</span>
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    {...register("password")}
                    placeholder="Enter your Password"
                    className={`pr-12 ${inputClass.input}`}
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
                  <p className={inputClass.error}>{errors.password.message}</p>
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

              <CommonButton
                type="submit"
                className="w-full!"
                isLoading={isApiLoading}
                size="lg"
                loadingText="Signing in..."
              >
                Login In
              </CommonButton>
            </form>
          </div>
        </div>

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

      <AuthShowcase />
    </div>
  );
}
