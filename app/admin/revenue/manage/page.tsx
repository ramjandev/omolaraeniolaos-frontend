'use client';

import * as React from 'react';
import Link from 'next/link';
import { Plus, Layers } from 'lucide-react';
import { AppShell } from '@/components/shell/AppShell';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { EmptyState } from '@/components/shared/EmptyState';
import { SegmentedTabs } from '@/components/shared/SegmentedTabs';
import {
  PlanCard,
  PlanCardAction,
  PlanCardGrid,
  formatPlanPrice,
  planPriceSuffix,
} from '@/components/plans/PlanCard';
import { PlanFormModal } from '@/components/plans/PlanFormModal';
import {
  useCreatePlanMutation,
  useDeletePlanMutation,
  useGetPlansQuery,
  useUpdatePlanMutation,
} from '@/store/Plan/planApi';
import {
  PLAN_ORGANIZER_TYPES,
  type Plan,
  type PlanOrganizerType,
  type PlanPayload,
} from '@/store/Plan/types/planTypes';

const billingPeriod = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' }).format(new Date());

export default function AdminManagePlanPage() {
  const [segment, setSegment] = React.useState<PlanOrganizerType>('Individual');
  const [formOpen, setFormOpen] = React.useState(false);
  const [editingPlan, setEditingPlan] = React.useState<Plan | null>(null);
  const [planToDelete, setPlanToDelete] = React.useState<Plan | null>(null);
  const [hoveredId, setHoveredId] = React.useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useGetPlansQuery();
  const [createPlan, { isLoading: isCreating }] = useCreatePlanMutation();
  const [updatePlan, { isLoading: isUpdating }] = useUpdatePlanMutation();
  const [deletePlan, { isLoading: isDeleting }] = useDeletePlanMutation();

  const plans = React.useMemo(
    () => (data?.data ?? []).filter((plan) => plan.organizerType === segment),
    [data, segment],
  );
  const highlightedId = hoveredId ?? plans[1]?.id ?? plans[0]?.id;

  const openCreate = () => {
    setEditingPlan(null);
    setFormOpen(true);
  };

  const openEdit = (plan: Plan) => {
    setEditingPlan(plan);
    setFormOpen(true);
  };

  const handleSubmit = async (payload: PlanPayload) => {
    try {
      if (editingPlan) {
        await updatePlan({ id: editingPlan.id, data: payload }).unwrap();
      } else {
        await createPlan(payload).unwrap();
      }
      setFormOpen(false);
      setSegment(payload.organizerType);
      setHoveredId(null);
    } catch {
      // The API layer already shows the error toast; keep the form open for corrections.
    }
  };

  const handleDelete = async () => {
    if (!planToDelete) return;
    try {
      await deletePlan(planToDelete.id).unwrap();
      setPlanToDelete(null);
    } catch {
      // Error toast is shown by the API layer.
    }
  };

  return (
    <AppShell currentRole="admin">
      <div className="space-y-6">
        <nav aria-label="Breadcrumb" className="text-sm text-[#6F6761] dark:text-muted-foreground">
          <Link href="/admin/revenue" className="hover:text-[#1F140E] dark:hover:text-foreground">
            Revenue &amp; Plans
          </Link>
          <span className="mx-1">/</span>
          <span className="font-medium text-[#7A3B18] dark:text-[#D4A373]">Manage Plan</span>
        </nav>

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div className="space-y-1">
            <h1 className="font-serif text-2xl font-medium tracking-tight text-[#1F140E] dark:text-foreground">
              Revenue &amp; Plans
            </h1>
            <p className="text-sm text-[#6F6761] dark:text-muted-foreground">
              Platform billing overview · {billingPeriod}
            </p>
          </div>

          <Button
            onClick={openCreate}
            className="h-10 shrink-0 gap-1.5 rounded-xl bg-[#1F140E] px-4 text-sm font-medium text-white shadow-xs hover:bg-[#322017] cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Create Plan
          </Button>
        </div>

        <SegmentedTabs
          ariaLabel="Organizer type"
          options={PLAN_ORGANIZER_TYPES.map((type) => ({ value: type, label: type }))}
          value={segment}
          onChange={(type) => {
            setSegment(type);
            setHoveredId(null);
          }}
        />

        {isLoading ? (
          <PlanCardGrid>
            {[0, 1].map((i) => (
              <div key={i} className="h-[520px] animate-pulse rounded-3xl bg-[#F3EEE6] dark:bg-muted/40" />
            ))}
          </PlanCardGrid>
        ) : isError ? (
          <EmptyState
            icon={Layers}
            title="Could not load plans"
            description="Check that the backend is running, then try again."
            action={{ label: 'Retry', onClick: () => refetch() }}
          />
        ) : plans.length === 0 ? (
          <EmptyState
            icon={Layers}
            title={`No ${segment.toLowerCase()} plans yet`}
            description={`Create the first plan ${segment.toLowerCase()} organizers can pick during sign up.`}
            action={{ label: 'Create Plan', onClick: openCreate }}
          />
        ) : (
          <PlanCardGrid>
            {plans.map((plan) => (
              <PlanCard
                key={plan.id}
                name={plan.planName}
                description={plan.description}
                price={formatPlanPrice(plan.price)}
                priceSuffix={planPriceSuffix(plan.billingCycle)}
                features={plan.features}
                highlighted={plan.id === highlightedId}
                onMouseEnter={() => setHoveredId(plan.id)}
                badge={
                  plan.isArchived ? (
                    <span className="rounded-md bg-[#F2F1EF] px-2 py-0.5 text-xs font-medium text-[#6F6761]">
                      Archived
                    </span>
                  ) : undefined
                }
                actions={
                  <>
                    <PlanCardAction
                      variant="delete"
                      label={`Delete ${plan.planName}`}
                      onClick={() => setPlanToDelete(plan)}
                    />
                    <PlanCardAction
                      variant="edit"
                      label={`Edit ${plan.planName}`}
                      onClick={() => openEdit(plan)}
                    />
                  </>
                }
              />
            ))}
          </PlanCardGrid>
        )}
      </div>

      <PlanFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        plan={editingPlan}
        defaultOrganizerType={segment}
        busy={isCreating || isUpdating}
        onSubmit={handleSubmit}
      />

      <AlertDialog open={Boolean(planToDelete)} onOpenChange={(open) => !open && setPlanToDelete(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &quot;{planToDelete?.planName}&quot;?</AlertDialogTitle>
            <AlertDialogDescription>
              Organizers will no longer be able to pick this plan. To keep it for existing organizers,
              archive it from the edit form instead.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                void handleDelete();
              }}
              disabled={isDeleting}
              className="rounded-xl bg-[#B42318] text-white hover:bg-[#912018]"
            >
              {isDeleting ? 'Deleting...' : 'Delete Plan'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}
