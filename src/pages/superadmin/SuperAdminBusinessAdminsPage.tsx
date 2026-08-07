import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { Plus } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { EntityListPage } from '@/components/entity/EntityListPage'
import { CreateBusinessAdminDialog } from '@/components/entity/CreateBusinessAdminDialog'
import { CreateScopedUserDialog } from '@/components/entity/CreateScopedUserDialog'
import { useBusinessAdmins } from '@/hooks/useBusinessAdmins'
import { useUsersByRole } from '@/hooks/useUsers'
import { useRoles } from '@/hooks/useRoles'
import { useBranches } from '@/hooks/useBranches'
import { businessRegistryApi } from '@/api/business-registry.api'
import type { ManagedUser } from '@/api/user-management.api'

function getColumns(): ColumnDef<ManagedUser>[] {
  return [
    {
      header: 'Name',
      cell: ({ row }) => (
        <span className="font-medium text-slate-900">{row.original.fullName ?? row.original.firstName}</span>
      ),
    },
    { header: 'Email', cell: ({ row }) => row.original.email ?? '—' },
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

function byBusiness<T extends { businessId: number | null }>(rows: T[], businessId?: string) {
  return businessId ? rows.filter((u) => String(u.businessId) === businessId) : rows
}

export default function SuperAdminBusinessAdminsPage() {
  const { businessId } = useParams<{ businessId: string }>()
  const id = businessId ? Number(businessId) : undefined
  const [createAdminOpen, setCreateAdminOpen] = useState(false)
  const [createSubAdminOpen, setCreateSubAdminOpen] = useState(false)
  const [createTrainerOpen, setCreateTrainerOpen] = useState(false)

  const { data: business } = useQuery({
    queryKey: ['businesses', 'detail', businessId],
    queryFn: () => businessRegistryApi.get(id!),
    enabled: !!id,
  })

  const { subAdminRole, trainerRole } = useRoles()
  const { data: admins = [], isLoading: adminsLoading, isError: adminsError, refetch: refetchAdmins } =
    useBusinessAdmins(id)
  const allSubAdmins = useUsersByRole(subAdminRole?.id)
  const allTrainers = useUsersByRole(trainerRole?.id)
  const { data: branches = [] } = useBranches(businessId)

  const subAdmins = useMemo(() => byBusiness(allSubAdmins.data ?? [], businessId), [allSubAdmins.data, businessId])
  const trainers = useMemo(() => byBusiness(allTrainers.data ?? [], businessId), [allTrainers.data, businessId])

  const columns = getColumns()

  return (
    <div className="flex flex-col h-full">
      <Header title={business ? `${business.businessName} — Admins` : 'Admins'} />
      <div className="flex-1 overflow-auto p-6">
        <Tabs defaultValue="admins">
          <TabsList>
            <TabsTrigger value="admins">Admins</TabsTrigger>
            <TabsTrigger value="sub-admins">Sub-Admins</TabsTrigger>
            <TabsTrigger value="trainers">Trainers</TabsTrigger>
          </TabsList>

          <TabsContent value="admins">
            <EntityListPage
              title="Admins"
              description={business ? `Admins managing ${business.businessName}` : undefined}
              columns={columns}
              data={admins}
              isLoading={adminsLoading}
              isError={adminsError}
              onRetry={refetchAdmins}
              emptyMessage="No admins yet."
              actions={
                <Button size="sm" onClick={() => setCreateAdminOpen(true)}>
                  <Plus className="mr-1.5 h-4 w-4" /> Add Admin
                </Button>
              }
            />
          </TabsContent>

          <TabsContent value="sub-admins">
            <EntityListPage
              title="Sub-Admins"
              description={business ? `Branch managers within ${business.businessName}` : undefined}
              columns={columns}
              data={subAdmins}
              isLoading={allSubAdmins.isLoading}
              isError={allSubAdmins.isError}
              onRetry={allSubAdmins.refetch}
              emptyMessage="No sub-admins yet."
              actions={
                <Button size="sm" onClick={() => setCreateSubAdminOpen(true)}>
                  <Plus className="mr-1.5 h-4 w-4" /> Add Sub-Admin
                </Button>
              }
            />
          </TabsContent>

          <TabsContent value="trainers">
            <EntityListPage
              title="Trainers"
              description={business ? `Branch trainers within ${business.businessName}` : undefined}
              columns={columns}
              data={trainers}
              isLoading={allTrainers.isLoading}
              isError={allTrainers.isError}
              onRetry={allTrainers.refetch}
              emptyMessage="No trainers yet."
              actions={
                <Button size="sm" onClick={() => setCreateTrainerOpen(true)}>
                  <Plus className="mr-1.5 h-4 w-4" /> Add Trainer
                </Button>
              }
            />
          </TabsContent>
        </Tabs>
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
      <CreateScopedUserDialog
        open={createTrainerOpen}
        onClose={() => setCreateTrainerOpen(false)}
        roleId={trainerRole?.id}
        roleLabel="Trainer"
        businessId={id}
        branchRequired
      />
    </div>
  )
}
