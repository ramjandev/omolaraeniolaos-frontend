import * as z from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const individualAccountDetailsSchema = z
  .object({
    fullName: z
      .string()
      .min(2, "Full name must be at least 2 characters"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),
    countryCode: z.string().min(1, "Country code is required"),
    phoneNumber: z
      .string()
      .min(7, "Phone number must be at least 7 digits"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters"),
    confirmPassword: z
      .string()
      .min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type IndividualAccountDetailsFormData = z.infer<
  typeof individualAccountDetailsSchema
>;

export const individualEventSetupSchema = z.object({
  eventName: z
    .string()
    .min(2, "Event name must be at least 2 characters"),
  eventType: z
    .string()
    .min(1, "Please select an event type"),
  eventDate: z
    .string()
    .min(1, "Please pick an event date"),
  expectedGuests: z
    .union([z.string(), z.number()])
    .optional(),
  startTime: z
    .string()
    .min(1, "Start time is required"),
  endTime: z.string().optional(),
  venueLocation: z
    .string()
    .min(2, "Venue location is required"),
});

export type IndividualEventSetupFormData = z.infer<
  typeof individualEventSetupSchema
>;

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Reset code or token is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
