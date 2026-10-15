import type { Plan } from "@/store/Plan/types/planTypes";

/** Must stay in sync with applyBillingCycle in the backend auth service. */
export const ANNUAL_DISCOUNT = 0.2;

/** Only monthly plans can be switched to discounted annual billing. */
export function supportsAnnualBilling(plan: Plan) {
  return plan.billingCycle === "Monthly" && plan.price > 0;
}

/** Price shown on the plan card (per month when annual billing is on). */
export function planUnitPrice(plan: Plan, annual: boolean) {
  return annual && supportsAnnualBilling(plan)
    ? Math.round(plan.price * (1 - ANNUAL_DISCOUNT))
    : plan.price;
}

/** Amount charged at checkout. */
export function planChargeTotal(plan: Plan, annual: boolean) {
  return annual && supportsAnnualBilling(plan)
    ? Math.round(plan.price * 12 * (1 - ANNUAL_DISCOUNT))
    : plan.price;
}

/** billingCycle value sent with the register request. */
export function registrationBillingCycle(plan: Plan, annual: boolean) {
  return annual && supportsAnnualBilling(plan) ? "annual" : plan.billingCycle.toLowerCase();
}
