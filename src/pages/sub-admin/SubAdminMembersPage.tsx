import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { CreateScopedUserDialog } from '@/components/entity/CreateScopedUserDialog'
import { useRoles } from '@/hooks/useRoles'
import { useUsersByRole } from '@/hooks/useUsers'
import { useAuthStore } from '@/store/auth.store'
import { T } from '@/components/scoreboard/tokens'
import { Hero, ScoreCard, ScoreboardCta, RowCardList, RowCard, Avatar, StatusPill } from '@/components/scoreboard/primitives'

// Swap in a real roster/group-photo here once available — see Hero's
// placeholder fallback in the meantime.
const HERO_IMAGE: string | null = null

function initialsOf(name: string) {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
}

export default function SubAdminMembersPage() {
  const navigate = useNavigate()
  const { memberRole } = useRoles()
  const { data: members, isLoading, isError, refetch } = useUsersByRole(memberRole?.id)
  const gymContext = useAuthStore((s) => s.gymContext)
  const [createOpen, setCreateOpen] = useState(false)

  return (
    <>
      <Hero
        image={HERO_IMAGE}
        placeholderLabel="branch roster"
        eyebrow="Branch Roster"
        title="Members"
        subtitle="Everyone training under your branch."
      />

      <ScoreCard
        title={`Members · ${members?.length ?? 0}`}
        subtitle="Members in your branch"
        action={
          <ScoreboardCta icon={Plus} onClick={() => setCreateOpen(true)}>
            Add Member
          </ScoreboardCta>
        }
      >
        <RowCardList
          isLoading={isLoading}
          isError={isError}
          onRetry={refetch}
          isEmpty={!isLoading && !isError && (members?.length ?? 0) === 0}
          emptyMessage="No members yet. Add the first one."
        >
          {members?.map((m) => {
            const name = m.fullName ?? m.firstName
            return (
              <RowCard key={m.id} columns="auto 1.3fr 1.1fr 1fr 0.9fr">
                <Avatar initials={initialsOf(name)} tone="forest" />
                <div style={{ fontWeight: 700, fontSize: 14.5, color: T.text }}>{name}</div>
                <div style={{ fontSize: 13.5, color: T.dim }}>
                  {m.mobile ?? m.email ?? '—'}
                </div>
                <button
                  onClick={() => navigate(`/sub-admin/members/${m.id}`)}
                  style={{ fontSize: 13, fontWeight: 700, color: T.signalDark, background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }}
                >
                  View
                </button>
                <StatusPill tone={m.status === 'Active' ? 'forest' : 'amber'}>{m.status}</StatusPill>
              </RowCard>
            )
          })}
        </RowCardList>
      </ScoreCard>

      <CreateScopedUserDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        roleId={memberRole?.id}
        roleLabel="Member"
        businessId={gymContext?.businessId ? Number(gymContext.businessId) : undefined}
        branchId={gymContext?.branchId ? Number(gymContext.branchId) : undefined}
      />
    </>
  )
}
