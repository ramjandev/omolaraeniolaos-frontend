import type { Plan } from "@/store/Plan/types/planTypes";

export const ANNUAL_DISCOUNT = 0.2;

export function supportsAnnualBilling(plan: Plan) {
  return plan.billingCycle === "Monthly" && plan.price > 0;
}

export function planUnitPrice(plan: Plan, annual: boolean) {
  return annual && supportsAnnualBilling(plan)
    ? Math.round(plan.price * (1 - ANNUAL_DISCOUNT))
    : plan.price;
}

export function planChargeTotal(plan: Plan, annual: boolean) {
  return annual && supportsAnnualBilling(plan)
    ? Math.round(plan.price * 12 * (1 - ANNUAL_DISCOUNT))
    : plan.price;
}

export function registrationBillingCycle(plan: Plan, annual: boolean) {
  return annual && supportsAnnualBilling(plan) ? "annual" : plan.billingCycle.toLowerCase();
}
