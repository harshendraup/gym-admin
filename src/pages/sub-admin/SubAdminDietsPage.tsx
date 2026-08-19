import { useState } from 'react'
import { Plus } from 'lucide-react'
import { CreateDietDialog } from '@/components/entity/CreateDietDialog'
import { DietPlanGrid } from '@/components/entity/DietPlanGrid'
import { useDiets, useDeleteDiet } from '@/hooks/useDiets'
import { useUsersByRole } from '@/hooks/useUsers'
import { useRoles } from '@/hooks/useRoles'
import type { DietRecord } from '@/api/diets.api'
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
    <>
      <Hero
        image={HERO_IMAGE}
        placeholderLabel="nutrition"
        eyebrow="Nutrition Programs"
        title="Diet Plans"
        subtitle="Plans assigned to members in your branch, tracked start to finish."
      />

      <ScoreCard
        title={`Active Programs · ${diets?.length ?? 0}`}
        subtitle="Diet plans assigned to members in your branch"
        action={
          <ScoreboardCta icon={Plus} onClick={() => { setEditing(null); setFormOpen(true) }}>
            Assign Diet Plan
          </ScoreboardCta>
        }
      >
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
      </ScoreCard>

      <CreateDietDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        memberOptions={members}
        trainerOptions={trainers}
        diet={editing}
      />
    </>
  )
}
