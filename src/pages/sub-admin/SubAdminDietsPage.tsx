import { useState } from 'react'
import { Plus, Flame, Trash2 } from 'lucide-react'
import { CreateDietDialog } from '@/components/entity/CreateDietDialog'
import { useDiets, useDeleteDiet } from '@/hooks/useDiets'
import { useUsersByRole } from '@/hooks/useUsers'
import { useRoles } from '@/hooks/useRoles'
import type { DietStatus } from '@/api/diets.api'
import type { ManagedUser } from '@/api/user-management.api'
import { T, mono } from '@/components/scoreboard/tokens'
import { Hero, ScoreCard, ScoreboardCta, ScoreboardIconButton, RowCardList, RowCard, StatusPill } from '@/components/scoreboard/primitives'

// Swap in a real nutrition/meal-prep photo here once available — see
// Hero's placeholder fallback in the meantime.
const HERO_IMAGE: string | null = null

const statusTone: Record<DietStatus, 'forest' | 'amber' | 'signal'> = {
  Draft: 'amber',
  Active: 'forest',
  Completed: 'forest',
}

function findUser(users: ManagedUser[], id: number | null) {
  if (!id) return undefined
  return users.find((u) => u.id === String(id))
}

export default function SubAdminDietsPage() {
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

  const deletingId = deleteDiet.isPending ? (deleteDiet.variables ?? null) : null

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
          <ScoreboardCta icon={Plus} onClick={() => setCreateOpen(true)}>
            Assign Diet Plan
          </ScoreboardCta>
        }
      >
        <RowCardList
          isLoading={isLoading}
          isError={isError}
          onRetry={refetch}
          isEmpty={!isLoading && !isError && (diets?.length ?? 0) === 0}
          emptyMessage="No diet plans yet. Assign the first one."
        >
          {diets?.map((d) => (
            <RowCard key={d.id} columns="1.5fr 1.3fr 1.1fr 0.9fr 0.9fr auto">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,70,32,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Flame size={18} color={T.signal} />
                </div>
                <div style={{ fontWeight: 700, fontSize: 14.5, color: T.text }}>{d.name}</div>
              </div>
              <div style={{ fontSize: 13.5, color: T.text }}>
                <span style={{ ...mono, fontSize: 9.5, color: T.dim, display: 'block', letterSpacing: '0.06em' }}>MEMBER</span>
                {memberName(d.clientId)}
              </div>
              <div style={{ fontSize: 13.5, color: T.text }}>
                <span style={{ ...mono, fontSize: 9.5, color: T.dim, display: 'block', letterSpacing: '0.06em' }}>TRAINER</span>
                {trainerName(d.trainerId)}
              </div>
              <div>
                <span
                  style={{
                    ...mono,
                    fontSize: 11,
                    fontWeight: 700,
                    color: T.brass,
                    background: '#FBF6EA',
                    padding: '5px 10px',
                    borderRadius: 8,
                    border: `1px solid ${T.brass}55`,
                  }}
                >
                  {d.goal}
                </span>
              </div>
              <StatusPill tone={statusTone[d.status]}>{d.status}</StatusPill>
              <ScoreboardIconButton icon={Trash2} label="Remove" onClick={() => deleteDiet.mutate(d.id)} disabled={deletingId === d.id} />
            </RowCard>
          ))}
        </RowCardList>
      </ScoreCard>

      <CreateDietDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        memberOptions={members}
        trainerOptions={trainers}
      />
    </>
  )
}
