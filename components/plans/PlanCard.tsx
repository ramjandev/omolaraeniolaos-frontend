import * as React from "react";
import { Check, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function formatPlanPrice(amount: number) {
  return amount === 0 ? "₦00" : `₦${amount.toLocaleString("en-NG")}`;
}

export function planPriceSuffix(cycle: string) {
  if (cycle === "Monthly") return "/monthly";
  if (cycle === "Annual") return "/annually";
  return "/per single event";
}

export function PlanEmblem({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#241710] font-serif text-lg italic text-[#D9B77A] shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_2px_6px_rgba(0,0,0,0.18)]",
        className,
      )}
    >
      Mv
    </span>
  );
}

export function PlanFeatureList({ features }: { features: string[] }) {
  return (
    <ul className="space-y-2.5 text-base text-[#3D342F] dark:text-foreground">
      {features.map((feature, index) => (
        <li key={`${feature}-${index}`} className="flex items-start gap-2.5">
          <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] bg-[#DCFCE7] ring-1 ring-[#86EFAC]/70 shadow-[0_2px_4px_rgba(22,163,74,0.28)]">
            <Check className="h-3 w-3 text-[#16A34A]" strokeWidth={3.5} />
          </span>
          <span>{feature}</span>
        </li>
      ))}
    </ul>
  );
}

interface PlanCardActionProps {
  variant: "edit" | "delete";
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export function PlanCardAction({ variant, label, onClick, disabled }: PlanCardActionProps) {
  const Icon = variant === "delete" ? Trash2 : Pencil;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={cn(
        "grid h-9 w-9 place-items-center rounded-xl border border-[#F0E8DD] bg-white shadow-[0_3px_8px_rgba(60,40,20,0.12)] transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 dark:border-border dark:bg-card",
        variant === "delete"
          ? "text-[#B42318] hover:bg-[#FEF3F2]"
          : "text-[#7A3B18] hover:bg-[#F6E3D8] dark:text-[#D4A373]",
      )}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

interface PlanCardProps {
  name: string;
  description?: string | null;
  price: string;
  priceSuffix?: string;
  priceNote?: React.ReactNode;
  features: string[];
  /** Raised white card. Used for the selected, hovered or recommended plan. */
  highlighted?: boolean;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  ctaLabel?: string;
  ctaTone?: "dark" | "muted";
  ctaDisabled?: boolean;
  ctaPressed?: boolean;
  /** Without a handler the button renders as a non-interactive preview. */
  onSelect?: () => void;
  onMouseEnter?: () => void;
  className?: string;
}

export function PlanCard({
  name,
  description,
  price,
  priceSuffix = "/per single event",
  priceNote,
  features,
  highlighted = false,
  badge,
  actions,
  ctaLabel = "Select Plan",
  ctaTone = "dark",
  ctaDisabled = false,
  ctaPressed,
  onSelect,
  onMouseEnter,
  className,
}: PlanCardProps) {
  const ctaClass = cn(
    "mt-10 flex h-[52px] w-full items-center justify-center rounded-xl text-base font-medium text-white transition-colors",
    ctaTone === "muted" ? "bg-[#B5AEAA]" : "bg-[#1F1511] shadow-[0_3px_0_rgba(0,0,0,0.25)]",
    onSelect && ctaTone === "dark" ? "hover:bg-[#3D2518] cursor-pointer" : "cursor-default",
    "disabled:cursor-not-allowed disabled:opacity-60",
  );

  return (
    <article
      onMouseEnter={onMouseEnter}
      className={cn(
        "flex flex-col rounded-3xl border p-6 transition-all duration-200 sm:p-7",
        highlighted
          ? "border-[#EBE3D9] bg-white shadow-[0_10px_30px_rgba(60,40,20,0.14)] dark:border-border dark:bg-card"
          : "border-transparent bg-transparent",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <PlanEmblem />
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <h2 className="font-sans text-xl font-medium text-[#1F140E] dark:text-foreground">{name}</h2>
        {badge}
      </div>
      {description && (
        <p className="mt-2 text-base leading-relaxed text-[#6F6761] dark:text-muted-foreground">
          {description}
        </p>
      )}

      <div className="mt-6 flex items-baseline">
        <span className="font-serif text-[40px] font-bold leading-none tracking-tight text-[#1F140E] dark:text-foreground">
          {price}
        </span>
        <span className="ml-1 text-sm text-[#6F6761] dark:text-muted-foreground">{priceSuffix}</span>
      </div>
      {priceNote && (
        <p className="mt-1 text-[13px] text-[#8C7A6B] dark:text-muted-foreground">{priceNote}</p>
      )}

      <p className="mb-3 mt-8 text-base font-medium text-[#1F140E] dark:text-foreground">
        Whats Include
      </p>
      <PlanFeatureList features={features} />

      <div className="mt-auto">
        {onSelect ? (
          <button
            type="button"
            onClick={onSelect}
            disabled={ctaDisabled}
            aria-pressed={ctaPressed}
            className={ctaClass}
          >
            {ctaLabel}
          </button>
        ) : (
          <div aria-hidden={ctaTone === "dark"} className={ctaClass}>
            {ctaLabel}
          </div>
        )}
      </div>
    </article>
  );
}

export function PlanCardGrid({
  columns = 2,
  children,
  className,
}: {
  columns?: 2 | 3;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid w-full grid-cols-1 items-stretch gap-5 rounded-[32px] border border-[#F0E8DD] bg-[#FDFAF5] p-4 sm:p-5 dark:border-border/80 dark:bg-card/40",
        columns === 3 ? "lg:grid-cols-3" : "md:grid-cols-2",
        className,
      )}
    >
      {children}
    </div>
  );
}
