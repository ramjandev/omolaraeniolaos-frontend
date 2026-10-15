import * as React from "react";
import { PlanCard, PlanCardGrid, formatPlanPrice, planPriceSuffix } from "@/components/plans/PlanCard";
import { planChargeTotal, planUnitPrice, supportsAnnualBilling } from "@/lib/planPricing";
import type { Plan } from "@/store/Plan/types/planTypes";

interface SignupPlanGridProps {
  plans: Plan[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  selectedId: string | null;
  onSelect: (plan: Plan) => void;
  annual?: boolean;
  className?: string;
}

function StatusBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[32px] border border-[#F0E8DD] bg-[#FDFAF5] px-6 py-12 text-center text-[16px] text-[#6B625B]">
      {children}
    </div>
  );
}

/** Plans published by the admin for one organizer type, shown during sign up. */
export function SignupPlanGrid({
  plans,
  isLoading,
  isError,
  onRetry,
  selectedId,
  onSelect,
  annual = false,
  className,
}: SignupPlanGridProps) {
  const columns = plans.length >= 3 ? 3 : 2;

  if (isLoading) {
    return (
      <PlanCardGrid className={className}>
        {[0, 1].map((i) => (
          <div key={i} className="h-[480px] animate-pulse rounded-3xl bg-[#F3EEE6]" />
        ))}
      </PlanCardGrid>
    );
  }

  if (isError) {
    return (
      <div className={className}>
        <StatusBox>
          <p>We couldn&apos;t load the plans right now.</p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-4 rounded-xl border border-[#231713] bg-white px-5 py-2 text-[15px] font-medium text-[#231713] hover:bg-[#FAF8F4] cursor-pointer"
          >
            Try again
          </button>
        </StatusBox>
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className={className}>
        <StatusBox>
          <p className="font-medium text-[#3A2C25]">No plans are available yet.</p>
          <p className="mt-1">You can continue now and choose a plan later from your dashboard.</p>
        </StatusBox>
      </div>
    );
  }

  return (
    <PlanCardGrid columns={columns} className={className}>
      {plans.map((plan) => {
        const selected = plan.id === selectedId;
        const annualApplies = annual && supportsAnnualBilling(plan);
        return (
          <PlanCard
            key={plan.id}
            name={plan.planName}
            description={plan.description}
            price={formatPlanPrice(planUnitPrice(plan, annual))}
            priceSuffix={planPriceSuffix(plan.billingCycle)}
            priceNote={
              annualApplies ? `Billed ${formatPlanPrice(planChargeTotal(plan, true))} yearly` : undefined
            }
            features={plan.features}
            highlighted={selected}
            ctaLabel={selected ? "Selected" : "Select Plan"}
            ctaPressed={selected}
            onSelect={() => onSelect(plan)}
          />
        );
      })}
    </PlanCardGrid>
  );
}
