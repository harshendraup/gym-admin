import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { UserFormFields } from './UserFormFields'
import { useUpdateUser } from '@/hooks/useUsers'
import type { ManagedUser } from '@/api/user-management.api'

const schema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().optional(),
  email: z.string().email('Valid email required'),
  mobile: z.string().optional(),
})
type FormValues = z.infer<typeof schema>

interface EditUserDialogProps {
  open: boolean
  onClose: () => void
  user: ManagedUser | null
  roleLabel: string
}

/**
 * Shared edit dialog for any `/users` row (member, trainer, sub-admin, ...).
 * No password field — resetting a password is a separate concern from
 * editing profile fields.
 */
export function EditUserDialog({ open, onClose, user, roleLabel }: EditUserDialogProps) {
  const update = useUpdateUser(user?.id ?? '')
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (open && user) {
      reset({
        firstName: user.firstName,
        lastName: user.lastName ?? '',
        email: user.email ?? '',
        mobile: user.mobile ?? '',
      })
    }
  }, [open, user, reset])

  const onSubmit = (values: FormValues) => {
    update.mutate(
      {
        firstName: values.firstName,
        lastName: values.lastName || undefined,
        email: values.email,
        mobile: values.mobile || undefined,
      },
      { onSuccess: onClose }
    )
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit {roleLabel}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <UserFormFields<FormValues> register={register} errors={errors} showPassword={false} />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={update.isPending}>
              {update.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
