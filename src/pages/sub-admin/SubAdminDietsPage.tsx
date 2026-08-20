import { useState } from 'react'
import { Plus } from 'lucide-react'
import { DietPlanLibrarySection } from '@/components/entity/DietPlanLibrarySection'
import { DietPlanDetailDialog } from '@/components/entity/DietPlanDetailDialog'
import { CreateDietPlanDialog } from '@/components/entity/CreateDietPlanDialog'
import { AssignDietPlanDialog } from '@/components/entity/AssignDietPlanDialog'
import { EditDietAssignmentDialog } from '@/components/entity/EditDietAssignmentDialog'
import { DietPlanTable } from '@/components/entity/DietPlanTable'
import { useDietPlans, useDeleteDietPlan, useDuplicateDietPlan, useUpdateAnyDietPlan } from '@/hooks/useDietPlans'
import { useDietAssignments, useDeleteDietAssignment } from '@/hooks/useDietAssignments'
import { useUsersByRole } from '@/hooks/useUsers'
import { useRoles } from '@/hooks/useRoles'
import { useAuthStore } from '@/store/auth.store'
import type { DietAssignmentRecord } from '@/api/diet-assignments.api'
import type { DietPlanRecord } from '@/api/diet-plans.api'
import type { ManagedUser } from '@/api/user-management.api'
import { Hero, ScoreCard, ScoreboardCta } from '@/components/scoreboard/primitives'

// Swap in a real nutrition/meal-prep photo here once available — see
// Hero's placeholder fallback in the meantime.
const HERO_IMAGE: string | null = null

function findUser(users: ManagedUser[], id: number | null) {
  if (!id) return undefined
  return users.find((u) => u.id === String(id))
}

export default function SubAdminDietsPage() {
  const gymContext = useAuthStore((s) => s.gymContext)
  const { memberRole, trainerRole } = useRoles()
  const { data: members = [] } = useUsersByRole(memberRole?.id)
  const { data: trainers = [] } = useUsersByRole(trainerRole?.id)

  const plans = useDietPlans()
  const assignments = useDietAssignments()
  const deletePlan = useDeleteDietPlan()
  const deleteAssignment = useDeleteDietAssignment()
  const duplicatePlan = useDuplicateDietPlan()
  const updateAnyPlan = useUpdateAnyDietPlan()

  const [planFormOpen, setPlanFormOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<DietPlanRecord | null>(null)
  const [detailPlan, setDetailPlan] = useState<DietPlanRecord | null>(null)
  const [assignOpen, setAssignOpen] = useState(false)
  const [assignFixedPlanId, setAssignFixedPlanId] = useState<number | undefined>(undefined)
  const [editingAssignment, setEditingAssignment] = useState<DietAssignmentRecord | null>(null)

  const memberName = (id: number) => {
    const u = findUser(members, id)
    return u ? (u.fullName ?? u.firstName) : `#${id}`
  }
  const trainerName = (id: number | null) => {
    if (!id) return 'Unassigned'
    const u = findUser(trainers, id)
    return u ? (u.fullName ?? u.firstName) : `#${id}`
  }
  const planLookup = (dietPlanId: number) =>
    plans.data?.find((p) => String(p.id) === String(dietPlanId))

  return (
    <>
      <Hero
        image={HERO_IMAGE}
        placeholderLabel="nutrition"
        eyebrow="Nutrition Programs"
        title="Diet Plans"
        subtitle="Build reusable diet plans, then assign them to members in your branch."
      />

      <div className="space-y-6">
        <DietPlanLibrarySection
          data={plans.data}
          isLoading={plans.isLoading}
          isError={plans.isError}
          onRetry={plans.refetch}
          onCreate={() => { setEditingPlan(null); setPlanFormOpen(true) }}
          onOpenPlan={setDetailPlan}
          onDuplicatePlan={(p) => duplicatePlan.mutate(p.id)}
          onArchivePlan={(p) => updateAnyPlan.mutate({ id: p.id, data: { status: 'Archived', isActive: false } })}
        />

        <ScoreCard
          title={`Active Assignments · ${assignments.data?.length ?? 0}`}
          subtitle="Which members are on a diet plan right now, and who's coaching them"
          action={
            <ScoreboardCta
              icon={Plus}
              onClick={() => { setAssignFixedPlanId(undefined); setAssignOpen(true) }}
            >
              Assign to Member
            </ScoreboardCta>
          }
        >
          <DietPlanTable
            data={assignments.data}
            planLookup={planLookup}
            isLoading={assignments.isLoading || plans.isLoading}
            isError={assignments.isError}
            onRetry={assignments.refetch}
            emptyMessage={
              (plans.data?.length ?? 0) === 0
                ? 'Create a diet plan in the library above, then assign it to a member.'
                : 'No members are on a diet plan yet — assign your first one.'
            }
            memberLabel={memberName}
            trainerLabel={trainerName}
            onEdit={setEditingAssignment}
            onDelete={(a) => deleteAssignment.mutate(a.id)}
            deletingId={deleteAssignment.isPending ? (deleteAssignment.variables ?? null) : null}
          />
        </ScoreCard>
      </div>

      <DietPlanDetailDialog
        open={!!detailPlan}
        onClose={() => setDetailPlan(null)}
        plan={detailPlan}
        onEdit={(p) => { setDetailPlan(null); setEditingPlan(p); setPlanFormOpen(true) }}
        onDelete={(p) => {
          if (window.confirm(`Delete "${p.name}"? Members currently assigned to it will keep their assignment, but it'll no longer be in the library.`)) {
            deletePlan.mutate(p.id)
            setDetailPlan(null)
          }
        }}
        onAssign={(p) => { setDetailPlan(null); setAssignFixedPlanId(p.id); setAssignOpen(true) }}
        onDuplicate={(p) => { duplicatePlan.mutate(p.id); setDetailPlan(null) }}
        deleting={deletePlan.isPending}
      />

      <CreateDietPlanDialog
        open={planFormOpen}
        onClose={() => setPlanFormOpen(false)}
        fixedBranchId={gymContext?.branchId ? Number(gymContext.branchId) : undefined}
        plan={editingPlan}
      />

      <AssignDietPlanDialog
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        memberOptions={members}
        trainerOptions={trainers}
        planOptions={plans.data ?? []}
        fixedDietPlanId={assignFixedPlanId}
      />

      <EditDietAssignmentDialog
        open={!!editingAssignment}
        onClose={() => setEditingAssignment(null)}
        assignment={editingAssignment}
        trainerOptions={trainers}
      />
    </>
  )
}
