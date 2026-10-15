"use client";

import { AppShell } from "@/components/shell/AppShell";
import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Briefcase, Building, Printer } from "lucide-react";
import {
  formatPlanPrice,
  PlanCard,
  PlanCardGrid,
  planPriceSuffix,
} from "@/components/plans/PlanCard";
import { useStartPlanPayment } from "@/lib/payments/startPlanPayment";
import {
  useGetIndividualBillingQuery,
  type IndividualBillingHistoryItem,
} from "@/store/Billing/billingApi";
import { useGetPlansQuery } from "@/store/Plan/planApi";
import type { Plan } from "@/store/Plan/types/planTypes";
import * as React from "react";
import { toast } from "react-toastify";

function formatBillingDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function paymentMethodLabel(method?: string | null) {
  const value = (method || "").toLowerCase();
  if (!value || value === "free") return "Free";
  if (value.includes("transfer")) return "Bank transfer";
  if (value.includes("card")) return "Card";
  return method || "Card";
}

function statusClass(status: IndividualBillingHistoryItem["status"]) {
  if (status === "Paid") return "bg-[#DDF3E9] text-[#1E9E6A]";
  if (status === "Failed") return "bg-[#FEE2E2] text-[#B91C1C]";
  return "bg-[#FEF3C7] text-[#92400E]";
}

export default function IndividualBillingPage() {
  const { data: plansResponse, isLoading: isPlansLoading } = useGetPlansQuery("Individual");
  const { data: billingResponse, isLoading: isBillingLoading, refetch } =
    useGetIndividualBillingQuery();
  const { startPlanPayment } = useStartPlanPayment();

  const plans = plansResponse?.data ?? [];
  const billing = billingResponse?.data;
  const history = billing?.history ?? [];
  const account = billing?.account;
  const activePlanId = billing?.plan?.isPaid ? billing.plan.planId : null;

  const [historySearch, setHistorySearch] = React.useState("");
  const [selectedHistoryIds, setSelectedHistoryIds] = React.useState<string[]>(
    [],
  );
  const [selectedInvoice, setSelectedInvoice] =
    React.useState<IndividualBillingHistoryItem | null>(null);
  const [isUpgradeOpen, setIsUpgradeOpen] = React.useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = React.useState(false);
  const [selectedPlan, setSelectedPlan] = React.useState<Plan | null>(null);
  const [isProcessingUpgrade, setIsProcessingUpgrade] = React.useState(false);

  const filteredHistory = React.useMemo(() => {
    const q = historySearch.trim().toLowerCase();
    if (!q) return history;
    return history.filter((item) => {
      const date = formatBillingDate(item.date).toLowerCase();
      return (
        item.description.toLowerCase().includes(q) ||
        date.includes(q) ||
        item.invoiceNumber.toLowerCase().includes(q) ||
        item.status.toLowerCase().includes(q)
      );
    });
  }, [history, historySearch]);

  const handleToggleHistory = (id: string) => {
    setSelectedHistoryIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleToggleAllHistory = () => {
    if (
      filteredHistory.length > 0 &&
      selectedHistoryIds.length === filteredHistory.length
    ) {
      setSelectedHistoryIds([]);
    } else {
      setSelectedHistoryIds(filteredHistory.map((item) => item.id));
    }
  };

  const openCheckout = (plan: Plan) => {
    setSelectedPlan(plan);
    setIsCheckoutOpen(true);
  };

  const confirmPlan = async () => {
    if (!selectedPlan) return;
    setIsProcessingUpgrade(true);
    try {
      const result = await startPlanPayment(selectedPlan.id, window.location.href);
      if (result.redirected) return;
      await refetch();
      setIsCheckoutOpen(false);
      toast.success(`${selectedPlan.planName} is now your active plan.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not start plan payment.");
    } finally {
      setIsProcessingUpgrade(false);
    }
  };

  return (
    <AppShell currentRole="organizer_individual">
      <div className="w-full space-y-8">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-4xl font-medium text-[#1F140E] dark:text-[#FBF8F5] tracking-tight">
              Billing
            </h1>
            <p className="text-lg text-[#6F6761] dark:text-muted-foreground mt-1">
              Manage your subscription and billing details.
            </p>
          </div>

          <Button
            type="button"
            onClick={() => setIsUpgradeOpen(true)}
            className="h-11 bg-[#7B3F1D] hover:bg-[#6A3518] text-white px-5 rounded-xl font-medium text-base shadow-xs transition-colors shrink-0 self-start"
          >
            Become a Agency/Venue Owner
          </Button>
        </div>

        {/* Pricing plans: cream container, flat left card, elevated right card */}
        <PlanCardGrid>
          {isPlansLoading && (
            <p className="text-sm text-[#6F6761]">Loading plans…</p>
          )}
          {!isPlansLoading && plans.length === 0 && (
            <p className="text-sm text-[#6F6761]">No individual plans are available yet.</p>
          )}
          {plans.map((plan) => {
            const isActive = plan.id === activePlanId;
            return (
              <PlanCard
                key={plan.id}
                name={plan.planName}
                description={plan.description}
                price={formatPlanPrice(plan.price)}
                priceSuffix={planPriceSuffix(plan.billingCycle)}
                features={plan.features}
                highlighted={!isActive}
                ctaLabel={isActive ? "Active Plan" : "Select Plan"}
                ctaTone={isActive ? "muted" : "dark"}
                onSelect={isActive ? undefined : () => openCheckout(plan)}
              />
            );
          })}
        </PlanCardGrid>

        {/* Payment method (left) + billing history (right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start w-full">
          {/* Payment Method */}
          <div className="lg:col-span-4 rounded-2xl border border-[#EBE3D9] dark:border-border/80 bg-white dark:bg-card p-4 space-y-4">
            <div>
              <h3 className="text-xl font-medium text-[#1F140E] dark:text-foreground">
                Payment Method
              </h3>
              <p className="text-base text-[#6F6761] dark:text-muted-foreground mt-0.5">
                Primary card for auto-renewals.
              </p>
            </div>

            {/* Card mockup */}
            <div className="rounded-xl bg-[#33261C] text-white p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-base uppercase text-white/60">
                  MCENIESVITE PASS
                </span>
                <span className="text-lg font-bold italic text-white">
                  VISA
                </span>
              </div>

              <div className="text-base text-white/90 tracking-wide">
                {billing?.plan
                  ? paymentMethodLabel(billing.plan.paymentMethod)
                  : "No payment method"}
              </div>

              <div className="flex items-end justify-between">
                <div>
                  <span className="text-base uppercase text-white/50 block leading-tight">
                    Account
                  </span>
                  <span className="text-lg font-medium text-white">
                    {account?.fullName || "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* Metadata */}
            <div className="space-y-1.5 text-base">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[#6F6761] dark:text-muted-foreground">
                  Email
                </span>
                <span className="font-medium text-[#1F140E] dark:text-foreground text-right">
                  {account?.email || "—"}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-[#6F6761] dark:text-muted-foreground">
                  Current plan
                </span>
                <span className="font-medium text-[#1F140E] dark:text-foreground text-right">
                  {billing?.plan?.planName || "None"}
                </span>
              </div>
            </div>
          </div>

          {/* Billing History */}
          <div className="lg:col-span-8 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-medium text-[#1F140E] dark:text-foreground">
                  Billing History
                </h3>
                <p className="text-base text-[#6F6761] dark:text-muted-foreground mt-0.5">
                  Download past receipts and view transaction records.
                </p>
              </div>

              <div className="relative w-full sm:w-[272px] shrink-0">
                <input
                  type="text"
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  placeholder="Search"
                  className="w-full h-9 pl-3 pr-14 text-sm rounded-lg border border-[#EBE3D9] dark:border-border/80 bg-[#FDFAF5] dark:bg-card text-foreground placeholder:text-[#6F6761] focus:outline-none focus:ring-1 focus:ring-[#7B3F1D]/40"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none px-1.5 py-0.5 rounded text-[11px] text-[#6F6761] bg-white dark:bg-muted/60 border border-[#EBE3D9] dark:border-border/60">
                  ⌘ k
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-[#EBE3D9] dark:border-border/80 bg-white dark:bg-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-center text-base border-collapse">
                  <thead className="bg-[#F6F3EF] dark:bg-muted/40 border-b border-[#EBE3D9] dark:border-border/80 text-[#4A423D] dark:text-muted-foreground font-medium">
                    <tr className="divide-x divide-[#EBE3D9] dark:divide-border/60">
                      <th className="py-2.5 px-4 w-10">
                        <input
                          type="checkbox"
                          checked={
                            filteredHistory.length > 0 &&
                            selectedHistoryIds.length === filteredHistory.length
                          }
                          onChange={handleToggleAllHistory}
                          className="h-4 w-4 rounded border-[#CFC7BD] text-[#7B3F1D] focus:ring-[#7B3F1D]"
                        />
                      </th>
                      <th className="py-2.5 px-4 font-medium">Date</th>
                      <th className="py-2.5 px-4 font-medium">Description</th>
                      <th className="py-2.5 px-4 font-medium">Status</th>
                      <th className="py-2.5 px-4 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EBE3D9] dark:divide-border/60">
                    {isBillingLoading && (
                      <tr>
                        <td colSpan={5} className="py-8 text-[#6F6761]">
                          Loading billing history…
                        </td>
                      </tr>
                    )}
                    {!isBillingLoading && filteredHistory.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-[#6F6761]">
                          No billing history yet.
                        </td>
                      </tr>
                    )}
                    {filteredHistory.map((item) => (
                      <tr
                        key={item.id}
                        className="divide-x divide-[#EBE3D9] dark:divide-border/60 hover:bg-[#FAF8F5]/50 dark:hover:bg-muted/20 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <input
                            type="checkbox"
                            checked={selectedHistoryIds.includes(item.id)}
                            onChange={() => handleToggleHistory(item.id)}
                            className="h-4 w-4 rounded border-[#CFC7BD] text-[#7B3F1D] focus:ring-[#7B3F1D]"
                          />
                        </td>
                        <td className="py-4 px-4 text-[#3D342F] dark:text-foreground whitespace-nowrap">
                          {formatBillingDate(item.date)}
                        </td>
                        <td className="py-4 px-4 text-[#3D342F] dark:text-foreground whitespace-nowrap">
                          {item.description}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`${statusClass(item.status)} px-4 py-1 rounded-lg text-base font-medium inline-block`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <button
                            type="button"
                            onClick={() => setSelectedInvoice(item)}
                            className="text-[#7B3F1D] hover:text-[#5C3117] font-semibold text-base transition-colors hover:underline"
                          >
                            View Invoice
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Modal: View Invoice */}
        <Dialog
          open={Boolean(selectedInvoice)}
          onOpenChange={(open) => !open && setSelectedInvoice(null)}
        >
          <DialogContent className="sm:max-w-md p-6 rounded-3xl bg-white dark:bg-[#1A110B] border border-[#EBE3D9] dark:border-[#382417] shadow-xl">
            <DialogHeader className="pb-3 border-b border-border">
              <DialogTitle className="text-lg font-medium text-[#1F140E] dark:text-foreground">
                Official Tax Receipt & Invoice
              </DialogTitle>
            </DialogHeader>

            {selectedInvoice && (
              <div className="space-y-4 pt-2 text-xs">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">
                      Invoice Number
                    </span>
                    <span className="font-mono font-bold text-sm text-[#1F140E] dark:text-foreground">
                      {selectedInvoice.invoiceNumber}
                    </span>
                  </div>
                  <span className={`${statusClass(selectedInvoice.status)} px-3 py-0.5 rounded-lg text-xs font-medium`}>
                    {selectedInvoice.status}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-muted/30 border border-[#EBE3D9] dark:border-border space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Issued Date:</span>
                    <span className="font-medium text-foreground">
                      {formatBillingDate(selectedInvoice.date)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Item Description:
                    </span>
                    <span className="font-medium text-foreground">
                      {selectedInvoice.description}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Billing Entity:
                    </span>
                    <span className="font-medium text-foreground">
                      {account?.fullName || "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Payment Method:
                    </span>
                    <span className="font-medium text-foreground">
                      {paymentMethodLabel(selectedInvoice.paymentMethod)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-border font-bold text-sm">
                    <span>Total Paid:</span>
                    <span className="text-[#7B3F1D]">
                      {formatPlanPrice(selectedInvoice.amount)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => window.print()}
                    variant="outline"
                    className="flex-1 rounded-xl text-xs gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print</span>
                  </Button>
                  <Button
                    onClick={() => setSelectedInvoice(null)}
                    className="flex-1 rounded-xl text-xs bg-[#7B3F1D] hover:bg-[#6A3518] text-white"
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Modal: Upgrade to Agency or Venue Owner */}
        <Dialog open={isUpgradeOpen} onOpenChange={setIsUpgradeOpen}>
          <DialogContent className="sm:max-w-lg p-6 rounded-3xl bg-white dark:bg-[#1A110B] border border-[#EBE3D9] dark:border-[#382417] shadow-xl">
            <DialogHeader className="pb-3 border-b border-border">
              <DialogTitle className="text-xl font-medium text-[#1F140E] dark:text-foreground">
                Expand to Agency or Venue Owner
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 pt-2 text-xs">
              <p className="text-muted-foreground leading-relaxed">
                Scale your event organization operations with multi-client
                accounts, custom branding, seating floorplans, and enterprise
                turnstile security.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl border border-[#EBE3D9] dark:border-border bg-[#FAF8F5] dark:bg-muted/20 space-y-2 flex flex-col justify-between">
                  <div>
                    <div className="w-8 h-8 rounded-lg bg-[#241710] text-[#E5A93C] flex items-center justify-center mb-2">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div className="font-bold text-sm text-[#1F140E] dark:text-foreground">
                      Agency Account
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Manage unlimited clients, event team members, and generate
                      white-label client proposals.
                    </p>
                  </div>
                  <Button
                    onClick={() => {
                      setIsUpgradeOpen(false);
                      window.location.href = "/organizer/agency";
                    }}
                    className="w-full mt-3 bg-[#7B3F1D] hover:bg-[#6A3518] text-white text-xs rounded-xl"
                  >
                    Launch Agency Mode
                  </Button>
                </div>

                <div className="p-4 rounded-2xl border border-[#EBE3D9] dark:border-border bg-[#FAF8F5] dark:bg-muted/20 space-y-2 flex flex-col justify-between">
                  <div>
                    <div className="w-8 h-8 rounded-lg bg-[#241710] text-[#E5A93C] flex items-center justify-center mb-2">
                      <Building className="w-4 h-4" />
                    </div>
                    <div className="font-bold text-sm text-[#1F140E] dark:text-foreground">
                      Venue Owner
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      List halls & ballrooms, manage booking calendars, and
                      automate security gate access.
                    </p>
                  </div>
                  <Button
                    onClick={() => {
                      setIsUpgradeOpen(false);
                      window.location.href = "/organizer/venue";
                    }}
                    className="w-full mt-3 bg-[#1F1511] hover:bg-[#3D2518] text-white text-xs rounded-xl"
                  >
                    Launch Venue Mode
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal: Select Grand Celebration Pass Checkout */}
        <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
          <DialogContent className="sm:max-w-md p-6 rounded-3xl bg-white dark:bg-[#1A110B] border border-[#EBE3D9] dark:border-[#382417] shadow-xl">
            <DialogHeader className="pb-2">
              <DialogTitle className="text-xl font-medium text-[#1F140E] dark:text-foreground">
                {selectedPlan ? `Activate ${selectedPlan.planName}` : "Activate plan"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 pt-2 text-xs">
              <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-muted/30 border border-[#EBE3D9] space-y-2">
                <div className="flex justify-between font-medium gap-3">
                  <span className="text-muted-foreground">Selected Plan:</span>
                  <span className="text-foreground text-right">
                    {selectedPlan?.planName || "—"}
                  </span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-muted-foreground">Price:</span>
                  <span className="text-foreground">
                    {selectedPlan
                      ? `${formatPlanPrice(selectedPlan.price)}${planPriceSuffix(selectedPlan.billingCycle)}`
                      : "—"}
                  </span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-muted-foreground">Account:</span>
                  <span className="text-foreground">{account?.email || "—"}</span>
                </div>
              </div>

              <Button
                onClick={confirmPlan}
                disabled={isProcessingUpgrade || !selectedPlan}
                className="w-full bg-[#7B3F1D] hover:bg-[#6A3518] text-white font-semibold text-xs py-3 rounded-xl transition-colors shadow-xs"
              >
                {isProcessingUpgrade
                  ? "Activating Pass..."
                  : selectedPlan && selectedPlan.price > 0
                    ? `Pay ${formatPlanPrice(selectedPlan.price)}`
                    : "Confirm Pass Activation"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}
