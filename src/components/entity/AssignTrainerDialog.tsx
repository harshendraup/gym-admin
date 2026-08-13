import { useState } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@/components/ui/select'
import { useUpdateUser } from '@/hooks/useUsers'
import type { ManagedUser } from '@/api/user-management.api'

interface AssignTrainerDialogProps {
  open: boolean
  onClose: () => void
  member: ManagedUser
  /** Trainers already narrowed to the member's own business + branch. */
  trainerOptions: ManagedUser[]
}

/**
 * Assigns a trainer to a member (POST/PUT /users already validates
 * server-side that the trainer is in the same business+branch as the
 * member, and that the target is actually a member — this dialog just
 * narrows the picker to that same set up front so the request never fails
 * on a mismatch the UI could have prevented).
 */
export function AssignTrainerDialog({ open, onClose, member, trainerOptions }: AssignTrainerDialogProps) {
  const [trainerId, setTrainerId] = useState(member.trainerId ? String(member.trainerId) : '')
  const update = useUpdateUser(member.id)

  const onSubmit = () => {
    if (!trainerId) return
    update.mutate({ trainerId: Number(trainerId) }, { onSuccess: onClose })
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Assign Trainer</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Choose a trainer for {member.fullName ?? member.firstName}. Only trainers in the
            same branch are shown.
          </p>
          <div className="space-y-1.5">
            <Label>Trainer</Label>
            <Select value={trainerId} onValueChange={setTrainerId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a trainer..." />
              </SelectTrigger>
              <SelectContent>
                {trainerOptions.length === 0 ? (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    No trainers in this branch yet.
                  </div>
                ) : (
                  trainerOptions.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.fullName ?? t.firstName}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            type="button"
            onClick={onSubmit}
            disabled={!trainerId || update.isPending}
          >
            {update.isPending ? 'Assigning...' : 'Assign Trainer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
