import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useMemberships, useDeleteMembership } from '@/hooks/useMemberships'
import { MembershipFormDialog } from '@/components/entity/MembershipFormDialog'
import { MembershipPlanGrid } from '@/components/entity/MembershipPlanGrid'
import { useAuthStore } from '@/store/auth.store'
import type { MembershipRecord } from '@/api/memberships.api'
import { Hero, ScoreCard, ScoreboardCta } from '@/components/scoreboard/primitives'

const HERO_IMAGE: string | null = null

export default function SubAdminMembershipsPage() {
  const gymContext = useAuthStore((s) => s.gymContext)
  const memberships = useMemberships()
  const deleteMembership = useDeleteMembership()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<MembershipRecord | null>(null)

  return (
    <>
      <Hero
        image={HERO_IMAGE}
        placeholderLabel="front desk"
        eyebrow="Billing"
        title="Memberships"
        subtitle="The plans your members sign up for at this branch — pricing, duration, and what's included in each one."
      />

      <ScoreCard
        title={`Membership Plans · ${memberships.data?.length ?? 0}`}
        subtitle="Plans available at your branch"
        action={
          <ScoreboardCta icon={Plus} onClick={() => { setEditing(null); setFormOpen(true) }}>
            Create Plan
          </ScoreboardCta>
        }
      >
        <MembershipPlanGrid
          data={memberships.data}
          isLoading={memberships.isLoading}
          isError={memberships.isError}
          onRetry={memberships.refetch}
          emptyMessage="No membership plans yet — create your first one."
          branchLabel={() => 'This branch'}
          onEdit={(m) => { setEditing(m); setFormOpen(true) }}
          onDelete={(m) => deleteMembership.mutate(m.id)}
          deletingId={deleteMembership.isPending ? (deleteMembership.variables ?? null) : null}
        />
      </ScoreCard>

      <MembershipFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        membership={editing}
        fixedBranchId={gymContext?.branchId ? Number(gymContext.branchId) : undefined}
      />
    </>
  )
}
