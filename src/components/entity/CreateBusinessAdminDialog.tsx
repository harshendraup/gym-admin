import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@/components/ui/select'
import { UserFormFields } from './UserFormFields'
import { useCreateBusinessAdmin } from '@/hooks/useBusinessAdmins'
import { useBranches } from '@/hooks/useBranches'
import type { BusinessRecord } from '@/api/business-registry.api'
import type { BranchRecord } from '@/api/branches.api'

const schema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().optional(),
  email: z.string().email('Valid email required'),
  password: z.string().min(8, 'Min 8 characters'),
  mobile: z.string().optional(),
})
type FormValues = z.infer<typeof schema>

interface CreateBusinessAdminDialogProps {
  open: boolean
  /** Locked to this business when given. */
  business?: BusinessRecord | null
  /** Business picker source when `business` is absent. */
  businessOptions?: BusinessRecord[]
  /** Branch picker source when `business` is locked (ignored otherwise — branches are fetched internally once a business is picked). */
  branchOptions?: BranchRecord[]
  onClose: () => void
}

/**
 * Superadmin-only: provisions a business-scoped `admin` account via
 * `POST /businesses/:id/admins`. `businessKey` is read from the already
 * -fetched business record — the superadmin never types it in.
 */
export function CreateBusinessAdminDialog({
  open,
  business,
  businessOptions,
  branchOptions,
  onClose,
}: CreateBusinessAdminDialogProps) {
  const [pickedBusinessId, setPickedBusinessId] = useState('')
  const [pickedBranchId, setPickedBranchId] = useState('')

  const effectiveBusiness = business ?? businessOptions?.find((b) => String(b.id) === pickedBusinessId) ?? null

  const { data: cascadedBranches } = useBranches(
    !business && effectiveBusiness ? String(effectiveBusiness.id) : undefined
  )
  const branches = business ? branchOptions : cascadedBranches

  const create = useCreateBusinessAdmin(effectiveBusiness?.id)
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (open) {
      reset({ firstName: '', lastName: '', email: '', password: '', mobile: '' })
      setPickedBusinessId('')
      setPickedBranchId('')
    }
  }, [open, reset])

  const onSubmit = (values: FormValues) => {
    if (!effectiveBusiness) return
    create.mutate(
      {
        businessKey: effectiveBusiness.businessKey,
        branchId: pickedBranchId ? Number(pickedBranchId) : undefined,
        firstName: values.firstName,
        lastName: values.lastName || undefined,
        email: values.email,
        password: values.password,
        mobile: values.mobile || undefined,
      },
      { onSuccess: onClose }
    )
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Admin</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {business === undefined || business === null ? (
            businessOptions && (
              <div className="space-y-1.5">
                <Label>Business</Label>
                <Select
                  value={pickedBusinessId}
                  onValueChange={(v) => { setPickedBusinessId(v); setPickedBranchId('') }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a business..." />
                  </SelectTrigger>
                  <SelectContent>
                    {businessOptions.map((b) => (
                      <SelectItem key={b.id} value={String(b.id)}>{b.businessName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )
          ) : null}

          <UserFormFields<FormValues> register={register} errors={errors} />

          {branches && branches.length > 0 && (
            <div className="space-y-1.5">
              <Label>Branch (optional)</Label>
              <Select value={pickedBranchId} onValueChange={setPickedBranchId}>
                <SelectTrigger>
                  <SelectValue placeholder="Scope to a specific branch..." />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((b) => (
                    <SelectItem key={b.id} value={String(b.id)}>{b.branchName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={create.isPending || !effectiveBusiness}>
              {create.isPending ? 'Creating...' : 'Create Admin'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
