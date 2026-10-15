"use client";

import { Button } from "@/components/ui/button";
import {
  formatPlanPrice,
  PlanCard,
  PlanCardGrid,
  planPriceSuffix,
} from "@/components/plans/PlanCard";
import { useStartPlanPayment } from "@/lib/payments/startPlanPayment";
import { useGetPlansQuery } from "@/store/Plan/planApi";
import type { Plan, PlanOrganizerType } from "@/store/Plan/types/planTypes";
import { ArrowLeft, Building, CreditCard } from "lucide-react";
import * as React from "react";
import { toast } from "react-toastify";

interface PlanPaymentFlowProps {
  organizerType?: PlanOrganizerType;
  notice?: string;
  redirectPath: string;
  onBack: () => void;
  onPaid: () => Promise<void>;
  paySuffix?: string;
}

export function PlanPaymentFlow({
  organizerType = "Individual",
  notice,
  redirectPath,
  onBack,
  onPaid,
  paySuffix = "Create Event",
}: PlanPaymentFlowProps) {
  const { data: plansResponse, isLoading, isError, refetch } = useGetPlansQuery(organizerType);
  const { startPlanPayment, isStartingPayment } = useStartPlanPayment();
  const plans = plansResponse?.data ?? [];
  const [selectedPlan, setSelectedPlan] = React.useState<Plan | null>(null);
  const [method, setMethod] = React.useState<"card" | "transfer">("card");
  const [isFinishing, setIsFinishing] = React.useState(false);
  const returnStarted = React.useRef(false);

  const busy = isStartingPayment || isFinishing;
  const onPaidRef = React.useRef(onPaid);
  onPaidRef.current = onPaid;

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("status") !== "successful" || returnStarted.current) return;
    const tx = params.get("tx_ref") || params.get("transaction_id") || "return";
    const key = `plan-payment-done:${tx}`;
    if (sessionStorage.getItem(key)) return;
    returnStarted.current = true;
    setIsFinishing(true);
    void onPaidRef.current()
      .then(() => sessionStorage.setItem(key, "1"))
      .catch(() => {
        returnStarted.current = false;
      })
      .finally(() => setIsFinishing(false));
  }, []);

  const pay = async () => {
    if (!selectedPlan) return;
    setIsFinishing(true);
    try {
      const redirectUrl = new URL(redirectPath, window.location.origin).toString();
      const result = await startPlanPayment(selectedPlan.id, redirectUrl);
      if (!result.redirected) await onPaid();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not start plan payment.");
    } finally {
      setIsFinishing(false);
    }
  };

  if (!selectedPlan) {
    return (
      <section className="space-y-6">
        <div>
          <h2 className="font-serif text-3xl font-normal tracking-tight text-[#1F140E] dark:text-foreground">
            Tailored Single-Event Package Pricing
          </h2>
          <p className="mt-1 text-sm text-[#6F6761] dark:text-muted-foreground">
            Whether you&apos;re starting small or scaling fast, we have an automation plan that fits.
          </p>
        </div>

        <PlanCardGrid>
          {isLoading && <p className="text-sm text-[#6F6761]">Loading plans…</p>}
          {isError && (
            <div className="space-y-3">
              <p className="text-sm text-[#6F6761]">We couldn&apos;t load the plans.</p>
              <Button type="button" variant="outline" onClick={() => void refetch()}>
                Try again
              </Button>
            </div>
          )}
          {!isLoading && !isError && plans.length === 0 && (
            <p className="text-sm text-[#6F6761]">No plans are available yet.</p>
          )}
          {plans.map((plan, index) => (
            <PlanCard
              key={plan.id}
              name={plan.planName}
              description={plan.description}
              price={formatPlanPrice(plan.price)}
              priceSuffix={planPriceSuffix(plan.billingCycle)}
              features={plan.features}
              highlighted={plans.length === 1 || index === plans.length - 1}
              ctaLabel="Select Plan"
              onSelect={() => setSelectedPlan(plan)}
            />
          ))}
        </PlanCardGrid>

        <div className="border-t border-[#EBE3D9] pt-4 dark:border-border">
          <Button type="button" variant="outline" onClick={onBack} className="rounded-xl">
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Back
          </Button>
        </div>
      </section>
    );
  }

  const priceLabel = formatPlanPrice(selectedPlan.price);
  const payLabel =
    selectedPlan.price > 0 ? `Pay ${priceLabel} & ${paySuffix}` : paySuffix;

  return (
    <section className="space-y-6">
      <div>
        <h2 className="font-serif text-3xl font-normal tracking-tight text-[#1F140E] dark:text-foreground">
          Complete Your Setup
        </h2>
        <p className="mt-1 text-sm text-[#6F6761] dark:text-muted-foreground">
          Select a package to activate your event and start inviting.
        </p>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-5">
          <div className="space-y-4 rounded-3xl border border-[#EBE3D9] bg-[#FAF8F5] p-6 dark:border-border dark:bg-card/60">
            <h3 className="text-base font-medium text-[#1F140E] dark:text-foreground">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span>{selectedPlan.planName}</span>
                <span className="font-semibold">{priceLabel}</span>
              </div>
              <div className="flex items-center justify-between text-[#6F6761]">
                <span>Platform Fee</span>
                <span>Included</span>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-[#EBE3D9] pt-3 text-base font-semibold dark:border-border">
              <span>Total</span>
              <span className="text-[#6E3B1C]">{priceLabel}</span>
            </div>
          </div>
          {notice && (
            <div className="rounded-2xl border border-[#F5D5C6] bg-[#FCEDE6] px-4 py-3 text-center text-sm text-[#6E3B1C]">
              {notice}
            </div>
          )}
        </div>

        <div className="space-y-4 rounded-3xl border border-[#EBE3D9] bg-white p-6 dark:border-border dark:bg-card lg:col-span-7">
          <h3 className="text-base font-medium text-[#1F140E] dark:text-foreground">Payment Method</h3>
          <button
            type="button"
            onClick={() => setMethod("card")}
            className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left ${
              method === "card"
                ? "border-[#E7C7B4] bg-[#FDF5EE]"
                : "border-[#EBE3D9] bg-white dark:bg-card"
            }`}
          >
            <span className="flex items-center gap-3 text-sm font-medium">
              <span className="grid h-4 w-4 place-items-center rounded-full border-2 border-[#6E3B1C]">
                {method === "card" && <span className="h-2 w-2 rounded-full bg-[#6E3B1C]" />}
              </span>
              Credit / Debit Card
            </span>
            <CreditCard className="h-5 w-5 text-[#8C7A6B]" />
          </button>
          <button
            type="button"
            onClick={() => setMethod("transfer")}
            className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left ${
              method === "transfer"
                ? "border-[#E7C7B4] bg-[#FDF5EE]"
                : "border-[#EBE3D9] bg-white dark:bg-card"
            }`}
          >
            <span className="flex items-center gap-3 text-sm">
              <span className="grid h-4 w-4 place-items-center rounded-full border border-[#CFC7BD]">
                {method === "transfer" && <span className="h-2 w-2 rounded-full bg-[#6E3B1C]" />}
              </span>
              Bank Transfer
            </span>
            <Building className="h-5 w-5 text-[#8C7A6B]" />
          </button>
          <Button
            type="button"
            disabled={busy}
            onClick={() => void pay()}
            className="h-12 w-full rounded-2xl bg-[#241710] text-sm font-semibold text-white hover:bg-[#38261C]"
          >
            {busy ? "Starting payment…" : payLabel}
          </Button>
        </div>
      </div>

      <div className="border-t border-[#EBE3D9] pt-4 dark:border-border">
        <Button
          type="button"
          variant="outline"
          disabled={busy}
          onClick={() => setSelectedPlan(null)}
          className="rounded-xl"
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back
        </Button>
      </div>
    </section>
  );
}
