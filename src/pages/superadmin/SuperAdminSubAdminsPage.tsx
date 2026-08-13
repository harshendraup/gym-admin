import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { Plus, Trash2 } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EntityListPage } from '@/components/entity/EntityListPage'
import { CreateScopedUserDialog } from '@/components/entity/CreateScopedUserDialog'
import { useRoles } from '@/hooks/useRoles'
import { useUsersByRole, useDeleteUser } from '@/hooks/useUsers'
import { businessRegistryApi } from '@/api/business-registry.api'
import type { ManagedUser } from '@/api/user-management.api'

function getColumns(
  businessName: (id: number | null) => string,
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

export default function SuperAdminSubAdminsPage() {
  const [createOpen, setCreateOpen] = useState(false)

  const { data: businesses = [] } = useQuery({
    queryKey: ['businesses'],
    queryFn: () => businessRegistryApi.list(),
  })
  const businessName = (id: number | null) => businesses.find((b) => b.id === id)?.businessName ?? '—'

  const { subAdminRole } = useRoles()
  const subAdmins = useUsersByRole(subAdminRole?.id)
  const deleteUser = useDeleteUser()

  const columns = getColumns(
    businessName,
    (u) => {
      if (window.confirm(`Delete sub-admin "${u.fullName ?? u.firstName}"? They will lose access immediately.`)) {
        deleteUser.mutate(u.id)
      }
    },
    deleteUser.isPending ? (deleteUser.variables ?? null) : null
  )

  return (
    <div className="flex flex-col h-full">
      {/* <Header title="Sub-Admins" /> */}
      <div className="flex-1 overflow-auto p-6">
        <EntityListPage
          title="Sub-Admins"
          description="Branch managers across the platform"
          columns={columns}
          data={subAdmins.data}
          isLoading={subAdmins.isLoading}
          isError={subAdmins.isError}
          onRetry={subAdmins.refetch}
          emptyMessage="No sub-admins yet."
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
        businessOptions={businesses}
        branchRequired
      />
    </div>
  )
}
