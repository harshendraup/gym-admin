import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@/components/ui/select'
import { MembershipFormDialog } from '@/components/entity/MembershipFormDialog'
import { MembershipPlanGrid } from '@/components/entity/MembershipPlanGrid'
import { useMemberships, useDeleteMembership } from '@/hooks/useMemberships'
import { useBranches } from '@/hooks/useBranches'
import { useAuthStore } from '@/store/auth.store'
import type { MembershipRecord } from '@/api/memberships.api'

export default function AdminMembershipsPage() {
  const gymContext = useAuthStore((s) => s.gymContext)
  const { data: branches = [] } = useBranches(gymContext?.businessId)
  const [branchFilter, setBranchFilter] = useState('')

  const memberships = useMemberships(branchFilter ? { branchId: Number(branchFilter) } : undefined)
  const deleteMembership = useDeleteMembership()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<MembershipRecord | null>(null)

  const branchLabel = (id: number | null) => {
    if (!id) return 'All branches'
    return branches.find((b) => b.id === id)?.branchName ?? `#${id}`
  }

  return (
    <div className="flex flex-col h-full">
      <Header title="Memberships" />
      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Membership Plans</h1>
              <p className="mt-1 text-sm" style={{ color: '#64748B' }}>
                The plans members actually sign up for — set pricing, duration, and perks here, then members pick one when they join.
              </p>
            </div>
            <Button size="sm" onClick={() => { setEditing(null); setFormOpen(true) }}>
              <Plus className="mr-1.5 h-4 w-4" /> Create Plan
            </Button>
          </div>

          <Select value={branchFilter || 'all'} onValueChange={(v) => setBranchFilter(v === 'all' ? '' : v)}>
            <SelectTrigger className="h-9 w-48 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All branches</SelectItem>
              {branches.map((b) => (
                <SelectItem key={b.id} value={String(b.id)}>{b.branchName}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <MembershipPlanGrid
            data={memberships.data}
            isLoading={memberships.isLoading}
            isError={memberships.isError}
            onRetry={memberships.refetch}
            emptyMessage="No membership plans yet — create your first one."
            branchLabel={branchLabel}
            onEdit={(m) => { setEditing(m); setFormOpen(true) }}
            onDelete={(m) => deleteMembership.mutate(m.id)}
            deletingId={deleteMembership.isPending ? (deleteMembership.variables ?? null) : null}
          />
        </div>
      </div>

      <MembershipFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        membership={editing}
        branchOptions={branches}
      />
    </div>
  )
}
