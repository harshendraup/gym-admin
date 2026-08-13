import { useState } from 'react'
import { Plus, Salad } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CreateDietDialog } from './CreateDietDialog'
import type { DietRecord, DietStatus } from '@/api/diets.api'
import type { ManagedUser } from '@/api/user-management.api'

const statusVariant: Record<DietStatus, 'secondary' | 'success' | 'default'> = {
  Draft: 'secondary',
  Active: 'success',
  Completed: 'default',
}

interface MemberDietsDialogProps {
  open: boolean
  onClose: () => void
  member: ManagedUser
  diets: DietRecord[]
  trainerOptions: ManagedUser[]
  trainerName: (id: number | null) => string
}

/** All diet plans (past + present) assigned to one member, with an entry point to assign a new one. */
export function MemberDietsDialog({
  open,
  onClose,
  member,
  diets,
  trainerOptions,
  trainerName,
}: MemberDietsDialogProps) {
  const [assignOpen, setAssignOpen] = useState(false)

  return (
    <>
      <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{member.fullName ?? member.firstName}'s Diet Plans</DialogTitle>
          </DialogHeader>

          {diets.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                <Salad className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">No diet plans assigned yet.</p>
            </div>
          ) : (
            <div className="max-h-72 space-y-1 overflow-y-auto">
              {diets.map((d) => (
                <div key={d.id} className="rounded-lg px-2 py-2 hover:bg-muted/50">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium text-slate-900">{d.name}</p>
                    <Badge variant={statusVariant[d.status]}>{d.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {d.goal} · Trainer: {trainerName(d.trainerId)}
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

      <CreateDietDialog
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        memberOptions={[member]}
        trainerOptions={trainerOptions}
        fixedMember={member}
      />
    </>
  )
}
