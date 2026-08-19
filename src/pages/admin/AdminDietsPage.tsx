import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { DietPlanLibrarySection } from '@/components/entity/DietPlanLibrarySection'
import { DietPlanDetailDialog } from '@/components/entity/DietPlanDetailDialog'
import { CreateDietPlanDialog } from '@/components/entity/CreateDietPlanDialog'
import { AssignDietPlanDialog } from '@/components/entity/AssignDietPlanDialog'
import { EditDietAssignmentDialog } from '@/components/entity/EditDietAssignmentDialog'
import { DietPlanGrid } from '@/components/entity/DietPlanGrid'
import { useDietPlans, useDeleteDietPlan } from '@/hooks/useDietPlans'
import { useDietAssignments, useDeleteDietAssignment } from '@/hooks/useDietAssignments'
import { useUsersByRole } from '@/hooks/useUsers'
import { useRoles } from '@/hooks/useRoles'
import { useBranches } from '@/hooks/useBranches'
import { useAuthStore } from '@/store/auth.store'
import type { DietAssignmentRecord } from '@/api/diet-assignments.api'
import type { DietPlanRecord } from '@/api/diet-plans.api'
import type { ManagedUser } from '@/api/user-management.api'
import type { BranchRecord } from '@/api/branches.api'

function findUser(users: ManagedUser[], id: number | null) {
  if (!id) return undefined
  return users.find((u) => u.id === String(id))
}

export default function AdminDietsPage() {
  const gymContext = useAuthStore((s) => s.gymContext)
  const { memberRole, trainerRole } = useRoles()
  const { data: members = [] } = useUsersByRole(memberRole?.id)
  const { data: trainers = [] } = useUsersByRole(trainerRole?.id)
  const { data: branches = [] } = useBranches(gymContext?.businessId)

  const plans = useDietPlans()
  const assignments = useDietAssignments()
  const deletePlan = useDeleteDietPlan()
  const deleteAssignment = useDeleteDietAssignment()

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
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-6 animate-fade-in">
          <DietPlanLibrarySection
            data={plans.data}
            isLoading={plans.isLoading}
            isError={plans.isError}
            onRetry={plans.refetch}
            onCreate={() => { setEditingPlan(null); setPlanFormOpen(true) }}
            onOpenPlan={setDetailPlan}
          />

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Assigned Diet Plans</h1>
              <p className="mt-1 text-sm" style={{ color: '#64748B' }}>
                Which members are on a diet plan right now, and who's coaching them.
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => { setAssignFixedPlanId(undefined); setAssignOpen(true) }}
              disabled={(plans.data?.length ?? 0) === 0}
            >
              <Plus className="mr-1.5 h-4 w-4" /> Assign to Member
            </Button>
          </div>

          <DietPlanGrid
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
        </div>
      </div>

      <DietPlanLibraryDialogs
        detailPlan={detailPlan}
        onCloseDetail={() => setDetailPlan(null)}
        onEditPlan={(p) => { setDetailPlan(null); setEditingPlan(p); setPlanFormOpen(true) }}
        onDeletePlan={(p) => {
          if (window.confirm(`Delete "${p.name}"? Members currently assigned to it will keep their assignment, but it'll no longer be in the library.`)) {
            deletePlan.mutate(p.id)
            setDetailPlan(null)
          }
        }}
        onAssignPlan={(p) => { setDetailPlan(null); setAssignFixedPlanId(p.id); setAssignOpen(true) }}
        deletingPlan={deletePlan.isPending}
        planFormOpen={planFormOpen}
        onClosePlanForm={() => setPlanFormOpen(false)}
        editingPlan={editingPlan}
        branchOptions={branches}
        assignOpen={assignOpen}
        onCloseAssign={() => setAssignOpen(false)}
        assignFixedPlanId={assignFixedPlanId}
        memberOptions={members}
        trainerOptions={trainers}
        planOptions={plans.data ?? []}
        editingAssignment={editingAssignment}
        onCloseEditAssignment={() => setEditingAssignment(null)}
      />
    </div>
  )
}

/** Groups the five dialogs this page owns so the main return stays scannable. */
function DietPlanLibraryDialogs(props: {
  detailPlan: DietPlanRecord | null
  onCloseDetail: () => void
  onEditPlan: (p: DietPlanRecord) => void
  onDeletePlan: (p: DietPlanRecord) => void
  onAssignPlan: (p: DietPlanRecord) => void
  deletingPlan: boolean
  planFormOpen: boolean
  onClosePlanForm: () => void
  editingPlan: DietPlanRecord | null
  branchOptions: BranchRecord[]
  assignOpen: boolean
  onCloseAssign: () => void
  assignFixedPlanId: number | undefined
  memberOptions: ManagedUser[]
  trainerOptions: ManagedUser[]
  planOptions: DietPlanRecord[]
  editingAssignment: DietAssignmentRecord | null
  onCloseEditAssignment: () => void
}) {
  return (
    <>
      <DietPlanDetailDialog
        open={!!props.detailPlan}
        onClose={props.onCloseDetail}
        plan={props.detailPlan}
        onEdit={props.onEditPlan}
        onDelete={props.onDeletePlan}
        onAssign={props.onAssignPlan}
        deleting={props.deletingPlan}
      />

      <CreateDietPlanDialog
        open={props.planFormOpen}
        onClose={props.onClosePlanForm}
        branchOptions={props.branchOptions}
        plan={props.editingPlan}
      />

      <AssignDietPlanDialog
        open={props.assignOpen}
        onClose={props.onCloseAssign}
        memberOptions={props.memberOptions}
        trainerOptions={props.trainerOptions}
        planOptions={props.planOptions}
        fixedDietPlanId={props.assignFixedPlanId}
      />

      <EditDietAssignmentDialog
        open={!!props.editingAssignment}
        onClose={props.onCloseEditAssignment}
        assignment={props.editingAssignment}
        trainerOptions={props.trainerOptions}
      />
    </>
  )
}
