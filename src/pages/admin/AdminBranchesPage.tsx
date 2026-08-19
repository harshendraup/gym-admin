import { useEffect, useState } from 'react'
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
import { useAuthStore } from '@/store/auth.store'
import type { BranchRecord } from '@/api/branches.api'

const schema = z.object({
  branchName: z.string().min(2, 'Branch name is required'),
  email: z.string().email('Valid email required').optional().or(z.literal('')),
  mobileNumber: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
})
type FormValues = z.infer<typeof schema>

function CreateBranchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const create = useCreateBranch()
  const gymContext = useAuthStore((s) => s.gymContext)
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (open) reset({ branchName: '', email: '', mobileNumber: '', address: '', city: '' })
  }, [open, reset])

  const onSubmit = (values: FormValues) => {
    const businessId = gymContext?.businessId ? Number(gymContext.businessId) : undefined
    if (!businessId) return
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

function getColumns(): ColumnDef<BranchRecord>[] {
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
    { header: 'Mobile', cell: ({ row }) => row.original.mobileNumber || '—' },
    { header: 'Status', cell: ({ row }) => row.original.status || '—' },
  ]
}

export default function AdminBranchesPage() {
  const gymContext = useAuthStore((s) => s.gymContext)
  const { data: branches, isLoading, isError, refetch } = useBranches(gymContext?.businessId)
  const [createOpen, setCreateOpen] = useState(false)
  const columns = getColumns()

  return (
    <div className="flex flex-col h-full">
      {/* <Header title="Branches" /> */}
      <div className="flex-1 overflow-auto p-6">
        <EntityListPage
          title="Branches"
          description="Branches under your business"
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

      <CreateBranchDialog open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  )
}
