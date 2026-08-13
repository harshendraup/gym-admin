import { useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Plus, Trash2, Users } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EntityListPage } from '@/components/entity/EntityListPage'
import { CreateScopedUserDialog } from '@/components/entity/CreateScopedUserDialog'
import { TrainerMembersDialog } from '@/components/entity/TrainerMembersDialog'
import { useRoles } from '@/hooks/useRoles'
import { useUsersByRole, useDeleteUser } from '@/hooks/useUsers'
import { useBranches } from '@/hooks/useBranches'
import { useAuthStore } from '@/store/auth.store'
import type { ManagedUser } from '@/api/user-management.api'

function getColumns(
  branchName: (id: number | null) => string,
  memberCount: (trainerId: string) => number,
  onViewMembers: (u: ManagedUser) => void,
  onDelete: (u: ManagedUser) => void,
  deletingId: string | null
): ColumnDef<ManagedUser>[] {
  return [
    {
      header: 'Name',
      cell: ({ row }) => (
        <span className="font-medium text-slate-900">{row.original.fullName ?? row.original.firstName}</span>
      ),
    },
    { header: 'Email', cell: ({ row }) => row.original.email ?? '—' },
    { header: 'Branch', cell: ({ row }) => branchName(row.original.branchId) },
    {
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.status === 'Active' ? 'success' : 'secondary'}>
          {row.original.status}
        </Badge>
      ),
    },
    {
      header: 'Members',
      cell: ({ row }) => {
        const count = memberCount(row.original.id)
        return (
          <Button variant="link" size="sm" className="h-auto p-0" onClick={() => onViewMembers(row.original)}>
            <Users className="mr-1.5 h-3.5 w-3.5" />
            {count} {count === 1 ? 'member' : 'members'}
          </Button>
        )
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onDelete(row.original)}
            disabled={deletingId === row.original.id}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]
}

export default function AdminTrainersPage() {
  const { trainerRole, memberRole } = useRoles()
  const { data: trainers, isLoading, isError, refetch } = useUsersByRole(trainerRole?.id)
  const { data: members = [] } = useUsersByRole(memberRole?.id)
  const gymContext = useAuthStore((s) => s.gymContext)
  const { data: branches = [] } = useBranches(gymContext?.businessId)
  const [createOpen, setCreateOpen] = useState(false)
  const [viewingTrainer, setViewingTrainer] = useState<ManagedUser | null>(null)
  const deleteUser = useDeleteUser()

  const membersByTrainer = useMemo(() => {
    const map = new Map<string, ManagedUser[]>()
    for (const m of members) {
      if (!m.trainerId) continue
      const key = String(m.trainerId)
      map.set(key, [...(map.get(key) ?? []), m])
    }
    return map
  }, [members])

  const branchName = (id: number | null) => branches.find((b) => b.id === id)?.branchName ?? '—'
  const columns = getColumns(
    branchName,
    (trainerId) => membersByTrainer.get(trainerId)?.length ?? 0,
    setViewingTrainer,
    (u) => deleteUser.mutate(u.id),
    deleteUser.isPending ? (deleteUser.variables ?? null) : null
  )

  return (
    <div className="flex flex-col h-full">
      {/* <Header title="Trainers" /> */}
      <div className="flex-1 overflow-auto p-6">
        <EntityListPage
          title="Trainers"
          description="Trainers within your business"
          columns={columns}
          data={trainers}
          isLoading={isLoading}
          isError={isError}
          onRetry={refetch}
          emptyMessage="No trainers yet. Add the first one."
          actions={
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="mr-1.5 h-4 w-4" /> Add Trainer
            </Button>
          }
        />
      </div>

      <CreateScopedUserDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        roleId={trainerRole?.id}
        roleLabel="Trainer"
        businessId={gymContext?.businessId ? Number(gymContext.businessId) : undefined}
        branchRequired
      />

      <TrainerMembersDialog
        open={!!viewingTrainer}
        onClose={() => setViewingTrainer(null)}
        trainer={viewingTrainer}
        members={viewingTrainer ? membersByTrainer.get(viewingTrainer.id) ?? [] : []}
      />
    </div>
  )
}
