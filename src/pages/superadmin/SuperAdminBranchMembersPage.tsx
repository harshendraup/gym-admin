import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EntityListPage } from '@/components/entity/EntityListPage'
import { useRoles } from '@/hooks/useRoles'
import { useUsersByRole } from '@/hooks/useUsers'
import { branchesApi } from '@/api/branches.api'
import type { ManagedUser } from '@/api/user-management.api'

function getColumns(onView: (u: ManagedUser) => void): ColumnDef<ManagedUser>[] {
  return [
    {
      header: 'Name',
      cell: ({ row }) => (
        <span className="font-medium text-slate-900">{row.original.fullName ?? row.original.firstName}</span>
      ),
    },
    { header: 'Email', cell: ({ row }) => row.original.email ?? '—' },
    { header: 'Mobile', cell: ({ row }) => row.original.mobile ?? '—' },
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
        <div className="flex justify-end">
          <Button size="sm" variant="outline" onClick={() => onView(row.original)}>View</Button>
        </div>
      ),
    },
  ]
}

export default function SuperAdminBranchMembersPage() {
  const { branchId } = useParams<{ branchId: string }>()
  const navigate = useNavigate()

  const { data: branch } = useQuery({
    queryKey: ['branches', 'detail', branchId],
    queryFn: () => branchesApi.get(Number(branchId)),
    enabled: !!branchId,
  })

  const { memberRole } = useRoles()
  const { data: allMembers = [], isLoading, isError, refetch } = useUsersByRole(memberRole?.id)

  const members = useMemo(
    () => allMembers.filter((u) => String(u.branchId) === branchId),
    [allMembers, branchId]
  )

  const columns = getColumns((u) => navigate(`/superadmin/branches/${branchId}/members/${u.id}`))

  return (
    <div className="flex flex-col h-full">
      <Header title={branch ? `${branch.branchName} — Members` : 'Members'} />
      <div className="flex-1 overflow-auto p-6">
        <EntityListPage
          title="Members"
          description={branch ? `Members of ${branch.branchName}` : undefined}
          columns={columns}
          data={members}
          isLoading={isLoading}
          isError={isError}
          onRetry={refetch}
          emptyMessage="No members in this branch yet."
        />
      </div>
    </div>
  )
}
