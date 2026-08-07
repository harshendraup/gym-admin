import { useState } from 'react'
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
import { useRoles } from '@/hooks/useRoles'
import { useUsersByRole } from '@/hooks/useUsers'
import { businessRegistryApi } from '@/api/business-registry.api'
import type { ManagedUser } from '@/api/user-management.api'

function getColumns(businessName: (id: number | null) => string): ColumnDef<ManagedUser>[] {
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
  ]
}

/**
 * Platform-wide view of every admin/sub-admin/trainer, one tab each —
 * replacing the old merged single-table view. Admin creation goes through
 * CreateBusinessAdminDialog (POST /businesses/:id/admins); sub-admin and
 * trainer creation both go through the shared CreateScopedUserDialog
 * (POST /users), which now works for either role.
 */
export default function SuperAdminAdminsPage() {
  const [createAdminOpen, setCreateAdminOpen] = useState(false)
  const [createSubAdminOpen, setCreateSubAdminOpen] = useState(false)
  const [createTrainerOpen, setCreateTrainerOpen] = useState(false)

  const { data: businesses = [] } = useQuery({
    queryKey: ['businesses'],
    queryFn: () => businessRegistryApi.list(),
  })
  const businessName = (id: number | null) => businesses.find((b) => b.id === id)?.businessName ?? '—'

  const { adminRole, subAdminRole, trainerRole } = useRoles()
  const admins = useUsersByRole(adminRole?.id)
  const subAdmins = useUsersByRole(subAdminRole?.id)
  const trainers = useUsersByRole(trainerRole?.id)

  const columns = getColumns(businessName)

  return (
    <div className="flex flex-col h-full">
      <Header title="Team" />
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
          </TabsContent>

          <TabsContent value="sub-admins">
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
                <Button size="sm" onClick={() => setCreateSubAdminOpen(true)}>
                  <Plus className="mr-1.5 h-4 w-4" /> Add Sub-Admin
                </Button>
              }
            />
          </TabsContent>

          <TabsContent value="trainers">
            <EntityListPage
              title="Trainers"
              description="Branch trainers across the platform"
              columns={columns}
              data={trainers.data}
              isLoading={trainers.isLoading}
              isError={trainers.isError}
              onRetry={trainers.refetch}
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
      <CreateScopedUserDialog
        open={createTrainerOpen}
        onClose={() => setCreateTrainerOpen(false)}
        roleId={trainerRole?.id}
        roleLabel="Trainer"
        businessOptions={businesses}
        branchRequired
      />
    </div>
  )
}
