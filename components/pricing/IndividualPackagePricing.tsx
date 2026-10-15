'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Check,
  CreditCard,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Lock,
  CheckCircle2,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

export function IndividualPackagePricing() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = React.useState<'essential' | 'celebration'>('celebration');
  const [isCheckoutOpen, setIsCheckoutOpen] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

  // Card details state
  const [cardName, setCardName] = React.useState('Omolara Eniola');
  const [cardNumber, setCardNumber] = React.useState('4012 8821 9022 3456');
  const [expiry, setExpiry] = React.useState('09/28');
  const [cvv, setCvv] = React.useState('842');

  const planDetails = {
    essential: {
      name: 'Essential Event Pass',
      price: '₦15,000',
      priceAmount: 15000,
      description: 'Perfect for intimate gatherings, dinners, birthdays, and private parties up to 100 guests.',
      features: [
        'Up to 100 Guests roster limit',
        'Standard WhatsApp & Email RSVPs',
        'Digital QR Code Check-in',
        'Basic Seating Arrangement',
        'Single Gate Scanner Device Account',
        'Standard Community Support',
      ],
    },
    celebration: {
      name: 'Grand Celebration Pass',
      price: '₦35,000',
      priceAmount: 35000,
      description: 'Best for weddings, galas, milestone birthdays, and celebrations requiring advanced protocol.',
      features: [
        'Up to 500 Guests roster limit',
        'Multichannel Reminders (WhatsApp + SMS + Email)',
        'Real-Time Live Check-in Monitor & Flagged Queue',
        'Advanced Protocol & VIP Seating Tables',
        'Unlimited Gate Staff Scanner Accounts',
        'Priority WhatsApp Concierge Support',
      ],
    },
  };

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
    }, 1500);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Top Banner / Heading matching Pricing.png */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-foreground tracking-tight">
          Tailored Single-Event Package Pricing
        </h1>
        <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
          Transparent pricing with no subscription commitments. Pick the pass that suits your event scale and guest protocol.
        </p>
      </div>

      {/* 2 Plans Cards side-by-side matching Pricing.png */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* Plan 1: Essential Event Pass */}
        <div
          onClick={() => setSelectedPlan('essential')}
          className={`rounded-3xl p-6 md:p-8 border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
            selectedPlan === 'essential'
              ? 'border-[#6E3B1C] bg-[#6E3B1C]/5 shadow-lg'
              : 'border-border bg-card hover:border-border/80 shadow-xs'
          }`}
        >
          <div className="space-y-5">
            <div className="space-y-1.5">
              <h3 className="font-serif font-bold text-lg text-foreground">
                {planDetails.essential.name}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {planDetails.essential.description}
              </p>
            </div>

            <div className="pt-2">
              <span className="text-3xl md:text-4xl font-serif font-bold text-foreground">
                {planDetails.essential.price}
              </span>
              <span className="text-xs text-muted-foreground ml-1.5 font-medium">/ event pass</span>
            </div>

            <div className="space-y-2.5 pt-3 border-t border-border/80">
              {planDetails.essential.features.map((feat, i) => (
                <div key={i} className="flex items-center gap-2.5 text-xs text-foreground/90">
                  <span className="w-4 h-4 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5" />
                  </span>
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-8">
            <Button
              type="button"
              onClick={() => {
                setSelectedPlan('essential');
                setIsCheckoutOpen(true);
              }}
              variant={selectedPlan === 'essential' ? 'default' : 'outline'}
              className={`w-full rounded-xl text-xs font-semibold h-11 ${
                selectedPlan === 'essential'
                  ? 'bg-[#6E3B1C] hover:bg-[#834621] text-white shadow-md'
                  : 'border-border hover:bg-muted'
              }`}
            >
              Select Essential Pass
            </Button>
          </div>
        </div>

        {/* Plan 2: Grand Celebration Pass (Popular) */}
        <div
          onClick={() => setSelectedPlan('celebration')}
          className={`rounded-3xl p-6 md:p-8 border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
            selectedPlan === 'celebration'
              ? 'border-[#6E3B1C] bg-[#6E3B1C]/5 shadow-xl'
              : 'border-border bg-card hover:border-border/80 shadow-xs'
          }`}
        >
          {/* Most Popular Badge */}
          <div className="absolute -top-3.5 right-6 px-3 py-1 rounded-full bg-[#6E3B1C] text-white text-[10px] font-bold tracking-wide uppercase shadow-md">
            Most Popular
          </div>

          <div className="space-y-5">
            <div className="space-y-1.5">
              <h3 className="font-serif font-bold text-lg text-foreground">
                {planDetails.celebration.name}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {planDetails.celebration.description}
              </p>
            </div>

            <div className="pt-2">
              <span className="text-3xl md:text-4xl font-serif font-bold text-[#6E3B1C]">
                {planDetails.celebration.price}
              </span>
              <span className="text-xs text-muted-foreground ml-1.5 font-medium">/ event pass</span>
            </div>

            <div className="space-y-2.5 pt-3 border-t border-border/80">
              {planDetails.celebration.features.map((feat, i) => (
                <div key={i} className="flex items-center gap-2.5 text-xs text-foreground/90 font-medium">
                  <span className="w-4 h-4 rounded-full bg-[#6E3B1C]/20 text-[#6E3B1C] flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 font-bold" />
                  </span>
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-8">
            <Button
              type="button"
              onClick={() => {
                setSelectedPlan('celebration');
                setIsCheckoutOpen(true);
              }}
              className="w-full rounded-xl text-xs font-semibold h-11 bg-[#6E3B1C] hover:bg-[#834621] text-white shadow-md"
            >
              Select Celebration Pass
            </Button>
          </div>
        </div>
      </div>

      {/* Footer Navigation Bar matching Pricing.png */}
      <div className="flex items-center justify-between pt-6 border-t border-border">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="text-xs gap-1.5 rounded-xl border-border hover:bg-muted"
        >
          <Link href="/organizer/individual/events/1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Event</span>
          </Link>
        </Button>

        <Button
          onClick={() => setIsCheckoutOpen(true)}
          className="bg-[#6E3B1C] hover:bg-[#834621] text-white text-xs gap-1.5 rounded-xl px-6 h-10 shadow-md font-semibold"
        >
          <span>Continue</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Payment Checkout Modal matching Card iNFO.png */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="sm:max-w-md p-6">
          {!isSuccess ? (
            <div className="space-y-5">
              <DialogHeader>
                <DialogTitle className="font-serif text-lg text-foreground">
                  Complete Your Setup
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Review pass details and securely activate your event operations.
                </DialogDescription>
              </DialogHeader>

              {/* Order Summary Box */}
              <div className="p-4 rounded-2xl bg-muted/50 border border-border flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-xs text-foreground">
                    {planDetails[selectedPlan].name}
                  </h4>
                  <p className="text-[11px] text-muted-foreground">Single event license</p>
                </div>
                <div className="text-right">
                  <span className="font-serif font-bold text-lg text-[#6E3B1C]">
                    {planDetails[selectedPlan].price}
                  </span>
                </div>
              </div>

              {/* Payment Details Form */}
              <form onSubmit={handlePay} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Cardholder Full Name</Label>
                  <Input
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    required
                    className="text-xs h-9 rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold">Card Number</Label>
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-mono">
                      <span>Visa</span> • <span>Mastercard</span> • <span>Verve</span>
                    </div>
                  </div>
                  <div className="relative">
                    <Input
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      required
                      className="text-xs h-9 rounded-xl pr-9 font-mono"
                    />
                    <CreditCard className="w-4 h-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Expiry Date</Label>
                    <Input
                      placeholder="MM/YY"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      required
                      className="text-xs h-9 rounded-xl font-mono text-center"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">CVV Security Code</Label>
                    <Input
                      type="password"
                      maxLength={4}
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      required
                      className="text-xs h-9 rounded-xl font-mono text-center"
                    />
                  </div>
                </div>

                {/* Security Footnote */}
                <div className="flex items-center gap-2 pt-1 text-[11px] text-muted-foreground">
                  <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Secured by 256-bit SSL encryption & PCI-DSS certified gateway.</span>
                </div>

                <DialogFooter className="pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsCheckoutOpen(false)}
                    className="text-xs rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isProcessing}
                    className="bg-[#6E3B1C] hover:bg-[#834621] text-white text-xs rounded-xl shadow-md font-semibold h-9 px-4"
                  >
                    {isProcessing ? 'Processing Payment...' : `Pay ${planDetails[selectedPlan].price} & Activate`}
                  </Button>
                </DialogFooter>
              </form>
            </div>
          ) : (
            <div className="py-6 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-serif font-bold text-lg text-foreground">
                  Event Pass Activated!
                </h3>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  Your event <strong>The Grand Royal Gala & Investiture</strong> has been upgraded with the{' '}
                  <strong>{planDetails[selectedPlan].name}</strong>.
                </p>
              </div>
              <Button
                onClick={() => {
                  setIsCheckoutOpen(false);
                  setIsSuccess(false);
                  router.push('/organizer/individual/events/1');
                }}
                className="bg-[#6E3B1C] hover:bg-[#834621] text-white text-xs rounded-xl"
              >
                Return to Event Dashboard
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
