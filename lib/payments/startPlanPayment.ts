import { getApiErrorMessage } from "@/store/Auth/types/authTypes";
import { usePayPlanMutation } from "@/store/Auth/authApi";

export interface PlanCheckoutResult {
  isFreePlan?: boolean;
  checkoutUrl?: string | null;
  txRef?: string | null;
  status?: string;
}

export function readCheckoutUrl(data: unknown): string | null {
  if (!data || typeof data !== "object" || !("checkoutUrl" in data)) return null;
  const url = (data as { checkoutUrl?: unknown }).checkoutUrl;
  return typeof url === "string" && url.length > 0 ? url : null;
}

export function useStartPlanPayment() {
  const [payPlan, { isLoading }] = usePayPlanMutation();

  const startPlanPayment = async (planId: string, redirectUrl: string) => {
    try {
      const result = await payPlan({ planId, redirectUrl }).unwrap();
      const checkoutUrl = readCheckoutUrl(result.data);
      if (checkoutUrl) {
        window.location.assign(checkoutUrl);
        return { redirected: true as const };
      }
      return { redirected: false as const, data: result.data as PlanCheckoutResult };
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Could not start plan payment."));
    }
  };

  return { startPlanPayment, isStartingPayment: isLoading };
}
