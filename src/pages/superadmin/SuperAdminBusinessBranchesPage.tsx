import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { ColumnDef } from '@tanstack/react-table'
import { Plus, MapPin } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { EntityListPage } from '@/components/entity/EntityListPage'
import { useBranches, useCreateBranch } from '@/hooks/useBranches'
import { businessRegistryApi } from '@/api/business-registry.api'
import type { BranchRecord } from '@/api/branches.api'

const schema = z.object({
  branchName: z.string().min(2, 'Branch name is required'),
  email: z.string().email('Valid email required').optional().or(z.literal('')),
  mobileNumber: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
})
type FormValues = z.infer<typeof schema>

function CreateBranchDialog({
  open,
  businessId,
  onClose,
}: {
  open: boolean
  businessId: number
  onClose: () => void
}) {
  const create = useCreateBranch()
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (open) reset({ branchName: '', email: '', mobileNumber: '', address: '', city: '' })
  }, [open, reset])

  const onSubmit = (values: FormValues) => {
    create.mutate(
      {
        businessId,
        branchName: values.branchName,
        email: values.email || undefined,
        mobileNumber: values.mobileNumber || undefined,
        address: values.address || undefined,
        city: values.city || undefined,
      },
      { onSuccess: onClose }
    )
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Branch</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Branch Name</Label>
            <Input placeholder="Downtown Branch" {...register('branchName')} />
            {errors.branchName && <p className="text-xs text-red-600">{errors.branchName.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input type="email" placeholder="branch@business.com" {...register('email')} />
            {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Mobile Number</Label>
            <Input placeholder="9876543210" {...register('mobileNumber')} />
          </div>
          <div className="space-y-1.5">
            <Label>Address</Label>
            <Input placeholder="Street, area" {...register('address')} />
          </div>
          <div className="space-y-1.5">
            <Label>City</Label>
            <Input placeholder="Mumbai" {...register('city')} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? 'Creating...' : 'Create Branch'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function getColumns(onView: (b: BranchRecord) => void): ColumnDef<BranchRecord>[] {
  return [
    {
      header: 'Branch',
      cell: ({ row }) => (
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <MapPin className="h-4 w-4 text-primary" />
          </div>
          <span className="font-medium text-slate-900">{row.original.branchName}</span>
        </div>
      ),
    },
    { header: 'City', cell: ({ row }) => row.original.city || '—' },
    { header: 'Email', cell: ({ row }) => row.original.email || '—' },
    { header: 'Status', cell: ({ row }) => row.original.status || '—' },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Button size="sm" variant="outline" onClick={() => onView(row.original)}>
            View Members
          </Button>
        </div>
      ),
    },
  ]
}

export default function SuperAdminBusinessBranchesPage() {
  const { businessId } = useParams<{ businessId: string }>()
  const navigate = useNavigate()
  const [createOpen, setCreateOpen] = useState(false)

  const { data: business } = useQuery({
    queryKey: ['businesses', 'detail', businessId],
    queryFn: () => businessRegistryApi.get(Number(businessId)),
    enabled: !!businessId,
  })

  const { data: branches, isLoading, isError, refetch } = useBranches(businessId)
  const columns = getColumns((b) => navigate(`/superadmin/branches/${b.id}/members`))

  return (
    <div className="flex flex-col h-full">
      <Header title={business ? `${business.businessName} — Branches` : 'Branches'} />
      <div className="flex-1 overflow-auto p-6">
        <EntityListPage
          title="Branches"
          description={business ? `Branches under ${business.businessName}` : undefined}
          columns={columns}
          data={branches}
          isLoading={isLoading}
          isError={isError}
          onRetry={refetch}
          emptyMessage="No branches yet. Add the first one."
          actions={
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="mr-1.5 h-4 w-4" /> Add Branch
            </Button>
          }
        />
      </div>

      {businessId && (
        <CreateBranchDialog
          open={createOpen}
          businessId={Number(businessId)}
          onClose={() => setCreateOpen(false)}
        />
      )}
    </div>
  )
}
