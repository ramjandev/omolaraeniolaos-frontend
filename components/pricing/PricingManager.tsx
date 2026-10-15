'use client';

import * as React from 'react';
import {
  CreditCard,
  Plus,
  Trash2,
  Check,
  Building,
  Sparkles,
  DollarSign,
  ShieldCheck,
} from 'lucide-react';
import { TicketTier } from '@/types/events';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface PricingManagerProps {
  initialTiers: TicketTier[];
}

export function PricingManager({ initialTiers }: PricingManagerProps) {
  const [tiers, setTiers] = React.useState<TicketTier[]>(initialTiers);
  const [isSaved, setIsSaved] = React.useState(false);

  const handleAddTier = () => {
    const newTier: TicketTier = {
      id: `tt-${Date.now()}`,
      name: 'General Admission Tier',
      type: 'general',
      price: 65,
      currency: '$',
      capacity: 200,
      soldCount: 0,
      availableCount: 200,
      description: 'Standard event access',
      perks: ['Full 2-Day Access', 'Welcome Coffee'],
    };
    setTiers([...tiers, newTier]);
  };

  const handleRemove = (id: string) => {
    setTiers(tiers.filter((t) => t.id !== id));
  };

  const handleUpdate = <K extends keyof TicketTier>(id: string, field: K, value: TicketTier[K]) => {
    setTiers(
      tiers.map((t) => (t.id === id ? { ...t, [field]: value } : t))
    );
  };

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-8">
      {/* Top Save Confirmation */}
      {isSaved && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 flex items-center gap-2 text-xs">
          <Check className="w-4 h-4 text-emerald-600" />
          <span><strong>Ticket tiers successfully updated!</strong> Live event pages reflect new prices.</span>
        </div>
      )}

      {/* Financial Account & Gateway Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border/80 shadow-xs">
          <CardContent className="p-5 space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              Current Available Balance
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">$47,400.00</span>
              <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-300">
                Ready for Payout
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Automated next payout scheduled for Friday.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-xs">
          <CardContent className="p-5 space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              Payment Gateway
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-foreground">Stripe & Paystack Connect</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Card processing active (Visa, Mastercard, Verve, Apple Pay).
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-xs">
          <CardContent className="p-5 space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              Destination Bank
            </span>
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">
                Access Bank •••• 4891
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Omolara Eniola Events Account
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Ticket Tier Editor */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-semibold">Active Ticket Tier Catalog</CardTitle>
            <CardDescription className="text-xs">
              Define prices, seat capacities, and customer perks for this production
            </CardDescription>
          </div>
          <Button size="sm" onClick={handleAddTier} className="text-xs gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            <span>Add Ticket Tier</span>
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className="p-5 rounded-xl border border-border bg-card/60 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-[10px] uppercase font-semibold">
                    {tier.type}
                  </Badge>
                  <span className="text-xs font-semibold text-muted-foreground">
                    {tier.soldCount} tickets already booked
                  </span>
                </div>
                {tiers.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-rose-500"
                    onClick={() => handleRemove(tier.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="sm:col-span-2 space-y-1">
                  <Label className="text-xs">Pass / Tier Name</Label>
                  <Input
                    value={tier.name}
                    onChange={(e) => handleUpdate(tier.id, 'name', e.target.value)}
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Price ($ USD)</Label>
                  <Input
                    type="number"
                    value={tier.price}
                    onChange={(e) => handleUpdate(tier.id, 'price', Number(e.target.value))}
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Maximum Capacity</Label>
                  <Input
                    type="number"
                    value={tier.capacity}
                    onChange={(e) => handleUpdate(tier.id, 'capacity', Number(e.target.value))}
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Perks & Admission Benefits</Label>
                <Input
                  value={tier.description || ''}
                  onChange={(e) => handleUpdate(tier.id, 'description', e.target.value)}
                  className="text-xs"
                  placeholder="e.g. 2-Day Access, Session Recordings, VIP Networking Dinner"
                />
              </div>
            </div>
          ))}

          <div className="pt-4 border-t border-border flex justify-end">
            <Button onClick={handleSave} className="text-xs">
              Save Pricing Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
