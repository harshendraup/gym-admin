import { useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Plus, Trash2 } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EntityListPage } from '@/components/entity/EntityListPage'
import { CreateScopedUserDialog } from '@/components/entity/CreateScopedUserDialog'
import { useRoles } from '@/hooks/useRoles'
import { useUsersByRole, useDeleteUser } from '@/hooks/useUsers'
import { useBranches } from '@/hooks/useBranches'
import { useAuthStore } from '@/store/auth.store'
import type { ManagedUser } from '@/api/user-management.api'

function getColumns(
  branchName: (id: number | null) => string,
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
        <div className="flex justify-end">
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

export default function AdminSubAdminsPage() {
  const { subAdminRole } = useRoles()
  const { data: subAdmins, isLoading, isError, refetch } = useUsersByRole(subAdminRole?.id)
  const gymContext = useAuthStore((s) => s.gymContext)
  const { data: branches = [] } = useBranches(gymContext?.businessId)
  const [createOpen, setCreateOpen] = useState(false)
  const deleteUser = useDeleteUser()

  const branchName = (id: number | null) => branches.find((b) => b.id === id)?.branchName ?? '—'
  const columns = getColumns(
    branchName,
    (u) => deleteUser.mutate(u.id),
    deleteUser.isPending ? (deleteUser.variables ?? null) : null
  )

  return (
    <div className="flex flex-col h-full">
      {/* <Header title="Sub-Admins" /> */}
      <div className="flex-1 overflow-auto p-6">
        <EntityListPage
          title="Sub-Admins"
          description="Branch managers within your business"
          columns={columns}
          data={subAdmins}
          isLoading={isLoading}
          isError={isError}
          onRetry={refetch}
          emptyMessage="No sub-admins yet. Add the first one."
          actions={
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="mr-1.5 h-4 w-4" /> Add Sub-Admin
            </Button>
          }
        />
      </div>

      <CreateScopedUserDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        roleId={subAdminRole?.id}
        roleLabel="Sub-Admin"
        businessId={gymContext?.businessId ? Number(gymContext.businessId) : undefined}
        branchRequired
      />
    </div>
  )
}
