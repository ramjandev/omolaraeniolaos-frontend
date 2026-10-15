import type { ApiResponse } from "@/store/Auth/types/authTypes";

export type PlanOrganizerType = "Individual" | "Agency" | "Venue";
export type PlanBillingCycle = "Per-event" | "Monthly" | "Annual";

export const PLAN_ORGANIZER_TYPES: PlanOrganizerType[] = ["Individual", "Agency", "Venue"];
export const PLAN_BILLING_CYCLES: PlanBillingCycle[] = ["Per-event", "Monthly", "Annual"];

export interface Plan {
  id: string;
  slug: string;
  planName: string;
  description: string | null;
  price: number;
  organizerType: PlanOrganizerType;
  billingCycle: PlanBillingCycle;
  features: string[];
  isArchived: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface PlanPayload {
  planName: string;
  description?: string;
  price: number;
  organizerType: PlanOrganizerType;
  billingCycle: PlanBillingCycle;
  features: string[];
  isArchived: boolean;
}

export type GetPlansResponse = ApiResponse<Plan[]>;
export type PlanResponse = ApiResponse<Plan>;
export type DeletePlanResponse = ApiResponse<{ deleted: boolean; id: string }>;
