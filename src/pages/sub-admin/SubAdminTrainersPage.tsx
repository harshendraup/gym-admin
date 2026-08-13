import { useMemo, useState } from 'react'
import { Plus, Trash2, Mail, Phone, Users } from 'lucide-react'
import { CreateScopedUserDialog } from '@/components/entity/CreateScopedUserDialog'
import { TrainerMembersDialog } from '@/components/entity/TrainerMembersDialog'
import { useRoles } from '@/hooks/useRoles'
import { useUsersByRole, useDeleteUser } from '@/hooks/useUsers'
import { useAuthStore } from '@/store/auth.store'
import type { ManagedUser } from '@/api/user-management.api'
import { T, mono } from '@/components/scoreboard/tokens'
import { Hero, ScoreCard, ScoreboardCta, ScoreboardIconButton, RowCardList, RowCard, Avatar, StatusPill } from '@/components/scoreboard/primitives'

// Swap in a real coaching-staff photo here once available — see Hero's
// placeholder fallback in the meantime.
const HERO_IMAGE: string | null = null

function initialsOf(name: string) {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
}

export default function SubAdminTrainersPage() {
  const { trainerRole, memberRole } = useRoles()
  const { data: trainers, isLoading, isError, refetch } = useUsersByRole(trainerRole?.id)
  const { data: members = [] } = useUsersByRole(memberRole?.id)
  const gymContext = useAuthStore((s) => s.gymContext)
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

  const deletingId = deleteUser.isPending ? (deleteUser.variables ?? null) : null

  return (
    <>
      <Hero
        image={HERO_IMAGE}
        placeholderLabel="coaching staff"
        eyebrow="Coaching Staff"
        title="Trainers"
        subtitle="Every coach assigned to your branch, their reach, and their load."
      />

      <ScoreCard
        title={`Roster · ${trainers?.length ?? 0}`}
        subtitle="Trainers in your branch"
        action={
          <ScoreboardCta icon={Plus} onClick={() => setCreateOpen(true)}>
            Add Trainer
          </ScoreboardCta>
        }
      >
        <RowCardList
          isLoading={isLoading}
          isError={isError}
          onRetry={refetch}
          isEmpty={!isLoading && !isError && (trainers?.length ?? 0) === 0}
          emptyMessage="No trainers yet. Add the first one."
        >
          {trainers?.map((t) => {
            const name = t.fullName ?? t.firstName
            const count = membersByTrainer.get(t.id)?.length ?? 0
            return (
              <RowCard key={t.id} columns="auto 1.4fr 1.6fr 1.1fr 0.9fr 1fr auto">
                <Avatar initials={initialsOf(name)} tone="ink" />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14.5, color: T.text }}>{name}</div>
                  <div style={{ ...mono, fontSize: 10.5, color: T.dim, letterSpacing: '0.06em' }}>TRAINER</div>
                </div>
                <div style={{ fontSize: 13.5, color: T.dim, display: 'flex', alignItems: 'center', gap: 7 }}>
                  <Mail size={13} /> {t.email ?? '—'}
                </div>
                <div style={{ ...mono, fontSize: 13, color: T.text, display: 'flex', alignItems: 'center', gap: 7 }}>
                  <Phone size={13} color={T.dim} /> {t.mobile ?? '—'}
                </div>
                <div>
                  <StatusPill tone={t.status === 'Active' ? 'forest' : 'amber'}>{t.status}</StatusPill>
                </div>
                <button
                  onClick={() => setViewingTrainer(t)}
                  style={{ fontSize: 13.5, color: T.text, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  <Users size={14} color={T.forest} /> {count} {count === 1 ? 'member' : 'members'}
                </button>
                <ScoreboardIconButton icon={Trash2} onClick={() => deleteUser.mutate(t.id)} disabled={deletingId === t.id} />
              </RowCard>
            )
          })}
        </RowCardList>
      </ScoreCard>

      <CreateScopedUserDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        roleId={trainerRole?.id}
        roleLabel="Trainer"
        businessId={gymContext?.businessId ? Number(gymContext.businessId) : undefined}
        branchId={gymContext?.branchId ? Number(gymContext.branchId) : undefined}
      />

      <TrainerMembersDialog
        open={!!viewingTrainer}
        onClose={() => setViewingTrainer(null)}
        trainer={viewingTrainer}
        members={viewingTrainer ? membersByTrainer.get(viewingTrainer.id) ?? [] : []}
      />
    </>
  )
}
