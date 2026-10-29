'use client';

import * as React from 'react';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { PlanCard, PlanCardGrid, formatPlanPrice, planPriceSuffix } from '@/components/plans/PlanCard';
import { SegmentedTabs } from '@/components/shared/SegmentedTabs';
import { useStartPlanPayment } from '@/lib/payments/startPlanPayment';
import { ANNUAL_DISCOUNT, planChargeTotal, planUnitPrice, supportsAnnualBilling } from '@/lib/planPricing';
import { useGetIndividualBillingQuery } from '@/store/Billing/billingApi';
import { useGetPlansQuery } from '@/store/Plan/planApi';
import type { Plan } from '@/store/Plan/types/planTypes';
import { toast } from 'react-toastify';

type BillingCycle = 'monthly' | 'annual';

export function AgencyPricingPlans() {
  const {
    data: plansResponse,
    isLoading,
    isError,
    refetch,
  } = useGetPlansQuery('Agency');
  const { data: billingResponse, refetch: refetchBilling } = useGetIndividualBillingQuery();
  const { startPlanPayment, isStartingPayment } = useStartPlanPayment();

  const plans = plansResponse?.data ?? [];
  const activePlanId = billingResponse?.data?.plan?.isPaid
    ? billingResponse.data.plan.planId
    : null;

  const hasMonthly = plans.some((plan) => plan.billingCycle === 'Monthly');
  const hasAnnualPlans = plans.some((plan) => plan.billingCycle === 'Annual');
  const canDiscountMonthly = plans.some(supportsAnnualBilling);

  const [billingCycle, setBillingCycle] = React.useState<BillingCycle>('monthly');
  const [selectedPlan, setSelectedPlan] = React.useState<Plan | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [activatedName, setActivatedName] = React.useState('');

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paid =
      params.get('payment_success') === 'true' ||
      params.get('status') === 'successful';
    if (!paid) return;
    setIsSuccess(true);
    void refetchBilling();
  }, [refetchBilling]);

  const useCatalogAnnual = hasMonthly && hasAnnualPlans;
  const applyAnnualDiscount = billingCycle === 'annual' && !useCatalogAnnual && canDiscountMonthly;
  const showCycleToggle = useCatalogAnnual || canDiscountMonthly;

  const visiblePlans = React.useMemo(() => {
    if (!useCatalogAnnual) return plans;
    return plans.filter((plan) =>
      billingCycle === 'annual' ? plan.billingCycle === 'Annual' : plan.billingCycle !== 'Annual',
    );
  }, [billingCycle, plans, useCatalogAnnual]);

  const chargeFor = (plan: Plan) => planChargeTotal(plan, applyAnnualDiscount && supportsAnnualBilling(plan));

  const openCheckout = (plan: Plan) => {
    if (plan.id === activePlanId && !applyAnnualDiscount) return;
    setSelectedPlan(plan);
    setIsCheckoutOpen(true);
  };

  const pay = async () => {
    if (!selectedPlan) return;
    const annual = applyAnnualDiscount && supportsAnnualBilling(selectedPlan);
    try {
      const redirectUrl = new URL(
        '/organizer/agency/pricing?payment_success=true',
        window.location.origin,
      ).toString();
      const result = await startPlanPayment(
        selectedPlan.id,
        redirectUrl,
        annual ? 'annual' : undefined,
      );
      if (result.redirected) return;
      setActivatedName(selectedPlan.planName);
      setIsCheckoutOpen(false);
      setIsSuccess(true);
      await refetchBilling();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not start plan payment.');
    }
  };

  const priceLabel = selectedPlan ? formatPlanPrice(chargeFor(selectedPlan)) : '';

  return (
    <div className="mx-auto max-w-5xl space-y-10 py-2">
      <div className="mx-auto max-w-2xl space-y-3 text-center">
        <h1 className="font-serif text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Choose A Plan That Fits Your Agency
        </h1>
        <p className="text-xs leading-relaxed text-muted-foreground md:text-sm">
          Simple transparent pricing. Upgrade or downgrade anytime as your team grows.
        </p>

        {showCycleToggle && (
          <div className="flex justify-center pt-2">
            <SegmentedTabs
              ariaLabel="Billing cycle"
              value={billingCycle}
              onChange={setBillingCycle}
              options={[
                { value: 'monthly', label: 'Monthly Billing' },
                {
                  value: 'annual',
                  label: (
                    <>
                      Annual Billing
                      <span className="rounded-full bg-[#7A3B18] px-1.5 text-[10px] font-bold text-white">
                        Save {ANNUAL_DISCOUNT * 100}%
                      </span>
                    </>
                  ),
                },
              ]}
            />
          </div>
        )}
      </div>

      {isLoading && (
        <PlanCardGrid columns={3}>
          {[0, 1, 2].map((item) => (
            <div key={item} className="h-[480px] animate-pulse rounded-3xl bg-[#F3EEE6]" />
          ))}
        </PlanCardGrid>
      )}

      {isError && (
        <div className="rounded-[32px] border border-[#F0E8DD] bg-[#FDFAF5] px-6 py-12 text-center">
          <p className="text-[#6B625B]">We couldn&apos;t load the agency plans.</p>
          <Button type="button" variant="outline" className="mt-4 rounded-xl" onClick={() => void refetch()}>
            Try again
          </Button>
        </div>
      )}

      {!isLoading && !isError && visiblePlans.length === 0 && (
        <div className="rounded-[32px] border border-[#F0E8DD] bg-[#FDFAF5] px-6 py-12 text-center text-[#6B625B]">
          No agency plans are available yet.
        </div>
      )}

      {!isLoading && !isError && visiblePlans.length > 0 && (
        <PlanCardGrid columns={visiblePlans.length >= 3 ? 3 : 2}>
          {visiblePlans.map((plan) => {
            const annualApplies = applyAnnualDiscount && supportsAnnualBilling(plan);
            const isCurrent = plan.id === activePlanId && !annualApplies;
            return (
              <PlanCard
                key={plan.id}
                name={plan.planName}
                description={plan.description}
                price={formatPlanPrice(planUnitPrice(plan, annualApplies))}
                priceSuffix={annualApplies ? '/monthly' : planPriceSuffix(plan.billingCycle)}
                priceNote={
                  annualApplies
                    ? `Billed ${formatPlanPrice(planChargeTotal(plan, true))} yearly`
                    : undefined
                }
                features={plan.features}
                highlighted={isCurrent || selectedPlan?.id === plan.id}
                badge={
                  isCurrent ? (
                    <span className="rounded-full bg-[#7A3B18] px-2 py-0.5 text-[11px] font-bold text-white">
                      Current plan
                    </span>
                  ) : undefined
                }
                ctaLabel={isCurrent ? 'Current plan' : 'Select Plan'}
                ctaDisabled={isCurrent}
                onSelect={() => openCheckout(plan)}
              />
            );
          })}
        </PlanCardGrid>
      )}

      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="space-y-5 rounded-3xl p-6 sm:max-w-md md:p-8">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl font-bold text-foreground">
              Complete Payment
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Review your package, then continue to payment.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2.5 rounded-2xl border border-[#D4A373]/30 bg-[#FDF9F4] p-4 text-xs dark:bg-[#261710]/40">
            <div className="flex justify-between text-muted-foreground">
              <span>Selected Package:</span>
              <span className="font-bold text-foreground">{selectedPlan?.planName}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Billing:</span>
              <span className="font-semibold text-foreground">
                {applyAnnualDiscount && selectedPlan && supportsAnnualBilling(selectedPlan)
                  ? 'Annual'
                  : selectedPlan?.billingCycle}
              </span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Platform &amp; Gate Service:</span>
              <span className="font-semibold text-emerald-600">Included</span>
            </div>
            <div className="flex justify-between border-t border-[#D4A373]/30 pt-2 text-sm font-bold text-foreground">
              <span>Total Amount:</span>
              <span className="text-base text-[#6E3B1C]">{priceLabel}</span>
            </div>
          </div>

          <Button
            type="button"
            disabled={isStartingPayment || !selectedPlan}
            onClick={() => void pay()}
            className="h-11 w-full rounded-xl bg-[#6E3B1C] text-xs font-semibold text-white shadow-xs hover:bg-[#5C3117]"
          >
            {isStartingPayment ? 'Starting payment...' : `Pay ${priceLabel} & Activate`}
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog open={isSuccess} onOpenChange={setIsSuccess}>
        <DialogContent className="space-y-4 rounded-3xl p-6 text-center sm:max-w-md md:p-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <div className="space-y-1.5">
            <DialogTitle className="font-serif text-xl font-bold text-foreground md:text-2xl">
              Your Agency Plan Is Active
            </DialogTitle>
            <DialogDescription className="text-xs leading-relaxed text-muted-foreground md:text-sm">
              {activatedName
                ? `"${activatedName}" has been activated. You can invite team members and manage client events.`
                : 'Your payment was received. You can invite team members and manage client events.'}
            </DialogDescription>
          </div>
          <div className="flex flex-col gap-2.5 pt-4">
            <Button asChild className="h-11 w-full rounded-xl bg-[#6E3B1C] text-xs font-semibold text-white hover:bg-[#5C3117]">
              <Link href="/organizer/agency">Go to Agency Dashboard</Link>
            </Button>
            <Button asChild variant="outline" className="h-11 w-full rounded-xl text-xs font-semibold">
              <Link href="/organizer/agency/clients">View Client Accounts</Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
