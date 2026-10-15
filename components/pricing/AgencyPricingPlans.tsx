'use client';

import * as React from 'react';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { PlanCard, PlanCardGrid } from '@/components/plans/PlanCard';
import { SegmentedTabs } from '@/components/shared/SegmentedTabs';

export function AgencyPricingPlans() {
  const [billingCycle, setBillingCycle] = React.useState<'monthly' | 'annual'>('monthly');
  const [selectedPlan, setSelectedPlan] = React.useState<'solo' | 'pro' | 'enterprise'>('pro');
  const [isCheckoutOpen, setIsCheckoutOpen] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

  // Card details state matching Card iNFO.png
  const [cardNumber, setCardNumber] = React.useState('4012 8821 9022 3456');
  const [expiry, setExpiry] = React.useState('09/28');
  const [cvv, setCvv] = React.useState('842');
  const [cardholder, setCardholder] = React.useState('Folashade Adeyemi');

  const plans = {
    solo: {
      id: 'solo',
      name: 'Solo Planner',
      price: billingCycle === 'monthly' ? '₦25,000' : '₦20,000',
      period: '/month',
      description: 'Ideal for independent event consultants managing boutique clients.',
      features: [
        'Up to 5 active events simultaneously',
        '1 Admin producer user account',
        'Basic guest & client management portal',
        'Standard agency branding',
        'Digital QR code check-in & gate scanner',
        'Exportable guest lists (CSV/Excel)',
      ],
      amount: billingCycle === 'monthly' ? 25000 : 240000,
    },
    pro: {
      id: 'pro',
      name: 'Agency Pro',
      price: billingCycle === 'monthly' ? '₦75,000' : '₦60,000',
      period: '/month',
      description: 'Best for growing production agencies managing multiple concurrent client accounts.',
      badge: 'Most Popular',
      features: [
        'Unlimited active events',
        'Up to 15 team & producer member seats',
        'White-label client portals with custom domain',
        'Vendor contract & payout tracking tools',
        'Unlimited gate scanners with live multi-device sync',
        'Advanced VIP protocol & table seating allocations',
        'Priority WhatsApp concierge & 24/7 phone SLA',
      ],
      amount: billingCycle === 'monthly' ? 75000 : 720000,
    },
    enterprise: {
      id: 'enterprise',
      name: 'Enterprise',
      price: billingCycle === 'monthly' ? '₦180,000' : '₦144,000',
      period: '/month',
      description: 'For high-volume production agencies requiring custom scale and dedicated support.',
      features: [
        'Unlimited team members & sub-agencies',
        'Dedicated account manager & on-site technical support',
        'Developer API access & webhook integrations',
        'Custom SLAs with 99.9% uptime guarantee',
        'Dedicated server instance & security compliance',
        'Custom client contracts & bespoke invoicing workflows',
      ],
      amount: billingCycle === 'monthly' ? 180000 : 1728000,
    },
  };

  const currentPlan = plans[selectedPlan];

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
    }, 1200);
  };

  return (
    <div className="space-y-10 max-w-5xl mx-auto py-2">
      {/* Header matching pricing.png */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-foreground tracking-tight">
          Choose A Plan That Fits Your Agency
        </h1>
        <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
          Simple transparent pricing. Upgrade or downgrade anytime as your team grows.
        </p>

        {/* Monthly vs Annual Toggle */}
        <div className="pt-2 flex justify-center">
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
                      Save 20%
                    </span>
                  </>
                ),
              },
            ]}
          />
        </div>
      </div>

      <PlanCardGrid columns={3}>
        {(Object.keys(plans) as (keyof typeof plans)[]).map((key) => {
          const plan = plans[key];
          return (
            <PlanCard
              key={key}
              name={plan.name}
              description={plan.description}
              price={plan.price}
              priceSuffix="/monthly"
              priceNote={billingCycle === 'annual' ? 'Billed yearly' : undefined}
              features={plan.features}
              highlighted={selectedPlan === key}
              badge={
                key === 'pro' ? (
                  <span className="rounded-full bg-[#7A3B18] px-2 py-0.5 text-[11px] font-bold text-white">
                    Most Popular
                  </span>
                ) : undefined
              }
              onSelect={() => {
                setSelectedPlan(key);
                setIsCheckoutOpen(true);
              }}
            />
          );
        })}
      </PlanCardGrid>

      {/* Checkout Modal matching card.png & Card iNFO.png */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6 md:p-8 space-y-5">
          <DialogHeader>
            <DialogTitle className="font-serif font-bold text-xl text-foreground">
              Complete Payment
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Review your package summary and enter payment credentials.
            </DialogDescription>
          </DialogHeader>

          {/* Order Summary matching card.png */}
          <div className="p-4 rounded-2xl bg-[#FDF9F4] dark:bg-[#261710]/40 border border-[#D4A373]/30 space-y-2.5 text-xs">
            <div className="flex justify-between text-muted-foreground">
              <span>Selected Package:</span>
              <span className="font-bold text-foreground">{currentPlan.name}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Platform &amp; Gate Service:</span>
              <span className="font-semibold text-emerald-600">Included</span>
            </div>
            <div className="pt-2 border-t border-[#D4A373]/30 flex justify-between text-sm font-bold text-foreground">
              <span>Total Amount:</span>
              <span className="text-[#6E3B1C] text-base">{currentPlan.price}</span>
            </div>
          </div>

          {/* Payment Details Form matching Card iNFO.png */}
          <form onSubmit={handlePay} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Enter Card Number *</Label>
              <Input
                required
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="4012 8821 9022 3456"
                className="h-10 text-xs rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Expiry Date *</Label>
                <Input
                  required
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  placeholder="MM/YY"
                  className="h-10 text-xs rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">CVV/CVC *</Label>
                <Input
                  required
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  placeholder="842"
                  className="h-10 text-xs rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Cardholder Name</Label>
              <Input
                value={cardholder}
                onChange={(e) => setCardholder(e.target.value)}
                placeholder="Folashade Adeyemi"
                className="h-10 text-xs rounded-xl"
              />
            </div>

            <div className="pt-3">
              <Button
                type="submit"
                disabled={isProcessing}
                className="w-full h-11 text-xs font-semibold rounded-xl bg-[#6E3B1C] hover:bg-[#5C3117] text-white shadow-xs"
              >
                {isProcessing
                  ? 'Processing Payment...'
                  : `Pay ${currentPlan.price} & Activate`}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Success Modal matching success.png */}
      <Dialog open={isSuccess} onOpenChange={setIsSuccess}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6 md:p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-1.5">
            <DialogTitle className="font-serif font-bold text-xl md:text-2xl text-foreground">
              Your Agency Plan Is Active 🎉
            </DialogTitle>
            <DialogDescription className="text-xs md:text-sm text-muted-foreground leading-relaxed">
              &quot;{currentPlan.name}&quot; has been activated successfully. You are now ready to invite team members and manage client events.
            </DialogDescription>
          </div>

          <div className="pt-4 flex flex-col gap-2.5">
            <Button
              asChild
              className="w-full h-11 text-xs font-semibold rounded-xl bg-[#6E3B1C] hover:bg-[#5C3117] text-white shadow-xs"
            >
              <Link href="/organizer/agency">
                Go to Agency Dashboard
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="w-full h-11 text-xs font-semibold rounded-xl border-border/80 hover:bg-muted"
            >
              <Link href="/organizer/agency/clients">
                View Client Accounts
              </Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
