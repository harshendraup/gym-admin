import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { Plus, Trash2 } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@/components/ui/select'
import { EntityListPage } from '@/components/entity/EntityListPage'
import { CreateScopedUserDialog } from '@/components/entity/CreateScopedUserDialog'
import { useRoles } from '@/hooks/useRoles'
import { useUsersByRole, useDeleteUser } from '@/hooks/useUsers'
import { useBranches } from '@/hooks/useBranches'
import { businessRegistryApi } from '@/api/business-registry.api'
import type { ManagedUser } from '@/api/user-management.api'

const ALL = '__all__'

function getColumns(
  businessName: (id: number | null) => string,
  branchName: (id: number | null) => string,
  onView: (u: ManagedUser) => void,
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
    { header: 'Business', cell: ({ row }) => businessName(row.original.businessId) },
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
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="outline" onClick={() => onView(row.original)}>View</Button>
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

/**
 * Platform-wide member management: every member is listed up front;
 * Business/Branch are optional filters that narrow the same list, they
 * don't gate it. Creating a member is a separate flow (Add Member button)
 * that always asks to pick a business then a branch, independent of
 * whatever filter is currently applied to the list.
 */
export default function SuperAdminMembersPage() {
  const navigate = useNavigate()
  const [businessFilter, setBusinessFilter] = useState<string>('')
  const [branchFilter, setBranchFilter] = useState<string>('')
  const [createOpen, setCreateOpen] = useState(false)

  const { data: businesses = [] } = useQuery({
    queryKey: ['businesses'],
    queryFn: () => businessRegistryApi.list(),
  })
  // Branch options for the filter cascade off the chosen business (or list
  // every branch when no business filter is set yet).
  const { data: branchOptions = [] } = useBranches(businessFilter || undefined)
  // Separate unfiltered fetch so row labels resolve correctly regardless of
  // which filters are currently applied.
  const { data: allBranches = [] } = useBranches()

  const { memberRole } = useRoles()
  const { data: allMembers = [], isLoading, isError, refetch } = useUsersByRole(memberRole?.id)
  const deleteUser = useDeleteUser()

  const members = useMemo(
    () =>
      allMembers.filter(
        (u) =>
          (!businessFilter || String(u.businessId) === businessFilter) &&
          (!branchFilter || String(u.branchId) === branchFilter)
      ),
    [allMembers, businessFilter, branchFilter]
  )

  const businessName = (id: number | null) => businesses.find((b) => b.id === id)?.businessName ?? '—'
  const branchName = (id: number | null) => allBranches.find((b) => b.id === id)?.branchName ?? '—'

  const columns = getColumns(
    businessName,
    branchName,
    (u) => navigate(`/superadmin/branches/${u.branchId}/members/${u.id}`),
    (u) => deleteUser.mutate(u.id),
    deleteUser.isPending ? (deleteUser.variables ?? null) : null
  )

  const filteredBusinessLabel = businesses.find((b) => String(b.id) === businessFilter)?.businessName
  const filteredBranchLabel = branchOptions.find((b) => String(b.id) === branchFilter)?.branchName
  const description = filteredBranchLabel
    ? `Members of ${filteredBranchLabel}`
    : filteredBusinessLabel
      ? `Members of ${filteredBusinessLabel}`
      : 'Members across the platform'

  return (
    <div className="flex flex-col h-full">
      <Header title="Members" />
      <div className="flex-1 overflow-auto p-6 space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:max-w-lg">
          <div className="space-y-1.5">
            <Label>Business</Label>
            <Select
              value={businessFilter || ALL}
              onValueChange={(v) => {
                setBusinessFilter(v === ALL ? '' : v)
                setBranchFilter('')
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Businesses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All Businesses</SelectItem>
                {businesses.map((b) => (
                  <SelectItem key={b.id} value={String(b.id)}>{b.businessName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Branch</Label>
            <Select
              value={branchFilter || ALL}
              onValueChange={(v) => setBranchFilter(v === ALL ? '' : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Branches" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All Branches</SelectItem>
                {branchOptions.map((b) => (
                  <SelectItem key={b.id} value={String(b.id)}>{b.branchName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <EntityListPage
          title="Members"
          description={description}
          columns={columns}
          data={members}
          isLoading={isLoading}
          isError={isError}
          onRetry={refetch}
          emptyMessage="No members found."
          actions={
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="mr-1.5 h-4 w-4" /> Add Member
            </Button>
          }
        />
      </div>

      <CreateScopedUserDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        roleId={memberRole?.id}
        roleLabel="Member"
        businessOptions={businesses}
        branchRequired
      />
    </div>
  )
}
