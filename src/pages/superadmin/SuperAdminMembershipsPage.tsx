import { useState } from 'react'
import { Header } from '@/components/layout/Header'
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@/components/ui/select'
import { MembershipPlanGrid } from '@/components/entity/MembershipPlanGrid'
import { useMemberships } from '@/hooks/useMemberships'
import { useBusinesses } from '@/hooks/useBusinesses'
import { useBranches } from '@/hooks/useBranches'

export default function SuperAdminMembershipsPage() {
  const { data: businesses = [] } = useBusinesses()
  const [businessFilter, setBusinessFilter] = useState('')
  const [branchFilter, setBranchFilter] = useState('')

  const { data: branches = [] } = useBranches(businessFilter || undefined)

  const memberships = useMemberships(
    businessFilter
      ? { businessId: Number(businessFilter), branchId: branchFilter ? Number(branchFilter) : undefined }
      : undefined
  )

  const branchLabel = (id: number | null) => {
    if (!id) return 'All branches'
    return branches.find((b) => b.id === id)?.branchName ?? `#${id}`
  }

  return (
    <div className="flex flex-col h-full">
      <Header title="Memberships" />
      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-6 animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Membership Plans</h1>
            <p className="mt-1 text-sm" style={{ color: '#64748B' }}>
              {businessFilter
                ? "Browse a business's membership plans — pick a branch to narrow it further."
                : 'Pick a business below to see its membership plans, optionally narrowed to one branch.'}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Select
              value={businessFilter || 'none'}
              onValueChange={(v) => { setBusinessFilter(v === 'none' ? '' : v); setBranchFilter('') }}
            >
              <SelectTrigger className="h-9 w-56 text-xs"><SelectValue placeholder="Select a business..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">All businesses</SelectItem>
                {businesses.map((b) => (
                  <SelectItem key={b.id} value={String(b.id)}>{b.businessName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={branchFilter || 'all'} onValueChange={(v) => setBranchFilter(v === 'all' ? '' : v)} disabled={!businessFilter}>
              <SelectTrigger className="h-9 w-48 text-xs">
                <SelectValue placeholder={businessFilter ? 'All branches' : 'Select a business first'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All branches</SelectItem>
                {branches.map((b) => (
                  <SelectItem key={b.id} value={String(b.id)}>{b.branchName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <MembershipPlanGrid
            data={memberships.data}
            isLoading={memberships.isLoading}
            isError={memberships.isError}
            onRetry={memberships.refetch}
            emptyMessage={businessFilter ? 'No membership plans for this business yet.' : 'Select a business to see its membership plans.'}
            branchLabel={branchLabel}
          />
        </div>
      </div>
    </div>
  )
}
