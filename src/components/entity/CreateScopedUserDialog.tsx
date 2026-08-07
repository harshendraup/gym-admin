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
import { useCreateUser } from '@/hooks/useUsers'
import { useBranches } from '@/hooks/useBranches'
import type { BusinessRecord } from '@/api/business-registry.api'

const schema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().optional(),
  email: z.string().email('Valid email required'),
  password: z.string().min(8, 'Min 8 characters'),
  mobile: z.string().optional(),
})
type FormValues = z.infer<typeof schema>

interface CreateScopedUserDialogProps {
  open: boolean
  onClose: () => void
  roleId: number | undefined
  roleLabel: string
  /** Locked to this business when given (admin/sub-admin creating). */
  businessId?: number
  /** Business picker source when `businessId` is absent (superadmin creating). */
  businessOptions?: BusinessRecord[]
  /** Locked to this branch when given (sub-admin creating). */
  branchId?: number
  /** Mirrors the backend's E_BRANCH_REQUIRED rule for sub-admin creation. */
  branchRequired?: boolean
}

/**
 * The one shared dialog for every sub-admin/member creation entry point:
 * superadmin creating a sub-admin, admin creating a sub-admin or member,
 * sub-admin creating a member. businessId/branchId are hidden and locked
 * whenever already known from context; pickers render only when absent.
 */
export function CreateScopedUserDialog({
  open,
  onClose,
  roleId,
  roleLabel,
  businessId,
  businessOptions,
  branchId,
  branchRequired,
}: CreateScopedUserDialogProps) {
  const [pickedBusinessId, setPickedBusinessId] = useState<string>('')
  const [pickedBranchId, setPickedBranchId] = useState<string>('')

  const effectiveBusinessId = businessId ?? (pickedBusinessId ? Number(pickedBusinessId) : undefined)
  const effectiveBranchId = branchId ?? (pickedBranchId ? Number(pickedBranchId) : undefined)

  const { data: branches } = useBranches(
    effectiveBusinessId ? String(effectiveBusinessId) : undefined
  )

  const create = useCreateUser()
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

  const needsBranchPicker = branchId === undefined
  const missingRequiredBranch = branchRequired && !effectiveBranchId

  const onSubmit = (values: FormValues) => {
    if (missingRequiredBranch) return
    create.mutate(
      {
        firstName: values.firstName,
        lastName: values.lastName || undefined,
        email: values.email,
        password: values.password,
        mobile: values.mobile || undefined,
        businessId: effectiveBusinessId,
        branchId: effectiveBranchId,
        roleId,
        status: 'Active',
      },
      { onSuccess: onClose }
    )
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create {roleLabel}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <UserFormFields<FormValues> register={register} errors={errors} />

          {businessId === undefined && businessOptions && (
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
          )}

          {needsBranchPicker && (
            <div className="space-y-1.5">
              <Label>
                Branch{branchRequired && <span className="ml-0.5 text-red-600">*</span>}
              </Label>
              <Select
                value={pickedBranchId}
                onValueChange={setPickedBranchId}
                disabled={!effectiveBusinessId}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={effectiveBusinessId ? 'Select a branch...' : 'Choose a business first'}
                  />
                </SelectTrigger>
                <SelectContent>
                  {(branches ?? []).map((b) => (
                    <SelectItem key={b.id} value={String(b.id)}>{b.branchName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {missingRequiredBranch && (
                <p className="text-xs text-red-600">A branch is required for {roleLabel.toLowerCase()}s.</p>
              )}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? 'Creating...' : `Create ${roleLabel}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
