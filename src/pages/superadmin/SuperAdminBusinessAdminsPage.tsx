import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { ShieldCheck, UserCog } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EntityListPage } from '@/components/entity/EntityListPage'
import { CreateBusinessAdminDialog } from '@/components/entity/CreateBusinessAdminDialog'
import { CreateScopedUserDialog } from '@/components/entity/CreateScopedUserDialog'
import { useBusinessAdmins } from '@/hooks/useBusinessAdmins'
import { useUsersByRole } from '@/hooks/useUsers'
import { useRoles } from '@/hooks/useRoles'
import { useBranches } from '@/hooks/useBranches'
import { businessRegistryApi } from '@/api/business-registry.api'
import type { ManagedUser } from '@/api/user-management.api'

type Row = ManagedUser & { kind: 'Admin' | 'Sub-Admin' }

function getColumns(): ColumnDef<Row>[] {
  return [
    {
      header: 'Name',
      cell: ({ row }) => (
        <span className="font-medium text-slate-900">{row.original.fullName ?? row.original.firstName}</span>
      ),
    },
    { header: 'Email', cell: ({ row }) => row.original.email ?? '—' },
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

export default function SuperAdminBusinessAdminsPage() {
  const { businessId } = useParams<{ businessId: string }>()
  const id = businessId ? Number(businessId) : undefined
  const [createAdminOpen, setCreateAdminOpen] = useState(false)
  const [createSubAdminOpen, setCreateSubAdminOpen] = useState(false)

  const { data: business } = useQuery({
    queryKey: ['businesses', 'detail', businessId],
    queryFn: () => businessRegistryApi.get(id!),
    enabled: !!id,
  })

  const { subAdminRole } = useRoles()
  const { data: admins = [], isLoading: adminsLoading, isError, refetch } = useBusinessAdmins(id)
  const { data: allSubAdmins = [], isLoading: subAdminsLoading } = useUsersByRole(subAdminRole?.id)
  const { data: branches = [] } = useBranches(businessId)

  const subAdmins = useMemo(
    () => allSubAdmins.filter((u) => String(u.businessId) === businessId),
    [allSubAdmins, businessId]
  )

  const rows: Row[] = [
    ...admins.map((u) => ({ ...u, kind: 'Admin' as const })),
    ...subAdmins.map((u) => ({ ...u, kind: 'Sub-Admin' as const })),
  ]

  const columns = getColumns()

  return (
    <div className="flex flex-col h-full">
      <Header title={business ? `${business.businessName} — Admins` : 'Admins'} />
      <div className="flex-1 overflow-auto p-6">
        <EntityListPage
          title="Admins & Sub-Admins"
          description={business ? `Team managing ${business.businessName}` : undefined}
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
        business={business ?? null}
        branchOptions={branches}
        onClose={() => setCreateAdminOpen(false)}
      />
      <CreateScopedUserDialog
        open={createSubAdminOpen}
        onClose={() => setCreateSubAdminOpen(false)}
        roleId={subAdminRole?.id}
        roleLabel="Sub-Admin"
        businessId={id}
        branchRequired
      />
    </div>
  )
}
