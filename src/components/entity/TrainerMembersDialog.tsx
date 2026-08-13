import { Users } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { getInitials } from '@/lib/utils'
import type { ManagedUser } from '@/api/user-management.api'

interface TrainerMembersDialogProps {
  open: boolean
  onClose: () => void
  trainer: ManagedUser | null
  members: ManagedUser[]
}

/** Read-only list of every member currently assigned to one trainer. */
export function TrainerMembersDialog({ open, onClose, trainer, members }: TrainerMembersDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {trainer ? `${trainer.fullName ?? trainer.firstName}'s Members` : 'Members'}
          </DialogTitle>
        </DialogHeader>

        {members.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
              <Users className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No members assigned yet.</p>
          </div>
        ) : (
          <div className="max-h-80 space-y-1 overflow-y-auto">
            {members.map((m) => (
              <div key={m.id} className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-muted/50">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback className="text-xs font-semibold text-white bg-gradient-to-br from-blue-500 to-blue-700">
                    {getInitials(m.fullName ?? m.firstName)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">
                    {m.fullName ?? m.firstName}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{m.email ?? '—'}</p>
                </div>
                <Badge variant={m.status === 'Active' ? 'success' : 'secondary'}>{m.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
