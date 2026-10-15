"use client";

import {
  brownButton,
  fieldClass,
  labelClass,
} from "@/components/auth/onboarding-ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  PLAN_BILLING_CYCLES,
  PLAN_ORGANIZER_TYPES,
  type Plan,
  type PlanOrganizerType,
  type PlanPayload,
} from "@/store/Plan/types/planTypes";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, X } from "lucide-react";
import * as React from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

const parsePrice = (value: string) => Number(value.replace(/[₦,\s]/g, ""));

const planFormSchema = z.object({
  planName: z.string().trim().min(2, "Enter a plan name"),
  description: z
    .string()
    .trim()
    .max(200, "Keep the description under 200 characters"),
  price: z
    .string()
    .trim()
    .min(1, "Enter a price")
    .refine(
      (v) => Number.isFinite(parsePrice(v)) && parsePrice(v) >= 0,
      "Enter a valid amount, e.g. 35000",
    ),
  organizerType: z.enum(["Individual", "Agency", "Venue"]),
  billingCycle: z.enum(["Per-event", "Monthly", "Annual"]),
  features: z
    .array(z.object({ value: z.string() }))
    .refine(
      (items) => items.some((f) => f.value.trim()),
      "Add at least one feature",
    ),
  isArchived: z.boolean(),
});

type PlanFormValues = z.infer<typeof planFormSchema>;

function toFormValues(
  plan: Plan | null | undefined,
  organizerType: PlanOrganizerType,
): PlanFormValues {
  return {
    planName: plan?.planName ?? "",
    description: plan?.description ?? "",
    price: plan ? plan.price.toLocaleString("en-NG") : "",
    organizerType: plan?.organizerType ?? organizerType,
    billingCycle: plan?.billingCycle ?? "Per-event",
    features: plan?.features.length
      ? plan.features.map((value) => ({ value }))
      : [{ value: "" }],
    isArchived: plan?.isArchived ?? false,
  };
}

function PillOption({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      className={cn(
        "h-10 rounded-xl border px-4 text-[15px] transition-colors cursor-pointer",
        selected
          ? "border-[#7A3B18] bg-[#F6E3D8] font-medium text-[#7A3B18]"
          : "border-[#E5E2DE] bg-[#F2F1EF] text-[#6F6761] hover:bg-[#EAE8E5]",
      )}
    >
      {children}
    </button>
  );
}

interface PlanFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Edit mode when a plan is passed, create mode otherwise. */
  plan?: Plan | null;
  defaultOrganizerType?: PlanOrganizerType;
  busy?: boolean;
  onSubmit: (payload: PlanPayload) => Promise<void>;
}

export function PlanFormModal({
  open,
  onOpenChange,
  plan,
  defaultOrganizerType = "Individual",
  busy = false,
  onSubmit,
}: PlanFormModalProps) {
  const isEdit = Boolean(plan);
  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PlanFormValues>({
    resolver: zodResolver(planFormSchema),
    defaultValues: toFormValues(plan, defaultOrganizerType),
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "features",
  });

  React.useEffect(() => {
    if (open) reset(toFormValues(plan, defaultOrganizerType));
  }, [open, plan, defaultOrganizerType, reset]);

  const organizerType = watch("organizerType");
  const billingCycle = watch("billingCycle");
  const isArchived = watch("isArchived");

  const submit = handleSubmit(async (values) => {
    await onSubmit({
      planName: values.planName.trim(),
      description: values.description.trim(),
      price: parsePrice(values.price),
      organizerType: values.organizerType,
      billingCycle: values.billingCycle,
      features: values.features.map((f) => f.value.trim()).filter(Boolean),
      isArchived: values.isArchived,
    });
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        onInteractOutside={(e) => e.preventDefault()}
        className="max-h-[92vh] overflow-y-auto rounded-3xl border border-[#EBE3D9] bg-white p-6 shadow-2xl sm:max-w-[680px] sm:p-8 dark:border-border dark:bg-card"
      >
        <div className="flex items-center justify-between">
          <DialogTitle className="font-sans text-2xl font-medium tracking-tight text-[#1F140E] dark:text-foreground">
            {isEdit ? "Edit Plan" : "Create Plan"}
          </DialogTitle>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-lg p-1 text-[#1F140E] transition-colors hover:bg-[#F2F1EF] cursor-pointer dark:text-foreground"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <DialogDescription className="sr-only">
          Set the plan name, price, organizer type, billing cycle and features.
        </DialogDescription>

        <form onSubmit={submit} className="space-y-5 pt-1" noValidate>
          <div>
            <label htmlFor="planName" className={labelClass}>
              Plan Name
            </label>
            <input
              id="planName"
              placeholder="e.g, Grand Celebration Pass"
              className={fieldClass}
              {...register("planName")}
            />
            {errors.planName && (
              <p className="mt-1.5 text-sm text-[#B42318]">
                {errors.planName.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="planDescription" className={labelClass}>
              Description
            </label>
            <textarea
              id="planDescription"
              rows={2}
              placeholder="e.g, Ideal for weddings, galas and social banquets."
              className={cn(fieldClass, "h-auto resize-none py-3")}
              {...register("description")}
            />
            {errors.description && (
              <p className="mt-1.5 text-sm text-[#B42318]">
                {errors.description.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="planPrice" className={labelClass}>
              Price
            </label>
            <input
              id="planPrice"
              inputMode="decimal"
              placeholder="e.g, ₦35,000"
              className={fieldClass}
              {...register("price")}
            />
            {errors.price && (
              <p className="mt-1.5 text-sm text-[#B42318]">
                {errors.price.message}
              </p>
            )}
          </div>

          <div>
            <span className={labelClass}>Organizer Type</span>
            <div
              role="radiogroup"
              aria-label="Organizer Type"
              className="flex flex-wrap gap-3"
            >
              {PLAN_ORGANIZER_TYPES.map((type) => (
                <PillOption
                  key={type}
                  selected={organizerType === type}
                  onClick={() =>
                    setValue("organizerType", type, { shouldDirty: true })
                  }
                >
                  {type}
                </PillOption>
              ))}
            </div>
          </div>

          <div>
            <span className={labelClass}>Billing Cycle</span>
            <div
              role="radiogroup"
              aria-label="Billing Cycle"
              className="flex flex-wrap gap-3"
            >
              {PLAN_BILLING_CYCLES.map((cycle) => (
                <PillOption
                  key={cycle}
                  selected={billingCycle === cycle}
                  onClick={() =>
                    setValue("billingCycle", cycle, { shouldDirty: true })
                  }
                >
                  {cycle}
                </PillOption>
              ))}
            </div>
          </div>

          <div>
            <span className={labelClass}>Features</span>
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-3">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-[#E5E2DE] bg-[#F2F1EF] text-[15px] text-[#6F6761] select-none">
                    {index + 1}
                  </span>
                  <input
                    placeholder="Write your feature here"
                    aria-label={`Feature ${index + 1}`}
                    className={cn(fieldClass, "flex-1")}
                    {...register(`features.${index}.value` as const)}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      fields.length > 1
                        ? remove(index)
                        : setValue("features.0.value", "")
                    }
                    className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-[#E5E2DE] bg-[#F2F1EF] text-[#B42318] transition-colors hover:bg-[#FEF3F2] cursor-pointer"
                    aria-label={`Remove feature ${index + 1}`}
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
            {errors.features?.root?.message && (
              <p className="mt-1.5 text-sm text-[#B42318]">
                {errors.features.root.message}
              </p>
            )}
            {errors.features?.message && (
              <p className="mt-1.5 text-sm text-[#B42318]">
                {errors.features.message}
              </p>
            )}
            <button
              type="button"
              onClick={() => append({ value: "" })}
              className="mt-3 grid h-11 w-16 place-items-center rounded-xl bg-[#F2DDD3] text-[#3A2C25] shadow-[0_4px_10px_rgba(122,59,24,0.18)] transition-opacity hover:opacity-90 cursor-pointer"
              aria-label="Add feature"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-lg font-medium text-[#1F140E] dark:text-foreground">
                Archive Plan
              </p>
              <p className="text-sm text-[#6F6761] dark:text-muted-foreground">
                Archiving does not affect organizers already on this plan
              </p>
            </div>
            <Switch
              checked={isArchived}
              onCheckedChange={(checked) =>
                setValue("isArchived", checked, { shouldDirty: true })
              }
              aria-label="Archive plan"
              className="data-[state=checked]:bg-[#7A3B18] data-[state=unchecked]:bg-[#A39A92]"
            />
          </div>

          <button
            type="submit"
            disabled={busy}
            className={cn(brownButton, "h-[52px] w-full text-base")}
          >
            {busy
              ? "Saving..."
              : isEdit
                ? "Save Changes"
                : "Save & Send Invitation"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
