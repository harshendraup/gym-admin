import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { ShieldCheck, UserCog } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EntityListPage } from '@/components/entity/EntityListPage'
import { CreateBusinessAdminDialog } from '@/components/entity/CreateBusinessAdminDialog'
import { CreateScopedUserDialog } from '@/components/entity/CreateScopedUserDialog'
import { useRoles } from '@/hooks/useRoles'
import { useUsersByRole } from '@/hooks/useUsers'
import { businessRegistryApi } from '@/api/business-registry.api'
import type { ManagedUser } from '@/api/user-management.api'

type Row = ManagedUser & { kind: 'Admin' | 'Sub-Admin' }

function getColumns(businessName: (id: number | null) => string): ColumnDef<Row>[] {
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
      header: 'Role',
      cell: ({ row }) => (
        <Badge variant={row.original.kind === 'Admin' ? 'default' : 'secondary'}>
          {row.original.kind}
        </Badge>
      ),
    },
    {
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.status === 'Active' ? 'success' : 'secondary'}>
          {row.original.status}
        </Badge>
      ),
    },
  ]
}

/**
 * Platform-wide view of every admin/sub-admin across every business,
 * replacing the old AdminPage.tsx (which posted admin-creation to the
 * wrong endpoint). Admin creation goes through CreateBusinessAdminDialog,
 * which now genuinely calls POST /businesses/:id/admins.
 */
export default function SuperAdminAdminsPage() {
  const [createAdminOpen, setCreateAdminOpen] = useState(false)
  const [createSubAdminOpen, setCreateSubAdminOpen] = useState(false)

  const { data: businesses = [] } = useQuery({
    queryKey: ['businesses'],
    queryFn: () => businessRegistryApi.list(),
  })
  const businessName = (id: number | null) => businesses.find((b) => b.id === id)?.businessName ?? '—'

  const { adminRole, subAdminRole } = useRoles()
  const { data: admins = [], isLoading: adminsLoading, isError, refetch } = useUsersByRole(adminRole?.id)
  const { data: subAdmins = [], isLoading: subAdminsLoading } = useUsersByRole(subAdminRole?.id)

  const rows: Row[] = useMemo(
    () => [
      ...admins.map((u) => ({ ...u, kind: 'Admin' as const })),
      ...subAdmins.map((u) => ({ ...u, kind: 'Sub-Admin' as const })),
    ],
    [admins, subAdmins]
  )

  const columns = getColumns(businessName)

  return (
    <div className="flex flex-col h-full">
      <Header title="Admins" />
      <div className="flex-1 overflow-auto p-6">
        <EntityListPage
          title="Admins & Sub-Admins"
          description="Every business admin and branch sub-admin on the platform"
          columns={columns}
          data={rows}
          isLoading={adminsLoading || subAdminsLoading}
          isError={isError}
          onRetry={refetch}
          emptyMessage="No admins or sub-admins yet."
          actions={
            <>
              <Button size="sm" variant="outline" onClick={() => setCreateSubAdminOpen(true)}>
                <UserCog className="mr-1.5 h-4 w-4" /> Add Sub-Admin
              </Button>
              <Button size="sm" onClick={() => setCreateAdminOpen(true)}>
                <ShieldCheck className="mr-1.5 h-4 w-4" /> Add Admin
              </Button>
            </>
          }
        />
      </div>

      <CreateBusinessAdminDialog
        open={createAdminOpen}
        businessOptions={businesses}
        onClose={() => setCreateAdminOpen(false)}
      />
      <CreateScopedUserDialog
        open={createSubAdminOpen}
        onClose={() => setCreateSubAdminOpen(false)}
        roleId={subAdminRole?.id}
        roleLabel="Sub-Admin"
        businessOptions={businesses}
        branchRequired
      />
    </div>
  )
}
