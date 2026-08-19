import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { CreateDietDialog } from '@/components/entity/CreateDietDialog'
import { DietPlanGrid } from '@/components/entity/DietPlanGrid'
import { useDiets, useDeleteDiet } from '@/hooks/useDiets'
import { useUsersByRole } from '@/hooks/useUsers'
import { useRoles } from '@/hooks/useRoles'
import type { DietRecord } from '@/api/diets.api'
import type { ManagedUser } from '@/api/user-management.api'

function findUser(users: ManagedUser[], id: number | null) {
  if (!id) return undefined
  return users.find((u) => u.id === String(id))
}

export default function AdminDietsPage() {
  const { data: diets, isLoading, isError, refetch } = useDiets()
  const { memberRole, trainerRole } = useRoles()
  const { data: members = [] } = useUsersByRole(memberRole?.id)
  const { data: trainers = [] } = useUsersByRole(trainerRole?.id)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<DietRecord | null>(null)
  const deleteDiet = useDeleteDiet()

  const memberLabel = (id: number) => {
    const u = findUser(members, id)
    return u ? (u.fullName ?? u.firstName) : `#${id}`
  }
  const trainerLabel = (id: number | null) => {
    if (!id) return 'Unassigned'
    const u = findUser(trainers, id)
    return u ? (u.fullName ?? u.firstName) : `#${id}`
  }

  return (
    <div className="flex flex-col h-full">
      <Header title="Diet Plans" />
      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Diet Plans</h1>
              <p className="mt-1 text-sm" style={{ color: '#64748B' }}>
                Nutrition plans assigned to members within your business — targets, macros, and who's coaching them.
              </p>
            </div>
            <Button size="sm" onClick={() => { setEditing(null); setFormOpen(true) }}>
              <Plus className="mr-1.5 h-4 w-4" /> Assign Diet Plan
            </Button>
          </div>

          <DietPlanGrid
            data={diets}
            isLoading={isLoading}
            isError={isError}
            onRetry={refetch}
            emptyMessage="No diet plans yet. Assign the first one."
            memberLabel={memberLabel}
            trainerLabel={trainerLabel}
            onEdit={(d) => { setEditing(d); setFormOpen(true) }}
            onDelete={(d) => deleteDiet.mutate(d.id)}
            deletingId={deleteDiet.isPending ? (deleteDiet.variables ?? null) : null}
          />
        </div>
      </div>

      <CreateDietDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        memberOptions={members}
        trainerOptions={trainers}
        diet={editing}
      />
    </div>
  )
}
