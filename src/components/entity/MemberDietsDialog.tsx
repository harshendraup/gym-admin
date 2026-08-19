import { useState } from 'react'
import { Plus, Salad } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AssignDietPlanDialog } from './AssignDietPlanDialog'
import { useDietPlans } from '@/hooks/useDietPlans'
import type { DietAssignmentRecord, DietAssignmentStatus } from '@/api/diet-assignments.api'
import type { ManagedUser } from '@/api/user-management.api'

const statusVariant: Record<DietAssignmentStatus, 'secondary' | 'success' | 'default'> = {
  Draft: 'secondary',
  Active: 'success',
  Completed: 'default',
}

interface MemberDietsDialogProps {
  open: boolean
  onClose: () => void
  member: ManagedUser
  assignments: DietAssignmentRecord[]
  trainerOptions: ManagedUser[]
  trainerName: (id: number | null) => string
}

/** All diet plan assignments (past + present) for one member, with an entry point to assign a new one. */
export function MemberDietsDialog({
  open,
  onClose,
  member,
  assignments,
  trainerOptions,
  trainerName,
}: MemberDietsDialogProps) {
  const [assignOpen, setAssignOpen] = useState(false)
  const { data: plans = [] } = useDietPlans()
  const planName = (dietPlanId: number) => plans.find((p) => String(p.id) === String(dietPlanId))?.name ?? `#${dietPlanId}`
  const planGoal = (dietPlanId: number) => plans.find((p) => String(p.id) === String(dietPlanId))?.goal

  return (
    <>
      <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{member.fullName ?? member.firstName}'s Diet Plans</DialogTitle>
          </DialogHeader>

          {assignments.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                <Salad className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">No diet plans assigned yet.</p>
            </div>
          ) : (
            <div className="max-h-72 space-y-1 overflow-y-auto">
              {assignments.map((a) => (
                <div key={a.id} className="rounded-lg px-2 py-2 hover:bg-muted/50">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium text-slate-900">{planName(a.dietPlanId)}</p>
                    <Badge variant={statusVariant[a.status]}>{a.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {planGoal(a.dietPlanId) ?? 'Unknown goal'} · Trainer: {trainerName(a.trainerId)}
                  </p>
                </div>
              ))}
            </div>
          )}

          <Button size="sm" onClick={() => setAssignOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" /> Assign New Plan
          </Button>
        </DialogContent>
      </Dialog>

      <AssignDietPlanDialog
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        memberOptions={[member]}
        trainerOptions={trainerOptions}
        planOptions={plans}
        fixedMember={member}
      />
    </>
  )
}
