import { useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Plus } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EntityListPage } from '@/components/entity/EntityListPage'
import { CreateDietDialog } from '@/components/entity/CreateDietDialog'
import { useDiets, useDeleteDiet } from '@/hooks/useDiets'
import { useUsersByRole } from '@/hooks/useUsers'
import { useRoles } from '@/hooks/useRoles'
import type { DietRecord, DietStatus } from '@/api/diets.api'
import type { ManagedUser } from '@/api/user-management.api'

const statusVariant: Record<DietStatus, 'secondary' | 'success' | 'default'> = {
  Draft: 'secondary',
  Active: 'success',
  Completed: 'default',
}

function getColumns(
  memberName: (id: number) => string,
  trainerName: (id: number | null) => string,
  onDelete: (d: DietRecord) => void,
  deletingId: number | null
): ColumnDef<DietRecord>[] {
  return [
    { header: 'Plan', cell: ({ row }) => <span className="font-medium text-slate-900">{row.original.name}</span> },
    { header: 'Member', cell: ({ row }) => memberName(row.original.clientId) },
    { header: 'Trainer', cell: ({ row }) => trainerName(row.original.trainerId) },
    { header: 'Goal', cell: ({ row }) => row.original.goal },
    {
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={statusVariant[row.original.status]}>{row.original.status}</Badge>
      ),
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
            Remove
          </Button>
        </div>
      ),
    },
  ]
}

function findUser(users: ManagedUser[], id: number | null) {
  if (!id) return undefined
  return users.find((u) => u.id === String(id))
}

export default function AdminDietsPage() {
  const { data: diets, isLoading, isError, refetch } = useDiets()
  const { memberRole, trainerRole } = useRoles()
  const { data: members = [] } = useUsersByRole(memberRole?.id)
  const { data: trainers = [] } = useUsersByRole(trainerRole?.id)
  const [createOpen, setCreateOpen] = useState(false)
  const deleteDiet = useDeleteDiet()

  const memberName = (id: number) => {
    const u = findUser(members, id)
    return u ? (u.fullName ?? u.firstName) : `#${id}`
  }
  const trainerName = (id: number | null) => {
    if (!id) return 'Unassigned'
    const u = findUser(trainers, id)
    return u ? (u.fullName ?? u.firstName) : `#${id}`
  }

  const columns = getColumns(
    memberName,
    trainerName,
    (d) => deleteDiet.mutate(d.id),
    deleteDiet.isPending ? (deleteDiet.variables ?? null) : null
  )

  return (
    <div className="flex flex-col h-full">
      <Header title="Diet Plans" />
      <div className="flex-1 overflow-auto p-6">
        <EntityListPage
          title="Diet Plans"
          description="Diet plans assigned to members within your business"
          columns={columns}
          data={diets}
          isLoading={isLoading}
          isError={isError}
          onRetry={refetch}
          emptyMessage="No diet plans yet. Assign the first one."
          actions={
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="mr-1.5 h-4 w-4" /> Assign Diet Plan
            </Button>
          }
        />
      </div>

      <CreateDietDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        memberOptions={members}
        trainerOptions={trainers}
      />
    </div>
  )
}
