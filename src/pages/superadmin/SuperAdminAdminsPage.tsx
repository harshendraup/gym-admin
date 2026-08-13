import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { Plus, Trash2 } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EntityListPage } from '@/components/entity/EntityListPage'
import { CreateBusinessAdminDialog } from '@/components/entity/CreateBusinessAdminDialog'
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

/**
 * Platform-wide view of every business admin. Sub-Admins/Trainers/Members
 * each have their own sidebar item and page (SuperAdminSubAdminsPage,
 * SuperAdminTrainersPage, SuperAdminMembersPage) instead of being tabs here.
 */
export default function SuperAdminAdminsPage() {
  const [createAdminOpen, setCreateAdminOpen] = useState(false)

  const { data: businesses = [] } = useQuery({
    queryKey: ['businesses'],
    queryFn: () => businessRegistryApi.list(),
  })
  const businessName = (id: number | null) => businesses.find((b) => b.id === id)?.businessName ?? '—'

  const { adminRole } = useRoles()
  const admins = useUsersByRole(adminRole?.id)
  const deleteUser = useDeleteUser()

  const columns = getColumns(
    businessName,
    (u) => {
      if (window.confirm(`Delete admin "${u.fullName ?? u.firstName}"? They will lose access immediately.`)) {
        deleteUser.mutate(u.id)
      }
    },
    deleteUser.isPending ? (deleteUser.variables ?? null) : null
  )

  return (
    <div className="flex flex-col h-full">
      <Header title="Admins" />
      <div className="flex-1 overflow-auto p-6">
        <EntityListPage
          title="Admins"
          description="Business admins across the platform"
          columns={columns}
          data={admins.data}
          isLoading={admins.isLoading}
          isError={admins.isError}
          onRetry={admins.refetch}
          emptyMessage="No admins yet."
          actions={
            <Button size="sm" onClick={() => setCreateAdminOpen(true)}>
              <Plus className="mr-1.5 h-4 w-4" /> Add Admin
            </Button>
          }
        />
      </div>

      <CreateBusinessAdminDialog
        open={createAdminOpen}
        businessOptions={businesses}
        onClose={() => setCreateAdminOpen(false)}
      />
    </div>
  )
}
