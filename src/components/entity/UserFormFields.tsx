import type { UseFormRegister, FieldErrors, FieldValues, Path } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export interface UserFormValues {
  firstName: string
  lastName?: string
  email: string
  password: string
  mobile?: string
}

interface UserFormFieldsProps<T extends FieldValues> {
  register: UseFormRegister<T>
  errors: FieldErrors<T>
  /** Hide the password field when editing an existing user. */
  showPassword?: boolean
}

/**
 * Shared firstName/lastName/email/password/mobile fields, factored out of
 * the near-duplicated create-dialog forms across the app. Used by both
 * `CreateBusinessAdminDialog` and `CreateScopedUserDialog`.
 */
export function UserFormFields<T extends FieldValues>({
  register,
  errors,
  showPassword = true,
}: UserFormFieldsProps<T>) {
  const err = (name: keyof UserFormValues) => errors[name as Path<T>]?.message as string | undefined

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>First Name</Label>
          <Input placeholder="Jane" {...register('firstName' as Path<T>)} />
          <FieldError msg={err('firstName')} />
        </div>
        <div className="space-y-1.5">
          <Label>Last Name</Label>
          <Input placeholder="Doe" {...register('lastName' as Path<T>)} />
          <FieldError msg={err('lastName')} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Email</Label>
        <Input type="email" placeholder="jane@business.com" {...register('email' as Path<T>)} />
        <FieldError msg={err('email')} />
      </div>
      {showPassword && (
        <div className="space-y-1.5">
          <Label>Password</Label>
          <Input type="password" placeholder="Min 8 characters" {...register('password' as Path<T>)} />
          <FieldError msg={err('password')} />
        </div>
      )}
      <div className="space-y-1.5">
        <Label>Mobile</Label>
        <Input placeholder="9876543210" {...register('mobile' as Path<T>)} />
        <FieldError msg={err('mobile')} />
      </div>
    </div>
  )
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return <p className="text-xs text-red-600">{msg}</p>
}
