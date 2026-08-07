import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ColumnDef } from '@tanstack/react-table'
import { Plus } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EntityListPage } from '@/components/entity/EntityListPage'
import { CreateScopedUserDialog } from '@/components/entity/CreateScopedUserDialog'
import { useRoles } from '@/hooks/useRoles'
import { useUsersByRole } from '@/hooks/useUsers'
import { useAuthStore } from '@/store/auth.store'
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

export default function SubAdminMembersPage() {
  const navigate = useNavigate()
  const { memberRole } = useRoles()
  const { data: members, isLoading, isError, refetch } = useUsersByRole(memberRole?.id)
  const gymContext = useAuthStore((s) => s.gymContext)
  const [createOpen, setCreateOpen] = useState(false)

  const columns = getColumns((u) => navigate(`/sub-admin/members/${u.id}`))

  return (
    <div className="flex flex-col h-full">
      <Header title="Members" />
      <div className="flex-1 overflow-auto p-6">
        <EntityListPage
          title="Members"
          description="Members in your branch"
          columns={columns}
          data={members}
          isLoading={isLoading}
          isError={isError}
          onRetry={refetch}
          emptyMessage="No members yet. Add the first one."
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
        businessId={gymContext?.businessId ? Number(gymContext.businessId) : undefined}
        branchId={gymContext?.branchId ? Number(gymContext.branchId) : undefined}
      />
    </div>
  )
}
